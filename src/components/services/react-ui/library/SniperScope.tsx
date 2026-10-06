"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAnimationFrame, useElementSize, useInView, useReducedMotion } from "./_shared/hooks";

/* Full-screen scope overlay: lens mask, fine reticle, glint, chromatic edge, breathing sway (hold Shift) and a range finder. */

export type ScopeReticle = "mil-dot" | "duplex" | "chevron";

export type SniperScopeProps = {
  /** Reticle pattern. */
  reticle?: ScopeReticle;
  /** Magnification (also shown in the readout). */
  zoom?: number;
  /** Reticle line color. */
  reticleColor?: string;
  /** Illuminated center color. */
  illumination?: string;
  /** Light up the center of the reticle. */
  illuminated?: boolean;
  /** Breathing sway strength (0 = rock steady). */
  sway?: number;
  /** Lens diameter as a fraction of the shorter side. */
  lensSize?: number;
  /** Chromatic fringe strength at the lens edge (0-1). */
  aberration?: number;
  /** Soft lens glint. */
  glint?: boolean;
  /** Show the range finder readout. */
  rangeFinder?: boolean;
  /** Show the "hold Shift" hint and breath meter. */
  showHints?: boolean;
  /** Your own scene to look at (defaults to a generated valley). It is scaled by `zoom` and panned with the mouse. */
  scene?: ReactNode;
  /** World size of a custom scene in px. */
  sceneSize?: { width: number; height: number };
  /** Called when the scope steadies (Shift held) or releases. */
  onSteadyChange?: (steady: boolean) => void;
  className?: string;
  style?: CSSProperties;
};

const FONT = '"Rajdhani", "Bahnschrift", "Barlow Semi Condensed", "Segoe UI", system-ui, sans-serif';
const WORLD = { width: 2400, height: 1300 };
const HORIZON = 600;

const CSS = `
.sf-sniper-scope { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; cursor: crosshair; user-select: none; -webkit-user-select: none; touch-action: none; }
.sf-sniper-scope:focus-visible { outline: 2px solid var(--sf-ss-glow); outline-offset: -4px; }
.sf-sniper-scope-world { position: absolute; left: 0; top: 0; will-change: transform; }
.sf-sniper-scope-world > div { transform-origin: 0 0; }
.sf-sniper-scope-hud { position: absolute; font: 600 11px/1 ${FONT}; letter-spacing: .2em; text-transform: uppercase; color: rgba(225,232,228,.55); pointer-events: none; white-space: nowrap; }
.sf-sniper-scope-hud b { display: block; margin-top: 6px; font: 600 26px/1 ${FONT}; letter-spacing: .02em; color: #eef2ef; font-variant-numeric: tabular-nums; }
.sf-sniper-scope-btn { appearance: none; pointer-events: auto; cursor: pointer; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 6px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); color: #e6ece8; font: 600 16px/1 ${FONT}; transition: background .2s, border-color .2s; }
.sf-sniper-scope-btn:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.3); }
.sf-sniper-scope-btn:focus-visible { outline: 2px solid var(--sf-ss-glow); outline-offset: 2px; }
.sf-sniper-scope-key { display: inline-block; padding: 3px 6px 2px; margin-right: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,.25); color: #eef2ef; letter-spacing: .08em; }
`;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridge(seed: number, base: number, amp: number, freq = 1, steps = 120): string {
  const r = rng(seed);
  const p = [r() * 7, r() * 7, r() * 7, r() * 7];
  let d = `M0 ${WORLD.height}`;
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const y = base - amp * (0.5 + 0.32 * Math.sin(u * 4.1 * freq + p[0]) + 0.18 * Math.sin(u * 11.3 * freq + p[1]) + 0.08 * Math.sin(u * 29 * freq + p[2]) + 0.04 * Math.sin(u * 71 * freq + p[3]));
    d += ` L${(u * WORLD.width).toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${WORLD.width} ${WORLD.height} Z`;
}

/** A row of conifers as one path. */
function trees(seed: number, x0: number, x1: number, y: number, minH: number, maxH: number, spacing: number, jitterY = 6): string {
  const r = rng(seed);
  let d = "";
  for (let x = x0; x < x1; x += spacing * (0.55 + r() * 0.8)) {
    const h = minH + r() * (maxH - minH);
    const w = h * (0.32 + r() * 0.12);
    const by = y + (r() - 0.5) * jitterY;
    d += `M${(x - w / 2).toFixed(1)} ${by.toFixed(1)} L${x.toFixed(1)} ${(by - h).toFixed(1)} L${(x + w / 2).toFixed(1)} ${by.toFixed(1)} Z`;
  }
  return d;
}

/** Things with a known distance for the range finder (world rects). */
const RANGED = [
  { x: 1165, y: 694, w: 30, h: 36, d: 612 },
  { x: 1384, y: 720, w: 20, h: 30, d: 488 },
  { x: 1220, y: 640, w: 90, h: 60, d: 742 },
  { x: 950, y: 660, w: 90, h: 60, d: 689 },
  { x: 1540, y: 560, w: 50, h: 110, d: 803 },
];

function groundRange(y: number): number | null {
  if (y < HORIZON + 6) return null;
  return 62000 / (y - HORIZON + 40);
}

function ValleyScene() {
  const paths = useMemo(
    () => ({
      far: ridge(3, 575, 190, 0.8),
      mid: ridge(8, 600, 110, 1.3),
      forestFar: trees(21, 0, WORLD.width, 626, 10, 22, 6, 4),
      forestMidL: trees(33, 0, 820, 760, 26, 58, 11, 18),
      forestMidR: trees(34, 1720, WORLD.width, 745, 26, 60, 11, 18),
      forestNear: trees(47, -40, 700, 1050, 90, 170, 22, 40) + trees(48, 1850, WORLD.width + 40, 1030, 90, 180, 22, 40),
      furrows: (() => {
        let d = "";
        for (let y = 628; y < 1200; y += 2 + (y - 600) * 0.045) {
          d += `M0 ${y.toFixed(1)} C700 ${(y - 6).toFixed(1)} 1500 ${(y + 7).toFixed(1)} ${WORLD.width} ${(y - 3).toFixed(1)}`;
        }
        return d;
      })(),
      bushes: (() => {
        const r = rng(91);
        const out: { x: number; y: number; rx: number; ry: number; c: string }[] = [];
        for (let i = 0; i < 70; i += 1) {
          const y = 640 + Math.pow(r(), 1.4) * 420;
          const scale = 0.4 + (y - 620) / 180;
          out.push({ x: r() * WORLD.width, y, rx: (3 + r() * 6) * scale, ry: (2 + r() * 3) * scale, c: r() > 0.5 ? "#43532b" : "#4f5f31" });
        }
        return out;
      })(),
      bales: (() => {
        const r = rng(57);
        return Array.from({ length: 16 }, () => ({ x: 700 + r() * 1100, y: 700 + r() * 60, s: 0.8 + r() * 0.5 }));
      })(),
      grass: (() => {
        const r = rng(71);
        let d = "";
        for (let x = 0; x < WORLD.width; x += 5 + r() * 6) {
          const h = 16 + r() * 40;
          const lean = (r() - 0.5) * 14;
          d += `M${x.toFixed(1)} ${WORLD.height} Q${(x + lean * 0.4).toFixed(1)} ${(WORLD.height - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(WORLD.height - h).toFixed(1)}`;
        }
        return d;
      })(),
    }),
    [],
  );
  const bands = [
    { y: 620, c: "#8f8f62" },
    { y: 650, c: "#7c8752" },
    { y: 690, c: "#a0955f" },
    { y: 740, c: "#6d7c47" },
    { y: 810, c: "#8c8a55" },
    { y: 900, c: "#5f6f3c" },
    { y: 1010, c: "#707a42" },
    { y: 1140, c: "#4b5a2f" },
  ];
  return (
    <svg width={WORLD.width} height={WORLD.height} viewBox={`0 0 ${WORLD.width} ${WORLD.height}`} aria-hidden style={{ display: "block" }}>
      <defs>
        <linearGradient id="sf-sniper-scope-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7f9db3" />
          <stop offset="0.3" stopColor="#b3c3cb" />
          <stop offset="0.44" stopColor="#e5d9c0" />
          <stop offset="0.48" stopColor="#efd4a5" />
        </linearGradient>
        <radialGradient id="sf-sniper-scope-sun" cx="1660" cy="330" r="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff4d8" stopOpacity="0.9" />
          <stop offset="0.12" stopColor="#ffe3ad" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffe3ad" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sf-sniper-scope-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9dcc0" stopOpacity="0" />
          <stop offset="0.5" stopColor="#e9dcc0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e9dcc0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sf-sniper-scope-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4a26" stopOpacity="0" />
          <stop offset="1" stopColor="#1d2612" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width={WORLD.width} height={WORLD.height} fill="url(#sf-sniper-scope-sky)" />
      <rect width={WORLD.width} height={WORLD.height} fill="url(#sf-sniper-scope-sun)" />
      <circle cx="1660" cy="330" r="24" fill="#fffaf0" />
      <g fill="#ffffff" opacity="0.35">
        <ellipse cx="520" cy="260" rx="260" ry="14" />
        <ellipse cx="700" cy="236" rx="160" ry="10" />
        <ellipse cx="2040" cy="190" rx="220" ry="12" />
      </g>
      <path d={paths.far} fill="#a6b4bb" />
      <path d={paths.mid} fill="#8b9a95" />
      <rect y={HORIZON - 60} width={WORLD.width} height={120} fill="url(#sf-sniper-scope-haze)" />
      <path d={paths.forestFar} fill="#5d6d59" />
      {bands.map((band, i) => (
        <path
          key={i}
          d={`M0 ${band.y} C600 ${band.y - 10} 1200 ${band.y + 12} 1800 ${band.y - 6} S2400 ${band.y + 4} 2400 ${band.y} L2400 ${WORLD.height} L0 ${WORLD.height} Z`}
          fill={band.c}
        />
      ))}
      <path d={paths.furrows} fill="none" stroke="#2d3518" strokeOpacity="0.16" strokeWidth="1.2" />
      {paths.bushes.map((b, i) => (
        <ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} fill={b.c} />
      ))}
      {paths.bales.map((b, i) => (
        <g key={i}>
          <ellipse cx={b.x} cy={b.y + 2.6 * b.s} rx={3.6 * b.s} ry={0.8 * b.s} fill="#2f3320" opacity="0.5" />
          <circle cx={b.x} cy={b.y} r={2.6 * b.s} fill="#cdb46f" stroke="#8d7a45" strokeWidth={0.5} />
        </g>
      ))}
      {/* Utility poles */}
      <g stroke="#3b342b" strokeWidth="2">
        {[640, 820, 1000, 1440, 1660, 1880].map((x, i) => (
          <g key={x}>
            <line x1={x} y1={640 - i * 0} x2={x} y2={690} />
            <line x1={x - 7} y1={646} x2={x + 7} y2={646} />
          </g>
        ))}
      </g>
      <path d="M633 646 Q730 656 813 646 Q910 656 993 646 M1433 646 Q1550 656 1653 646 Q1770 656 1873 646" stroke="#3b342b" strokeWidth="0.8" fill="none" />
      <path d="M1236 690 C1230 760 1150 860 1120 980 S1060 1200 980 1300 L1260 1300 C1250 1160 1270 1000 1262 880 S1248 740 1244 690 Z" fill="#c2b28d" opacity="0.9" />
      <path d={paths.forestMidL} fill="#46573a" />
      <path d={paths.forestMidR} fill="#435436" />
      {/* Barn */}
      <g>
        <rect x="950" y="672" width="90" height="48" fill="#8a3326" />
        <polygon points="944,674 995,644 1046,674" fill="#5b2a22" />
        <rect x="982" y="690" width="24" height="30" fill="#2a1612" />
        <path d="M982 690 L1006 720 M1006 690 L982 720" stroke="#e6dccb" strokeWidth="2" />
      </g>
      {/* Farmhouse */}
      <g>
        <rect x="1224" y="668" width="84" height="40" fill="#c9b99a" />
        <polygon points="1216,670 1266,640 1316,670" fill="#6e4034" />
        <rect x="1238" y="680" width="10" height="10" fill="#2c2a26" />
        <rect x="1284" y="680" width="10" height="10" fill="#2c2a26" />
        <rect x="1260" y="686" width="12" height="22" fill="#3e2e22" />
        <rect x="1294" y="646" width="8" height="16" fill="#584038" />
      </g>
      {/* Watchtower */}
      <g stroke="#3a342c" strokeWidth="3">
        <path d="M1546 668 L1556 588 M1584 668 L1574 588 M1548 650 L1582 620 M1582 650 L1548 620" fill="none" />
      </g>
      <rect x="1544" y="566" width="42" height="24" fill="#4f463b" />
      <polygon points="1538,568 1565,552 1592,568" fill="#3a332c" />
      {/* Steel targets */}
      {[
        { x: 1180, y: 708, r: 9 },
        { x: 1394, y: 732, r: 7 },
      ].map((t, i) => (
        <g key={i}>
          <rect x={t.x - 1} y={t.y} width={2} height={t.r * 2.2} fill="#2b2824" />
          <circle cx={t.x} cy={t.y} r={t.r} fill="#e8e2d4" stroke="#4a4540" strokeWidth="1.5" />
          <circle cx={t.x} cy={t.y} r={t.r * 0.35} fill="#c0392b" />
        </g>
      ))}
      {/* Wind flag */}
      <line x1="1330" y1="662" x2="1330" y2="712" stroke="#2c2823" strokeWidth="2" />
      <polygon points="1331,663 1352,667 1331,672" fill="#e35d2f" />
      {/* Fence */}
      <g stroke="#5a4c3a" strokeWidth="2">
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1={1320 + i * 22} y1={770 + i * 1.5} x2={1320 + i * 22} y2={786 + i * 1.5} />
        ))}
        <line x1="1320" y1="774" x2="1782" y2="805" />
      </g>
      <rect y={900} width={WORLD.width} height={400} fill="url(#sf-sniper-scope-near)" />
      <path d={paths.forestNear} fill="#1f2a16" />
      <path d={paths.grass} stroke="#26331a" strokeWidth="2.2" fill="none" />
    </svg>
  );
}

/** The reticle, drawn in lens space (-R..R). */
function ScopeReticleSvg({ kind, R, color, glow, illuminated }: { kind: ScopeReticle; R: number; color: string; glow: string; illuminated: boolean }) {
  const thin = Math.max(1, R / 260);
  const thick = Math.max(3, R / 55);
  const lit = illuminated ? glow : color;
  const litFilter = illuminated ? `drop-shadow(0 0 ${Math.max(2, R / 90)}px ${glow})` : undefined;
  const posts = (from: number) => (
    <g stroke={color} strokeWidth={thick} strokeLinecap="butt">
      <line x1={-R} y1={0} x2={-from} y2={0} />
      <line x1={from} y1={0} x2={R} y2={0} />
      <line x1={0} y1={from} x2={0} y2={R} />
      <line x1={0} y1={-R} x2={0} y2={-from} />
    </g>
  );
  if (kind === "duplex") {
    return (
      <g>
        {posts(R * 0.3)}
        <g stroke={color} strokeWidth={thin}>
          <line x1={-R * 0.3} y1={0} x2={R * 0.3} y2={0} />
          <line x1={0} y1={-R * 0.3} x2={0} y2={R * 0.3} />
        </g>
        <circle r={Math.max(1.4, R / 150)} fill={lit} style={{ filter: litFilter }} />
      </g>
    );
  }
  if (kind === "chevron") {
    const a = R * 0.045;
    const ticks = [1, 2, 3, 4];
    return (
      <g>
        <g stroke={color} strokeWidth={thick}>
          <line x1={-R} y1={0} x2={-R * 0.62} y2={0} />
          <line x1={R * 0.62} y1={0} x2={R} y2={0} />
          <line x1={0} y1={R * 0.72} x2={0} y2={R} />
        </g>
        <g stroke={color} strokeWidth={thin}>
          <line x1={-R * 0.62} y1={0} x2={-R * 0.1} y2={0} />
          <line x1={R * 0.1} y1={0} x2={R * 0.62} y2={0} />
          <line x1={0} y1={a * 2.2} x2={0} y2={R * 0.72} />
          {[-5, -4, -3, -2, 2, 3, 4, 5].map(k => (
            <line key={k} x1={k * R * 0.1} y1={-R * 0.012} x2={k * R * 0.1} y2={R * 0.012} />
          ))}
          {ticks.map(k => (
            <line key={k} x1={-R * (0.13 - k * 0.018)} y1={k * R * 0.13} x2={R * (0.13 - k * 0.018)} y2={k * R * 0.13} />
          ))}
        </g>
        <g fill={color} fontFamily={FONT} fontSize={Math.max(9, R / 22)} fontWeight={600}>
          {ticks.map(k => (
            <text key={k} x={R * (0.14 - k * 0.018) + 4} y={k * R * 0.13 + 4}>
              {k * 2}
            </text>
          ))}
        </g>
        <polyline points={`${-a},${a} 0,0 ${a},${a}`} fill="none" stroke={lit} strokeWidth={Math.max(1.6, R / 150)} strokeLinejoin="miter" style={{ filter: litFilter }} />
      </g>
    );
  }
  // Mil-dot: thin crosshair, thick outer posts, oval dots every mil.
  const step = R * 0.1;
  const dots: [number, number][] = [];
  for (let k = 1; k <= 5; k += 1) dots.push([k, 0], [-k, 0], [0, k], [0, -k]);
  return (
    <g>
      {posts(R * 0.62)}
      <g stroke={color} strokeWidth={thin}>
        <line x1={-R * 0.62} y1={0} x2={R * 0.62} y2={0} />
        <line x1={0} y1={-R * 0.62} x2={0} y2={R * 0.62} />
      </g>
      <g fill={color}>
        {dots.map(([x, y], i) => (
          <ellipse key={i} cx={x * step} cy={y * step} rx={x ? Math.max(1.6, R / 150) : Math.max(2.4, R / 100)} ry={x ? Math.max(2.4, R / 100) : Math.max(1.6, R / 150)} />
        ))}
      </g>
      {illuminated ? <circle r={Math.max(1.8, R / 110)} fill={glow} style={{ filter: litFilter }} /> : null}
    </g>
  );
}

export function SniperScope({
  reticle = "mil-dot",
  zoom = 4,
  reticleColor = "#0b0c0c",
  illumination = "#ff3b2f",
  illuminated = true,
  sway = 1,
  lensSize = 0.9,
  aberration = 0.6,
  glint = true,
  rangeFinder = true,
  showHints = true,
  scene,
  sceneSize,
  onSteadyChange,
  className,
  style,
}: SniperScopeProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLSpanElement>(null);
  const zoomRef = useRef<HTMLElement>(null);
  const breathRef = useRef<HTMLSpanElement>(null);
  const breathLabelRef = useRef<HTMLSpanElement>(null);
  const { width, height } = useElementSize(rootRef);
  const inView = useInView(rootRef);
  const [localZoom, setLocalZoom] = useState<number | null>(null);
  const [zoomProp, setZoomProp] = useState(zoom);
  if (zoomProp !== zoom) {
    setZoomProp(zoom);
    setLocalZoom(null);
  }
  const targetZoom = Math.max(1, Math.min(24, localZoom ?? zoom));
  const world = sceneSize ?? WORLD;
  const R = Math.max(40, (Math.min(width, height) * Math.max(0.3, Math.min(1, lensSize))) / 2);
  const sim = useRef({ ax: world.width * 0.5, ay: HORIZON + 90, tx: world.width * 0.5, ty: HORIZON + 90, vx: 0, vy: 0, z: targetZoom, hovered: false, focused: false, shift: false, steady: false, exhausted: false, breath: 1, calmness: 1, lastInput: -10, time: 0, ox: 0, oy: 0 });
  const live = useRef({ sway, reduced, targetZoom, width, height, world, R, onSteadyChange, rangeFinder });
  live.current = { sway, reduced, targetZoom, width, height, world, R, onSteadyChange, rangeFinder };

  // Shift steadies the scope while the pointer is over it or it has focus.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const s = sim.current;
      if (event.key === "Shift" && (s.hovered || s.focused)) s.shift = true;
    };
    const up = (event: KeyboardEvent) => {
      if (event.key === "Shift") sim.current.shift = false;
    };
    const blur = () => {
      sim.current.shift = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useAnimationFrame((delta, elapsed) => {
    const s = sim.current;
    const o = live.current;
    if (!o.width || !o.height) return;
    s.time = elapsed;
    // Idle scan so the scope never looks frozen before the visitor takes over.
    if (!s.hovered && elapsed - s.lastInput > 3 && !o.reduced) {
      s.tx = o.world.width * 0.5 + Math.sin(elapsed * 0.16) * o.world.width * 0.12;
      s.ty = HORIZON + 95 + Math.sin(elapsed * 0.11) * 30;
    }
    // Heavy, damped aim.
    const prevX = s.ax;
    const prevY = s.ay;
    const follow = o.reduced ? 1 : 1 - Math.exp(-delta * 3.2);
    s.ax += (s.tx - s.ax) * follow;
    s.ay += (s.ty - s.ay) * follow;
    s.z += (o.targetZoom - s.z) * (o.reduced ? 1 : 1 - Math.exp(-delta * 6));
    const k = s.z * 0.34;
    s.vx = (s.ax - prevX) * k / Math.max(delta, 0.001);
    s.vy = (s.ay - prevY) * k / Math.max(delta, 0.001);
    // Breath: steady while Shift is held, until the lungs run out; then shakier until released.
    if (!s.shift) s.exhausted = false;
    const wantSteady = s.shift && !s.exhausted && s.breath > 0;
    if (wantSteady) {
      s.breath = Math.max(0, s.breath - delta / 5);
      if (s.breath <= 0) s.exhausted = true;
    } else s.breath = Math.min(1, s.breath + delta / (s.shift ? 9 : 3.2));
    const target = wantSteady ? 0.07 : s.exhausted ? 1.9 : 1;
    s.calmness += (target - s.calmness) * (1 - Math.exp(-delta * (wantSteady ? 5 : 2.5)));
    if (wantSteady !== s.steady) {
      s.steady = wantSteady;
      o.onSteadyChange?.(wantSteady);
    }
    // Lissajous sway in screen px, scaled with magnification.
    const amp = o.reduced ? 0 : o.sway * s.calmness * 7 * Math.sqrt(s.z / 4);
    const t = elapsed;
    const sx = amp * (Math.sin(t * 0.83) + 0.45 * Math.sin(t * 2.07 + 1.3) + 0.12 * Math.sin(t * 7.3));
    const sy = amp * (0.8 * Math.sin(t * 1.21 + 0.6) + 0.35 * Math.sin(t * 2.9 + 2.1) + 0.1 * Math.sin(t * 6.1)) + amp * 0.25 * Math.sin(t * 7.8) * Math.max(0, Math.sin(t * 1.3));
    const cx = o.width / 2;
    const cy = o.height / 2;
    if (worldRef.current) worldRef.current.style.transform = `translate3d(${(cx - s.ax * k + sx).toFixed(2)}px, ${(cy - s.ay * k + sy).toFixed(2)}px, 0)`;
    if (scaleRef.current) scaleRef.current.style.transform = `scale(${k.toFixed(4)})`;
    // Scope shadow: the eye drifts off-axis when the rifle moves.
    const ox = Math.max(-18, Math.min(18, -s.vx * 0.012 + sx * 0.25));
    const oy = Math.max(-18, Math.min(18, -s.vy * 0.012 + sy * 0.25));
    s.ox += (ox - s.ox) * (1 - Math.exp(-delta * 8));
    s.oy += (oy - s.oy) * (1 - Math.exp(-delta * 8));
    if (lensRef.current) lensRef.current.style.transform = `translate3d(${s.ox.toFixed(2)}px, ${s.oy.toFixed(2)}px, 0)`;
    if (glintRef.current) glintRef.current.style.transform = `translate3d(${(-s.ox * 1.6).toFixed(2)}px, ${(-s.oy * 1.6).toFixed(2)}px, 0)`;
    if (zoomRef.current) zoomRef.current.textContent = `${s.z.toFixed(1)}×`;
    if (breathRef.current) breathRef.current.style.transform = `scaleX(${s.breath.toFixed(3)})`;
    if (breathLabelRef.current) breathLabelRef.current.textContent = wantSteady ? "Steady" : s.exhausted ? "Out of breath" : "Hold";
    if (o.rangeFinder && rangeRef.current) {
      // World point under the reticle.
      const wx = s.ax - sx / k;
      const wy = s.ay - sy / k;
      const hit = scene ? null : RANGED.find(r => wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h);
      const meters = scene ? null : hit ? hit.d : groundRange(wy);
      const text = meters == null ? "----" : String(Math.round(meters)).padStart(4, "0");
      if (rangeRef.current.textContent !== text) rangeRef.current.textContent = text;
    }
  }, inView);

  const aimFromPointer = (clientX: number, clientY: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = sim.current;
    const w = live.current.world;
    const u = (clientX - rect.left) / rect.width - 0.5;
    const v = (clientY - rect.top) / rect.height - 0.5;
    s.tx = w.width * 0.5 + u * w.width * 0.62;
    s.ty = (scene ? w.height * 0.5 : HORIZON + 90) + v * w.height * 0.42;
    s.lastInput = s.time;
  };

  const stepZoom = (direction: number) => {
    const levels = [1.5, 2, 3, 4, 6, 8, 10, 12, 16];
    const current = localZoom ?? zoom;
    const next = direction > 0 ? (levels.find(level => level > current + 0.01) ?? current) : ([...levels].reverse().find(level => level < current - 0.01) ?? current);
    setLocalZoom(next);
  };

  const fringe = Math.max(0, Math.min(1, aberration));
  const lensBox = R * 2;
  return (
    <div
      ref={rootRef}
      className={`sf-sniper-scope${className ? ` ${className}` : ""}`}
      style={{ ...style, ["--sf-ss-glow" as string]: illumination }}
      tabIndex={0}
      role="application"
      aria-label={`Scope at ${targetZoom.toFixed(1)} times zoom. Move the mouse or use arrow keys to aim, hold Shift to steady, plus and minus to zoom.`}
      onPointerEnter={() => {
        sim.current.hovered = true;
      }}
      onPointerLeave={() => {
        sim.current.hovered = false;
        sim.current.shift = false;
      }}
      onPointerMove={event => aimFromPointer(event.clientX, event.clientY)}
      onFocus={() => {
        sim.current.focused = true;
      }}
      onBlur={() => {
        sim.current.focused = false;
      }}
      onKeyDown={event => {
        const s = sim.current;
        const nudge = 40;
        if (event.key === "+" || event.key === "=") stepZoom(1);
        else if (event.key === "-" || event.key === "_") stepZoom(-1);
        else if (event.key.startsWith("Arrow")) {
          event.preventDefault();
          if (event.key === "ArrowLeft") s.tx -= nudge;
          if (event.key === "ArrowRight") s.tx += nudge;
          if (event.key === "ArrowUp") s.ty -= nudge;
          if (event.key === "ArrowDown") s.ty += nudge;
          s.lastInput = s.time;
        }
      }}
    >
      <style>{CSS}</style>
      <div ref={worldRef} className="sf-sniper-scope-world" aria-hidden>
        <div ref={scaleRef}>{scene ?? <ValleyScene />}</div>
      </div>

      <div ref={lensRef} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Lens shading: darker, slightly warm edge falloff inside the glass. */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: lensBox,
            height: lensBox,
            marginLeft: -R,
            marginTop: -R,
            borderRadius: "50%",
            background: `radial-gradient(circle closest-side, transparent 55%, rgba(10,14,12,.2) 76%, rgba(0,0,0,.62) 94%, rgba(0,0,0,.9) 100%)`,
          }}
        />
        {/* Chromatic fringe */}
        {fringe > 0 ? (
          <svg width={lensBox + 40} height={lensBox + 40} viewBox={`${-R - 20} ${-R - 20} ${lensBox + 40} ${lensBox + 40}`} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -R - 20, marginTop: -R - 20, mixBlendMode: "screen", opacity: fringe * 0.35 }}>
            <defs>
              <filter id="sf-sniper-scope-fringe" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation={2.2} />
              </filter>
            </defs>
            <g filter="url(#sf-sniper-scope-fringe)" fill="none" strokeWidth={3}>
              <circle cx={-1.8} cy={-1.2} r={R - 5} stroke="#ff2a3c" strokeOpacity={0.75} />
              <circle cx={1.8} cy={1.2} r={R - 5} stroke="#2aa8ff" strokeOpacity={0.75} />
            </g>
          </svg>
        ) : null}
        {/* Reticle */}
        <svg width={lensBox} height={lensBox} viewBox={`${-R} ${-R} ${lensBox} ${lensBox}`} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -R, marginTop: -R, overflow: "hidden", borderRadius: "50%" }}>
          <ScopeReticleSvg kind={reticle} R={R} color={reticleColor} glow={illumination} illuminated={illuminated} />
        </svg>
        {/* Glint */}
        {glint ? (
          <div style={{ position: "absolute", left: "50%", top: "50%", width: lensBox, height: lensBox, marginLeft: -R, marginTop: -R, borderRadius: "50%", overflow: "hidden" }}>
            <div
              ref={glintRef}
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse 38% 16% at 30% 20%, rgba(255,255,255,.16), transparent 70%), radial-gradient(ellipse 60% 60% at 76% 82%, rgba(140,200,255,.06), transparent 70%), conic-gradient(from 200deg at 50% 50%, transparent 0deg, rgba(255,255,255,.035) 18deg, transparent 40deg)`,
                mixBlendMode: "screen",
              }}
            />
          </div>
        ) : null}
        {/* Mask: black outside the lens with a soft tube shadow edge. */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: lensBox + 6000,
            height: lensBox + 6000,
            marginLeft: -R - 3000,
            marginTop: -R - 3000,
            background: `radial-gradient(circle closest-side, transparent ${R - 1.2}px, rgba(0,0,0,.92) ${R + 0.6}px, #000 ${R + 6}px)`,
          }}
        />
        {/* Tube ring highlight */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: lensBox + 18, height: lensBox + 18, marginLeft: -R - 9, marginTop: -R - 9, borderRadius: "50%", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05), 0 0 0 1px rgba(255,255,255,.02)" }} />
      </div>

      {/* HUD in the black margin. */}
      <div className="sf-sniper-scope-hud" style={{ left: 28, top: "50%", transform: "translateY(-50%)", display: "grid", gap: 22 }}>
        <div>
          Zoom
          <b ref={zoomRef}>{targetZoom.toFixed(1)}×</b>
          <span style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button type="button" className="sf-sniper-scope-btn" aria-label="Zoom out" onClick={() => stepZoom(-1)} onPointerDown={event => event.stopPropagation()}>
              −
            </button>
            <button type="button" className="sf-sniper-scope-btn" aria-label="Zoom in" onClick={() => stepZoom(1)} onPointerDown={event => event.stopPropagation()}>
              +
            </button>
          </span>
        </div>
        {rangeFinder ? (
          <div aria-live="off">
            Range
            <b>
              <span ref={rangeRef}>----</span>
              <small style={{ font: `600 12px/1 ${FONT}`, marginLeft: 4, color: "rgba(225,232,228,.55)" }}>m</small>
            </b>
          </div>
        ) : null}
      </div>
      {showHints ? (
        <div className="sf-sniper-scope-hud" style={{ right: 28, top: "50%", transform: "translateY(-50%)", textAlign: "right" }}>
          <span className="sf-sniper-scope-key">Shift</span>
          <span ref={breathLabelRef}>Hold</span>
          <span style={{ display: "block", marginTop: 10, marginLeft: "auto", width: 120, height: 3, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
            <span ref={breathRef} style={{ display: "block", height: "100%", background: "#e8eee9", transformOrigin: "right" }} />
          </span>
          <span style={{ display: "block", marginTop: 8, fontSize: 10, color: "rgba(225,232,228,.4)" }}>Breath</span>
        </div>
      ) : null}
    </div>
  );
}

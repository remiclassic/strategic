"use client";

import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { hexToRgb, useAnimationFrame, useInView, useReducedMotion } from "./_shared/hooks";
import { gameTheme, mixHex, rgba, type GameVariant } from "./_shared/gameKit";

export type MinimapMarker = {
  id: string;
  /** World position (0-512 map units). */
  x: number;
  y: number;
  kind: "objective" | "enemy" | "ally" | "poi";
  label?: string;
};

export type MinimapProps = {
  /** Diameter in px. */
  size?: number;
  /** Map zoom (pixels per map unit). */
  zoom?: number;
  /** Rotate the map so the player always faces up (off = north-up). */
  rotate?: boolean;
  /** Player heading in degrees, clockwise from north (ignored while `autopilot` is on). */
  heading?: number;
  /** Player position in map units (ignored while `autopilot` is on). */
  player?: { x: number; y: number };
  /** Radar sweep speed in turns per second (0 = off; enemies are then always visible). */
  sweepSpeed?: number;
  /** Accent for the sweep, player and bezel. */
  accent?: string;
  /** Visual style (sci-fi hologram, fantasy parchment, minimal). */
  variant?: GameVariant;
  /** Terrain seed. */
  seed?: number;
  /** Zone name under the map ("" hides the plate). */
  zone?: string;
  /** Show N / E / S / W on the bezel. */
  showCompass?: boolean;
  /** Markers in map units. */
  markers?: MinimapMarker[];
  /** Walk the player around on its own (for demos / idle screens). */
  autopilot?: boolean;
  /** Called when the map is clicked, with the pinged map position. */
  onPing?: (point: { x: number; y: number }) => void;
  className?: string;
  style?: CSSProperties;
};

const WORLD = 512;

export const SAMPLE_MARKERS: MinimapMarker[] = [
  { id: "vault", x: 330, y: 206, kind: "objective", label: "Sunken Vault" },
  { id: "tower", x: 96, y: 420, kind: "objective", label: "Watchtower" },
  { id: "e1", x: 290, y: 238, kind: "enemy" },
  { id: "e2", x: 214, y: 300, kind: "enemy" },
  { id: "e3", x: 318, y: 300, kind: "enemy" },
  { id: "e4", x: 196, y: 214, kind: "enemy" },
  { id: "e5", x: 350, y: 262, kind: "enemy" },
  { id: "ally", x: 238, y: 266, kind: "ally" },
  { id: "camp", x: 282, y: 330, kind: "poi" },
];

function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number) => {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    for (let o = 0; o < 4; o++) {
      sum += value(x * freq, y * freq) * amp;
      freq *= 2.03;
      amp *= 0.5;
    }
    return sum / 0.94;
  };
}

type Palette = { deep: string; shallow: string; low: string; high: string; contour: string; contourAlpha: number };

function paletteFor(variant: GameVariant, accent: string): Palette {
  if (variant === "fantasy") return { deep: "#4e6c6a", shallow: "#7d978c", low: "#d9c294", high: "#a8834f", contour: "#5a3d1c", contourAlpha: 0.35 };
  if (variant === "minimal") return { deep: "#121418", shallow: "#191c22", low: "#262a31", high: "#3c414b", contour: "#ffffff", contourAlpha: 0.07 };
  return { deep: "#020a0f", shallow: "#051820", low: mixHex(accent, "#0b1418", 0.82), high: mixHex(accent, "#0b1418", 0.6), contour: accent, contourAlpha: 0.3 };
}

function paintTerrain(canvas: HTMLCanvasElement, seed: number, palette: Palette) {
  canvas.width = WORLD;
  canvas.height = WORLD;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const noise = makeNoise(seed);
  const image = ctx.createImageData(WORLD, WORLD);
  const col = (hex: string) => hexToRgb(hex).map(v => v * 255);
  const [deep, shallow, low, high, contour] = [palette.deep, palette.shallow, palette.low, palette.high, palette.contour].map(col);
  const scale = 1 / 150;
  for (let y = 0; y < WORLD; y++) {
    for (let x = 0; x < WORLD; x++) {
      const h = noise(x * scale + 3.1, y * scale + 7.7);
      const i = (y * WORLD + x) * 4;
      let r: number;
      let g: number;
      let b: number;
      const sea = 0.47;
      if (h < sea) {
        const t = Math.max(0, (h - 0.3) / (sea - 0.3));
        r = deep[0] + (shallow[0] - deep[0]) * t;
        g = deep[1] + (shallow[1] - deep[1]) * t;
        b = deep[2] + (shallow[2] - deep[2]) * t;
      } else {
        const t = Math.min(1, (h - sea) / 0.26);
        r = low[0] + (high[0] - low[0]) * t;
        g = low[1] + (high[1] - low[1]) * t;
        b = low[2] + (high[2] - low[2]) * t;
        // Contour lines every 0.035 of height.
        const band = (h - sea) / 0.05;
        const edge = Math.abs(band - Math.round(band));
        const line = edge < 0.07 ? palette.contourAlpha * (1 - edge / 0.07) : 0;
        r += (contour[0] - r) * line;
        g += (contour[1] - g) * line;
        b += (contour[2] - b) * line;
      }
      // Shoreline highlight.
      const shore = Math.abs(h - sea);
      if (shore < 0.008) {
        const k = 0.45 * (1 - shore / 0.008);
        r += (contour[0] - r) * k;
        g += (contour[1] - g) * k;
        b += (contour[2] - b) * k;
      }
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

export function Minimap({
  size = 300,
  zoom = 1.5,
  rotate = true,
  heading = 0,
  player = { x: 256, y: 256 },
  sweepSpeed = 0.35,
  accent = "#58d5ff",
  variant = "sci-fi",
  seed = 7,
  zone = "Hollowmere Fen",
  showCompass = true,
  markers = SAMPLE_MARKERS,
  autopilot = false,
  onPing,
  className,
  style,
}: MinimapProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terrainRef = useRef<HTMLCanvasElement | null>(null);
  const bezelRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInView(rootRef);
  const state = useRef({ time: 0, x: player.x, y: player.y, heading, pings: [] as { x: number; y: number; t: number }[] });
  const live = useRef({ size, zoom, rotate, heading, player, sweepSpeed, accent, variant, markers, autopilot, reduced });
  live.current = { size, zoom, rotate, heading, player, sweepSpeed, accent, variant, markers, autopilot, reduced };

  useEffect(() => {
    const terrain = document.createElement("canvas");
    paintTerrain(terrain, seed, paletteFor(variant, accent));
    terrainRef.current = terrain;
    draw(0);
    // draw reads live values; terrain only depends on these three.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, variant, accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    draw(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const toScreen = (wx: number, wy: number) => {
    const { zoom: z, rotate: spin, size: s } = live.current;
    const st = state.current;
    const dx = (wx - st.x) * z;
    const dy = (wy - st.y) * z;
    const a = spin ? (-st.heading * Math.PI) / 180 : 0;
    return { x: s / 2 + dx * Math.cos(a) - dy * Math.sin(a), y: s / 2 + dx * Math.sin(a) + dy * Math.cos(a) };
  };

  function draw(delta: number) {
    const canvas = canvasRef.current;
    const terrain = terrainRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !terrain) return;
    const settings = live.current;
    const st = state.current;
    st.time += delta;
    if (settings.autopilot && !settings.reduced) {
      const t = st.time * 0.09;
      const nx = 256 + Math.sin(t) * 70 + Math.sin(t * 2.3 + 1) * 22;
      const ny = 256 + Math.cos(t * 0.8) * 60 + Math.sin(t * 1.7) * 18;
      const target = (Math.atan2(nx - st.x, -(ny - st.y)) * 180) / Math.PI;
      if (delta > 0) {
        let diff = target - st.heading;
        diff = ((diff + 540) % 360) - 180;
        st.heading += diff * Math.min(1, delta * 2.5);
      }
      st.x = nx;
      st.y = ny;
    } else if (!settings.autopilot) {
      st.x = settings.player.x;
      st.y = settings.player.y;
      st.heading = settings.heading;
    }
    const s = settings.size;
    const dpr = canvas.width / s;
    const r = s / 2;
    const accentRgb = settings.accent;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#050607";
    ctx.fillRect(0, 0, s, s);

    // Terrain
    ctx.save();
    ctx.translate(r, r);
    if (settings.rotate) ctx.rotate((-st.heading * Math.PI) / 180);
    ctx.scale(settings.zoom, settings.zoom);
    ctx.translate(-st.x, -st.y);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(terrain, 0, 0);
    if (settings.variant === "sci-fi") {
      ctx.strokeStyle = rgba(accentRgb, 0.07);
      ctx.lineWidth = 1 / settings.zoom;
      ctx.beginPath();
      for (let g = 0; g <= WORLD; g += 32) {
        ctx.moveTo(g, 0);
        ctx.lineTo(g, WORLD);
        ctx.moveTo(0, g);
        ctx.lineTo(WORLD, g);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Sweep
    const sweepOn = settings.sweepSpeed > 0 && !settings.reduced;
    const sweepAngle = (st.time * settings.sweepSpeed * Math.PI * 2) % (Math.PI * 2);
    if (sweepOn && "createConicGradient" in ctx) {
      const trail = 1.1;
      const conic = ctx.createConicGradient(sweepAngle - trail, r, r);
      const frac = trail / (Math.PI * 2);
      conic.addColorStop(0, rgba(accentRgb, 0));
      conic.addColorStop(frac * 0.999, rgba(accentRgb, settings.variant === "fantasy" ? 0.2 : 0.3));
      conic.addColorStop(frac, rgba(accentRgb, 0));
      conic.addColorStop(1, rgba(accentRgb, 0));
      ctx.fillStyle = conic;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = rgba(accentRgb, 0.75);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.lineTo(r + Math.cos(sweepAngle) * r, r + Math.sin(sweepAngle) * r);
      ctx.stroke();
    }

    // View cone
    const facing = settings.rotate ? -Math.PI / 2 : ((st.heading - 90) * Math.PI) / 180;
    const cone = ctx.createRadialGradient(r, r, 4, r, r, r * 0.55);
    cone.addColorStop(0, rgba(accentRgb, 0.32));
    cone.addColorStop(1, rgba(accentRgb, 0));
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r * 0.55, facing - 0.5, facing + 0.5);
    ctx.closePath();
    ctx.fill();

    // Pings
    st.pings = st.pings.filter(p => st.time - p.t < 2.4);
    for (const ping of st.pings) {
      const p = toScreen(ping.x, ping.y);
      const age = st.time - ping.t;
      for (let k = 0; k < 3; k++) {
        const local = age - k * 0.35;
        if (local < 0 || local > 1.3) continue;
        ctx.strokeStyle = rgba("#ffe08a", (1 - local / 1.3) * 0.9);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + local * 26, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffe08a";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 7);
      ctx.lineTo(p.x + 5, p.y);
      ctx.lineTo(p.x, p.y + 7);
      ctx.lineTo(p.x - 5, p.y);
      ctx.closePath();
      ctx.fill();
    }

    // Markers
    const edge = r - 14;
    for (const marker of settings.markers) {
      const p = toScreen(marker.x, marker.y);
      const dx = p.x - r;
      const dy = p.y - r;
      const dist = Math.hypot(dx, dy);
      if (marker.kind === "enemy") {
        if (dist > r - 4) continue;
        let alpha = 1;
        if (sweepOn) {
          const angle = Math.atan2(dy, dx);
          const since = (((sweepAngle - angle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          alpha = Math.max(0.28, Math.exp(-since * 0.7));
        }
        ctx.fillStyle = rgba("#ff4d4d", 0.35 * alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba("#ff6b5e", alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      if (marker.kind === "ally") {
        if (dist > r - 4) continue;
        ctx.fillStyle = "#6ee7a0";
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        continue;
      }
      if (marker.kind === "poi") {
        if (dist > r - 4) continue;
        ctx.fillStyle = settings.variant === "fantasy" ? "#3b2410" : "#e8e0cf";
        ctx.fillRect(p.x - 3.5, p.y - 3.5, 7, 7);
        continue;
      }
      // Objectives clamp to the rim with a pointer.
      const clamped = dist > edge;
      const k = clamped ? edge / dist : 1;
      const ox = r + dx * k;
      const oy = r + dy * k;
      const pulse = settings.reduced ? 0.5 : (st.time * 0.8) % 1;
      if (!clamped) {
        ctx.strokeStyle = rgba("#ffcf5a", 0.8 * (1 - pulse));
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ox, oy, 6 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(ox, oy);
      if (clamped) ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2);
      ctx.fillStyle = "#ffcf5a";
      ctx.strokeStyle = "rgba(40,24,0,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (clamped) {
        ctx.moveTo(0, -7);
        ctx.lineTo(6, 5);
        ctx.lineTo(-6, 5);
      } else {
        ctx.moveTo(0, -8);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 8);
        ctx.lineTo(-6, 0);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Player
    ctx.save();
    ctx.translate(r, r);
    if (!settings.rotate) ctx.rotate((st.heading * Math.PI) / 180);
    ctx.shadowColor = accentRgb;
    ctx.shadowBlur = 10;
    ctx.fillStyle = settings.variant === "fantasy" ? "#fff6e0" : "#ffffff";
    ctx.strokeStyle = settings.variant === "fantasy" ? "#3b2410" : mixHex(accentRgb, "#000000", 0.5);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(7, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();

    // Vignette + inner rim
    const vignette = ctx.createRadialGradient(r, r, r * 0.55, r, r, r);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, settings.variant === "fantasy" ? "rgba(40,24,8,0.6)" : "rgba(0,0,0,0.7)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, s, s);
    ctx.restore();

    // Bezel rotation + coordinates
    const spin = settings.rotate ? -st.heading : 0;
    if (bezelRef.current) bezelRef.current.style.transform = `rotate(${spin}deg)`;
    letterRefs.current.forEach((node, i) => {
      if (node) node.style.transform = `rotate(${-spin - i * 90}deg)`;
    });
    if (coordsRef.current) {
      const text = `${Math.round(st.x - 256)}, ${Math.round(256 - st.y)} · ${String(Math.round(((st.heading % 360) + 360) % 360)).padStart(3, "0")}°`;
      if (coordsRef.current.textContent !== text) coordsRef.current.textContent = text;
    }
  }

  useAnimationFrame(delta => draw(delta), inView && !reduced);

  useEffect(() => {
    if (reduced || !inView) draw(0);
  });

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { zoom: z, rotate: spin, size: s } = live.current;
    const st = state.current;
    const sx = event.clientX - rect.left - s / 2;
    const sy = event.clientY - rect.top - s / 2;
    if (Math.hypot(sx, sy) > s / 2) return;
    const a = spin ? (st.heading * Math.PI) / 180 : 0;
    const wx = st.x + (sx * Math.cos(a) - sy * Math.sin(a)) / z;
    const wy = st.y + (sx * Math.sin(a) + sy * Math.cos(a)) / z;
    st.pings.push({ x: wx, y: wy, t: st.time });
    if (reduced) draw(0);
    onPing?.({ x: wx, y: wy });
  };

  const trim = variant === "fantasy" ? "#d4ae68" : variant === "minimal" ? "rgba(255,255,255,0.35)" : accent;
  const letters = showCompass ? (["N", "E", "S", "W"] as const) : [];

  return (
    <div ref={rootRef} className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 14, fontFamily: theme.font, color: theme.text, ...style }}>
      <div style={{ position: "relative", width: size + 28, height: size + 28 }}>
        {/* Bezel */}
        <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: variant === "fantasy" ? "conic-gradient(from 20deg, #f5dc9c, #7a5520, #e2c07a, #6b4a1c, #f5dc9c)" : variant === "minimal" ? "linear-gradient(160deg, #3a3a42, #141417)" : `linear-gradient(160deg, #2c3843, #0b1015)`, boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px ${rgba(variant === "sci-fi" ? accent : "#000000", 0.35)}` }} />
        <div aria-hidden style={{ position: "absolute", inset: 5, borderRadius: "50%", background: "#07090b", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)" }} />
        <div ref={bezelRef} aria-hidden style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 72 }, (_, i) => (
            <span key={i} style={{ position: "absolute", left: "50%", top: 1, width: 1, height: i % 18 === 0 ? 0 : i % 6 === 0 ? 7 : 4, marginLeft: -0.5, transformOrigin: `50% ${(size + 28) / 2 - 1}px`, transform: `rotate(${i * 5}deg)`, background: variant === "fantasy" ? "rgba(40,24,8,0.7)" : rgba(variant === "sci-fi" ? accent : "#ffffff", 0.35) }} />
          ))}
          {letters.map((letter, i) => (
            <span key={letter} style={{ position: "absolute", left: "50%", top: "50%", width: 20, height: 20, margin: "-10px 0 0 -10px", transform: `rotate(${i * 90}deg) translateY(${-(size + 28) / 2 + 9}px)` }}>
              <span
                ref={node => {
                  letterRefs.current[i] = node;
                }}
                style={{ display: "grid", placeItems: "center", width: 20, height: 20, fontSize: 11, fontWeight: 800, fontFamily: theme.font, color: letter === "N" ? (variant === "fantasy" ? "#7a1f12" : "#ff6b5e") : variant === "fantasy" ? "#2a1a08" : theme.text, textShadow: variant === "fantasy" ? "none" : "0 1px 2px #000" }}>
                {letter}
              </span>
            </span>
          ))}
        </div>
        <div
          role="img"
          aria-label={`Minimap${zone ? ` of ${zone}` : ""}. Click to place a ping.`}
          onClick={onClick}
          style={{ position: "absolute", left: 14, top: 14, width: size, height: size, borderRadius: "50%", overflow: "hidden", cursor: "crosshair", boxShadow: `0 0 0 1px ${rgba(variant === "fantasy" ? "#3b2410" : trim, 0.6)}` }}
        >
          <canvas ref={canvasRef} style={{ display: "block", width: size, height: size }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 32% 22%, rgba(255,255,255,0.06), transparent 38%)", pointerEvents: "none" }} />
        </div>
      </div>
      {zone ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 18px", background: theme.panel, borderRadius: theme.radius, clipPath: theme.clip(6), boxShadow: `inset 0 0 0 1px ${variant === "fantasy" ? rgba("#d4ae68", 0.5) : rgba(accent, 0.25)}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none" }}>{zone}</span>
          <span ref={coordsRef} style={{ fontFamily: theme.numeric, fontSize: 11, color: theme.muted, fontVariantNumeric: "tabular-nums", letterSpacing: "0.06em" }} />
        </div>
      ) : null}
    </div>
  );
}

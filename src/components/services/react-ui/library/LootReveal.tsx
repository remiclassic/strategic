"use client";
/* eslint-disable @next/next/no-img-element -- copy-paste component: a plain <img> keeps it framework-agnostic. */

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { useAnimationFrame, useInView, useReducedMotion } from "./_shared/hooks";
import { GameGlyph, RARITY, gameTheme, mixHex, rarityOf, rgba, usePropState, type GameVariant, type GlyphName, type Rarity } from "./_shared/gameKit";

export type LootRevealProps = {
  /** Rarity tier; drives beam, particle and card colors. */
  rarity?: Rarity;
  /** Item name on the card. */
  itemName?: string;
  /** Item type line on the card. */
  itemType?: string;
  /** Built-in glyph used when no `image` is given. */
  glyph?: GlyphName;
  /** Item art URL shown on the card. */
  image?: string;
  /** Stat lines listed on the card. */
  stats?: string[];
  /** Chest style. */
  variant?: GameVariant;
  /** Controlled open state (true shows the revealed card). */
  opened?: boolean;
  /** Particle amount multiplier. */
  particles?: number;
  /** Called when the chest opens. */
  onOpen?: (rarity: Rarity) => void;
  /** Called when the chest is closed again. */
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
};

const W = 600;
const H = 400;
const MOUTH = { x: W / 2, y: 292 };

const CSS = `
.sf-loot-reveal-root:focus-visible { outline: 2px solid var(--sf-lr-color); outline-offset: 4px; border-radius: 12px; }
.sf-loot-reveal-chest { transition: transform .9s cubic-bezier(.2,.9,.25,1), opacity .9s, filter .9s; }
.sf-loot-reveal-root[data-phase="closed"]:hover .sf-loot-reveal-chest { transform: translateY(-4px); }
.sf-loot-reveal-root[data-phase="closed"]:hover .sf-loot-reveal-seam { opacity: 1; }
.sf-loot-reveal-lid { transform-origin: 50% 100%; transition: transform .75s cubic-bezier(.3,1.5,.4,1); }
.sf-loot-reveal-seam { transition: opacity .4s; }
.sf-loot-reveal-beams { transition: opacity .8s ease, transform 1.2s cubic-bezier(.2,.9,.25,1); animation: sf-loot-reveal-spin 26s linear infinite; }
@keyframes sf-loot-reveal-spin { to { rotate: 360deg; } }
.sf-loot-reveal-lift { transition: transform .8s cubic-bezier(.2,1.1,.3,1), opacity .35s; }
.sf-loot-reveal-flip { transition: transform .9s cubic-bezier(.3,1.25,.4,1); transform-style: preserve-3d; }
.sf-loot-reveal-shine { animation: sf-loot-reveal-shine 3.6s cubic-bezier(.4,0,.2,1) 1.9s infinite; }
@keyframes sf-loot-reveal-shine { 0% { transform: translateX(-160%) skewX(-18deg); } 35%, 100% { transform: translateX(260%) skewX(-18deg); } }
.sf-loot-reveal-idle { animation: sf-loot-reveal-idle 2.8s ease-in-out infinite; }
@keyframes sf-loot-reveal-idle { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
.sf-loot-reveal-prompt { transition: opacity .4s, transform .4s cubic-bezier(.2,.9,.3,1); }
@media (prefers-reduced-motion: reduce) {
  .sf-loot-reveal-beams, .sf-loot-reveal-shine, .sf-loot-reveal-idle { animation: none; }
  .sf-loot-reveal-chest, .sf-loot-reveal-lid, .sf-loot-reveal-lift, .sf-loot-reveal-flip, .sf-loot-reveal-beams { transition-duration: .01s; transition-delay: 0s !important; }
}
`;

type Particle = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; tint: string; streak: boolean };

const PALETTES: Record<GameVariant, { body: [string, string]; metal: [string, string]; line: string }> = {
  fantasy: { body: ["#7a4724", "#351b0b"], metal: ["#f3d38a", "#8a5f22"], line: "rgba(20,8,0,0.55)" },
  "sci-fi": { body: ["#39434e", "#11161b"], metal: ["#7d8a96", "#232b33"], line: "rgba(0,0,0,0.5)" },
  minimal: { body: ["#34343a", "#17171a"], metal: ["#55555d", "#26262b"], line: "rgba(0,0,0,0.45)" },
};

export function LootReveal({
  rarity = "legendary",
  itemName = "Emberheart Blade",
  itemType = "Two-handed sword",
  glyph = "sword",
  image,
  stats = ["+48 Attack", "+12% Critical chance", "Burns foes on hit"],
  variant = "fantasy",
  opened = false,
  particles = 1,
  onOpen,
  onClose,
  className,
  style,
}: LootRevealProps) {
  const theme = gameTheme(variant);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tier = RARITY[rarityOf(rarity)];
  const color = tier.color;
  const palette = PALETTES[variant] ?? PALETTES.fantasy;
  const reduced = useReducedMotion();
  const [phase, setPhase] = usePropState<"closed" | "opening" | "open">(opened ? "open" : "closed");
  const rootRef = useRef<HTMLDivElement>(null);
  const chestRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const pool = useRef<Particle[]>([]);
  const ambient = useRef(0);
  const live = useRef({ color, particles, phase });
  live.current = { color, particles, phase };
  const isOpen = phase === "open";

  const burst = () => {
    const amount = Math.round(130 * Math.max(0, particles));
    for (let i = 0; i < amount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 180 + Math.random() * 420;
      pool.current.push({
        x: MOUTH.x + (Math.random() - 0.5) * 120,
        y: MOUTH.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.9 + Math.random() * 1.3,
        age: 0,
        size: 1 + Math.random() * 2.6,
        tint: Math.random() < 0.3 ? "#ffffff" : mixHex(color, "#ffffff", Math.random() * 0.5),
        streak: Math.random() < 0.45,
      });
    }
  };

  // Canvas setup (DPR capped at 2).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => {
      setPhase("open");
      if (!reduced) burst();
      flashRef.current?.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: reduced ? 150 : 900, easing: "cubic-bezier(.2,.7,.3,1)" });
      onOpen?.(rarityOf(rarity));
    }, reduced ? 0 : 520);
    return () => window.clearTimeout(timer);
    // burst/onOpen read fresh values; only the phase transition matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useAnimationFrame(delta => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const { color: tint, phase: now } = live.current;
    if (now === "open") {
      ambient.current += delta * 14 * Math.max(0, live.current.particles);
      while (ambient.current > 1) {
        ambient.current -= 1;
        pool.current.push({
          x: W / 2 + (Math.random() - 0.5) * 260,
          y: 300 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 16,
          vy: -30 - Math.random() * 60,
          life: 2.2 + Math.random() * 1.8,
          age: 0,
          size: 0.8 + Math.random() * 1.6,
          tint: mixHex(tint, "#ffffff", 0.35),
          streak: false,
        });
      }
    }
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    const next: Particle[] = [];
    for (const p of pool.current) {
      p.age += delta;
      if (p.age >= p.life) continue;
      p.vy += (p.streak ? 520 : p.life > 2 ? -6 : 380) * delta;
      p.vx *= 1 - delta * 0.9;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      const t = p.age / p.life;
      const alpha = Math.min(1, (1 - t) * 1.6) * Math.min(1, p.age * 12);
      ctx.globalAlpha = alpha;
      if (p.streak) {
        ctx.strokeStyle = p.tint;
        ctx.lineWidth = p.size * 0.7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
        ctx.stroke();
      } else {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        glow.addColorStop(0, p.tint);
        glow.addColorStop(1, rgba(tint, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8);
      }
      next.push(p);
    }
    pool.current = next;
    ctx.globalAlpha = 1;
  }, inView && !reduced && (isOpen || pool.current.length > 0));

  const toggle = () => {
    if (phase === "closed") {
      setPhase("opening");
      if (!reduced) {
        chestRef.current?.animate(
          [0, -3, 3, -4, 4, -2, 2, 0].map((x, i) => ({ transform: `translate(${x}px, ${i % 2 ? -2 : 0}px) rotate(${x * 0.4}deg)` })),
          { duration: 520, easing: "cubic-bezier(.4,0,.6,1)" },
        );
      }
    } else if (phase === "open") {
      setPhase("closed");
      pool.current = [];
      onClose?.();
    }
  };

  const lidPath =
    variant === "fantasy"
      ? "M14 90 L14 52 Q14 12 120 10 Q226 12 226 52 L226 90 Z"
      : variant === "sci-fi"
        ? "M14 90 L14 40 L34 20 L206 20 L226 40 L226 90 Z"
        : "M14 90 V34 Q14 20 28 20 H212 Q226 20 226 34 V90 Z";
  const metal = `url(#sf-lr-metal-${uid})`;

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label={isOpen ? `${tier.label} ${itemName} revealed. Activate to close the chest.` : "Open the chest"}
      aria-live="polite"
      data-phase={phase}
      className={`sf-loot-reveal-root${className ? ` ${className}` : ""}`}
      onClick={toggle}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      }}
      style={{ position: "relative", width: W, height: H, maxWidth: "100%", cursor: phase === "opening" ? "default" : "pointer", userSelect: "none", fontFamily: theme.font, ["--sf-lr-color" as string]: color, ...style }}
    >
      <style>{CSS}</style>
      {/* Floor glow */}
      <div aria-hidden style={{ position: "absolute", left: W / 2 - 230, top: 300, width: 460, height: 120, borderRadius: "50%", background: `radial-gradient(closest-side, ${rgba(color, isOpen ? 0.42 : 0.12)}, transparent)`, transition: "background .8s" }} />
      {/* Light beams */}
      <div aria-hidden style={{ position: "absolute", left: MOUTH.x - 380, top: MOUTH.y - 380 - 60, width: 760, height: 760, pointerEvents: "none", maskImage: "radial-gradient(circle, #000 6%, transparent 62%)", WebkitMaskImage: "radial-gradient(circle, #000 6%, transparent 62%)" }}>
        <div
          className="sf-loot-reveal-beams"
          style={{ position: "absolute", inset: 0, borderRadius: "50%", opacity: isOpen ? 1 : phase === "opening" ? 0.5 : 0.16, transform: isOpen ? "scale(1)" : "scale(0.42)", background: `repeating-conic-gradient(from 0deg, transparent 0deg 7deg, ${rgba(color, 0.36)} 9deg 11deg, transparent 13deg 20deg, ${rgba(mixHex(color, "#ffffff", 0.4), 0.18)} 22deg 25deg, transparent 27deg 33deg)` }}
        />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", opacity: isOpen ? 1 : 0, transition: "opacity .8s", background: `radial-gradient(circle, ${rgba(mixHex(color, "#ffffff", 0.5), 0.55)}, ${rgba(color, 0.2)} 22%, transparent 45%)` }} />
      </div>

      {/* Chest */}
      <div
        className="sf-loot-reveal-chest"
        style={{ position: "absolute", left: W / 2 - 120, top: 208, width: 240, height: 180, perspective: 700, transform: isOpen ? "translateY(26px) scale(0.92)" : undefined, filter: isOpen ? "brightness(0.55)" : undefined }}
      >
        <div ref={chestRef} style={{ position: "absolute", inset: 0 }}>
          <svg aria-hidden viewBox="0 0 240 180" width={240} height={180} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs>
              <linearGradient id={`sf-lr-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={palette.body[0]} />
                <stop offset="1" stopColor={palette.body[1]} />
              </linearGradient>
              <linearGradient id={`sf-lr-metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={palette.metal[0]} />
                <stop offset="0.55" stopColor={palette.metal[1]} />
                <stop offset="1" stopColor={mixHex(palette.metal[0], palette.metal[1], 0.4)} />
              </linearGradient>
              <radialGradient id={`sf-lr-mouth-${uid}`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.35" stopColor={color} />
                <stop offset="1" stopColor={mixHex(color, "#000000", 0.7)} />
              </radialGradient>
            </defs>
            {/* Open interior, hidden behind the lid while closed */}
            <ellipse cx={120} cy={86} rx={100} ry={14} fill={`url(#sf-lr-mouth-${uid})`} opacity={isOpen ? 1 : 0} style={{ transition: "opacity .3s" }} />
            <path d="M16 84 H224 V158 Q224 172 210 172 H30 Q16 172 16 158 Z" fill={`url(#sf-lr-body-${uid})`} stroke="rgba(0,0,0,0.6)" strokeWidth={2} />
            {variant === "fantasy" ? [104, 124, 144].map(y => <line key={y} x1={20} x2={220} y1={y} y2={y} stroke={palette.line} strokeWidth={2} />) : null}
            {variant === "sci-fi" ? (
              <>
                <path d="M30 100 H90 L98 108 H142 L150 100 H210" fill="none" stroke={rgba(color, 0.55)} strokeWidth={1.5} />
                <rect x={30} y={148} width={180} height={4} fill={rgba(color, 0.35)} />
              </>
            ) : null}
            <rect x={34} y={84} width={16} height={88} fill={metal} />
            <rect x={190} y={84} width={16} height={88} fill={metal} />
            <rect x={16} y={84} width={208} height={8} fill={metal} opacity={0.9} />
            <rect x={16} y={164} width={208} height={8} rx={3} fill={metal} opacity={0.85} />
            {[42, 198].flatMap(x => [104, 132, 156].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} fill={palette.metal[0]} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />))}
            <path d="M104 86 H136 V112 L120 124 L104 112 Z" fill={metal} stroke="rgba(0,0,0,0.5)" />
            <circle cx={120} cy={101} r={4} fill="#140b04" />
            <path d="M118.6 103 H121.4 L122 112 H118 Z" fill="#140b04" />
          </svg>
          {/* Seam glow leaking from the lid gap */}
          <div aria-hidden className={`sf-loot-reveal-seam${isOpen ? "" : " sf-loot-reveal-idle"}`} style={{ position: "absolute", left: 18, right: 18, top: 80, height: 6, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${color} 20%, #ffffff 50%, ${color} 80%, transparent)`, filter: "blur(2px)", boxShadow: `0 0 18px 4px ${rgba(color, 0.7)}`, opacity: phase === "opening" ? 1 : isOpen ? 0 : 0.6 }} />
          <div className="sf-loot-reveal-lid" style={{ position: "absolute", left: 0, top: -6, width: 240, height: 92, transform: isOpen ? "translateY(-14px) rotateX(78deg)" : phase === "opening" ? "rotateX(14deg)" : "none" }}>
            <svg aria-hidden viewBox="0 0 240 92" width={240} height={92} style={{ overflow: "visible" }}>
              <path d={lidPath} fill={`url(#sf-lr-body-${uid})`} stroke="rgba(0,0,0,0.6)" strokeWidth={2} />
              <path d={lidPath} fill={`url(#sf-lr-lidshine-${uid})`} opacity={0.35} />
              <defs>
                <linearGradient id={`sf-lr-lidshine-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
                  <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <rect x={34} y={variant === "fantasy" ? 12 : 20} width={16} height={variant === "fantasy" ? 80 : 72} fill={metal} />
              <rect x={190} y={variant === "fantasy" ? 12 : 20} width={16} height={variant === "fantasy" ? 80 : 72} fill={metal} />
              <rect x={14} y={80} width={212} height={10} fill={metal} />
              {variant === "sci-fi" ? <rect x={70} y={32} width={100} height={3} fill={rgba(color, 0.7)} /> : null}
              {variant === "fantasy" ? <path d="M110 80 H130 V90 H110 Z" fill={metal} stroke="rgba(0,0,0,0.5)" /> : null}
            </svg>
          </div>
        </div>
      </div>

      <div aria-hidden className="sf-loot-reveal-prompt" style={{ position: "absolute", left: 0, right: 0, top: 118, textAlign: "center", pointerEvents: "none", opacity: phase === "closed" ? 1 : 0, transform: phase === "closed" ? "none" : "translateY(-10px)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.34em", textTransform: "uppercase", color: mixHex(color, "#ffffff", 0.35) }}>{tier.label} cache</div>
        <div className="sf-loot-reveal-idle" style={{ marginTop: 8, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: theme.muted }}>Click to open</div>
      </div>
      <canvas ref={canvasRef} aria-hidden style={{ position: "absolute", inset: 0, width: W, height: H, pointerEvents: "none" }} />

      {/* Item card */}
      <div
        className="sf-loot-reveal-lift"
        style={{ position: "absolute", left: W / 2 - 96, top: 18, width: 192, height: 262, perspective: 900, opacity: isOpen ? 1 : 0, transform: isOpen ? "translateY(0) scale(1)" : "translateY(200px) scale(0.25)", transitionDelay: isOpen ? "0.12s" : "0s" }}
      >
        <div className="sf-loot-reveal-flip" style={{ position: "absolute", inset: 0, transform: isOpen ? "rotateY(0deg)" : "rotateY(180deg)", transitionDelay: isOpen ? "0.55s" : "0s" }}>
          {/* Back */}
          <div aria-hidden style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 12, border: `2px solid ${color}`, background: `radial-gradient(circle at 50% 45%, ${rgba(color, 0.55)}, ${tier.deep} 55%, #080605)`, display: "grid", placeItems: "center", boxShadow: `0 0 40px ${rgba(color, 0.6)}` }}>
            <div style={{ width: 70, height: 70, transform: "rotate(45deg)", border: `2px solid ${mixHex(color, "#ffffff", 0.5)}`, boxShadow: `0 0 24px ${color}, inset 0 0 18px ${rgba(color, 0.8)}` }} />
          </div>
          {/* Front */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 12, padding: 2, background: `linear-gradient(160deg, ${mixHex(color, "#ffffff", 0.6)}, ${color} 30%, ${tier.deep} 70%, ${color})`, boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 46px ${rgba(color, 0.55)}, 0 24px 40px rgba(0,0,0,0.6)` }}>
            <div style={{ position: "relative", height: "100%", borderRadius: 10, overflow: "hidden", background: "linear-gradient(180deg, #17120e, #0a0806)", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", height: 132, flex: "none", display: "grid", placeItems: "center", background: `radial-gradient(circle at 50% 60%, ${rgba(color, 0.5)}, ${rgba(tier.deep, 0.6)} 55%, #0a0806 100%)` }}>
                {image ? (
                  <img src={image} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <GameGlyph name={glyph} color={mixHex(color, "#ffffff", 0.25)} size={84} style={{ filter: `drop-shadow(0 0 16px ${rgba(color, 0.8)})` }} />
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, #120e0b)" }} />
                <div className={isOpen ? "sf-loot-reveal-shine" : undefined} style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "45%", transform: "translateX(-160%)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }} />
              </div>
              <div style={{ margin: "-10px auto 0", position: "relative", padding: "3px 12px", fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#140c04", background: `linear-gradient(180deg, ${mixHex(color, "#ffffff", 0.45)}, ${color})`, borderRadius: 3, boxShadow: `0 0 14px ${rgba(color, 0.7)}` }}>
                {tier.label}
              </div>
              <div style={{ padding: "8px 12px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: mixHex(color, "#ffffff", 0.55), letterSpacing: "0.02em", lineHeight: 1.15 }}>{itemName}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: theme.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>{itemType}</div>
                <div style={{ margin: "8px auto 6px", width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${rgba(color, 0.8)}, transparent)` }} />
                {stats.slice(0, 3).map(line => (
                  <div key={line} style={{ fontSize: 11.5, lineHeight: 1.5, color: "#d9f7d4" }}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden ref={flashRef} style={{ position: "absolute", left: MOUTH.x - 260, top: MOUTH.y - 220, width: 520, height: 360, opacity: 0, pointerEvents: "none", background: `radial-gradient(closest-side, #ffffff, ${rgba(color, 0.55)} 45%, transparent)` }} />
    </div>
  );
}

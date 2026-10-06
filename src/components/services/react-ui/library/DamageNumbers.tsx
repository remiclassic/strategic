"use client";

import { useEffect, useImperativeHandle, useRef, type CSSProperties, type MouseEvent, type ReactNode, type Ref } from "react";
import { useInView, useReducedMotion } from "./_shared/hooks";
import { gameTheme, mixHex, rgba, type GameVariant } from "./_shared/gameKit";

export type DamageKind = "normal" | "crit" | "heal" | "miss";

export type DamageNumbersHandle = {
  /** Spawn a number at (x, y) px relative to the component (defaults to the target center). */
  spawn: (value: number, kind?: DamageKind, x?: number, y?: number) => void;
};

export type DamageNumbersProps = {
  /** Lowest rolled damage. */
  minDamage?: number;
  /** Highest rolled damage (before crits). */
  maxDamage?: number;
  /** Chance (0-1) that a hit is critical. */
  critChance?: number;
  /** Crit damage multiplier. */
  critMultiplier?: number;
  /** Normal hit color. */
  color?: string;
  /** Critical hit color. */
  critColor?: string;
  /** Heal number color. */
  healColor?: string;
  /** Visual style (font and "CRIT" treatment). */
  variant?: GameVariant;
  /** Number size multiplier. */
  scale?: number;
  /** Show the built-in training dummy target. */
  showDummy?: boolean;
  /** Seconds between automatic hits (0 = off). Pauses briefly after a click. */
  autoAttack?: number;
  /** Your own target. Clicks on it spawn numbers. */
  children?: ReactNode;
  /** Imperative handle: `ref.current.spawn(value, kind, x, y)`. */
  ref?: Ref<DamageNumbersHandle>;
  /** Called for every rolled hit. */
  onHit?: (hit: { value: number; kind: DamageKind }) => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `
.sf-damage-numbers-target { transition: filter .2s; }
.sf-damage-numbers-target:hover { filter: brightness(1.12); }
.sf-damage-numbers-target:focus-visible { outline: 2px solid var(--sf-dn-crit); outline-offset: 6px; border-radius: 16px; }
.sf-damage-numbers-num { position: absolute; left: 0; top: 0; pointer-events: none; white-space: nowrap; font-weight: 400; line-height: 1; will-change: transform, opacity; paint-order: stroke fill; }
`;

export function DamageNumbers({
  minDamage = 84,
  maxDamage = 212,
  critChance = 0.22,
  critMultiplier = 2.4,
  color = "#ffffff",
  critColor = "#ffb62e",
  healColor = "#5ee88a",
  variant = "fantasy",
  scale = 1,
  showDummy = true,
  autoAttack = 0,
  children,
  ref,
  onHit,
  className,
  style,
}: DamageNumbersProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const pausedUntil = useRef(0);
  const side = useRef(1);
  const live = useRef({ minDamage, maxDamage, critChance, critMultiplier, color, critColor, healColor, scale, reduced, onHit, font: theme.numeric, variant });
  const font = variant === "minimal" ? theme.numeric : '"Impact", "Haettenschweiler", "Arial Narrow Bold", "Bahnschrift", sans-serif';
  live.current = { minDamage, maxDamage, critChance, critMultiplier, color, critColor, healColor, scale, reduced, onHit, font, variant };

  const spawn = (value: number, kind: DamageKind = "normal", x?: number, y?: number) => {
    const layer = layerRef.current;
    const root = rootRef.current;
    if (!layer || !root) return;
    const settings = live.current;
    const bounds = root.getBoundingClientRect();
    const target = targetRef.current?.getBoundingClientRect();
    const px = x ?? (target ? target.left - bounds.left + target.width / 2 : bounds.width / 2);
    const py = y ?? (target ? target.top - bounds.top + target.height * 0.35 : bounds.height / 2);
    const crit = kind === "crit";
    const tint = kind === "crit" ? settings.critColor : kind === "heal" ? settings.healColor : kind === "miss" ? "#b8b3aa" : settings.color;
    const size = (crit ? 46 : kind === "miss" ? 22 : 30) * settings.scale;
    const node = document.createElement("div");
    node.className = "sf-damage-numbers-num";
    node.setAttribute("aria-hidden", "true");
    node.style.fontFamily = settings.font;
    node.style.fontSize = `${size}px`;
    node.style.color = tint;
    node.style.letterSpacing = crit ? "-0.01em" : "0";
    node.style.fontStyle = crit && settings.variant !== "minimal" ? "italic" : "normal";
    node.style.webkitTextStroke = `${Math.max(1.5, size * 0.055)}px ${mixHex(tint, "#000000", 0.82)}`;
    node.style.textShadow = crit ? `0 3px 0 ${mixHex(tint, "#000000", 0.6)}, 0 0 22px ${rgba(tint, 0.75)}` : `0 2px 0 rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.6)`;
    const text = kind === "miss" ? "MISS" : `${kind === "heal" ? "+" : ""}${Math.round(value).toLocaleString("en-US")}`;
    if (crit) {
      const tag = document.createElement("div");
      tag.textContent = settings.variant === "fantasy" ? "Critical" : "CRIT";
      tag.style.cssText = `font-size:${Math.round(size * 0.3)}px;letter-spacing:0.2em;text-align:center;margin-bottom:${size * 0.04}px;-webkit-text-stroke:1px ${mixHex(tint, "#000000", 0.8)};font-style:normal;text-transform:uppercase`;
      node.appendChild(tag);
    }
    node.appendChild(document.createTextNode(text));
    layer.appendChild(node);
    const w = node.offsetWidth;
    const h = node.offsetHeight;
    const ox = px - w / 2;
    const oy = py - h / 2;
    side.current *= -1;
    const drift = (side.current * (30 + Math.random() * 60) + (Math.random() - 0.5) * 30) * (crit ? 0.6 : 1);
    const rise = crit ? 90 : 70 + Math.random() * 30;
    const tilt = crit ? (Math.random() - 0.5) * 10 : 0;
    if (settings.reduced) {
      const fade = node.animate(
        [
          { transform: `translate(${ox}px, ${oy - 30}px)`, opacity: 1 },
          { transform: `translate(${ox}px, ${oy - 30}px)`, opacity: 1, offset: 0.7 },
          { transform: `translate(${ox}px, ${oy - 30}px)`, opacity: 0 },
        ],
        { duration: 900 },
      );
      fade.onfinish = () => node.remove();
    } else {
      const motion = node.animate(
        [
          { transform: `translate(${ox}px, ${oy}px) scale(${crit ? 2.3 : 0.4}) rotate(${tilt}deg)`, opacity: 0 },
          { transform: `translate(${ox + drift * 0.25}px, ${oy - rise * 0.6}px) scale(${crit ? 0.92 : 1.22}) rotate(${tilt}deg)`, opacity: 1, offset: 0.12 },
          { transform: `translate(${ox + drift * 0.55}px, ${oy - rise}px) scale(1) rotate(${tilt * 0.5}deg)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${ox + drift * 0.8}px, ${oy - rise * 0.92}px) scale(${crit ? 1 : 0.95})`, opacity: 1, offset: 0.7 },
          { transform: `translate(${ox + drift}px, ${oy - rise * 0.55}px) scale(0.8)`, opacity: 0 },
        ],
        { duration: crit ? 1300 : 1050, easing: "cubic-bezier(.2,.75,.35,1)" },
      );
      motion.onfinish = () => node.remove();
      // Knock the dummy back and flash it.
      const shove = crit ? 11 : 5;
      const dir = px < (targetRef.current ? targetRef.current.offsetLeft + targetRef.current.offsetWidth / 2 : bounds.width / 2) ? 1 : -1;
      bodyRef.current?.animate(
        [
          { transform: "rotate(0deg)", filter: "brightness(1)" },
          { transform: `rotate(${dir * shove}deg)`, filter: `brightness(${crit ? 2.2 : 1.6})`, offset: 0.12 },
          { transform: `rotate(${-dir * shove * 0.45}deg)`, filter: "brightness(1)", offset: 0.45 },
          { transform: `rotate(${dir * shove * 0.15}deg)`, offset: 0.75 },
          { transform: "rotate(0deg)" },
        ],
        { duration: crit ? 750 : 560, easing: "cubic-bezier(.3,.7,.4,1)" },
      );
      // Impact spark.
      const spark = document.createElement("div");
      spark.setAttribute("aria-hidden", "true");
      const sparkSize = crit ? 90 : 54;
      spark.style.cssText = `position:absolute;left:${px - sparkSize / 2}px;top:${py - sparkSize / 2}px;width:${sparkSize}px;height:${sparkSize}px;border-radius:50%;pointer-events:none;background:radial-gradient(circle, #fff 0 12%, ${rgba(tint, 0.8)} 22%, transparent 62%);mix-blend-mode:screen`;
      layer.appendChild(spark);
      const flash = spark.animate([{ transform: "scale(0.3)", opacity: 1 }, { transform: "scale(1.4)", opacity: 0 }], { duration: 320, easing: "ease-out" });
      flash.onfinish = () => spark.remove();
    }
  };

  const roll = (x?: number, y?: number) => {
    const settings = live.current;
    const crit = Math.random() < settings.critChance;
    const miss = !crit && Math.random() < 0.05;
    const base = settings.minDamage + Math.random() * Math.max(0, settings.maxDamage - settings.minDamage);
    const kind: DamageKind = crit ? "crit" : miss ? "miss" : "normal";
    const value = miss ? 0 : Math.round(base * (crit ? settings.critMultiplier : 1));
    spawn(value, kind, x, y);
    settings.onHit?.({ value, kind });
  };

  const spawnRef = useRef(spawn);
  spawnRef.current = spawn;
  const rollRef = useRef(roll);
  rollRef.current = roll;
  useImperativeHandle(ref, () => ({ spawn: (value, kind, x, y) => spawnRef.current(value, kind, x, y) }), []);

  useEffect(() => {
    if (!autoAttack || autoAttack <= 0 || !inView) return;
    const timer = window.setInterval(() => {
      if (document.hidden || performance.now() < pausedUntil.current) return;
      const target = targetRef.current;
      const root = rootRef.current;
      if (!target || !root) return;
      const b = root.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      rollRef.current(t.left - b.left + t.width * (0.3 + Math.random() * 0.4), t.top - b.top + t.height * (0.2 + Math.random() * 0.35));
    }, autoAttack * 1000);
    return () => window.clearInterval(timer);
  }, [autoAttack, inView]);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    pausedUntil.current = performance.now() + 2500;
    const bounds = rootRef.current?.getBoundingClientRect();
    if (!bounds || event.detail === 0) {
      roll();
      return;
    }
    roll(event.clientX - bounds.left, event.clientY - bounds.top);
  };

  const wood = variant === "sci-fi" ? ["#56636f", "#1b2229"] : variant === "minimal" ? ["#4a4a52", "#1c1c20"] : ["#8a5a32", "#3b2311"];
  const straw = variant === "sci-fi" ? ["#2a3642", "#0f151b"] : variant === "minimal" ? ["#3a3a42", "#1a1a1e"] : ["#d8b56a", "#8a6a2e"];
  const ring = variant === "sci-fi" ? "#58d5ff" : variant === "minimal" ? "#f4f4f5" : "#d9412f";

  return (
    <div ref={rootRef} className={className} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ["--sf-dn-crit" as string]: critColor, ...style }}>
      <style>{CSS}</style>
      <div aria-hidden style={{ position: "absolute", left: "50%", bottom: "8%", width: 420, height: 90, marginLeft: -210, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)" }} />
      <div aria-hidden style={{ position: "absolute", left: "50%", top: "-10%", width: 560, height: "120%", marginLeft: -280, background: `radial-gradient(ellipse at 50% 60%, ${rgba(variant === "sci-fi" ? "#58d5ff" : "#ffcf8a", 0.09)}, transparent 60%)` }} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <button
          ref={targetRef}
          type="button"
          className="sf-damage-numbers-target"
          aria-label="Strike the target"
          onClick={onClick}
          style={{ position: "relative", padding: 0, border: 0, background: "transparent", cursor: "crosshair", marginTop: 40 }}
        >
          {children ?? (showDummy ? (
            <div ref={bodyRef} style={{ transformOrigin: "50% 100%" }}>
              <svg viewBox="0 0 200 280" width={200} height={280} aria-hidden style={{ display: "block", overflow: "visible" }}>
                <defs>
                  <linearGradient id={`sf-dn-post-${variant}`} x1="0" x2="1">
                    <stop offset="0" stopColor={wood[0]} />
                    <stop offset="1" stopColor={wood[1]} />
                  </linearGradient>
                  <radialGradient id={`sf-dn-body-${variant}`} cx="0.4" cy="0.35" r="0.75">
                    <stop offset="0" stopColor={straw[0]} />
                    <stop offset="1" stopColor={straw[1]} />
                  </radialGradient>
                </defs>
                <rect x={92} y={120} width={16} height={160} rx={3} fill={`url(#sf-dn-post-${variant})`} />
                <rect x={60} y={268} width={80} height={10} rx={4} fill={wood[1]} />
                <rect x={18} y={92} width={164} height={14} rx={6} fill={`url(#sf-dn-post-${variant})`} />
                <circle cx={22} cy={99} r={10} fill={`url(#sf-dn-body-${variant})`} stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
                <circle cx={178} cy={99} r={10} fill={`url(#sf-dn-body-${variant})`} stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
                <path d="M56 86 Q100 70 144 86 L150 190 Q100 214 50 190 Z" fill={`url(#sf-dn-body-${variant})`} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                {variant === "fantasy"
                  ? [110, 140, 170].map(y => <path key={y} d={`M54 ${y} Q100 ${y + 10} 146 ${y}`} fill="none" stroke="#6b4a1c" strokeWidth={3} strokeLinecap="round" />)
                  : [110, 140, 170].map(y => <path key={y} d={`M54 ${y} Q100 ${y + 10} 146 ${y}`} fill="none" stroke={rgba(ring, 0.3)} strokeWidth={1.5} />)}
                <circle cx={100} cy={136} r={30} fill="none" stroke={ring} strokeWidth={5} opacity={0.9} />
                <circle cx={100} cy={136} r={17} fill="none" stroke="#f4ecdc" strokeWidth={5} opacity={0.85} />
                <circle cx={100} cy={136} r={7} fill={ring} />
                <circle cx={100} cy={52} r={30} fill={`url(#sf-dn-body-${variant})`} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                {variant === "sci-fi" ? <rect x={78} y={46} width={44} height={8} rx={4} fill={ring} opacity={0.85} /> : <path d="M84 48 L94 56 M94 48 L84 56 M106 48 L116 56 M116 48 L106 56" stroke="rgba(40,20,0,0.7)" strokeWidth={3} strokeLinecap="round" />}
              </svg>
            </div>
          ) : null)}
        </button>
      </div>
      <div ref={layerRef} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
    </div>
  );
}

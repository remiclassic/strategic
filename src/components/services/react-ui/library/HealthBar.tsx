"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { clamp, demoButtonStyle, gameTheme, mixHex, rgba, usePropState, type GameVariant } from "./_shared/gameKit";

export type HealthBarProps = {
  /** Current health. The bar animates whenever it changes. */
  value?: number;
  /** Maximum health. */
  max?: number;
  /** Current shield, drawn as a thin bar above health. 0 hides it. */
  shield?: number;
  /** Shield capacity (defaults to `max`). */
  maxShield?: number;
  /** Number of segments the bar is divided into (0 = none). */
  segments?: number;
  /** Visual style. */
  variant?: GameVariant;
  /** Health fill color. */
  color?: string;
  /** Color of the trailing "damage ghost". */
  ghostColor?: string;
  /** Color of the heal preview and glow. */
  healColor?: string;
  /** Shield bar color. */
  shieldColor?: string;
  /** Fraction of max (0-1) at which the low-health pulse starts. */
  lowThreshold?: number;
  /** Label above the bar. */
  label?: string;
  /** Show "current / max" numbers. */
  showValue?: boolean;
  /** Bar width in px. */
  width?: number;
  /** Bar height in px. */
  height?: number;
  /** Render built-in hit / heal / shield buttons for testing. */
  demo?: boolean;
  /** Called when the demo controls change health. */
  onChange?: (value: number) => void;
  /** Called when the demo controls change shield. */
  onShieldChange?: (shield: number) => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `
.sf-health-bar-fill.is-low { animation: sf-health-bar-low 1.05s cubic-bezier(.45,0,.55,1) infinite; }
.sf-health-bar-halo.is-low { animation: sf-health-bar-halo 1.05s cubic-bezier(.45,0,.55,1) infinite; }
@keyframes sf-health-bar-low { 0%,100% { filter: brightness(1) saturate(1); } 50% { filter: brightness(1.55) saturate(1.2); } }
@keyframes sf-health-bar-halo { 0%,100% { opacity: 0.15; } 50% { opacity: 1; } }
.sf-health-bar-btn { transition: transform .18s cubic-bezier(.2,.8,.2,1), filter .18s; }
.sf-health-bar-btn:hover { filter: brightness(1.35); transform: translateY(-1px); }
.sf-health-bar-btn:active { transform: translateY(1px); }
.sf-health-bar-btn:focus-visible { outline: 2px solid var(--sf-hb-accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .sf-health-bar-fill.is-low, .sf-health-bar-halo.is-low { animation: none; } }
`;

type Trend = "idle" | "damage" | "heal";

/** Tracks a value and exposes a delayed "ghost" copy that lingers after decreases. */
function useGhost(value: number, hold: number): { ghost: number; trend: Trend } {
  const [ghost, setGhost] = useState(value);
  const [trend, setTrend] = useState<Trend>("idle");
  const [previous, setPrevious] = useState(value);
  // Derive the trend during render so the very first frame of a change already uses the right transition.
  if (value !== previous) {
    setPrevious(value);
    if (value < previous) setTrend("damage");
    else {
      setTrend("heal");
      setGhost(value);
    }
  }
  useEffect(() => {
    if (trend !== "damage" || ghost <= value) return;
    const timer = window.setTimeout(() => setGhost(value), hold);
    return () => window.clearTimeout(timer);
  }, [value, trend, ghost, hold]);
  return { ghost: Math.max(ghost, value), trend };
}

export function HealthBar({
  value = 72,
  max = 100,
  shield = 30,
  maxShield,
  segments = 10,
  variant = "sci-fi",
  color = "#e8433f",
  ghostColor = "#ffd7a8",
  healColor = "#5ee88a",
  shieldColor = "#7fd6ff",
  lowThreshold = 0.25,
  label = "Health",
  showValue = true,
  width = 460,
  height = 20,
  demo = false,
  onChange,
  onShieldChange,
  className,
  style,
}: HealthBarProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const safeMax = Math.max(1, max);
  const shieldCap = Math.max(1, maxShield ?? max);
  const [hp, setHp] = usePropState(clamp(value, 0, safeMax));
  const [sh, setSh] = usePropState(clamp(shield, 0, shieldCap));
  const health = useGhost(hp, reduced ? 120 : 420);
  const armor = useGhost(sh, reduced ? 120 : 300);
  const frameRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lastHp = useRef(hp);
  const lastSh = useRef(sh);

  // One-shot feedback: shake + white flash on hit, green bloom on heal.
  useEffect(() => {
    const lost = lastHp.current - hp + (lastSh.current - sh);
    const gained = hp - lastHp.current;
    lastHp.current = hp;
    lastSh.current = sh;
    if (lost > 0) {
      const strength = clamp(lost / safeMax, 0.04, 0.5);
      if (!reduced) {
        const a = 2 + strength * 18;
        frameRef.current?.animate(
          [
            { transform: "translate(0,0)" },
            { transform: `translate(${-a}px, ${a * 0.35}px)` },
            { transform: `translate(${a * 0.8}px, ${-a * 0.25}px)` },
            { transform: `translate(${-a * 0.5}px, 0)` },
            { transform: `translate(${a * 0.25}px, 0)` },
            { transform: "translate(0,0)" },
          ],
          { duration: 360, easing: "cubic-bezier(.25,.8,.3,1)" },
        );
      }
      flashRef.current?.animate([{ opacity: 0.25 + strength * 1.4 }, { opacity: 0 }], { duration: reduced ? 120 : 380, easing: "ease-out" });
    } else if (gained > 0) {
      glowRef.current?.animate(
        [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }],
        { duration: reduced ? 200 : 1100, easing: "cubic-bezier(.3,0,.2,1)" },
      );
    }
  }, [hp, sh, safeMax, reduced]);

  const frac = hp / safeMax;
  const low = frac > 0 && frac <= lowThreshold;
  const light = mixHex(color, "#ffffff", 0.42);
  const deep = mixHex(color, "#000000", 0.5);
  const accent = variant === "fantasy" ? "#d4ae68" : variant === "minimal" ? "#ffffff" : shieldColor;
  const radius = variant === "minimal" ? height / 2 : variant === "fantasy" ? 3 : 0;
  const clip = variant === "sci-fi" ? `polygon(${height * 0.6}px 0, 100% 0, calc(100% - ${height * 0.6}px) 100%, 0 100%)` : undefined;
  const skew = variant === "sci-fi" ? "skewX(-31deg)" : undefined;

  const pct = (n: number, cap: number) => `${clamp((n / cap) * 100, 0, 100)}%`;
  const fillTransition = reduced ? "none" : health.trend === "heal" ? "width 900ms cubic-bezier(.22,1,.36,1)" : "width 110ms cubic-bezier(.2,.8,.2,1)";
  const ghostTransition = reduced ? "none" : health.trend === "heal" ? "none" : "width 700ms cubic-bezier(.6,0,.25,1)";
  const shieldTransition = reduced ? "none" : armor.trend === "heal" ? "width 700ms cubic-bezier(.22,1,.36,1)" : "width 110ms ease-out";

  const ticks = (count: number, tint: string) =>
    count > 1
      ? Array.from({ length: count - 1 }, (_, i) => (
          <span
            key={i}
            style={{ position: "absolute", top: -1, bottom: -1, left: `${((i + 1) / count) * 100}%`, width: 2, marginLeft: -1, background: tint, transform: skew, boxShadow: "1px 0 0 rgba(255,255,255,0.06)" }}
          />
        ))
      : null;

  const hit = (amount: number) => {
    let rest = amount;
    const absorbed = Math.min(sh, rest);
    rest -= absorbed;
    if (absorbed > 0) {
      setSh(sh - absorbed);
      onShieldChange?.(sh - absorbed);
    }
    if (rest > 0) {
      const next = Math.max(0, hp - rest);
      setHp(next);
      onChange?.(next);
    }
  };
  const heal = (amount: number) => {
    const next = Math.min(safeMax, hp + amount);
    setHp(next);
    onChange?.(next);
  };

  return (
    <div
      className={className}
      style={{ width, maxWidth: "100%", fontFamily: theme.font, color: theme.text, ["--sf-hb-accent" as string]: accent, ...style }}
    >
      <style>{CSS}</style>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8, padding: variant === "sci-fi" ? `0 ${height * 0.6}px 0 2px` : "0 2px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none", color: low ? mixHex(color, "#ffffff", 0.35) : theme.muted, transition: "color .3s" }}>
          <span aria-hidden style={{ width: 7, height: 7, background: low ? color : accent, transform: variant === "minimal" ? undefined : "rotate(45deg)", borderRadius: variant === "minimal" ? 4 : 0, boxShadow: `0 0 10px ${low ? color : accent}` }} />
          {label}
        </span>
        {showValue ? (
          <span style={{ fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", fontSize: 13, color: theme.muted, letterSpacing: "0.04em" }}>
            {sh > 0 ? <span style={{ color: shieldColor, marginRight: 10 }}>+{Math.round(sh)}</span> : null}
            <span style={{ fontSize: 20, fontWeight: 700, color: low ? mixHex(color, "#ffffff", 0.25) : theme.text }}>{Math.round(hp)}</span>
            <span style={{ opacity: 0.7 }}> / {Math.round(safeMax)}</span>
          </span>
        ) : null}
      </div>

      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={Math.round(hp)}
        aria-valuetext={`${Math.round(hp)} of ${Math.round(safeMax)}${sh > 0 ? `, shield ${Math.round(sh)}` : ""}`}
        ref={frameRef}
        style={{ position: "relative" }}
      >
        {shield > 0 || sh > 0 || armor.ghost > 0 ? (
          <div aria-hidden style={{ position: "relative", height: Math.max(4, Math.round(height * 0.28)), marginBottom: 4, marginRight: variant === "sci-fi" ? height * 0.35 : 0, clipPath: clip, borderRadius: radius, background: "rgba(0,0,0,0.55)", boxShadow: `inset 0 0 0 1px ${rgba(shieldColor, 0.18)}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: pct(armor.ghost, shieldCap), background: rgba("#ffffff", 0.7), transition: armor.trend === "heal" ? "none" : reduced ? "none" : "width 600ms cubic-bezier(.6,0,.25,1)" }} />
            <div style={{ position: "absolute", inset: 0, width: pct(sh, shieldCap), background: `linear-gradient(180deg, ${mixHex(shieldColor, "#ffffff", 0.5)}, ${shieldColor})`, boxShadow: `0 0 12px ${rgba(shieldColor, 0.8)}`, transition: shieldTransition }} />
            {ticks(segments, "rgba(0,0,0,0.6)")}
          </div>
        ) : null}

        <div aria-hidden className={`sf-health-bar-halo${low && !reduced ? " is-low" : ""}`} style={{ position: "absolute", left: -14, right: -14, bottom: -12, height: height + 24, borderRadius: 999, opacity: low ? 0.6 : 0, background: `radial-gradient(closest-side, ${rgba(color, 0.6)}, transparent)`, filter: "blur(8px)", pointerEvents: "none", transition: "opacity .4s" }} />
        <div style={{ position: "relative", height, clipPath: clip, borderRadius: radius, padding: variant === "fantasy" ? 2 : 1, background: variant === "fantasy" ? "linear-gradient(180deg, #f1d79a, #8a6428 55%, #c9a45c)" : variant === "minimal" ? "rgba(255,255,255,0.14)" : `linear-gradient(90deg, ${rgba(accent, 0.55)}, ${rgba(accent, 0.18)} 60%, ${rgba(accent, 0.4)})`, boxShadow: variant === "fantasy" ? "0 2px 10px rgba(0,0,0,0.6)" : undefined }}>
          <div style={{ position: "relative", height: "100%", overflow: "hidden", borderRadius: Math.max(0, radius - (variant === "fantasy" ? 2 : 1)), clipPath: clip, background: `linear-gradient(180deg, ${mixHex(color, "#000000", 0.86)}, ${mixHex(color, "#000000", 0.93)})`, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)" }}>
            <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pct(health.ghost, safeMax), background: health.trend === "heal" ? `linear-gradient(180deg, ${mixHex(healColor, "#ffffff", 0.4)}, ${healColor})` : `linear-gradient(180deg, ${ghostColor}, ${mixHex(ghostColor, color, 0.45)})`, boxShadow: health.trend === "heal" ? `0 0 14px ${healColor}` : undefined, transition: ghostTransition }} />
            <div
              aria-hidden
              className={`sf-health-bar-fill${low && !reduced ? " is-low" : ""}`}
              style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pct(hp, safeMax), background: `linear-gradient(180deg, ${light} 0%, ${color} 42%, ${deep} 100%)`, transition: fillTransition, boxShadow: `2px 0 10px ${rgba(color, 0.7)}` }}
            >
              <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: "38%", background: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.04))" }} />
              {variant === "sci-fi" ? <span style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 4px)" }} /> : null}
              <span style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 3, background: "rgba(255,255,255,0.75)", filter: "blur(1px)" }} />
            </div>
            <div aria-hidden ref={flashRef} style={{ position: "absolute", inset: 0, background: "#ffffff", opacity: 0, mixBlendMode: "screen" }} />
            <div aria-hidden style={{ position: "absolute", inset: 0 }}>{ticks(segments, "rgba(0,0,0,0.55)")}</div>
          </div>
        </div>
        <div aria-hidden ref={glowRef} style={{ position: "absolute", left: -4, right: -4, bottom: -4, height: height + 8, borderRadius: radius + 6, opacity: 0, boxShadow: `0 0 24px 3px ${rgba(healColor, 0.55)}`, pointerEvents: "none" }} />
        {variant === "fantasy" ? (
          <>
            <span aria-hidden style={{ position: "absolute", left: -7, bottom: height / 2 - 7, width: 14, height: 14, transform: "rotate(45deg)", background: "linear-gradient(135deg, #f7e2a8, #8a6428)", boxShadow: "0 0 0 2px #1a120b, 0 2px 6px rgba(0,0,0,0.6)" }} />
            <span aria-hidden style={{ position: "absolute", right: -7, bottom: height / 2 - 7, width: 14, height: 14, transform: "rotate(45deg)", background: "linear-gradient(135deg, #f7e2a8, #8a6428)", boxShadow: "0 0 0 2px #1a120b, 0 2px 6px rgba(0,0,0,0.6)" }} />
          </>
        ) : null}
      </div>

      {demo ? (
        <div style={{ display: "flex", gap: 8, marginTop: 22, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="sf-health-bar-btn" style={demoButtonStyle(theme, color)} onClick={() => hit(Math.round(safeMax * 0.09))}>Hit −{Math.round(safeMax * 0.09)}</button>
          <button type="button" className="sf-health-bar-btn" style={demoButtonStyle(theme, "#ff9d3d")} onClick={() => hit(Math.round(safeMax * 0.27))}>Crit −{Math.round(safeMax * 0.27)}</button>
          <button type="button" className="sf-health-bar-btn" style={demoButtonStyle(theme, healColor)} onClick={() => heal(Math.round(safeMax * 0.3))}>Heal +{Math.round(safeMax * 0.3)}</button>
          <button type="button" className="sf-health-bar-btn" style={demoButtonStyle(theme, shieldColor)} onClick={() => { const next = shieldCap * 0.5; setSh(Math.max(sh, next)); onShieldChange?.(Math.max(sh, next)); }}>Shield</button>
        </div>
      ) : null}
    </div>
  );
}

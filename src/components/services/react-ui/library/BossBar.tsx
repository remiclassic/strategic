"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { clamp, demoButtonStyle, gameTheme, mixHex, rgba, usePropState, type GameVariant } from "./_shared/gameKit";

export type BossBarProps = {
  /** Boss name. */
  name?: string;
  /** Epithet under the name ("" hides it). */
  title?: string;
  /** Current health. */
  value?: number;
  /** Maximum health. */
  max?: number;
  /** Phase thresholds as fractions of max, e.g. [0.66, 0.33]. */
  phases?: number[];
  /** Health fill color. */
  color?: string;
  /** Color of the lingering damage trail. */
  ghostColor?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Bar width in px. */
  width?: number;
  /** Show "current / max" and percent. */
  showNumbers?: boolean;
  /** Render built-in strike / reset buttons for testing. */
  demo?: boolean;
  /** Called when the demo buttons change health. */
  onChange?: (value: number) => void;
  /** Called when the boss enters a new phase (1-based). */
  onPhase?: (phase: number) => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `
.sf-boss-bar-enrage { animation: sf-boss-bar-embers 1.4s linear infinite; }
@keyframes sf-boss-bar-embers { to { background-position: 48px 0; } }
.sf-boss-bar-btn { transition: transform .18s cubic-bezier(.2,.8,.2,1), filter .18s; }
.sf-boss-bar-btn:hover { filter: brightness(1.35); transform: translateY(-1px); }
.sf-boss-bar-btn:active { transform: translateY(1px); }
.sf-boss-bar-btn:focus-visible { outline: 2px solid var(--sf-bb-color); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .sf-boss-bar-enrage { animation: none; } }
`;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export function BossBar({
  name = "Vaethra",
  title = "The Ashen Matriarch",
  value = 8400,
  max = 12000,
  phases = [0.66, 0.33],
  color = "#d8342c",
  ghostColor = "#f3c47a",
  variant = "fantasy",
  width = 760,
  showNumbers = true,
  demo = false,
  onChange,
  onPhase,
  className,
  style,
}: BossBarProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const safeMax = Math.max(1, max);
  const [hp, setHp] = usePropState(clamp(value, 0, safeMax));
  const [ghost, setGhost] = useState(hp);
  const [previous, setPrevious] = useState(hp);
  const trackRef = useRef<HTMLDivElement>(null);
  const chunkRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const lastHp = useRef(hp);
  const thresholds = [...phases].filter(p => p > 0 && p < 1).sort((a, b) => b - a);
  const frac = hp / safeMax;
  const phase = 1 + thresholds.filter(t => frac <= t).length;
  const lastPhase = useRef(phase);

  if (hp !== previous) {
    setPrevious(hp);
    if (hp > previous) setGhost(hp);
  }

  useEffect(() => {
    if (ghost <= hp) return;
    const timer = window.setTimeout(() => setGhost(hp), reduced ? 80 : 650);
    return () => window.clearTimeout(timer);
  }, [hp, ghost, reduced]);

  // Chunks break off the bar on each hit; phase changes announce themselves.
  useEffect(() => {
    const before = lastHp.current;
    lastHp.current = hp;
    const track = trackRef.current;
    const layer = chunkRef.current;
    if (hp < before && track && layer && !reduced) {
      const trackW = track.clientWidth;
      const from = (hp / safeMax) * trackW;
      const to = (before / safeMax) * trackW;
      const pieces = clamp(Math.round((to - from) / 18), 1, 6);
      const each = (to - from) / pieces;
      for (let i = 0; i < pieces; i++) {
        const node = document.createElement("div");
        node.setAttribute("aria-hidden", "true");
        node.style.cssText = `position:absolute;top:0;height:100%;left:${from + each * i}px;width:${Math.max(2, each - 1)}px;background:linear-gradient(180deg,#fff,${mixHex(color, "#ffffff", 0.35)} 40%,${color});box-shadow:0 0 10px ${rgba(color, 0.8)};pointer-events:none`;
        layer.appendChild(node);
        const spin = (Math.random() - 0.5) * 50;
        const drop = 18 + Math.random() * 30;
        const drift = (Math.random() - 0.3) * 24;
        const anim = node.animate(
          [
            { transform: "translate(0,0) rotate(0deg)", opacity: 1, filter: "brightness(2)" },
            { transform: `translate(${drift * 0.3}px, ${-4 - Math.random() * 6}px) rotate(${spin * 0.3}deg)`, opacity: 1, filter: "brightness(1.2)", offset: 0.2 },
            { transform: `translate(${drift}px, ${drop}px) rotate(${spin}deg) scale(0.7)`, opacity: 0, filter: "brightness(0.8)" },
          ],
          { duration: 650 + Math.random() * 250, delay: i * 25, easing: "cubic-bezier(.3,.1,.6,1)", fill: "backwards" },
        );
        anim.onfinish = () => node.remove();
      }
      frameRef.current?.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(2px)" }, { transform: "translateY(-1px)" }, { transform: "translateY(0)" }],
        { duration: 220, easing: "ease-out" },
      );
    }
    if (hp < before) flashRef.current?.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: reduced ? 100 : 260, easing: "ease-out" });
    if (phase !== lastPhase.current) {
      const increased = phase > lastPhase.current;
      lastPhase.current = phase;
      if (increased) {
        onPhase?.(phase);
        bannerRef.current?.animate(
          reduced
            ? [{ opacity: 1 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]
            : [
                { opacity: 0, transform: "translate(-50%, 0) scale(1.6)", filter: "blur(6px)" },
                { opacity: 1, transform: "translate(-50%, 0) scale(1)", filter: "blur(0)", offset: 0.15 },
                { opacity: 1, transform: "translate(-50%, 0) scale(1)", offset: 0.8 },
                { opacity: 0, transform: "translate(-50%, 4px) scale(1)" },
              ],
          { duration: 1900, easing: "cubic-bezier(.2,.8,.3,1)" },
        );
      }
    }
    // onPhase is a callback; only value changes should drive this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hp]);

  const strike = (fraction: number) => {
    const next = Math.max(0, hp - safeMax * fraction * (0.85 + Math.random() * 0.3));
    setHp(next);
    onChange?.(next);
  };
  const reset = () => {
    setHp(safeMax);
    onChange?.(safeMax);
  };

  const pct = (n: number) => `${clamp((n / safeMax) * 100, 0, 100)}%`;
  const enraged = thresholds.length > 0 && frac <= thresholds[thresholds.length - 1] && hp > 0;
  const trim = variant === "fantasy" ? "#d4ae68" : variant === "minimal" ? "rgba(255,255,255,0.3)" : mixHex(color, "#ffffff", 0.2);
  const barH = 16;
  const shape = variant === "sci-fi" ? `polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)` : undefined;
  const radius = variant === "minimal" ? barH / 2 : 2;
  const light = mixHex(color, "#ffffff", 0.35);
  const deep = mixHex(color, "#000000", 0.55);

  return (
    <div className={className} style={{ width, maxWidth: "100%", fontFamily: theme.font, color: theme.text, ["--sf-bb-color" as string]: color, ...style }}>
      <style>{CSS}</style>
      {/* Name plate */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: title ? 2 : 10 }}>
        <span aria-hidden style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${rgba(variant === "fantasy" ? "#d4ae68" : color, 0.7)})` }} />
        <span aria-hidden style={{ width: 6, height: 6, transform: "rotate(45deg)", background: trim }} />
        <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: variant === "minimal" ? "0.02em" : "0.18em", textTransform: theme.caps ? "uppercase" : "none", color: "#fbf1e0", textShadow: `0 0 24px ${rgba(color, 0.55)}, 0 2px 0 rgba(0,0,0,0.6)`, whiteSpace: "nowrap" }}>{name}</span>
        <span aria-hidden style={{ width: 6, height: 6, transform: "rotate(45deg)", background: trim }} />
        <span aria-hidden style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${rgba(variant === "fantasy" ? "#d4ae68" : color, 0.7)})` }} />
      </div>
      {title ? <div style={{ textAlign: "center", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.muted, marginBottom: 16 }}>{title}</div> : null}

      {/* Bar */}
      <div ref={frameRef} style={{ position: "relative" }}>
        {thresholds.map((t, i) => {
          const passed = frac <= t;
          return (
            <span
              key={t}
              aria-hidden
              title={`Phase ${ROMAN[i + 1]}`}
              style={{ position: "absolute", left: `${t * 100}%`, top: -9, width: 10, height: 10, marginLeft: -5, transform: "rotate(45deg)", zIndex: 2, background: passed ? `linear-gradient(135deg, ${light}, ${color})` : "linear-gradient(135deg, #3a2e22, #15100c)", border: `1px solid ${passed ? mixHex(color, "#ffffff", 0.5) : trim}`, boxShadow: passed ? `0 0 12px ${color}` : "0 2px 4px rgba(0,0,0,0.6)", transition: "all .4s" }}
            />
          );
        })}
        <div style={{ position: "relative", height: barH + 4, padding: 2, boxSizing: "border-box", clipPath: shape, borderRadius: radius + 2, background: variant === "fantasy" ? "linear-gradient(180deg, #f1d79a, #7a5520 55%, #c9a45c)" : variant === "minimal" ? "rgba(255,255,255,0.14)" : `linear-gradient(180deg, ${rgba(color, 0.7)}, ${rgba(color, 0.25)})`, boxShadow: "0 10px 30px rgba(0,0,0,0.55)" }}>
          <div
            ref={trackRef}
            role="meter"
            aria-label={`${name} health`}
            aria-valuemin={0}
            aria-valuemax={safeMax}
            aria-valuenow={Math.round(hp)}
            aria-valuetext={`${Math.round(frac * 100)}%, phase ${phase}`}
            style={{ position: "relative", height: "100%", overflow: "hidden", clipPath: shape, borderRadius: radius, background: `linear-gradient(180deg, ${mixHex(color, "#000000", 0.9)}, ${mixHex(color, "#000000", 0.8)})` }}
          >
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pct(Math.max(ghost, hp)), background: `linear-gradient(180deg, ${mixHex(ghostColor, "#ffffff", 0.3)}, ${ghostColor})`, transition: reduced || ghost <= hp ? "none" : "width 800ms cubic-bezier(.6,0,.25,1)" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pct(hp), background: `linear-gradient(180deg, ${light}, ${color} 45%, ${deep})`, transition: reduced ? "none" : "width 90ms ease-out" }}>
              <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: "40%", background: "linear-gradient(180deg, rgba(255,255,255,0.3), transparent)" }} />
              {enraged ? (
                <span className="sf-boss-bar-enrage" style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(115deg, transparent 0 18px, ${rgba("#ffd08a", 0.13)} 18px 21px, transparent 21px 24px)`, backgroundSize: "48px 100%" }} />
              ) : null}
            </div>
            {thresholds.map(t => (
              <span key={t} aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: `${t * 100}%`, width: 2, marginLeft: -1, background: "rgba(0,0,0,0.75)", boxShadow: "1px 0 0 rgba(255,255,255,0.12)" }} />
            ))}
            <div ref={flashRef} aria-hidden style={{ position: "absolute", inset: 0, background: "#fff", opacity: 0 }} />
          </div>
        </div>
        <div ref={chunkRef} aria-hidden style={{ position: "absolute", left: 2, right: 2, top: 2, height: barH, pointerEvents: "none" }} />
        {variant === "fantasy" ? (
          <>
            <span aria-hidden style={{ position: "absolute", left: -10, top: -3, width: 20, height: 20, transform: "rotate(45deg) scale(.8)", background: "linear-gradient(135deg, #f7e2a8, #8a6428)", boxShadow: "0 0 0 3px #150f0a, 0 3px 8px rgba(0,0,0,0.6)" }} />
            <span aria-hidden style={{ position: "absolute", right: -10, top: -3, width: 20, height: 20, transform: "rotate(45deg) scale(.8)", background: "linear-gradient(135deg, #f7e2a8, #8a6428)", boxShadow: "0 0 0 3px #150f0a, 0 3px 8px rgba(0,0,0,0.6)" }} />
          </>
        ) : null}
        <div
          ref={bannerRef}
          aria-live="polite"
          style={{ position: "absolute", left: "50%", top: 34, transform: "translate(-50%, 0)", opacity: 0, whiteSpace: "nowrap", fontSize: 18, fontWeight: 800, letterSpacing: "0.4em", textTransform: "uppercase", color: light, textShadow: `0 0 18px ${rgba(color, 0.9)}`, pointerEvents: "none" }}
        >
          Phase {ROMAN[phase - 1] ?? phase}
        </div>
      </div>

      {showNumbers ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: theme.numeric, fontSize: 12, color: theme.muted, letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontFamily: theme.font, textTransform: "uppercase", letterSpacing: "0.2em", color: enraged ? light : theme.muted }}>
            Phase {ROMAN[phase - 1] ?? phase}
            {enraged ? " · Enraged" : ""}
          </span>
          <span>
            {Math.round(hp).toLocaleString("en-US")} / {safeMax.toLocaleString("en-US")} <span style={{ color: theme.text, marginLeft: 8 }}>{Math.ceil(frac * 100)}%</span>
          </span>
        </div>
      ) : null}

      {demo ? (
        <div style={{ display: "flex", gap: 8, marginTop: 44, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="sf-boss-bar-btn" style={demoButtonStyle(theme, color)} onClick={() => strike(0.035)}>Strike</button>
          <button type="button" className="sf-boss-bar-btn" style={demoButtonStyle(theme, "#ff9d3d")} onClick={() => strike(0.11)}>Heavy blow</button>
          <button type="button" className="sf-boss-bar-btn" style={demoButtonStyle(theme, "#b8b3aa")} onClick={reset}>Reset</button>
        </div>
      ) : null}
    </div>
  );
}

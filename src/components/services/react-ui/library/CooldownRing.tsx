"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAnimationFrame, useReducedMotion } from "./_shared/hooks";
import { GameGlyph, gameTheme, isTypingTarget, mixHex, rgba, type GameVariant, type GlyphName } from "./_shared/gameKit";

export type CooldownRingProps = {
  /** Cooldown length in seconds. */
  cooldown?: number;
  /** Built-in glyph shown when no custom `icon` is given. */
  glyph?: GlyphName;
  /** Custom icon (img, svg…) rendered inside the button. */
  icon?: ReactNode;
  /** Key shown on the badge; pressing it triggers the ability when `hotkey` is on. */
  keybind?: string;
  /** Ability name under the button ("" hides it). */
  label?: string;
  /** Accent color for the ring, glyph and ready flash. */
  color?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Button diameter in px. */
  size?: number;
  /** Listen for the keybind on the window (ignored while typing in fields). */
  hotkey?: boolean;
  /** Disable the ability (e.g. not enough mana). */
  disabled?: boolean;
  /** Called when the ability fires. */
  onTrigger?: () => void;
  /** Called when the cooldown finishes. */
  onReady?: () => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `
.sf-cooldown-ring-btn { transition: transform .22s cubic-bezier(.2,.9,.3,1.3), filter .22s; }
.sf-cooldown-ring-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.03); }
.sf-cooldown-ring-btn:active:not(:disabled) { transform: scale(.95); transition-duration: .06s; }
.sf-cooldown-ring-btn:focus-visible { outline: none; }
.sf-cooldown-ring-btn:focus-visible .sf-cooldown-ring-focus { opacity: 1; }
.sf-cooldown-ring-btn:hover:not(:disabled) .sf-cooldown-ring-halo { opacity: .9; }
.sf-cooldown-ring-btn:hover:not(:disabled) .sf-cooldown-ring-icon { filter: brightness(1.2) drop-shadow(0 0 10px var(--sf-cr-glow)); }
.sf-cooldown-ring-idle { animation: sf-cooldown-ring-breathe 3.2s ease-in-out infinite; }
@keyframes sf-cooldown-ring-breathe { 0%,100% { opacity: .45; } 50% { opacity: .8; } }
@media (prefers-reduced-motion: reduce) { .sf-cooldown-ring-idle { animation: none; } .sf-cooldown-ring-btn { transition: none; } }
`;

export function CooldownRing({
  cooldown = 6,
  glyph = "flame",
  icon,
  keybind = "Q",
  label = "Flame Lance",
  color = "#ff7a3d",
  variant = "sci-fi",
  size = 128,
  hotkey = true,
  disabled = false,
  onTrigger,
  onReady,
  className,
  style,
}: CooldownRingProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const [cooling, setCooling] = useState(false);
  const started = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const live = useRef({ cooldown, onReady, onTrigger, disabled, cooling });
  live.current = { cooldown, onReady, onTrigger, disabled, cooling };

  const r = size / 2;
  const ringR = r - 5;
  const circumference = 2 * Math.PI * ringR;
  const inner = size * 0.74;

  const paint = (progress: number, seconds: number) => {
    const deg = progress * 360;
    sweepRef.current?.style.setProperty("--sf-cr-p", `${deg}deg`);
    if (edgeRef.current) edgeRef.current.style.transform = `rotate(${deg}deg)`;
    if (arcRef.current) arcRef.current.style.strokeDashoffset = `${circumference * (1 - progress)}`;
    if (textRef.current) textRef.current.textContent = seconds < 1 ? seconds.toFixed(1) : String(Math.ceil(seconds));
  };

  useAnimationFrame(() => {
    if (!live.current.cooling) return;
    const total = Math.max(0.1, live.current.cooldown);
    const elapsed = (performance.now() - started.current) / 1000;
    const progress = Math.min(1, elapsed / total);
    paint(progress, Math.max(0, total - elapsed));
    if (progress >= 1) {
      live.current.cooling = false;
      setCooling(false);
      live.current.onReady?.();
      flashRef.current?.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: reduced ? 150 : 650, easing: "cubic-bezier(.2,.7,.3,1)" });
      if (!reduced) {
        burstRef.current?.animate(
          [{ transform: "scale(.82)", opacity: 1 }, { transform: "scale(1.55)", opacity: 0 }],
          { duration: 700, easing: "cubic-bezier(.15,.8,.3,1)" },
        );
      }
    }
  }, cooling);

  const trigger = () => {
    if (live.current.disabled) return;
    if (live.current.cooling) {
      if (!reduced) {
        buttonRef.current?.animate(
          [{ translate: "0 0" }, { translate: "-4px 0" }, { translate: "4px 0" }, { translate: "-2px 0" }, { translate: "0 0" }],
          { duration: 260, easing: "ease-out" },
        );
      }
      return;
    }
    started.current = performance.now();
    paint(0, live.current.cooldown);
    live.current.cooling = true;
    setCooling(true);
    live.current.onTrigger?.();
  };
  const triggerRef = useRef(trigger);
  triggerRef.current = trigger;

  useEffect(() => {
    if (!hotkey || !keybind) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      if (event.key.toLowerCase() !== keybind.toLowerCase()) return;
      triggerRef.current();
      buttonRef.current?.animate([{ scale: "0.94" }, { scale: "1" }], { duration: 180, easing: "cubic-bezier(.2,.9,.3,1.4)" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey, keybind]);

  const light = mixHex(color, "#ffffff", 0.5);
  const trim = variant === "fantasy" ? "#d4ae68" : variant === "minimal" ? "rgba(255,255,255,0.5)" : color;
  const tickCount = variant === "sci-fi" ? 36 : 0;

  return (
    <div className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 14, fontFamily: theme.font, ["--sf-cr-glow" as string]: rgba(color, 0.8), ...style }}>
      <style>{CSS}</style>
      <button
        ref={buttonRef}
        type="button"
        className="sf-cooldown-ring-btn"
        disabled={disabled}
        onClick={trigger}
        aria-label={`${label || "Ability"}${keybind ? ` (${keybind})` : ""}${cooling ? ", on cooldown" : ", ready"}`}
        style={{ position: "relative", width: size, height: size, padding: 0, border: 0, background: "transparent", cursor: disabled ? "not-allowed" : "pointer", filter: disabled ? "grayscale(0.9) brightness(0.6)" : undefined }}
      >
        <div aria-hidden className={`sf-cooldown-ring-halo${cooling || disabled ? "" : " sf-cooldown-ring-idle"}`} style={{ position: "absolute", inset: -size * 0.14, borderRadius: "50%", background: `radial-gradient(closest-side, ${rgba(color, cooling ? 0.08 : 0.32)}, transparent)`, opacity: cooling ? 0.3 : 0.55, transition: "opacity .4s" }} />
        <svg aria-hidden width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id={`sf-cr-bezel-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={variant === "fantasy" ? "#f5dc9c" : "#3a4652"} />
              <stop offset="0.5" stopColor={variant === "fantasy" ? "#8a6428" : "#141b22"} />
              <stop offset="1" stopColor={variant === "fantasy" ? "#e2c07a" : "#2a333c"} />
            </linearGradient>
          </defs>
          <circle cx={r} cy={r} r={r - 1} fill="#07090b" stroke={`url(#sf-cr-bezel-${variant})`} strokeWidth={variant === "fantasy" ? 3 : 1.5} />
          {Array.from({ length: tickCount }, (_, i) => {
            const a = (i / tickCount) * Math.PI * 2;
            const long = i % 3 === 0;
            return <line key={i} x1={r + Math.sin(a) * (r - 3)} y1={r - Math.cos(a) * (r - 3)} x2={r + Math.sin(a) * (r - (long ? 8 : 6))} y2={r - Math.cos(a) * (r - (long ? 8 : 6))} stroke={rgba(color, long ? 0.5 : 0.22)} strokeWidth={1} />;
          })}
          <circle cx={r} cy={r} r={ringR} fill="none" stroke={rgba(color, 0.14)} strokeWidth={3} />
          <circle
            ref={arcRef}
            cx={r}
            cy={r}
            r={ringR}
            fill="none"
            stroke={cooling ? mixHex(color, "#ffffff", 0.15) : trim}
            strokeWidth={3}
            strokeLinecap={variant === "minimal" ? "round" : "butt"}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            transform={`rotate(-90 ${r} ${r})`}
            style={{ filter: `drop-shadow(0 0 4px ${rgba(color, 0.9)})`, opacity: cooling ? 0.95 : variant === "sci-fi" ? 0.9 : 0.75 }}
          />
        </svg>
        <div
          aria-hidden
          style={{ position: "absolute", left: (size - inner) / 2, top: (size - inner) / 2, width: inner, height: inner, overflow: "hidden", borderRadius: "50%", background: `radial-gradient(circle at 50% 35%, ${mixHex(color, "#1a1a1a", 0.55)}, ${mixHex(color, "#050505", 0.86)} 70%)`, boxShadow: `inset 0 0 0 1px ${rgba(light, 0.25)}, inset 0 -10px 24px rgba(0,0,0,0.6), inset 0 6px 16px ${rgba(color, 0.25)}` }}
        >
          <div className="sf-cooldown-ring-icon" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", transition: "filter .25s", filter: cooling ? "grayscale(0.7) brightness(0.55)" : `drop-shadow(0 0 8px ${rgba(color, 0.55)})` }}>
            {icon ?? <GameGlyph name={glyph} color={light} size={inner * 0.56} />}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.18), transparent 42%)" }} />
          <div
            ref={sweepRef}
            style={{ position: "absolute", inset: 0, opacity: cooling ? 1 : 0, background: "conic-gradient(from 0deg, transparent 0deg var(--sf-cr-p, 0deg), rgba(4,6,8,0.74) var(--sf-cr-p, 0deg) 360deg)" }}
          />
          <div ref={edgeRef} style={{ position: "absolute", left: "50%", top: 0, width: 2, height: "50%", marginLeft: -1, transformOrigin: "50% 100%", opacity: cooling ? 1 : 0, background: `linear-gradient(0deg, transparent, ${light})`, boxShadow: `0 0 8px ${color}` }} />
          <span ref={textRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: cooling ? 1 : 0, fontFamily: theme.numeric, fontWeight: 700, fontSize: inner * 0.34, color: "#fff", textShadow: `0 0 12px ${rgba(color, 0.9)}, 0 2px 3px rgba(0,0,0,0.9)`, fontVariantNumeric: "tabular-nums" }} />
          <div ref={flashRef} style={{ position: "absolute", inset: 0, opacity: 0, background: `radial-gradient(circle, #ffffff, ${rgba(color, 0.6)} 55%, transparent 75%)` }} />
        </div>
        <div aria-hidden ref={burstRef} style={{ position: "absolute", inset: 0, borderRadius: "50%", opacity: 0, border: `2px solid ${light}`, boxShadow: `0 0 18px ${color}, inset 0 0 18px ${rgba(color, 0.6)}` }} />
        <div aria-hidden className="sf-cooldown-ring-focus" style={{ position: "absolute", inset: -5, borderRadius: "50%", border: `2px solid ${light}`, opacity: 0, transition: "opacity .15s" }} />
        {keybind ? (
          <span
            aria-hidden
            style={{ position: "absolute", right: -2, bottom: -2, minWidth: size * 0.26, height: size * 0.26, padding: "0 5px", boxSizing: "border-box", display: "grid", placeItems: "center", fontFamily: theme.numeric, fontWeight: 700, fontSize: Math.max(10, size * 0.13), color: variant === "fantasy" ? "#2a1b0c" : theme.text, background: variant === "fantasy" ? "linear-gradient(180deg, #f5dc9c, #b88a3e)" : "linear-gradient(180deg, #25303a, #0c1116)", border: `1px solid ${variant === "fantasy" ? "#fff0c4" : rgba(color, 0.55)}`, borderRadius: variant === "minimal" ? 6 : variant === "fantasy" ? "50%" : 2, clipPath: theme.clip(4), boxShadow: "0 3px 8px rgba(0,0,0,0.7)" }}
          >
            {keybind.toUpperCase()}
          </span>
        ) : null}
      </button>
      {label ? (
        <div style={{ textAlign: "center", lineHeight: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none" }}>{label}</div>
          <div aria-live="polite" style={{ marginTop: 4, fontSize: 11, color: cooling ? theme.muted : mixHex(color, "#ffffff", 0.3), letterSpacing: "0.08em", textTransform: theme.caps ? "uppercase" : "none", transition: "color .3s" }}>
            {disabled ? "Unavailable" : cooling ? `Recharging · ${cooldown}s` : "Ready"}
          </div>
        </div>
      ) : null}
    </div>
  );
}

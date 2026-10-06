"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAnimationFrame, useReducedMotion } from "./_shared/hooks";
import { demoButtonStyle, gameTheme, mixHex, rgba, usePropState, type GameVariant } from "./_shared/gameKit";

export type XpBarProps = {
  /** Current level. Raising it (or overflowing `value`) plays the level-up sequence. */
  level?: number;
  /** Experience earned inside the current level. */
  value?: number;
  /** Experience needed to finish the level. */
  max?: number;
  /** Fill color. */
  color?: string;
  /** Color of the level-up burst and banner. */
  burstColor?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Label above the bar. */
  label?: string;
  /** Total width in px. */
  width?: number;
  /** Fill speed multiplier. */
  speed?: number;
  /** Render built-in "+XP" buttons for testing. */
  demo?: boolean;
  /** Called for every level gained. */
  onLevelUp?: (level: number) => void;
  /** Called when the demo buttons change progress. */
  onChange?: (state: { level: number; value: number }) => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `
.sf-xp-bar-shimmer { animation: sf-xp-bar-shimmer 2.6s cubic-bezier(.4,0,.2,1) infinite; }
@keyframes sf-xp-bar-shimmer { 0% { transform: translateX(-120%); } 60%, 100% { transform: translateX(420%); } }
.sf-xp-bar-btn { transition: transform .18s cubic-bezier(.2,.8,.2,1), filter .18s; }
.sf-xp-bar-btn:hover { filter: brightness(1.35); transform: translateY(-1px); }
.sf-xp-bar-btn:active { transform: translateY(1px); }
.sf-xp-bar-btn:focus-visible { outline: 2px solid var(--sf-xp-color); outline-offset: 2px; }
@keyframes sf-xp-bar-roll { 0% { transform: translateY(26px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .sf-xp-bar-shimmer { animation: none; opacity: 0; } }
`;

const SPARKS = 14;

export function XpBar({
  level = 11,
  value = 640,
  max = 1000,
  color = "#9b7bff",
  burstColor = "#ffcf5a",
  variant = "sci-fi",
  label = "Experience",
  width = 540,
  speed = 1,
  demo = false,
  onLevelUp,
  onChange,
  className,
  style,
}: XpBarProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const safeMax = Math.max(1, max);
  const [target, setTarget] = usePropState({ level: Math.max(0, Math.floor(level)), value: Math.max(0, value) }, t => `${t.level}:${t.value}`);
  const goal = target.level + Math.min(target.value, safeMax - 0.0001) / safeMax;
  const [shownLevel, setShownLevel] = useState(target.level);
  const shown = useRef(goal);
  const hold = useRef(0);
  const [moving, setMoving] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const gainRef = useRef<HTMLDivElement>(null);
  const live = useRef({ goal, safeMax, speed, onLevelUp });
  live.current = { goal, safeMax, speed, onLevelUp };

  const paint = (position: number) => {
    const frac = position - Math.floor(position);
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${frac})`;
    if (tipRef.current) tipRef.current.style.left = `${frac * 100}%`;
    if (numberRef.current) numberRef.current.textContent = Math.floor(frac * live.current.safeMax + 0.0001).toLocaleString("en-US");
  };

  const celebrate = (reached: number) => {
    setShownLevel(reached);
    live.current.onLevelUp?.(reached);
    flashRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 150 : 700, easing: "ease-out" });
    if (reduced) return;
    ringRef.current?.animate([{ transform: "scale(0.6)", opacity: 1 }, { transform: "scale(2.6)", opacity: 0 }], { duration: 900, easing: "cubic-bezier(.1,.8,.3,1)" });
    badgeRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.28)", offset: 0.25 }, { transform: "scale(1)" }], { duration: 650, easing: "cubic-bezier(.2,.9,.3,1.3)" });
    bannerRef.current?.animate(
      [
        { opacity: 0, transform: "translate(-50%, 8px) scale(0.7)", letterSpacing: "0.9em" },
        { opacity: 1, transform: "translate(-50%, 0) scale(1.06)", letterSpacing: "0.34em", offset: 0.18 },
        { opacity: 1, transform: "translate(-50%, 0) scale(1)", letterSpacing: "0.3em", offset: 0.75 },
        { opacity: 0, transform: "translate(-50%, -10px) scale(1)", letterSpacing: "0.3em" },
      ],
      { duration: 1700, easing: "cubic-bezier(.2,.8,.3,1)" },
    );
    const sparks = sparksRef.current?.children;
    if (sparks) {
      Array.from(sparks).forEach((node, i) => {
        const angle = (i / SPARKS) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 38 + Math.random() * 34;
        (node as HTMLElement).animate(
          [
            { transform: `rotate(${angle}rad) translateX(10px) scaleX(0.4)`, opacity: 1 },
            { transform: `rotate(${angle}rad) translateX(${dist}px) scaleX(1)`, opacity: 0 },
          ],
          { duration: 620 + Math.random() * 300, easing: "cubic-bezier(.1,.8,.3,1)" },
        );
      });
    }
  };

  useEffect(() => {
    // Snap to the goal on first paint; animate afterwards.
    paint(shown.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Math.abs(goal - shown.current) < 1e-6) return;
    if (reduced) {
      const before = Math.floor(shown.current);
      shown.current = goal;
      paint(goal);
      if (Math.floor(goal) > before) celebrate(Math.floor(goal));
      else setShownLevel(Math.floor(goal));
      return;
    }
    if (goal < shown.current) {
      // Going backwards (level reset / XP loss): snap without celebrating.
      shown.current = goal;
      setShownLevel(Math.floor(goal));
      paint(goal);
      return;
    }
    setMoving(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, reduced]);

  useAnimationFrame(delta => {
    if (hold.current > 0) {
      hold.current -= delta;
      return;
    }
    const { goal: aim, speed: rate } = live.current;
    const current = shown.current;
    const remaining = aim - current;
    if (remaining <= 1e-4) {
      shown.current = aim;
      paint(aim);
      setMoving(false);
      return;
    }
    const step = Math.max(remaining * (1 - Math.exp(-delta * 3.2 * rate)), delta * 0.12 * rate);
    let next = Math.min(aim, current + step);
    const boundary = Math.floor(current) + 1;
    if (next >= boundary) {
      next = boundary;
      shown.current = next - 1e-6;
      paint(shown.current);
      shown.current = boundary;
      hold.current = 0.55;
      celebrate(boundary);
      return;
    }
    shown.current = next;
    paint(next);
  }, moving);

  const gain = (amount: number) => {
    let nextLevel = target.level;
    let nextValue = target.value + amount;
    while (nextValue >= safeMax) {
      nextValue -= safeMax;
      nextLevel += 1;
    }
    setTarget({ level: nextLevel, value: nextValue });
    onChange?.({ level: nextLevel, value: nextValue });
    if (gainRef.current && !reduced) {
      gainRef.current.textContent = `+${amount.toLocaleString("en-US")} XP`;
      gainRef.current.animate(
        [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)", offset: 0.15 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: "translateY(-14px)" }],
        { duration: 1500, easing: "cubic-bezier(.2,.8,.3,1)" },
      );
    }
  };

  const light = mixHex(color, "#ffffff", 0.45);
  const deep = mixHex(color, "#000000", 0.45);
  const badge = 64;
  const radius = variant === "minimal" ? 6 : 0;
  const trim = variant === "fantasy" ? "#d4ae68" : variant === "minimal" ? "rgba(255,255,255,0.18)" : rgba(color, 0.6);
  const badgeClip = variant === "sci-fi" ? "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" : undefined;

  return (
    <div className={className} style={{ width, maxWidth: "100%", fontFamily: theme.font, color: theme.text, ["--sf-xp-color" as string]: color, ...style }}>
      <style>{CSS}</style>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 }}>
        {/* Level badge */}
        <div style={{ position: "relative", width: badge, height: badge, flex: "none" }}>
          <div aria-hidden ref={ringRef} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${burstColor}`, boxShadow: `0 0 24px ${burstColor}`, opacity: 0 }} />
          <div aria-hidden ref={sparksRef} style={{ position: "absolute", left: "50%", top: "50%" }}>
            {Array.from({ length: SPARKS }, (_, i) => (
              <span key={i} style={{ position: "absolute", left: 0, top: -1, width: 14, height: 2, borderRadius: 2, transformOrigin: "0 50%", opacity: 0, background: `linear-gradient(90deg, transparent, ${burstColor})` }} />
            ))}
          </div>
          <div
            ref={badgeRef}
            role="img"
            aria-label={`Level ${shownLevel}`}
            style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", clipPath: badgeClip, borderRadius: variant === "sci-fi" ? 0 : variant === "fantasy" ? "50%" : 16, padding: 2, background: variant === "fantasy" ? "linear-gradient(160deg, #f7e0a4, #8a6428 60%, #d4ae68)" : `linear-gradient(160deg, ${light}, ${deep})` }}
          >
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", clipPath: badgeClip, borderRadius: variant === "sci-fi" ? 0 : variant === "fantasy" ? "50%" : 14, background: `radial-gradient(circle at 50% 30%, ${mixHex(color, "#101014", 0.55)}, #07070a 80%)`, overflow: "hidden", position: "relative" }}>
              <span style={{ position: "absolute", top: 9, fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: theme.muted }}>LVL</span>
              <span key={shownLevel} style={{ fontFamily: theme.numeric, fontWeight: 800, fontSize: 26, marginTop: 8, color: "#fff", textShadow: `0 0 14px ${rgba(color, 0.9)}`, animation: reduced ? undefined : "sf-xp-bar-roll .55s cubic-bezier(.2,1.2,.3,1)" }}>
                {shownLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none", color: theme.muted }}>{label}</span>
            <span style={{ fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", fontSize: 13, color: theme.muted }}>
              <span ref={numberRef} style={{ color: theme.text, fontWeight: 700, fontSize: 15 }} />
              <span> / {safeMax.toLocaleString("en-US")} XP</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`${label}, level ${target.level}`}
            aria-valuemin={0}
            aria-valuemax={safeMax}
            aria-valuenow={Math.round(target.value)}
            style={{ position: "relative", height: 14, borderRadius: radius, padding: 1, background: variant === "fantasy" ? "linear-gradient(180deg, #f1d79a, #8a6428)" : trim, clipPath: theme.clip(5) }}
          >
            <div style={{ position: "relative", height: "100%", overflow: "hidden", borderRadius: Math.max(0, radius - 1), clipPath: theme.clip(4), background: `linear-gradient(180deg, ${mixHex(color, "#000000", 0.88)}, ${mixHex(color, "#000000", 0.78)})` }}>
              <div ref={fillRef} style={{ position: "absolute", inset: 0, transformOrigin: "0 50%", transform: "scaleX(0)", background: `linear-gradient(180deg, ${light}, ${color} 50%, ${deep})` }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.28), transparent 50%)" }} />
              </div>
              <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <div className="sf-xp-bar-shimmer" style={{ position: "absolute", top: 0, bottom: 0, width: "22%", background: `linear-gradient(90deg, transparent, ${rgba("#ffffff", 0.22)}, transparent)`, mixBlendMode: "overlay" }} />
              </div>
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: `${(i + 1) * 10}%`, width: 1, background: "rgba(0,0,0,0.45)" }} />
              ))}
              <div ref={flashRef} aria-hidden style={{ position: "absolute", inset: 0, opacity: 0, background: `linear-gradient(90deg, ${rgba(burstColor, 0.5)}, #ffffff)` }} />
            </div>
            <div ref={tipRef} aria-hidden style={{ position: "absolute", top: -6, bottom: -6, width: 18, marginLeft: -9, borderRadius: "50%", background: `radial-gradient(closest-side, ${rgba("#ffffff", 0.9)}, ${rgba(color, 0.4)} 50%, transparent)`, pointerEvents: "none" }} />
          </div>
          <div aria-hidden ref={gainRef} style={{ position: "absolute", right: 0, top: 44, fontFamily: theme.numeric, fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: light, opacity: 0, textShadow: `0 0 10px ${rgba(color, 0.9)}` }} />
        </div>

        <div
          aria-hidden
          ref={bannerRef}
          style={{ position: "absolute", left: "50%", top: -58, transform: "translate(-50%, 0)", opacity: 0, whiteSpace: "nowrap", fontSize: 28, fontWeight: 800, letterSpacing: "0.3em", color: burstColor, textShadow: `0 0 18px ${rgba(burstColor, 0.8)}, 0 2px 0 ${mixHex(burstColor, "#000000", 0.6)}`, pointerEvents: "none", fontFamily: theme.font }}
        >
          LEVEL UP
        </div>
      </div>

      {demo ? (
        <div style={{ display: "flex", gap: 8, marginTop: 34, justifyContent: "center", flexWrap: "wrap" }}>
          {[120, 480, 1650].map(amount => (
            <button key={amount} type="button" className="sf-xp-bar-btn" style={demoButtonStyle(theme, amount > safeMax ? burstColor : color)} onClick={() => gain(amount)}>
              +{amount.toLocaleString("en-US")} XP
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

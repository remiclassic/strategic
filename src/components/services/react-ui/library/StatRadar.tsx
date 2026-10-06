"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { GameGlyph, clamp, gameTheme, mixHex, rgba, type GameVariant, type GlyphName } from "./_shared/gameKit";

export type RadarStat = { label: string; value: number };

export type StatRadarProps = {
  /** Stats drawn as the main shape (3–10 axes). Changing them morphs the shape. */
  stats?: RadarStat[];
  /** Values for a ghost shape to compare against (same order as `stats`), e.g. the current pick. */
  compare?: number[] | null;
  /** Name shown above the legend. */
  title?: string;
  /** Line under the name. */
  subtitle?: string;
  /** Value at the outer ring. */
  max?: number;
  /** Chart diameter in px. */
  size?: number;
  /** Grid rings. */
  rings?: number;
  /** Main shape color. */
  color?: string;
  /** Ghost / compare shape color. */
  compareColor?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Show values next to the axis labels. */
  showValues?: boolean;
  /** Show the stat list with deltas beside the chart. */
  showLegend?: boolean;
  /** Render a built-in character picker that morphs between presets. */
  demo?: boolean;
  /** Hovered / focused axis changed (null when none). */
  onHover?: (index: number | null, stat: RadarStat | null) => void;
  className?: string;
  style?: CSSProperties;
};

const LABELS = ["Power", "Agility", "Defense", "Arcana", "Vitality", "Fortune"];
const ROSTER: { name: string; role: string; glyph: GlyphName; values: number[] }[] = [
  { name: "Vanguard", role: "Frontline duelist", glyph: "sword", values: [88, 58, 76, 28, 72, 44] },
  { name: "Warden", role: "Unbreakable guardian", glyph: "shield", values: [56, 34, 96, 42, 91, 36] },
  { name: "Seer", role: "Arcane strategist", glyph: "eye", values: [34, 68, 38, 97, 48, 78] },
];
export const DEFAULT_RADAR_STATS: RadarStat[] = LABELS.map((label, i) => ({ label, value: ROSTER[0].values[i] }));

const CSS = `
.sf-stat-radar-row { transition: background .2s, color .2s; }
.sf-stat-radar-pick { transition: transform .2s cubic-bezier(.2,.8,.2,1), background .25s, box-shadow .25s, color .25s; }
.sf-stat-radar-pick:hover { transform: translateY(-2px); }
.sf-stat-radar-pick:focus-visible { outline: 2px solid var(--sf-sr-color); outline-offset: 2px; }
.sf-stat-radar-label { transition: opacity .2s, transform .25s cubic-bezier(.2,.9,.3,1.3); }
.sf-stat-radar-label:focus-visible { outline: 1px dashed var(--sf-sr-color); outline-offset: 3px; }
.sf-stat-radar-delta { animation: sf-stat-radar-delta .5s cubic-bezier(.2,.9,.3,1.2) both; }
@keyframes sf-stat-radar-delta { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .sf-stat-radar-delta { animation: none; } }
`;

export function StatRadar({
  stats,
  compare = null,
  title = "Vanguard",
  subtitle = "Frontline duelist",
  max = 100,
  size = 270,
  rings = 4,
  color = "#5cc8ff",
  compareColor = "#ff9f43",
  variant = "sci-fi",
  showValues = true,
  showLegend = true,
  demo = false,
  onHover,
  className,
  style,
}: StatRadarProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [pick, setPick] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const base = (stats && stats.length >= 3 ? stats : DEFAULT_RADAR_STATS).slice(0, 10);
  const shown = demo ? LABELS.map((label, i) => ({ label, value: ROSTER[pick].values[i] })) : base;
  const ghost = demo ? (previous === null ? null : ROSTER[previous].values) : compare;
  const heading = demo ? ROSTER[pick].name : title;
  const sub = demo ? ROSTER[pick].role : subtitle;
  const n = shown.length;
  const top = Math.max(1, max);
  const [hover, setHover] = useState<number | null>(null);

  const pad = 64;
  const box = size + pad * 2;
  const c = box / 2;
  const R = size / 2;
  const angle = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const point = (i: number, v: number) => {
    const r = (clamp(v, 0, top) / top) * R;
    return [c + Math.cos(angle(i)) * r, c + Math.sin(angle(i)) * r] as const;
  };
  const shape = (vals: number[]) => vals.map((v, i) => point(i, v).join(",")).join(" ");

  // Spring-animated values (refs only; no per-frame React state).
  const targetKey = shown.map(stat => stat.value).join(",");
  const anim = useRef<{ value: number[]; velocity: number[] }>({ value: shown.map(() => 0), velocity: shown.map(() => 0) });
  const polyRef = useRef<SVGPolygonElement>(null);
  const lineRef = useRef<SVGPolygonElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const live = useRef({ targets: shown.map(stat => stat.value), top, R, n });
  live.current = { targets: shown.map(stat => stat.value), top, R, n };

  useEffect(() => {
    const state = anim.current;
    const targets = live.current.targets;
    if (state.value.length !== targets.length) {
      state.value = targets.map(() => 0);
      state.velocity = targets.map(() => 0);
    }
    const draw = () => {
      const pts = state.value.map((v, i) => point(i, v).join(",")).join(" ");
      polyRef.current?.setAttribute("points", pts);
      lineRef.current?.setAttribute("points", pts);
      state.value.forEach((v, i) => {
        const [x, y] = point(i, v);
        const dot = dotRefs.current[i];
        if (dot) {
          dot.setAttribute("cx", String(x));
          dot.setAttribute("cy", String(y));
        }
        const num = numRefs.current[i];
        if (num) num.textContent = String(Math.round(v));
      });
    };
    if (reduced) {
      state.value = [...targets];
      draw();
      return;
    }
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let moving = false;
      const aims = live.current.targets;
      for (let i = 0; i < state.value.length; i++) {
        const aim = aims[i] ?? 0;
        // Critically-underdamped spring with a slight per-axis stagger for an organic morph.
        const stiffness = 150 - i * 6;
        const damping = 15;
        const force = (aim - state.value[i]) * stiffness - state.velocity[i] * damping;
        state.velocity[i] += force * dt;
        state.value[i] += state.velocity[i] * dt;
        if (Math.abs(aim - state.value[i]) > 0.05 || Math.abs(state.velocity[i]) > 0.05) moving = true;
        else {
          state.value[i] = aim;
          state.velocity[i] = 0;
        }
      }
      draw();
      frame = moving ? requestAnimationFrame(step) : 0;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey, reduced, size, top, n]);

  const setHovered = (index: number | null) => {
    if (index === hover) return;
    setHover(index);
    onHover?.(index, index === null ? null : shown[index]);
  };

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * box - c;
    const y = ((event.clientY - rect.top) / rect.height) * box - c;
    const dist = Math.hypot(x, y);
    if (dist > R + pad * 0.9) return setHovered(null);
    let a = Math.atan2(y, x) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    setHovered(Math.round((a / (Math.PI * 2)) * n) % n);
  };

  const light = mixHex(color, "#ffffff", 0.5);
  const grid = variant === "fantasy" ? "#d4ae68" : variant === "minimal" ? "#ffffff" : color;
  const gridAlpha = variant === "minimal" ? 0.1 : variant === "fantasy" ? 0.22 : 0.18;
  const ringShape = (k: number) =>
    Array.from({ length: n }, (_, i) => {
      const r = (k / rings) * R;
      return `${c + Math.cos(angle(i)) * r},${c + Math.sin(angle(i)) * r}`;
    }).join(" ");

  const choose = (index: number) => {
    if (index === pick) return;
    setPrevious(pick);
    setPick(index);
  };

  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: 28, fontFamily: theme.font, color: theme.text, ["--sf-sr-color" as string]: color, ...style }}>
      <style>{CSS}</style>
      <div style={{ position: "relative", width: box, height: box, flex: "none" }}>
        <svg
          viewBox={`0 0 ${box} ${box}`}
          width={box}
          height={box}
          role="img"
          aria-label={`${heading} stats: ${shown.map(stat => `${stat.label} ${stat.value}`).join(", ")}`}
          onPointerMove={onMove}
          onPointerLeave={() => setHovered(null)}
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <radialGradient id={`f${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor={color} stopOpacity="0.08" />
              <stop offset="1" stopColor={color} stopOpacity="0.42" />
            </radialGradient>
            <radialGradient id={`b${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor={variant === "fantasy" ? "#3a2a18" : variant === "minimal" ? "#26262c" : mixHex(color, "#05080c", 0.85)} stopOpacity="0.9" />
              <stop offset="1" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={c} cy={c} r={R * 1.12} fill={`url(#b${uid})`} />
          {/* Grid */}
          {Array.from({ length: rings }, (_, k) => (
            <polygon key={k} points={ringShape(k + 1)} fill={k === rings - 1 && variant !== "minimal" ? rgba(grid, 0.04) : "none"} stroke={rgba(grid, k === rings - 1 ? gridAlpha * 2.2 : gridAlpha)} strokeWidth={k === rings - 1 ? 1.5 : 1} strokeDasharray={variant === "sci-fi" && k < rings - 1 ? "3 4" : undefined} />
          ))}
          {variant === "fantasy" ? <polygon points={ringShape(rings + 0.18)} fill="none" stroke={rgba(grid, 0.35)} strokeWidth={1} /> : null}
          {Array.from({ length: n }, (_, i) => {
            const [x, y] = point(i, top);
            const on = hover === i;
            return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke={on ? light : rgba(grid, gridAlpha * 1.4)} strokeWidth={on ? 1.6 : 1} style={{ transition: "stroke .2s" }} />;
          })}
          {variant === "sci-fi"
            ? Array.from({ length: rings - 1 }, (_, k) => {
                const [x, y] = point(0, ((k + 1) / rings) * top);
                return (
                  <text key={k} x={x + 5} y={y + 3} fontSize="8" fill={rgba(color, 0.55)} fontFamily={theme.numeric}>
                    {Math.round(((k + 1) / rings) * top)}
                  </text>
                );
              })
            : null}

          {/* Compare ghost */}
          {ghost && ghost.length ? (
            <polygon points={shape(shown.map((_, i) => ghost[i] ?? 0))} fill={rgba(compareColor, 0.1)} stroke={compareColor} strokeOpacity={0.85} strokeWidth={1.5} strokeDasharray="5 4" strokeLinejoin="round" />
          ) : null}

          {/* Main shape */}
          <polygon ref={polyRef} fill={`url(#f${uid})`} />
          <polygon ref={lineRef} fill="none" stroke={light} strokeWidth={2} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${rgba(color, 0.9)})` }} />
          {shown.map((_, i) => {
            const on = hover === i;
            return (
              <circle
                key={i}
                ref={node => {
                  dotRefs.current[i] = node;
                }}
                r={on ? 6 : variant === "minimal" ? 3.5 : 4}
                fill={on ? "#ffffff" : light}
                stroke={variant === "fantasy" ? "#3a2710" : mixHex(color, "#000000", 0.6)}
                strokeWidth={1.5}
                style={{ filter: on ? `drop-shadow(0 0 8px ${color})` : undefined, transition: "r .2s" }}
              />
            );
          })}
        </svg>

        {/* Axis labels */}
        {shown.map((stat, i) => {
          const a = angle(i);
          const x = c + Math.cos(a) * (R + 30);
          const y = c + Math.sin(a) * (R + 30);
          const on = hover === i;
          const dim = hover !== null && !on;
          return (
            <div
              key={stat.label}
              tabIndex={0}
              className="sf-stat-radar-label"
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              aria-label={`${stat.label}: ${stat.value}`}
              style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${on ? 1.08 : 1})`, textAlign: "center", whiteSpace: "nowrap", opacity: dim ? 0.45 : 1, cursor: "default", lineHeight: 1.1 }}
            >
              <div aria-hidden style={{ fontSize: 11, fontWeight: 700, letterSpacing: theme.caps ? "0.18em" : "0.02em", textTransform: theme.caps ? "uppercase" : "none", color: on ? "#fff" : theme.muted }}>{stat.label}</div>
              {showValues ? (
                <span
                  aria-hidden
                  ref={node => {
                    numRefs.current[i] = node;
                  }}
                  style={{ fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", fontSize: on ? 18 : 15, fontWeight: 700, color: on ? light : theme.text, textShadow: on ? `0 0 12px ${rgba(color, 0.9)}` : undefined, transition: "font-size .2s" }}
                >
                  0
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {showLegend ? (
        <div style={{ width: 250, flex: "none" }}>
          <div key={heading} className="sf-stat-radar-delta">
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: theme.caps ? "0.1em" : "-0.01em", textTransform: theme.caps ? "uppercase" : "none", color: "#fff", textShadow: `0 0 20px ${rgba(color, 0.4)}` }}>{heading}</div>
            {sub ? <div style={{ marginTop: 4, fontSize: 12, letterSpacing: "0.12em", color: theme.muted, fontStyle: variant === "fantasy" ? "italic" : undefined }}>{sub}</div> : null}
          </div>
          <div aria-hidden style={{ margin: "14px 0 8px", height: 1, background: `linear-gradient(90deg, ${variant === "fantasy" ? "#d4ae68" : color}, transparent)` }} />
          <div role="list">
            {shown.map((stat, i) => {
              const on = hover === i;
              const delta = ghost ? stat.value - (ghost[i] ?? 0) : 0;
              return (
                <div
                  key={stat.label}
                  role="listitem"
                  className="sf-stat-radar-row"
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                  style={{ display: "flex", alignItems: "center", gap: 10, height: 27, padding: "0 8px", borderRadius: variant === "minimal" ? 6 : 0, background: on ? rgba(color, 0.14) : "transparent" }}
                >
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, letterSpacing: theme.caps ? "0.12em" : 0, textTransform: theme.caps ? "uppercase" : "none", color: on ? "#fff" : theme.muted }}>{stat.label}</span>
                  <span aria-hidden style={{ position: "relative", width: 70, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                    <span style={{ position: "absolute", inset: 0, transformOrigin: "0 50%", transform: `scaleX(${clamp(stat.value / top, 0, 1)})`, background: on ? light : color, transition: reduced ? undefined : "transform .6s cubic-bezier(.2,.9,.25,1)" }} />
                  </span>
                  <span style={{ width: 28, textAlign: "right", fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 14, color: "#fff" }}>{stat.value}</span>
                  <span key={`${heading}-${i}`} className={delta ? "sf-stat-radar-delta" : undefined} style={{ width: 34, textAlign: "right", fontFamily: theme.numeric, fontSize: 12, fontWeight: 700, color: delta > 0 ? "#5fe08a" : delta < 0 ? "#ff6b5e" : "transparent" }}>
                    {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "·"}
                  </span>
                </div>
              );
            })}
          </div>
          {ghost ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 11, color: theme.muted }}>
              <svg width="22" height="6" aria-hidden>
                <line x1="0" y1="3" x2="22" y2="3" stroke={compareColor} strokeWidth="1.5" strokeDasharray="5 3" />
              </svg>
              {demo && previous !== null ? `vs ${ROSTER[previous].name}` : "Compared"}
            </div>
          ) : null}
          {demo ? (
            <div role="group" aria-label="Choose a character" style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {ROSTER.map((hero, i) => {
                const on = i === pick;
                return (
                  <button
                    key={hero.name}
                    type="button"
                    aria-pressed={on}
                    className="sf-stat-radar-pick"
                    onClick={() => choose(i)}
                    style={{
                      appearance: "none",
                      cursor: "pointer",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                      padding: "9px 4px 8px",
                      font: `600 11px/1 ${theme.font}`,
                      letterSpacing: theme.caps ? "0.12em" : 0,
                      textTransform: theme.caps ? "uppercase" : "none",
                      color: on ? "#fff" : theme.muted,
                      border: `1px solid ${on ? color : theme.line}`,
                      borderRadius: theme.radius + 2,
                      clipPath: theme.clip(6),
                      background: on ? `linear-gradient(180deg, ${rgba(color, 0.22)}, ${rgba(color, 0.06)})` : "rgba(255,255,255,0.03)",
                      boxShadow: on ? `0 0 16px ${rgba(color, 0.3)}` : undefined,
                    }}
                  >
                    <GameGlyph name={hero.glyph} color={on ? color : "#9aa4ad"} size={22} />
                    {hero.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

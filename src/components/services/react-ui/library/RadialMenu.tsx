"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { GameGlyph, clamp, gameTheme, isTypingTarget, mixHex, rgba, usePropState, type GameVariant, type GlyphName } from "./_shared/gameKit";

export type RadialMenuItem = {
  id: string;
  /** Name shown in the hub while highlighted. */
  label: string;
  /** Built-in glyph icon. */
  glyph?: GlyphName;
  /** Custom icon node (wins over glyph). */
  icon?: ReactNode;
  /** Icon tint. */
  color?: string;
  /** Secondary line in the hub, e.g. ammo "32 / 120". */
  hint?: string;
  /** Greyed out and not selectable. */
  disabled?: boolean;
};

export type RadialMenuProps = {
  /** Wheel entries (the first `count` are used). */
  items?: RadialMenuItem[];
  /** Number of segments, 4-10. */
  count?: number;
  /** Equipped segment index (resyncs when changed). */
  selected?: number;
  /** Key that opens the wheel while held; releasing it equips the highlighted segment. */
  keybind?: string;
  /** Keep the wheel open. Off = it opens while the key or pointer is held (or on click). */
  pinned?: boolean;
  /** Small caption in the hub. */
  title?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Highlight and trim color. */
  accent?: string;
  /** Wheel diameter in px. */
  size?: number;
  /** A segment was equipped (click, release, Enter or number key). */
  onSelect?: (index: number, item: RadialMenuItem) => void;
  /** The highlighted segment changed (pointer angle, arrows, focus). */
  onHighlight?: (index: number, item: RadialMenuItem) => void;
  /** The wheel opened or closed (only when not pinned). */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
};

export const SAMPLE_WHEEL: RadialMenuItem[] = [
  { id: "blade", label: "Ashen Longsword", glyph: "sword", color: "#ffb45a", hint: "Melee · 142 dmg" },
  { id: "aegis", label: "Aegis Ward", glyph: "shield", color: "#86c8ff", hint: "Blocks 60%" },
  { id: "bomb", label: "Firebomb", glyph: "flame", color: "#ff7a3d", hint: "× 6" },
  { id: "storm", label: "Stormcaller", glyph: "bolt", color: "#ffe066", hint: "32 / 120" },
  { id: "frost", label: "Frost Nova", glyph: "snowflake", color: "#9fe8ff", hint: "40 mana" },
  { id: "step", label: "Shadowstep", glyph: "dash", color: "#b58cff", hint: "2 charges" },
  { id: "draught", label: "Healing Draught", glyph: "potion", color: "#ff5a6a", hint: "× 12" },
  { id: "eye", label: "Scrying Eye", glyph: "eye", color: "#6fe0b0", hint: "Reveals traps" },
  { id: "key", label: "Skeleton Key", glyph: "key", color: "#ffd27a", hint: "× 3" },
  { id: "banner", label: "Rally Banner", glyph: "crown", color: "#ffcf5a", hint: "Party +10% haste" },
];

const CSS = `
.sf-radial-menu-seg { transition: transform .24s cubic-bezier(.2,.9,.3,1.25), fill .18s, opacity .2s; }
.sf-radial-menu-btn { transition: transform .24s cubic-bezier(.2,.9,.3,1.25), opacity .2s; }
.sf-radial-menu-btn:focus-visible { outline: none; }
.sf-radial-menu-btn:focus-visible .sf-radial-menu-focus { opacity: 1; }
.sf-radial-menu-hub:focus-visible { outline: 2px solid var(--sf-rm-accent); outline-offset: 4px; }
.sf-radial-menu-label { animation: sf-radial-menu-label .22s cubic-bezier(.2,.9,.3,1) both; }
@keyframes sf-radial-menu-label { from { opacity: 0; transform: translateY(5px); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
.sf-radial-menu-spin { animation: sf-radial-menu-spin 40s linear infinite; }
@keyframes sf-radial-menu-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .sf-radial-menu-seg, .sf-radial-menu-btn { transition: none; }
  .sf-radial-menu-label, .sf-radial-menu-spin { animation: none; }
}
`;

/** Point on a circle; 0deg = up, clockwise. */
function polar(c: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [c + r * Math.sin(a), c - r * Math.cos(a)];
}
const pt = ([x, y]: [number, number]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
const wrapIndex = (value: number, n: number) => ((value % n) + n) % n;

function sectorPath(c: number, r0: number, r1: number, a0: number, a1: number, gap: number): string {
  const go = ((gap / 2 / r1) * 180) / Math.PI;
  const gi = ((gap / 2 / r0) * 180) / Math.PI;
  const large = a1 - a0 - 2 * go > 180 ? 1 : 0;
  return `M${pt(polar(c, r1, a0 + go))} A${r1} ${r1} 0 ${large} 1 ${pt(polar(c, r1, a1 - go))} L${pt(polar(c, r0, a1 - gi))} A${r0} ${r0} 0 ${large} 0 ${pt(polar(c, r0, a0 + gi))}Z`;
}

function arcPath(c: number, r: number, a0: number, a1: number): string {
  return `M${pt(polar(c, r, a0))} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(polar(c, r, a1))}`;
}

export function RadialMenu({
  items = SAMPLE_WHEEL,
  count = 8,
  selected = 0,
  keybind = "Q",
  pinned = true,
  title = "Arsenal",
  variant = "sci-fi",
  accent = "#58d5ff",
  size = 380,
  onSelect,
  onHighlight,
  onOpenChange,
  className,
  style,
}: RadialMenuProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const list = items.slice(0, clamp(Math.round(count), 2, 10));
  const n = Math.max(1, list.length);
  const step = 360 / n;
  const [equipped, setEquipped] = usePropState(clamp(Math.round(selected), 0, n - 1));
  const [highlight, setHighlight] = useState(equipped);
  const [needle, setNeedle] = useState(equipped * step);
  const [openState, setOpenState] = useState(false);
  const open = pinned || openState;
  const rootRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const press = useRef<{ id: number; wasOpen: boolean } | null>(null);
  const focusOnOpen = useRef(false);

  const c = size / 2;
  const r1 = c - 18;
  const r0 = Math.round(size * 0.245);
  const rMid = (r0 + r1) / 2;
  const gap = variant === "minimal" ? 6 : variant === "fantasy" ? 4 : 3;
  const current = list[wrapIndex(highlight, n)] ?? list[0];
  const worn = list[wrapIndex(equipped, n)] ?? list[0];
  const shown = open ? current : worn;

  const moveHighlight = (index: number, focus = false) => {
    const next = wrapIndex(index, n);
    if (focus) buttonRefs.current[next]?.focus({ preventScroll: true });
    if (next === highlight) return;
    setHighlight(next);
    setNeedle(previous => previous + ((((next * step - previous) % 360) + 540) % 360) - 180);
    onHighlight?.(next, list[next]);
  };

  const setOpen = (value: boolean) => {
    if (pinned || value === openState) return;
    setOpenState(value);
    onOpenChange?.(value);
    if (value) moveHighlight(equipped);
  };

  const commit = (index: number) => {
    const next = wrapIndex(index, n);
    const item = list[next];
    if (!item || item.disabled) return;
    setEquipped(next);
    onSelect?.(next, item);
    if (!reduced) {
      hubRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.09)" }, { transform: "scale(1)" }], { duration: 360, easing: "cubic-bezier(.2,.9,.3,1.3)" });
    }
    pulseRef.current?.animate(
      [{ opacity: 0.9, transform: "scale(0.85)" }, { opacity: 0, transform: "scale(1.35)" }],
      { duration: reduced ? 200 : 560, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    if (!pinned) setOpen(false);
  };

  const indexFromPoint = (clientX: number, clientY: number): number | null => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const scale = rect.width / size || 1;
    if (Math.hypot(dx, dy) / scale < r0 * 0.6) return null;
    const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    return wrapIndex(Math.round(angle / step), n);
  };

  // Latest handlers for the window listeners below.
  const live = useRef({ setOpen, commit, indexFromPoint, highlight, open });
  live.current = { setOpen, commit, indexFromPoint, highlight, open };

  // Hold the keybind to open, release to equip.
  useEffect(() => {
    if (pinned) return;
    const key = keybind.trim().toLowerCase();
    if (!key) return;
    const matches = (event: globalThis.KeyboardEvent) => event.key.toLowerCase() === key || (key === "space" && event.key === " ");
    const down = (event: globalThis.KeyboardEvent) => {
      if (event.repeat || !matches(event) || isTypingTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault();
      live.current.setOpen(true);
    };
    const up = (event: globalThis.KeyboardEvent) => {
      if (!matches(event) || !live.current.open) return;
      live.current.commit(live.current.highlight);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [pinned, keybind]);

  // Press on the hub, drag toward a segment, release to equip. A plain click toggles.
  useEffect(() => {
    if (pinned) return;
    const upHandler = (event: PointerEvent) => {
      const state = press.current;
      if (!state || state.id !== event.pointerId) return;
      press.current = null;
      const index = live.current.indexFromPoint(event.clientX, event.clientY);
      if (index !== null) live.current.commit(index);
      else if (state.wasOpen) live.current.setOpen(false);
    };
    window.addEventListener("pointerup", upHandler);
    window.addEventListener("pointercancel", upHandler);
    return () => {
      window.removeEventListener("pointerup", upHandler);
      window.removeEventListener("pointercancel", upHandler);
    };
  }, [pinned]);

  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      buttonRefs.current[wrapIndex(highlight, n)]?.focus({ preventScroll: true });
    }
  }, [open, highlight, n]);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!open) return;
    const index = indexFromPoint(event.clientX, event.clientY);
    if (index !== null) moveHighlight(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = highlight + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = highlight - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = n - 1;
    else if (/^[0-9]$/.test(event.key)) {
      const index = event.key === "0" ? 9 : Number(event.key) - 1;
      if (index < n) {
        event.preventDefault();
        moveHighlight(index, true);
        commit(index);
      }
      return;
    } else if (event.key === "Escape" && !pinned) {
      event.preventDefault();
      setOpen(false);
      (rootRef.current?.querySelector(".sf-radial-menu-hub") as HTMLElement | null)?.focus();
      return;
    }
    if (next === null) return;
    event.preventDefault();
    moveHighlight(next, true);
  };

  // Variant palette.
  const trim = variant === "fantasy" ? "#d4ae68" : variant === "minimal" ? "#ffffff" : accent;
  const hi = variant === "fantasy" ? mixHex(accent, "#f0c060", 0.85) : variant === "minimal" ? mixHex(accent, "#ffffff", 0.6) : accent;
  const segFill = variant === "fantasy" ? "#1d150f" : variant === "minimal" ? "#1b1b1f" : "#0b141b";
  const segEdge = variant === "fantasy" ? rgba("#d4ae68", 0.42) : variant === "minimal" ? "rgba(255,255,255,0.08)" : rgba(accent, 0.28);
  const hubD = (r0 - 10) * 2;

  const keycap = (
    <span style={{ display: "inline-grid", placeItems: "center", minWidth: 22, height: 22, padding: "0 6px", boxSizing: "border-box", borderRadius: variant === "minimal" ? 6 : 3, font: `700 11px/1 ${theme.numeric}`, color: theme.text, background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))", boxShadow: `inset 0 0 0 1px ${rgba(trim, 0.5)}, 0 2px 0 rgba(0,0,0,0.6)` }}>
      {keybind.toUpperCase()}
    </span>
  );

  return (
    <div
      ref={rootRef}
      className={className}
      role="group"
      aria-label={`${title || "Radial menu"}: ${worn?.label ?? ""} equipped`}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
      style={{ position: "relative", width: size, height: size, flex: "none", fontFamily: theme.font, color: theme.text, userSelect: "none", touchAction: "none", ["--sf-rm-accent" as string]: hi, ...style }}
    >
      <style>{CSS}</style>

      {/* Wheel */}
      <div
        aria-hidden={!open}
        style={{
          position: "absolute",
          inset: 0,
          opacity: open ? 1 : 0,
          transform: open ? "none" : `scale(0.62) rotate(${reduced ? 0 : -30}deg)`,
          transition: reduced ? "opacity .15s" : open ? "transform .42s cubic-bezier(.2,1,.3,1.12), opacity .22s ease-out" : "transform .22s cubic-bezier(.5,0,.8,.4), opacity .2s ease-in",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <radialGradient id={`${uid}hi`} cx={c} cy={c} r={r1 + 4} gradientUnits="userSpaceOnUse">
              <stop offset={r0 / (r1 + 4)} stopColor={rgba(hi, 0.06)} />
              <stop offset="0.82" stopColor={rgba(hi, variant === "minimal" ? 0.22 : 0.34)} />
              <stop offset="1" stopColor={rgba(hi, variant === "minimal" ? 0.4 : 0.62)} />
            </radialGradient>
            <radialGradient id={`${uid}seg`} cx={c} cy={c} r={r1} gradientUnits="userSpaceOnUse">
              <stop offset={r0 / r1} stopColor={mixHex(segFill, "#000000", 0.35)} stopOpacity={0.92} />
              <stop offset="1" stopColor={mixHex(segFill, "#ffffff", 0.05)} stopOpacity={variant === "minimal" ? 0.72 : 0.88} />
            </radialGradient>
            <radialGradient id={`${uid}glow`} cx={c} cy={c} r={r1 + 30} gradientUnits="userSpaceOnUse">
              <stop offset="0.5" stopColor={rgba(hi, 0)} />
              <stop offset="0.86" stopColor={rgba(hi, 0.14)} />
              <stop offset="1" stopColor={rgba(hi, 0)} />
            </radialGradient>
          </defs>

          {/* Backplate */}
          {variant === "minimal" ? null : <circle cx={c} cy={c} r={r1 + 30} fill={`url(#${uid}glow)`} />}
          <circle cx={c} cy={c} r={r1 + 2} fill="rgba(0,0,0,0.5)" />

          {variant === "sci-fi" ? (
            <g>
              <circle cx={c} cy={c} r={r1 + 11} fill="none" stroke={rgba(accent, 0.35)} strokeWidth={1} strokeDasharray="1 5.2" />
              <g className="sf-radial-menu-spin" style={{ transformOrigin: `${c}px ${c}px`, transformBox: "view-box" }}>
                <path d={arcPath(c, r1 + 15, 20, 70)} fill="none" stroke={rgba(accent, 0.45)} strokeWidth={1.5} />
                <path d={arcPath(c, r1 + 15, 200, 250)} fill="none" stroke={rgba(accent, 0.45)} strokeWidth={1.5} />
              </g>
            </g>
          ) : variant === "fantasy" ? (
            <g>
              <circle cx={c} cy={c} r={r1 + 7} fill="none" stroke="#d4ae68" strokeOpacity={0.55} strokeWidth={1.2} />
              <circle cx={c} cy={c} r={r1 + 12} fill="none" stroke="#8a6428" strokeOpacity={0.7} strokeWidth={2.4} />
              <circle cx={c} cy={c} r={r1 + 12} fill="none" stroke="#f1d79a" strokeOpacity={0.35} strokeWidth={0.8} />
              {list.map((_, i) => {
                const [x, y] = polar(c, r1 + 10, i * step + step / 2);
                return <rect key={i} x={x - 4} y={y - 4} width={8} height={8} fill="#e8c77f" stroke="#1a120b" strokeWidth={1.5} transform={`rotate(${45 + i * step + step / 2} ${x} ${y})`} />;
              })}
            </g>
          ) : (
            <circle cx={c} cy={c} r={r1 + 8} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          )}

          {/* Segments */}
          {list.map((item, i) => {
            const mid = i * step;
            const active = open && i === highlight;
            const [dx, dy] = polar(0, active ? 6 : 0, mid);
            return (
              <g key={item.id} className="sf-radial-menu-seg" style={{ transform: `translate(${dx}px, ${dy}px)`, opacity: item.disabled ? 0.45 : 1 }}>
                <path
                  d={sectorPath(c, r0, r1, mid - step / 2, mid + step / 2, gap)}
                  fill={active ? `url(#${uid}hi)` : `url(#${uid}seg)`}
                  stroke={active ? rgba(hi, 0.9) : segEdge}
                  strokeWidth={active ? 1.4 : 1}
                  strokeLinejoin="round"
                  onClick={() => commit(i)}
                  style={{ cursor: item.disabled ? "not-allowed" : "pointer", pointerEvents: "all" }}
                />
                {active ? (
                  <path
                    d={arcPath(c, r1 + 4, mid - step / 2 + ((gap / r1) * 180) / Math.PI, mid + step / 2 - ((gap / r1) * 180) / Math.PI)}
                    fill="none"
                    stroke={mixHex(hi, "#ffffff", 0.35)}
                    strokeWidth={variant === "minimal" ? 3 : 3.5}
                    strokeLinecap={variant === "minimal" ? "round" : "butt"}
                    style={{ filter: `drop-shadow(0 0 6px ${hi})`, pointerEvents: "none" }}
                  />
                ) : null}
                {i === equipped ? (
                  (() => {
                    const [x, y] = polar(c, r1 - 11, mid);
                    return <circle cx={x} cy={y} r={3} fill={mixHex(hi, "#ffffff", 0.4)} style={{ filter: `drop-shadow(0 0 4px ${hi})`, pointerEvents: "none" }} />;
                  })()
                ) : null}
                {variant === "sci-fi" ? (
                  (() => {
                    const [x, y] = polar(c, r0 + 11, mid);
                    return (
                      <text x={x} y={y + 3} textAnchor="middle" fill={active ? mixHex(hi, "#ffffff", 0.5) : rgba(accent, 0.5)} style={{ font: `700 9px ${theme.numeric}`, pointerEvents: "none" }}>
                        {i === 9 ? 0 : i + 1}
                      </text>
                    );
                  })()
                ) : null}
              </g>
            );
          })}

          {/* Inner ring + needle */}
          <circle cx={c} cy={c} r={r0 - 4} fill="none" stroke={variant === "fantasy" ? rgba("#d4ae68", 0.5) : rgba(trim, variant === "minimal" ? 0.1 : 0.3)} strokeWidth={1} />
          <g style={{ transform: `rotate(${needle}deg)`, transformOrigin: `${c}px ${c}px`, transformBox: "view-box", transition: reduced ? "none" : "transform .32s cubic-bezier(.2,.9,.25,1.2)" }}>
            <path d={`M${c - 7} ${c - r0 + 7} L${c} ${c - r0 - 1} L${c + 7} ${c - r0 + 7}Z`} fill={mixHex(hi, "#ffffff", 0.3)} style={{ filter: `drop-shadow(0 0 5px ${hi})` }} />
          </g>
        </svg>

        {/* Icons (real buttons for keyboard / screen readers) */}
        {list.map((item, i) => {
          const [x, y] = polar(c, rMid + (variant === "sci-fi" ? 4 : 0), i * step);
          const active = open && i === highlight;
          const box = Math.min(58, (r1 - r0) * 0.72);
          const tint = item.color ?? mixHex(hi, "#ffffff", 0.2);
          return (
            <button
              key={item.id}
              ref={node => {
                buttonRefs.current[i] = node;
              }}
              type="button"
              className="sf-radial-menu-btn"
              tabIndex={open && i === highlight ? 0 : -1}
              disabled={item.disabled}
              aria-label={`${item.label}${item.hint ? `, ${item.hint}` : ""}${i === equipped ? ", equipped" : ""}`}
              aria-pressed={i === equipped}
              onFocus={() => moveHighlight(i)}
              onClick={() => commit(i)}
              style={{
                position: "absolute",
                left: x - box / 2,
                top: y - box / 2,
                width: box,
                height: box,
                padding: 0,
                border: 0,
                borderRadius: "50%",
                background: "transparent",
                cursor: item.disabled ? "not-allowed" : "pointer",
                display: "grid",
                placeItems: "center",
                transform: `translate(${polar(0, active ? 6 : 0, i * step).join("px, ")}px) scale(${active ? 1.18 : 1})`,
                visibility: open ? "visible" : "hidden",
              }}
            >
              <span className="sf-radial-menu-focus" aria-hidden style={{ position: "absolute", inset: 2, borderRadius: "50%", boxShadow: `0 0 0 2px ${hi}`, opacity: 0, transition: "opacity .15s" }} />
              <span aria-hidden style={{ display: "grid", placeItems: "center", filter: active ? `drop-shadow(0 0 10px ${rgba(tint, 0.85)})` : item.disabled ? "grayscale(1)" : `drop-shadow(0 2px 3px rgba(0,0,0,0.7))`, opacity: active ? 1 : 0.82, transition: "filter .2s, opacity .2s" }}>
                {item.icon ?? <GameGlyph name={item.glyph ?? "star"} color={tint} size={box * 0.6} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hub */}
      <div
        ref={hubRef}
        style={{
          position: "absolute",
          left: c - hubD / 2,
          top: c - hubD / 2,
          width: hubD,
          height: hubD,
          borderRadius: "50%",
          background:
            variant === "fantasy"
              ? "radial-gradient(circle at 50% 35%, #3a2a1c, #140e09 72%)"
              : variant === "minimal"
                ? "radial-gradient(circle at 50% 30%, #2a2a30, #141417 75%)"
                : `radial-gradient(circle at 50% 35%, ${mixHex(accent, "#0b141b", 0.82)}, #05090c 75%)`,
          boxShadow:
            variant === "fantasy"
              ? "0 0 0 2px #1a120b, 0 0 0 4px #b48a48, 0 0 0 5px #1a120b, inset 0 0 18px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.6)"
              : variant === "minimal"
                ? "inset 0 0 0 1px rgba(255,255,255,0.1), 0 14px 34px rgba(0,0,0,0.55)"
                : `inset 0 0 0 1px ${rgba(accent, 0.45)}, inset 0 0 24px ${rgba(accent, 0.12)}, 0 0 28px ${rgba(accent, 0.12)}`,
        }}
      >
        <div ref={pulseRef} aria-hidden style={{ position: "absolute", inset: -4, borderRadius: "50%", boxShadow: `0 0 0 2px ${hi}, 0 0 22px ${hi}`, opacity: 0, pointerEvents: "none" }} />
        {pinned ? null : (
          <button
            type="button"
            className="sf-radial-menu-hub"
            aria-expanded={open}
            aria-label={`${worn?.label ?? ""} equipped. ${open ? "Choose a segment" : `Hold ${keybind} or click to open the wheel`}`}
            onPointerDown={event => {
              if (event.button !== 0) return;
              press.current = { id: event.pointerId, wasOpen: open };
              if (!open) setOpen(true);
            }}
            onClick={event => {
              if (event.detail === 0) {
                if (open) setOpen(false);
                else {
                  focusOnOpen.current = true;
                  setOpen(true);
                }
              }
            }}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: 0, padding: 0, background: "transparent", cursor: "pointer" }}
          />
        )}
        <div aria-live="polite" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, textAlign: "center", pointerEvents: "none", padding: "0 14px" }}>
          {title ? (
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: theme.caps ? "0.24em" : "0.08em", textTransform: theme.caps ? "uppercase" : "none", color: rgba(variant === "fantasy" ? "#e8c77f" : variant === "minimal" ? "#ffffff" : accent, 0.7) }}>{open ? title : "Equipped"}</span>
          ) : null}
          <span key={`${shown?.id}-${open}`} className="sf-radial-menu-label" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <span aria-hidden style={{ filter: `drop-shadow(0 0 12px ${rgba(shown?.color ?? hi, 0.55)})` }}>
              {shown?.icon ?? <GameGlyph name={shown?.glyph ?? "star"} color={shown?.color ?? hi} size={Math.round(hubD * 0.26)} />}
            </span>
            <span style={{ fontSize: clamp(hubD * (theme.caps ? 0.085 : 0.095), 11, 16), fontWeight: 700, lineHeight: 1.12, letterSpacing: theme.caps ? "0.04em" : "0", textTransform: theme.caps ? "uppercase" : "none", maxWidth: hubD - 30, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textWrap: "balance" }}>{shown?.label}</span>
            {shown?.hint ? <span style={{ fontFamily: theme.numeric, fontSize: 11.5, color: theme.muted, fontVariantNumeric: "tabular-nums" }}>{shown.hint}</span> : null}
          </span>
          {!pinned && !open ? <span style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: theme.muted, letterSpacing: "0.06em" }}>Hold {keycap}</span> : null}
        </div>
      </div>
    </div>
  );
}

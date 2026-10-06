"use client";
/* eslint-disable @next/next/no-img-element -- copy-paste component: a plain <img> keeps it framework-agnostic. */

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useAnimationFrame, useReducedMotion } from "./_shared/hooks";
import { GameGlyph, clamp, gameTheme, mixHex, rgba, usePropState, type GameVariant, type GlyphName } from "./_shared/gameKit";

export type HotbarSlot = {
  id: string;
  /** Name shown above the selected slot. */
  label: string;
  /** Built-in glyph icon. */
  glyph?: GlyphName;
  /** Custom icon node (wins over glyph/image). */
  icon?: ReactNode;
  /** Image URL for the icon. */
  image?: string;
  /** Tint for the glyph and slot glow. */
  color?: string;
  /** Key label; defaults to the slot number. */
  keybind?: string;
  /** Cooldown in seconds after use. */
  cooldown?: number;
  /** Stack size for consumables. Using the slot decrements it; 0 disables the slot. */
  count?: number;
};

export type HotbarProps = {
  /** Slots, left to right (up to 10). Pass `null` for an empty slot. */
  slots?: (HotbarSlot | null)[];
  /** Selected slot index. */
  selected?: number;
  /** Visual style. */
  variant?: GameVariant;
  /** Selection / frame accent. */
  accent?: string;
  /** Slot size in px. */
  slotSize?: number;
  /** Show the name of the selected slot above the bar. */
  showLabel?: boolean;
  /** Called when selection changes (click, arrows, number keys). */
  onSelect?: (index: number, slot: HotbarSlot | null) => void;
  /** Called when a ready slot is used (click, Enter / Space). */
  onUse?: (index: number, slot: HotbarSlot) => void;
  className?: string;
  style?: CSSProperties;
};

export const DEFAULT_HOTBAR_SLOTS: HotbarSlot[] = [
  { id: "cleave", label: "Cleave", glyph: "sword", color: "#e9dfcf", cooldown: 1.2 },
  { id: "lance", label: "Flame Lance", glyph: "flame", color: "#ff7a3d", cooldown: 6 },
  { id: "arc", label: "Arc Bolt", glyph: "bolt", color: "#8fd3ff", cooldown: 4 },
  { id: "nova", label: "Frost Nova", glyph: "snowflake", color: "#a6ecff", cooldown: 10 },
  { id: "ward", label: "Aegis Ward", glyph: "shield", color: "#ffd27a", cooldown: 14 },
  { id: "blink", label: "Blink", glyph: "dash", color: "#c7a0ff", cooldown: 3 },
  { id: "hp", label: "Health Draught", glyph: "potion", color: "#ff5a5a", count: 5, cooldown: 2 },
  { id: "mp", label: "Mana Draught", glyph: "potion", color: "#5b8dff", count: 3, cooldown: 2 },
];

const CSS = `
.sf-hotbar-slot { transition: transform .2s cubic-bezier(.2,.9,.3,1.25), box-shadow .2s, border-color .2s; }
.sf-hotbar-slot:hover:not([aria-disabled="true"]) { transform: translateY(-3px); }
.sf-hotbar-slot:hover .sf-hotbar-art { filter: brightness(1.25); }
.sf-hotbar-slot:active:not([aria-disabled="true"]) { transform: translateY(0) scale(.94); transition-duration: .06s; }
.sf-hotbar-slot:focus-visible { outline: 2px solid var(--sf-hotbar-accent); outline-offset: 3px; }
.sf-hotbar-slot[data-selected="true"] { transform: translateY(-5px); }
.sf-hotbar-label { transition: left .28s cubic-bezier(.2,.9,.3,1), opacity .2s; }
@media (prefers-reduced-motion: reduce) { .sf-hotbar-slot, .sf-hotbar-label { transition: none; } }
`;

type SlotDom = { sweep: HTMLDivElement | null; text: HTMLSpanElement | null; root: HTMLButtonElement | null; flash: HTMLDivElement | null };

export function Hotbar({
  slots = DEFAULT_HOTBAR_SLOTS,
  selected = 1,
  variant = "sci-fi",
  accent = "#58d5ff",
  slotSize = 58,
  showLabel = true,
  onSelect,
  onUse,
  className,
  style,
}: HotbarProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const list = slots.slice(0, 10);
  const [active, setActive] = usePropState(clamp(Math.round(selected), 0, Math.max(0, list.length - 1)));
  const countsKey = list.map(slot => `${slot?.id}:${slot?.count ?? ""}`).join("|");
  const [counts, setCounts] = usePropState<Record<string, number>>(
    Object.fromEntries(list.filter((slot): slot is HotbarSlot => !!slot && slot.count !== undefined).map(slot => [slot.id, slot.count as number])),
    () => countsKey,
  );
  const [coolingCount, setCoolingCount] = useState(0);
  const ends = useRef(new Map<number, { end: number; total: number }>());
  const dom = useRef<SlotDom[]>([]);
  const gap = Math.round(slotSize * 0.11);
  const pad = Math.round(slotSize * 0.18);

  useAnimationFrame(() => {
    const now = performance.now();
    let changed = false;
    ends.current.forEach((entry, index) => {
      const nodes = dom.current[index];
      const remaining = (entry.end - now) / 1000;
      if (remaining <= 0) {
        ends.current.delete(index);
        changed = true;
        if (nodes?.sweep) nodes.sweep.style.opacity = "0";
        if (nodes?.text) nodes.text.textContent = "";
        nodes?.flash?.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: reduced ? 120 : 520, easing: "ease-out" });
        return;
      }
      const deg = (1 - remaining / entry.total) * 360;
      if (nodes?.sweep) {
        nodes.sweep.style.opacity = "1";
        nodes.sweep.style.setProperty("--sf-hotbar-p", `${deg}deg`);
      }
      if (nodes?.text) nodes.text.textContent = remaining < 1 ? remaining.toFixed(1) : String(Math.ceil(remaining));
    });
    if (changed) setCoolingCount(ends.current.size);
  }, coolingCount > 0);

  useEffect(() => () => ends.current.clear(), []);

  const select = (index: number) => {
    const next = clamp(index, 0, list.length - 1);
    setActive(next);
    onSelect?.(next, list[next] ?? null);
  };

  const use = (index: number) => {
    const slot = list[index];
    const nodes = dom.current[index];
    if (!slot) return;
    const count = counts[slot.id];
    if (ends.current.has(index) || count === 0) {
      if (!reduced) nodes?.root?.animate([{ translate: "0 0" }, { translate: "-3px 0" }, { translate: "3px 0" }, { translate: "0 0" }], { duration: 200, easing: "ease-out" });
      return;
    }
    if (count !== undefined) setCounts(previous => ({ ...previous, [slot.id]: Math.max(0, count - 1) }));
    if (slot.cooldown && slot.cooldown > 0) {
      ends.current.set(index, { end: performance.now() + slot.cooldown * 1000, total: slot.cooldown });
      setCoolingCount(ends.current.size);
    }
    nodes?.flash?.animate([{ opacity: 0.8 }, { opacity: 0 }], { duration: reduced ? 100 : 380, easing: "ease-out" });
    onUse?.(index, slot);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (active + 1) % list.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (active - 1 + list.length) % list.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = list.length - 1;
    else if (/^[0-9]$/.test(event.key)) {
      const byBind = list.findIndex((slot, index) => (slot?.keybind ?? String((index + 1) % 10)) === event.key);
      next = byBind;
    }
    if (next < 0 || next >= list.length) return;
    event.preventDefault();
    select(next);
    dom.current[next]?.root?.focus();
  };

  const current = list[active];
  const width = list.length * slotSize + (list.length - 1) * gap;
  const frameEdge = variant === "fantasy" ? rgba("#d4ae68", 0.55) : variant === "minimal" ? "rgba(255,255,255,0.1)" : rgba(accent, 0.3);

  return (
    <div className={className} style={{ position: "relative", display: "inline-block", paddingTop: showLabel ? 40 : 0, fontFamily: theme.font, ["--sf-hotbar-accent" as string]: accent, ...style }}>
      <style>{CSS}</style>
      {showLabel ? (
        <div
          aria-live="polite"
          className="sf-hotbar-label"
          style={{ position: "absolute", top: 0, left: pad + active * (slotSize + gap) + slotSize / 2, transform: "translateX(-50%)", whiteSpace: "nowrap", padding: "6px 12px", fontSize: 12, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none", color: theme.text, background: theme.panel, border: `1px solid ${frameEdge}`, borderRadius: theme.radius, clipPath: theme.clip(5), opacity: current ? 1 : 0 }}
        >
          {current?.label ?? ""}
          {current && counts[current.id] !== undefined ? <span style={{ marginLeft: 8, color: theme.muted, fontFamily: theme.numeric }}>×{counts[current.id]}</span> : null}
        </div>
      ) : null}
      <div
        role="toolbar"
        aria-label="Hotbar"
        onKeyDown={onKeyDown}
        style={{ position: "relative", display: "flex", gap, padding: pad, width, boxSizing: "content-box", background: theme.panel, borderRadius: theme.radius + 4, clipPath: theme.clip(12), boxShadow: `inset 0 0 0 1px ${frameEdge}, 0 18px 40px rgba(0,0,0,0.55)` }}
      >
        {variant === "sci-fi" ? <span aria-hidden style={{ position: "absolute", left: 12, right: 12, top: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.8 }} /> : null}
        {list.map((slot, index) => {
          const isActive = index === active;
          const count = slot ? counts[slot.id] : undefined;
          const empty = count === 0;
          const tint = slot?.color ?? accent;
          const keyLabel = slot?.keybind ?? String((index + 1) % 10);
          return (
            <button
              key={slot?.id ?? `empty-${index}`}
              ref={node => {
                dom.current[index] = { ...(dom.current[index] ?? { sweep: null, text: null, flash: null }), root: node };
              }}
              type="button"
              className="sf-hotbar-slot"
              data-selected={isActive}
              aria-pressed={isActive}
              aria-disabled={!slot || empty}
              aria-label={slot ? `${slot.label}, key ${keyLabel}${count !== undefined ? `, ${count} left` : ""}` : `Empty slot ${keyLabel}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                select(index);
                use(index);
              }}
              style={{
                position: "relative",
                width: slotSize,
                height: slotSize,
                flex: "none",
                padding: 0,
                cursor: slot ? "pointer" : "default",
                borderRadius: theme.radius + 2,
                clipPath: theme.clip(7),
                border: `1px solid ${isActive ? accent : variant === "fantasy" ? rgba("#d4ae68", 0.35) : "rgba(255,255,255,0.1)"}`,
                background: slot ? `radial-gradient(circle at 50% 30%, ${rgba(tint, 0.2)}, rgba(0,0,0,0) 65%), linear-gradient(180deg, #161c22, #07090c)` : "linear-gradient(180deg, #0f1317, #07090c)",
                boxShadow: isActive ? `0 0 0 1px ${rgba(accent, 0.5)}, 0 0 22px ${rgba(accent, 0.45)}, inset 0 0 14px ${rgba(accent, 0.3)}` : "inset 0 2px 8px rgba(0,0,0,0.7)",
                overflow: "hidden",
              }}
            >
              {slot ? (
                <span className="sf-hotbar-art" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", transition: "filter .2s", filter: empty ? "grayscale(1) brightness(0.45)" : undefined }}>
                  {slot.icon ?? (slot.image ? <img src={slot.image} alt="" draggable={false} style={{ width: "78%", height: "78%", objectFit: "contain" }} /> : <GameGlyph name={slot.glyph ?? "star"} color={tint} size={slotSize * 0.56} />)}
                </span>
              ) : null}
              <div
                aria-hidden
                ref={node => {
                  dom.current[index] = { ...(dom.current[index] ?? { root: null, text: null, flash: null }), sweep: node };
                }}
                style={{ position: "absolute", inset: 0, opacity: 0, background: "conic-gradient(from 0deg, transparent 0deg var(--sf-hotbar-p, 0deg), rgba(3,5,7,0.76) var(--sf-hotbar-p, 0deg))" }}
              />
              <span
                aria-hidden
                ref={node => {
                  dom.current[index] = { ...(dom.current[index] ?? { root: null, sweep: null, flash: null }), text: node };
                }}
                style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: theme.numeric, fontWeight: 700, fontSize: slotSize * 0.32, color: "#fff", textShadow: "0 1px 3px #000, 0 0 10px rgba(0,0,0,0.8)", fontVariantNumeric: "tabular-nums" }}
              />
              <div
                aria-hidden
                ref={node => {
                  dom.current[index] = { ...(dom.current[index] ?? { root: null, sweep: null, text: null }), flash: node };
                }}
                style={{ position: "absolute", inset: 0, opacity: 0, background: `radial-gradient(circle, ${rgba("#ffffff", 0.85)}, ${rgba(tint, 0.5)} 60%, transparent)` }}
              />
              <span aria-hidden style={{ position: "absolute", left: 4, top: 3, fontFamily: theme.numeric, fontSize: Math.max(9, slotSize * 0.18), fontWeight: 700, color: isActive ? mixHex(accent, "#ffffff", 0.6) : theme.muted, textShadow: "0 1px 2px #000" }}>{keyLabel}</span>
              {count !== undefined ? (
                <span aria-hidden style={{ position: "absolute", right: 4, bottom: 2, fontFamily: theme.numeric, fontSize: Math.max(10, slotSize * 0.21), fontWeight: 700, color: empty ? "#ff6b6b" : "#fff", textShadow: "0 1px 2px #000, 0 0 6px #000" }}>{count}</span>
              ) : null}
              {isActive && variant !== "minimal" ? (
                <span aria-hidden style={{ position: "absolute", left: "50%", bottom: 0, width: "60%", height: 2, transform: "translateX(-50%)", background: accent, boxShadow: `0 0 10px ${accent}` }} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

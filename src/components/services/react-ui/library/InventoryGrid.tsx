"use client";
/* eslint-disable @next/next/no-img-element -- copy-paste component: a plain <img> keeps it framework-agnostic. */

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { GameGlyph, RARITY, clamp, gameTheme, mixHex, rarityOf, rgba, usePropState, type GameVariant, type GlyphName, type Rarity } from "./_shared/gameKit";

export type InventoryItem = {
  id: string;
  name: string;
  rarity?: Rarity;
  /** Built-in glyph icon. */
  glyph?: GlyphName;
  /** Glyph tint (defaults to the rarity color). */
  color?: string;
  /** Item art URL (wins over glyph). */
  image?: string;
  /** Zoom for the image, e.g. 1.3 to crop a baked-in frame. */
  imageScale?: number;
  /** Custom icon node (wins over image and glyph). */
  icon?: ReactNode;
  /** Stack size (shown when > 1). */
  count?: number;
  /** Type line in the tooltip, e.g. "One-handed sword". */
  type?: string;
  /** Stat rows in the tooltip. */
  stats?: { label: string; value: string }[];
  /** Flavor text in the tooltip. */
  description?: string;
  /** Sell value in gold. */
  value?: number;
};

export type InventoryGridProps = {
  /** Slot contents, row by row. `null` = empty slot. Shorter arrays are padded. */
  items?: (InventoryItem | null)[];
  /** Number of columns. */
  columns?: number;
  /** Number of rows. */
  rows?: number;
  /** Slot size in px. */
  slotSize?: number;
  /** Visual style. */
  variant?: GameVariant;
  /** Selection accent. */
  accent?: string;
  /** Panel title ("" hides the header). */
  title?: string;
  /** Gold shown in the header (negative hides it). */
  gold?: number;
  /** Called with the new slot array after a drag or keyboard swap. */
  onChange?: (items: (InventoryItem | null)[]) => void;
  /** Called when a slot is selected. */
  onSelect?: (index: number, item: InventoryItem | null) => void;
  className?: string;
  style?: CSSProperties;
};

export const SAMPLE_INVENTORY: (InventoryItem | null)[] = [
  { id: "blade", name: "Emberheart Blade", rarity: "legendary", glyph: "sword", type: "Two-handed sword", stats: [{ label: "Attack", value: "+48" }, { label: "Critical chance", value: "+12%" }], description: "Still warm from the forge that birthed it.", value: 2400 },
  { id: "bulwark", name: "Bulwark of Dawn", rarity: "epic", glyph: "shield", type: "Tower shield", stats: [{ label: "Armor", value: "+62" }, { label: "Block", value: "+18%" }], description: "Polished by a thousand sunrises.", value: 980 },
  { id: "ring", name: "Ring of Quiet Tides", rarity: "rare", glyph: "ring", type: "Ring", stats: [{ label: "Mana regen", value: "+4/s" }], value: 420 },
  null,
  { id: "scroll", name: "Scroll of Recall", rarity: "uncommon", glyph: "scroll", count: 3, type: "Consumable", description: "Returns you to the last campfire.", value: 35 },
  null,
  { id: "hp", name: "Health Draught", rarity: "common", glyph: "potion", color: "#ff5a5a", count: 12, type: "Consumable", stats: [{ label: "Restores", value: "120 HP" }], value: 12 },
  { id: "mp", name: "Mana Draught", rarity: "common", glyph: "potion", color: "#5b8dff", count: 7, type: "Consumable", stats: [{ label: "Restores", value: "90 MP" }], value: 12 },
  { id: "sp", name: "Stamina Tonic", rarity: "uncommon", glyph: "potion", color: "#6ee26e", count: 4, type: "Consumable", stats: [{ label: "Stamina regen", value: "+40% for 30s" }], value: 20 },
  null,
  { id: "shard", name: "Voidshard", rarity: "epic", glyph: "gem", color: "#b07bff", count: 2, type: "Crafting reagent", description: "It hums at a pitch only dogs and wizards hear.", value: 310 },
  null,
  { id: "leaf", name: "Moonleaf", rarity: "uncommon", glyph: "leaf", color: "#6fd3a0", count: 24, type: "Herb", value: 4 },
  { id: "cap", name: "Glowcap", rarity: "common", glyph: "mushroom", color: "#ff8a5c", count: 9, type: "Herb", value: 3 },
  null,
  { id: "key", name: "Vault Key", rarity: "rare", glyph: "key", color: "#ffd27a", type: "Quest item", description: "Opens the vault beneath Hollowmere.", value: 0 },
  null,
  { id: "skull", name: "Bone Totem", rarity: "rare", glyph: "skull", color: "#e8e0cf", type: "Trinket", stats: [{ label: "Summon damage", value: "+15%" }], value: 260 },
];

const CSS = `
.sf-inventory-grid-slot { transition: transform .18s cubic-bezier(.2,.9,.3,1.3), box-shadow .2s, border-color .2s; }
.sf-inventory-grid-slot:focus-visible { outline: none; }
.sf-inventory-grid-slot:hover .sf-inventory-grid-art { transform: scale(1.08); }
.sf-inventory-grid-art { transition: transform .22s cubic-bezier(.2,.9,.3,1.3), opacity .2s; }
.sf-inventory-grid-legendary { animation: sf-inventory-grid-glint 3.4s ease-in-out infinite; }
@keyframes sf-inventory-grid-glint { 0%,100% { opacity: .35; } 50% { opacity: .9; } }
.sf-inventory-grid-tip { animation: sf-inventory-grid-tip .18s cubic-bezier(.2,.9,.3,1) both; }
@keyframes sf-inventory-grid-tip { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .sf-inventory-grid-legendary, .sf-inventory-grid-tip { animation: none; } .sf-inventory-grid-slot, .sf-inventory-grid-art { transition: none; } }
`;

function ItemArt({ item, size }: { item: InventoryItem; size: number }) {
  if (item.icon) return <>{item.icon}</>;
  if (item.image) {
    return <img src={item.image} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: item.imageScale && item.imageScale > 1 ? "cover" : "contain", transform: item.imageScale ? `scale(${item.imageScale})` : undefined, padding: item.imageScale && item.imageScale > 1 ? 0 : size * 0.08, boxSizing: "border-box" }} />;
  }
  const tier = RARITY[rarityOf(item.rarity)];
  return <GameGlyph name={item.glyph ?? "star"} color={item.color ?? mixHex(tier.color, "#ffffff", 0.2)} size={size * 0.6} />;
}

export function InventoryGrid({
  items = SAMPLE_INVENTORY,
  columns = 6,
  rows = 4,
  slotSize = 62,
  variant = "fantasy",
  accent = "#f0c060",
  title = "Inventory",
  gold = 1284,
  onChange,
  onSelect,
  className,
  style,
}: InventoryGridProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const cols = Math.max(1, Math.round(columns));
  const total = cols * Math.max(1, Math.round(rows));
  const padded = Array.from({ length: total }, (_, i) => items[i] ?? null);
  const [slots, setSlots] = usePropState(padded, list => `${total}|${list.map(item => item?.id ?? "").join(",")}`);
  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [held, setHeld] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ from: number; over: number | null } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pending = useRef<{ index: number; x: number; y: number; id: number } | null>(null);
  const gap = Math.round(slotSize * 0.1);
  const step = slotSize + gap;

  const commit = (from: number, to: number) => {
    if (from === to) return;
    const next = [...slots];
    [next[from], next[to]] = [next[to], next[from]];
    setSlots(next);
    onChange?.(next);
    const node = slotRefs.current[to];
    if (!reduced) node?.animate([{ transform: "scale(0.86)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 320, easing: "cubic-bezier(.2,.9,.3,1.3)" });
  };

  const indexAt = (clientX: number, clientY: number): number | null => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const col = Math.floor((clientX - rect.left) / step);
    const row = Math.floor((clientY - rect.top) / step);
    if (col < 0 || col >= cols || row < 0 || row >= total / cols) return null;
    return row * cols + col;
  };

  const moveGhost = (clientX: number, clientY: number) => {
    const ghost = ghostRef.current;
    const rect = gridRef.current?.getBoundingClientRect();
    if (!ghost || !rect) return;
    ghost.style.transform = `translate(${clientX - rect.left - slotSize / 2}px, ${clientY - rect.top - slotSize / 2}px) rotate(-4deg) scale(1.08)`;
  };

  // Window listeners while a press/drag is in flight.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const press = pending.current;
      if (!press || event.pointerId !== press.id) return;
      if (!drag) {
        if (Math.hypot(event.clientX - press.x, event.clientY - press.y) < 5) return;
        setDrag({ from: press.index, over: press.index });
        setHeld(null);
      }
      moveGhost(event.clientX, event.clientY);
      const over = indexAt(event.clientX, event.clientY);
      setDrag(previous => (previous && previous.over !== over ? { ...previous, over } : previous));
    };
    const onUp = (event: PointerEvent) => {
      const press = pending.current;
      if (!press || event.pointerId !== press.id) return;
      pending.current = null;
      if (drag) {
        const over = indexAt(event.clientX, event.clientY);
        if (over !== null) {
          commit(drag.from, over);
          setSelected(over);
          setHover(over);
        }
        setDrag(null);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  });

  useEffect(() => {
    if (drag && pending.current) moveGhost(pending.current.x, pending.current.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.from]);

  const select = (index: number, focus = false) => {
    const next = clamp(index, 0, total - 1);
    setSelected(next);
    onSelect?.(next, slots[next]);
    if (focus) slotRefs.current[next]?.focus();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (event.button !== 0) return;
    setKeyboard(false);
    if (!slots[index]) return;
    pending.current = { index, x: event.clientX, y: event.clientY, id: event.pointerId };
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const row = Math.floor(selected / cols);
    const col = selected % cols;
    const rowCount = total / cols;
    let next = -1;
    if (event.key === "ArrowRight") next = row * cols + ((col + 1) % cols);
    else if (event.key === "ArrowLeft") next = row * cols + ((col - 1 + cols) % cols);
    else if (event.key === "ArrowDown") next = ((row + 1) % rowCount) * cols + col;
    else if (event.key === "ArrowUp") next = ((row - 1 + rowCount) % rowCount) * cols + col;
    else if (event.key === "Home") next = row * cols;
    else if (event.key === "End") next = row * cols + cols - 1;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setKeyboard(true);
      if (held === null) {
        if (slots[selected]) setHeld(selected);
      } else {
        commit(held, selected);
        setHeld(null);
      }
      return;
    } else if (event.key === "Escape") {
      setHeld(null);
      return;
    }
    if (next < 0) return;
    event.preventDefault();
    setKeyboard(true);
    select(next, true);
  };

  const filled = slots.filter(Boolean).length;
  const tipIndex = drag ? null : hover ?? (keyboard ? selected : null);
  const tipItem = tipIndex !== null ? slots[tipIndex] : null;
  const gridW = cols * slotSize + (cols - 1) * gap;
  const pad = 16;
  const edge = variant === "fantasy" ? rgba("#d4ae68", 0.45) : variant === "minimal" ? "rgba(255,255,255,0.1)" : rgba(accent, 0.3);
  const dragItem = drag ? slots[drag.from] : null;
  const well = variant === "sci-fi" ? ["#121a21", "#070a0d"] : variant === "minimal" ? ["#1d1d21", "#111114"] : ["#16120f", "#0a0807"];

  let tipStyle: CSSProperties | undefined;
  if (tipIndex !== null && tipItem) {
    const col = tipIndex % cols;
    const row = Math.floor(tipIndex / cols);
    const right = col < cols / 2;
    tipStyle = {
      position: "absolute",
      top: row * step - 6,
      ...(right ? { left: (col + 1) * step + 6 } : { right: (cols - col) * step + 6 }),
    };
  }

  return (
    <div className={className} style={{ position: "relative", display: "inline-block", fontFamily: theme.font, color: theme.text, userSelect: "none", ["--sf-ig-accent" as string]: accent, ...style }}>
      <style>{CSS}</style>
      <div style={{ padding: pad, background: theme.panel, borderRadius: theme.radius + 6, clipPath: theme.clip(14), boxShadow: `inset 0 0 0 1px ${edge}, 0 24px 60px rgba(0,0,0,0.55)` }}>
        {title ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: gridW, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none" }}>{title}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: theme.numeric, fontSize: 13, color: theme.muted }}>
              <span>
                {filled}/{total}
              </span>
              {gold >= 0 ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffd98a" }}>
                  <span aria-hidden style={{ width: 11, height: 11, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff3c4, #e0a93a 55%, #8a5a12)", boxShadow: "0 0 6px rgba(255,200,90,0.5)" }} />
                  {gold.toLocaleString("en-US")}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}
        <div
          ref={gridRef}
          role="grid"
          aria-label={title || "Inventory"}
          aria-rowcount={total / cols}
          aria-colcount={cols}
          onKeyDown={onKeyDown}
          onPointerLeave={() => setHover(null)}
          style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${cols}, ${slotSize}px)`, gap, touchAction: "none" }}
        >
          {slots.map((item, index) => {
            const tier = item ? RARITY[rarityOf(item.rarity)] : null;
            const isSelected = index === selected;
            const isHeld = index === held;
            const isSource = drag?.from === index;
            const isTarget = (drag && drag.over === index && drag.from !== index) || (held !== null && isSelected && !isHeld);
            const ring = isTarget ? accent : isSelected && (keyboard || hover === null) ? mixHex(accent, "#ffffff", 0.2) : null;
            return (
              <button
                key={index}
                ref={node => {
                  slotRefs.current[index] = node;
                }}
                type="button"
                role="gridcell"
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-label={item ? `${item.name}${item.count && item.count > 1 ? `, ${item.count}` : ""}, ${tier?.label}${isHeld ? ", picked up" : ""}` : `Empty slot ${index + 1}`}
                className="sf-inventory-grid-slot"
                onPointerDown={event => onPointerDown(event, index)}
                onPointerEnter={() => {
                  if (!drag) setHover(index);
                }}
                onClick={() => {
                  if (!drag) select(index);
                }}
                onFocus={() => setSelected(index)}
                style={{
                  position: "relative",
                  width: slotSize,
                  height: slotSize,
                  padding: 0,
                  cursor: item ? (drag ? "grabbing" : "grab") : "default",
                  borderRadius: theme.radius + 2,
                  border: `1px solid ${tier ? rgba(tier.color, item?.rarity === "common" || !item?.rarity ? 0.25 : 0.6) : "rgba(255,255,255,0.06)"}`,
                  background: tier
                    ? `radial-gradient(ellipse at 50% 110%, ${rgba(tier.color, 0.34)}, transparent 70%), linear-gradient(180deg, ${well[0]}, ${well[1]})`
                    : `linear-gradient(180deg, ${mixHex(well[0], "#000000", 0.25)}, ${well[1]})`,
                  boxShadow: `${ring ? `0 0 0 2px ${ring}, 0 0 18px ${rgba(ring, 0.5)}, ` : ""}inset 0 2px 8px rgba(0,0,0,0.75)`,
                  overflow: "hidden",
                  transform: isHeld ? "translateY(-4px) scale(1.06)" : undefined,
                  zIndex: isHeld ? 2 : undefined,
                }}
              >
                {item ? (
                  <span className="sf-inventory-grid-art" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", overflow: "hidden", opacity: isSource ? 0.2 : 1 }}>
                    <ItemArt item={item} size={slotSize} />
                  </span>
                ) : null}
                {tier && item?.rarity && item.rarity !== "common" ? (
                  <span aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, borderTop: `10px solid ${tier.color}`, borderRight: "10px solid transparent", filter: `drop-shadow(0 0 4px ${tier.color})` }} />
                ) : null}
                {item?.rarity === "legendary" ? (
                  <span aria-hidden className="sf-inventory-grid-legendary" style={{ position: "absolute", inset: 0, borderRadius: "inherit", boxShadow: `inset 0 0 14px ${rgba(tier!.color, 0.7)}`, pointerEvents: "none" }} />
                ) : null}
                {item?.count && item.count > 1 ? (
                  <span aria-hidden style={{ position: "absolute", right: 4, bottom: 2, fontFamily: theme.numeric, fontSize: 12, fontWeight: 700, color: "#fff", textShadow: "0 1px 2px #000, 0 0 4px #000" }}>{item.count}</span>
                ) : null}
                {isHeld ? <span aria-hidden style={{ position: "absolute", inset: 3, border: `1px dashed ${accent}`, borderRadius: theme.radius }} /> : null}
              </button>
            );
          })}

          {dragItem ? (
            <div ref={ghostRef} aria-hidden style={{ position: "absolute", left: 0, top: 0, width: slotSize, height: slotSize, pointerEvents: "none", zIndex: 5, borderRadius: theme.radius + 2, border: `1px solid ${RARITY[rarityOf(dragItem.rarity)].color}`, background: "rgba(16,12,10,0.85)", boxShadow: `0 16px 30px rgba(0,0,0,0.6), 0 0 22px ${rgba(RARITY[rarityOf(dragItem.rarity)].color, 0.5)}`, display: "grid", placeItems: "center", overflow: "hidden" }}>
              <ItemArt item={dragItem} size={slotSize} />
            </div>
          ) : null}

          {tipItem && tipStyle ? (
            <div key={tipItem.id} role="tooltip" className="sf-inventory-grid-tip" style={{ ...tipStyle, zIndex: 6, width: 236, pointerEvents: "none", padding: "12px 14px", background: "linear-gradient(180deg, rgba(20,16,13,0.97), rgba(10,8,7,0.98))", borderRadius: theme.radius + 2, clipPath: theme.clip(8), boxShadow: `inset 0 0 0 1px ${rgba(RARITY[rarityOf(tipItem.rarity)].color, 0.55)}, 0 18px 40px rgba(0,0,0,0.7)` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: mixHex(RARITY[rarityOf(tipItem.rarity)].color, "#ffffff", 0.2), lineHeight: 1.2 }}>{tipItem.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: theme.muted }}>
                <span>{tipItem.type ?? "Item"}</span>
                <span style={{ color: RARITY[rarityOf(tipItem.rarity)].color }}>{RARITY[rarityOf(tipItem.rarity)].label}</span>
              </div>
              {tipItem.stats?.length ? (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  {tipItem.stats.map(stat => (
                    <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, lineHeight: 1.6 }}>
                      <span style={{ color: theme.muted }}>{stat.label}</span>
                      <span style={{ color: "#8ff0a4", fontFamily: theme.numeric, fontWeight: 700 }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {tipItem.description ? <div style={{ marginTop: 8, fontSize: 12, fontStyle: "italic", lineHeight: 1.45, color: "rgba(236,216,180,0.7)" }}>{tipItem.description}</div> : null}
              {tipItem.value ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginTop: 8, fontFamily: theme.numeric, fontSize: 12, color: "#ffd98a" }}>
                  <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff3c4, #e0a93a 55%, #8a5a12)" }} />
                  {tipItem.value.toLocaleString("en-US")}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: theme.muted, letterSpacing: "0.04em", opacity: 0.8 }}>{held !== null ? "Choose a slot and press Enter to swap · Esc to cancel" : "Drag to rearrange · Arrows + Enter to move"}</div>
      </div>
    </div>
  );
}

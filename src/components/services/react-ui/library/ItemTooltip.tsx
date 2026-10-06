"use client";
/* eslint-disable @next/next/no-img-element -- copy-paste component: a plain <img> keeps it framework-agnostic. */

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { GameGlyph, RARITY, gameTheme, mixHex, rarityOf, rgba, type GameVariant, type GlyphName, type Rarity } from "./_shared/gameKit";

export type ItemStat = {
  label: string;
  /** This item's value. */
  value: number;
  /** The equipped item's value, for the comparison delta. */
  equipped?: number;
  /** Suffix such as "%". */
  unit?: string;
  /** Lower values are better (e.g. cast time), flips the delta colors. */
  lowerIsBetter?: boolean;
};

export type ItemTooltipProps = {
  /** Rarity tier; colors the header, name, border and glow. */
  rarity?: Rarity;
  itemName?: string;
  itemType?: string;
  itemLevel?: number;
  /** Icon used when no image is set. */
  glyph?: GlyphName;
  /** Visual style. */
  variant?: GameVariant;
  /** Show green / red deltas against the equipped item. */
  compare?: boolean;
  /** Sell value in gold (0 hides it). */
  sellValue?: number;
  /** Keep the tooltip open. Off = show on hover / focus of the slot. */
  pinned?: boolean;
  /** Item art URL (wins over glyph). */
  image?: string;
  /** Zoom for the image, e.g. 1.3 to crop a baked-in frame. */
  imageScale?: number;
  /** Custom icon node for the slot (wins over image and glyph). */
  icon?: ReactNode;
  /** Headline stat, e.g. weapon damage. `delta` is shown as a comparison chip. */
  primary?: { label: string; value: string; note?: string; delta?: number; deltaLabel?: string } | null;
  /** Stat lines with optional equipped values. */
  stats?: ItemStat[];
  /** Special effect lines, e.g. "Equip: …". */
  effects?: string[];
  /** Flavor text. */
  flavor?: string;
  /** Required character level (0 hides it). */
  requiredLevel?: number;
  /** [current, max] durability. */
  durability?: [number, number] | null;
  /** Name of the equipped item in the comparison caption. */
  equippedName?: string;
  /** Which side of the slot the card opens on. */
  placement?: "right" | "left";
  /** Reserve the card's space in the layout (off = the card floats over neighbours). */
  inline?: boolean;
  /** Controlled open state (overrides hover / focus). */
  open?: boolean;
  /** Hover / focus asked to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** The slot was clicked or activated with Enter / Space. */
  onActivate?: () => void;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_STATS: ItemStat[] = [
  { label: "Strength", value: 48, equipped: 36 },
  { label: "Critical Strike", value: 12, equipped: 14, unit: "%" },
  { label: "Stamina", value: 31, equipped: 22 },
  { label: "Attack Speed", value: 8, equipped: 8, unit: "%" },
  { label: "Fire Resistance", value: 0, equipped: 15 },
];

const CSS = `
.sf-item-tooltip-card { transition: opacity .16s cubic-bezier(.2,.9,.3,1), transform .2s cubic-bezier(.2,.9,.3,1), visibility 0s; }
.sf-item-tooltip-card.is-closed { transition: opacity .12s ease-in, transform .12s ease-in, visibility 0s .12s; }
.sf-item-tooltip-slot { transition: transform .18s cubic-bezier(.2,.9,.3,1.3), box-shadow .2s; }
.sf-item-tooltip-slot:hover { transform: translateY(-2px); }
.sf-item-tooltip-slot:focus-visible { outline: 2px solid var(--sf-it-rarity); outline-offset: 3px; }
.sf-item-tooltip-sheen { animation: sf-item-tooltip-sheen 3.6s cubic-bezier(.45,0,.2,1) infinite; }
@keyframes sf-item-tooltip-sheen { 0%, 55% { transform: translateX(-100%) skewX(-24deg); } 100% { transform: translateX(420%) skewX(-24deg); } }
.sf-item-tooltip-glint { animation: sf-item-tooltip-glint 2.8s ease-in-out infinite; }
@keyframes sf-item-tooltip-glint { 0%, 100% { opacity: .35; } 50% { opacity: .9; } }
@media (prefers-reduced-motion: reduce) {
  .sf-item-tooltip-card, .sf-item-tooltip-card.is-closed, .sf-item-tooltip-slot { transition: none; }
  .sf-item-tooltip-sheen { animation: none; display: none; }
  .sf-item-tooltip-glint { animation: none; }
}
`;

const GOOD = "#6fe38f";
const BAD = "#ff6a5f";

function Delta({ value, lowerIsBetter, unit = "", font }: { value: number; lowerIsBetter?: boolean; unit?: string; font: string }) {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return <span style={{ font: `600 11.5px/1 ${font}`, color: "rgba(255,255,255,0.28)", minWidth: 42, textAlign: "right" }}>—</span>;
  const better = lowerIsBetter ? rounded < 0 : rounded > 0;
  const color = better ? GOOD : BAD;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 4, minWidth: 42, fontWeight: 700, fontSize: 12, lineHeight: 1, fontFamily: font, fontVariantNumeric: "tabular-nums", color }}>
      <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden style={{ transform: rounded > 0 ? undefined : "rotate(180deg)" }}>
        <path d="M4 0 8 7H0Z" fill={color} />
      </svg>
      {Math.abs(rounded)}
      {unit}
    </span>
  );
}

export function ItemTooltip({
  rarity = "legendary",
  itemName = "Emberheart Blade",
  itemType = "Two-handed Sword",
  itemLevel = 58,
  glyph = "sword",
  variant = "fantasy",
  compare = true,
  sellValue = 1240,
  pinned = true,
  image,
  imageScale,
  icon,
  primary = { label: "Damage", value: "142 – 188", note: "1.35 attacks / sec", delta: 18.4, deltaLabel: "DPS" },
  stats = DEFAULT_STATS,
  effects = ["Equip: Critical strikes ignite the target for 6% of the damage dealt over 4 sec."],
  flavor = "Quenched in a dying star. It never cooled.",
  requiredLevel = 42,
  durability = [84, 100],
  equippedName = "Warden's Greatsword",
  placement = "right",
  inline = true,
  open: openProp,
  onOpenChange,
  onActivate,
  className,
  style,
}: ItemTooltipProps) {
  const theme = gameTheme(variant);
  const uid = useId().replace(/:/g, "");
  const tier = RARITY[rarityOf(rarity)];
  const [hovered, setHovered] = useState(false);
  const open = openProp ?? (pinned || hovered);
  const color = tier.color;
  const light = mixHex(color, "#ffffff", rarity === "common" ? 0.4 : 0.22);
  const slot = 76;
  const cardW = 300;
  const shown = (value: boolean) => {
    setHovered(value);
    onOpenChange?.(value);
  };

  const panel =
    variant === "fantasy"
      ? "linear-gradient(180deg, rgba(30,22,16,0.98), rgba(14,10,8,0.985))"
      : variant === "minimal"
        ? "linear-gradient(180deg, rgba(26,26,30,0.97), rgba(16,16,19,0.98))"
        : "linear-gradient(180deg, rgba(10,17,23,0.97), rgba(4,8,11,0.98))";
  const divider = variant === "fantasy" ? <div aria-hidden style={{ height: 1, margin: "9px 0", background: `linear-gradient(90deg, transparent, ${rgba("#d4ae68", 0.45)}, transparent)` }} /> : <div aria-hidden style={{ height: 1, margin: "9px 0", background: "rgba(255,255,255,0.08)" }} />;

  const art = icon ?? (image ? (
    <img src={image} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: imageScale && imageScale > 1 ? "cover" : "contain", transform: imageScale ? `scale(${imageScale})` : undefined, padding: imageScale && imageScale > 1 ? 0 : 6, boxSizing: "border-box" }} />
  ) : (
    <GameGlyph name={glyph} color={mixHex(color, "#ffffff", 0.15)} size={slot * 0.58} />
  ));

  const slotEl = (
    <button
      type="button"
      className="sf-item-tooltip-slot"
      aria-label={`${itemName}, ${tier.label} ${itemType}`}
      aria-describedby={open ? `${uid}-card` : undefined}
      aria-expanded={open}
      onPointerEnter={() => shown(true)}
      onPointerLeave={() => shown(false)}
      onFocus={() => shown(true)}
      onBlur={() => shown(false)}
      onKeyDown={event => {
        if (event.key === "Escape") shown(false);
      }}
      onClick={onActivate}
      style={{
        position: "relative",
        flex: "none",
        width: slot,
        height: slot,
        padding: 0,
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: variant === "minimal" ? 12 : theme.radius + 2,
        clipPath: theme.clip(10),
        border: `1px solid ${rgba(color, 0.75)}`,
        background: `radial-gradient(ellipse at 50% 115%, ${rgba(color, 0.5)}, transparent 70%), linear-gradient(180deg, ${variant === "fantasy" ? "#1b1510, #0a0806" : variant === "minimal" ? "#1f1f23, #121215" : "#101920, #05090c"})`,
        boxShadow: `inset 0 2px 10px rgba(0,0,0,0.75), 0 0 ${open ? 26 : 14}px ${rgba(color, open ? 0.45 : 0.25)}`,
        display: "grid",
        placeItems: "center",
      }}
    >
      {art}
      {rarity === "legendary" || rarity === "epic" ? <span aria-hidden className="sf-item-tooltip-glint" style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 16px ${rgba(color, 0.75)}`, pointerEvents: "none" }} /> : null}
      <span aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, borderTop: `12px solid ${color}`, borderRight: "12px solid transparent" }} />
    </button>
  );

  const card = (
    <div
      id={`${uid}-card`}
      role="tooltip"
      aria-hidden={!open}
      className={`sf-item-tooltip-card${open ? "" : " is-closed"}`}
      style={{
        position: inline ? "relative" : "absolute",
        ...(inline ? {} : placement === "left" ? { right: slot + 14, top: 0 } : { left: slot + 14, top: 0 }),
        zIndex: 4,
        width: cardW,
        flex: "none",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transform: open ? "none" : `translateX(${placement === "left" ? 8 : -8}px) scale(0.985)`,
        transformOrigin: placement === "left" ? "right top" : "left top",
        pointerEvents: "none",
        background: panel,
        borderRadius: variant === "minimal" ? 12 : theme.radius + 2,
        clipPath: theme.clip(12),
        boxShadow: `inset 0 0 0 1px ${rgba(color, variant === "minimal" ? 0.35 : 0.55)}, 0 22px 50px rgba(0,0,0,0.7)${rarity === "legendary" ? `, 0 0 40px ${rgba(color, 0.18)}` : ""}`,
        overflow: "hidden",
        textAlign: "left",
      }}
    >
      {/* Header */}
      <div style={{ position: "relative", padding: "13px 16px 11px", background: `linear-gradient(180deg, ${rgba(tier.deep, 0.95)}, ${rgba(tier.deep, 0.25)} 70%, transparent)`, borderTop: `2px solid ${color}`, overflow: "hidden" }}>
        {rarity === "legendary" ? <span aria-hidden className="sf-item-tooltip-sheen" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "28%", background: `linear-gradient(90deg, transparent, ${rgba("#ffffff", 0.16)}, transparent)` }} /> : null}
        {variant === "sci-fi" ? <span aria-hidden style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(0deg, ${rgba(color, 0.05)} 0 1px, transparent 1px 3px)` }} /> : null}
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.15, color: light, letterSpacing: theme.caps ? "0.03em" : 0, textShadow: `0 0 16px ${rgba(color, 0.45)}` }}>{itemName}</span>
          {itemLevel > 0 ? <span style={{ flex: "none", marginTop: 2, padding: "3px 6px", borderRadius: variant === "minimal" ? 6 : 2, font: `700 11px/1 ${theme.numeric}`, color: "#ffd45e", background: "rgba(0,0,0,0.35)", boxShadow: "inset 0 0 0 1px rgba(255,212,94,0.3)", whiteSpace: "nowrap" }}>iLvl {itemLevel}</span> : null}
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 5, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span style={{ color: theme.muted }}>{itemType}</span>
          <span style={{ color }}>{tier.label}</span>
        </div>
      </div>

      <div style={{ padding: "2px 16px 12px" }}>
        {primary ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 8 }}>
              <div>
                <div style={{ fontFamily: theme.numeric, fontSize: 22, fontWeight: 700, lineHeight: 1, color: theme.text, fontVariantNumeric: "tabular-nums" }}>{primary.value}</div>
                <div style={{ marginTop: 5, fontSize: 11.5, color: theme.muted }}>
                  {primary.label}
                  {primary.note ? ` · ${primary.note}` : ""}
                </div>
              </div>
              {compare && primary.delta !== undefined ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 7px", borderRadius: variant === "minimal" ? 6 : 2, background: rgba(primary.delta >= 0 ? GOOD : BAD, 0.12), boxShadow: `inset 0 0 0 1px ${rgba(primary.delta >= 0 ? GOOD : BAD, 0.3)}` }}>
                  <Delta value={primary.delta} font={theme.numeric} />
                  {primary.deltaLabel ? <span style={{ fontSize: 10, letterSpacing: "0.08em", color: theme.muted }}>{primary.deltaLabel}</span> : null}
                </span>
              ) : null}
            </div>
            {divider}
          </>
        ) : null}

        {stats.length ? (
          <div>
            {compare ? (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: rgba(theme.text, 0.36) }}>
                <span>Stats</span>
                <span>vs. {equippedName}</span>
              </div>
            ) : null}
            {stats.map(stat => {
              const lost = stat.value === 0 && (stat.equipped ?? 0) !== 0;
              return (
                <div key={stat.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 13, lineHeight: 1.62 }}>
                  <span style={{ color: lost ? rgba(BAD, 0.8) : theme.text, textDecoration: lost ? "line-through" : undefined, textDecorationColor: rgba(BAD, 0.6) }}>
                    <span style={{ fontFamily: theme.numeric, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: lost ? undefined : "#ffffff" }}>{lost ? stat.equipped : `+${stat.value}`}{stat.unit ?? ""}</span>{" "}
                    <span style={{ color: lost ? undefined : theme.muted }}>{stat.label}</span>
                  </span>
                  {compare && stat.equipped !== undefined ? <Delta value={stat.value - stat.equipped} lowerIsBetter={stat.lowerIsBetter} unit={stat.unit} font={theme.numeric} /> : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {effects.length ? (
          <div style={{ marginTop: 8 }}>
            {effects.map(line => (
              <div key={line} style={{ fontSize: 12.5, lineHeight: 1.45, color: "#7fe3a0" }}>{line}</div>
            ))}
          </div>
        ) : null}

        {flavor ? <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.45, fontStyle: "italic", fontFamily: variant === "fantasy" ? theme.numeric : undefined, color: variant === "fantasy" ? "rgba(236,206,150,0.72)" : rgba(theme.text, 0.55) }}>“{flavor}”</div> : null}

        {divider}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontFamily: theme.numeric, fontSize: 11.5, color: theme.muted }}>
          <span>
            {[requiredLevel > 0 ? `Requires Lv ${requiredLevel}` : "", durability ? `Durability ${durability[0]}/${durability[1]}` : ""].filter(Boolean).join(" · ")}
          </span>
          {sellValue > 0 ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#ffd98a" }}>
              <span aria-hidden style={{ width: 11, height: 11, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff3c4, #e0a93a 55%, #8a5a12)", boxShadow: "0 0 6px rgba(255,200,90,0.5)" }} />
              {sellValue.toLocaleString("en-US")}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={className}
      style={{ position: "relative", display: "inline-flex", alignItems: "flex-start", flexDirection: placement === "left" ? "row-reverse" : "row", gap: 14, fontFamily: theme.font, color: theme.text, ["--sf-it-rarity" as string]: color, ...style }}
    >
      <style>{CSS}</style>
      {slotEl}
      {card}
    </div>
  );
}

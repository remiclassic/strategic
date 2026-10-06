"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from "react";
import { useReducedMotion } from "./_shared/hooks";
import {
  GLYPHS,
  clamp,
  gameTheme,
  mixHex,
  rgba,
  type GameVariant,
  type GlyphName,
} from "./_shared/gameKit";

export type KillFeedTeam = "ally" | "enemy" | "neutral";

export type KillFeedEntry = {
  /** Unique id; entries with new ids are added as they appear. */
  id: string | number;
  killer: string;
  victim: string;
  /** Weapon key ("rifle", "sniper", "shotgun", "pistol", "smg", "knife", "grenade", "sword", "axe", "bow") or any game glyph name. */
  weapon?: string;
  headshot?: boolean;
  killerTeam?: KillFeedTeam;
  victimTeam?: KillFeedTeam;
};

export type KillFeedHandle = {
  /** Add an entry (id is generated when omitted). */
  push: (entry: Omit<KillFeedEntry, "id"> & { id?: string | number }) => void;
};

export type KillFeedProps = {
  /** Feed entries. Append new items; each one expires on its own after `ttl`. */
  entries?: KillFeedEntry[];
  /** Seconds an entry stays before fading out. */
  ttl?: number;
  /** Maximum rows on screen; older rows are pushed out early. */
  maxEntries?: number;
  /** Local player's name — rows involving them are highlighted. */
  playerName?: string;
  /** Allied team name color. */
  allyColor?: string;
  /** Enemy team name color. */
  enemyColor?: string;
  /** Headshot marker and "your kill" frame color. */
  highlightColor?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Side the feed hugs; rows slide in from that edge. */
  align?: "right" | "left";
  /** Feed width in px. */
  width?: number;
  /** Auto-generate sample events (preview / testing). */
  demo?: boolean;
  /** Imperative handle: `ref.current.push({ killer, victim, weapon })`. */
  ref?: Ref<KillFeedHandle>;
  /** Called when an entry appears. */
  onEntry?: (entry: KillFeedEntry) => void;
  /** Called when an entry fades out. */
  onExpire?: (entry: KillFeedEntry) => void;
  className?: string;
  style?: CSSProperties;
};

/* ---------- Weapon silhouettes (48×16, original) ---------- */

type Shape = { d: string; stroke?: number };

const WEAPONS: Record<string, Shape[]> = {
  rifle: [
    { d: "M1 6.4 10 5v5.6L2.8 12.8 1 12.2Z" },
    { d: "M10 4h20v5H10Z" },
    { d: "M15.5 2.4h8.5V4h-8.5Z" },
    { d: "M30 4.5h8.4v4H30Z" },
    { d: "M38.4 5.6H47v1.6h-8.6Z" },
    { d: "M20.4 9h4l1.6 5.4-3.6.8Z" },
    { d: "M12.6 9h3.4l-1.2 5.2h-3Z" },
  ],
  smg: [
    { d: "M4 5.6h8v1.4H6.4v3.4H4Z" },
    { d: "M12 4h18v5.2H12Z" },
    { d: "M30 5.2h8v2.2h-8Z" },
    { d: "M17 2.8h6V4h-6Z" },
    { d: "M22 9.2h3.6l.4 6.2h-3.4Z" },
    { d: "M14 9.2h3.4l-1.4 5h-3Z" },
  ],
  sniper: [
    { d: "M1 6.8 9 5.4v4.8L2.6 12.4 1 11.8Z" },
    { d: "M9 5h15v4H9Z" },
    { d: "M11.6 1.6h11.8v2.6H11.6Z" },
    { d: "M14 4.2h2V5h-2ZM20 4.2h2V5h-2Z" },
    { d: "M24 5.9h23v1.3H24Z" },
    { d: "M43.6 5h3.2v3.1h-3.2Z" },
    { d: "M16 9h3.6l-.4 3.8H16Z" },
    { d: "M10.8 9H14l-1.2 4.6h-2.8Z" },
  ],
  shotgun: [
    { d: "M1 6.2 11 5v5L3 12.6 1 12Z" },
    { d: "M11 4.6h12v4.4H11Z" },
    { d: "M23 4.8h24v1.7H23Z" },
    { d: "M24.5 7.1h13v2.8h-13Z" },
    { d: "M37.5 7.4H46v1.3h-8.5Z" },
    { d: "M13.6 9h3.2l-1.3 4.6h-3Z" },
  ],
  pistol: [
    { d: "M13 4h21.5v4.4H13Z" },
    { d: "M14.4 8.4h8.6v1.4h-2.6l1.8 5.8h-5.4l-2.4-5.4Z" },
    { d: "M22 9.8h4.2c.4 1.8-.5 2.8-2.4 2.8h-1.2v-1.2h1c.8 0 1-.5.9-1.6H22Z" },
    { d: "M31 2.8h2.2V4H31Z" },
  ],
  knife: [
    { d: "M6 6.6h11.6v3H7.6L6 8.2Z" },
    { d: "M17.6 4.8h1.8v6.6h-1.8Z" },
    { d: "M19.4 6.4H36c3.2 0 5.6 1 8 2.8-5.4.8-12.6.8-24.6.8Z" },
  ],
  grenade: [
    { d: "M24 5.6a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4Z" },
    { d: "M21.6 2.4h5.6v3.6h-5.6Z" },
    { d: "M27.2 3h4.6v1.5h-4.6Z" },
    { d: "M18 4.8a2.2 2.2 0 1 1 4.2-1", stroke: 1.3 },
  ],
  sword: [
    { d: "M18 6.8h22.4L46 8l-5.6 1.2H18Z" },
    { d: "M15.2 3.6h2.8v8.8h-2.8Z" },
    { d: "M7.6 6.9h7.6v2.2H7.6Z" },
    { d: "M5.2 6.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z" },
  ],
  axe: [
    { d: "M5 7.1h32v1.8H5Z" },
    {
      d: "M29.6 1.2c4.4.4 7.6 2.8 8.8 6.8-1.2 4-4.4 6.4-8.8 6.8 1.5-2.2 2.2-4.4 2.2-6.8s-.7-4.6-2.2-6.8Z",
    },
    { d: "M27.4 3.6h3v8.8h-3Z" },
  ],
  bow: [
    { d: "M15 1.4C27 3.6 27 12.4 15 14.6", stroke: 1.9 },
    { d: "M15 1.4v13.2", stroke: 0.7 },
    { d: "M6 8h34", stroke: 1.2 },
    { d: "M39 5.6 45 8l-6 2.4Z" },
    { d: "M6 8 3 5.8M6 8l-3 2.2", stroke: 1 },
  ],
};

function WeaponIcon({
  name,
  color,
  height,
}: {
  name: string;
  color: string;
  height: number;
}) {
  const shapes = WEAPONS[name];
  const shadow = "drop-shadow(0 1px 0 rgba(0,0,0,0.7))";
  if (shapes) {
    return (
      <svg
        viewBox="0 0 48 16"
        width={height * 3}
        height={height}
        aria-hidden
        style={{ display: "block", overflow: "visible", filter: shadow }}
      >
        {shapes.map((shape, i) =>
          shape.stroke ? (
            <path
              key={i}
              d={shape.d}
              fill="none"
              stroke={color}
              strokeWidth={shape.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path key={i} d={shape.d} fill={color} />
          ),
        )}
      </svg>
    );
  }
  const glyph =
    (GLYPHS as Record<string, { d: string; evenOdd?: boolean }>)[name] ??
    GLYPHS.skull;
  const size = height * 1.15;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      style={{ display: "block", margin: "0 6px", filter: shadow }}
    >
      <path
        d={glyph.d}
        fill={color}
        fillRule={glyph.evenOdd ? "evenodd" : "nonzero"}
      />
    </svg>
  );
}

function HeadshotIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden
      style={{
        display: "block",
        overflow: "visible",
        filter: `drop-shadow(0 0 4px ${rgba(color, 0.8)})`,
      }}
    >
      <circle
        cx="8"
        cy="8"
        r="5.1"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M8 .6v3.6M8 11.8v3.6M.6 8h3.6M11.8 8h3.6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="8" r="1.9" fill={color} />
    </svg>
  );
}

const WEAPON_LABEL: Record<string, string> = { smg: "SMG" };
const weaponLabel = (name: string) =>
  WEAPON_LABEL[name] ?? name.charAt(0).toUpperCase() + name.slice(1);

/* ---------- Demo data ---------- */

const ALLIES = ["Mira", "Tundra", "hollowpoint", "Oakes"];
const ENEMIES = ["NOVA_7", "Vex", "Sable", "Ashgrave", "r0gue", "Wren"];
const GUNS = [
  "rifle",
  "rifle",
  "sniper",
  "shotgun",
  "pistol",
  "smg",
  "knife",
  "grenade",
];
const MEDIEVAL = ["sword", "sword", "axe", "bow", "bow", "flame", "bolt"];
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const CSS = `
.sf-kill-feed-slot { transition: transform .5s cubic-bezier(.2,.9,.25,1); }
.sf-kill-feed-row { transition: opacity .45s ease, transform .5s cubic-bezier(.4,0,.2,1), filter .45s; }
.sf-kill-feed-in-right { animation: sf-kill-feed-in-right .55s cubic-bezier(.16,1,.3,1) both; }
.sf-kill-feed-in-left { animation: sf-kill-feed-in-left .55s cubic-bezier(.16,1,.3,1) both; }
@keyframes sf-kill-feed-in-right { 0% { opacity: 0; transform: translateX(56px) scaleX(.86); filter: brightness(2.4); } 55% { opacity: 1; transform: translateX(-5px) scaleX(1.01); } 100% { opacity: 1; transform: none; filter: none; } }
@keyframes sf-kill-feed-in-left { 0% { opacity: 0; transform: translateX(-56px) scaleX(.86); filter: brightness(2.4); } 55% { opacity: 1; transform: translateX(5px) scaleX(1.01); } 100% { opacity: 1; transform: none; filter: none; } }
.sf-kill-feed-sweep { animation: sf-kill-feed-sweep .7s cubic-bezier(.3,0,.2,1) .08s both; }
@keyframes sf-kill-feed-sweep { from { transform: translateX(-110%) skewX(-24deg); opacity: 1; } to { transform: translateX(560%) skewX(-24deg); opacity: 0; } }
.sf-kill-feed-hs { animation: sf-kill-feed-hs .5s cubic-bezier(.2,1.6,.4,1) .2s both; }
@keyframes sf-kill-feed-hs { from { transform: scale(2.2) rotate(-90deg); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .sf-kill-feed-slot, .sf-kill-feed-row { transition: opacity .2s; }
  .sf-kill-feed-in-right, .sf-kill-feed-in-left, .sf-kill-feed-hs { animation: sf-kill-feed-fade .2s both; }
  .sf-kill-feed-sweep { animation: none; opacity: 0; }
}
@keyframes sf-kill-feed-fade { from { opacity: 0; } to { opacity: 1; } }
`;

type Item = { entry: KillFeedEntry; born: number; leaving: boolean };

let uid = 0;

export function KillFeed({
  entries = [],
  ttl = 6,
  maxEntries = 5,
  playerName = "Kestrel",
  allyColor = "#5cc8ff",
  enemyColor = "#ff5a4e",
  highlightColor = "#ffd34d",
  variant = "sci-fi",
  align = "right",
  width = 440,
  demo = false,
  ref,
  onEntry,
  onExpire,
  className,
  style,
}: KillFeedProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const [items, setItems] = useState<Item[]>([]);
  const seen = useRef(new Set<string | number>());
  const live = useRef({
    ttl,
    maxEntries,
    onEntry,
    onExpire,
    playerName,
    variant,
  });
  live.current = { ttl, maxEntries, onEntry, onExpire, playerName, variant };
  const removals = useRef(new Set<ReturnType<typeof setTimeout>>());
  const expired = useRef(new Set<string | number>());

  const add = (entry: KillFeedEntry) => {
    if (seen.current.has(entry.id)) return;
    seen.current.add(entry.id);
    setItems((previous) => {
      const next = [
        { entry, born: performance.now(), leaving: false },
        ...previous,
      ];
      // Push out the oldest rows beyond the cap.
      let visible = 0;
      return next.map((item) => {
        if (item.leaving) return item;
        visible += 1;
        return visible > Math.max(1, live.current.maxEntries)
          ? { ...item, leaving: true }
          : item;
      });
    });
    live.current.onEntry?.(entry);
  };
  const addRef = useRef(add);
  addRef.current = add;

  useImperativeHandle(
    ref,
    () => ({
      push: (entry) =>
        addRef.current({ ...entry, id: entry.id ?? `kf-${++uid}` }),
    }),
    [],
  );

  // Pick up new ids from the controlled list.
  const signature = entries.map((entry) => entry.id).join("|");
  useEffect(() => {
    entries.forEach((entry) => addRef.current(entry));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // Expire rows after ttl; drop them once the fade has played.
  const hasItems = items.length > 0;
  useEffect(() => {
    if (!hasItems) return;
    const timer = setInterval(() => {
      const now = performance.now();
      setItems((previous) => {
        let changed = false;
        const next = previous.map((item) => {
          if (!item.leaving && now - item.born > live.current.ttl * 1000) {
            changed = true;
            return { ...item, leaving: true };
          }
          return item;
        });
        return changed ? next : previous;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [hasItems]);

  const leavingKey = items
    .filter((item) => item.leaving)
    .map((item) => item.entry.id)
    .join("|");
  useEffect(() => {
    const leaving = items.filter((item) => item.leaving);
    if (!leaving.length) return;
    const timer = setTimeout(() => {
      removals.current.delete(timer);
      const ids = new Set(leaving.map((item) => item.entry.id));
      setItems((previous) =>
        previous.filter((item) => !ids.has(item.entry.id)),
      );
      leaving.forEach((item) => {
        if (expired.current.has(item.entry.id)) return;
        expired.current.add(item.entry.id);
        live.current.onExpire?.(item.entry);
      });
    }, 520);
    removals.current.add(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leavingKey]);
  useEffect(() => {
    const pending = removals.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  // Demo generator.
  useEffect(() => {
    if (!demo) return;
    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      const fantasy = live.current.variant === "fantasy";
      const me = live.current.playerName || "You";
      const allies = [me, ...ALLIES];
      const allyKills = Math.random() < 0.55;
      const killer = allyKills
        ? Math.random() < 0.35
          ? me
          : pick(ALLIES)
        : pick(ENEMIES);
      let victim = allyKills ? pick(ENEMIES) : pick(allies);
      if (victim === killer) victim = pick(ENEMIES);
      const weapon = pick(fantasy ? MEDIEVAL : GUNS);
      const headshot =
        !["knife", "grenade", "flame", "axe"].includes(weapon) &&
        Math.random() < 0.32;
      addRef.current({
        id: `demo-${++uid}`,
        killer,
        victim,
        weapon,
        headshot,
        killerTeam: allyKills ? "ally" : "enemy",
        victimTeam: allyKills ? "enemy" : "ally",
      });
    };
    const seed = [0, 260, 520].map((delay) => setTimeout(spawn, delay + 200));
    const loop = () => {
      timer = setTimeout(
        () => {
          if (!document.hidden) spawn();
          loop();
        },
        1100 + Math.random() * 1300,
      );
    };
    loop();
    return () => {
      clearTimeout(timer);
      seed.forEach(clearTimeout);
    };
  }, [demo]);

  const rowH = 36;
  const gap = 6;
  const step = rowH + gap;
  const cap = clamp(Math.round(maxEntries), 1, 12);
  const teamColor = (team: KillFeedTeam | undefined, name: string) =>
    name === playerName
      ? mixHex(highlightColor, "#ffffff", 0.2)
      : team === "ally"
        ? allyColor
        : team === "enemy"
          ? enemyColor
          : theme.text;
  const iconColor = variant === "fantasy" ? "#f1e2c2" : "#f2f6fa";
  const right = align !== "left";
  const skew = variant === "sci-fi" ? 10 : 0;
  const clipRow =
    variant === "sci-fi"
      ? right
        ? `polygon(${skew}px 0, 100% 0, 100% 100%, 0 100%)`
        : `polygon(0 0, 100% 0, calc(100% - ${skew}px) 100%, 0 100%)`
      : undefined;

  const slots: number[] = [];
  items.reduce((count, item) => {
    slots.push(count);
    return item.leaving ? count : count + 1;
  }, 0);
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Kill feed"
      className={className}
      style={{
        position: "relative",
        width,
        maxWidth: "100%",
        height: cap * step - gap,
        fontFamily: theme.font,
        ...style,
      }}
    >
      <style>{CSS}</style>
      {items.map((item, order) => {
        const { entry } = item;
        const index = slots[order];
        const mine = entry.killer === playerName;
        const died = entry.victim === playerName;
        const weapon = entry.weapon ?? "rifle";
        const killerColor = teamColor(entry.killerTeam, entry.killer);
        const victimColor = teamColor(entry.victimTeam, entry.victim);
        const edge = mine
          ? highlightColor
          : entry.killerTeam === "ally"
            ? allyColor
            : entry.killerTeam === "enemy"
              ? enemyColor
              : theme.line;
        const background =
          variant === "fantasy"
            ? `linear-gradient(${right ? 270 : 90}deg, rgba(52,38,24,0.96), rgba(36,26,17,0.9) 65%, rgba(30,21,14,0.6))`
            : variant === "minimal"
              ? "rgba(34,34,40,0.78)"
              : `linear-gradient(${right ? 270 : 90}deg, rgba(22,34,46,0.94), rgba(14,24,34,0.86) 65%, rgba(12,20,28,0.55))`;
        const tint = mine
          ? rgba(highlightColor, variant === "minimal" ? 0.16 : 0.2)
          : died
            ? rgba(enemyColor, 0.22)
            : "transparent";
        const nameStyle = (color: string): CSSProperties => ({
          color,
          fontWeight: 700,
          fontSize: variant === "minimal" ? 13 : 15,
          letterSpacing:
            variant === "sci-fi"
              ? "0.06em"
              : variant === "fantasy"
                ? "0.04em"
                : "0",
          textTransform: variant === "sci-fi" ? "uppercase" : "none",
          maxWidth: 150,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textShadow: `0 1px 0 rgba(0,0,0,0.8), 0 0 12px ${rgba(color.startsWith("#") ? color : "#ffffff", 0.35)}`,
        });
        return (
          <div
            key={entry.id}
            className="sf-kill-feed-slot"
            style={{
              position: "absolute",
              top: 0,
              [right ? "right" : "left"]: 0,
              height: rowH,
              transform: `translateY(${index * step}px)`,
              zIndex: 100 - index,
              maxWidth: "100%",
            }}
          >
            <div
              className={`sf-kill-feed-row ${item.leaving ? "" : right ? "sf-kill-feed-in-right" : "sf-kill-feed-in-left"}`}
              style={{
                position: "relative",
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding:
                  variant === "sci-fi"
                    ? right
                      ? "0 14px 0 20px"
                      : "0 20px 0 14px"
                    : "0 14px",
                boxSizing: "border-box",
                background,
                borderRadius:
                  variant === "minimal" ? 9 : variant === "fantasy" ? 2 : 0,
                clipPath: clipRow,
                transformOrigin: right ? "100% 50%" : "0 50%",
                opacity: item.leaving ? 0 : 1,
                transform: item.leaving
                  ? `translateX(${right ? 28 : -28}px)`
                  : undefined,
                filter: item.leaving && !reduced ? "blur(2px)" : undefined,
                backdropFilter:
                  variant === "minimal" ? "blur(10px)" : undefined,
                boxShadow:
                  variant === "minimal"
                    ? `inset 0 0 0 1px ${mine ? rgba(highlightColor, 0.7) : "rgba(255,255,255,0.08)"}, 0 6px 18px rgba(0,0,0,0.3)`
                    : variant === "fantasy"
                      ? `inset 0 1px 0 ${rgba("#d4ae68", mine ? 0.9 : 0.35)}, inset 0 -1px 0 ${rgba("#d4ae68", mine ? 0.9 : 0.2)}, 0 4px 14px rgba(0,0,0,0.4)`
                      : mine
                        ? `inset 0 0 0 1px ${rgba(highlightColor, 0.75)}`
                        : "inset 0 1px 0 rgba(170,220,255,0.1)",
                overflow: "hidden",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: tint,
                  pointerEvents: "none",
                }}
              />
              {variant !== "minimal" ? (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    [right ? "right" : "left"]: 0,
                    width: 3,
                    background: edge,
                    boxShadow: `0 0 10px ${edge}`,
                  }}
                />
              ) : null}
              {variant === "fantasy" ? (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    [right ? "left" : "right"]: 6,
                    top: "50%",
                    width: 5,
                    height: 5,
                    marginTop: -2.5,
                    transform: "rotate(45deg)",
                    background: "#d4ae68",
                    opacity: 0.7,
                  }}
                />
              ) : null}
              {!reduced && !item.leaving ? (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    className="sf-kill-feed-sweep"
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: "22%",
                      background: `linear-gradient(90deg, transparent, ${rgba(mine ? highlightColor : "#ffffff", 0.4)}, transparent)`,
                    }}
                  />
                </span>
              ) : null}
              <span
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0 0 0 0)",
                  whiteSpace: "nowrap",
                }}
              >
                {`${entry.killer} eliminated ${entry.victim} with ${weaponLabel(weapon)}${entry.headshot ? ", headshot" : ""}`}
              </span>
              <span
                aria-hidden
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingLeft: variant === "fantasy" && right ? 8 : 0,
                  paddingRight: variant === "fantasy" && !right ? 8 : 0,
                }}
              >
                <span style={nameStyle(killerColor)}>{entry.killer}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <WeaponIcon
                    name={weapon}
                    color={iconColor}
                    height={variant === "minimal" ? 15 : 17}
                  />
                  {entry.headshot ? (
                    <span
                      className="sf-kill-feed-hs"
                      style={{ display: "block" }}
                    >
                      <HeadshotIcon color={highlightColor} size={15} />
                    </span>
                  ) : null}
                </span>
                <span style={nameStyle(victimColor)}>{entry.victim}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

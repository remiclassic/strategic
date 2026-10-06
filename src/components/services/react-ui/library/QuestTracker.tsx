"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { clamp, demoButtonStyle, gameTheme, mixHex, rgba, usePropState, type GameVariant } from "./_shared/gameKit";

export type QuestObjective = {
  id: string;
  label: string;
  /** Progress counter, e.g. 3 of 5 (omit for a simple checkbox objective). */
  current?: number;
  target?: number;
  /** Marks a checkbox objective as done (counters are done when current >= target). */
  done?: boolean;
  /** Optional objectives don't block completion. */
  optional?: boolean;
};

export type Quest = {
  id: string;
  title: string;
  /** Main quests get a filled marker, side quests a hollow one, bounties a skull-red one. */
  kind?: "main" | "side" | "bounty";
  /** Distance to the next objective in world units. */
  distance?: number;
  /** Reward line shown in the completion flourish, e.g. "+450 XP". */
  reward?: string;
  objectives: QuestObjective[];
};

export type QuestTrackerProps = {
  /** Quests to track. Objectives update live; a quest whose required objectives are all done plays the completion flourish and collapses away. */
  quests?: Quest[];
  /** Header title ("" hides the header). */
  title?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Check, progress and flourish color. */
  accent?: string;
  /** Panel width in px. */
  width?: number;
  /** Show the distance marker next to each quest. */
  showDistance?: boolean;
  /** Unit suffix for distances. */
  unit?: string;
  /** Seconds the completion flourish lingers before the quest collapses. */
  collapseDelay?: number;
  /** Id of the expanded (tracked) quest. Defaults to the first open quest. */
  tracked?: string;
  /** Render built-in Advance / Reset buttons for testing. */
  demo?: boolean;
  /** Called when a quest header is clicked. */
  onTrack?: (id: string) => void;
  /** Called when an objective becomes done. */
  onObjectiveComplete?: (quest: Quest, objective: QuestObjective) => void;
  /** Called when a quest completes (as the flourish starts). */
  onQuestComplete?: (quest: Quest) => void;
  /** Demo buttons changed the quest list. */
  onChange?: (quests: Quest[]) => void;
  className?: string;
  style?: CSSProperties;
};

export const SAMPLE_QUESTS: Quest[] = [
  {
    id: "bell",
    title: "The Drowned Bell",
    kind: "main",
    distance: 128,
    reward: "+450 XP · Tidecaller's Sigil",
    objectives: [
      { id: "chapel", label: "Reach the Sunken Chapel", done: true },
      { id: "wards", label: "Light the brazier wards", current: 2, target: 3 },
      { id: "ring", label: "Ring the Drowned Bell", current: 0, target: 1 },
    ],
  },
  {
    id: "herbs",
    title: "An Herbalist's Errand",
    kind: "side",
    distance: 342,
    reward: "+120 XP · 35 gold",
    objectives: [
      { id: "leaf", label: "Gather Moonleaf", current: 3, target: 5 },
      { id: "caps", label: "Gather Crimson Caps", current: 4, target: 6 },
      { id: "maren", label: "Return to Maren" },
    ],
  },
  {
    id: "maw",
    title: "Wanted: The Grey Maw",
    kind: "bounty",
    distance: 610,
    reward: "+300 XP · 250 gold",
    objectives: [
      { id: "slay", label: "Slay the Grey Maw", current: 0, target: 1 },
      { id: "fang", label: "Recover its fang", optional: true },
    ],
  },
];

const CSS = `
.sf-quest-tracker-head { transition: background-color .2s, box-shadow .2s; }
.sf-quest-tracker-head:hover { background-color: rgba(255,255,255,0.035); }
.sf-quest-tracker-head:focus-visible { outline: 2px solid var(--sf-qt-accent); outline-offset: -2px; }
.sf-quest-tracker-btn { transition: transform .18s cubic-bezier(.2,.8,.2,1), filter .18s; }
.sf-quest-tracker-btn:hover { filter: brightness(1.3); transform: translateY(-1px); }
.sf-quest-tracker-btn:focus-visible { outline: 2px solid var(--sf-qt-accent); outline-offset: 2px; }
.sf-quest-tracker-fold { display: grid; transition: grid-template-rows .42s cubic-bezier(.3,.8,.2,1), opacity .3s; }
.sf-quest-tracker-check { animation: sf-quest-tracker-pop .5s cubic-bezier(.2,.9,.3,1.4) both; }
.sf-quest-tracker-check path { stroke-dasharray: 20; animation: sf-quest-tracker-draw .38s .08s cubic-bezier(.3,.7,.2,1) both; }
@keyframes sf-quest-tracker-pop { 0% { transform: scale(.4); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
@keyframes sf-quest-tracker-draw { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
.sf-quest-tracker-strike { animation: sf-quest-tracker-strike .45s .12s cubic-bezier(.5,0,.2,1) both; transform-origin: left; }
@keyframes sf-quest-tracker-strike { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.sf-quest-tracker-count { display: inline-block; animation: sf-quest-tracker-count .42s cubic-bezier(.2,.9,.3,1.5) both; }
@keyframes sf-quest-tracker-count { 0% { transform: scale(1.6); filter: brightness(2); } 100% { transform: scale(1); filter: none; } }
.sf-quest-tracker-row-flash { animation: sf-quest-tracker-row .9s ease-out both; }
@keyframes sf-quest-tracker-row { 0% { background-color: var(--sf-qt-flash); } 100% { background-color: transparent; } }
.sf-quest-tracker-banner { animation: sf-quest-tracker-banner .7s cubic-bezier(.2,.9,.25,1) both; }
@keyframes sf-quest-tracker-banner { from { opacity: 0; letter-spacing: .9em; filter: blur(6px); } to { opacity: 1; filter: none; } }
.sf-quest-tracker-rule { animation: sf-quest-tracker-rule .8s .1s cubic-bezier(.2,.9,.25,1) both; }
@keyframes sf-quest-tracker-rule { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }
.sf-quest-tracker-sheen { animation: sf-quest-tracker-sheen 1.3s .25s cubic-bezier(.4,0,.2,1) both; }
@keyframes sf-quest-tracker-sheen { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(260%) skewX(-20deg); } }
.sf-quest-tracker-spark { animation: sf-quest-tracker-spark .9s cubic-bezier(.1,.7,.3,1) both; }
@keyframes sf-quest-tracker-spark { 0% { opacity: 0; transform: translate(-50%,-50%) rotate(45deg) scale(.4); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(45deg) scale(1); } }
.sf-quest-tracker-reward { animation: sf-quest-tracker-reward .5s .45s cubic-bezier(.2,.9,.3,1) both; }
@keyframes sf-quest-tracker-reward { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.sf-quest-tracker-dist { animation: sf-quest-tracker-dist 2.4s ease-in-out infinite; }
@keyframes sf-quest-tracker-dist { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@media (prefers-reduced-motion: reduce) {
  .sf-quest-tracker-check, .sf-quest-tracker-check path, .sf-quest-tracker-strike, .sf-quest-tracker-count, .sf-quest-tracker-row-flash,
  .sf-quest-tracker-banner, .sf-quest-tracker-rule, .sf-quest-tracker-sheen, .sf-quest-tracker-spark, .sf-quest-tracker-reward, .sf-quest-tracker-dist { animation: none; }
  .sf-quest-tracker-sheen, .sf-quest-tracker-spark { display: none; }
  .sf-quest-tracker-fold { transition: none; }
}
`;

const isDone = (objective: QuestObjective) =>
  objective.target !== undefined ? (objective.current ?? 0) >= objective.target : Boolean(objective.done);
const isComplete = (quest: Quest) => quest.objectives.length > 0 && quest.objectives.every(objective => objective.optional || isDone(objective));
const signature = (quests: Quest[]) =>
  quests.map(quest => `${quest.id}:${quest.distance ?? ""}:${quest.objectives.map(o => `${o.id}=${o.current ?? ""}/${o.target ?? ""}/${o.done ? 1 : 0}`).join(",")}`).join("|");

type Phase = "flourish" | "collapse" | "gone";

/** Built-in diamond / skull markers for quest kinds. */
function KindMarker({ kind, color }: { kind: Quest["kind"]; color: string }) {
  if (kind === "bounty") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden style={{ flex: "none" }}>
        <path d="M12 2.4c4.8 0 8.4 3.4 8.4 7.9 0 2.6-1.2 4.5-3 5.6v3.1a1.6 1.6 0 0 1-1.6 1.6H8.2a1.6 1.6 0 0 1-1.6-1.6v-3.1c-1.8-1.1-3-3-3-5.6 0-4.5 3.6-7.9 8.4-7.9Zm-3.4 7.3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6.8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" fill="#ff6a55" fillRule="evenodd" />
      </svg>
    );
  }
  return (
    <span aria-hidden style={{ flex: "none", width: 9, height: 9, margin: "0 2.5px", transform: "rotate(45deg)", border: `1.5px solid ${color}`, background: kind === "side" ? "transparent" : color, boxShadow: `0 0 8px ${rgba(color, 0.7)}` }} />
  );
}

export function QuestTracker({
  quests = SAMPLE_QUESTS,
  title = "Quests",
  variant = "fantasy",
  accent = "#f0c060",
  width = 380,
  showDistance = true,
  unit = "m",
  collapseDelay = 1.8,
  tracked,
  demo = false,
  onTrack,
  onObjectiveComplete,
  onQuestComplete,
  onChange,
  className,
  style,
}: QuestTrackerProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const [list, setList] = usePropState(quests, signature);
  const [phase, setPhase] = useState<Record<string, Phase>>(() => {
    // Quests that are already complete when mounted are simply hidden.
    const initial: Record<string, Phase> = {};
    for (const quest of quests) if (isComplete(quest)) initial[quest.id] = "gone";
    return initial;
  });
  const [initial] = useState(() => {
    const done = new Set<string>();
    const counts = new Map<string, number>();
    for (const quest of quests) for (const o of quest.objectives) {
      if (isDone(o)) done.add(`${quest.id}/${o.id}`);
      counts.set(`${quest.id}/${o.id}`, o.current ?? 0);
    }
    return { done, counts };
  });
  const [trackedState, setTracked] = usePropState(tracked);
  const [demoVersion, setDemoVersion] = useState(0);
  const seenDone = useRef(new Set(initial.done));
  const timers = useRef(new Map<string, number[]>());
  const live = useRef({ list, onObjectiveComplete, onQuestComplete, collapseDelay, reduced });
  live.current = { list, onObjectiveComplete, onQuestComplete, collapseDelay, reduced };

  // Detect newly finished objectives and quests.
  useEffect(() => {
    for (const quest of list) {
      for (const o of quest.objectives) {
        const key = `${quest.id}/${o.id}`;
        if (isDone(o) && !seenDone.current.has(key)) {
          seenDone.current.add(key);
          live.current.onObjectiveComplete?.(quest, o);
        } else if (!isDone(o)) seenDone.current.delete(key);
      }
    }
    setPhase(previous => {
      let next = previous;
      for (const quest of list) {
        const complete = isComplete(quest);
        if (complete && !previous[quest.id]) {
          next = { ...next, [quest.id]: "flourish" };
          live.current.onQuestComplete?.(quest);
          const hold = live.current.reduced ? 900 : Math.max(0.4, live.current.collapseDelay) * 1000;
          const ids = [
            window.setTimeout(() => setPhase(p => ({ ...p, [quest.id]: "collapse" })), hold),
            window.setTimeout(() => setPhase(p => ({ ...p, [quest.id]: "gone" })), hold + 480),
          ];
          timers.current.set(quest.id, ids);
        } else if (!complete && previous[quest.id]) {
          timers.current.get(quest.id)?.forEach(id => window.clearTimeout(id));
          timers.current.delete(quest.id);
          next = { ...next };
          delete next[quest.id];
        }
      }
      return next;
    });
  }, [list]);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(ids => ids.forEach(id => window.clearTimeout(id)));
  }, []);

  const open = list.filter(quest => phase[quest.id] !== "gone");
  const active = open.filter(quest => !phase[quest.id]);
  const trackedId = trackedState && active.some(q => q.id === trackedState) ? trackedState : active[0]?.id;

  const advance = () => {
    const quest = list.find(q => q.id === trackedId);
    if (!quest) return;
    const index = quest.objectives.findIndex(o => !o.optional && !isDone(o));
    if (index < 0) return;
    const objectives = quest.objectives.map((o, i) =>
      i !== index ? o : o.target !== undefined ? { ...o, current: clamp((o.current ?? 0) + 1, 0, o.target) } : { ...o, done: true },
    );
    const next = list.map(q => (q.id === quest.id ? { ...q, objectives, distance: q.distance !== undefined ? Math.max(12, Math.round(q.distance * 0.62)) : undefined } : q));
    setList(next);
    onChange?.(next);
  };

  const reset = () => {
    timers.current.forEach(ids => ids.forEach(id => window.clearTimeout(id)));
    timers.current.clear();
    seenDone.current = new Set(initial.done);
    setPhase({});
    setList(quests);
    setTracked(tracked);
    setDemoVersion(v => v + 1);
    onChange?.(quests);
  };

  const edge = variant === "fantasy" ? rgba("#d4ae68", 0.35) : variant === "minimal" ? "rgba(255,255,255,0.08)" : rgba(accent, 0.28);
  const heading = variant === "fantasy" ? "#f3dfae" : theme.text;
  const checkRadius = variant === "minimal" ? 5 : variant === "fantasy" ? 2 : 0;

  return (
    <div className={className} style={{ width, maxWidth: "100%", fontFamily: theme.font, color: theme.text, ["--sf-qt-accent" as string]: accent, ["--sf-qt-flash" as string]: rgba(accent, 0.16), ...style }}>
      <style>{CSS}</style>
      <div
        style={{
          position: "relative",
          padding: variant === "minimal" ? "14px 6px 10px" : "14px 6px 12px",
          background: variant === "minimal" ? "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 40%)" : theme.panel,
          borderRadius: variant === "minimal" ? 12 : theme.radius + 2,
          clipPath: theme.clip(12),
          boxShadow: variant === "minimal" ? undefined : `inset 0 0 0 1px ${edge}, 0 20px 50px rgba(0,0,0,0.5)`,
        }}
      >
        {variant === "sci-fi" ? <span aria-hidden style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 2, background: `linear-gradient(180deg, ${accent}, ${rgba(accent, 0)})` }} /> : null}
        {title ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px 10px", marginBottom: 4, borderBottom: `1px solid ${edge}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none", color: heading }}>{title}</span>
            {variant === "fantasy" ? <span aria-hidden style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,174,104,0.55), transparent)" }} /> : <span style={{ flex: 1 }} />}
            <span style={{ fontFamily: theme.numeric, fontSize: 11.5, color: theme.muted, letterSpacing: "0.06em" }}>{active.length} active</span>
          </div>
        ) : null}

        {open.length === 0 ? (
          <div style={{ padding: "18px 12px 8px", textAlign: "center", fontSize: 13, color: theme.muted, fontStyle: variant === "fantasy" ? "italic" : "normal" }}>All quests complete.</div>
        ) : null}

        <div role="list" aria-label={title || "Quests"}>
          {open.map(quest => {
            const state = phase[quest.id];
            const isTracked = quest.id === trackedId;
            const expanded = isTracked || Boolean(state);
            const required = quest.objectives.filter(o => !o.optional);
            const doneCount = required.filter(isDone).length;
            const kindColor = quest.kind === "side" ? mixHex(accent, "#ffffff", 0.35) : quest.kind === "bounty" ? "#ff6a55" : accent;
            return (
              <div
                key={`${quest.id}-${demoVersion}`}
                role="listitem"
                className="sf-quest-tracker-fold"
                style={{ gridTemplateRows: state === "collapse" ? "0fr" : "1fr", opacity: state === "collapse" ? 0 : 1 }}
              >
                <div style={{ overflow: "hidden", minHeight: 0 }}>
                  <div style={{ position: "relative", margin: "2px 0", transform: state === "collapse" ? "translateX(18px)" : "none", transition: "transform .42s cubic-bezier(.5,0,.2,1)" }}>
                    <button
                      type="button"
                      className="sf-quest-tracker-head"
                      aria-expanded={expanded}
                      aria-label={`${quest.title}, ${doneCount} of ${required.length} objectives${quest.distance !== undefined ? `, ${quest.distance}${unit} away` : ""}${isTracked ? ", tracked" : ""}`}
                      onClick={() => {
                        setTracked(quest.id);
                        onTrack?.(quest.id);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        width: "100%",
                        padding: "7px 12px",
                        border: 0,
                        borderRadius: variant === "minimal" ? 8 : 2,
                        background: isTracked && variant !== "minimal" ? `linear-gradient(90deg, ${rgba(accent, 0.12)}, transparent 80%)` : "transparent",
                        color: "inherit",
                        font: "inherit",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <KindMarker kind={quest.kind} color={kindColor} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, letterSpacing: theme.caps ? "0.04em" : "0", color: state ? mixHex(accent, "#ffffff", 0.3) : isTracked ? heading : theme.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color .3s" }}>
                        {quest.title}
                      </span>
                      {!expanded ? <span style={{ fontFamily: theme.numeric, fontSize: 12, color: theme.muted, fontVariantNumeric: "tabular-nums" }}>{doneCount}/{required.length}</span> : null}
                      {showDistance && quest.distance !== undefined && !state ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: theme.numeric, fontSize: 12, fontWeight: 600, color: isTracked ? mixHex(accent, "#ffffff", 0.4) : theme.muted, fontVariantNumeric: "tabular-nums" }}>
                          <svg className={isTracked ? "sf-quest-tracker-dist" : undefined} width="10" height="12" viewBox="0 0 10 12" aria-hidden>
                            <path d="M5 0 10 6 5 12 0 6Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                            <circle cx="5" cy="6" r="1.6" fill="currentColor" />
                          </svg>
                          {quest.distance}
                          {unit}
                        </span>
                      ) : null}
                    </button>

                    {/* Objectives */}
                    <div className="sf-quest-tracker-fold" style={{ gridTemplateRows: expanded ? "1fr" : "0fr", opacity: expanded ? 1 : 0 }}>
                      <div style={{ overflow: "hidden", minHeight: 0 }}>
                        <ul style={{ listStyle: "none", margin: 0, padding: "2px 12px 8px 34px", minHeight: state ? 98 : 0, boxSizing: "border-box", opacity: state ? 0.22 : 1, transition: "opacity .4s" }}>
                          {quest.objectives.map(o => {
                            const key = `${quest.id}/${o.id}`;
                            const done = isDone(o);
                            const fresh = done && !initial.done.has(key);
                            const counted = o.target !== undefined;
                            const progress = counted ? clamp((o.current ?? 0) / Math.max(1, o.target!), 0, 1) : 0;
                            const countChanged = counted && (o.current ?? 0) !== initial.counts.get(key);
                            return (
                              <li key={o.id} className={fresh ? "sf-quest-tracker-row-flash" : undefined} style={{ position: "relative", display: "grid", gridTemplateColumns: "16px 1fr auto", alignItems: "center", columnGap: 10, padding: "4px 6px", margin: "0 -6px", borderRadius: 4 }}>
                                <span aria-hidden style={{ position: "relative", width: 14, height: 14, borderRadius: checkRadius, boxShadow: `inset 0 0 0 1.5px ${done ? accent : o.optional ? "rgba(255,255,255,0.18)" : rgba(theme.text, 0.35)}`, background: done ? rgba(accent, 0.2) : "rgba(0,0,0,0.3)", transform: variant === "sci-fi" ? "rotate(45deg) scale(.86)" : undefined, transition: "box-shadow .25s, background .25s" }}>
                                  {done ? (
                                    <svg className={fresh ? "sf-quest-tracker-check" : undefined} viewBox="0 0 16 16" width="16" height="16" style={{ position: "absolute", left: -1, top: -3, overflow: "visible", transform: variant === "sci-fi" ? "rotate(-45deg)" : undefined }}>
                                      <path d="M3 8.4 6.4 11.6 13.6 3.2" fill="none" stroke={mixHex(accent, "#ffffff", 0.45)} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 3px ${accent})` }} />
                                    </svg>
                                  ) : null}
                                </span>
                                <span style={{ position: "relative", justifySelf: "start", fontSize: 13.5, lineHeight: 1.35, color: done ? rgba(theme.text, 0.42) : o.optional ? theme.muted : theme.text, fontStyle: o.optional && variant === "fantasy" ? "italic" : "normal", transition: "color .4s .15s" }}>
                                  {o.label}
                                  {o.optional ? <span style={{ marginLeft: 6, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>optional</span> : null}
                                  {done ? <span aria-hidden className={fresh ? "sf-quest-tracker-strike" : undefined} style={{ position: "absolute", left: -2, right: -2, top: "54%", height: 1.5, background: rgba(accent, 0.7) }} /> : null}
                                </span>
                                {counted ? (
                                  <span style={{ fontFamily: theme.numeric, fontSize: 12.5, fontWeight: 700, color: done ? accent : theme.muted, fontVariantNumeric: "tabular-nums" }}>
                                    <span key={o.current} className={countChanged ? "sf-quest-tracker-count" : undefined} style={{ color: done ? accent : theme.text }}>{o.current ?? 0}</span>/{o.target}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                {counted && o.target! > 1 && !done ? (
                                  <span aria-hidden style={{ gridColumn: "2 / 4", height: 3, marginTop: 5, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                                    <span style={{ display: "block", height: "100%", width: `${progress * 100}%`, background: `linear-gradient(90deg, ${mixHex(accent, "#000000", 0.35)}, ${accent})`, boxShadow: `0 0 8px ${rgba(accent, 0.6)}`, transition: reduced ? "none" : "width .5s cubic-bezier(.2,.9,.3,1)" }} />
                                  </span>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* Completion flourish */}
                    {state === "flourish" || state === "collapse" ? (
                      <div role="status" style={{ position: "absolute", left: 0, right: 0, top: 36, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, pointerEvents: "none" }}>
                        <div aria-hidden style={{ position: "absolute", inset: "10% 6%", background: `radial-gradient(closest-side, ${rgba(accent, 0.22)}, transparent)` }} />
                        {Array.from({ length: 10 }, (_, i) => {
                          const angle = (i / 10) * Math.PI * 2 + 0.3;
                          const dist = 60 + (i % 3) * 22;
                          return (
                            <span
                              key={i}
                              aria-hidden
                              className="sf-quest-tracker-spark"
                              style={{ position: "absolute", left: "50%", top: "46%", width: 5, height: 5, background: i % 2 ? "#ffffff" : accent, boxShadow: `0 0 6px ${accent}`, ["--dx" as string]: `${Math.cos(angle) * dist * 1.6}px`, ["--dy" as string]: `${Math.sin(angle) * dist * 0.5}px`, animationDelay: `${0.1 + (i % 4) * 0.04}s` }}
                            />
                          );
                        })}
                        <span className="sf-quest-tracker-rule" aria-hidden style={{ width: "72%", height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                        <span style={{ position: "relative", overflow: "hidden", padding: "2px 10px" }}>
                          <span className="sf-quest-tracker-banner" style={{ display: "block", fontSize: 17, fontWeight: 800, letterSpacing: theme.caps ? "0.28em" : "0.06em", textTransform: theme.caps ? "uppercase" : "none", color: mixHex(accent, "#ffffff", 0.45), textShadow: `0 0 18px ${rgba(accent, 0.85)}` }}>
                            Quest complete
                          </span>
                          <span className="sf-quest-tracker-sheen" aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "40%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", mixBlendMode: "overlay" }} />
                        </span>
                        <span className="sf-quest-tracker-rule" aria-hidden style={{ width: "72%", height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                        {quest.reward ? <span className="sf-quest-tracker-reward" style={{ fontFamily: theme.numeric, fontSize: 12, color: theme.muted, letterSpacing: "0.04em" }}>{quest.reward}</span> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {demo ? (
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
          <button type="button" className="sf-quest-tracker-btn" style={demoButtonStyle(theme, accent)} onClick={advance} disabled={!trackedId}>
            Advance objective
          </button>
          <button type="button" className="sf-quest-tracker-btn" style={demoButtonStyle(theme, "#9aa4b2")} onClick={reset}>
            Reset
          </button>
        </div>
      ) : null}
    </div>
  );
}

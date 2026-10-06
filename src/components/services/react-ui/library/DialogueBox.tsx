"use client";
/* eslint-disable @next/next/no-img-element -- copy-paste component: a plain <img> keeps it framework-agnostic. */

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useAnimationFrame, useReducedMotion } from "./_shared/hooks";
import { clamp, gameTheme, mixHex, rgba, usePropState, type GameVariant } from "./_shared/gameKit";

export type DialogueChoice = {
  label: string;
  /** Index of the line to jump to (defaults to the next line). */
  next?: number;
};

export type DialogueLine = {
  speaker: string;
  text: string;
  /** Portrait image URL or node for this line (falls back to the `portrait` prop). */
  portrait?: string | ReactNode;
  /** Choices shown once the text has finished typing. */
  choices?: DialogueChoice[];
  /** Line to go to after this one (defaults to index + 1; past the end wraps or completes). */
  next?: number;
};

export type DialogueBoxProps = {
  /** The conversation. */
  script?: DialogueLine[];
  /** Line index (resyncs when changed). */
  index?: number;
  /** Typing speed in characters per second. */
  speed?: number;
  /** Accent for the name plate, cursor and choices. */
  accent?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Show the portrait frame. */
  showPortrait?: boolean;
  /** Default portrait (image URL or node) when a line has none. */
  portrait?: string | ReactNode;
  /** Restart from the first line after the last one. */
  loop?: boolean;
  /** Box width in px. */
  width?: number;
  /** Called when a new line starts. */
  onLine?: (index: number, line: DialogueLine) => void;
  /** Called when a choice is picked. */
  onChoice?: (choice: DialogueChoice, lineIndex: number) => void;
  /** Called after the last line when `loop` is off. */
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
};

export const DEFAULT_DIALOGUE: DialogueLine[] = [
  { speaker: "Maren Vell", text: "You came through the Hollow Pass? Few travellers return with their maps intact — fewer still with their nerve." },
  {
    speaker: "Maren Vell",
    text: "The northern ridge has shifted again. Something beneath the ice is waking, and my charts can no longer keep pace.",
    choices: [
      { label: "I'll scout the ridge for you.", next: 2 },
      { label: "What exactly is waking?", next: 3 },
      { label: "Not my problem. Farewell.", next: 4 },
    ],
  },
  { speaker: "Maren Vell", text: "Then take this lodestone. It hums near fresh fault lines. Follow the hum — and come back breathing.", next: 0 },
  { speaker: "Maren Vell", text: "Something older than the kingdoms that buried it. The lodestones hum louder every night.", next: 1 },
  { speaker: "Maren Vell", text: "Suit yourself. The mountain will still be here when you change your mind.", next: 0 },
];

const CSS = `
.sf-dialogue-box-root:focus-visible { outline: none; }
.sf-dialogue-box-root:focus-visible .sf-dialogue-box-panel { box-shadow: var(--sf-db-shadow), 0 0 0 2px var(--sf-db-accent); }
.sf-dialogue-box-next { animation: sf-dialogue-box-bob 1.1s cubic-bezier(.45,0,.55,1) infinite; }
@keyframes sf-dialogue-box-bob { 0%,100% { transform: translateY(0); opacity: .7; } 50% { transform: translateY(4px); opacity: 1; } }
.sf-dialogue-box-choice { transition: background .2s, color .2s, transform .25s cubic-bezier(.2,.9,.3,1.2), border-color .2s; }
.sf-dialogue-box-choice:hover, .sf-dialogue-box-choice:focus-visible { outline: none; transform: translateX(-6px); color: #fff !important; border-color: var(--sf-db-accent) !important; background: var(--sf-db-choice-hi) !important; }
.sf-dialogue-box-choice:hover .sf-dialogue-box-key, .sf-dialogue-box-choice:focus-visible .sf-dialogue-box-key { background: var(--sf-db-accent); color: #0b0a09 !important; }
.sf-dialogue-box-choice-in { animation: sf-dialogue-box-in .45s cubic-bezier(.2,.9,.3,1.1) both; }
@keyframes sf-dialogue-box-in { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }
.sf-dialogue-box-caret { animation: sf-dialogue-box-caret .8s steps(1) infinite; }
@keyframes sf-dialogue-box-caret { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .sf-dialogue-box-next, .sf-dialogue-box-caret { animation: none; } .sf-dialogue-box-choice-in { animation: none; } }
`;

function DefaultPortrait({ accent }: { accent: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 140 170" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ display: "block" }}>
      <defs>
        <radialGradient id={`sf-db-bg-${uid}`} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor={mixHex(accent, "#1a1512", 0.55)} />
          <stop offset="1" stopColor="#0a0807" />
        </radialGradient>
        <linearGradient id={`sf-db-cloak-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a302a" />
          <stop offset="1" stopColor="#141010" />
        </linearGradient>
      </defs>
      <rect width="140" height="170" fill={`url(#sf-db-bg-${uid})`} />
      <path d="M4 170 C10 128 38 110 70 108 C102 110 130 128 136 170 Z" fill={`url(#sf-db-cloak-${uid})`} />
      <path d="M52 112 L70 150 L88 112" fill="none" stroke={rgba(accent, 0.6)} strokeWidth={2} />
      <path d="M34 96 C30 52 48 24 70 22 C94 24 110 52 106 96 C98 110 84 118 70 118 C56 118 42 110 34 96 Z" fill="#231c18" />
      <path d="M34 96 C30 52 48 24 70 22" fill="none" stroke={rgba(accent, 0.75)} strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={70} cy={80} rx={21} ry={27} fill="#0a0706" />
      <ellipse cx={62} cy={78} rx={3.2} ry={1.8} fill={mixHex(accent, "#ffffff", 0.5)} />
      <ellipse cx={78} cy={78} rx={3.2} ry={1.8} fill={mixHex(accent, "#ffffff", 0.5)} />
      <ellipse cx={62} cy={78} rx={8} ry={5} fill={rgba(accent, 0.25)} />
      <ellipse cx={78} cy={78} rx={8} ry={5} fill={rgba(accent, 0.25)} />
    </svg>
  );
}

const pauseAfter = (char: string) => (/[.!?…]/.test(char) ? 0.32 : /[,;:—–]/.test(char) ? 0.14 : 0);

export function DialogueBox({
  script = DEFAULT_DIALOGUE,
  index = 0,
  speed = 42,
  accent = "#f0b35a",
  variant = "fantasy",
  showPortrait = true,
  portrait,
  loop = true,
  width = 760,
  onLine,
  onChoice,
  onComplete,
  className,
  style,
}: DialogueBoxProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const lines = script.length ? script : DEFAULT_DIALOGUE;
  const [current, setCurrent] = usePropState(clamp(Math.round(index), 0, lines.length - 1));
  const line = lines[current] ?? lines[0];
  const [done, setDone] = useState(false);
  const shownRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const progress = useRef({ count: 0, wait: 0 });
  const live = useRef({ speed, text: line.text });
  live.current = { speed, text: line.text };

  const render = (count: number) => {
    const text = live.current.text;
    if (shownRef.current) shownRef.current.textContent = text.slice(0, count);
    if (restRef.current) restRef.current.textContent = text.slice(count);
  };

  // New line: reset the typewriter.
  useEffect(() => {
    progress.current = { count: 0, wait: 0.15 };
    setDone(reduced);
    render(reduced ? line.text.length : 0);
    onLine?.(current, line);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, line.text, reduced]);

  useAnimationFrame(delta => {
    const state = progress.current;
    const text = live.current.text;
    if (state.wait > 0) {
      state.wait -= delta;
      return;
    }
    const before = Math.floor(state.count);
    state.count = Math.min(text.length, state.count + delta * Math.max(1, live.current.speed));
    const after = Math.floor(state.count);
    if (after !== before) {
      render(after);
      state.wait = pauseAfter(text[after - 1] ?? "");
    }
    if (after >= text.length) setDone(true);
  }, !done);

  const goTo = (target: number | undefined) => {
    let next = target ?? current + 1;
    if (next >= lines.length) {
      if (!loop) {
        onComplete?.();
        return;
      }
      next = 0;
    }
    if (next === current) {
      progress.current = { count: 0, wait: 0.15 };
      setDone(false);
      render(0);
    }
    setCurrent(next);
  };

  const hasChoices = done && !!line.choices?.length;

  const advance = () => {
    if (!done) {
      progress.current.count = line.text.length;
      render(line.text.length);
      setDone(true);
      return;
    }
    if (hasChoices) {
      (choicesRef.current?.querySelector("button") as HTMLButtonElement | null)?.focus();
      return;
    }
    goTo(line.next);
  };

  const choose = (choice: DialogueChoice) => {
    onChoice?.(choice, current);
    goTo(choice.next);
    rootRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(choicesRef.current?.querySelectorAll("button") ?? []);
    if (hasChoices && /^[1-9]$/.test(event.key)) {
      const choice = line.choices?.[Number(event.key) - 1];
      if (choice) {
        event.preventDefault();
        choose(choice);
      }
      return;
    }
    if (hasChoices && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === "ArrowDown" ? (at + 1) % buttons.length : (at - 1 + buttons.length) % buttons.length;
      buttons[at < 0 ? 0 : next]?.focus();
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
      event.preventDefault();
      advance();
    }
  };

  const face = line.portrait ?? portrait;
  const portraitW = 132;
  const panelShadow = "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)";
  const edge = variant === "fantasy" ? rgba("#d4ae68", 0.55) : variant === "minimal" ? "rgba(255,255,255,0.12)" : rgba(accent, 0.4);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="group"
      aria-roledescription="dialogue"
      aria-label={`${line.speaker} says`}
      className={`sf-dialogue-box-root${className ? ` ${className}` : ""}`}
      onKeyDown={onKeyDown}
      style={{ position: "relative", width, maxWidth: "100%", paddingTop: 150, fontFamily: theme.font, color: theme.text, ["--sf-db-accent" as string]: accent, ["--sf-db-shadow" as string]: panelShadow, ["--sf-db-choice-hi" as string]: `linear-gradient(90deg, ${rgba(accent, 0.22)}, ${rgba(accent, 0.06)})`, ...style }}
    >
      <style>{CSS}</style>
      {/* Choices */}
      <div ref={choicesRef} role="list" aria-label="Replies" style={{ position: "absolute", right: 20, bottom: 202, display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch", minWidth: 300 }}>
        {hasChoices
          ? line.choices!.map((choice, i) => (
              <div role="listitem" key={`${current}-${i}`}>
                <button
                  type="button"
                  className="sf-dialogue-box-choice sf-dialogue-box-choice-in"
                  onClick={() => choose(choice)}
                  style={{ animationDelay: `${i * 70}ms`, width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 14px 9px 10px", cursor: "pointer", textAlign: "left", font: `500 15px/1.2 ${theme.font}`, color: theme.muted, background: "linear-gradient(90deg, rgba(12,10,9,0.92), rgba(18,14,12,0.85))", border: `1px solid ${edge}`, borderRadius: theme.radius, clipPath: theme.clip(6) }}
                >
                  <span className="sf-dialogue-box-key" style={{ flex: "none", width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: variant === "minimal" ? 6 : 2, fontFamily: theme.numeric, fontSize: 12, fontWeight: 700, color: accent, border: `1px solid ${rgba(accent, 0.6)}`, transition: "background .2s, color .2s" }}>{i + 1}</span>
                  {choice.label}
                </button>
              </div>
            ))
          : null}
      </div>

      {/* Panel */}
      <div
        className="sf-dialogue-box-panel"
        onClick={advance}
        style={{ position: "relative", minHeight: 176, boxSizing: "border-box", padding: `30px 30px 26px ${showPortrait ? portraitW + 52 : 30}px`, cursor: "pointer", background: theme.panel, borderRadius: theme.radius + 2, clipPath: theme.clip(16), boxShadow: `${panelShadow}, inset 0 0 0 1px ${edge}` }}
      >
        {variant === "fantasy" ? (
          <>
            <span aria-hidden style={{ position: "absolute", inset: 5, border: `1px solid ${rgba("#d4ae68", 0.22)}`, borderRadius: 3, pointerEvents: "none" }} />
            {[0, 1, 2, 3].map(corner => (
              <span key={corner} aria-hidden style={{ position: "absolute", width: 9, height: 9, transform: "rotate(45deg)", background: "#d4ae68", boxShadow: "0 0 8px rgba(212,174,104,0.6)", left: corner % 2 ? undefined : -4, right: corner % 2 ? -4 : undefined, top: corner < 2 ? -4 : undefined, bottom: corner < 2 ? undefined : -4 }} />
            ))}
          </>
        ) : null}
        {variant === "sci-fi" ? <span aria-hidden style={{ position: "absolute", left: 16, right: 60, top: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} /> : null}
        <div aria-live="polite" style={{ fontSize: 17, lineHeight: 1.62, letterSpacing: "0.01em", color: theme.text, minHeight: 82 }}>
          <span className="sf-dialogue-box-sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{done ? line.text : ""}</span>
          <span aria-hidden>
            <span ref={shownRef} />
            {!done ? <span className="sf-dialogue-box-caret" style={{ display: "inline-block", width: 8, height: "1em", marginLeft: 2, marginBottom: -2, background: rgba(accent, 0.8) }} /> : null}
            <span ref={restRef} style={{ visibility: "hidden" }} />
          </span>
        </div>
        <div aria-hidden style={{ position: "absolute", right: 24, bottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: theme.muted, opacity: done && !hasChoices ? 1 : 0, transition: "opacity .25s" }}>
          Continue
          <svg className="sf-dialogue-box-next" width="14" height="10" viewBox="0 0 14 10">
            <path d="M1 1 L7 8 L13 1" fill="none" stroke={accent} strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Portrait */}
      {showPortrait ? (
        <div aria-hidden style={{ position: "absolute", left: 24, bottom: 22, width: portraitW, height: 196, padding: 2, borderRadius: theme.radius + 2, clipPath: theme.clip(10), background: variant === "fantasy" ? "linear-gradient(160deg, #f5dc9c, #7a5520 55%, #d4ae68)" : `linear-gradient(160deg, ${mixHex(accent, "#ffffff", 0.3)}, ${rgba(accent, 0.25)})`, boxShadow: "0 18px 36px rgba(0,0,0,0.6)" }}>
          <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: theme.radius, clipPath: theme.clip(9), background: "#0a0807" }}>
            {typeof face === "string" ? <img src={face} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : face ?? <DefaultPortrait accent={accent} />}
          </div>
        </div>
      ) : null}

      {/* Name plate */}
      <div
        style={{ position: "absolute", left: showPortrait ? portraitW + 40 : 24, bottom: 176 - 15, padding: "6px 18px", fontSize: 14, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none", color: variant === "fantasy" ? "#1d1207" : "#0b0a09", background: variant === "fantasy" ? "linear-gradient(180deg, #f5dc9c, #c08f45)" : `linear-gradient(180deg, ${mixHex(accent, "#ffffff", 0.35)}, ${accent})`, borderRadius: theme.radius, clipPath: theme.clip(7), boxShadow: `0 6px 18px ${rgba(accent, 0.35)}` }}
      >
        {line.speaker}
      </div>
    </div>
  );
}

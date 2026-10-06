"use client";
/* eslint-disable @next/next/no-img-element -- copy-paste component: a plain <img> keeps it framework-agnostic. */

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { GameGlyph, clamp, demoButtonStyle, gameTheme, mixHex, rgba, usePropState, type GameVariant, type GlyphName } from "./_shared/gameKit";

export type PartyStatus = { glyph: GlyphName; color?: string; name: string; debuff?: boolean };

export type PartyMember = {
  id: string;
  name: string;
  /** Class / role name under the name. */
  className?: string;
  /** Class color: portrait ring, name and accent. */
  color?: string;
  level?: number;
  hp: number;
  maxHp: number;
  /** Mana / rage / energy. */
  resource?: number;
  maxResource?: number;
  resourceColor?: string;
  statuses?: PartyStatus[];
  leader?: boolean;
  state?: "alive" | "downed" | "dead";
  /** Portrait image URL (falls back to initials). */
  portrait?: string;
};

export type PartyFramesProps = {
  /** Party members, top to bottom. */
  members?: PartyMember[];
  /** Targeted frame index (-1 = none). */
  selected?: number;
  /** Visual style. */
  variant?: GameVariant;
  /** Target highlight color. */
  accent?: string;
  /** Health fill color. */
  hpColor?: string;
  /** Frame width in px. */
  width?: number;
  /** Show the mana / resource bar. */
  showResource?: boolean;
  /** Show status effect icons. */
  showStatus?: boolean;
  /** Render Take hit / Heal / Down · Revive buttons. */
  demo?: boolean;
  /** A frame was targeted (click, arrows, 1-9). */
  onTarget?: (index: number, member: PartyMember) => void;
  /** Demo buttons changed the party. */
  onChange?: (members: PartyMember[]) => void;
  className?: string;
  style?: CSSProperties;
};

export const SAMPLE_PARTY: PartyMember[] = [
  { id: "aldric", name: "Aldric", className: "Warden", color: "#d9a066", level: 60, hp: 8420, maxHp: 11200, resource: 42, maxResource: 100, resourceColor: "#e0473a", leader: true, statuses: [{ glyph: "shield", color: "#9fc6e8", name: "Stoneskin" }] },
  { id: "seren", name: "Seren", className: "Lightweaver", color: "#ffe28a", level: 60, hp: 5120, maxHp: 5400, resource: 7400, maxResource: 9800, resourceColor: "#3f8cff", statuses: [{ glyph: "star", color: "#ffcf5a", name: "Battle Hymn" }, { glyph: "leaf", color: "#6fe08a", name: "Regrowth" }] },
  { id: "kaelen", name: "Kaelen", className: "Ranger", color: "#a8d86e", level: 59, hp: 4390, maxHp: 6000, resource: 64, maxResource: 100, resourceColor: "#ffcf3d", statuses: [{ glyph: "dash", color: "#6fe0ff", name: "Quickening" }] },
  { id: "morrow", name: "Morrow", className: "Hexblade", color: "#b88cff", level: 60, hp: 1180, maxHp: 6100, resource: 2100, maxResource: 7200, resourceColor: "#3f8cff", statuses: [{ glyph: "flame", color: "#ff6a3d", name: "Burning", debuff: true }, { glyph: "skull", color: "#c07bff", name: "Hex of Frailty", debuff: true }] },
  { id: "ivy", name: "Ivy", className: "Duelist", color: "#ff8a5c", level: 58, hp: 0, maxHp: 5600, resource: 20, maxResource: 100, resourceColor: "#ffcf3d", state: "downed" },
];

const CSS = `
.sf-party-frames-frame { transition: transform .26s cubic-bezier(.2,.9,.3,1.2), box-shadow .25s, filter .35s, opacity .35s; }
.sf-party-frames-frame:hover { filter: brightness(1.12); }
.sf-party-frames-frame:focus-visible { outline: none; }
.sf-party-frames-frame:focus-visible .sf-party-frames-focus { opacity: 1; }
.sf-party-frames-low { animation: sf-party-frames-low 1s cubic-bezier(.45,0,.55,1) infinite; }
@keyframes sf-party-frames-low { 0%,100% { opacity: .1; } 50% { opacity: .7; } }
.sf-party-frames-downed { animation: sf-party-frames-downed 1.2s cubic-bezier(.45,0,.55,1) infinite; }
@keyframes sf-party-frames-downed { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
.sf-party-frames-bleed { animation: sf-party-frames-bleed 14s linear both; transform-origin: left; }
@keyframes sf-party-frames-bleed { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.sf-party-frames-btn { transition: transform .18s cubic-bezier(.2,.8,.2,1), filter .18s; }
.sf-party-frames-btn:hover { filter: brightness(1.3); transform: translateY(-1px); }
.sf-party-frames-btn:focus-visible { outline: 2px solid var(--sf-pf-accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .sf-party-frames-low, .sf-party-frames-downed, .sf-party-frames-bleed { animation: none; }
  .sf-party-frames-frame { transition: none; }
}
`;

const membersSignature = (list: PartyMember[]) => list.map(m => `${m.id}:${m.hp}/${m.maxHp}:${m.resource ?? ""}:${m.state ?? ""}:${m.leader ? 1 : 0}:${(m.statuses ?? []).map(s => s.name).join("+")}`).join("|");
const compact = (value: number) => (value >= 10000 ? `${(value / 1000).toFixed(1)}k` : Math.round(value).toLocaleString("en-US"));

export function PartyFrames({
  members = SAMPLE_PARTY,
  selected = 0,
  variant = "sci-fi",
  accent = "#ffd24a",
  hpColor = "#3fd46c",
  width = 300,
  showResource = true,
  showStatus = true,
  demo = false,
  onTarget,
  onChange,
  className,
  style,
}: PartyFramesProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const [party, setParty] = usePropState(members, membersSignature);
  const [target, setTarget] = usePropState(clamp(Math.round(selected), -1, members.length - 1));
  const frameRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const flashRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastHp = useRef(new Map<string, number>());

  // Damage / heal flashes.
  useEffect(() => {
    party.forEach((member, index) => {
      const previous = lastHp.current.get(member.id);
      lastHp.current.set(member.id, member.hp);
      if (previous === undefined || previous === member.hp) return;
      const flash = flashRefs.current[index];
      const healed = member.hp > previous;
      if (flash) {
        flash.style.background = healed ? `linear-gradient(90deg, transparent, ${rgba("#7dffa8", 0.45)})` : rgba("#ffffff", 0.5);
        flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced ? 150 : healed ? 900 : 380, easing: "ease-out" });
      }
      if (!healed && !reduced) {
        const strength = clamp((previous - member.hp) / member.maxHp, 0.05, 0.4) * 14;
        frameRefs.current[index]?.animate(
          [{ translate: "0 0" }, { translate: `${-strength}px 0` }, { translate: `${strength * 0.6}px 0` }, { translate: "0 0" }],
          { duration: 280, easing: "cubic-bezier(.25,.8,.3,1)" },
        );
      }
    });
  }, [party, reduced]);

  const choose = (index: number, focus = false) => {
    const next = clamp(index, 0, party.length - 1);
    setTarget(next);
    onTarget?.(next, party[next]);
    if (focus) frameRefs.current[next]?.focus();
  };

  const update = (next: PartyMember[]) => {
    setParty(next);
    onChange?.(next);
  };
  const hit = () => {
    const alive = party.map((m, i) => [m, i] as const).filter(([m]) => (m.state ?? "alive") === "alive");
    if (!alive.length) return;
    const [victim, index] = alive[(Math.random() * alive.length) | 0];
    const damage = Math.round(victim.maxHp * (0.18 + Math.random() * 0.2));
    const hp = Math.max(0, victim.hp - damage);
    update(party.map((m, i) => (i === index ? { ...m, hp, state: hp <= 0 ? "downed" : m.state } : m)));
  };
  const heal = () => {
    update(party.map(m => ((m.state ?? "alive") === "alive" ? { ...m, hp: Math.min(m.maxHp, m.hp + Math.round(m.maxHp * 0.3)), resource: m.resource } : m)));
  };
  const toggleDown = () => {
    const downed = party.findIndex(m => m.state === "downed" || m.state === "dead");
    if (downed >= 0) update(party.map((m, i) => (i === downed ? { ...m, state: "alive", hp: Math.round(m.maxHp * 0.35) } : m)));
    else {
      const index = target >= 0 ? target : party.length - 1;
      update(party.map((m, i) => (i === index ? { ...m, state: "downed", hp: 0 } : m)));
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = frameRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      frameRefs.current[(current + (event.key === "ArrowDown" ? 1 : -1) + party.length) % party.length]?.focus();
    } else if (/^[1-9]$/.test(event.key) && Number(event.key) <= party.length) {
      event.preventDefault();
      choose(Number(event.key) - 1, true);
    }
  };

  const portrait = 46;
  const barH = 14;
  const frameBg = variant === "fantasy" ? "linear-gradient(180deg, rgba(36,27,20,0.94), rgba(18,13,10,0.96))" : variant === "minimal" ? "rgba(24,24,28,0.82)" : "linear-gradient(90deg, rgba(12,20,27,0.92), rgba(6,10,14,0.88))";
  const frameEdge = variant === "fantasy" ? rgba("#d4ae68", 0.32) : variant === "minimal" ? "rgba(255,255,255,0.07)" : "rgba(160,220,255,0.14)";

  return (
    <div className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch", fontFamily: theme.font, color: theme.text, userSelect: "none", ["--sf-pf-accent" as string]: accent, ...style }}>
      <style>{CSS}</style>
      <div role="listbox" aria-label="Party" onKeyDown={onKeyDown} style={{ display: "flex", flexDirection: "column", gap: variant === "minimal" ? 6 : 7, width }}>
        {party.map((member, index) => {
          const state = member.state ?? "alive";
          const dead = state === "dead";
          const downed = state === "downed";
          const out = dead || downed;
          const frac = clamp(member.hp / Math.max(1, member.maxHp), 0, 1);
          const low = !out && frac <= 0.3;
          const cls = member.color ?? "#cfd6de";
          const isTarget = index === target;
          const fill = low ? mixHex(hpColor, "#ff3b30", 0.85) : hpColor;
          const res = member.resource !== undefined && member.maxResource ? clamp(member.resource / member.maxResource, 0, 1) : null;
          return (
            <button
              key={member.id}
              ref={el => {
                frameRefs.current[index] = el;
              }}
              type="button"
              role="option"
              aria-selected={isTarget}
              tabIndex={isTarget || (target < 0 && index === 0) ? 0 : -1}
              aria-label={`${member.name}${member.leader ? ", party leader" : ""}, ${member.className ?? ""} level ${member.level ?? ""}, ${dead ? "dead" : downed ? "downed" : `${Math.round(frac * 100)}% health`}`}
              className="sf-party-frames-frame"
              onClick={() => choose(index)}
              onFocus={() => {
                if (!isTarget) choose(index);
              }}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: `${portrait}px 1fr`,
                columnGap: 11,
                alignItems: "center",
                padding: "7px 10px 7px 7px",
                border: 0,
                textAlign: "left",
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
                background: frameBg,
                borderRadius: variant === "minimal" ? 12 : theme.radius + 1,
                clipPath: theme.clip(9),
                boxShadow: `inset 0 0 0 1px ${isTarget ? accent : downed ? rgba("#ff4d4d", 0.5) : frameEdge}${isTarget ? `, inset 0 0 18px ${rgba(accent, 0.18)}` : ""}, 0 8px 22px rgba(0,0,0,0.45)`,
                transform: isTarget ? "translateX(8px)" : "none",
                filter: dead ? "grayscale(1)" : undefined,
                opacity: dead ? 0.55 : 1,
              }}
            >
              <span className="sf-party-frames-focus" aria-hidden style={{ position: "absolute", inset: 2, borderRadius: variant === "minimal" ? 10 : 0, boxShadow: `0 0 0 1.5px ${mixHex(accent, "#ffffff", 0.4)}`, opacity: 0, transition: "opacity .15s", pointerEvents: "none" }} />
              {isTarget ? (
                <span aria-hidden style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, background: accent, boxShadow: `0 0 10px ${accent}`, borderRadius: 2 }} />
              ) : null}
              {downed ? <span aria-hidden className="sf-party-frames-downed" style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${rgba("#ff2a2a", 0.28)}, transparent 70%)`, pointerEvents: "none" }} /> : null}
              {low ? <span aria-hidden className="sf-party-frames-low" style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 22px ${rgba("#ff2a2a", 0.55)}`, pointerEvents: "none" }} /> : null}

              {/* Portrait */}
              <span aria-hidden style={{ position: "relative", width: portrait, height: portrait }}>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    borderRadius: variant === "sci-fi" ? 3 : variant === "minimal" ? 12 : "50%",
                    clipPath: variant === "sci-fi" ? "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" : undefined,
                    background: `radial-gradient(circle at 50% 30%, ${mixHex(cls, "#000000", 0.35)}, ${mixHex(cls, "#000000", 0.82)})`,
                    boxShadow: `inset 0 0 0 2px ${out ? "rgba(255,255,255,0.15)" : cls}, inset 0 0 12px rgba(0,0,0,0.6)`,
                  }}
                >
                  {member.portrait ? (
                    <img src={member.portrait} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ font: `800 19px/1 ${theme.font}`, color: mixHex(cls, "#ffffff", 0.55), textShadow: "0 2px 4px rgba(0,0,0,0.8)", letterSpacing: "0.02em" }}>{member.name.slice(0, 1).toUpperCase()}</span>
                  )}
                  {out ? (
                    <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: dead ? "rgba(0,0,0,0.55)" : "rgba(80,0,0,0.45)" }}>
                      <GameGlyph name="skull" color={dead ? "#d8d4cc" : "#ff6a5f"} size={24} />
                    </span>
                  ) : null}
                </span>
                {member.leader ? (
                  <span style={{ position: "absolute", left: -4, top: -6, transform: "rotate(-18deg)", filter: "drop-shadow(0 1px 2px #000)" }}>
                    <GameGlyph name="crown" color="#ffcf4a" size={17} />
                  </span>
                ) : null}
                {member.level !== undefined ? (
                  <span style={{ position: "absolute", right: -5, bottom: -4, minWidth: 18, height: 16, padding: "0 3px", boxSizing: "border-box", display: "grid", placeItems: "center", borderRadius: variant === "minimal" ? 8 : 2, font: `800 9.5px/1 ${theme.numeric}`, color: theme.text, background: "#0b0a09", boxShadow: `inset 0 0 0 1px ${rgba(cls, 0.7)}` }}>{member.level}</span>
                ) : null}
              </span>

              {/* Bars */}
              <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: theme.caps ? "0.05em" : 0, textTransform: theme.caps ? "uppercase" : "none", color: out ? theme.muted : mixHex(cls, "#ffffff", 0.2), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name}</span>
                  {member.className ? <span style={{ fontSize: 10.5, color: theme.muted, whiteSpace: "nowrap" }}>{member.className}</span> : null}
                  <span style={{ flex: 1 }} />
                  {showStatus && !out
                    ? (member.statuses ?? []).slice(0, 4).map(status => (
                        <span key={status.name} title={status.name} style={{ position: "relative", width: 17, height: 17, display: "grid", placeItems: "center", borderRadius: variant === "minimal" ? "50%" : 2, background: "rgba(0,0,0,0.55)", boxShadow: `inset 0 0 0 1px ${status.debuff ? rgba("#ff4d4d", 0.8) : rgba("#5fd67a", 0.55)}` }}>
                          <GameGlyph name={status.glyph} color={status.color ?? "#ffffff"} size={12} />
                        </span>
                      ))
                    : null}
                </span>

                <span style={{ position: "relative", height: barH, overflow: "hidden", borderRadius: variant === "minimal" ? barH / 2 : variant === "fantasy" ? 2 : 0, background: "linear-gradient(180deg, #050606, #0e1112)", boxShadow: `inset 0 0 0 1px ${variant === "fantasy" ? rgba("#d4ae68", 0.35) : "rgba(255,255,255,0.08)"}` }}>
                  {out ? (
                    <>
                      {downed ? <span className="sf-party-frames-bleed" style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${rgba("#ff3b30", 0.65)}, ${rgba("#ff3b30", 0.25)})` }} /> : null}
                      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", font: `800 9.5px/1 ${theme.font}`, letterSpacing: "0.22em", color: downed ? "#ffd2cc" : theme.muted, textShadow: "0 1px 2px #000" }}>{downed ? "DOWNED · REVIVE" : "DEAD"}</span>
                    </>
                  ) : (
                    <>
                      <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${frac * 100}%`, background: "linear-gradient(180deg, #ffe3c0, #ff9d6a)", transition: reduced ? "none" : "width .6s cubic-bezier(.6,0,.25,1) .35s" }} />
                      <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${frac * 100}%`, background: `linear-gradient(180deg, ${mixHex(fill, "#ffffff", 0.35)}, ${fill} 50%, ${mixHex(fill, "#000000", 0.35)})`, boxShadow: `0 0 10px ${rgba(fill, 0.55)}`, transition: reduced ? "none" : "width .22s cubic-bezier(.2,.8,.2,1), background .3s" }} />
                      <span style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), rgba(0,0,0,0.35) calc(10% - 1px) 10%)", opacity: variant === "sci-fi" ? 1 : 0 }} />
                      <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: "45%", background: "rgba(255,255,255,0.14)" }} />
                      <span
                        ref={el => {
                          flashRefs.current[index] = el;
                        }}
                        style={{ position: "absolute", inset: 0, opacity: 0 }}
                      />
                      <span style={{ position: "absolute", right: 6, top: 0, bottom: 0, display: "flex", alignItems: "center", fontWeight: 700, fontSize: 10, lineHeight: 1, fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", color: "#ffffff", textShadow: "0 0 3px #000, 0 1px 1px #000" }}>
                        {compact(member.hp)} / {compact(member.maxHp)}
                      </span>
                    </>
                  )}
                </span>

                {showResource && res !== null ? (
                  <span style={{ position: "relative", height: 4, overflow: "hidden", borderRadius: variant === "minimal" ? 2 : 0, background: "rgba(0,0,0,0.6)" }}>
                    <span style={{ position: "absolute", inset: 0, width: `${(out ? 0 : res) * 100}%`, background: `linear-gradient(90deg, ${mixHex(member.resourceColor ?? "#3f8cff", "#000000", 0.25)}, ${member.resourceColor ?? "#3f8cff"})`, transition: reduced ? "none" : "width .5s cubic-bezier(.2,.8,.2,1)" }} />
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {demo ? (
        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="sf-party-frames-btn" style={demoButtonStyle(theme, "#ff5a4f")} onClick={hit}>Take hit</button>
          <button type="button" className="sf-party-frames-btn" style={demoButtonStyle(theme, hpColor)} onClick={heal}>Heal party</button>
          <button type="button" className="sf-party-frames-btn" style={demoButtonStyle(theme, accent)} onClick={toggleDown}>{party.some(m => m.state === "downed" || m.state === "dead") ? "Revive" : "Down target"}</button>
        </div>
      ) : null}
    </div>
  );
}

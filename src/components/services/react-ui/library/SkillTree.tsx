"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { GameGlyph, clamp, demoButtonStyle, gameTheme, mixHex, rgba, usePropState, type GameVariant, type GlyphName } from "./_shared/gameKit";

export type SkillNode = {
  id: string;
  name: string;
  description?: string;
  /** Extra line for the next rank, e.g. "+8% fire damage per rank". */
  perRank?: string;
  glyph?: GlyphName;
  icon?: ReactNode;
  /** Grid column / row (0-based). */
  x: number;
  y: number;
  /** Ranks available (default 1). */
  maxRank?: number;
  /** Points per rank (default 1). */
  cost?: number;
  /** Node ids that must have at least one rank first. */
  requires?: string[];
  /** Bigger keystone node. */
  major?: boolean;
};

export type SkillTreeProps = {
  /** Tree layout. */
  nodes?: SkillNode[];
  /** Learned ranks by node id (resyncs when changed). */
  ranks?: Record<string, number>;
  /** Unspent skill points. */
  points?: number;
  /** Tree name in the header ("" hides the header). */
  title?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Path and node glow color. */
  accent?: string;
  /** Node size in px. */
  nodeSize?: number;
  /** Show node names under the nodes. */
  showLabels?: boolean;
  /** Render +1 point / Reset buttons in the header. */
  demo?: boolean;
  /** Ranks or points changed. */
  onChange?: (ranks: Record<string, number>, points: number) => void;
  /** A rank was learned. */
  onLearn?: (node: SkillNode, rank: number) => void;
  /** A rank was refunded (right-click, Backspace or Delete). */
  onRefund?: (node: SkillNode, rank: number) => void;
  className?: string;
  style?: CSSProperties;
};

export const SAMPLE_SKILLS: SkillNode[] = [
  { id: "kindle", name: "Kindle", glyph: "flame", x: 2, y: 0, major: true, description: "Your spells leave embers that burn for 3 sec." },
  { id: "bolt", name: "Searing Bolt", glyph: "bolt", x: 0, y: 1, maxRank: 3, requires: ["kindle"], description: "Hurl a bolt of flame for 120 fire damage.", perRank: "+15% damage per rank" },
  { id: "ward", name: "Heat Ward", glyph: "shield", x: 2, y: 1, maxRank: 2, requires: ["kindle"], description: "Absorb 180 damage. Attackers are scorched.", perRank: "+90 absorb per rank" },
  { id: "step", name: "Cinder Step", glyph: "dash", x: 4, y: 1, maxRank: 2, requires: ["kindle"], description: "Blink forward, leaving a trail of fire.", perRank: "−2 sec cooldown per rank" },
  { id: "meteor", name: "Meteor Shard", glyph: "gem", x: 0, y: 2, maxRank: 3, requires: ["bolt"], description: "Call down a shard that stuns for 1.5 sec.", perRank: "+0.5 sec stun per rank" },
  { id: "immolate", name: "Immolate", glyph: "skull", x: 1, y: 2, maxRank: 2, requires: ["bolt"], description: "Burning enemies take 20% more damage.", perRank: "+10% per rank" },
  { id: "heart", name: "Molten Heart", glyph: "heart", x: 2, y: 2, maxRank: 3, requires: ["ward"], description: "Regenerate 1% health per burning enemy.", perRank: "+1% per rank" },
  { id: "cauterize", name: "Cauterize", glyph: "potion", x: 3, y: 2, requires: ["ward", "step"], description: "Fatal damage instead sets you ablaze at 30% health. Once per minute." },
  { id: "veil", name: "Smoke Veil", glyph: "eye", x: 4, y: 2, maxRank: 2, requires: ["step"], description: "Become invisible for 3 sec after Cinder Step.", perRank: "+1 sec per rank" },
  { id: "phoenix", name: "Phoenix Rite", glyph: "crown", x: 2, y: 3, major: true, cost: 2, requires: ["immolate", "heart", "cauterize"], description: "Once per fight, rise from death with full health in a nova of flame." },
];
const SAMPLE_RANKS: Record<string, number> = { kindle: 1, bolt: 2, ward: 1 };

const CSS = `
.sf-skill-tree-node { transition: transform .2s cubic-bezier(.2,.9,.3,1.35), filter .25s; }
.sf-skill-tree-node:hover { transform: scale(1.07); }
.sf-skill-tree-node:active { transform: scale(.95); }
.sf-skill-tree-node:focus-visible { outline: none; }
.sf-skill-tree-node:focus-visible .sf-skill-tree-focus { opacity: 1; }
.sf-skill-tree-avail { animation: sf-skill-tree-avail 1.8s cubic-bezier(.45,0,.55,1) infinite; }
@keyframes sf-skill-tree-avail { 0%, 100% { opacity: .35; transform: scale(1); } 50% { opacity: .95; transform: scale(1.08); } }
.sf-skill-tree-flow { animation: sf-skill-tree-flow 1.4s linear infinite; }
@keyframes sf-skill-tree-flow { to { stroke-dashoffset: -28; } }
.sf-skill-tree-ring { animation: sf-skill-tree-ring .75s cubic-bezier(.1,.7,.3,1) both; }
@keyframes sf-skill-tree-ring { from { opacity: 1; transform: translate(-50%,-50%) scale(.6); } to { opacity: 0; transform: translate(-50%,-50%) scale(2.3); } }
.sf-skill-tree-ray { animation: sf-skill-tree-ray .7s cubic-bezier(.1,.7,.3,1) both; }
@keyframes sf-skill-tree-ray { 0% { opacity: 0; transform: rotate(var(--a)) translateY(-10px) scaleY(.3); } 20% { opacity: 1; } 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(var(--d) * -1)) scaleY(1); } }
.sf-skill-tree-flash { animation: sf-skill-tree-flash .6s ease-out both; }
@keyframes sf-skill-tree-flash { from { opacity: .95; } to { opacity: 0; } }
.sf-skill-tree-pop { display: inline-block; animation: sf-skill-tree-pop .45s cubic-bezier(.2,.9,.3,1.6) both; }
@keyframes sf-skill-tree-pop { from { transform: scale(1.7); filter: brightness(2); } to { transform: scale(1); filter: none; } }
.sf-skill-tree-tip { animation: sf-skill-tree-tip .16s cubic-bezier(.2,.9,.3,1) both; }
@keyframes sf-skill-tree-tip { from { opacity: 0; margin-top: 4px; } to { opacity: 1; margin-top: 0; } }
.sf-skill-tree-btn { transition: transform .18s cubic-bezier(.2,.8,.2,1), filter .18s; }
.sf-skill-tree-btn:hover { filter: brightness(1.3); transform: translateY(-1px); }
.sf-skill-tree-btn:focus-visible { outline: 2px solid var(--sf-st-accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .sf-skill-tree-avail, .sf-skill-tree-flow, .sf-skill-tree-pop, .sf-skill-tree-tip { animation: none; }
  .sf-skill-tree-ring, .sf-skill-tree-ray { display: none; }
  .sf-skill-tree-node { transition: none; }
}
`;

type Burst = { key: number; x: number; y: number };

const ranksSignature = (value: Record<string, number>) => Object.keys(value).sort().map(k => `${k}:${value[k]}`).join(",");

function Padlock({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M7 10V7.5a5 5 0 0 1 10 0V10h1.2c.7 0 1.3.6 1.3 1.3v8.4c0 .7-.6 1.3-1.3 1.3H5.8c-.7 0-1.3-.6-1.3-1.3v-8.4c0-.7.6-1.3 1.3-1.3Zm2.6 0h4.8V7.5a2.4 2.4 0 0 0-4.8 0Z" fill="#9a9aa2" stroke="#111" strokeWidth="1" />
    </svg>
  );
}

export function SkillTree({
  nodes = SAMPLE_SKILLS,
  ranks = SAMPLE_RANKS,
  points = 5,
  title = "Pyromancy",
  variant = "fantasy",
  accent = "#ff8a3d",
  nodeSize = 52,
  showLabels = true,
  demo = false,
  onChange,
  onLearn,
  onRefund,
  className,
  style,
}: SkillTreeProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const [learned, setLearned] = usePropState(ranks, ranksSignature);
  const [left, setLeft] = usePropState(Math.max(0, Math.round(points)));
  const [tip, setTip] = useState<string | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [pointsBump, setPointsBump] = useState(0);
  const surgeRefs = useRef(new Map<string, SVGPathElement>());
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    const list = timeouts.current;
    return () => list.forEach(id => window.clearTimeout(id));
  }, []);

  const byId = new Map(nodes.map(node => [node.id, node]));
  const rankOf = (id: string) => learned[id] ?? 0;
  const maxOf = (node: SkillNode) => Math.max(1, node.maxRank ?? 1);
  const costOf = (node: SkillNode) => Math.max(0, node.cost ?? 1);
  const unmet = (node: SkillNode) => (node.requires ?? []).filter(id => rankOf(id) <= 0);
  const canLearn = (node: SkillNode) => unmet(node).length === 0 && rankOf(node.id) < maxOf(node) && left >= costOf(node);
  const dependents = (id: string) => nodes.filter(node => node.requires?.includes(id) && rankOf(node.id) > 0);
  const canRefund = (node: SkillNode) => rankOf(node.id) > 0 && (rankOf(node.id) > 1 || dependents(node.id).length === 0);

  const s = nodeSize;
  const colGap = Math.round(s * 2.12);
  const rowGap = Math.round(s + (showLabels ? 30 : 22));
  const padX = Math.round(s * 0.85);
  const padY = 12;
  const maxX = Math.max(0, ...nodes.map(n => n.x));
  const maxY = Math.max(0, ...nodes.map(n => n.y));
  const boardW = padX * 2 + maxX * colGap + s;
  const boardH = padY * 2 + maxY * rowGap + s + (showLabels ? 16 : 0);
  const cx = (node: SkillNode) => padX + s / 2 + node.x * colGap;
  const cy = (node: SkillNode) => padY + s / 2 + node.y * rowGap;
  const sizeOf = (node: SkillNode) => (node.major ? Math.round(s * 1.18) : s);

  const edgePath = (from: SkillNode, to: SkillNode) => {
    const x1 = cx(from), y1 = cy(from), x2 = cx(to), y2 = cy(to);
    if (variant === "minimal" || x1 === x2) return `M${x1} ${y1} L${x2} ${y2}`;
    const midY = (y1 + y2) / 2;
    if (variant === "sci-fi") {
      const r = 8 * Math.sign(x2 - x1);
      return `M${x1} ${y1} L${x1} ${midY - 8} Q${x1} ${midY} ${x1 + r} ${midY} L${x2 - r} ${midY} Q${x2} ${midY} ${x2} ${midY + 8} L${x2} ${y2}`;
    }
    return `M${x1} ${y1} C${x1} ${midY + 6}, ${x2} ${midY - 6}, ${x2} ${y2}`;
  };

  const commit = (next: Record<string, number>, nextLeft: number) => {
    setLearned(next);
    setLeft(nextLeft);
    setPointsBump(b => b + 1);
    onChange?.(next, nextLeft);
  };

  const learn = (node: SkillNode) => {
    if (!canLearn(node)) {
      if (!reduced) nodeRefs.current.get(node.id)?.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(-2px)" }, { transform: "translateX(0)" }], { duration: 280, easing: "ease-out" });
      return;
    }
    const rank = rankOf(node.id) + 1;
    commit({ ...learned, [node.id]: rank }, left - costOf(node));
    onLearn?.(node, rank);
    const key = Date.now() + Math.random();
    setBursts(list => [...list, { key, x: cx(node), y: cy(node) }]);
    timeouts.current.push(window.setTimeout(() => setBursts(list => list.filter(b => b.key !== key)), 900));
    if (rank === 1) {
      for (const req of node.requires ?? []) {
        const path = surgeRefs.current.get(`${req}>${node.id}`);
        if (!path) continue;
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length} ${length}`;
        path.animate(
          [
            { strokeDashoffset: length, opacity: 1 },
            { strokeDashoffset: 0, opacity: 1, offset: 0.7 },
            { strokeDashoffset: 0, opacity: 0 },
          ],
          { duration: reduced ? 1 : 720, easing: "cubic-bezier(.4,0,.2,1)" },
        );
      }
    }
  };

  const refund = (node: SkillNode) => {
    if (!canRefund(node)) {
      if (!reduced) nodeRefs.current.get(node.id)?.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 240, easing: "ease-out" });
      return;
    }
    const rank = rankOf(node.id) - 1;
    const next = { ...learned, [node.id]: rank };
    if (rank <= 0) delete next[node.id];
    commit(next, left + costOf(node));
    onRefund?.(node, rank);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const dir = dirs[event.key];
    const current = nodes.find(node => nodeRefs.current.get(node.id) === document.activeElement);
    if (!current) return;
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      refund(current);
      return;
    }
    if (event.key === "Escape") {
      setTip(null);
      return;
    }
    if (!dir) return;
    event.preventDefault();
    let best: SkillNode | null = null;
    let bestScore = Infinity;
    for (const node of nodes) {
      if (node === current) continue;
      const dx = node.x - current.x;
      const dy = node.y - current.y;
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 0) continue;
      const across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]);
      const score = along + across * 2.2;
      if (score < bestScore) {
        bestScore = score;
        best = node;
      }
    }
    if (best) nodeRefs.current.get(best.id)?.focus();
  };

  const spent = nodes.reduce((sum, node) => sum + rankOf(node.id) * costOf(node), 0);
  const tipNode = tip ? byId.get(tip) : undefined;
  const hi = accent;
  const edgeFrame = variant === "fantasy" ? rgba("#d4ae68", 0.35) : variant === "minimal" ? "rgba(255,255,255,0.08)" : rgba(accent, 0.25);

  const shape = (node: SkillNode, inset: number): CSSProperties => {
    const size = sizeOf(node) - inset * 2;
    if (variant === "sci-fi") return { clipPath: "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0 50%)", width: size, height: size };
    if (variant === "minimal") return { borderRadius: Math.max(4, size * 0.28), width: size, height: size };
    return { borderRadius: "50%", width: size, height: size };
  };

  return (
    <div className={className} style={{ display: "inline-block", fontFamily: theme.font, color: theme.text, userSelect: "none", ["--sf-st-accent" as string]: hi, ...style }}>
      <style>{CSS}</style>
      <div
        style={{
          position: "relative",
          padding: "12px 10px 4px",
          background: variant === "minimal" ? "rgba(20,20,24,0.72)" : theme.panel,
          borderRadius: variant === "minimal" ? 16 : theme.radius + 4,
          clipPath: theme.clip(16),
          boxShadow: `inset 0 0 0 1px ${edgeFrame}, 0 24px 60px rgba(0,0,0,0.55)`,
        }}
      >
        {title || demo ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px 10px", borderBottom: `1px solid ${edgeFrame}` }}>
            {title ? (
              <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 15, fontWeight: 700, letterSpacing: theme.tracking, textTransform: theme.caps ? "uppercase" : "none", color: variant === "fantasy" ? "#f3dfae" : theme.text }}>
                <GameGlyph name="flame" color={hi} size={18} />
                {title}
              </span>
            ) : null}
            <span style={{ fontFamily: theme.numeric, fontSize: 11.5, color: theme.muted }}>{spent} spent</span>
            <span style={{ flex: 1 }} />
            {demo ? (
              <>
                <button type="button" className="sf-skill-tree-btn" style={{ ...demoButtonStyle(theme, hi), padding: "7px 10px" }} onClick={() => commit(learned, left + 1)}>+1 point</button>
                <button type="button" className="sf-skill-tree-btn" style={{ ...demoButtonStyle(theme, "#9aa4b2"), padding: "7px 10px" }} onClick={() => commit({ ...ranks }, Math.max(0, Math.round(points)))}>Reset</button>
              </>
            ) : null}
            <span aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 6px 5px 11px", borderRadius: variant === "minimal" ? 999 : 2, background: rgba(hi, left > 0 ? 0.14 : 0.05), boxShadow: `inset 0 0 0 1px ${rgba(hi, left > 0 ? 0.45 : 0.15)}` }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.muted }}>Points</span>
              <span style={{ minWidth: 26, height: 24, display: "grid", placeItems: "center", borderRadius: variant === "minimal" ? 999 : 2, background: left > 0 ? hi : "rgba(255,255,255,0.08)", color: left > 0 ? "#140a04" : theme.muted, font: `800 14px/1 ${theme.numeric}` }}>
                <span key={pointsBump} className={pointsBump ? "sf-skill-tree-pop" : undefined}>{left}</span>
              </span>
            </span>
          </div>
        ) : null}

        <div role="group" aria-label={`${title || "Skill tree"}, ${left} points available`} onKeyDown={onKeyDown} style={{ position: "relative", width: boardW, height: boardH, margin: "0 auto" }}>
          {variant === "sci-fi" ? <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${rgba(accent, 0.18)} 1px, transparent 1.2px)`, backgroundSize: "18px 18px", maskImage: "radial-gradient(ellipse at center, #000 40%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, #000 40%, transparent 80%)" }} /> : null}
          {variant === "fantasy" ? <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${rgba(accent, 0.08)}, transparent 70%)` }} /> : null}

          <svg width={boardW} height={boardH} aria-hidden style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {nodes.flatMap(node =>
              (node.requires ?? []).map(req => {
                const from = byId.get(req);
                if (!from) return null;
                const d = edgePath(from, node);
                const lit = rankOf(req) > 0 && rankOf(node.id) > 0;
                const reach = rankOf(req) > 0 && !lit;
                return (
                  <g key={`${req}>${node.id}`}>
                    <path d={d} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={lit ? 7 : 5} strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d={d}
                      fill="none"
                      stroke={lit ? mixHex(hi, "#ffffff", 0.15) : reach ? rgba(hi, 0.42) : "rgba(255,255,255,0.1)"}
                      strokeWidth={lit ? 3 : 2}
                      strokeDasharray={!lit && !reach && variant !== "minimal" ? "2 5" : undefined}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: lit ? `drop-shadow(0 0 5px ${hi})` : undefined, transition: "stroke .3s" }}
                    />
                    {lit ? <path className="sf-skill-tree-flow" d={d} fill="none" stroke={mixHex(hi, "#ffffff", 0.7)} strokeOpacity={0.8} strokeWidth={1.4} strokeDasharray="3 25" strokeLinecap="round" /> : null}
                    <path
                      ref={el => {
                        if (el) surgeRefs.current.set(`${req}>${node.id}`, el);
                        else surgeRefs.current.delete(`${req}>${node.id}`);
                      }}
                      d={d}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0}
                      style={{ filter: `drop-shadow(0 0 6px ${hi}) drop-shadow(0 0 12px ${hi})` }}
                    />
                  </g>
                );
              }),
            )}
          </svg>

          {nodes.map(node => {
            const rank = rankOf(node.id);
            const max = maxOf(node);
            const locked = unmet(node).length > 0;
            const available = canLearn(node);
            const maxed = rank >= max;
            const size = sizeOf(node);
            const ring = maxed ? mixHex(hi, "#ffe2a8", 0.45) : rank > 0 ? hi : available ? rgba(hi, 0.75) : locked ? "rgba(255,255,255,0.14)" : rgba(hi, 0.3);
            const fill =
              rank > 0
                ? `radial-gradient(circle at 50% 35%, ${mixHex(hi, "#2a1208", 0.45)}, ${mixHex(hi, "#050303", 0.85)} 75%)`
                : variant === "minimal"
                  ? "linear-gradient(180deg, #202025, #141417)"
                  : variant === "sci-fi"
                    ? "linear-gradient(180deg, #0e171e, #060a0d)"
                    : "radial-gradient(circle at 50% 35%, #2a2019, #110c09 75%)";
            return (
              <div key={node.id} style={{ position: "absolute", left: cx(node) - size / 2, top: cy(node) - size / 2, width: size, zIndex: tip === node.id ? 3 : 1 }}>
                {available ? <span aria-hidden className="sf-skill-tree-avail" style={{ position: "absolute", left: -6, top: -6, ...shape(node, -6), background: `radial-gradient(closest-side, ${rgba(hi, 0.45)}, transparent)` }} /> : null}
                <button
                  ref={el => {
                    if (el) nodeRefs.current.set(node.id, el);
                    else nodeRefs.current.delete(node.id);
                  }}
                  type="button"
                  className="sf-skill-tree-node"
                  aria-label={`${node.name}, rank ${rank} of ${max}${locked ? ", locked" : available ? ", can learn" : maxed ? ", maxed" : ""}`}
                  aria-describedby={tip === node.id ? `sf-skill-tree-tip-${node.id}` : undefined}
                  onClick={() => learn(node)}
                  onContextMenu={event => {
                    event.preventDefault();
                    refund(node);
                  }}
                  onPointerEnter={() => setTip(node.id)}
                  onPointerLeave={() => setTip(t => (t === node.id ? null : t))}
                  onFocus={() => setTip(node.id)}
                  onBlur={() => setTip(t => (t === node.id ? null : t))}
                  style={{ position: "relative", display: "grid", placeItems: "center", padding: 0, border: 0, background: "transparent", cursor: available ? "pointer" : "default", width: sizeOf(node), height: sizeOf(node), borderRadius: variant === "sci-fi" ? 0 : shape(node, 0).borderRadius }}
                >
                  <span aria-hidden style={{ position: "absolute", inset: 0, ...shape(node, 0), background: ring, boxShadow: rank > 0 ? `0 0 18px ${rgba(hi, maxed ? 0.7 : 0.45)}` : undefined, transition: "background .3s" }} />
                  {variant === "fantasy" ? <span aria-hidden style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#120c08" }} /> : null}
                  <span aria-hidden style={{ position: "absolute", left: variant === "fantasy" ? 4 : 2, top: variant === "fantasy" ? 4 : 2, ...shape(node, variant === "fantasy" ? 4 : 2), background: fill, boxShadow: "inset 0 2px 8px rgba(0,0,0,0.7)" }} />
                  <span aria-hidden className="sf-skill-tree-focus" style={{ position: "absolute", inset: -5, ...shape(node, -5), boxShadow: `0 0 0 2px ${mixHex(hi, "#ffffff", 0.5)}`, background: variant === "sci-fi" ? rgba("#ffffff", 0.35) : undefined, opacity: 0, transition: "opacity .15s", zIndex: -1 }} />
                  <span aria-hidden style={{ position: "relative", display: "grid", placeItems: "center", filter: rank > 0 ? `drop-shadow(0 0 8px ${rgba(hi, 0.8)})` : locked ? "grayscale(1) brightness(.55)" : "saturate(.6) brightness(.85)", transition: "filter .3s" }}>
                    {node.icon ?? <GameGlyph name={node.glyph ?? "star"} color={rank > 0 ? mixHex(hi, "#ffe9c8", 0.35) : mixHex(hi, "#a0a0a8", 0.55)} size={size * 0.5} />}
                  </span>
                  {locked ? <span aria-hidden style={{ position: "absolute", right: variant === "sci-fi" ? 6 : 0, top: variant === "sci-fi" ? 2 : -2 }}><Padlock size={15} /></span> : null}
                  {max > 1 || rank > 0 ? (
                    <span aria-hidden style={{ position: "absolute", left: "50%", bottom: -8, transform: "translateX(-50%)", padding: "2px 6px", borderRadius: variant === "minimal" ? 999 : 2, fontWeight: 800, fontSize: 10, lineHeight: 1, fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: maxed ? "#1a0c04" : rank > 0 ? theme.text : theme.muted, background: maxed ? mixHex(hi, "#ffe2a8", 0.45) : "#0c0a09", boxShadow: `inset 0 0 0 1px ${rank > 0 ? hi : "rgba(255,255,255,0.18)"}` }}>
                      {rank}/{max}
                    </span>
                  ) : null}
                </button>
                {showLabels ? (
                  <div aria-hidden style={{ position: "absolute", left: "50%", top: size + 10, width: colGap - 10, transform: "translateX(-50%)", textAlign: "center", fontSize: 11, fontWeight: 600, lineHeight: 1.15, letterSpacing: theme.caps ? "0.04em" : 0, color: rank > 0 ? theme.text : locked ? rgba(theme.text, 0.32) : theme.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 3px #000" }}>
                    {node.name}
                  </div>
                ) : null}
              </div>
            );
          })}

          {bursts.map(burst => (
            <div key={burst.key} aria-hidden style={{ position: "absolute", left: burst.x, top: burst.y, width: 0, height: 0, pointerEvents: "none", zIndex: 2 }}>
              <span className="sf-skill-tree-ring" style={{ position: "absolute", left: 0, top: 0, width: s * 1.2, height: s * 1.2, borderRadius: "50%", boxShadow: `0 0 0 2px ${mixHex(hi, "#ffffff", 0.5)}, 0 0 24px ${hi}` }} />
              <span className="sf-skill-tree-flash" style={{ position: "absolute", left: -s * 0.7, top: -s * 0.7, width: s * 1.4, height: s * 1.4, borderRadius: "50%", background: `radial-gradient(closest-side, #ffffff, ${rgba(hi, 0.6)} 45%, transparent)`, mixBlendMode: "screen" }} />
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className="sf-skill-tree-ray" style={{ position: "absolute", left: -1.5, top: -8, width: 3, height: 16, borderRadius: 2, transformOrigin: "50% 100%", background: `linear-gradient(0deg, transparent, ${mixHex(hi, "#ffffff", 0.5)})`, ["--a" as string]: `${i * 30 + (i % 2) * 12}deg`, ["--d" as string]: `${s * (0.85 + (i % 3) * 0.2)}px`, animationDelay: `${(i % 3) * 0.03}s` }} />
              ))}
            </div>
          ))}

          {tipNode ? (
            (() => {
              const rank = rankOf(tipNode.id);
              const max = maxOf(tipNode);
              const missing = unmet(tipNode).map(id => byId.get(id)?.name ?? id);
              const rightSide = cx(tipNode) < boardW / 2;
              const size = sizeOf(tipNode);
              return (
                <div
                  id={`sf-skill-tree-tip-${tipNode.id}`}
                  role="tooltip"
                  className="sf-skill-tree-tip"
                  style={{
                    position: "absolute",
                    top: clamp(cy(tipNode) - size / 2 - 6, 0, Math.max(0, boardH - 150)),
                    ...(rightSide ? { left: cx(tipNode) + size / 2 + 14 } : { right: boardW - (cx(tipNode) - size / 2 - 14) }),
                    width: 236,
                    zIndex: 5,
                    pointerEvents: "none",
                    padding: "11px 13px",
                    background: variant === "fantasy" ? "linear-gradient(180deg, rgba(34,25,18,0.98), rgba(16,11,8,0.985))" : variant === "minimal" ? "rgba(24,24,28,0.97)" : "linear-gradient(180deg, rgba(12,20,27,0.98), rgba(5,9,12,0.985))",
                    borderRadius: variant === "minimal" ? 10 : theme.radius + 1,
                    clipPath: theme.clip(8),
                    boxShadow: `inset 0 0 0 1px ${rgba(hi, 0.4)}, 0 16px 40px rgba(0,0,0,0.7)`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: rank > 0 ? mixHex(hi, "#ffffff", 0.4) : theme.text }}>{tipNode.name}</span>
                    <span style={{ fontFamily: theme.numeric, fontSize: 11.5, color: theme.muted }}>Rank {rank}/{max}</span>
                  </div>
                  {tipNode.description ? <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.45, color: rgba(theme.text, 0.85), fontFamily: variant === "fantasy" ? theme.numeric : undefined }}>{tipNode.description}</div> : null}
                  {tipNode.perRank && rank < max ? <div style={{ marginTop: 5, fontSize: 12, color: "#7fe3a0" }}>Next rank: {tipNode.perRank}</div> : null}
                  <div style={{ marginTop: 8, paddingTop: 7, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11.5, lineHeight: 1.5, fontFamily: theme.numeric }}>
                    {missing.length ? <div style={{ color: "#ff6a5f" }}>Requires {missing.join(", ")}</div> : null}
                    {rank >= max ? (
                      <div style={{ color: mixHex(hi, "#ffe2a8", 0.45) }}>Mastered</div>
                    ) : (
                      <div style={{ color: left >= costOf(tipNode) ? theme.muted : "#ff6a5f" }}>
                        Cost {costOf(tipNode)} point{costOf(tipNode) === 1 ? "" : "s"}
                        {!missing.length && left >= costOf(tipNode) ? " · Click to learn" : ""}
                      </div>
                    )}
                    {canRefund(tipNode) ? <div style={{ color: rgba(theme.text, 0.38) }}>Right-click to refund</div> : null}
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>
      </div>
    </div>
  );
}

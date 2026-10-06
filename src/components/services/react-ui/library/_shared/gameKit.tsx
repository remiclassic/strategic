"use client";

import { useId, useState, type CSSProperties } from "react";
import { hexToRgb } from "./hooks";

/* Shared building blocks for the SliceForge "Game UI" components: themes, rarity tiers, glyph icons and small helpers. */

export type GameVariant = "sci-fi" | "fantasy" | "minimal";

export type GameTheme = {
  /** Display font for labels and titles. */
  font: string;
  /** Font for numbers (tabular). */
  numeric: string;
  /** Label letter-spacing. */
  tracking: string;
  /** Labels are rendered in caps. */
  caps: boolean;
  /** Panel fill. */
  panel: string;
  /** Neutral frame line color. */
  line: string;
  /** Metallic trim (gold for fantasy, the accent for sci-fi, white for minimal). */
  trim: (accent: string) => string;
  /** Corner radius for panels and slots. */
  radius: number;
  /** Optional clip-path with chamfered corners. */
  clip: (size: number) => string | undefined;
  text: string;
  muted: string;
};

const chamfer = (size: number) =>
  `polygon(${size}px 0, 100% 0, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, 0 100%, 0 ${size}px)`;

const THEMES: Record<GameVariant, GameTheme> = {
  "sci-fi": {
    font: '"Rajdhani", "Barlow Semi Condensed", "Bahnschrift", "Segoe UI", system-ui, sans-serif',
    numeric: '"Bahnschrift", "Rajdhani", "Segoe UI", system-ui, sans-serif',
    tracking: "0.16em",
    caps: true,
    panel: "linear-gradient(180deg, rgba(14, 22, 30, 0.92), rgba(6, 10, 14, 0.94))",
    line: "rgba(160, 220, 255, 0.16)",
    trim: accent => accent,
    radius: 2,
    clip: chamfer,
    text: "#e8f4ff",
    muted: "rgba(200, 225, 245, 0.56)",
  },
  fantasy: {
    font: '"Cinzel", "Trajan Pro", "Palatino Linotype", Palatino, Georgia, serif',
    numeric: '"Palatino Linotype", Palatino, Georgia, serif',
    tracking: "0.1em",
    caps: true,
    panel: "linear-gradient(180deg, rgba(38, 28, 20, 0.95), rgba(18, 13, 10, 0.97))",
    line: "rgba(214, 178, 110, 0.28)",
    trim: () => "#d4ae68",
    radius: 4,
    clip: () => undefined,
    text: "#f6ead3",
    muted: "rgba(236, 216, 180, 0.58)",
  },
  minimal: {
    font: 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif',
    numeric: 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif',
    tracking: "0.04em",
    caps: false,
    panel: "linear-gradient(180deg, rgba(28, 28, 32, 0.9), rgba(18, 18, 22, 0.92))",
    line: "rgba(255, 255, 255, 0.1)",
    trim: () => "rgba(255, 255, 255, 0.22)",
    radius: 10,
    clip: () => undefined,
    text: "#f4f4f5",
    muted: "rgba(228, 228, 231, 0.55)",
  },
};

export function gameTheme(variant: GameVariant | string | undefined): GameTheme {
  return THEMES[(variant as GameVariant) in THEMES ? (variant as GameVariant) : "sci-fi"];
}

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
export const RARITY: Record<Rarity, { label: string; color: string; deep: string }> = {
  common: { label: "Common", color: "#b8b3aa", deep: "#4a4640" },
  uncommon: { label: "Uncommon", color: "#5fd67a", deep: "#16502a" },
  rare: { label: "Rare", color: "#4aa8ff", deep: "#0f3b6e" },
  epic: { label: "Epic", color: "#c07bff", deep: "#46177a" },
  legendary: { label: "Legendary", color: "#ffb43d", deep: "#7a3d06" },
};
export function rarityOf(value: string | undefined): Rarity {
  return (RARITY_ORDER as string[]).includes(value ?? "") ? (value as Rarity) : "common";
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** "#ff8800" + alpha -> "rgba(...)". */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}

/** Blend two hex colors, t = 0 -> a, 1 -> b. */
export function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const channel = (index: number) => Math.round((ca[index] + (cb[index] - ca[index]) * t) * 255).toString(16).padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/**
 * Local state seeded from a prop. Whenever the prop changes the state snaps to it, but the
 * component may still change it internally (demo controls, clicks) and report via callbacks.
 * `signature` lets array/object props compare by content instead of identity.
 */
export function usePropState<T>(prop: T, signature: (value: T) => unknown = value => value): [T, (next: T | ((previous: T) => T)) => void] {
  const [state, setState] = useState(prop);
  const [seen, setSeen] = useState(() => signature(prop));
  const current = signature(prop);
  if (!Object.is(seen, current)) {
    setSeen(current);
    setState(prop);
  }
  return [state, setState];
}

/** True when the keyboard event came from a text field (so hotkeys stay out of the way). */
export function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element || !element.tagName) return false;
  return element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName);
}

/** Small HUD-styled button used by the optional `demo` controls. */
export function demoButtonStyle(theme: GameTheme, accent: string): CSSProperties {
  return {
    appearance: "none",
    cursor: "pointer",
    font: `600 12px/1 ${theme.font}`,
    letterSpacing: theme.caps ? "0.12em" : "0.02em",
    textTransform: theme.caps ? "uppercase" : "none",
    color: theme.text,
    padding: "9px 14px",
    borderRadius: theme.radius,
    border: `1px solid ${rgba(accent, 0.38)}`,
    background: `linear-gradient(180deg, ${rgba(accent, 0.16)}, ${rgba(accent, 0.05)})`,
    boxShadow: `inset 0 1px 0 ${rgba("#ffffff", 0.08)}`,
    clipPath: theme.clip(6),
  };
}

/* ---------- Glyph icons ---------- */

type Glyph = { d: string; detail?: string; evenOdd?: boolean };

/** Original 24×24 glyph silhouettes used as default icons. */
export const GLYPHS = {
  sword: {
    d: "M20.6 2.2 21.8 3.4 21.3 6 12 15.3 8.7 12 18 2.7ZM5.6 11.4l1.1-1.1 7 7-1.1 1.1-1.5-.4-1.3 1.3.2 1.6-1.1 1.1-1.6-.2L5.2 20.9a1.6 1.6 0 1 1-2.1-2.1l2.1-2.1-.2-1.6 1.1-1.1 1.6.2 1.3-1.3Z",
    detail: "M20 4 10.6 13.4",
  },
  shield: {
    d: "M12 2.2 20.2 5v6.3c0 5.2-3.4 9-8.2 10.6-4.8-1.6-8.2-5.4-8.2-10.6V5Z",
    detail: "M12 5v14M7 9.5h10",
  },
  potion: {
    d: "M9.2 2.4h5.6v1.9h-.9v3.6c2.9 1 4.9 3.7 4.9 6.9 0 4.1-3.2 7-6.8 7s-6.8-2.9-6.8-7c0-3.2 2-5.9 4.9-6.9V4.3h-.9Z",
    detail: "M6.8 14.2c1.6-.9 3.3.9 5.2 0s3.6-.9 5.2 0",
  },
  flame: {
    d: "M12.4 2c.9 3.4 6.1 5.8 6.1 11.4a6.5 6.5 0 0 1-13 0c0-2.8 1.3-4.8 2.8-6.2.2 2 1 3.3 2.4 3.9-.6-3.6.4-6.5 1.7-9.1Z",
    detail: "M12 21c-1.8 0-3-1.3-3-3 0-1.9 1.5-2.9 2.3-4.4.6 1.5 3.7 2.4 3.7 4.4 0 1.7-1.2 3-3 3Z",
  },
  bolt: { d: "M14.2 1.8 4.6 13.6h6.1l-1.6 8.6 10.3-12.6h-6.4Z" },
  heart: {
    d: "M12 21.2S3.3 15.8 3.3 9.6a4.9 4.9 0 0 1 8.7-3.1 4.9 4.9 0 0 1 8.7 3.1c0 6.2-8.7 11.6-8.7 11.6Z",
    detail: "M7 9.4a2.5 2.5 0 0 1 2.2-2.2",
  },
  star: { d: "m12 2.3 2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.4l-6 3.3 1.3-6.7-5-4.7 6.8-.8Z" },
  gem: {
    d: "M7.2 3h9.6l4.4 6.1L12 21.2 2.8 9.1Z",
    detail: "M2.8 9.1h18.4M7.2 3 9.6 9.1 12 21.2l2.4-12.1L16.8 3",
  },
  ring: {
    d: "M12 8.2a6.8 6.8 0 1 1 0 13.6 6.8 6.8 0 0 1 0-13.6Zm0 2.4a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8ZM9.4 2.4h5.2l1.6 2.6L12 8.6 7.8 5Z",
    evenOdd: true,
  },
  scroll: {
    d: "M7 3.2h10.6a3 3 0 0 1 0 6h-.8v8.6a3 3 0 0 1-3 3H6.4a3 3 0 0 1 0-6h.8V6.2A3 3 0 0 1 7 3.2Z",
    detail: "M10 8h4.2M10 11h4.2M10 14h3",
  },
  leaf: {
    d: "M20.4 2.8C10.8 2.8 4 8.2 4 15.2c0 1.8.4 3.4 1.2 4.6 1-4.4 4.4-8.3 8.8-10.3-3.6 2.6-6.3 6.1-7.3 10.3 1.1.7 2.6 1.1 4.3 1.1 6.6 0 9.4-7.9 9.4-18.1Z",
  },
  mushroom: {
    d: "M3 12.4a9 8.2 0 0 1 18 0c0 1-.8 1.6-1.8 1.6H4.8C3.8 14 3 13.4 3 12.4ZM9.4 14h5.2l.9 6a1.8 1.8 0 0 1-1.8 2h-3.4a1.8 1.8 0 0 1-1.8-2Z",
    detail: "M7.5 8.2h.1M12 6.6h.1M16.4 9h.1",
  },
  skull: {
    d: "M12 2.4c4.8 0 8.4 3.4 8.4 7.9 0 2.6-1.2 4.5-3 5.6v3.1a1.6 1.6 0 0 1-1.6 1.6H8.2a1.6 1.6 0 0 1-1.6-1.6v-3.1c-1.8-1.1-3-3-3-5.6 0-4.5 3.6-7.9 8.4-7.9Zm-3.4 7.3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6.8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    evenOdd: true,
  },
  dash: { d: "M3.2 4.6h3.9l6.1 7.4-6.1 7.4H3.2L9.3 12Zm7.4 0h3.9l6.1 7.4-6.1 7.4h-3.9l6.1-7.4Z" },
  snowflake: {
    d: "M11 1.8h2v4.1l2.3-2.3 1.4 1.4L13 8.7v2.3h2.3l3.7-3.7 1.4 1.4-2.3 2.3h4.1v2h-4.1l2.3 2.3-1.4 1.4-3.7-3.7H13v2.3l3.7 3.7-1.4 1.4-2.3-2.3v4.1h-2v-4.1l-2.3 2.3-1.4-1.4 3.7-3.7V13H8.7L5 16.7l-1.4-1.4L5.9 13H1.8v-2h4.1L3.6 8.7 5 7.3 8.7 11H11V8.7L7.3 5l1.4-1.4L11 5.9Z",
  },
  key: {
    d: "M7.6 6.2a5.4 5.4 0 0 1 5.2 6.9l8.6 8.6-2.2 2.2-1.6-1.6-1.6 1.6-2.2-2.2 1.6-1.6-3-3A5.4 5.4 0 1 1 7.6 6.2Zm0 3a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z",
    evenOdd: true,
  },
  eye: {
    d: "M12 5c5.2 0 8.8 4.4 10 7-1.2 2.6-4.8 7-10 7s-8.8-4.4-10-7c1.2-2.6 4.8-7 10-7Zm0 3.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z",
    evenOdd: true,
  },
  trophy: {
    d: "M6.5 2.5h11v2h3.2v2.2c0 3-2 5-4.8 5.5a6 6 0 0 1-2.9 2.9V18h3v3.5H8V18h3v-2.9a6 6 0 0 1-2.9-2.9C5.3 11.7 3.3 9.7 3.3 6.7V4.5h3.2Zm11 4.2v3.2c1.1-.5 1.3-1.5 1.3-3.2Zm-11 0H5.2c0 1.7.2 2.7 1.3 3.2Z",
    evenOdd: true,
  },
  crown: { d: "M2.8 7.2 7.6 11 12 3.8 16.4 11l4.8-3.8-1.8 11.2H4.6Zm2 12.8h14.4v2H4.8Z" },
  compass: {
    d: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm4.4 3.4-2.6 6.2-6.2 2.6 2.6-6.2Z",
    evenOdd: true,
  },
} satisfies Record<string, Glyph>;

export type GlyphName = keyof typeof GLYPHS;
export const GLYPH_NAMES = Object.keys(GLYPHS) as GlyphName[];

export type GameGlyphProps = {
  /** Glyph to draw. */
  name: GlyphName;
  /** Base color; the glyph is shaded from a light tint to a deep shade of it. */
  color?: string;
  /** Pixel size. */
  size?: number | string;
  style?: CSSProperties;
};

/** A shaded, outlined glyph icon (gradient body, dark rim, specular detail lines). */
export function GameGlyph({ name, color = "#f0c060", size = 24, style }: GameGlyphProps) {
  const id = useId().replace(/:/g, "");
  const glyph: Glyph = GLYPHS[name] ?? GLYPHS.star;
  const light = mixHex(color, "#ffffff", 0.55);
  const deep = mixHex(color, "#000000", 0.45);
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ display: "block", overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={`g${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <path d={glyph.d} fill={`url(#g${id})`} fillRule={glyph.evenOdd ? "evenodd" : "nonzero"} stroke={mixHex(color, "#000000", 0.72)} strokeWidth={0.9} strokeLinejoin="round" paintOrder="stroke" />
      {glyph.detail ? <path d={glyph.detail} fill="none" stroke={mixHex(color, "#ffffff", 0.78)} strokeOpacity={0.7} strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { clamp, gameTheme, mixHex, rgba, usePropState, type GameVariant } from "./_shared/gameKit";

type SettingBase = { id: string; label: string; description?: string };
export type SettingDef =
  | (SettingBase & { type: "slider"; min: number; max: number; step?: number; unit?: string })
  | (SettingBase & { type: "picker"; options: string[] })
  | (SettingBase & { type: "toggle" })
  | (SettingBase & { type: "keybind" });

export type SettingsTab = { id: string; label: string; settings: SettingDef[] };
export type SettingsValues = Record<string, number | string | boolean>;

export type SettingsPanelProps = {
  /** Tabs and their settings. */
  tabs?: SettingsTab[];
  /** Current values keyed by setting id. */
  values?: SettingsValues;
  /** Values restored by "Reset defaults". */
  defaults?: SettingsValues;
  /** Active tab id. */
  tab?: string;
  /** Visual style. */
  variant?: GameVariant;
  /** Highlight, slider and focus color. */
  accent?: string;
  /** Panel width in px. */
  width?: number;
  /** Show the description panel on the right. */
  showInfo?: boolean;
  /** Listen to connected gamepads (d-pad, A, LB/RB). */
  gamepad?: boolean;
  /** A setting changed. */
  onChange?: (id: string, value: number | string | boolean, values: SettingsValues) => void;
  /** The active tab changed. */
  onTabChange?: (tab: string) => void;
  /** "Reset defaults" was used. */
  onReset?: (values: SettingsValues) => void;
  className?: string;
  style?: CSSProperties;
};

export const DEFAULT_SETTINGS_TABS: SettingsTab[] = [
  {
    id: "graphics",
    label: "Graphics",
    settings: [
      { id: "quality", label: "Quality preset", type: "picker", options: ["Low", "Medium", "High", "Ultra"], description: "Sets texture, shadow and effect detail together. Ultra needs 8 GB of video memory." },
      { id: "resolution", label: "Resolution", type: "picker", options: ["1280 × 720", "1920 × 1080", "2560 × 1440", "3840 × 2160"], description: "Render resolution of the game view. Interface elements stay sharp at any size." },
      { id: "display", label: "Display mode", type: "picker", options: ["Windowed", "Borderless", "Fullscreen"], description: "Borderless lets you switch windows instantly; fullscreen can reduce input latency." },
      { id: "vsync", label: "V-Sync", type: "toggle", description: "Syncs frames to your monitor's refresh rate to prevent tearing, at a small latency cost." },
      { id: "fov", label: "Field of view", type: "slider", min: 60, max: 120, step: 1, unit: "°", description: "Horizontal field of view. Wider views show more of the world but shrink distant targets." },
      { id: "brightness", label: "Brightness", type: "slider", min: 0, max: 100, step: 1, description: "Adjust until the emblem in the darkest corner is barely visible." },
      { id: "motionBlur", label: "Motion blur", type: "toggle", description: "Blurs fast camera movement for a cinematic look." },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    settings: [
      { id: "master", label: "Master volume", type: "slider", min: 0, max: 100, step: 1, description: "Overall output level." },
      { id: "music", label: "Music", type: "slider", min: 0, max: 100, step: 1, description: "Soundtrack and ambient score." },
      { id: "effects", label: "Effects", type: "slider", min: 0, max: 100, step: 1, description: "Combat, footsteps and world sounds." },
      { id: "voice", label: "Voice", type: "slider", min: 0, max: 100, step: 1, description: "Character dialogue and callouts." },
      { id: "output", label: "Audio output", type: "picker", options: ["Headphones", "Speakers", "Home theater"], description: "Tunes spatial mixing for your device. Headphones enable binaural 3D audio." },
      { id: "subtitles", label: "Subtitles", type: "toggle", description: "Show captions for dialogue and important sounds." },
    ],
  },
  {
    id: "controls",
    label: "Controls",
    settings: [
      { id: "sensitivity", label: "Look sensitivity", type: "slider", min: 1, max: 20, step: 0.5, description: "How fast the camera turns with mouse or stick." },
      { id: "invertY", label: "Invert Y axis", type: "toggle", description: "Pushing up looks down, like a flight stick." },
      { id: "forward", label: "Move forward", type: "keybind", description: "Press Enter, then the key you want. Esc cancels. Taken keys swap places." },
      { id: "jump", label: "Jump", type: "keybind", description: "Press Enter, then the key you want. Esc cancels. Taken keys swap places." },
      { id: "crouch", label: "Crouch", type: "keybind", description: "Press Enter, then the key you want. Esc cancels. Taken keys swap places." },
      { id: "interact", label: "Interact", type: "keybind", description: "Press Enter, then the key you want. Esc cancels. Taken keys swap places." },
      { id: "reload", label: "Reload", type: "keybind", description: "Press Enter, then the key you want. Esc cancels. Taken keys swap places." },
    ],
  },
];

export const DEFAULT_SETTINGS_VALUES: SettingsValues = {
  quality: "High",
  resolution: "2560 × 1440",
  display: "Borderless",
  vsync: true,
  fov: 90,
  brightness: 55,
  motionBlur: false,
  master: 80,
  music: 45,
  effects: 70,
  voice: 85,
  output: "Headphones",
  subtitles: true,
  sensitivity: 6.5,
  invertY: false,
  forward: "W",
  jump: "Space",
  crouch: "C",
  interact: "E",
  reload: "R",
};

const KEY_NAMES: Record<string, string> = { " ": "Space", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", Control: "Ctrl", Escape: "Esc" };
const keyLabel = (key: string) => KEY_NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key);

const CSS = `
.sf-settings-panel-row { transition: background .25s, box-shadow .25s; }
.sf-settings-panel-ctl:focus-visible { outline: none; }
.sf-settings-panel-tab { transition: color .25s; }
.sf-settings-panel-tab:focus-visible { outline: 2px solid var(--sf-sp-accent); outline-offset: 2px; }
.sf-settings-panel-foot:focus-visible { outline: 2px solid var(--sf-sp-accent); outline-offset: 2px; }
.sf-settings-panel-foot { transition: filter .2s; }
.sf-settings-panel-foot:hover { filter: brightness(1.4); }
.sf-settings-panel-ink { transition: transform .45s cubic-bezier(.2,.9,.25,1), width .45s cubic-bezier(.2,.9,.25,1); }
.sf-settings-panel-knob { transition: transform .3s cubic-bezier(.3,1.5,.5,1), background .25s; }
.sf-settings-panel-pip { transition: background .25s, transform .25s; }
.sf-settings-panel-list-l { animation: sf-settings-panel-in-l .4s cubic-bezier(.2,.9,.25,1) both; }
.sf-settings-panel-list-r { animation: sf-settings-panel-in-r .4s cubic-bezier(.2,.9,.25,1) both; }
@keyframes sf-settings-panel-in-l { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
@keyframes sf-settings-panel-in-r { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
.sf-settings-panel-listen { animation: sf-settings-panel-listen 1s ease-in-out infinite; }
@keyframes sf-settings-panel-listen { 50% { opacity: .45; } }
.sf-settings-panel-value { animation: sf-settings-panel-value .3s cubic-bezier(.2,.9,.3,1.2) both; }
@keyframes sf-settings-panel-value { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.sf-settings-panel-range { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
@media (prefers-reduced-motion: reduce) {
  .sf-settings-panel-ink, .sf-settings-panel-knob, .sf-settings-panel-row { transition: none; }
  .sf-settings-panel-list-l, .sf-settings-panel-list-r, .sf-settings-panel-value { animation: none; }
  .sf-settings-panel-listen { animation: none; opacity: .7; }
}
`;

export function SettingsPanel({
  tabs = DEFAULT_SETTINGS_TABS,
  values = DEFAULT_SETTINGS_VALUES,
  defaults = DEFAULT_SETTINGS_VALUES,
  tab = "graphics",
  variant = "sci-fi",
  accent: accentProp = "#58d5ff",
  width = 780,
  showInfo = true,
  gamepad = true,
  onChange,
  onTabChange,
  onReset,
  className,
  style,
}: SettingsPanelProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  // Fantasy warms the accent toward its gold trim so it sits in the palette.
  const accent = variant === "fantasy" ? mixHex(accentProp, "#e0b865", 0.7) : accentProp;
  const list = tabs.length ? tabs : DEFAULT_SETTINGS_TABS;
  const [current, setCurrent] = usePropState(list.some(entry => entry.id === tab) ? tab : list[0].id);
  const [state, setState] = usePropState(values, value => JSON.stringify(value));
  const [active, setActive] = useState(0);
  const [listening, setListening] = useState<string | null>(null);
  const [direction, setDirection] = useState<"l" | "r">("r");
  const [swapped, setSwapped] = useState<string | null>(null);
  const tabIndex = Math.max(0, list.findIndex(entry => entry.id === current));
  const settings = list[tabIndex].settings;
  const row = clamp(active, 0, settings.length - 1);
  const controls = useRef<(HTMLElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inkRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const live = useRef({ state, settings, row, tabIndex, list, listening, onChange });
  live.current = { state, settings, row, tabIndex, list, listening, onChange };

  const set = (id: string, value: number | string | boolean) => {
    const next = { ...live.current.state, [id]: value };
    live.current.state = next;
    setState(next);
    onChange?.(id, value, next);
  };

  const focusRow = (index: number) => {
    setActive(index);
    requestAnimationFrame(() => controls.current[index]?.focus({ preventScroll: false }));
  };

  const switchTab = (delta: number, focus = true) => {
    const { list: all, tabIndex: index } = live.current;
    const next = (index + delta + all.length) % all.length;
    setDirection(delta > 0 ? "r" : "l");
    setCurrent(all[next].id);
    setActive(0);
    setListening(null);
    onTabChange?.(all[next].id);
    if (focus) requestAnimationFrame(() => controls.current[0]?.focus());
  };

  const adjust = (index: number, delta: number) => {
    const setting = live.current.settings[index];
    if (!setting) return;
    const value = live.current.state[setting.id];
    if (setting.type === "slider") {
      const step = setting.step ?? 1;
      const next = clamp(Math.round(((Number(value) || 0) + delta * step) / step) * step, setting.min, setting.max);
      set(setting.id, Number(next.toFixed(4)));
    } else if (setting.type === "picker") {
      const at = Math.max(0, setting.options.indexOf(String(value)));
      set(setting.id, setting.options[(at + delta + setting.options.length) % setting.options.length]);
    } else if (setting.type === "toggle") {
      set(setting.id, delta > 0);
    }
  };

  const confirm = (index: number) => {
    const setting = live.current.settings[index];
    if (!setting) return;
    if (setting.type === "toggle") set(setting.id, !live.current.state[setting.id]);
    else if (setting.type === "picker") adjust(index, 1);
    else if (setting.type === "keybind") setListening(setting.id);
  };

  // Tab indicator follows the active tab.
  useEffect(() => {
    const node = tabRefs.current[tabIndex];
    const ink = inkRef.current;
    if (!node || !ink) return;
    ink.style.width = `${node.offsetWidth}px`;
    ink.style.transform = `translateX(${node.offsetLeft}px)`;
  }, [tabIndex, variant, width]);

  // Key capture while rebinding.
  useEffect(() => {
    if (!listening) return;
    const capture = (event: globalThis.KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      live.current.listening = null;
      if (event.key === "Escape") {
        setListening(null);
        return;
      }
      const label = keyLabel(event.key);
      const { state: now, settings: rows } = live.current;
      const previous = now[listening];
      const clash = rows.find(setting => setting.type === "keybind" && setting.id !== listening && now[setting.id] === label);
      let next = { ...now, [listening]: label };
      if (clash) {
        next = { ...next, [clash.id]: previous as string };
        setSwapped(clash.id);
      }
      live.current.state = next;
      setState(next);
      live.current.onChange?.(listening, label, next);
      if (clash) live.current.onChange?.(clash.id, previous as string, next);
      setListening(null);
    };
    window.addEventListener("keydown", capture, true);
    return () => window.removeEventListener("keydown", capture, true);
  }, [listening, setState]);

  useEffect(() => {
    if (!swapped) return;
    const timer = setTimeout(() => setSwapped(null), 1200);
    return () => clearTimeout(timer);
  }, [swapped]);

  // Gamepad: d-pad navigates, A confirms, LB/RB switch tabs.
  const pad = useRef({ focusRow, adjust, confirm, switchTab });
  pad.current = { focusRow, adjust, confirm, switchTab };
  useEffect(() => {
    if (!gamepad || typeof navigator === "undefined" || !navigator.getGamepads) return;
    let frame = 0;
    let held: Record<string, boolean> = {};
    let repeatAt = 0;
    const poll = (now: number) => {
      const device = Array.from(navigator.getGamepads()).find(Boolean);
      if (!device) {
        frame = 0;
        return;
      }
      const ax = device.axes[0] ?? 0;
      const ay = device.axes[1] ?? 0;
      const input = {
        up: !!device.buttons[12]?.pressed || ay < -0.5,
        down: !!device.buttons[13]?.pressed || ay > 0.5,
        left: !!device.buttons[14]?.pressed || ax < -0.5,
        right: !!device.buttons[15]?.pressed || ax > 0.5,
        a: !!device.buttons[0]?.pressed,
        lb: !!device.buttons[4]?.pressed,
        rb: !!device.buttons[5]?.pressed,
      };
      const fresh = (key: keyof typeof input) => input[key] && !held[key];
      const repeat = (key: keyof typeof input) => fresh(key) || (input[key] && now > repeatAt);
      const { row: at, settings: rows } = live.current;
      if (repeat("up") || repeat("down")) {
        pad.current.focusRow(clamp(at + (input.up ? -1 : 1), 0, rows.length - 1));
        repeatAt = now + (fresh("up") || fresh("down") ? 380 : 120);
      } else if (repeat("left") || repeat("right")) {
        pad.current.adjust(at, input.left ? -1 : 1);
        repeatAt = now + (fresh("left") || fresh("right") ? 380 : 80);
      }
      if (fresh("a")) pad.current.confirm(at);
      if (fresh("lb")) pad.current.switchTab(-1);
      if (fresh("rb")) pad.current.switchTab(1);
      held = input;
      frame = requestAnimationFrame(poll);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(poll);
    };
    window.addEventListener("gamepadconnected", start);
    if (Array.from(navigator.getGamepads()).some(Boolean)) start();
    return () => {
      window.removeEventListener("gamepadconnected", start);
      cancelAnimationFrame(frame);
    };
  }, [gamepad]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (live.current.listening) return;
    const key = event.key;
    const inTabs = (event.target as HTMLElement).getAttribute("role") === "tab";
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (inTabs && key === "ArrowDown") focusRow(row);
      else focusRow(clamp(row + (key === "ArrowDown" ? 1 : -1), 0, settings.length - 1));
    } else if (key === "Home" || key === "End") {
      event.preventDefault();
      focusRow(key === "Home" ? 0 : settings.length - 1);
    } else if (key === "q" || key === "Q" || key === "PageUp" || key === "e" || key === "E" || key === "PageDown") {
      event.preventDefault();
      switchTab(key === "q" || key === "Q" || key === "PageUp" ? -1 : 1, !inTabs);
      if (inTabs) requestAnimationFrame(() => tabRefs.current[live.current.tabIndex]?.focus());
    } else if ((key === "ArrowLeft" || key === "ArrowRight") && inTabs) {
      event.preventDefault();
      switchTab(key === "ArrowLeft" ? -1 : 1, false);
      requestAnimationFrame(() => tabRefs.current[live.current.tabIndex]?.focus());
    } else if ((key === "ArrowLeft" || key === "ArrowRight") && !inTabs) {
      const setting = settings[row];
      if (setting?.type === "slider") return; // the native range handles it
      event.preventDefault();
      adjust(row, key === "ArrowLeft" ? -1 : 1);
    }
  };

  const light = mixHex(accent, "#ffffff", 0.45);
  const trim = variant === "fantasy" ? "#d4ae68" : accent;
  const focused = settings[row];
  const rowH = 40;
  const infoW = showInfo ? 230 : 0;

  const renderControl = (setting: SettingDef, index: number, on: boolean) => {
    const value = state[setting.id];
    const bind = (node: HTMLElement | null) => {
      controls.current[index] = node;
    };
    const common = {
      className: "sf-settings-panel-ctl",
      tabIndex: on ? 0 : -1,
      onFocus: () => setActive(index),
    };
    if (setting.type === "slider") {
      const number = Number(value) || 0;
      const t = (number - setting.min) / (setting.max - setting.min || 1);
      const decimals = (setting.step ?? 1) < 1 ? 1 : 0;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
          <div style={{ position: "relative", flex: 1, height: 22 }}>
            <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 9, height: 4, borderRadius: variant === "minimal" ? 4 : 0, background: "rgba(255,255,255,0.1)", clipPath: variant === "sci-fi" ? "polygon(0 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" : undefined }}>
              <div style={{ position: "absolute", inset: 0, transformOrigin: "0 50%", transform: `scaleX(${t})`, background: `linear-gradient(90deg, ${mixHex(accent, "#000000", 0.35)}, ${on ? light : accent})`, boxShadow: on ? `0 0 10px ${rgba(accent, 0.8)}` : undefined, transition: reduced ? undefined : "transform .12s ease-out" }} />
              {variant === "sci-fi"
                ? Array.from({ length: 9 }, (_, i) => <span key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${(i + 1) * 10}%`, width: 2, background: "rgba(0,0,0,0.5)" }} />)
                : null}
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: variant === "fantasy" ? 4 : 5,
                left: `calc(${t * 100}% - ${variant === "fantasy" ? 7 : 6}px)`,
                width: variant === "fantasy" ? 14 : 12,
                height: variant === "fantasy" ? 14 : 12,
                borderRadius: variant === "minimal" ? "50%" : 0,
                transform: variant === "fantasy" ? "rotate(45deg)" : variant === "sci-fi" ? "skewX(-12deg)" : undefined,
                background: on ? "#fff" : mixHex(accent, "#ffffff", 0.2),
                border: variant === "fantasy" ? "1.5px solid #6b4a1c" : undefined,
                boxShadow: on ? `0 0 0 3px ${rgba(accent, 0.3)}, 0 0 12px ${accent}` : "0 1px 3px rgba(0,0,0,0.6)",
                transition: reduced ? undefined : "left .12s ease-out, box-shadow .2s",
              }}
            />
            <input
              {...common}
              ref={bind}
              type="range"
              className="sf-settings-panel-range sf-settings-panel-ctl"
              min={setting.min}
              max={setting.max}
              step={setting.step ?? 1}
              value={number}
              aria-label={setting.label}
              aria-valuetext={`${number.toFixed(decimals)}${setting.unit ?? ""}`}
              onChange={event => set(setting.id, Number(event.target.value))}
            />
          </div>
          <span style={{ width: 44, textAlign: "right", fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 15, color: on ? "#fff" : theme.text }}>
            {number.toFixed(decimals)}
            {setting.unit ?? ""}
          </span>
        </div>
      );
    }
    if (setting.type === "picker") {
      const at = Math.max(0, setting.options.indexOf(String(value)));
      const arrow = (delta: number) => (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => {
            setActive(index);
            adjust(index, delta);
          }}
          style={{ appearance: "none", border: 0, background: "transparent", color: on ? light : theme.muted, cursor: "pointer", padding: "4px 8px", display: "grid", placeItems: "center" }}
        >
          <svg width="9" height="14" viewBox="0 0 9 14" style={{ transform: delta < 0 ? "scaleX(-1)" : undefined, filter: on ? `drop-shadow(0 0 5px ${accent})` : undefined }}>
            <path d="M1.5 1.5 7 7l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </button>
      );
      return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          {arrow(-1)}
          <button
            {...common}
            ref={bind}
            type="button"
            aria-label={`${setting.label}: ${setting.options[at]}. Use left and right arrows to change.`}
            onClick={() => adjust(index, 1)}
            style={{ appearance: "none", flex: 1, border: 0, background: "transparent", color: on ? "#fff" : theme.text, cursor: "pointer", font: "inherit", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
          >
            <span key={String(value)} className="sf-settings-panel-value" style={{ fontSize: 15, fontWeight: 700, letterSpacing: variant === "sci-fi" ? "0.08em" : "0.02em", textTransform: variant === "sci-fi" ? "uppercase" : "none", whiteSpace: "nowrap" }}>
              {setting.options[at]}
            </span>
            <span aria-hidden style={{ display: "flex", gap: 4 }}>
              {setting.options.map((option, i) => (
                <span key={option} className="sf-settings-panel-pip" style={{ width: i === at ? 14 : 6, height: 3, borderRadius: variant === "minimal" ? 3 : 0, background: i === at ? (on ? light : accent) : "rgba(255,255,255,0.18)", transition: "width .25s, background .25s" }} />
              ))}
            </span>
          </button>
          {arrow(1)}
        </div>
      );
    }
    if (setting.type === "toggle") {
      const checked = Boolean(value);
      return (
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <button
            {...common}
            ref={bind}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={setting.label}
            onClick={() => set(setting.id, !checked)}
            style={{ appearance: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, border: 0, background: "transparent", padding: 0, color: checked ? (on ? "#fff" : theme.text) : theme.muted, font: "inherit" }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", width: 30, textAlign: "right" }}>{checked ? "On" : "Off"}</span>
            <span
              aria-hidden
              style={{
                position: "relative",
                width: 46,
                height: 22,
                borderRadius: variant === "minimal" ? 22 : variant === "fantasy" ? 11 : 0,
                clipPath: variant === "sci-fi" ? "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" : undefined,
                background: checked ? `linear-gradient(90deg, ${mixHex(accent, "#000000", 0.4)}, ${accent})` : "rgba(255,255,255,0.1)",
                boxShadow: variant === "fantasy" ? "inset 0 0 0 1px rgba(212,174,104,0.5)" : checked && on ? `0 0 12px ${rgba(accent, 0.6)}` : undefined,
                transition: "background .25s",
              }}
            >
              <span
                className="sf-settings-panel-knob"
                style={{ position: "absolute", top: 3, left: 3, width: 16, height: 16, borderRadius: variant === "sci-fi" ? 0 : "50%", transform: `translateX(${checked ? 24 : 0}px)${variant === "sci-fi" ? " skewX(-18deg)" : ""}`, background: checked ? "#fff" : "rgba(255,255,255,0.55)", boxShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
              />
            </span>
          </button>
        </div>
      );
    }
    const waiting = listening === setting.id;
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <button
          {...common}
          ref={bind}
          type="button"
          aria-label={waiting ? `Press a key for ${setting.label}, Escape to cancel` : `${setting.label}: ${String(value)}. Press Enter to rebind.`}
          onClick={() => setListening(waiting ? null : setting.id)}
          style={{
            appearance: "none",
            cursor: "pointer",
            minWidth: 96,
            height: 28,
            padding: "0 14px",
            font: `700 13px/1 ${theme.numeric}`,
            letterSpacing: "0.06em",
            color: waiting ? light : "#fff",
            background: waiting ? rgba(accent, 0.14) : "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
            borderStyle: "solid",
            borderColor: waiting || swapped === setting.id ? accent : "rgba(255,255,255,0.22)",
            borderWidth: waiting ? "1px" : "1px 1px 3px",
            borderRadius: variant === "minimal" ? 7 : variant === "fantasy" ? 4 : 2,
            boxShadow: swapped === setting.id ? `0 0 14px ${rgba(accent, 0.7)}` : undefined,
            transition: "box-shadow .3s, border-color .3s",
          }}
        >
          {waiting ? <span className="sf-settings-panel-listen">Press a key…</span> : String(value)}
        </button>
      </div>
    );
  };

  const focusedValue = focused ? state[focused.id] : undefined;

  return (
    <div
      ref={rootRef}
      className={className}
      onKeyDown={onKeyDown}
      style={{ width, maxWidth: "100%", fontFamily: theme.font, color: theme.text, ["--sf-sp-accent" as string]: accent, ...style }}
    >
      <style>{CSS}</style>
      <div style={{ padding: 1, background: variant === "fantasy" ? "linear-gradient(180deg, #e9cf8f, #6b4f22 50%, #b8914c)" : variant === "minimal" ? "rgba(255,255,255,0.12)" : `linear-gradient(180deg, ${rgba(accent, 0.7)}, ${rgba(accent, 0.15)} 40%, ${rgba(accent, 0.4)})`, clipPath: theme.clip(16), borderRadius: variant === "minimal" ? 18 : theme.radius }}>
        <div style={{ position: "relative", background: variant === "minimal" ? "rgba(20,20,24,0.9)" : theme.panel, clipPath: theme.clip(15), borderRadius: variant === "minimal" ? 17 : Math.max(0, theme.radius - 1), overflow: "hidden", backdropFilter: variant === "minimal" ? "blur(16px)" : undefined }}>
          {variant === "sci-fi" ? <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${rgba(accent, 0.04)} 1px, transparent 1px)`, backgroundSize: "100% 4px", pointerEvents: "none" }} /> : null}

          {/* Tabs */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, padding: "0 20px", height: 52, borderBottom: `1px solid ${theme.line}` }}>
            <Hint theme={theme.numeric}>Q</Hint>
            <div role="tablist" aria-label="Settings sections" style={{ position: "relative", display: "flex", gap: 4, height: "100%" }}>
              {list.map((entry, index) => {
                const on = index === tabIndex;
                return (
                  <button
                    key={entry.id}
                    ref={node => {
                      tabRefs.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    tabIndex={on ? 0 : -1}
                    className="sf-settings-panel-tab"
                    onClick={() => index !== tabIndex && switchTab(index - tabIndex, false)}
                    style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", padding: "0 16px", height: "100%", font: "inherit", fontSize: 15, fontWeight: 700, letterSpacing: theme.caps ? "0.16em" : "0.01em", textTransform: theme.caps ? "uppercase" : "none", color: on ? "#fff" : theme.muted, textShadow: on && variant !== "minimal" ? `0 0 14px ${rgba(accent, 0.7)}` : undefined }}
                  >
                    {entry.label}
                  </button>
                );
              })}
              <span aria-hidden ref={inkRef} className="sf-settings-panel-ink" style={{ position: "absolute", left: 0, bottom: -1, height: 2, width: 0, background: trim, boxShadow: `0 0 10px ${trim}` }} />
            </div>
            <Hint theme={theme.numeric}>E</Hint>
            <div aria-hidden style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.muted }}>
              {variant === "fantasy" ? "✦ Options ✦" : "Settings"}
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "flex", height: 7 * rowH + 20 }}>
            <div key={current} role="tabpanel" aria-label={list[tabIndex].label} className={reduced ? undefined : `sf-settings-panel-list-${direction}`} style={{ flex: 1, minWidth: 0, padding: "10px 12px", overflowY: "auto" }}>
              {settings.map((setting, index) => {
                const on = index === row;
                return (
                  <div
                    key={setting.id}
                    className="sf-settings-panel-row"
                    onPointerEnter={() => setActive(index)}
                    onClick={event => {
                      if (!(event.target as HTMLElement).closest("button, input")) controls.current[index]?.focus();
                    }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      height: rowH,
                      padding: "0 12px 0 16px",
                      borderRadius: variant === "minimal" ? 10 : 0,
                      background: on ? (variant === "minimal" ? "rgba(255,255,255,0.07)" : `linear-gradient(90deg, ${rgba(accent, 0.2)}, ${rgba(accent, 0.05)} 70%, transparent)`) : "transparent",
                      boxShadow: on && variant !== "minimal" ? `inset 3px 0 0 ${trim}` : undefined,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, letterSpacing: variant === "sci-fi" ? "0.06em" : "0.01em", textTransform: variant === "sci-fi" ? "uppercase" : "none", color: on ? "#fff" : theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{setting.label}</span>
                    <div style={{ width: 250, display: "flex" }}>{renderControl(setting, index, on)}</div>
                  </div>
                );
              })}
            </div>
            {showInfo ? (
              <aside aria-live="polite" style={{ width: infoW, flex: "none", borderLeft: `1px solid ${theme.line}`, padding: "20px 20px", boxSizing: "border-box", background: variant === "minimal" ? "rgba(255,255,255,0.02)" : `linear-gradient(180deg, ${rgba(accent, 0.06)}, transparent)` }}>
                {focused ? (
                  <div key={`${current}-${focused.id}`} className={reduced ? undefined : "sf-settings-panel-value"}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: light }}>{list[tabIndex].label}</div>
                    <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700, lineHeight: 1.15, color: "#fff", letterSpacing: variant === "sci-fi" ? "0.04em" : 0, textTransform: variant === "sci-fi" ? "uppercase" : "none" }}>{focused.label}</div>
                    <div aria-hidden style={{ margin: "14px 0", height: 1, background: `linear-gradient(90deg, ${trim}, transparent)` }} />
                    <div style={{ fontFamily: variant === "fantasy" ? theme.font : 'Inter, "Segoe UI", system-ui, sans-serif', fontSize: 13, lineHeight: 1.55, color: theme.muted }}>{focused.description}</div>
                    <div aria-hidden style={{ marginTop: 18, fontFamily: theme.numeric, fontSize: focused.type === "slider" ? 34 : 18, fontWeight: 700, color: light, textShadow: `0 0 18px ${rgba(accent, 0.5)}` }}>
                      {focused.type === "toggle" ? (focusedValue ? "Enabled" : "Disabled") : focused.type === "slider" ? `${Number(focusedValue).toFixed((focused.step ?? 1) < 1 ? 1 : 0)}${focused.unit ?? ""}` : String(focusedValue)}
                    </div>
                  </div>
                ) : null}
              </aside>
            ) : null}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, height: 44, padding: "0 20px", borderTop: `1px solid ${theme.line}`, fontSize: 11, letterSpacing: "0.08em", color: theme.muted }}>
            <span aria-hidden>
              <Hint theme={theme.numeric}>↑↓</Hint> Select
            </span>
            <span aria-hidden>
              <Hint theme={theme.numeric}>←→</Hint> Adjust
            </span>
            <span aria-hidden>
              <Hint theme={theme.numeric}>Enter</Hint> Toggle / rebind
            </span>
            <button
              type="button"
              className="sf-settings-panel-foot"
              onClick={() => {
                const next = { ...live.current.state, ...defaults };
                live.current.state = next;
                setState(next);
                onReset?.(next);
              }}
              style={{ marginLeft: "auto", appearance: "none", cursor: "pointer", border: 0, background: "transparent", color: theme.text, font: "inherit", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg aria-hidden width="12" height="12" viewBox="0 0 12 12"><path d="M2.2 6a3.8 3.8 0 1 0 1.2-2.8M2.2 1.6v2.2h2.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Reset defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hint({ children, theme }: { children: string; theme: string }) {
  return (
    <span aria-hidden style={{ display: "inline-grid", placeItems: "center", minWidth: 20, height: 20, padding: "0 5px", marginRight: 4, boxSizing: "border-box", borderRadius: 4, border: "1px solid rgba(255,255,255,0.22)", borderBottomWidth: 2, fontFamily: theme, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.72)", verticalAlign: "middle" }}>
      {children}
    </span>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element -- copy-paste component: a plain <img> keeps it framework-agnostic. */

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "./_shared/hooks";
import { GameGlyph, RARITY, gameTheme, mixHex, rarityOf, rgba, usePropState, type GameVariant, type GlyphName, type Rarity } from "./_shared/gameKit";

export type ShopCardState = "available" | "owned" | "sold-out";

export type ShopCardProps = {
  /** Item name. */
  name?: string;
  /** Type line under the name. */
  itemType?: string;
  /** Rarity tier; tints the frame, glow and label. */
  rarity?: Rarity;
  /** Base price before discount. */
  price?: number;
  /** Discount in percent (0 hides the strike-through). */
  discount?: number;
  /** Currency icon next to the price. */
  currency?: "gold" | "gems";
  /** Availability. Buying moves it to "owned". */
  state?: ShopCardState;
  /** Visual style. */
  variant?: GameVariant;
  /** Built-in icon when no image is set. */
  glyph?: GlyphName;
  /** Ask for a second click before buying. */
  confirm?: boolean;
  /** Item art URL (falls back to the glyph on a generated backdrop). */
  image?: string;
  /** Custom art node (wins over image and glyph). */
  art?: ReactNode;
  /** Player's balance; the button disables when the price is higher. */
  balance?: number;
  /** Small tag in the art corner, e.g. "Limited". "" hides it. */
  badge?: string;
  /** The purchase went through. */
  onPurchase?: (price: number) => void;
  /** The confirm step started. */
  onConfirm?: () => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `
.sf-shop-card { transition: transform .5s cubic-bezier(.2,.9,.25,1), box-shadow .4s; transform-style: preserve-3d; }
.sf-shop-card-tilting { transition: transform .08s linear, box-shadow .4s; }
.sf-shop-card-art-img { transition: transform .6s cubic-bezier(.2,.9,.25,1), filter .4s; }
.sf-shop-card:hover .sf-shop-card-art-img { transform: scale(1.06) translateY(-4px); }
.sf-shop-card-rays { animation: sf-shop-card-spin 16s linear infinite; }
@keyframes sf-shop-card-spin { to { rotate: 360deg; } }
.sf-shop-card-float { animation: sf-shop-card-float 4s ease-in-out infinite; }
@keyframes sf-shop-card-float { 50% { translate: 0 -6px; } }
.sf-shop-card-btn { transition: filter .2s, transform .15s cubic-bezier(.2,.8,.2,1), background .3s, color .3s, box-shadow .3s; }
.sf-shop-card-btn:not(:disabled):hover { filter: brightness(1.18); }
.sf-shop-card-btn:not(:disabled):active { transform: translateY(1px) scale(.99); }
.sf-shop-card-btn:focus-visible { outline: 2px solid var(--sf-sc-rarity); outline-offset: 3px; }
.sf-shop-card-confirm-bar { animation: sf-shop-card-confirm var(--sf-sc-confirm) linear both; }
@keyframes sf-shop-card-confirm { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.sf-shop-card-spinner { animation: sf-shop-card-spin .8s linear infinite; }
.sf-shop-card-stamp { animation: sf-shop-card-stamp .55s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes sf-shop-card-stamp { 0% { opacity: 0; transform: rotate(-14deg) scale(2.8); filter: blur(4px); } 55% { opacity: 1; transform: rotate(-14deg) scale(.92); filter: none; } 100% { opacity: 1; transform: rotate(-14deg) scale(1); } }
.sf-shop-card-dust { animation: sf-shop-card-dust .8s cubic-bezier(.1,.7,.3,1) .28s both; }
@keyframes sf-shop-card-dust { from { opacity: .9; transform: scale(.5); } to { opacity: 0; transform: scale(1.9); } }
.sf-shop-card-sheen { transition: opacity .4s; }
@media (prefers-reduced-motion: reduce) {
  .sf-shop-card, .sf-shop-card-tilting, .sf-shop-card-art-img { transition: none; }
  .sf-shop-card:hover .sf-shop-card-art-img { transform: none; }
  .sf-shop-card-rays, .sf-shop-card-float, .sf-shop-card-spinner { animation: none; }
  .sf-shop-card-stamp { animation-duration: .01s; }
  .sf-shop-card-dust { animation: none; opacity: 0; }
}
`;

function PriceIcon({ currency, size }: { currency: "gold" | "gems"; size: number }) {
  const id = useId().replace(/:/g, "");
  if (currency === "gems") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden style={{ display: "block", flex: "none" }}>
        <path d="M9.4 4h13.2l6.6 8.2L16 29 2.8 12.2Z" fill="#1c6a85" stroke="#08303e" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M9.4 4h13.2L20 12.2h-8Z" fill="#b8f0ff" />
        <path d="M2.8 12.2 9.4 4l2.6 8.2Z" fill="#7fe0ff" />
        <path d="M29.2 12.2 22.6 4 20 12.2Z" fill="#4fd6ff" />
        <path d="M2.8 12.2H12L16 29Z" fill="#4fd6ff" />
        <path d="M12 12.2h8L16 29Z" fill="#8ae6ff" />
        <path d="M20 12.2h9.2L16 29Z" fill="#1c6a85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id={`p${id}`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <stop offset="0" stopColor="#fff0b8" />
          <stop offset="0.45" stopColor="#ffc53d" />
          <stop offset="1" stopColor="#8a5a0c" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill={`url(#p${id})`} stroke="#4a2f06" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="10.4" fill="none" stroke="#8a5a0c" strokeWidth="1.2" />
      <path d="M16 9.6 17.9 14l4.7.4-3.6 3 1.1 4.6-4.1-2.5-4.1 2.5 1.1-4.6-3.6-3 4.7-.4Z" fill="#fff3c4" stroke="#8a5a0c" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

type Flow = "idle" | "confirm" | "buying" | "stamped";

export function ShopCard({
  name = "Emberheart Blade",
  itemType = "Two-handed sword",
  rarity = "legendary",
  price = 1600,
  discount = 25,
  currency = "gold",
  state = "available",
  variant = "fantasy",
  glyph = "sword",
  confirm = true,
  image,
  art,
  balance = Infinity,
  badge = "Limited",
  onPurchase,
  onConfirm,
  className,
  style,
}: ShopCardProps) {
  const theme = gameTheme(variant);
  const reduced = useReducedMotion();
  const tier = RARITY[rarityOf(rarity)];
  const [status, setStatus] = usePropState<ShopCardState>(state);
  const [flow, setFlow] = useState<Flow>("idle");
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilting, setTilting] = useState(false);
  const live = useRef({ onPurchase, onConfirm });
  live.current = { onPurchase, onConfirm };

  const off = Math.max(0, Math.min(95, discount));
  const final = Math.round(price * (1 - off / 100));
  const affordable = final <= balance;
  const color = tier.color;
  const light = mixHex(color, "#ffffff", 0.5);
  const deep = tier.deep;
  const gold = variant === "fantasy" ? "#d4ae68" : color;
  const premium = rarity === "epic" || rarity === "legendary";
  const confirmSeconds = 3;

  // Confirm times out; buying resolves into the stamp.
  useEffect(() => {
    if (flow === "confirm") {
      const timer = setTimeout(() => setFlow("idle"), confirmSeconds * 1000);
      return () => clearTimeout(timer);
    }
    if (flow === "buying") {
      const timer = setTimeout(() => {
        setFlow("stamped");
        setStatus("owned");
        live.current.onPurchase?.(final);
        if (!reduced) {
          cardRef.current?.animate(
            [{ translate: "0 0" }, { translate: "0 5px" }, { translate: "-3px -2px" }, { translate: "2px 1px" }, { translate: "0 0" }],
            { duration: 380, delay: 260, easing: "ease-out" },
          );
        }
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [flow, final, reduced, setStatus]);

  // Changing state from outside resets the flow.
  useEffect(() => {
    if (state !== "owned") setFlow("idle");
  }, [state]);

  const buy = () => {
    if (status !== "available" || !affordable) return;
    if (flow === "idle" && confirm) {
      setFlow("confirm");
      onConfirm?.();
      return;
    }
    if (flow === "idle" || flow === "confirm") setFlow("buying");
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType === "touch") return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
    card.style.setProperty("--sf-sc-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--sf-sc-y", `${(y + 0.5) * 100}%`);
    if (!tilting) setTilting(true);
  };
  const onLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = "";
    setTilting(false);
  };

  const owned = status === "owned";
  const soldOut = status === "sold-out";
  const radius = variant === "minimal" ? 16 : variant === "fantasy" ? 6 : 0;
  const frame =
    variant === "fantasy"
      ? `linear-gradient(160deg, #f3dca0, #7d5a24 30%, ${mixHex(color, "#5a3d14", 0.4)} 60%, #e2c27f)`
      : variant === "minimal"
        ? `linear-gradient(160deg, ${rgba(color, 0.7)}, rgba(255,255,255,0.08) 45%, ${rgba(color, 0.35)})`
        : `linear-gradient(160deg, ${color}, ${rgba(color, 0.2)} 40%, ${rgba(color, 0.7)})`;

  const buttonLabel =
    soldOut ? "Sold out" : owned ? "Owned" : !affordable ? `Not enough ${currency}` : flow === "confirm" ? "Confirm" : flow === "buying" ? "Purchasing" : "Buy";

  return (
    <div className={className} style={{ perspective: 900, fontFamily: theme.font, color: theme.text, ["--sf-sc-rarity" as string]: color, ["--sf-sc-confirm" as string]: `${confirmSeconds}s`, ...style }}>
      <style>{CSS}</style>
      <div
        ref={cardRef}
        className={`sf-shop-card${tilting ? " sf-shop-card-tilting" : ""}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onKeyDown={event => {
          if (event.key === "Escape" && flow === "confirm") setFlow("idle");
        }}
        style={{
          position: "relative",
          width: 276,
          padding: variant === "minimal" ? 1 : 2,
          borderRadius: radius,
          background: frame,
          clipPath: theme.clip(14),
          boxShadow: `0 24px 50px rgba(0,0,0,0.55), 0 0 ${premium ? 40 : 18}px ${rgba(color, premium ? 0.28 : 0.14)}`,
          ["--sf-sc-x" as string]: "50%",
          ["--sf-sc-y" as string]: "30%",
        }}
      >
        <div style={{ position: "relative", borderRadius: Math.max(0, radius - 2), clipPath: theme.clip(13), overflow: "hidden", background: variant === "minimal" ? "#16161a" : theme.panel }}>
          {/* Art */}
          <div style={{ position: "relative", height: 196, overflow: "hidden", background: `radial-gradient(90% 80% at 50% 45%, ${rgba(color, 0.45)}, ${mixHex(deep, "#000000", 0.55)} 70%, #07070a)`, filter: soldOut ? "grayscale(1) brightness(.6)" : undefined, transition: "filter .4s" }}>
            {premium && !soldOut ? (
              <div aria-hidden className="sf-shop-card-rays" style={{ position: "absolute", left: "50%", top: "48%", width: 460, height: 460, marginLeft: -230, marginTop: -230, background: `repeating-conic-gradient(from 0deg, ${rgba(light, 0.14)} 0deg 5deg, transparent 5deg 20deg)`, WebkitMaskImage: "radial-gradient(closest-side, #000 20%, transparent 70%)", maskImage: "radial-gradient(closest-side, #000 20%, transparent 70%)" }} />
            ) : null}
            <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: variant === "sci-fi" ? `linear-gradient(${rgba(color, 0.08)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(color, 0.08)} 1px, transparent 1px)` : undefined, backgroundSize: "18px 18px" }} />
            {art ? (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{art}</div>
            ) : image ? (
              <img className="sf-shop-card-art-img" src={image} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.95, WebkitMaskImage: "radial-gradient(120% 95% at 50% 40%, #000 55%, transparent 100%)", maskImage: "radial-gradient(120% 95% at 50% 40%, #000 55%, transparent 100%)" }} />
            ) : (
              <div className="sf-shop-card-float" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <div className="sf-shop-card-art-img" style={{ filter: `drop-shadow(0 0 20px ${rgba(color, 0.6)})` }}>
                  <GameGlyph name={glyph} color={color} size={108} />
                </div>
              </div>
            )}
            <div aria-hidden style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 40px ${rgba(color, 0.35)}`, pointerEvents: "none" }} />
            {/* Holo sheen following the pointer */}
            <div aria-hidden className="sf-shop-card-sheen" style={{ position: "absolute", inset: 0, opacity: tilting ? 1 : 0, background: `radial-gradient(circle at var(--sf-sc-x) var(--sf-sc-y), rgba(255,255,255,0.22), transparent 45%)`, mixBlendMode: "overlay", pointerEvents: "none" }} />
            <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, background: `linear-gradient(0deg, ${variant === "minimal" ? "#16161a" : "rgba(14,11,9,0.95)"}, transparent)` }} />

            {/* Tags */}
            {off > 0 && !owned && !soldOut ? (
              <div style={{ position: "absolute", left: 10, top: 10, padding: "5px 9px", font: `800 13px/1 ${theme.numeric}`, color: "#fff", background: "linear-gradient(180deg, #ff5a4a, #b8231a)", borderRadius: variant === "minimal" ? 6 : 2, clipPath: variant === "sci-fi" ? "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" : undefined, boxShadow: "0 4px 12px rgba(200,30,20,0.45)" }}>−{off}%</div>
            ) : null}
            {badge && !soldOut ? (
              <div style={{ position: "absolute", right: 10, top: 10, padding: "5px 8px", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: light, background: "rgba(0,0,0,0.55)", border: `1px solid ${rgba(color, 0.55)}`, borderRadius: variant === "minimal" ? 6 : 2 }}>{badge}</div>
            ) : null}

            {soldOut ? (
              <div aria-hidden style={{ position: "absolute", left: -40, right: -40, top: "44%", padding: "8px 0", transform: "rotate(-12deg)", textAlign: "center", fontSize: 18, fontWeight: 800, letterSpacing: "0.4em", textTransform: "uppercase", color: "#fff", background: "rgba(190,30,30,0.85)", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>Sold out</div>
            ) : null}

            {owned ? (
              <div aria-hidden style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0 }}>
                {flow === "stamped" ? <span className="sf-shop-card-dust" style={{ position: "absolute", left: -90, top: -90, width: 180, height: 180, borderRadius: "50%", border: `3px solid ${rgba(light, 0.8)}`, boxShadow: `0 0 30px ${rgba(color, 0.6)}` }} /> : null}
                <div
                  key={flow === "stamped" ? "stamp-anim" : "stamp"}
                  className={flow === "stamped" ? "sf-shop-card-stamp" : undefined}
                  style={{ position: "absolute", left: 0, top: 0, translate: "-50% -50%", padding: "10px 16px 10px 20px", whiteSpace: "nowrap", display: "grid", placeItems: "center", transform: "rotate(-14deg)", border: "3px double #7dffa8", borderRadius: 8, color: "#9dffc0", fontSize: 18, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", background: "rgba(10,40,20,0.55)", textShadow: "0 0 12px rgba(80,255,140,0.8)", boxShadow: "0 0 24px rgba(60,255,130,0.35), inset 0 0 16px rgba(60,255,130,0.25)" }}
                >
                  {flow === "stamped" ? "Purchased" : "Owned"}
                </div>
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div style={{ padding: "4px 18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color }}>
              <span aria-hidden style={{ width: 6, height: 6, transform: "rotate(45deg)", background: color, boxShadow: `0 0 8px ${color}` }} />
              {tier.label}
            </div>
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, lineHeight: 1.15, letterSpacing: theme.caps ? "0.04em" : "-0.01em", textTransform: variant === "sci-fi" ? "uppercase" : "none", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            <div style={{ marginTop: 3, fontSize: 12, color: theme.muted, fontStyle: variant === "fantasy" ? "italic" : undefined }}>{itemType}</div>

            <div aria-hidden style={{ height: 1, margin: "14px 0 12px", background: `linear-gradient(90deg, transparent, ${rgba(gold, 0.5)}, transparent)` }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 28, opacity: owned || soldOut ? 0.45 : 1 }}>
              <PriceIcon currency={currency} size={22} />
              <span style={{ fontFamily: theme.numeric, fontVariantNumeric: "tabular-nums", fontSize: 22, fontWeight: 800, color: "#fff" }} aria-label={`Price ${final} ${currency}`}>
                {final.toLocaleString("en-US")}
              </span>
              {off > 0 ? (
                <span style={{ position: "relative", fontFamily: theme.numeric, fontSize: 14, color: theme.muted }}>
                  <s style={{ textDecorationColor: "#ff5a4a", textDecorationThickness: 2 }}>{price.toLocaleString("en-US")}</s>
                </span>
              ) : null}
            </div>

            <button
              type="button"
              className="sf-shop-card-btn"
              disabled={owned || soldOut || !affordable || flow === "buying"}
              onClick={buy}
              aria-live="polite"
              style={{
                position: "relative",
                width: "100%",
                height: 44,
                marginTop: 14,
                overflow: "hidden",
                appearance: "none",
                border: "none",
                cursor: owned || soldOut || !affordable ? "not-allowed" : flow === "buying" ? "progress" : "pointer",
                borderRadius: variant === "minimal" ? 10 : variant === "fantasy" ? 4 : 0,
                clipPath: theme.clip(8),
                font: `800 14px/1 ${theme.font}`,
                letterSpacing: theme.caps ? "0.2em" : "0.04em",
                textTransform: theme.caps ? "uppercase" : "none",
                color: owned ? "#9dffc0" : soldOut || !affordable ? "rgba(255,255,255,0.4)" : flow === "confirm" ? "#1a0f02" : "#fff",
                background: owned
                  ? "rgba(60,200,110,0.12)"
                  : soldOut || !affordable
                    ? "rgba(255,255,255,0.06)"
                    : flow === "confirm"
                      ? `linear-gradient(180deg, ${mixHex("#ffd36a", "#ffffff", 0.2)}, #e8a52c)`
                      : `linear-gradient(180deg, ${mixHex(color, "#ffffff", 0.1)}, ${mixHex(color, "#000000", 0.35)})`,
                boxShadow: owned ? "inset 0 0 0 1px rgba(90,230,140,0.45)" : flow === "confirm" ? "0 0 22px rgba(255,190,70,0.55)" : `inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 18px ${rgba(color, 0.3)}`,
                textShadow: flow === "confirm" || owned ? undefined : "0 1px 0 rgba(0,0,0,0.5)",
              }}
            >
              {flow === "confirm" ? <span aria-hidden className="sf-shop-card-confirm-bar" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, transformOrigin: "0 50%", background: "rgba(80,40,0,0.6)" }} /> : null}
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {flow === "buying" ? (
                  <svg aria-hidden className="sf-shop-card-spinner" width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                    <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : owned ? (
                  <svg aria-hidden width="14" height="14" viewBox="0 0 14 14">
                    <path d="M2 7.5 5.5 11 12 3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : flow === "confirm" ? (
                  <PriceIcon currency={currency} size={16} />
                ) : null}
                {buttonLabel}
                {flow === "confirm" ? <span style={{ fontFamily: theme.numeric, letterSpacing: "0.04em" }}>{final.toLocaleString("en-US")}</span> : null}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

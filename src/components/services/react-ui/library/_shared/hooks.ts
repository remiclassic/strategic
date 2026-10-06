"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** True when the visitor asked the OS to reduce motion. Updates live. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** True while the element intersects the viewport. Use it to pause expensive loops offscreen. */
export function useInView(ref: RefObject<Element | null>, options: { once?: boolean; rootMargin?: string; threshold?: number } = {}): boolean {
  const { once = false, rootMargin = "0px", threshold = 0 } = options;
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) observer.disconnect();
      } else if (!once) setInView(false);
    }, { rootMargin, threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, rootMargin, threshold]);
  return inView;
}

/** Content-box size of an element, updated on resize. */
export function useElementSize<T extends Element>(ref: RefObject<T | null>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(previous => (previous.width === width && previous.height === height ? previous : { width, height }));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/**
 * Runs `callback(deltaSeconds, elapsedSeconds)` every frame while `active` is true.
 * The latest callback is always used, so it can read fresh props without restarting the loop.
 */
export function useAnimationFrame(callback: (delta: number, elapsed: number) => void, active = true): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    const loop = (now: number) => {
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;
      elapsed += delta;
      callbackRef.current(delta, elapsed);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}

/** "#7c3aed" / "#abc" -> [r, g, b] in 0..1. Invalid input returns white. */
export function hexToRgb(hex: string): [number, number, number] {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) value = value.split("").map(char => char + char).join("");
  const parsed = Number.parseInt(value.slice(0, 6), 16);
  if (!Number.isFinite(parsed) || value.length < 6) return [1, 1, 1];
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
}

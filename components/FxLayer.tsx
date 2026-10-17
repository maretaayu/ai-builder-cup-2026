"use client";

import { useEffect, useRef } from "react";
import { sfx } from "@/lib/sfx";

const BINTANG =
  '<svg viewBox="0 0 100 100" width="34" height="34"><path d="M50 10 L61 38 L91 40 L68 59 L76 88 L50 72 L24 88 L32 59 L9 40 L39 38 Z" fill="#f6b93b" stroke="#1e2a4a" stroke-width="7" stroke-linejoin="round"/></svg>';
const WARNA = ["#ef6f5e", "#f6b93b", "#2ba6a0", "#7bc47f", "#8fd3ff", "#1e2a4a"];

/** Lapisan efek: bintang terbang ke penghitung, konfeti, dan percikan. */
export function FxLayer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = { x: window.innerWidth / 2, y: window.innerHeight * 0.6 };

    const tiba = () => window.dispatchEvent(new Event("rr:bintang-tiba"));

    const onDown = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      const t = e.target as Element | null;
      if (t?.closest?.(".btn,.kartu")) sfx.tap();
    };

    const onBintang = (e: Event) => {
      const n = Math.min((e as CustomEvent<{ n: number }>).detail?.n ?? 1, 5);
      const target = document.getElementById("hitung-bintang")?.getBoundingClientRect();
      sfx.pop();
      for (let i = 0; i < n; i++) {
        if (reduce || !target) {
          window.setTimeout(tiba, 60);
          continue;
        }
        const el = document.createElement("div");
        el.innerHTML = BINTANG;
        el.style.cssText = "position:fixed;left:0;top:0;will-change:transform;";
        root.appendChild(el);
        const x0 = last.x - 17 + (i - (n - 1) / 2) * 18;
        const y0 = last.y - 17;
        const x1 = target.left + target.width / 2 - 17;
        const y1 = target.top + target.height / 2 - 17;
        const a = el.animate(
          [
            { transform: `translate(${x0}px,${y0}px) scale(.2)`, opacity: 0 },
            { transform: `translate(${x0}px,${y0 - 70}px) scale(1.3)`, opacity: 1, offset: 0.28 },
            { transform: `translate(${x1}px,${y1}px) scale(.7)`, opacity: 1 },
          ],
          { duration: 950, delay: i * 140, easing: "cubic-bezier(.5,0,.3,1)", fill: "both" },
        );
        a.onfinish = () => {
          el.remove();
          sfx.ding();
          tiba();
        };
      }
    };

    const onPercik = (e: Event) => {
      if (reduce) return;
      const { x, y, warna } = (e as CustomEvent<{ x: number; y: number; warna?: string }>).detail;
      for (let i = 0; i < 10; i++) {
        const el = document.createElement("div");
        const ukuran = 7 + Math.random() * 6;
        el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${ukuran}px;height:${ukuran}px;border-radius:50%;background:${
          warna ?? WARNA[i % WARNA.length]
        };border:2px solid #1e2a4a;`;
        root.appendChild(el);
        const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
        const jarak = 40 + Math.random() * 50;
        el.animate(
          [
            { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
            { transform: `translate(calc(-50% + ${Math.cos(ang) * jarak}px), calc(-50% + ${Math.sin(ang) * jarak}px)) scale(.3)`, opacity: 0 },
          ],
          { duration: 650, easing: "ease-out", fill: "both" },
        ).onfinish = () => el.remove();
      }
    };

    const onRayakan = () => {
      sfx.benar();
      if (reduce) return;
      for (let i = 0; i < 40; i++) {
        const el = document.createElement("div");
        const w = 8 + Math.random() * 8;
        el.style.cssText = `position:fixed;left:${Math.random() * 100}%;top:-24px;width:${w}px;height:${w * 1.6}px;border-radius:3px;background:${
          WARNA[i % WARNA.length]
        };border:2px solid #1e2a4a;will-change:transform;`;
        root.appendChild(el);
        const drift = (Math.random() - 0.5) * 160;
        el.animate(
          [
            { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
            { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${360 + Math.random() * 720}deg)`, opacity: 1 },
          ],
          { duration: 1500 + Math.random() * 1200, delay: Math.random() * 300, easing: "cubic-bezier(.3,.1,.6,1)", fill: "both" },
        ).onfinish = () => el.remove();
      }
    };

    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("rr:bintang", onBintang);
    window.addEventListener("rr:percik", onPercik);
    window.addEventListener("rr:rayakan", onRayakan);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("rr:bintang", onBintang);
      window.removeEventListener("rr:percik", onPercik);
      window.removeEventListener("rr:rayakan", onRayakan);
    };
  }, []);

  return <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden" />;
}

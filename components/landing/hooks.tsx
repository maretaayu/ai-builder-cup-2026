"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Memicu sekali saat elemen masuk layar. */
export function useMuncul<T extends HTMLElement>(ambang = 0.2) {
  const ref = useRef<T>(null);
  const [ya, setYa] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setYa(true);
          io.disconnect();
        }
      },
      { threshold: ambang },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ambang]);
  return [ref, ya] as const;
}

/** Posisi gulir halaman (dibatasi per frame). */
export function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return y;
}

/** Hitung naik dari 0 ke target saat `aktif`. */
export function useHitung(target: number, aktif: boolean, durasi = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!aktif) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / durasi, 1);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [aktif, target, durasi]);
  return v;
}

/** Elemen yang muncul halus saat digulir ke layar. */
export function Muncul({
  children,
  delay = 0,
  className = "",
  dari = "bawah",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  dari?: "bawah" | "kiri" | "kanan" | "skala";
}) {
  const [ref, ya] = useMuncul<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={`rev rev-${dari} ${ya ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Gelombang pemisah antar bagian. */
export function Gelombang({ atas, bawah, balik = false }: { atas: string; bawah: string; balik?: boolean }) {
  return (
    <div aria-hidden className="relative -mb-px h-14 w-full md:h-24" style={{ background: atas }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={`absolute inset-0 size-full ${balik ? "-scale-x-100" : ""}`}>
        <path d="M0 70 C 180 10, 360 120, 600 70 S 1020 10, 1200 60 S 1380 90, 1440 50 V120 H0 Z" fill={bawah} />
      </svg>
    </div>
  );
}

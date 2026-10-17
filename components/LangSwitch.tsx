"use client";

import { useEffect } from "react";
import { actions, useStore } from "@/lib/store";
import type { Bahasa } from "@/lib/kamus";

const PILIHAN: Bahasa[] = ["id", "en"];

/** Menyinkronkan atribut lang pada <html> dengan bahasa pilihan. */
export function LangSync() {
  const { lang } = useStore();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang } = useStore();
  return (
    <div
      role="group"
      aria-label="Bahasa / Language"
      className={`inline-flex overflow-hidden rounded-full border-[3px] border-tinta bg-white font-judul text-sm font-extrabold ${className}`}
    >
      {PILIHAN.map((b) => (
        <button
          key={b}
          type="button"
          aria-pressed={lang === b}
          onClick={() => actions.setLang(b)}
          className={`px-3 py-1 uppercase transition-colors ${lang === b ? "bg-tinta text-white" : "bg-white text-tinta"}`}
        >
          {b}
        </button>
      ))}
    </div>
  );
}

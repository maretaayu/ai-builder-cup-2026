"use client";

import { useT } from "@/lib/useT";
/** Teks dua bahasa. */
export type L = { id: string; en: string };

/** l("id","en") memilih teks sesuai bahasa; p(obj) memilih dari objek dua bahasa. */
export function useL() {
  const { lang } = useT();
  return {
    lang,
    l: (id: string, en: string) => (lang === "en" ? en : id),
    p: (o: L) => o[lang],
  };
}

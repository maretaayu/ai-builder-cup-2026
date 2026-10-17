"use client";

import { useCallback } from "react";
import { translate, type Bahasa, type Kunci } from "./kamus";
import { useStore } from "./store";

/** Hook terjemahan: `const { t, lang } = useT(); t("kunci", { nama })`. */
export function useT() {
  const { lang } = useStore();
  const t = useCallback(
    (key: Kunci, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );
  return { t, lang: lang as Bahasa };
}

export const LOKAL: Record<Bahasa, string> = { id: "id-ID", en: "en-US" };

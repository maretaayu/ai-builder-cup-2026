import { translate, type Bahasa } from "./kamus";
import type { After, Body, Level, Weather } from "./store";

export type TriageInput = { weather: Weather; body: Body; after?: After };
export type TriageResult = { level: Level; alasan: string };

/**
 * Triase sinyal dari pilihan terstruktur anak (ikon, bukan teks bebas).
 * Aturan tetap ini berjalan di samping model (Gemini) sebagai pengaman:
 * model boleh menaikkan level, tidak boleh menurunkannya.
 */
export function triage({ weather, body, after }: TriageInput, lang: Bahasa = "id"): TriageResult {
  const berat = weather === "badai" || weather === "hujan";

  if (after === "masih-berat" && berat) {
    return { level: "segera", alasan: translate(lang, "triase.berat") };
  }
  if (weather === "badai") {
    return {
      level: "perhatian",
      alasan: translate(lang, body === "dada" || body === "perut" ? "triase.badaiBadan" : "triase.badai"),
    };
  }
  if (weather === "hujan" && body !== "tidak") {
    return { level: "perhatian", alasan: translate(lang, "triase.hujanBadan") };
  }
  return { level: "aman", alasan: translate(lang, "triase.aman") };
}

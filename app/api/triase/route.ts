import { NextResponse } from "next/server";
import { boleh } from "@/lib/batas";
import { KORPUS } from "@/lib/copilot";
import { adaGemini, teksJSON } from "@/lib/gemini";
import { triage } from "@/lib/triage";
import { translate, type Bahasa } from "@/lib/kamus";
import type { After, Body, Level, Weather } from "@/lib/store";

const WEATHER: Weather[] = ["cerah", "mendung", "hujan", "badai"];
const BODY: Body[] = ["kepala", "dada", "perut", "tangan", "tidak"];
const AFTER: After[] = ["lebih-baik", "masih-berat"];
const URUT: Record<Level, number> = { aman: 0, perhatian: 1, segera: 2 };

type Titik = { hariLalu: number; weather: Weather; body: Body; after?: After };

function titik(x: unknown): Titik | null {
  const o = x as Partial<Titik> | null;
  if (!o || !WEATHER.includes(o.weather as Weather) || !BODY.includes(o.body as Body)) return null;
  const after = AFTER.includes(o.after as After) ? (o.after as After) : undefined;
  const hari = Number.isFinite(o.hariLalu) ? Math.max(0, Math.min(30, Math.round(o.hariLalu as number))) : 0;
  return { hariLalu: hari, weather: o.weather as Weather, body: o.body as Body, after };
}

const SKEMA = {
  type: "object",
  properties: {
    level: { type: "string", enum: ["aman", "perhatian", "segera"] },
    alasan: { type: "string" },
    saran: { type: "string" },
  },
  required: ["level", "alasan", "saran"],
};

function prompt(sekarang: Titik, riwayat: Titik[], dasar: Level, lang: Bahasa) {
  return `Kamu membantu orang tua atau guru menanggapi sinyal "aku perlu bicara" dari anak kelas 1 SD. Data hanya berupa pilihan ikon anak (bukan teks bebas):
- cuaca hati: cerah (senang), mendung (bingung), hujan (sedih), badai (marah)
- bagian badan yang terasa tidak nyaman
- setelah latihan napas: lebih-baik atau masih-berat

SEKARANG: ${JSON.stringify(sekarang)}
RIWAYAT 7 HARI TERAKHIR (hariLalu = berapa hari lalu): ${JSON.stringify(riwayat)}
TINGKAT DASAR DARI ATURAN: ${dasar}

TUGAS:
- "level": aman, perhatian, atau segera. Boleh sama atau LEBIH TINGGI dari tingkat dasar, tidak boleh lebih rendah. Naikkan hanya bila riwayat menunjukkan pola berulang (misalnya hujan atau badai beberapa hari berturut-turut, atau keluhan badan yang sama berulang).
- "alasan": satu kalimat singkat untuk orang dewasa tentang apa yang terlihat. Jangan mendiagnosis, jangan menebak penyebab.
- "saran": dua sampai tiga kalimat langkah pertama yang hangat dan konkret untuk orang dewasa yang menanggapi (dengarkan tanpa menghakimi, akui perasaan, tawarkan napas bersama). Tanpa saran medis atau obat.
Tulis "alasan" dan "saran" dalam ${lang === "en" ? "bahasa Inggris yang sederhana" : "bahasa Indonesia yang sederhana"}.`;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { sekarang?: unknown; riwayat?: unknown; lang?: unknown } | null;
  const lang: Bahasa = body?.lang === "en" ? "en" : "id";
  const sekarang = titik(body?.sekarang);
  if (!sekarang) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const riwayat = (Array.isArray(body?.riwayat) ? body.riwayat : [])
    .slice(-20)
    .map(titik)
    .filter((t): t is Titik => t !== null);

  // Anak sendiri yang meminta bicara, jadi tingkat dasar minimal "perhatian".
  const aturan = triage({ weather: sekarang.weather, body: sekarang.body, after: sekarang.after }, lang);
  const dasar =
    aturan.level === "aman"
      ? { level: "perhatian" as Level, alasan: translate(lang, "triase.minta") }
      : aturan;
  const saranDasar = KORPUS.find((e) => e.id === "sinyal")!.isi[lang].langkah.slice(0, 3).join(" ");
  const cadangan = { level: dasar.level, alasan: dasar.alasan, saran: saranDasar, ai: false };

  if (!adaGemini() || !boleh(req, "triase", 20)) return NextResponse.json(cadangan);

  try {
    const ai = await teksJSON<{ level: Level; alasan: string; saran: string }>(
      prompt(sekarang, riwayat, dasar.level, lang),
      SKEMA,
      { lang },
    );
    const level = ai.level in URUT && URUT[ai.level] > URUT[dasar.level] ? ai.level : dasar.level;
    return NextResponse.json({
      level,
      alasan: ai.alasan?.trim() || dasar.alasan,
      saran: ai.saran?.trim() || saranDasar,
      ai: true,
    });
  } catch (e) {
    console.error("[triase]", e instanceof Error ? e.message : e);
    return NextResponse.json(cadangan);
  }
}

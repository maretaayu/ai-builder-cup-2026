import { NextResponse } from "next/server";
import { boleh } from "@/lib/batas";
import { adaGemini, teksJSON } from "@/lib/gemini";

import type { Bahasa } from "@/lib/kamus";

type Masuk = { cerah: number; mendung: number; hujan: number; badai: number; perhatian: number };

function angka(x: unknown) {
  return Number.isFinite(x) ? Math.max(0, Math.min(999, Math.round(x as number))) : 0;
}

const SKEMA = {
  type: "object",
  properties: { ringkasan: { type: "string" }, saran: { type: "string" } },
  required: ["ringkasan", "saran"],
};

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as (Partial<Masuk> & { lang?: unknown }) | null;
  const lang: Bahasa = b?.lang === "en" ? "en" : "id";
  const d: Masuk = {
    cerah: angka(b?.cerah),
    mendung: angka(b?.mendung),
    hujan: angka(b?.hujan),
    badai: angka(b?.badai),
    perhatian: angka(b?.perhatian),
  };
  const total = d.cerah + d.mendung + d.hujan + d.badai;
  if (total === 0) return NextResponse.json({ error: "Belum ada data" }, { status: 400 });

  const cadangan =
    lang === "en"
      ? {
          ringkasan: `Over 7 days there were ${total} heart-weather check-ins: ${d.cerah} sunny, ${d.mendung} cloudy, ${d.hujan} rainy, ${d.badai} stormy. ${d.perhatian} of them needed attention.`,
          saran:
            d.perhatian > 0
              ? "Set aside quiet time together, gently ask how their day went, and practice breathing together."
              : "Keep up the habit of sharing and practicing together. Praise their effort to notice feelings.",
          ai: false,
        }
      : {
          ringkasan: `Dalam 7 hari ada ${total} cek cuaca hati: ${d.cerah} cerah, ${d.mendung} mendung, ${d.hujan} hujan, ${d.badai} badai. ${d.perhatian} di antaranya perlu perhatian.`,
          saran:
            d.perhatian > 0
              ? "Luangkan waktu tenang berdua, tanyakan dengan lembut bagaimana harinya, dan ajak berlatih napas bersama."
              : "Teruskan kebiasaan bercerita dan berlatih bersama. Beri pujian atas usahanya mengenali perasaan.",
          ai: false,
        };

  if (!adaGemini() || !boleh(req, "ringkasan", 10)) return NextResponse.json(cadangan);

  try {
    const ai = await teksJSON<{ ringkasan: string; saran: string }>(
      `Tulis ringkasan mingguan untuk orang tua atau guru dari data cek "cuaca hati" seorang anak kelas 1 SD (cerah = senang, mendung = bingung, hujan = sedih, badai = marah).
DATA 7 HARI: ${JSON.stringify(d)}
ATURAN: tulis dalam ${lang === "en" ? "bahasa Inggris" : "bahasa Indonesia"} yang sederhana dan hangat, tidak menghakimi, jangan mendiagnosis, jangan menebak penyebab, jangan sebut isi cerita atau jurnal anak (tidak ada datanya). "ringkasan": 2 kalimat tentang pola yang terlihat. "saran": 2 kalimat langkah praktis yang bisa dilakukan di rumah atau sekolah.`,
      SKEMA,
      { cacheMs: 300_000, lang },
    );
    return NextResponse.json({
      ringkasan: ai.ringkasan?.trim() || cadangan.ringkasan,
      saran: ai.saran?.trim() || cadangan.saran,
      ai: true,
    });
  } catch (e) {
    console.error("[ringkasan]", e instanceof Error ? e.message : e);
    return NextResponse.json(cadangan);
  }
}

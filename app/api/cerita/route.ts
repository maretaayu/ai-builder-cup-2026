import { NextResponse } from "next/server";
import { HEWAN, layak, moodAman, NAMA_BOLEH, type MoodAnak } from "@/lib/amanAnak";
import { boleh } from "@/lib/batas";
import { adaGemini, teksJSON } from "@/lib/gemini";
import type { Bahasa } from "@/lib/kamus";

export const TEMA: Record<string, { id: string; en: string }> = {
  diejek: { id: "diejek teman di sekolah", en: "being teased by a classmate at school" },
  "tidak-diajak": { id: "tidak diajak bermain oleh teman-teman", en: "not being invited to play by friends" },
  berebut: { id: "berebut mainan dengan teman", en: "fighting over a toy with a friend" },
  "kelas-baru": { id: "hari pertama di kelas baru", en: "the first day in a new class" },
  "maju-depan": { id: "takut maju ke depan kelas", en: "being scared to stand in front of the class" },
  kangen: { id: "kangen rumah saat di sekolah", en: "missing home while at school" },
};

type Pilihan = { teks: string; jenis: string; hasil: string; mood: string };
type AiCerita = { judul: string; adegan: string; pilihan: Pilihan[]; pelajaran: string };

const JENIS = ["tenang", "tegas", "minta-tolong", "kurang"];

const SKEMA = {
  type: "object",
  properties: {
    judul: { type: "string" },
    adegan: { type: "string" },
    pilihan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          teks: { type: "string" },
          jenis: { type: "string", enum: JENIS },
          hasil: { type: "string" },
          mood: { type: "string", enum: ["senang", "tenang", "sedih", "marah", "bingung"] },
        },
        required: ["teks", "jenis", "hasil", "mood"],
      },
    },
    pelajaran: { type: "string" },
  },
  required: ["judul", "adegan", "pilihan", "pelajaran"],
};

function prompt(nama: string, hewan: string, tema: string, cuaca: string, lang: Bahasa) {
  return `Kamu penulis cerita untuk anak kelas 1 SD di Indonesia (6-7 tahun). Tulis SATU cerita pendek interaktif tentang tokoh bernama ${nama}, seekor ${hewan}, yang mengalami: ${tema}. Perasaan tokoh hari ini: ${cuaca}.

ATURAN:
- Tulis dalam ${lang === "en" ? "bahasa Inggris" : "bahasa Indonesia"} dengan kalimat sangat pendek dan kata sederhana. Suasana sekolah Indonesia (kantin, halaman, kelas).
- Tanpa kekerasan, tanpa kata kasar, tanpa label diagnosis atau istilah medis.
- "adegan": maksimal 40 kata, menyebut nama ${nama}, diakhiri pertanyaan "apa yang akan ${nama} lakukan?".
- "pilihan": TEPAT 3. Dua pilihan sehat dan satu pilihan kurang tepat. jenis: "tenang" (tarik napas atau jeda), "tegas" (bilang tegas tapi ramah), "minta-tolong" (cari orang dewasa yang dipercaya), "kurang" (kurang tepat). Harus ada paling sedikit satu "tenang" atau "minta-tolong", dan tepat satu "kurang". Tiap pilihan: "teks" maksimal 6 kata; "hasil" maksimal 30 kata (akibatnya, menyebut ${nama}; untuk "kurang", jelaskan lembut tanpa menghakimi dan arahkan ke pilihan yang lebih baik); "mood" ekspresi ${nama} setelah itu.
- "pelajaran": maksimal 14 kata, positif.
- "judul": maksimal 6 kata.`;
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as {
    lang?: unknown; nama?: unknown; species?: unknown; tema?: unknown; cuaca?: unknown;
  } | null;
  const lang: Bahasa = b?.lang === "en" ? "en" : "id";
  const nama = NAMA_BOLEH.includes(b?.nama as string) ? (b!.nama as string) : "Boni";
  const species = (b?.species as string) in HEWAN ? (b!.species as string) : "badak";
  const kunciTema = (b?.tema as string) in TEMA ? (b!.tema as string) : Object.keys(TEMA)[Math.floor(Date.now() / 1000) % Object.keys(TEMA).length];
  const cuaca = ["cerah", "mendung", "hujan", "badai"].includes(b?.cuaca as string) ? (b!.cuaca as string) : "mendung";

  if (!adaGemini()) return NextResponse.json({ fallback: true });
  if (!boleh(req, "cerita", 12)) return NextResponse.json({ fallback: true, alasan: "batas" });

  try {
    const ai = await teksJSON<AiCerita>(prompt(nama, HEWAN[species][lang], TEMA[kunciTema][lang], cuaca, lang), SKEMA, { lang });
    const p = ai.pilihan;
    const valid =
      layak(ai.judul, 6) &&
      layak(ai.adegan, 40) &&
      layak(ai.pelajaran, 14) &&
      Array.isArray(p) &&
      p.length === 3 &&
      p.every((x) => layak(x.teks, 6) && layak(x.hasil, 30) && JENIS.includes(x.jenis)) &&
      p.filter((x) => x.jenis === "kurang").length === 1 &&
      p.some((x) => x.jenis === "tenang" || x.jenis === "minta-tolong");
    if (!valid) return NextResponse.json({ fallback: true, alasan: "tidak-lolos" });

    return NextResponse.json({
      judul: ai.judul.trim(),
      adegan: ai.adegan.trim(),
      pelajaran: ai.pelajaran.trim(),
      pilihan: p.map((x) => ({
        teks: x.teks.trim(),
        jenis: x.jenis,
        hasil: x.hasil.trim(),
        mood: moodAman(x.mood, x.jenis === "kurang" ? "sedih" : "tenang") as MoodAnak,
      })),
      tema: kunciTema,
      ai: true,
    });
  } catch (e) {
    console.error("[cerita]", e instanceof Error ? e.message : e);
    return NextResponse.json({ fallback: true, alasan: "gagal" });
  }
}

import { NextResponse } from "next/server";
import { HEWAN, layak, namaAman } from "@/lib/amanAnak";
import { boleh } from "@/lib/batas";
import { adaGemini, teksJSON } from "@/lib/gemini";
import type { Bahasa } from "@/lib/kamus";

type L2 = { id: string; en: string };

/** Fakta penuntun yang sudah ditulis aman. Model hanya menyampaikannya kembali dengan bahasa anak. */
export const PERTANYAAN: Record<string, { fakta: L2; contoh: L2; tips: L2 }> = {
  berdebar: {
    fakta: {
      id: "Saat kita takut atau kaget, jantung berdetak lebih cepat. Itu cara tubuh bersiap. Kalau kita menarik napas pelan, detaknya pelan lagi.",
      en: "When we feel scared or surprised, the heart beats faster. That's how the body gets ready. When we breathe slowly, it slows down again.",
    },
    contoh: { id: "Seperti kamu berlari, jantung berdetak cepat, lalu pelan lagi saat duduk istirahat.", en: "Like when you run, your heart beats fast, then slows when you sit and rest." },
    tips: { id: "Coba tarik napas balon.", en: "Try balloon breathing." },
  },
  marah: {
    fakta: {
      id: "Marah itu perasaan yang boleh ada. Badan jadi panas supaya kita siap menjaga diri. Kita boleh marah, tapi tidak memukul. Napas pelan membantu badan tenang.",
      en: "Anger is a feeling that's allowed. The body gets hot to be ready to protect us. We can be angry, but we don't hit. Slow breaths help the body calm down.",
    },
    contoh: { id: "Kalau mainanmu direbut, kamu boleh bilang, \"Aku tidak suka. Kembalikan.\"", en: "If someone takes your toy, you can say, \"I don't like that. Give it back.\"" },
    tips: { id: "Tarik napas dulu, lalu bilang pelan.", en: "Breathe first, then say it calmly." },
  },
  sedih: {
    fakta: {
      id: "Sedih datang saat ada yang kita sayangi atau kita butuhkan. Menangis boleh. Bercerita ke orang yang kita percaya membuat hati lebih ringan.",
      en: "Sadness comes when something we care about or need is missing. Crying is okay. Telling someone we trust makes the heart feel lighter.",
    },
    contoh: { id: "Kalau tidak diajak main, hatimu bisa terasa hujan. Cerita ke Bu Guru bisa membantu.", en: "If you're not invited to play, your heart can feel rainy. Telling your teacher can help." },
    tips: { id: "Ceritakan ke orang dewasa yang kamu percaya.", en: "Tell a grown-up you trust." },
  },
  takut: {
    fakta: {
      id: "Takut membuat kita berhati-hati. Rasa takut boleh ada. Kalau takut, kita bisa tarik napas dan minta ditemani orang yang kita percaya.",
      en: "Fear helps us be careful. Feeling scared is okay. When scared, we can breathe and ask a trusted person to stay with us.",
    },
    contoh: { id: "Saat harus maju ke depan kelas, kamu boleh bilang, \"Aku takut, temani aku ya.\"", en: "When you must stand in front of the class, you can say, \"I'm scared, please stay with me.\"" },
    tips: { id: "Minta ditemani orang yang kamu percaya.", en: "Ask a trusted person to stay with you." },
  },
  diejek: {
    fakta: {
      id: "Kalau teman mengejek, itu tidak benar dan bukan salahmu. Kamu boleh bilang, \"Aku tidak suka. Berhenti.\" Kalau masih terjadi, bilang ke Bu Guru. Itu bukan mengadu, itu menjaga diri.",
      en: "If a classmate teases you, it isn't right and it isn't your fault. You can say, \"I don't like that. Stop.\" If it keeps happening, tell your teacher. That's not tattling, it's taking care of yourself.",
    },
    contoh: { id: "Kalau gambarmu ditertawakan, tarik napas, bilang tegas, lalu cerita ke Bu Guru.", en: "If someone laughs at your drawing, breathe, say it firmly, then tell your teacher." },
    tips: { id: "Bilang tegas, lalu cerita ke Bu Guru.", en: "Say it firmly, then tell your teacher." },
  },
  "bilang-dewasa": {
    fakta: {
      id: "Bilang ke orang dewasa kalau ada yang membuatmu takut, sakit, atau tidak nyaman, atau kalau kamu merasa tidak aman. Meminta tolong itu berani dan baik.",
      en: "Tell a grown-up if something makes you scared, hurt, or uncomfortable, or if you feel unsafe. Asking for help is brave and good.",
    },
    contoh: { id: "Kalau ada yang menyakitimu, langsung cari Bu Guru atau Ibu, ya.", en: "If someone hurts you, go straight to your teacher or Mom." },
    tips: { id: "Buka Lingkaran Aman.", en: "Open your Safe Circle." },
  },
};

const SKEMA = {
  type: "object",
  properties: { jawaban: { type: "string" }, tips: { type: "string" } },
  required: ["jawaban", "tips"],
};

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as {
    lang?: unknown; nama?: unknown; species?: unknown; q?: unknown; mode?: unknown;
  } | null;
  const lang: Bahasa = b?.lang === "en" ? "en" : "id";
  const nama = namaAman(b?.nama);
  const species = (b?.species as string) in HEWAN ? (b!.species as string) : "badak";
  const q = b?.q as string;
  if (!(q in PERTANYAAN)) return NextResponse.json({ error: "Pertanyaan tidak dikenal" }, { status: 400 });
  const mode = b?.mode === "lagi" || b?.mode === "contoh" ? (b.mode as string) : "jelas";
  const p = PERTANYAAN[q];

  const cadangan = {
    jawaban: mode === "contoh" ? p.contoh[lang] : p.fakta[lang],
    tips: p.tips[lang],
    ai: false,
  };
  if (!adaGemini() || !boleh(req, "tanya", 20)) return NextResponse.json(cadangan);

  const tugas =
    mode === "contoh"
      ? "Berikan SATU contoh nyata yang dekat dengan kehidupan anak SD (di sekolah atau rumah), maksimal 35 kata."
      : mode === "lagi"
        ? "Jelaskan lagi dengan cara yang LEBIH SEDERHANA, pakai perumpamaan yang mudah, maksimal 40 kata."
        : "Jelaskan dengan bahasa anak, maksimal 45 kata.";

  try {
    const ai = await teksJSON<{ jawaban: string; tips: string }>(
      `Kamu adalah ${nama}, seekor ${HEWAN[species][lang]} yang ramah, teman bermain anak kelas 1 SD di Indonesia (6-7 tahun). Anak bertanya kepadamu. Jawab dengan suara hangat, kalimat pendek, kata sederhana, dalam ${lang === "en" ? "bahasa Inggris" : "bahasa Indonesia"}, memanggil anak dengan ${lang === "en" ? '"you"' : '"kamu"'} dan boleh menyebut namamu sendiri.

FAKTA YANG BOLEH DIPAKAI (jangan menambah fakta lain, jangan menyebut penyakit, obat, atau istilah medis, jangan mendiagnosis):
${p.fakta[lang]}

TUGAS: ${tugas}
"tips": satu kalimat ajakan maksimal 12 kata yang mengarah ke tindakan sehat (napas, bercerita ke orang dewasa yang dipercaya, atau minta ditemani).`,
      SKEMA,
      { lang },
    );
    if (!layak(ai.jawaban, 45) || !layak(ai.tips, 12)) return NextResponse.json(cadangan);
    return NextResponse.json({ jawaban: ai.jawaban.trim(), tips: ai.tips.trim(), ai: true });
  } catch (e) {
    console.error("[tanya-boni]", e instanceof Error ? e.message : e);
    return NextResponse.json(cadangan);
  }
}

import { NextResponse } from "next/server";
import { boleh } from "@/lib/batas";
import { adaGemini, suara } from "@/lib/gemini";

const VOICES = new Set(["Kore", "Puck", "Charon", "Zephyr", "Fenrir"]);
const GAYA =
  "Bicara dalam bahasa Indonesia dengan suara hangat, pelan, jelas, dan ramah, seperti kakak yang menenangkan anak kecil. Tidak terburu-buru.";

// Cache di memori server; browser juga menyimpan lewat Cache-Control.
const cache = new Map<string, { data: Buffer; mime: string }>();

export async function GET(req: Request) {
  if (!adaGemini() || process.env.GEMINI_TTS_ENABLED !== "1") {
    return NextResponse.json({ tersedia: false }, { status: 503 });
  }
  const url = new URL(req.url);
  const t = (url.searchParams.get("t") ?? "").trim().slice(0, 400);
  const v = url.searchParams.get("v") ?? "Kore";
  if (!t) return NextResponse.json({ error: "Teks kosong" }, { status: 400 });
  if (!VOICES.has(v)) return NextResponse.json({ error: "Suara tidak dikenal" }, { status: 400 });

  const key = `${v}|${t}`;
  let hasil = cache.get(key);
  if (!hasil) {
    if (!boleh(req, "suara", 40)) {
      return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
    }
    try {
      hasil = await suara(t, GAYA, v);
    } catch (e) {
      console.error("[suara]", e instanceof Error ? e.message : e);
      return NextResponse.json({ error: "Gagal membuat suara" }, { status: 502 });
    }
    if (cache.size > 300) cache.clear();
    cache.set(key, hasil);
  }
  return new Response(new Uint8Array(hasil.data), {
    headers: {
      "Content-Type": hasil.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

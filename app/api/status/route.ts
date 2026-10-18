import { connection, NextResponse } from "next/server";
import { adaGemini, DAFTAR_MODEL_TEKS, MODEL_SUARA } from "@/lib/gemini";

export async function GET() {
  await connection(); // baca env saat runtime, bukan saat build
  const aktif = adaGemini();
  return NextResponse.json({
    gemini: aktif,
    modelTeks: aktif ? DAFTAR_MODEL_TEKS() : null,
    modelSuara: aktif ? MODEL_SUARA() : null,
  });
}

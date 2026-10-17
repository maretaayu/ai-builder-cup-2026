/**
 * Klien Gemini (Interactions API) untuk sisi server. Kunci tidak pernah dikirim ke browser.
 * Format request mengikuti dokumentasi resmi:
 *  - teks terstruktur: https://ai.google.dev/gemini-api/docs/structured-output
 *  - suara (TTS):      https://ai.google.dev/gemini-api/docs/speech-generation
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

/** Daftar model teks berurutan. Jika satu kehabisan kuota atau sibuk, dicoba model berikutnya. */
export const DAFTAR_MODEL_TEKS = () =>
  (process.env.GEMINI_TEXT_MODELS || process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.8-flash")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
export const MODEL_TEKS = () => DAFTAR_MODEL_TEKS()[0];
export const MODEL_SUARA = () => process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-lite-tts";
export const adaGemini = () => Boolean(process.env.GEMINI_API_KEY);

type Obj = Record<string, unknown>;

async function panggil(body: Obj, timeoutMs = 25_000): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY belum diisi");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw Object.assign(new Error(`Gemini ${res.status}: ${detail}`), { status: res.status });
  }
  return res.json();
}

function kumpul(node: unknown, tipe: string, out: Obj[]) {
  if (Array.isArray(node)) {
    node.forEach((n) => kumpul(n, tipe, out));
  } else if (node && typeof node === "object") {
    const o = node as Obj;
    if (o.type === tipe) out.push(o);
    Object.values(o).forEach((v) => kumpul(v, tipe, out));
  }
}

/** Ambil bagian keluaran model saja (abaikan gema masukan bila ada). */
function keluaran(res: unknown): unknown {
  const steps = (res as { steps?: Obj[] } | null)?.steps;
  const model = steps?.filter((s) => s.type === "model_output");
  return model && model.length > 0 ? model : res;
}

const cache = new Map<string, { t: number; v: unknown }>();

/** Model berikutnya dicoba bila kuota habis (429), sibuk (503), atau model tidak ada (404). */
const PINDAH = new Set([429, 503, 404]);

export async function teksJSON<T>(
  promptAsli: string,
  schema: Obj,
  opsi: { cacheMs?: number; lang?: "id" | "en" } = {},
): Promise<T> {
  // Instruksi prompt berbahasa Indonesia; untuk keluaran Inggris, arahan eksplisit di akhir mencegah model membalas dalam bahasa Indonesia.
  const prompt =
    opsi.lang === "en"
      ? `${promptAsli}\n\nIMPORTANT: Write every text field of your JSON answer in natural English, even though the instructions above are in Indonesian.`
      : promptAsli;
  const kunci = opsi.cacheMs ? prompt : "";
  if (kunci) {
    const c = cache.get(kunci);
    if (c && Date.now() - c.t < (opsi.cacheMs ?? 0)) return c.v as T;
  }
  let res: unknown;
  let galat: unknown;
  for (const model of DAFTAR_MODEL_TEKS()) {
    try {
      res = await panggil({
        model,
        input: prompt,
        response_format: { type: "text", mime_type: "application/json", schema },
      });
      galat = undefined;
      break;
    } catch (e) {
      galat = e;
      const st = (e as { status?: number }).status;
      if (!st || !PINDAH.has(st)) throw e;
    }
  }
  if (galat) throw galat;
  const bagian: Obj[] = [];
  kumpul(keluaran(res), "text", bagian);
  let teks = bagian
    .map((b) => (typeof b.text === "string" ? b.text : ""))
    .join("")
    .trim();
  if (!teks && typeof (res as Obj).output_text === "string") teks = (res as Obj).output_text as string;
  teks = teks.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  if (!teks) throw new Error("Gemini tidak mengembalikan teks");
  const hasil = JSON.parse(teks) as T;
  if (kunci) {
    if (cache.size > 200) cache.clear();
    cache.set(kunci, { t: Date.now(), v: hasil });
  }
  return hasil;
}

export async function suara(
  teks: string,
  gaya: string,
  voice: string,
): Promise<{ data: Buffer; mime: string }> {
  const res = await panggil(
    {
      model: MODEL_SUARA(),
      input: [
        {
          type: "user_input",
          content: [
            { type: "text", text: teks, annotations: [{ type: "speech_metadata", style: gaya }] },
          ],
        },
      ],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice }] },
    },
    30_000,
  );
  const bagian: Obj[] = [];
  kumpul(keluaran(res), "audio", bagian);
  const a = bagian.find((b) => typeof b.data === "string");
  if (!a) throw new Error("Gemini tidak mengembalikan audio");
  return {
    data: Buffer.from(a.data as string, "base64"),
    mime: typeof a.mime_type === "string" ? a.mime_type : "audio/wav",
  };
}

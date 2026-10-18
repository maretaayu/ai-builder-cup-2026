/** Pengaman untuk teks yang dibuat model dan ditampilkan kepada anak atau dipakai dalam simulasi. */

const TERLARANG = [
  "bunuh", "mati", "darah", "seks", "narkoba", "bodoh", "goblok", "tolol", "bego", "benci", "kontol", "anjing",
  "kill", "dead", "die", "blood", "sex", "drugs", "stupid", "idiot", "hate", "damn",
];
const POLA = new RegExp(`\\b(${TERLARANG.join("|")})\\b`, "i");

export const lolosKata = (teks: string) => !POLA.test(teks);

export function jumlahKata(teks: string) {
  return teks.trim().split(/\s+/).filter(Boolean).length;
}

/** Teks harus berupa string, tidak kosong, tidak terlalu panjang, dan lolos daftar kata terlarang. */
export function layak(teks: unknown, maksKata: number): teks is string {
  return (
    typeof teks === "string" &&
    teks.trim().length > 0 &&
    jumlahKata(teks) <= Math.ceil(maksKata * 1.6) &&
    teks.length <= 600 &&
    lolosKata(teks)
  );
}

export const MOOD_ANAK = ["senang", "tenang", "sedih", "marah", "bingung"] as const;
export type MoodAnak = (typeof MOOD_ANAK)[number];

export function moodAman(m: unknown, cadangan: MoodAnak = "tenang"): MoodAnak {
  return MOOD_ANAK.includes(m as MoodAnak) ? (m as MoodAnak) : cadangan;
}

export const HEWAN: Record<string, { id: string; en: string }> = {
  badak: { id: "badak", en: "rhino" },
  nuri: { id: "burung nuri", en: "lory bird" },
  penyu: { id: "penyu", en: "sea turtle" },
};

// Nama pet bebas diinput anak; bersihkan agar aman masuk ke prompt.
export function namaAman(v: unknown, cadangan = "Boni"): string {
  if (typeof v !== "string") return cadangan;
  const n = v.replace(/[^\p{L}\p{N} '-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16);
  return n.length >= 1 ? n : cadangan;
}

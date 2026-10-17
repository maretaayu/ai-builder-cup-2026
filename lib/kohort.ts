import type { PesertaAkademi } from "./ruang";

/** Nama ditampilkan ringkas ke sesama peserta (nama depan + inisial) demi privasi. */
export function samarkan(nama: string): string {
  const k = nama.trim().split(/\s+/).filter(Boolean);
  if (k.length === 0) return "-";
  return k.length === 1 ? k[0] : `${k[0]} ${k[1][0].toUpperCase()}.`;
}

export type Kohort = {
  nyata: boolean;
  peserta: number;
  selesai: number;
  rataPre: number;
  rataPost: number;
  prePct: number[];
  postPct: number[];
  baris: { uid: string; nama: string; sekolah: string; pre?: number; post?: number; poin: number }[];
};

export function hitungKohort(p: PesertaAkademi[], jumlahSoal: number): Kohort {
  const rata = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
  const persen = (kunci: "benarPre" | "benarPost") =>
    Array.from({ length: jumlahSoal }, (_, i) => {
      const v = p.map((x) => x[kunci]?.[i]).filter((b): b is boolean => typeof b === "boolean");
      return v.length ? Math.round((100 * v.filter(Boolean).length) / v.length) : 0;
    });
  return {
    nyata: true,
    peserta: p.length,
    selesai: p.filter((x) => x.tahap === "selesai").length,
    rataPre: rata(p.filter((x) => x.pre !== undefined).map((x) => x.pre as number)),
    rataPost: rata(p.filter((x) => x.post !== undefined).map((x) => x.post as number)),
    prePct: persen("benarPre"),
    postPct: persen("benarPost"),
    baris: p
      .map((x) => ({ uid: x.uid, nama: samarkan(x.nama), sekolah: "-", pre: x.pre, post: x.post, poin: x.poin }))
      .sort((a, b) => b.poin - a.poin),
  };
}

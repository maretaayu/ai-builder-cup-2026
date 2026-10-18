"use client";

import { useEffect } from "react";
import { sinkronProgres } from "@/lib/ruang";
import { useSesi } from "@/lib/sesi";
import { useStore } from "@/lib/store";

/** Di perangkat anak yang sudah terhubung: kirim bintang dan kegiatan belajar ke ruang orang tua. */
export function SinkronAnak() {
  const sesi = useSesi();
  const { stars, progres, aktifTs } = useStore();
  const kode = sesi.user?.anonim ? sesi.profil?.ruangKode : undefined;

  useEffect(() => {
    if (!kode) return;
    const id = window.setTimeout(() => void sinkronProgres(kode, { stars, progres, aktifTs }).catch(() => {}), 800);
    return () => window.clearTimeout(id);
  }, [kode, stars, progres, aktifTs]);

  return null;
}

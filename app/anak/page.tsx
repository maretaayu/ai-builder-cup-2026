"use client";

import Link from "next/link";
import { Creature } from "@/components/Creature";
import { LangSwitch } from "@/components/LangSwitch";
import { useStore } from "@/lib/store";
import { useSesi } from "@/lib/sesi";
import { useT } from "@/lib/useT";

export default function Gerbang() {
  const { companion } = useStore();
  const { t, lang } = useT();
  const sesi = useSesi();
  const terhubung = sesi.user?.anonim ? sesi.profil?.ruangNama : undefined;
  return (
    <div className="flex flex-1 flex-col bg-langit">
      <div className="relative flex flex-1 flex-col items-center px-5 pb-8 pt-6">
        <div className="flex w-full justify-end">
          <LangSwitch />
        </div>
        <p className="mt-3 rounded-full border-[3px] border-tinta bg-white px-3 py-1 font-judul text-sm font-bold uppercase tracking-wide">
          {t("gerbang.badge")}
        </p>
        <h1 className="mt-4 text-center text-6xl font-extrabold">Ruang Rasa</h1>
        <p className="mt-2 max-w-[18rem] text-center text-lg font-semibold text-tinta-lembut">
          {t("gerbang.sub")}
        </p>

        <div className="relative mt-8 flex w-full items-end justify-center">
          <Creature species="penyu" mood="tenang" size={118} className="-mr-5 mb-1 anim-naik-turun" sentuh label={t("jenis.penyu.nama")} />
          <Creature species="badak" mood="senang" size={168} className="relative z-10 anim-goyang" label={t("jenis.badak.nama")} sentuh />
          <Creature species="nuri" mood="senang" size={118} className="-ml-5 mb-1 anim-naik-turun" sentuh label={t("jenis.nuri.nama")} />
        </div>
        <div aria-hidden className="-mt-3 h-6 w-[86%] rounded-[50%] bg-daun-tua/30" />

        <div className="mt-8 flex w-full flex-col gap-4">
          <Link href={companion ? "/rumah" : "/adopsi"} className="btn btn-karang text-2xl">
            {companion ? t("gerbang.lagi", { nama: companion.name }) : t("gerbang.mulai")}
          </Link>
          {terhubung ? (
            <p className="rounded-2xl border-[3px] border-tinta bg-white px-4 py-2 text-center text-sm font-bold">
              {lang === "en" ? `Connected to room: ${terhubung}` : `Terhubung ke ruang: ${terhubung}`}
            </p>
          ) : (
            <Link href="/gabung" className="btn btn-putih">
              {lang === "en" ? "Connect to a parent or teacher" : "Hubungkan ke orang tua atau guru"}
            </Link>
          )}
          <Link href="/mulai" className="text-center text-sm font-bold underline">
            {t("gerbang.dewasa")}
          </Link>
        </div>

        <p className="mt-6 max-w-xs text-center text-sm font-semibold text-tinta-lembut">
          {t("gerbang.catatan")}
        </p>
        <Link href="/" className="mt-3 text-sm font-bold underline">
          {t("gerbang.beranda")}
        </Link>
      </div>
    </div>
  );
}

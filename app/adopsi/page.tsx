"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Creature, NAMA_PILIHAN } from "@/components/Creature";
import { ChildShell } from "@/components/ui";
import { actions, type Species } from "@/lib/store";
import { daftarAnggota } from "@/lib/ruang";
import { useSesi } from "@/lib/sesi";
import { speak, useSay } from "@/lib/speech";
import { useT } from "@/lib/useT";

const SPECIES: Species[] = ["badak", "nuri", "penyu"];

export default function Adopsi() {
  const router = useRouter();
  const { t } = useT();
  const sesi = useSesi();
  const [species, setSpecies] = useState<Species | null>(null);
  const [nama, setNama] = useState("");

  useSay(species ? t("adopsi.prompt2") : t("adopsi.prompt1"));

  function finish(name: string) {
    if (!species) return;
    actions.adopt(species, name);
    if (sesi.user?.anonim && sesi.profil?.ruangKode) void daftarAnggota(sesi.profil.ruangKode, { nama: name, species }).catch(() => {});
    speak(t("adopsi.halo", { nama: name }));
    router.push("/rumah");
  }

  return (
    <ChildShell back="/anak" tone="kunyit">
      <div className="anim-muncul">
        <p className="font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">
          {species ? t("adopsi.langkah2") : t("adopsi.langkah1")}
        </p>
        <h1 className="mt-1 text-4xl font-extrabold">{species ? t("adopsi.judul2") : t("adopsi.judul1")}</h1>
      </div>

      {!species ? (
        <ul className="stagger mt-6 flex flex-col gap-4">
          {SPECIES.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="kartu flex w-full items-center gap-4 p-3"
                onClick={() => {
                  setSpecies(s);
                  speak(t(`jenis.${s}.sapaan`));
                }}
              >
                <Creature species={s} mood="senang" size={104} className="shrink-0" />
                <span>
                  <span className="block font-judul text-3xl font-extrabold">{t(`jenis.${s}.nama`)}</span>
                  <span className="block text-base font-semibold text-tinta-lembut">{t(`jenis.${s}.sapaan`)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="anim-muncul mt-4 flex flex-col items-center">
          <Creature species={species} mood="senang" size={190} className="anim-goyang" label={t(`jenis.${species}.nama`)} />
          <form
            className="mt-4 flex w-full flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (nama.trim()) finish(nama.trim());
            }}
          >
            <input
              className="w-full rounded-3xl border-[3px] border-tinta bg-white px-4 py-3 text-center font-judul text-3xl font-extrabold shadow-[0_4px_0_var(--ink)] outline-none"
              placeholder={t("adopsi.placeholder")}
              aria-label={t("adopsi.judul2")}
              value={nama}
              maxLength={16}
              onChange={(e) => setNama(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-putih w-full text-2xl" disabled={!nama.trim()}>
              {t("adopsi.simpan")}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-bold text-tinta-lembut">{t("adopsi.ide")}</span>
            {NAMA_PILIHAN[species].map((n) => (
              <button key={n} type="button" className="rounded-full border-2 border-tinta bg-white px-3 py-1 font-bold" onClick={() => setNama(n)}>
                {n}
              </button>
            ))}
          </div>
          <button type="button" className="mt-5 font-bold underline" onClick={() => {
              setSpecies(null);
              setNama("");
            }}>
            {t("adopsi.lain")}
          </button>
        </div>
      )}
    </ChildShell>
  );
}

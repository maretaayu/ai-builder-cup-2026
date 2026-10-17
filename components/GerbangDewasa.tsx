"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/lib/useT";
import { LangSwitch } from "./LangSwitch";

// Lolos gerbang bertahan selama sesi (tanpa reload), agar pindah antar area dewasa tidak diminta ulang.
let lolos = false;

export function useGerbangDewasa() {
  const [ok, setOk] = useState(lolos);
  return {
    ok,
    lolos: () => {
      lolos = true;
      setOk(true);
    },
  };
}

export function GerbangDewasa({ onLolos }: { onLolos: () => void }) {
  const { t } = useT();
  const a = 7;
  const b = 8;
  const [v, setV] = useState("");
  const [salah, setSalah] = useState(false);
  return (
    <div className="flex flex-1 flex-col bg-krem-tua px-4 pt-4">
      <div className="flex justify-end">
        <LangSwitch />
      </div>
      <form
        className="mx-auto mt-12 w-full max-w-sm rounded-3xl border-[3px] border-tinta bg-white p-5 shadow-[0_5px_0_var(--ink)]"
        onSubmit={(e) => {
          e.preventDefault();
          if (Number(v) === a + b) onLolos();
          else setSalah(true);
        }}
      >
        <h1 className="text-3xl font-extrabold">{t("pend.gerbang.judul")}</h1>
        <p className="mt-2 font-semibold text-tinta-lembut">{t("pend.gerbang.info")}</p>
        <label className="mt-4 block font-judul text-2xl font-bold" htmlFor="jwb">
          {a} + {b} = ?
        </label>
        <input
          id="jwb"
          inputMode="numeric"
          autoComplete="off"
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            setSalah(false);
          }}
          className="mt-2 w-full rounded-2xl border-[3px] border-tinta px-4 py-3 text-xl font-bold outline-none focus:border-laut"
        />
        {salah && <p className="mt-2 font-bold text-karang">{t("pend.gerbang.salah")}</p>}
        <button type="submit" className="btn btn-laut mt-4 w-full">
          {t("umum.masuk")}
        </button>
        <Link href="/" className="mt-4 block text-center font-bold underline">
          {t("umum.kembali")}
        </Link>
      </form>
    </div>
  );
}

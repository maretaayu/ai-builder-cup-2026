"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Creature } from "@/components/Creature";
import { ChildShell } from "@/components/ui";
import { useL } from "@/components/lms/util";
import { firebaseSiap } from "@/lib/firebase";
import { cekRuang, daftarAnggota, normalKode } from "@/lib/ruang";
import { keluar, masukTamu, pesanGalat, simpanProfil, useSesi } from "@/lib/sesi";
import { useStore } from "@/lib/store";

/** Perangkat anak: orang dewasa memasukkan kode ruang agar sinyal anak sampai ke perangkatnya. */
export default function Gabung() {
  const { l, lang } = useL();
  const router = useRouter();
  const sesi = useSesi();
  const { companion } = useStore();
  const [kode, setKode] = useState(() => {
    if (typeof window === "undefined") return "";
    return normalKode(new URLSearchParams(window.location.search).get("kode") ?? "");
  });
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState("");
  const [ok, setOk] = useState("");
  const masukan = useRef<HTMLInputElement>(null);

  async function gabung() {
    if (kode.length !== 6 || sibuk) return;
    setSibuk(true);
    setGalat("");
    try {
      // Perangkat anak memakai akun anonim; bila akun orang dewasa masih aktif, keluar dulu.
      if (sesi.user && !sesi.user.anonim) await keluar();
      await masukTamu();
      const ruang = await cekRuang(kode);
      if (!ruang) {
        setGalat(l("Kode tidak ditemukan. Periksa lagi kodenya.", "Code not found. Please check the code."));
        return;
      }
      await simpanProfil({ peran: "anak", ruangKode: kode, ruangNama: ruang.nama });
      if (companion) await daftarAnggota(kode, { nama: companion.name, species: companion.species });
      setOk(ruang.nama);
      window.setTimeout(() => router.push(companion ? "/rumah" : "/adopsi"), 1200);
    } catch (e) {
      setGalat(pesanGalat(e, lang));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <ChildShell back="/anak" tone="langit">
      <div className="mt-2 flex flex-col items-center text-center">
        <Creature species={companion?.species ?? "badak"} mood={ok ? "senang" : "bingung"} size={130} sentuh />
        <h1 className="mt-2 text-3xl font-extrabold">{ok ? l("Terhubung!", "Connected!") : l("Hubungkan ke orang dewasa", "Connect to a grown-up")}</h1>
        <p className="mt-2 max-w-xs text-sm font-bold text-tinta-lembut">
          {ok
            ? l(`Ruang ${ok} siap. Sebentar lagi kita mulai.`, `Room ${ok} is ready. Let's begin in a moment.`)
            : l("Minta orang tua atau guru memasukkan kode ruang dari aplikasi mereka.", "Ask a parent or teacher to enter the room code from their app.")}
        </p>
      </div>

      {!ok && (
        <form
          className="mt-5 flex flex-col items-center"
          onSubmit={(e) => {
            e.preventDefault();
            void gabung();
          }}
        >
          <label htmlFor="kode" className="sr-only">{l("Kode ruang", "Room code")}</label>
          <input
            id="kode"
            ref={masukan}
            value={kode}
            onChange={(e) => setKode(normalKode(e.target.value))}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={6}
            placeholder="______"
            className="w-full max-w-[16rem] rounded-2xl border-[3px] border-tinta bg-white px-4 py-3 text-center font-judul text-4xl font-extrabold uppercase tracking-[0.35em] outline-none focus:border-laut"
          />
          <button type="submit" disabled={kode.length !== 6 || sibuk || !firebaseSiap} className="btn btn-karang mt-4 w-full max-w-[16rem] text-2xl disabled:opacity-40">
            {sibuk ? l("Menghubungkan...", "Connecting...") : l("Gabung", "Join")}
          </button>
          {galat && <p role="alert" className="mt-3 max-w-xs rounded-2xl border-[3px] border-tinta bg-karang-muda px-4 py-2 text-center text-sm font-bold">{galat}</p>}
          {!firebaseSiap && <p className="mt-3 text-center text-xs font-bold text-tinta-lembut">{l("Firebase belum dikonfigurasi, jadi mode lokal.", "Firebase isn't configured, so local mode.")}</p>}
        </form>
      )}

      {!ok && (
        <button type="button" className="mt-6 self-center text-sm font-bold underline" onClick={() => router.push(companion ? "/rumah" : "/adopsi")}>
          {l("Main dulu tanpa terhubung", "Play first without connecting")}
        </button>
      )}
    </ChildShell>
  );
}

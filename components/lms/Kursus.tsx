"use client";

import { useMemo, useState } from "react";
import { fx } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import { actions, useStore, type Tahap } from "@/lib/store";
import { LOKAL, useT } from "@/lib/useT";
import { KATALOG, kodeSertifikat, MATERI, RUBRIK, SKENARIO, SOAL } from "@/lib/akademi";
import { Ikon } from "./ikon";
import { Simulasi } from "./Simulasi";
import { useL } from "./util";

export const TAHAP: Tahap[] = ["mulai", "pre", "materi", "latihan", "post", "selesai"];

export function persen(t: Tahap) {
  return Math.round((TAHAP.indexOf(t) / (TAHAP.length - 1)) * 100);
}

function Tes({ fase }: { fase: "pre" | "post" }) {
  const { l, p } = useL();
  const { akademi: a } = useStore();
  const [i, setI] = useState(0);
  const [dipilih, setDipilih] = useState<number | null>(null);
  const [skor, setSkor] = useState(0);
  const soal = SOAL[i];
  const post = fase === "post";

  function pilih(n: number) {
    if (dipilih !== null) return;
    setDipilih(n);
    const ok = n === soal.benar;
    if (ok) setSkor((s) => s + 1);
    if (post) (ok ? sfx.benar : sfx.salah)();
  }

  function lanjut() {
    if (i + 1 < SOAL.length) {
      setI(i + 1);
      setDipilih(null);
      return;
    }
    if (fase === "pre") {
      actions.setAkademi({ pre: skor, tahap: "materi" });
    } else {
      const ts = Date.now();
      actions.setAkademi({ post: skor, tahap: "selesai", selesaiTs: ts, kode: kodeSertifikat(a.nama, ts) });
      fx.rayakan();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teks2">
          {post ? "Post-test" : "Pre-test"} · {l(`Soal ${i + 1} dari ${SOAL.length}`, `Question ${i + 1} of ${SOAL.length}`)}
        </p>
        <span className="h-2 w-40 overflow-hidden rounded-full bg-garis" aria-hidden>
          <span className="block h-full rounded-full bg-biru transition-all" style={{ width: `${((i + (dipilih !== null ? 1 : 0)) / SOAL.length) * 100}%` }} />
        </span>
      </div>
      <h3 className="mt-3 max-w-3xl text-xl font-bold leading-snug">{p(soal.q)}</h3>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {soal.opsi.map((o, n) => {
          const terpilih = dipilih === n;
          const benar = post && dipilih !== null && n === soal.benar;
          const salah = post && terpilih && n !== soal.benar;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={dipilih !== null}
                aria-pressed={terpilih}
                onClick={() => pilih(n)}
                className={`flex h-full w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biru disabled:cursor-default ${
                  benar
                    ? "border-hijau bg-hijau-muda"
                    : salah
                      ? "border-merah bg-red-50"
                      : terpilih
                        ? "border-biru bg-biru-muda"
                        : "border-garis bg-white hover:border-biru/50 hover:bg-abu"
                }`}
              >
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                    benar ? "border-hijau bg-hijau text-white" : terpilih ? "border-biru bg-biru text-white" : "border-garis text-teks2"
                  }`}
                >
                  {benar ? <Ikon nama="check" size={14} /> : String.fromCharCode(65 + n)}
                </span>
                {p(o)}
              </button>
            </li>
          );
        })}
      </ul>
      {post && dipilih !== null && (
        <p className="anim-muncul mt-4 flex max-w-3xl gap-2 rounded-xl bg-biru-muda px-4 py-3 text-sm font-medium text-biru-tua">
          <Ikon nama="info" size={18} className="mt-0.5 shrink-0" />
          {p(soal.alasan)}
        </p>
      )}
      <button type="button" disabled={dipilih === null} className="lms-btn mt-6" onClick={lanjut}>
        {i + 1 < SOAL.length ? l("Lanjut", "Next") : l("Selesai", "Finish")}
      </button>
    </div>
  );
}

function Materi() {
  const { l, p } = useL();
  const { akademi: a } = useStore();
  const [i, setI] = useState(0);
  const k = MATERI[i];
  const terakhir = i === MATERI.length - 1;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-teks2">
          {l(`Materi ${i + 1} dari ${MATERI.length}`, `Lesson ${i + 1} of ${MATERI.length}`)}
        </p>
        {a.pre !== undefined && (
          <span className="lms-chip">{l(`Skor awal ${a.pre}/${SOAL.length}`, `Starting score ${a.pre}/${SOAL.length}`)}</span>
        )}
      </div>
      <h3 className="mt-2 text-2xl font-bold">{p(k.judul)}</h3>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {k.poin.map((x, n) => (
          <li key={n} className="flex gap-3 rounded-xl border border-garis bg-abu px-4 py-3 text-sm font-medium leading-relaxed">
            <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-biru" />
            {p(x)}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex gap-3">
        <button type="button" disabled={i === 0} className="lms-btn-ghost" onClick={() => setI(i - 1)}>
          {l("Sebelumnya", "Back")}
        </button>
        <button type="button" className="lms-btn" onClick={() => (terakhir ? actions.setAkademi({ tahap: "latihan" }) : setI(i + 1))}>
          {terakhir ? l("Ke latihan", "To practice") : l("Lanjut", "Next")}
        </button>
      </div>
    </div>
  );
}

type Hasil = { skor: Record<"B" | "A" | "K" | "U", number>; masukan: string; contoh: string; ai: boolean };

function Latihan() {
  const { l, p, lang } = useL();
  const { akademi: a } = useStore();
  const [teks, setTeks] = useState("");
  const [muat, setMuat] = useState(false);
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [err, setErr] = useState("");
  const [mode, setMode] = useState<"simulasi" | "tulis">("simulasi");

  async function nilai() {
    setMuat(true);
    setErr("");
    try {
      const r = await fetch("/api/latihan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jawaban: teks, lang }),
      });
      if (!r.ok) throw new Error();
      const h = (await r.json()) as Hasil;
      setHasil(h);
      const total = h.skor.B + h.skor.A + h.skor.K + h.skor.U;
      if (!a.latihan || total > a.latihan.skor) actions.setAkademi({ latihan: { skor: total, maks: 8 } });
    } catch {
      setErr(l("Gagal menilai. Coba lagi.", "Couldn't get feedback. Please try again."));
    } finally {
      setMuat(false);
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">{l("Latihan merespons", "Practice responding")}</h3>
      <div role="tablist" className="mt-3 inline-flex rounded-xl bg-abu p-1">
        {(
          [
            ["simulasi", l("Ngobrol dengan siswa simulasi (AI)", "Talk to a simulated student (AI)")],
            ["tulis", l("Tulis satu respons", "Write one response")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${mode === id ? "bg-white text-biru shadow-sm" : "text-teks2 hover:text-teks"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "simulasi" && <div className="mt-4"><Simulasi /></div>}
      <div className={`mt-4 grid gap-6 lg:grid-cols-2 ${mode === "simulasi" ? "hidden" : ""}`}>
        <div>
          <p className="flex gap-2 rounded-xl bg-kuning-muda px-4 py-3 text-sm font-medium text-kuning">
            <Ikon nama="info" size={18} className="mt-0.5 shrink-0" />
            <span className="text-teks">{p(SKENARIO)}</span>
          </p>
          <label htmlFor="jwb" className="mt-4 block text-sm font-semibold">
            {l("Jawaban Anda", "Your answer")}
          </label>
          <textarea
            id="jwb"
            rows={6}
            value={teks}
            onChange={(e) => setTeks(e.target.value.slice(0, 800))}
            className="lms-input mt-1"
          />
          <button type="button" disabled={muat || teks.trim().length < 3} className="lms-btn mt-3" onClick={() => void nilai()}>
            <Ikon nama="sparkle" size={16} />
            {muat ? l("Menilai...", "Reviewing...") : l("Minta masukan AI", "Get AI feedback")}
          </button>
          {err && <p className="mt-2 text-sm font-semibold text-merah">{err}</p>}
        </div>

        <div>
          {hasil ? (
            <div className="anim-muncul rounded-xl border border-garis bg-abu p-4">
              <span className="lms-chip mb-3">
                <Ikon nama="sparkle" size={13} />
                {hasil.ai ? l("Masukan dari Gemini", "Feedback from Gemini") : l("Masukan dasar", "Basic feedback")}
              </span>
              <ul className="grid gap-3">
                {RUBRIK.map((r) => (
                  <li key={r.huruf} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-biru text-sm font-bold text-white">{r.huruf}</span>
                    <span className="w-40 text-sm font-semibold">{p(r.nama)}</span>
                    <span className="flex flex-1 gap-1" aria-label={`${hasil.skor[r.huruf]}/2`}>
                      {[0, 1].map((n) => (
                        <span key={n} className={`h-2 flex-1 rounded-full ${n < hasil.skor[r.huruf] ? "bg-hijau" : "bg-garis"}`} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-medium leading-relaxed">{hasil.masukan}</p>
              <p className="mt-3 rounded-xl border border-garis bg-white px-4 py-3 text-sm font-medium leading-relaxed">
                <span className="text-xs font-bold uppercase tracking-wider text-teks2">{l("Contoh respons", "Example response")}</span>
                <br />
                {hasil.contoh}
              </p>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-garis p-5 text-sm font-medium text-teks2">
              {l("Masukan berdasarkan langkah B-A-K-U akan tampil di sini.", "Feedback based on the B-A-K-U steps will appear here.")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button type="button" className="lms-btn" disabled={!hasil && !a.latihan} onClick={() => actions.setAkademi({ tahap: "post" })}>
          {l("Lanjut ke post-test", "Continue to post-test")}
        </button>
        <button type="button" className="text-sm font-semibold text-biru underline" onClick={() => actions.setAkademi({ tahap: "post" })}>
          {l("Lewati", "Skip")}
        </button>
      </div>
    </div>
  );
}

export function Sertifikat() {
  const { l } = useL();
  const { lang } = useT();
  const { akademi: a } = useStore();
  const tanggal = useMemo(
    () => new Intl.DateTimeFormat(LOKAL[lang], { day: "numeric", month: "long", year: "numeric" }).format(a.selesaiTs ?? 0),
    [lang, a.selesaiTs],
  );
  return (
    <div>
      <section className="sertifikat mx-auto flex aspect-[1.414/1] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border-[10px] border-double border-biru bg-white p-8 text-center shadow-[0_8px_30px_rgba(20,33,61,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-teks2">Baku Jaga Academy</p>
        <h2 className="mt-3 text-4xl font-extrabold text-biru-tua">{l("Sertifikat Latihan", "Certificate of Practice")}</h2>
        <p className="mt-6 text-sm font-medium text-teks2">{l("diberikan kepada", "awarded to")}</p>
        <p className="mt-1 break-words text-4xl font-extrabold">{a.nama}</p>
        <p className="mt-5 max-w-lg text-sm font-medium leading-relaxed">
          {l(
            "karena telah menyelesaikan latihan pertolongan pertama emosi pada anak (langkah BAKU).",
            "for completing the child emotional first-aid practice (the BAKU steps).",
          )}
        </p>
        <p className="mt-5 text-sm font-semibold text-teks2">
          {tanggal} · {a.kode}
        </p>
        <p className="mt-3 max-w-md text-xs font-medium text-teks2">
          {l(
            "Sertifikat latihan dari prototipe lomba. Bukan sertifikasi resmi dan belum divalidasi tenaga profesional.",
            "Practice certificate from a competition prototype. Not an official certification and not yet validated by professionals.",
          )}
        </p>
      </section>
      <div className="mt-4 flex justify-center gap-3 print:hidden">
        <button type="button" className="lms-btn" onClick={() => window.print()}>
          <Ikon nama="print" size={16} />
          {l("Cetak atau simpan PDF", "Print or save as PDF")}
        </button>
      </div>
    </div>
  );
}

function Hasil() {
  const { l } = useL();
  const { akademi: a } = useStore();
  const pre = a.pre ?? 0;
  const post = a.post ?? 0;
  const naik = post - pre;
  return (
    <div className="grid gap-6">
      <div>
        <h3 className="text-2xl font-bold">{l("Selamat, kursus selesai", "Congratulations, course completed")}</h3>
        <ul className="mt-4 grid max-w-2xl gap-3">
          {[
            { label: "Pre-test", v: pre, warna: "bg-kuning" },
            { label: "Post-test", v: post, warna: "bg-hijau" },
          ].map((b) => (
            <li key={b.label} className="flex items-center gap-3">
              <span className="w-24 text-sm font-semibold">{b.label}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-garis">
                <span className={`block h-full rounded-full ${b.warna}`} style={{ width: `${(b.v / SOAL.length) * 100}%` }} />
              </span>
              <span className="w-12 text-right text-sm font-bold">
                {b.v}/{SOAL.length}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-semibold">
          {naik > 0
            ? l(`Naik ${naik} poin dari pre-test.`, `Up ${naik} point${naik > 1 ? "s" : ""} from the pre-test.`)
            : naik === 0
              ? l("Skor sama dengan pre-test. Ulangi materinya bila perlu.", "Same score as the pre-test. Review the lessons if needed.")
              : l("Skor turun. Ulangi materinya lalu coba lagi.", "Score went down. Review the lessons and try again.")}
        </p>
        {a.latihan && (
          <p className="mt-1 text-sm font-medium text-teks2">
            {l(`Latihan respons: ${a.latihan.skor} dari ${a.latihan.maks}`, `Response practice: ${a.latihan.skor} of ${a.latihan.maks}`)}
          </p>
        )}
      </div>
      <Sertifikat />
    </div>
  );
}

/** Pemutar kursus: kepala kursus, progres, daftar langkah, dan isi langkah aktif. */
export function Kursus() {
  const { l, p } = useL();
  const { akademi: a } = useStore();
  const kursus = KATALOG[0];
  const idx = TAHAP.indexOf(a.tahap);
  const nama: Record<Tahap, string> = {
    mulai: l("Pengantar", "Introduction"),
    pre: l("Pre-test", "Pre-test"),
    materi: l("Materi (4 kartu)", "Lessons (4 cards)"),
    latihan: l("Latihan merespons", "Response practice"),
    post: l("Post-test", "Post-test"),
    selesai: l("Hasil dan sertifikat", "Result and certificate"),
  };
  return (
    <div>
      <div className="lms-card overflow-hidden">
        <div className="bg-gradient-to-r from-biru-tua to-biru px-6 py-6 text-white">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-2.5 py-1">{l("Kursus wajib", "Mandatory course")}</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1">{p(kursus.level)}</span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
              <Ikon nama="clock" size={13} /> {kursus.menit} {l("menit", "min")}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold">{p(kursus.judul)}</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/85">{p(kursus.deskripsi)}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/25">
              <span className="block h-full rounded-full bg-white transition-all" style={{ width: `${persen(a.tahap)}%` }} />
            </span>
            <span className="text-sm font-bold">{persen(a.tahap)}%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="lms-card order-2 p-6 lg:order-1">
          {a.tahap === "mulai" && (
            <div>
              <h3 className="text-2xl font-bold">{l("Yang akan Anda pelajari", "What you will learn")}</h3>
              <ul className="mt-4 grid gap-2.5 text-sm font-medium">
                {[
                  l("Mengenali tanda kesulitan emosi pada anak kecil.", "Recognize signs of emotional difficulty in young children."),
                  l("Merespons dengan langkah BAKU: Berhenti, Akui, Kasih dengar, Uruskan bantuan.", "Respond with the BAKU steps: Breathe, Acknowledge, Keep listening, Usher in help."),
                  l("Mengetahui kapan dan ke mana merujuk.", "Know when and where to refer."),
                  l("Berlatih merespons dengan masukan dari AI.", "Practice responding with AI feedback."),
                ].map((x) => (
                  <li key={x} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-hijau-muda text-hijau">
                      <Ikon nama="check" size={12} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs font-medium text-teks2">
                {l(
                  "Data hanya tersimpan di browser ini, kecuali jawaban latihan yang dikirim untuk dinilai.",
                  "Data stays in this browser, except your practice answer which is sent for feedback.",
                )}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button type="button" className="lms-btn" onClick={() => actions.setAkademi({ tahap: "pre" })}>
                  {l("Mulai pre-test", "Start pre-test")}
                  <Ikon nama="arrow" size={16} />
                </button>
                <button type="button" className="text-sm font-semibold text-biru underline" onClick={() => actions.setAkademi({ tahap: "latihan" })}>
                  {l("Langsung coba latihan AI (demo)", "Jump to the AI practice (demo)")}
                </button>
              </div>
            </div>
          )}
          {a.tahap === "pre" && <Tes fase="pre" />}
          {a.tahap === "materi" && <Materi />}
          {a.tahap === "latihan" && <Latihan />}
          {a.tahap === "post" && <Tes fase="post" />}
          {a.tahap === "selesai" && <Hasil />}
        </section>

        <aside className="order-1 lg:order-2 print:hidden">
          <div className="lms-card p-4">
            <h3 className="text-sm font-bold">{l("Daftar langkah", "Course steps")}</h3>
            <ol className="mt-3 grid gap-1.5" aria-label="Progress">
              {TAHAP.map((t, i) => (
                <li
                  key={t}
                  aria-current={i === idx ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${
                    i === idx ? "bg-biru-muda text-biru" : i < idx ? "text-teks" : "text-teks2"
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      i < idx ? "bg-hijau text-white" : i === idx ? "bg-biru text-white" : "bg-garis text-teks2"
                    }`}
                  >
                    {i < idx ? <Ikon nama="check" size={13} /> : i + 1}
                  </span>
                  {nama[t]}
                </li>
              ))}
            </ol>
            {a.tahap !== "mulai" && (
              <button type="button" className="mt-3 text-xs font-semibold text-biru underline" onClick={() => actions.setAkademi({ tahap: "mulai", pre: undefined, post: undefined, latihan: undefined, kode: undefined, selesaiTs: undefined })}>
                {l("Mulai ulang kursus", "Restart course")}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Creature } from "@/components/Creature";
import { AdultIcon, WeatherIcon } from "@/components/Icons";
import { LangSwitch } from "@/components/LangSwitch";
import { Ikon, Lambang } from "@/components/lms/ikon";
import { useL } from "@/components/lms/util";
import { jawab, KORPUS } from "@/lib/copilot";
import { translate } from "@/lib/kamus";
import { Gelombang, Muncul, useHitung, useMuncul, useScrollY } from "./hooks";

/* ---------- Navigasi ---------- */
export function NavAtas() {
  const { l } = useL();
  const y = useScrollY();
  const solid = y > 40;
  const tautan = [
    ["#masalah", l("Masalah", "Problem")],
    ["#cara-kerja", l("Cara kerja", "How it works")],
    ["#produk", l("Produk", "Products")],
    ["#ai", "AI"],
    ["#aman", l("Keamanan", "Safety")],
  ];
  return (
    <header className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${solid ? "bg-white/90 shadow-[0_1px_0_rgba(30,42,74,0.08)] backdrop-blur" : "bg-transparent"}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-3 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-biru shadow-md">
            <Lambang size={28} />
          </span>
          <span className="tampil text-2xl font-extrabold text-tinta">Teman Ada</span>
        </Link>
        <nav className="ml-8 hidden gap-6 text-sm font-bold text-tinta/70 lg:flex" aria-label="Navigasi">
          {tautan.map(([h, t]) => (
            <a key={h} href={h} className="transition hover:text-karang">
              {t}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LangSwitch className="!border !border-tinta/15 !text-xs" />
          <Link href="/mulai" className="hidden rounded-full border-2 border-tinta/15 bg-white/70 px-4 py-2 text-sm font-bold text-tinta transition hover:bg-white sm:inline-flex">
            {l("Masuk", "Sign in")}
          </Link>
          <Link href="/mulai" className="rounded-full bg-tinta px-5 py-2.5 text-sm font-bold text-white transition hover:bg-karang">
            {l("Mulai", "Get started")}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------- Masalah ---------- */
function Statistik({ besar, judul, sub, visual }: { besar: ReactNode; judul: string; sub: string; visual: ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="h-20">{visual}</div>
      <p className="tampil mt-4 text-[clamp(3.2rem,7vw,5.5rem)] font-extrabold leading-none text-kunyit">{besar}</p>
      <p className="mt-3 text-lg font-bold text-white">{judul}</p>
      <p className="mt-1 text-sm font-medium leading-relaxed text-white/65">{sub}</p>
    </div>
  );
}

export function Masalah() {
  const { l } = useL();
  const [ref, ya] = useMuncul<HTMLDivElement>(0.3);
  const pct = useHitung(2.6, ya);
  const dokter = useHitung(4, ya, 1100);
  return (
    <>
      <Gelombang atas="#ffffff" bawah="#1e2a4a" />
      <section id="masalah" className="relative scroll-mt-16 overflow-hidden bg-tinta text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <span className="anim-mengambang absolute left-[6%] top-10"><WeatherIcon weather="hujan" size={120} /></span>
          <span className="anim-mengambang absolute right-[10%] top-24" style={{ animationDelay: "-2s" }}><WeatherIcon weather="badai" size={160} /></span>
          <span className="anim-mengambang absolute bottom-10 left-[40%]" style={{ animationDelay: "-4s" }}><WeatherIcon weather="mendung" size={110} /></span>
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
          <Muncul>
            <h2 className="tampil max-w-4xl text-[clamp(2.2rem,5vw,4rem)] font-extrabold">
              {l("Bantuan jarang menjangkau anak yang membutuhkannya.", "Help rarely reaches the children who need it.")}
            </h2>
          </Muncul>
          <div ref={ref} className="mt-14 grid gap-12 md:grid-cols-3">
            <Muncul>
              <Statistik
                visual={
                  <div className="flex gap-3">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`grid size-16 place-items-center rounded-full transition-all duration-700 ${i === 1 && ya ? "scale-110 bg-karang" : "bg-white/15"}`}>
                        <Creature species="badak" mood={i === 1 && ya ? "sedih" : "senang"} size={52} />
                      </span>
                    ))}
                  </div>
                }
                besar={l("1 dari 3", "1 in 3")}
                judul={l("remaja Indonesia punya masalah kesehatan mental", "Indonesian adolescents have a mental health problem")}
                sub={l("Survei I-NAMHS 2022, dikutip proposal ADA.", "I-NAMHS 2022 survey, quoted in the ADA proposal.")}
              />
            </Muncul>
            <Muncul delay={150}>
              <Statistik
                visual={
                  <div className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px]" aria-hidden>
                    {Array.from({ length: 100 }).map((_, i) => (
                      <span key={i} className={`aspect-square rounded-full transition-colors duration-700 ${ya && i < 3 ? "bg-kunyit" : "bg-white/15"}`} style={{ transitionDelay: `${i < 3 ? 400 + i * 200 : 0}ms` }} />
                    ))}
                  </div>
                }
                besar={`${pct.toFixed(1).replace(".", ",")}%`}
                judul={l("yang mengalami gangguan mengakses layanan", "of those affected access services")}
                sub={l("Menurut proposal ADA. Angka ini perlu diverifikasi ke sumber aslinya.", "According to the ADA proposal. This figure needs checking against the original source.")}
              />
            </Muncul>
            <Muncul delay={300}>
              <Statistik
                visual={
                  <div className="flex gap-2.5 text-white/90">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`transition-all duration-500 ${Math.round(dokter) > i ? "scale-100 opacity-100" : "scale-75 opacity-20"}`}>
                        <Ikon nama="users" size={44} />
                      </span>
                    ))}
                  </div>
                }
                besar={String(Math.round(dokter))}
                judul={l("dokter spesialis jiwa tetap di RSKD Maluku", "permanent psychiatrists at RSKD Maluku")}
                sub={l("Per Maret 2023, untuk ±1,8 juta penduduk. Menurut proposal yang sama.", "As of March 2023, for ±1.8 million people. According to the same proposal.")}
              />
            </Muncul>
          </div>
          <Muncul delay={200}>
            <p className="mt-14 max-w-3xl text-xl font-medium leading-relaxed text-white/85">
              {l(
                "Guru sering menjadi orang dewasa pertama yang tahu, tetapi jarang punya bekal untuk menanggapi. Angka di atas adalah tentang remaja, bukan anak SD; kami memakainya sebagai gambaran besar masalahnya.",
                "Teachers are often the first adults to notice, but rarely have the tools to respond. These figures are about adolescents, not primary-school children; we use them as the big picture.",
              )}
            </p>
          </Muncul>
        </div>
      </section>
      <Gelombang atas="#1e2a4a" bawah="#ffffff" balik />
    </>
  );
}

/* ---------- Cara kerja (sticky storytelling) ---------- */
function MockAnak() {
  const { l, lang } = useL();
  return (
    <div className="mx-auto w-[280px] rounded-[2.4rem] border-[9px] border-tinta bg-langit p-4 shadow-[0_24px_60px_rgba(30,42,74,0.3)]">
      <div className="flex items-end gap-1">
        <Creature species="badak" mood="senang" size={88} />
        <p className="mb-3 flex-1 rounded-2xl bg-white px-3 py-2 text-[13px] font-bold leading-snug">
          {translate(lang, "rumah.sapaBaru", { nama: "Boni" })}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {(["cerah", "mendung", "hujan", "badai"] as const).map((c) => (
          <div key={c} className={`flex flex-col items-center rounded-2xl border-[3px] border-tinta bg-white py-2 shadow-[0_3px_0_#1e2a4a] ${c === "hujan" ? "bg-karang-muda" : ""}`}>
            <WeatherIcon weather={c} size={44} />
            <span className="text-xs font-extrabold">{translate(lang, `cuaca.${c}`)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-bold text-tinta/60">{l("Tanpa perlu membaca: ikon dan suara", "No reading needed: icons and voice")}</p>
    </div>
  );
}

function MockSinyal() {
  const { l, lang } = useL();
  const saran = KORPUS.find((e) => e.id === "sinyal")!.isi[lang].langkah.slice(0, 2).join(" ");
  return (
    <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(30,42,74,0.25)] ring-1 ring-tinta/10">
      <div className="flex items-center gap-1.5 bg-abu px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-karang" /><span className="size-2.5 rounded-full bg-kunyit" /><span className="size-2.5 rounded-full bg-daun" />
        <span className="ml-3 text-xs font-bold text-teks2">{l("Ruang Dampingan", "Support Room")}</span>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-bold">{l("AI: Gemini aktif", "AI: Gemini on")}</span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-kunyit-muda px-3 py-1 text-xs font-bold text-kuning">{l("Perlu perhatian", "Needs attention")}</span>
          <span className="text-xs font-semibold text-teks2">17 Okt, 19.08</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <AdultIcon id="ibu" size={44} />
          <p className="text-sm font-bold leading-snug">{l("Anak (teman: Boni) meminta bicara dengan Ibu", "A child (friend: Boni) asked to talk to Mom")}</p>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-teks2">
          <WeatherIcon weather="hujan" size={26} />
          {l("Cuaca hati: Hujan, terasa di perut", "Heart weather: Rainy, felt in the tummy")}
        </p>
        <div className="mt-3 rounded-xl bg-biru-muda p-3.5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-biru">
            {l("Saran langkah pertama", "Suggested first step")}
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] normal-case tracking-normal">{l("Dianalisis Gemini", "Analyzed by Gemini")}</span>
          </p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed">{saran}</p>
        </div>
        <p className="mt-3 text-xs font-medium text-teks2">{l("Isi jurnal anak tidak ditampilkan.", "The child's journal is not shown.")}</p>
      </div>
    </div>
  );
}

function MockProgres() {
  const { l } = useL();
  const kegiatan: [string, number][] = [
    [l("Cek cuaca hati", "Weather check-in"), 5],
    [l("Latihan napas", "Breathing"), 3],
    [l("Tebak perasaan", "Guess the feeling"), 4],
  ];
  return (
    <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(30,42,74,0.25)] ring-1 ring-tinta/10">
      <div className="flex items-center gap-1.5 bg-abu px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-karang" /><span className="size-2.5 rounded-full bg-kunyit" /><span className="size-2.5 rounded-full bg-daun" />
        <span className="ml-3 text-xs font-bold text-teks2">{l("Anak saya (2)", "My children (2)")}</span>
      </div>
      <div className="grid gap-3 p-5">
        {[{ n: "Aisyah", s: "badak", b: 12 }, { n: "Raka", s: "penyu", b: 7 }].map((a, i) => (
          <div key={a.n} className="rounded-2xl border border-garis p-3">
            <div className="flex items-center gap-3">
              <Creature species={a.s as "badak" | "penyu"} mood="senang" size={44} />
              <div className="flex-1">
                <p className="text-sm font-extrabold">{a.n}</p>
                <p className="text-xs font-semibold text-teks2">{l("Terhubung", "Connected")} · {l(`${a.b} bintang`, `${a.b} stars`)}</p>
              </div>
              <span className="rounded-full bg-hijau-muda px-2.5 py-0.5 text-[10px] font-bold text-hijau">{l("Terhubung", "Connected")}</span>
            </div>
            {i === 0 && (
              <ul className="mt-3 grid gap-1.5">
                {kegiatan.map(([k, n]) => (
                  <li key={k} className="flex items-center gap-2 text-[11px] font-bold">
                    <span className="w-24 shrink-0">{k}</span>
                    <span className="h-1.5 flex-1 rounded-full bg-garis"><span className="block h-full rounded-full bg-biru" style={{ width: `${(n / 5) * 100}%` }} /></span>
                    <span className="w-3 text-right">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CaraKerja() {
  const { l } = useL();
  const [aktif, setAktif] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setAktif(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  const langkah = [
    {
      judul: l("Anak berlatih", "The child practices"),
      isi: l(
        "Anak memilih cuaca hatinya lewat ikon, mendengar maskot, lalu menenangkan badan dengan napas balon. Tanpa perlu membaca.",
        "A child picks their heart weather through icons, listens to the mascot, then calms their body with balloon breathing. No reading needed.",
      ),
      mock: <MockAnak />,
    },
    {
      judul: l("Orang dewasa menerima sinyal", "A trusted adult gets a signal"),
      isi: l(
        "Saat anak butuh bicara, sinyal sampai ke orang dewasa yang ia pilih sendiri, lengkap dengan saran langkah pertama. Jurnal anak tidak pernah dibuka.",
        "When a child needs to talk, the signal reaches an adult they chose themselves, with a suggested first step. The child's journal is never opened.",
      ),
      mock: <MockSinyal />,
    },
    {
      judul: l("Orang tua memantau progres", "Parents follow the progress"),
      isi: l(
        "Tiap anak punya kode unik atas namanya. Setelah terhubung, orang tua melihat daftar anak, bintang, dan kegiatan belajar yang sudah diselesaikan.",
        "Each child gets a unique code in their name. Once connected, parents see their children, stars and the learning activities completed.",
      ),
      mock: <MockProgres />,
    },
  ];

  return (
    <section id="cara-kerja" className="relative scroll-mt-16 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 md:grid-cols-2 md:px-10">
        <div>
          <div className="pt-8 md:pt-20">
            <Muncul>
              <h2 className="tampil text-[clamp(2.2rem,5vw,4rem)] font-extrabold text-tinta">
                {l("Satu alur, dari anak sampai orang dewasa yang dipercaya.", "One loop, from child to a trusted adult.")}
              </h2>
            </Muncul>
          </div>
          <ol>
            {langkah.map((s, i) => (
              <li key={i} data-i={i} ref={(el) => { refs.current[i] = el; }} className="flex min-h-[46vh] flex-col justify-center py-10 md:min-h-[72vh]">
                <span className={`tampil text-7xl font-extrabold transition-colors duration-500 md:text-8xl ${aktif === i ? "text-karang" : "text-tinta/15"}`}>{i + 1}</span>
                <h3 className={`tampil mt-2 text-3xl font-extrabold transition-opacity duration-500 md:text-4xl ${aktif === i ? "opacity-100" : "opacity-40"}`}>{s.judul}</h3>
                <p className={`mt-3 max-w-md text-lg font-medium leading-relaxed text-tinta/75 transition-opacity duration-500 ${aktif === i ? "opacity-100" : "opacity-40"}`}>{s.isi}</p>
                <div className="mt-8 md:hidden">{s.mock}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative hidden md:block">
          <div className="sticky top-0 flex h-screen items-center">
            <div aria-hidden className="absolute inset-x-0 top-1/2 -z-0 mx-auto h-[70%] max-w-md -translate-y-1/2 rounded-[3rem] bg-gradient-to-br from-krem-tua to-langit/50" />
            <div className="relative w-full">
              {langkah.map((s, i) => (
                <div key={i} className={`absolute inset-x-0 top-1/2 -translate-y-1/2 transition-all duration-700 ${aktif === i ? "translate-y-[-50%] scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}>
                  {s.mock}
                </div>
              ))}
              <div className="invisible"><MockAnak /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Dua pintu ---------- */
export function Pintu() {
  const { l } = useL();
  const [aktif, setAktif] = useState(0);
  const panel = useMemo(
    () => [
      {
        href: "/anak",
        warna: "bg-karang text-white",
        label: l("Untuk anak", "For children"),
        judul: "Teman Ada",
        isi: l(
          "Teman bermain yang mengajak anak mengenali dan menenangkan perasaan: cuaca hati, napas balon, tebak perasaan, cerita, dan Lingkaran Aman.",
          "A playful friend that helps children notice and calm their feelings: heart weather, balloon breathing, guess-the-feeling, stories and a Safe Circle.",
        ),
        cta: l("Coba aplikasi anak", "Try the child app"),
        visual: <Creature species="badak" mood="senang" size={260} sentuh label="Badak" />,
      },
      {
        href: "/pendamping",
        warna: "bg-laut text-white",
        label: l("Untuk orang tua dan guru", "For parents and teachers"),
        judul: l("Ruang Dampingan", "Support Room"),
        isi: l(
          "Terima sinyal dari anak, tanya Copilot yang menjawab dari panduan baku, dan lihat tren mingguan tanpa membuka jurnal anak.",
          "Receive signals from children, ask a Copilot that answers from standard guidance, and see weekly trends without opening the child's journal.",
        ),
        cta: l("Buka ruang dampingan", "Open the support room"),
        visual: <AdultIcon id="guru" size={220} />,
      },
    ],
    [l],
  );

  return (
    <section id="produk" className="mx-auto w-full max-w-7xl scroll-mt-16 px-5 py-16 md:px-10 md:py-24">
      <Muncul>
        <h2 className="tampil text-[clamp(2.2rem,5vw,4rem)] font-extrabold text-tinta">{l("Dua pintu, satu platform.", "Two doors, one platform.")}</h2>
      </Muncul>
      <div className="mt-10 flex flex-col gap-4 md:h-[520px] md:flex-row">
        {panel.map((p, i) => (
          <Muncul key={p.judul} delay={i * 120} className={`md:transition-[flex] md:duration-700 ${aktif === i ? "md:flex-[3.2]" : "md:flex-[1]"} flex`}>
            <Link
              href={p.href}
              onMouseEnter={() => setAktif(i)}
              onFocus={() => setAktif(i)}
              className={`group relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] p-7 outline-none transition focus-visible:ring-4 focus-visible:ring-kunyit ${p.warna}`}
            >
              <div>
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{p.label}</span>
                <h3 className="tampil mt-3 text-4xl font-extrabold md:text-5xl">{p.judul}</h3>
              </div>
              <div className={`transition-all duration-500 ${aktif === i ? "max-h-72 opacity-100" : "max-h-72 opacity-100 md:max-h-0 md:opacity-0"}`}>
                <p className="max-w-md text-base font-medium leading-relaxed text-white/90">{p.isi}</p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-tinta transition group-hover:gap-3">
                  {p.cta} <Ikon nama="arrow" size={16} />
                </span>
              </div>
              <div aria-hidden className={`pointer-events-none absolute -bottom-6 -right-4 transition-all duration-700 ${aktif === i ? "scale-100 opacity-100" : "scale-75 opacity-40"}`}>
                {p.visual}
              </div>
            </Link>
          </Muncul>
        ))}
      </div>
    </section>
  );
}

/* ---------- Demo Copilot ---------- */
function Jawaban({ q }: { q: string }) {
  const { lang, l } = useL();
  const j = useMemo(() => jawab(q, lang), [q, lang]);
  const [n, setN] = useState(0);
  const [langkah, setLangkah] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setN((x) => x + 3), 18);
    return () => window.clearInterval(t);
  }, []);
  const selesaiKetik = n >= j.ringkas.length;
  useEffect(() => {
    if (!selesaiKetik) return;
    const t = window.setInterval(() => setLangkah((x) => x + 1), 420);
    return () => window.clearInterval(t);
  }, [selesaiKetik]);

  return (
    <div className="rounded-3xl bg-white p-5 text-tinta shadow-xl">
      {j.darurat && (
        <p className="mb-3 rounded-xl bg-karang px-3 py-2 text-sm font-bold text-white">
          {l("Tanggapi sekarang. Jangan tinggalkan anak sendirian dan segera hubungi bantuan profesional.", "Respond now. Don't leave the child alone and contact professional help right away.")}
        </p>
      )}
      <span className="mb-2 inline-block rounded-full bg-biru-muda px-2.5 py-0.5 text-xs font-bold text-biru">
        {j.darurat ? l("Dijawab dari panduan baku", "Answered from standard guidance") : l("Simulasi di browser dari korpus panduan (bukan panggilan Gemini)", "Browser simulation from the guidance corpus (not a Gemini call)")}
      </span>
      <h3 className="text-lg font-extrabold">{j.judul}</h3>
      <p className="mt-1.5 min-h-[3.2rem] text-sm font-medium leading-relaxed">
        {j.ringkas.slice(0, n)}
        {!selesaiKetik && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-biru align-middle" />}
      </p>
      <ol className="mt-2 grid gap-1.5">
        {j.langkah.slice(0, langkah).map((s, i) => (
          <li key={i} className="anim-terbit flex gap-2.5 text-sm font-medium leading-relaxed">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-biru text-[11px] font-bold text-white">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {langkah >= j.langkah.length && j.cocok && (
        <p className="anim-terbit mt-3 border-t border-garis pt-2.5 text-xs font-semibold text-teks2">
          {l("Sumber panduan:", "Guidance source:")} {j.sumber}
        </p>
      )}
    </div>
  );
}

export function CopilotDemo() {
  const { l } = useL();
  const [idx, setIdx] = useState(0);
  const situasi = [
    l("Anak saya sering marah dan memukul teman", "My child often gets angry and hits classmates"),
    l("Dia jadi pendiam dan sering menangis", "They've become quiet and cry often"),
    l("Dia cerita diejek teman di kelas", "They told me they were teased in class"),
    l("Katanya sakit perut setiap mau berangkat sekolah", "They say their tummy hurts every school morning"),
    l("Anak bilang tidak mau hidup lagi", "My child said they don't want to live anymore"),
  ];
  return (
    <section id="ai" className="relative scroll-mt-16 overflow-hidden bg-tinta text-white">
      <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-biru/30 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-24">
        <div>
          <Muncul>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
              <Ikon nama="sparkle" size={14} /> Gemini
            </span>
            <h2 className="tampil mt-4 text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold">
              {l("AI yang menjawab dari panduan, bukan menebak.", "AI that answers from guidance, not guesses.")}
            </h2>
            <p className="mt-4 max-w-md text-lg font-medium leading-relaxed text-white/75">
              {l(
                "Coba pilih situasi di bawah. Ini contoh dari korpus panduan yang sama dengan yang dipakai Copilot.",
                "Pick a situation below. This is a sample from the same guidance corpus the Copilot uses.",
              )}
            </p>
          </Muncul>
          <ul className="mt-6 grid gap-2.5">
            {situasi.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-pressed={idx === i}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    idx === i ? "bg-white text-tinta shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
                  } ${i === 4 ? "ring-1 ring-karang/70" : ""}`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-7 grid gap-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">{l("Coba yang sungguhan (dipanggil dari Gemini)", "Try the real thing (called from Gemini)")}</p>
            <Link href="/pendamping?tab=tanya" className="flex items-center justify-between rounded-2xl bg-karang px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5">
              <span>{l("Copilot Pendamping", "Caregiver Copilot")}<span className="block text-xs font-medium text-white/80">{l("Gerbang orang dewasa: jawab 7 + 8", "Adult gate: answer 7 + 8")}</span></span>
              <Ikon nama="arrow" size={16} />
            </Link>
            <Link href="/cerita-ajaib" className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold transition hover:bg-white/25">
              <span>{l("Cerita Ajaib untuk anak", "Magic Story for children")}<span className="block text-xs font-medium text-white/70">{l("Anak memilih tema, Gemini menulis ceritanya", "The child picks a theme, Gemini writes the story")}</span></span>
              <Ikon nama="arrow" size={16} />
            </Link>
          </div>
          <ul className="mt-7 grid gap-2.5 text-sm font-semibold text-white/80">
            {[
              l("Tidak mendiagnosis dan tidak menyebut obat.", "Never diagnoses and never names medication."),
              l("Wajib mengutip sumber dari korpus.", "Must cite sources from the corpus."),
              l("Situasi bahaya selalu dijawab dari panduan baku, bukan oleh model.", "Emergencies are always answered from standard guidance, never by the model."),
            ].map((x) => (
              <li key={x} className="flex gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-hijau text-white"><Ikon nama="check" size={12} /></span>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <Muncul dari="kanan" className="md:pt-2">
          <div className="rounded-[2rem] bg-white/10 p-4 md:p-6">
            <div className="mb-3 flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-biru px-4 py-2.5 text-sm font-semibold">{situasi[idx]}</p>
            </div>
            <Jawaban key={`${idx}`} q={idx === 4 ? "anak bilang tidak mau hidup / child said they don't want to live" : situasi[idx]} />
          </div>
        </Muncul>
      </div>
    </section>
  );
}

/* ---------- Keamanan + penutup ---------- */
export function Aman() {
  const { l } = useL();
  const butir = [
    l("Tidak ada percakapan bebas antara AI dan anak.", "No free chat between AI and the child."),
    l("Tidak mendiagnosis. Hanya pertolongan pertama dan rujukan.", "No diagnosis. Only first aid and referral."),
    l("Jurnal dan jawaban anak bersifat privat.", "The child's journal and answers stay private."),
    l("Data prototipe tersimpan di browser, tanpa iklan dan pelacakan.", "Prototype data stays in the browser, with no ads or tracking."),
    l("Panduan masih draf dan perlu divalidasi tenaga profesional.", "Guidance is a draft and needs validation by professionals."),
  ];
  return (
    <section id="aman" className="relative scroll-mt-16 overflow-hidden bg-krem">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <Muncul dari="kiri">
          <h2 className="tampil text-[clamp(2.2rem,5vw,4rem)] font-extrabold text-tinta">{l("Dirancang aman untuk anak.", "Designed to be safe for children.")}</h2>
          <p className="mt-4 max-w-md text-lg font-medium leading-relaxed text-tinta/75">
            {l(
              "Aplikasi untuk anak kecil harus berhati-hati. Setiap keputusan desain di bawah dibuat supaya anak tetap aman dan orang dewasa tetap memegang kendali.",
              "An app for young children must be careful. Every design decision below keeps children safe and adults in control.",
            )}
          </p>
        </Muncul>
        <ul className="grid gap-3">
          {butir.map((x, i) => (
            <Muncul key={x} delay={i * 110} dari="kanan">
              <li className="flex items-center gap-4 rounded-full bg-white py-3 pl-3 pr-6 shadow-[0_6px_20px_rgba(30,42,74,0.08)]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-hijau text-white"><Ikon nama="check" size={18} /></span>
                <span className="text-base font-bold leading-snug text-tinta">{x}</span>
              </li>
            </Muncul>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Penutup() {
  const { l } = useL();
  return (
    <section className="relative overflow-hidden bg-karang text-white">
      <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 0, transparent 40%), radial-gradient(circle at 85% 70%, #f6b93b 0, transparent 35%)" }} />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-0 pt-16 text-center md:px-10 md:pt-24">
        <Muncul dari="skala">
          <h2 className="tampil text-[clamp(2.4rem,6vw,4.8rem)] font-extrabold">{l("Mulai dari satu sentuhan.", "Start with a single tap.")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-white/90">
            {l("Coba sebagai anak, atau sebagai orang tua dan guru.", "Try it as a child, or as a parent or teacher.")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/anak" className="rounded-full bg-white px-7 py-3.5 text-base font-bold text-tinta shadow-lg transition hover:-translate-y-0.5">{l("Aplikasi anak", "Child app")}</Link>
            <Link href="/pendamping" className="rounded-full bg-tinta px-7 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5">{l("Ruang dampingan", "Support room")}</Link>
          </div>
        </Muncul>
        <div className="mt-10 flex items-end justify-center">
          <Creature species="penyu" mood="senang" size={170} sentuh className="-mr-8" label="Penyu" />
          <Creature species="badak" mood="senang" size={260} sentuh className="relative z-10" label="Badak" />
          <Creature species="nuri" mood="senang" size={170} sentuh className="-ml-8" label="Nuri" />
        </div>
      </div>
      <footer className="relative bg-tinta px-5 py-8 text-sm font-medium text-white/70 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-1.5">
          <p className="font-bold text-white">Teman Ada</p>
          <p>{l("Prototipe untuk Google Cloud AI Builder Cup 2026. Bukan alat diagnosis dan bukan pengganti bantuan profesional.", "Prototype for Google Cloud AI Builder Cup 2026. Not a diagnostic tool and not a substitute for professional help.")}</p>
          <p>{l("Ilustrasi dibuat dengan bantuan AI. Materi panduan adalah draf dan belum divalidasi tenaga profesional. Angka masalah dikutip dari proposal ADA (PFmuda 2026), merujuk I-NAMHS 2022.", "Illustrations were created with AI assistance. Guidance content is a draft and not yet validated by professionals. Problem figures are quoted from the ADA proposal (PFmuda 2026), citing I-NAMHS 2022.")}</p>
        </div>
      </footer>
    </section>
  );
}

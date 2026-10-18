"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Creature } from "@/components/Creature";
import { LangSwitch } from "@/components/LangSwitch";
import { Ikon, Lambang } from "@/components/lms/ikon";
import { useL } from "@/components/lms/util";
import { firebaseSiap } from "@/lib/firebase";
import { buatRuang } from "@/lib/ruang";
import { keluar, masukEmail, masukGoogle, pesanGalat, simpanProfil, useSesi } from "@/lib/sesi";

type Peran = "dewasa" | null;

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="anim-terbit w-full max-w-md">{children}</div>;
}

function Judul({ no, judul, sub }: { no?: string; judul: string; sub?: string }) {
  return (
    <>
      {no && <p className="text-xs font-bold uppercase tracking-wider text-biru">{no}</p>}
      <h1 className="mt-1 text-3xl font-extrabold leading-tight">{judul}</h1>
      {sub && <p className="mt-2 text-sm font-medium leading-relaxed text-teks2">{sub}</p>}
    </>
  );
}

export default function Mulai() {
  const { l, lang } = useL();
  const router = useRouter();
  const sesi = useSesi();
  const [peran, setPeran] = useState<Peran>(null);

  // form masuk
  const [daftar, setDaftar] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState("");
  // form ruang
  const [namaRuang, setNamaRuang] = useState("");
  const [tersalin, setTersalin] = useState("");

  const dewasa = sesi.user && !sesi.user.anonim;
  const profilMuat = Boolean(dewasa) && sesi.profil === null;
  const langkah = !dewasa ? (peran ? "masuk" : "peran") : !sesi.profil?.ruangKode ? "ruang" : "kode";
  const urutan = { peran: 0, masuk: 1, ruang: 2, kode: 3 }[langkah];

  async function jalankan(fn: () => Promise<void>) {
    setSibuk(true);
    setGalat("");
    try {
      await fn();
    } catch (e) {
      setGalat(pesanGalat(e, lang));
    } finally {
      setSibuk(false);
    }
  }

  const kode = sesi.profil?.ruangKode ?? "";
  const tautan = typeof window !== "undefined" ? `${window.location.origin}/gabung?kode=${kode}` : "";
  const salin = (teks: string, id: string) => {
    void navigator.clipboard?.writeText(teks);
    setTersalin(id);
    window.setTimeout(() => setTersalin(""), 1800);
  };

  const langkahLabel = [l("Pilih peran", "Choose role"), l("Masuk", "Sign in"), l("Tambah anak", "Add a child"), l("Hubungkan anak", "Connect the child")];

  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[0.9fr_1.1fr]">
      {/* Panel ilustrasi */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image src="/img/latar-rumah.webp" width={1200} height={800} unoptimized alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-biru-tua/90 via-biru-tua/30 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-white/20 backdrop-blur"><Lambang size={28} /></span>
            <span className="tampil text-2xl font-extrabold">Teman Ada</span>
          </Link>
          <div>
            <div className="flex items-end">
              <Creature species="penyu" mood="senang" size={150} className="-mr-6" />
              <Creature species="badak" mood="senang" size={230} className="relative z-10" />
              <Creature species="nuri" mood="senang" size={150} className="-ml-6" />
            </div>
            <h2 className="tampil mt-6 max-w-md text-4xl font-extrabold">
              {l("Satu ruang, satu kode. Sinyal anak sampai ke orang dewasa yang dipercaya.", "One room, one code. A child's signal reaches the adult they trust.")}
            </h2>
            <ul className="mt-5 grid max-w-md gap-2 text-sm font-semibold text-white/90">
              {[
                l("Orang dewasa membuat ruang dan mendapat kode.", "An adult creates a room and gets a code."),
                l("Perangkat anak bergabung dengan kode itu.", "The child's device joins with that code."),
                l("Sinyal tampil langsung di perangkat orang dewasa.", "Signals appear instantly on the adult's device."),
              ].map((x) => (
                <li key={x} className="flex gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/25"><Ikon nama="check" size={12} /></span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Panel formulir */}
      <main className="flex flex-col bg-white">
        <header className="flex items-center justify-between gap-3 px-5 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-teks2 hover:text-teks lg:invisible">
            <Ikon nama="arrow" size={16} className="rotate-180" /> {l("Beranda", "Home")}
          </Link>
          <LangSwitch className="!border !border-garis !text-xs" />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-12 md:px-10">
          {/* Penunjuk langkah */}
          <ol className="mb-8 flex w-full max-w-md items-center gap-2" aria-label="Progress">
            {langkahLabel.map((x, i) => (
              <li key={x} className="flex flex-1 items-center gap-2" aria-current={i === urutan ? "step" : undefined}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i < urutan ? "bg-hijau text-white" : i === urutan ? "bg-biru text-white" : "bg-garis text-teks2"}`}>
                  {i < urutan ? <Ikon nama="check" size={13} /> : i + 1}
                </span>
                <span className={`hidden text-xs font-bold sm:block ${i === urutan ? "text-teks" : "text-teks2"}`}>{x}</span>
                {i < 3 && <span className={`h-0.5 flex-1 rounded-full ${i < urutan ? "bg-hijau" : "bg-garis"}`} />}
              </li>
            ))}
          </ol>

          {!firebaseSiap && (
            <p className="mb-6 w-full max-w-md rounded-xl bg-kuning-muda px-4 py-3 text-sm font-semibold text-kuning">
              {l("Firebase belum dikonfigurasi, jadi aplikasi berjalan dalam mode lokal (data hanya di browser).", "Firebase isn't configured, so the app runs in local mode (data stays in the browser).")}
            </p>
          )}

          {profilMuat && <p className="text-sm font-semibold text-teks2">{l("Memuat profil...", "Loading profile...")}</p>}

          {!profilMuat && langkah === "peran" && (
            <Panel>
              <Judul no={l("Selamat datang", "Welcome")} judul={l("Siapa yang akan memakai?", "Who will be using it?")} sub={l("Pilih sesuai peran Anda. Anda bisa kembali kapan saja.", "Pick your role. You can come back any time.")} />
              <ul className="mt-6 grid gap-3">
                {[
                  { ikon: "users" as const, judul: l("Saya orang tua atau guru", "I'm a parent or teacher"), isi: l("Buat ruang, terima sinyal dari anak, dan tanya Copilot.", "Create a room, receive signals from the child, and ask the Copilot."), aksi: () => setPeran("dewasa") },
                  { ikon: "play" as const, judul: l("Ini perangkat anak", "This is the child's device"), isi: l("Gabung ke ruang dengan kode dari orang dewasa.", "Join a room with a code from an adult."), aksi: () => router.push("/gabung") },
                  { ikon: "book" as const, judul: l("Saya peserta pelatihan guru", "I'm a teacher-training participant"), isi: l("Masuk ke Baku Jaga Academy.", "Go to Baku Jaga Academy."), aksi: () => router.push("/akademi") },
                ].map((x) => (
                  <li key={x.judul}>
                    <button type="button" onClick={x.aksi} className="lms-card flex w-full items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:border-biru/40">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-biru-muda text-biru"><Ikon nama={x.ikon} size={22} /></span>
                      <span className="flex-1">
                        <span className="block text-base font-bold">{x.judul}</span>
                        <span className="block text-sm font-medium text-teks2">{x.isi}</span>
                      </span>
                      <Ikon nama="arrow" size={18} className="text-teks2" />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {!profilMuat && langkah === "masuk" && (
            <Panel>
              <Judul no={l("Langkah 1", "Step 1")} judul={daftar ? l("Buat akun", "Create an account") : l("Masuk", "Sign in")} sub={l("Akun diperlukan agar sinyal dari anak aman dan hanya bisa dibaca oleh Anda.", "An account keeps children's signals safe and readable only by you.")} />
              <button type="button" disabled={sibuk || !firebaseSiap} className="lms-btn-ghost mt-6 w-full !py-3" onClick={() => void jalankan(masukGoogle)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.600-.2-2.300H12v4.500h6.500a5.600 5.600 0 0 1-2.400 3.700v3h3.900c2.300-2.100 3.500-5.200 3.500-8.900z"/><path fill="#34A853" d="M12 24c3.200 0 6-1.100 7.900-2.900l-3.900-3c-1.100.7-2.500 1.200-4 1.200-3.100 0-5.700-2.100-6.600-4.900H1.400v3.100A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.400 14.300a7.200 7.200 0 0 1 0-4.600V6.600H1.400a12 12 0 0 0 0 10.800z"/><path fill="#EA4335" d="M12 4.800c1.800 0 3.300.6 4.600 1.800l3.400-3.400A12 12 0 0 0 1.400 6.600l4 3.100C6.300 6.900 8.900 4.800 12 4.800z"/></svg>
                {l("Lanjut dengan Google", "Continue with Google")}
              </button>
              <p className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-teks2"><span className="h-px flex-1 bg-garis" />{l("atau dengan email", "or with email")}<span className="h-px flex-1 bg-garis" /></p>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void jalankan(() => masukEmail(email.trim(), sandi, daftar, nama.trim() || undefined));
                }}
              >
                {daftar && (
                  <input className="lms-input" placeholder={l("Nama Anda", "Your name")} aria-label={l("Nama Anda", "Your name")} value={nama} onChange={(e) => setNama(e.target.value.slice(0, 60))} autoComplete="name" />
                )}
                <input className="lms-input" type="email" required placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <input className="lms-input" type="password" required minLength={6} placeholder={l("Kata sandi (min. 6 karakter)", "Password (min. 6 characters)")} aria-label={l("Kata sandi", "Password")} value={sandi} onChange={(e) => setSandi(e.target.value)} autoComplete={daftar ? "new-password" : "current-password"} />
                <button type="submit" disabled={sibuk || !firebaseSiap} className="lms-btn !py-3">
                  {sibuk ? l("Memproses...", "Working...") : daftar ? l("Daftar", "Sign up") : l("Masuk", "Sign in")}
                </button>
              </form>
              {galat && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-merah">{galat}</p>}
              <button type="button" className="mt-4 text-sm font-semibold text-biru underline" onClick={() => { setDaftar(!daftar); setGalat(""); }}>
                {daftar ? l("Sudah punya akun? Masuk", "Already have an account? Sign in") : l("Belum punya akun? Daftar", "No account yet? Sign up")}
              </button>
              <div className="mt-6 rounded-xl bg-abu px-4 py-3 text-sm font-medium text-teks2">
                {l("Hanya ingin mencoba?", "Just want to try it?")}{" "}
                <Link href="/pendamping" className="font-bold text-biru underline">{l("Lanjut tanpa akun (mode lokal)", "Continue without an account (local mode)")}</Link>
              </div>
              <button type="button" className="mt-4 text-sm font-semibold text-teks2 underline" onClick={() => setPeran(null)}>{l("Ganti peran", "Change role")}</button>
            </Panel>
          )}

          {!profilMuat && langkah === "ruang" && (
            <Panel>
              <Judul no={l("Langkah 2", "Step 2")} judul={l("Tambahkan anak pertama", "Add your first child")} sub={l("Setiap anak mendapat kode unik atas namanya. Anak lain bisa ditambahkan nanti di menu Anak.", "Each child gets a unique code in their name. You can add more children later in the Children tab.")} />
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-teks2">
                <span className="grid size-7 place-items-center rounded-full bg-biru text-xs font-bold text-white">{(sesi.user?.nama || sesi.user?.email || "?")[0]?.toUpperCase()}</span>
                {sesi.user?.nama || sesi.user?.email}
              </p>
              <form
                className="mt-4 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void jalankan(async () => {
                    const kodeBaru = await buatRuang(namaRuang.trim());
                    await simpanProfil({ peran: "dewasa", nama: sesi.user?.nama || sesi.user?.email.split("@")[0] || "", ruangKode: kodeBaru, ruangNama: namaRuang.trim() });
                  });
                }}
              >
                <label htmlFor="nr" className="text-sm font-semibold">{l("Nama anak", "Child's name")}</label>
                <input id="nr" className="lms-input" value={namaRuang} onChange={(e) => setNamaRuang(e.target.value.slice(0, 60))} placeholder={l("mis. Aisyah", "e.g. Aisha")} autoComplete="off" />
                <button type="submit" disabled={sibuk || namaRuang.trim().length < 2} className="lms-btn !py-3">
                  {sibuk ? l("Membuat kode...", "Creating code...") : l("Buat kode anak", "Create child code")}
                </button>
              </form>
              {galat && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-merah">{galat}</p>}
              <button type="button" className="mt-5 text-sm font-semibold text-teks2 underline" onClick={() => void keluar()}>{l("Keluar", "Sign out")}</button>
            </Panel>
          )}

          {!profilMuat && langkah === "kode" && (
            <Panel>
              <Judul no={l("Langkah 3", "Step 3")} judul={l("Kode siap. Hubungkan perangkat anak.", "Code ready. Connect the child's device.")} sub={sesi.profil?.ruangNama ? `${l("Untuk", "For")}: ${sesi.profil.ruangNama}` : undefined} />
              <div className="mt-6 rounded-2xl border border-garis bg-abu p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-teks2">{l("Kode anak", "Child code")}</p>
                <p className="tampil mt-1 flex justify-center gap-1.5" aria-label={kode.split("").join(" ")}>
                  {kode.split("").map((c, i) => (
                    <span key={i} className="grid h-14 w-11 place-items-center rounded-xl bg-white text-3xl font-extrabold text-biru-tua shadow-sm ring-1 ring-garis">{c}</span>
                  ))}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button type="button" className="lms-btn-ghost !px-3 !py-2" onClick={() => salin(kode, "kode")}>
                    {tersalin === "kode" ? l("Tersalin", "Copied") : l("Salin kode", "Copy code")}
                  </button>
                  <button type="button" className="lms-btn-ghost !px-3 !py-2" onClick={() => salin(tautan, "tautan")}>
                    {tersalin === "tautan" ? l("Tersalin", "Copied") : l("Salin tautan", "Copy link")}
                  </button>
                </div>
              </div>
              <ol className="mt-5 grid gap-3 text-sm font-medium">
                {[
                  l("Di perangkat anak, buka alamat aplikasi dan pilih \"Ini perangkat anak\" (atau buka tautan di atas).", "On the child's device, open the app and choose \"This is the child's device\" (or open the link above)."),
                  l("Masukkan kode ruang di atas.", "Enter the room code above."),
                  l("Anak memilih teman maskotnya. Sinyal anak akan muncul di sini secara langsung.", "The child picks a mascot friend. Their signals will appear here instantly."),
                ].map((x, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-biru-muda text-xs font-bold text-biru">{i + 1}</span>
                    {x}
                  </li>
                ))}
              </ol>
              <Link href="/pendamping" className="lms-btn mt-6 w-full !py-3">
                {l("Buka Ruang Dampingan", "Open the Support Room")}
                <Ikon nama="arrow" size={16} />
              </Link>
              <button type="button" className="mt-4 text-sm font-semibold text-teks2 underline" onClick={() => void keluar()}>{l("Keluar", "Sign out")}</button>
            </Panel>
          )}
        </div>
      </main>
    </div>
  );
}

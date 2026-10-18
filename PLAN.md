# Rencana AI Builder Cup 2026 — Teman Ada × Baku Jaga

Status: draft untuk didiskusikan tim. Dibuat 17 Okt 2026.

## 0. Cek dulu (blocker, bukan teknis)

- [x] Tim sudah terdaftar (2 orang). Deck PFmuda milik tim ADA (founder tidak ikut kompetisi), dipakai hanya sebagai referensi.
- [x] Pendiri ADA (S2 UC Berkeley) tidak ikut, jadi aturan "satu pelajar = tim didiskualifikasi" tidak berlaku untuk tim ini. Tetap pastikan kedua anggota bukan pelajar.
- [ ] Kedua anggota berusia 21+ dan berdomisili JAPAC.
- [ ] Karena deck hanya referensi: jangan menyebut tim ADA, sekolah mitra (SMAN 1, Xaverius, SMAN 6), atau angka target mereka sebagai milik/kesepakatan kita. Boleh dikutip sebagai referensi dengan atribusi; minta izin ADA kalau mau menyebut kolaborasi atau pilot.
- [ ] Baca halaman "Challenges & Requirements" di aibuildercup.com: pilih tema resmi, cek apakah Gemini/Gemma wajib, dan cek aturan AI coding assistant (tanyakan ke panitia juga).
- [ ] Deadline pengumpulan prototipe: **18 Okt 2026, 23:59 UTC** (= 19 Okt 06:59 WIB). Anggap deadline-nya 18 Okt malam WIB supaya aman.

## 1. Posisi produk

**Satu platform, tiga peran, satu loop.**

> Teman Ada: platform kesehatan mental berbasis WHO (HAT/EASE) dan MHFA. Anak berlatih mengenali dan menenangkan emosi, orang dewasa terpercaya yang sudah terlatih menerima sinyal saat anak butuh bantuan, dan AI memperluas jangkauan tenaga ahli yang sangat sedikit (Maluku: ±4 psikiater tetap untuk ±1,8 juta penduduk).

Dua produk di dokumen digabung jadi satu loop, bukan dua aplikasi:

```
ANAK (B2C, fokus utama)          ORANG DEWASA TERPERCAYA             PELATIH / ADMIN
Check-in "cuaca hati"   ──►   Notifikasi + panduan respons   ◄──  Baku Jaga Academy (LMS ToT)
Latihan regulasi               (Guru BK / orang tua)                 melatih guru fasilitator
Skenario sosial                      ▲                               + kurasi konten
Lingkaran Aman ──── sinyal ──────────┘
```

Alasan unifikasi masuk akal: modul "Lingkaran Aman" di sisi anak membutuhkan orang dewasa yang kompeten saat anak menunjuknya. LMS ToT adalah yang membuat orang dewasa itu kompeten. Tanpa LMS, aplikasi anak tidak punya tempat tujuan yang aman. Tanpa aplikasi, LMS tidak punya sinyal nyata untuk dilatihkan.

| Peran | Segmen | Isi utama | Prioritas build |
|---|---|---|---|
| Anak/siswa | B2C | Check-in, P3K Emosi, skenario sosial, Lingkaran Aman, jurnal privat | **Utama** |
| Orang tua / guru fasilitator | B2C + B2G | Inbox sinyal, panduan respons, copilot AI, tren anonim | **Utama (tipis)** |
| Pelatih / admin | B2G | LMS ToT: modul, kuis, sertifikasi, kurasi konten | Minimal (mockup + 1 modul berjalan) |

## 2. Keputusan yang perlu tim ambil

1. **Usia sasaran: SD kelas 1 (diputuskan 17 Okt), sesuai `AI Builder Cup Idea.docx` Fase A/B.** Anak kelas 1 (±6–7 tahun) belum lancar membaca/menulis, jadi seluruh interaksi anak memakai **ketukan, ikon, dan suara (TTS)**, bukan teks. Triase AI bekerja dari pilihan terstruktur (cuaca hati, bagian tubuh, "Lebih Baik / Masih Berat"); jurnal suara (STT) hanya tambahan jika sempat. Copilot Pendamping untuk orang dewasa tetap fitur AI utama. Kelas 4–6 (Fase C: body scan, skenario sosial, jurnal tulis) ditunjukkan di deck sebagai pengembangan. Data masalah di deck/proposal ADA adalah data remaja (I-NAMHS 2022: 1 dari 3 remaja punya masalah kesehatan mental), jadi jangan dipakai seolah-olah data anak SD; kutip sebagai konteks dengan atribusi.
2. **Prototipe tanpa database dan tanpa integrasi eksternal.** Status disimpan di browser (localStorage); demo dua peran lewat tombol ganti peran di satu perangkat. Penyimpanan lintas perangkat ditambahkan belakangan hanya jika sempat. Respons AI memakai tiruan dulu sampai akses Gemini tersedia.
3. **UI**: referensi gaya adalah NidoPets (adopsi teman, tebak perasaan, toolkit, pelajaran singkat). Ambil strukturnya saja; maskot, nama, dan gaya visual harus milik sendiri (Boni si Badak atau hewan Maluku).
2. **Wilayah demo.** Pakai konteks Ambon/3T: skenario lokal, bahasa sederhana, dan mode luring (lihat bagian 4).

## 3. Di mana AI dipasang (Gemini)

Aturan keras: **tidak ada chat bebas antara AI dan anak.** AI bekerja di belakang layar atau untuk orang dewasa. Ini sekaligus jadi nilai jual di pitch.

| # | Fitur AI | Pengguna | Cara kerja | Prioritas |
|---|---|---|---|---|
| 1 | **Copilot Pendamping** | Guru/orang tua | Pengguna bertanya situasi nyata; Gemini menjawab dari modul MHFA yang divalidasi dokter + direktori rujukan (RAG sederhana), dengan kutipan sumber dan batas "tidak mendiagnosis" | **Wajib** |
| 2 | **Triase sinyal** | Sistem | Gemini mengklasifikasikan teks/suara check-in dan jurnal ke tingkat (aman / perlu perhatian / perlu orang dewasa sekarang) dengan output JSON terstruktur. Tingkat tertinggi tidak dibalas AI ke anak; langsung tampil kartu Lingkaran Aman dan notifikasi ke orang dewasa. Aturan keselamatan (kata kunci bahaya) berjalan di samping model, bukan hanya model | **Wajib** |
| 3 | **Skenario sosial lokal** | Anak | Gemini menghasilkan variasi komik bercabang (kantin, WhatsApp grup, peringkat kelas) dengan bahasa lokal. Dihasilkan di muka, direview dokter, baru dipublikasi. Bukan dihasilkan langsung di depan anak | Sebaiknya ada |
| 4 | **Suara maskot + jurnal suara** | Anak | Text-to-Speech untuk panduan, Speech-to-Text untuk jurnal audio | Jika sempat |
| 5 | **Ringkasan tren** | Orang tua/guru | Gemini mengubah data mingguan menjadi pesan singkat tanpa menghakimi. Isi jurnal tidak pernah ditampilkan | Jika sempat |

Pengaman yang harus tampak di demo:
- Fitur 1 dan 2 punya penolakan jelas untuk diagnosis dan saran medis, dan selalu menawarkan rujukan (Sejiwa 119 ext. 8, Yayasan Pulih, sesuai dokumen).
- Jurnal terenkripsi dan tidak bisa dilihat orang tua/guru.
- Tanpa iklan, tanpa pelacakan komersial, tanpa chat antar anak (sesuai UU PDP, dari dokumen).
- Log keputusan triase supaya bisa diaudit manusia.

## 4. Arsitektur (disederhanakan untuk 1–2 hari)

- **Frontend:** Next.js (PWA) di Cloud Run. PWA supaya bisa dipasang di HP dan latihan napas/grounding **tetap jalan luring** — penting untuk daerah 3T dengan konektivitas buruk. Fitur AI saja yang butuh internet.
- **Backend:** route API Next.js di Cloud Run.
- **Auth + data:** Firebase Auth (peran: anak, pendamping, pelatih) + Firestore. Anak dibuat lewat kode kelas/orang tua, tanpa email anak.
- **AI:** Gemini lewat Vertex AI (cek daftar model terbaru yang tersedia di project). Output terstruktur (JSON schema) untuk triase.
- **RAG:** korpus modul MHFA masih kecil, jadi cukup dimasukkan ke konteks (tanpa vector DB) pada versi hackathon. Catat di deck bahwa produksi akan memakai retrieval.
- **TTS/STT:** Google Cloud Text-to-Speech dan Speech-to-Text (jika sempat).
- **Repo:** GitHub publik sejak awal, commit sering (juri akan melihat repo).

Catatan: pastikan seluruh tumpukan deploy di Google Cloud (Cloud Run/Firebase). Solusi di cloud lain tidak dinilai.

## 5. Lingkup MVP

**Harus ada (demo tanpa ini gagal):**
- Adopsi/pilih teman maskot → check-in cuaca hati (ikon + suara) → rute ke P3K Emosi (latihan napas balon, 90 detik) → cek perasaan setelahnya.
- "Tebak perasaan": permainan latihan mengenali emosi (ikon, suara).
- Lingkaran Aman: kartu "Aku sedang merasa cemas/takut, bisakah kita bicara?" yang mengirim sinyal ke orang dewasa.
- Sisi pendamping: inbox sinyal + Copilot Pendamping (AI #1).
- Triase (AI #2) di balik check-in/jurnal.
- Baku Jaga Academy: 1 modul MHFA berjalan mengikuti pola ToT di proposal ADA (pre-test → modul → post-test → sertifikat sederhana) dan dashboard tren anonim.
- Deploy publik di Cloud Run.

**Sebaiknya:** 1–2 skenario sosial komik bercabang (AI #3), jurnal privat.

**Jangan dikerjakan sekarang:** gamifikasi lengkap, semua 5 modul, chat apa pun untuk anak, multi-bahasa daerah, aplikasi native.

## 6. Pembagian waktu (±37 jam sampai 19 Okt 06:59 WIB; sesuaikan dengan jumlah orang)

| Blok | Isi | Output |
|---|---|---|
| Malam ini (17 Okt) | Selesaikan bagian 0 dan 2. Setup repo, Cloud Run, Firebase, akses Vertex AI. Kerangka Next.js + auth peran | Link deploy kosong yang hidup |
| Sebelum tidur | Desain layar inti (bisa dari dokumen). Dokter menulis/menyetujui konten korpus MHFA ringkas dan aturan triase | Korpus + rubrik triase |
| 18 Okt pagi | Alur anak: check-in, P3K Emosi, Lingkaran Aman. Paralel: Copilot (AI #1) | Alur anak berjalan |
| 18 Okt siang | Triase (AI #2) + inbox pendamping. Academy: 1 modul + dashboard | Loop anak → pendamping berjalan end-to-end |
| 18 Okt sore | Uji dengan skenario nyata, perbaiki pengaman, isi data demo. Mulai deck | Prototipe stabil |
| 18 Okt malam | Rekam video <3 menit, rapikan README, finalisasi deck, submit **beberapa jam sebelum** deadline | Paket submit lengkap |

Prinsip: bekukan fitur baru pada 18 Okt sore. Sisa waktu dipakai merapikan dan rekaman.

## 7. Paket yang dikumpulkan

- [ ] Link prototipe yang berjalan (publik, di Cloud Run).
- [ ] Video demo <3 menit.
- [ ] Repo GitHub publik dengan README (cara menjalankan, arsitektur, penjelasan AI).
- [ ] Deck penjelasan solusi.

**Alur video (±2:45):**
1. 0:00–0:20 masalah (Maluku: sedikit tenaga ahli, literasi rendah, stigma).
2. 0:20–1:10 anak check-in "Badai" → P3K Emosi → kartu Lingkaran Aman.
3. 1:10–1:50 sinyal masuk ke guru; Copilot menjawab dengan kutipan modul; tampil pengaman.
4. 1:50–2:20 Academy: guru dilatih → dashboard tren anonim.
5. 2:20–2:45 dampak, rencana pilot sekolah mitra, penutup.

## 8. Pemetaan ke kriteria penilaian

| Kriteria | Bobot | Cara kita menjawab |
|---|---|---|
| Technical Merit & Gen AI | 40% | Triase terstruktur + copilot RAG dengan kutipan + pengaman berlapis; arsitektur di Cloud Run + Vertex AI; PWA luring. Jelaskan alasan desain "tanpa chat bebas anak" sebagai keputusan teknis, bukan keterbatasan |
| Problem Alignment & Impact | 25% | Data Maluku (kutip dengan sumbernya dari deck referensi), loop anak → orang dewasa terlatih, rencana pilot (hanya sebagai rencana, bukan klaim kemitraan) |
| Innovation & Creativity | 25% | Menyatukan layanan anak dan pelatihan guru dalam satu loop; AI memperluas tenaga ahli, bukan menggantikannya; kearifan lokal "Baku Jaga" |
| UX & Solution Design | 10% | Desain ramah anak, suara maskot, mode luring |

## 9. Dampak: apa yang boleh diklaim

- Kekuatan ilmunya ada di kerangka WHO (HAT/EASE) dan MHFA, bukan di AI. AI adalah pengganda jangkauan, bukan sumber kebenaran klinis.
- **Jangan mengklaim efektivitas klinis.** Belum ada bukti dari produk ini. Ajukan sebagai pilot dengan metrik: jumlah check-in, penyelesaian latihan, waktu dari sinyal sampai respons orang dewasa, dan skor kepercayaan diri guru sebelum/sesudah ToT.
- Sebutkan batas: tidak mendiagnosis, tidak menerapi, selalu merujuk (selaras catatan di deck).
- Kekuatan jangka panjang: model B2G/B2B pasca-program dari deck (social entrepreneurship).

## 10. Risiko

| Risiko | Mitigasi |
|---|---|
| Waktu sempit dan tim hanya 2 orang | Lingkup MVP ketat (lihat bagian 5, potong Academy jadi seminimal mungkin); bekukan fitur 18 Okt sore |
| Mengklaim kemitraan/pilot milik ADA | Atribusi jelas sebagai referensi; sebut rencana pilot hanya sebagai rencana |
| AI memberi respons tidak aman | Tidak ada chat anak; aturan keselamatan di samping model; uji dengan daftar kasus; log audit |
| Juri meragukan keamanan aplikasi anak | Tampilkan pengaman di video dan README |
| Aturan model/tool tidak sesuai dugaan | Baca Challenges & Requirements; tanya panitia (termasuk soal AI coding assistant) |
| Klaim yang tidak bisa dibuktikan | Hanya klaim yang ada di deck/referensi; pilot, bukan hasil |

## 11. Pertanyaan terbuka

1. Tema resmi mana yang dipilih? (Belum dibaca.)
2. SD atau SMA untuk demo utama?
3. Pembagian kerja berdua: siapa yang coding, siapa yang konten/deck/video?
4. Siapa yang memvalidasi korpus MHFA dan rubrik triase? Kalau tidak ada tenaga klinis di tim, cantumkan sumber publik (WHO/UNICEF/MHFA) dan akui keterbatasan itu di deck.

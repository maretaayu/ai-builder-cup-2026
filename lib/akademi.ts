/**
 * Konten Baku Jaga Academy (versi prototipe, dua bahasa).
 *
 * Kerangka "BAKU" di bawah adalah ringkasan sederhana yang disusun dari prinsip umum
 * pertolongan pertama kesehatan mental (MHFA). Ini DRAFT dan wajib divalidasi tenaga
 * profesional sebelum dipakai untuk pelatihan sungguhan.
 */

export type L = { id: string; en: string };

export type Soal = { q: L; opsi: L[]; benar: number; alasan: L };

export const SOAL: Soal[] = [
  {
    q: {
      id: "Seorang siswa kelas 1 menunduk dan berbisik, “Aku takut ke sekolah.” Apa respons pertama yang paling tepat?",
      en: "A first grader looks down and whispers, “I'm scared of school.” What is the best first response?",
    },
    opsi: [
      { id: "“Jangan cengeng, semua anak ke sekolah.”", en: "“Don't be a crybaby, every child goes to school.”" },
      { id: "“Kamu kelihatan takut ya. Mau cerita pelan-pelan?”", en: "“You look scared. Want to tell me slowly?”" },
      { id: "“Nanti juga hilang sendiri.”", en: "“It'll go away on its own.”" },
      { id: "Langsung menelepon orang tua dan menyalahkan mereka.", en: "Call the parents right away and blame them." },
    ],
    benar: 1,
    alasan: {
      id: "Mengakui perasaan dan mengundang anak bercerita membuatnya merasa aman, tanpa menghakimi.",
      en: "Acknowledging the feeling and inviting the child to share helps them feel safe, without judging.",
    },
  },
  {
    q: {
      id: "Seorang anak memukul temannya karena marah. Apa langkah pertama yang paling tepat?",
      en: "A child hits a classmate in anger. What is the best first step?",
    },
    opsi: [
      { id: "Menghukum di depan kelas agar jera.", en: "Punish them in front of the class so they learn." },
      { id: "Menyuruh minta maaf saat itu juga.", en: "Make them apologize right then." },
      { id: "Pastikan semua aman, tenangkan badan dulu (napas pelan), bicara setelah tenang.", en: "Make sure everyone is safe, calm the body first (slow breaths), talk once calm." },
      { id: "Mengabaikan, nanti juga reda.", en: "Ignore it, it will pass." },
    ],
    benar: 2,
    alasan: {
      id: "Anak yang sedang memuncak sulit mendengar. Tenangkan badan dulu, bicarakan setelahnya.",
      en: "A child at the peak of anger can't take things in. Calm the body first, talk afterwards.",
    },
  },
  {
    q: {
      id: "Seorang anak berkata ingin menyakiti dirinya. Apa yang harus dilakukan?",
      en: "A child says they want to hurt themselves. What should you do?",
    },
    opsi: [
      { id: "Tetap bersama anak, tanggapi dengan serius, dan segera libatkan orang dewasa lain serta tenaga kesehatan atau layanan krisis.", en: "Stay with the child, take it seriously, and immediately involve another adult and a health professional or crisis service." },
      { id: "Berjanji merahasiakannya agar anak percaya.", en: "Promise to keep it secret so they trust you." },
      { id: "Menunggu beberapa hari untuk melihat perkembangan.", en: "Wait a few days to see how it develops." },
      { id: "Menyuruh anak melupakan pikiran itu.", en: "Tell the child to forget that thought." },
    ],
    benar: 0,
    alasan: {
      id: "Ini situasi darurat. Anak tidak boleh ditinggal sendirian dan penanganannya tidak boleh ditunda.",
      en: "This is an emergency. The child must not be left alone and help must not be delayed.",
    },
  },
  {
    q: {
      id: "Bolehkah guru mendiagnosis anak yang sering murung?",
      en: "Should a teacher diagnose a child who is often down?",
    },
    opsi: [
      { id: "Ya, guru perlu menentukan gangguannya.", en: "Yes, teachers need to name the condition." },
      { id: "Ya, cukup mencari gejalanya di internet.", en: "Yes, just look up the symptoms online." },
      { id: "Tidak perlu melakukan apa-apa.", en: "No action is needed." },
      { id: "Tidak. Guru memberi pertolongan pertama dan merujuk ke profesional.", en: "No. Teachers give first aid and refer to professionals." },
    ],
    benar: 3,
    alasan: {
      id: "Diagnosis adalah wewenang tenaga profesional. Peran guru: mengenali, mendampingi, dan merujuk.",
      en: "Diagnosis is for professionals. A teacher's role: notice, support, and refer.",
    },
  },
  {
    q: {
      id: "Anak bercerita dirundung dan meminta Anda tidak memberi tahu siapa pun. Apa yang terbaik?",
      en: "A child tells you they are being bullied and asks you not to tell anyone. What is best?",
    },
    opsi: [
      { id: "Berjanji merahasiakannya.", en: "Promise to keep it secret." },
      { id: "Dengarkan, percayai, dan jelaskan dengan lembut bahwa Anda perlu melibatkan orang yang bisa menjaga keselamatannya.", en: "Listen, believe them, and gently explain you need to involve people who can keep them safe." },
      { id: "Menyuruh anak membalas.", en: "Tell the child to fight back." },
      { id: "Menegur pelaku di depan anak tanpa berkoordinasi dengan sekolah.", en: "Confront the other child in front of them without coordinating with the school." },
    ],
    benar: 1,
    alasan: {
      id: "Rahasia tidak boleh dijanjikan bila keselamatan anak terancam. Libatkan pihak sekolah dengan cara yang menjaga rasa aman anak.",
      en: "Never promise secrecy when a child's safety is at risk. Involve the school in a way that keeps the child feeling safe.",
    },
  },
  {
    q: {
      id: "Kapan sebaiknya anak dirujuk ke tenaga kesehatan atau guru BK?",
      en: "When should a child be referred to a health professional or school counselor?",
    },
    opsi: [
      { id: "Hanya jika anak sudah mengaku sakit jiwa.", en: "Only if the child admits to a mental illness." },
      { id: "Bila perasaan berat berlangsung lebih dari dua minggu atau mengganggu makan, tidur, atau sekolah; segera bila ada ucapan menyakiti diri.", en: "When heavy feelings last over two weeks or affect eating, sleeping or school; immediately if there is talk of self-harm." },
      { id: "Tidak pernah, cukup diselesaikan di kelas.", en: "Never, handle it in class." },
      { id: "Setiap kali anak menangis.", en: "Every time a child cries." },
    ],
    benar: 1,
    alasan: {
      id: "Lamanya, dampak pada kegiatan sehari-hari, dan tanda bahaya menjadi dasar merujuk.",
      en: "Duration, impact on daily life, and warning signs are the basis for referral.",
    },
  },
];

export type Kartu = { judul: L; poin: L[] };

export const MATERI: Kartu[] = [
  {
    judul: { id: "Kenali tanda-tandanya", en: "Notice the signs" },
    poin: [
      { id: "Perubahan perilaku yang berlangsung beberapa hari: menarik diri, mudah marah, sering menangis.", en: "Behavior changes lasting several days: withdrawing, quick to anger, crying often." },
      { id: "Keluhan badan tanpa sebab jelas: sakit perut, sakit kepala, dada terasa sesak.", en: "Body complaints with no clear cause: tummy aches, headaches, a tight chest." },
      { id: "Tidak mau ke sekolah atau menjauh dari teman.", en: "Not wanting to go to school or avoiding friends." },
      { id: "Anak kecil sering belum punya kata untuk perasaannya. Gunakan gambar, ikon, atau kartu agar mereka bisa menunjukkan.", en: "Young children often lack words for feelings. Use pictures, icons or cards so they can show you." },
    ],
  },
  {
    judul: { id: "Langkah BAKU", en: "The BAKU steps" },
    poin: [
      { id: "B: Berhenti sejenak dan tenang. Pastikan aman, turunkan nada suara, sejajarkan mata dengan anak.", en: "B: Breathe and pause. Make sure it's safe, lower your voice, get to the child's eye level." },
      { id: "A: Akui perasaannya. “Pasti tidak enak ya.” Tanpa langsung menasihati.", en: "A: Acknowledge the feeling. “That must feel awful.” Without jumping to advice." },
      { id: "K: Kasih dengar tanpa menghakimi. Beri waktu dan jangan memotong.", en: "K: Keep listening without judging. Give time and don't interrupt." },
      { id: "U: Uruskan bantuan. Libatkan orang dewasa lain atau rujuk ke profesional bila perlu.", en: "U: Usher in help. Involve another adult or refer to a professional when needed." },
    ],
  },
  {
    judul: { id: "Yang sebaiknya dihindari", en: "What to avoid" },
    poin: [
      { id: "Menyuruh anak berhenti menangis atau menyebutnya cengeng.", en: "Telling the child to stop crying or calling them a crybaby." },
      { id: "Membandingkan dengan anak lain.", en: "Comparing with other children." },
      { id: "Mendiagnosis atau memberi label (“kamu depresi”).", en: "Diagnosing or labeling (“you're depressed”)." },
      { id: "Berjanji merahasiakan bila keselamatan anak terancam.", en: "Promising secrecy when the child's safety is at risk." },
    ],
  },
  {
    judul: { id: "Kapan dan ke mana merujuk", en: "When and where to refer" },
    poin: [
      { id: "Perasaan berat lebih dari dua minggu, atau mengganggu makan, tidur, dan sekolah: rujuk ke guru BK atau tenaga kesehatan.", en: "Heavy feelings beyond two weeks, or affecting eating, sleeping and school: refer to the school counselor or a health professional." },
      { id: "Ada ucapan menyakiti diri atau kekerasan: bertindak segera, jangan tinggalkan anak sendirian, hubungi layanan krisis.", en: "Talk of self-harm or violence: act immediately, don't leave the child alone, contact a crisis service." },
      { id: "Catat apa yang terjadi, kapan, dan siapa yang dihubungi.", en: "Note what happened, when, and who was contacted." },
      { id: "Materi ini draf dan perlu divalidasi tenaga profesional.", en: "This material is a draft and needs validation by professionals." },
    ],
  },
];

export const SKENARIO: L = {
  id: "Seorang siswa kelas 1 duduk menunduk saat istirahat dan berbisik, “Tidak ada yang mau main sama aku.” Apa yang akan Anda katakan dan lakukan? Tulis dengan kata-kata Anda sendiri.",
  en: "A first grader sits with their head down at recess and whispers, “Nobody wants to play with me.” What would you say and do? Write it in your own words.",
};

export const RUBRIK: { huruf: "B" | "A" | "K" | "U"; nama: L }[] = [
  { huruf: "B", nama: { id: "Berhenti dan tenang", en: "Breathe and pause" } },
  { huruf: "A", nama: { id: "Akui perasaan", en: "Acknowledge the feeling" } },
  { huruf: "K", nama: { id: "Kasih dengar", en: "Keep listening" } },
  { huruf: "U", nama: { id: "Uruskan bantuan", en: "Usher in help" } },
];

/** Data contoh untuk dashboard pelatih (BUKAN hasil nyata): persen benar per soal. */
export const KOHORT_CONTOH = {
  peserta: 25,
  selesai: 21,
  pre: [48, 40, 32, 56, 44, 36],
  post: [92, 88, 84, 96, 88, 80],
};

export function kodeSertifikat(nama: string, ts: number): string {
  let h = 0;
  for (const ch of `${nama}|${ts}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `BJ-${h.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`;
}

/** Data contoh peserta untuk tabel pelatih dan papan peringkat (BUKAN data nyata). */
export const PESERTA_CONTOH: { nama: string; sekolah: string; pre: number; post: number; poin: number }[] = [
  { nama: "Peserta 01", sekolah: "Sekolah A", pre: 2, post: 6, poin: 640 },
  { nama: "Peserta 02", sekolah: "Sekolah A", pre: 3, post: 6, poin: 615 },
  { nama: "Peserta 03", sekolah: "Sekolah B", pre: 2, post: 5, poin: 580 },
  { nama: "Peserta 04", sekolah: "Sekolah B", pre: 1, post: 5, poin: 545 },
  { nama: "Peserta 05", sekolah: "Sekolah C", pre: 3, post: 5, poin: 520 },
  { nama: "Peserta 06", sekolah: "Sekolah C", pre: 2, post: 4, poin: 470 },
  { nama: "Peserta 07", sekolah: "Sekolah A", pre: 4, post: 6, poin: 455 },
  { nama: "Peserta 08", sekolah: "Sekolah B", pre: 2, post: 5, poin: 430 },
];

export type KursusKatalog = {
  id: string;
  judul: L;
  deskripsi: L;
  menit: number;
  level: L;
  tersedia: boolean;
};

export const KATALOG: KursusKatalog[] = [
  {
    id: "baku",
    judul: { id: "Pertolongan Pertama Emosi pada Anak (BAKU)", en: "Emotional First Aid for Children (BAKU)" },
    deskripsi: {
      id: "Mengenali tanda, merespons dengan langkah BAKU, dan merujuk dengan tepat. Termasuk latihan dengan masukan AI.",
      en: "Notice the signs, respond with the BAKU steps, and refer appropriately. Includes practice with AI feedback.",
    },
    menit: 15,
    level: { id: "Dasar", en: "Foundation" },
    tersedia: true,
  },
  {
    id: "rundung",
    judul: { id: "Mengenali dan Menangani Perundungan di Sekolah", en: "Recognizing and Handling Bullying at School" },
    deskripsi: { id: "Tanda perundungan, cara menerima laporan, dan koordinasi dengan sekolah.", en: "Signs of bullying, receiving reports, and coordinating with the school." },
    menit: 20,
    level: { id: "Menengah", en: "Intermediate" },
    tersedia: false,
  },
  {
    id: "rujukan",
    judul: { id: "Pencatatan Kasus dan Alur Rujukan", en: "Case Notes and Referral Pathways" },
    deskripsi: { id: "Mencatat kejadian secara aman dan menghubungi layanan yang tepat.", en: "Recording incidents safely and reaching the right services." },
    menit: 15,
    level: { id: "Menengah", en: "Intermediate" },
    tersedia: false,
  },
  {
    id: "sebaya",
    judul: { id: "Dukungan Teman Sebaya (Peer Support)", en: "Peer Support Skills" },
    deskripsi: { id: "Melatih siswa menjadi pendengar yang aman bagi teman.", en: "Training students to be safe listeners for friends." },
    menit: 25,
    level: { id: "Lanjutan", en: "Advanced" },
    tersedia: false,
  },
];

/** Poin peserta: dihitung dari kemajuan nyata, bukan angka acak. */
export function hitungPoin(a: { pre?: number; post?: number; tahap: string; latihan?: { skor: number } }): number {
  const idx = ["mulai", "pre", "materi", "latihan", "post", "selesai"].indexOf(a.tahap);
  return (
    (a.pre !== undefined ? 50 + a.pre * 10 : 0) +
    (idx >= 3 ? 100 : 0) +
    (a.latihan ? a.latihan.skor * 25 : 0) +
    (a.post !== undefined ? 100 + a.post * 20 : 0) +
    (a.tahap === "selesai" ? 150 : 0)
  );
}

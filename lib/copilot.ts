/**
 * Korpus dan penjawab Copilot Pendamping.
 *
 * Isi di bawah adalah ringkasan awal berbasis kerangka umum pertolongan
 * pertama kesehatan mental (MHFA) dan panduan WHO/UNICEF untuk anak. Ini
 * DRAFT dan wajib divalidasi tenaga profesional sebelum dipakai nyata.
 * Gemini menjawab dari korpus ini (RAG) dan wajib mengutip entri yang dipakai;
 * penolakan diagnosis dan jalur darurat tetap berlaku.
 */

import type { Bahasa } from "./kamus";

export type Isi = {
  judul: string;
  ringkas: string;
  langkah: string[];
  hindari: string[];
  rujuk: string;
  sumber: string;
  /** kalimat pendek yang bisa langsung diucapkan kepada anak */
  kalimat: string[];
};

export type Entri = {
  id: string;
  /** kata kunci (Indonesia dan Inggris) untuk pencocokan dasar */
  kata: string[];
  darurat?: boolean;
  isi: Record<Bahasa, Isi>;
};

export const KORPUS: Entri[] = [
  {
    id: "sinyal",
    kata: ["sinyal", "kartu", "bicara", "minta tolong", "lingkaran", "signal", "card", "talk", "ask for help"],
    isi: {
      id: {
        judul: "Anak menunjukkan kartu 'bisakah kita bicara'",
        ringkas:
          "Anak memilih Anda karena percaya. Respons pertama yang tenang dan hangat lebih penting daripada langsung mencari penyebab.",
        langkah: [
          "Berhenti sejenak, jongkok sejajar mata anak, dan ucapkan terima kasih sudah memberi tahu.",
          "Tanyakan terbuka dan singkat: 'Mau cerita apa yang kamu rasakan?' Beri waktu, jangan memotong.",
          "Akui perasaannya: 'Pasti tidak enak ya.' Hindari langsung menasihati atau menyelesaikan masalah.",
          "Tawarkan menenangkan badan bersama (tarik napas pelan) bila anak masih gelisah.",
          "Catat apa yang terjadi dan kapan, lalu beri tahu orang dewasa lain yang bertanggung jawab (guru BK/orang tua) bila perlu.",
        ],
        hindari: ["Menyuruh anak berhenti menangis.", "Menyalahkan atau membandingkan dengan anak lain.", "Berjanji menjaga rahasia bila ada risiko keselamatan."],
        rujuk: "Bila perasaan berat berlangsung berhari-hari atau mengganggu makan, tidur, atau sekolah, ajak bicara dengan guru BK atau tenaga kesehatan.",
        sumber: "Kerangka MHFA: dengarkan tanpa menghakimi, beri dukungan dan harapan",
        kalimat: ["Terima kasih sudah bilang. Aku di sini.", "Kamu kelihatan tidak nyaman. Mau cerita pelan-pelan?", "Kita tarik napas dulu bareng, ya."],
      },
      en: {
        judul: "A child shows the 'can we talk' card",
        ringkas:
          "The child chose you because they trust you. A calm, warm first response matters more than finding the cause right away.",
        langkah: [
          "Pause, crouch to the child's eye level, and thank them for telling you.",
          "Ask openly and briefly: 'Do you want to tell me how you feel?' Give them time and don't interrupt.",
          "Acknowledge the feeling: 'That must feel awful.' Avoid lecturing or jumping to fix the problem.",
          "Offer to calm the body together (slow breaths) if the child is still restless.",
          "Note what happened and when, then tell another responsible adult (school counselor/parent) if needed.",
        ],
        hindari: ["Telling the child to stop crying.", "Blaming or comparing with other children.", "Promising to keep a secret when safety is at risk."],
        rujuk: "If heavy feelings last for days or affect eating, sleeping or school, involve the school counselor or a health professional.",
        sumber: "MHFA framework: listen without judging, give support and hope",
        kalimat: ["Thank you for telling me. I'm here.", "You look uncomfortable. Want to tell me slowly?", "Let's take a breath together first."],
      },
    },
  },
  {
    id: "marah",
    kata: ["marah", "memukul", "badai", "mengamuk", "tantrum", "agresif", "angry", "hit", "hits", "hitting", "aggressive", "outburst"],
    isi: {
      id: {
        judul: "Anak sering marah atau memukul",
        ringkas:
          "Pada anak kecil, marah sering menutupi sedih, takut, atau lelah. Tenangkan badan dulu, bicara setelahnya.",
        langkah: [
          "Pastikan anak dan sekitarnya aman; jaga nada suara rendah dan pelan.",
          "Ajak menarik napas pelan bersama (tarik 4 hitungan, hembuskan 4 hitungan). Aplikasi punya latihan Napas Balon.",
          "Setelah tenang, beri nama perasaannya: 'Kamu tadi sangat kesal ya.'",
          "Bicarakan pilihan lain saat marah: napas dulu, bilang 'aku tidak suka', atau minta tolong orang dewasa.",
        ],
        hindari: ["Menghukum saat anak sedang memuncak.", "Berteriak balik."],
        rujuk: "Bila perilaku melukai diri atau orang lain sering berulang, konsultasikan dengan guru BK atau psikolog.",
        sumber: "Panduan regulasi emosi anak (EASE/WHO), kerangka MHFA",
        kalimat: ["Kamu tadi kesal sekali ya. Kita tenangkan badan dulu.", "Boleh marah, tapi tidak boleh memukul. Yuk tarik napas.", "Nanti kalau sudah tenang, ceritakan apa yang terjadi."],
      },
      en: {
        judul: "A child often gets angry or hits others",
        ringkas:
          "In young children, anger often covers sadness, fear or tiredness. Calm the body first, talk afterwards.",
        langkah: [
          "Make sure the child and others are safe; keep your voice low and slow.",
          "Invite slow breathing together (in for 4 counts, out for 4). The app has a Balloon Breathing exercise.",
          "Once calm, name the feeling: 'You were really upset just now.'",
          "Talk about other choices when angry: breathe first, say 'I don't like that', or ask a grown-up for help.",
        ],
        hindari: ["Punishing at the peak of the outburst.", "Shouting back."],
        rujuk: "If behavior that hurts the child or others keeps repeating, consult the school counselor or a psychologist.",
        sumber: "Child emotion regulation guidance (EASE/WHO), MHFA framework",
        kalimat: ["You were really upset just now. Let's calm our bodies first.", "It's okay to be angry, but we don't hit. Let's breathe.", "When you're calm, tell me what happened."],
      },
    },
  },
  {
    id: "menarik-diri",
    kata: ["menarik diri", "menangis", "murung", "diam", "sedih", "hujan", "menyendiri", "withdrawn", "cries", "crying", "quiet", "sad", "isolates", "alone"],
    isi: {
      id: {
        judul: "Anak menarik diri atau sering menangis",
        ringkas:
          "Perubahan perilaku yang berlangsung beberapa hari layak diperhatikan. Anda tidak perlu menebak penyebabnya.",
        langkah: [
          "Hampiri dengan tenang dan sebutkan yang Anda lihat: 'Akhir-akhir ini kamu lebih sering diam.'",
          "Tanyakan dengan terbuka dan beri pilihan cara bercerita (bicara, menggambar, atau menunjuk kartu).",
          "Tanyakan hal sederhana: bagaimana tidur, makan, dan pertemanan di sekolah.",
          "Pantau beberapa hari lewat tren di aplikasi; bagikan kepada orang tua/guru yang relevan.",
        ],
        hindari: ["Memaksa anak bercerita.", "Mendiagnosis ('kamu depresi')."],
        rujuk: "Bila berlangsung lebih dari dua minggu, atau disertai tidak mau makan, sulit tidur, atau tidak mau ke sekolah, rujuk ke tenaga kesehatan.",
        sumber: "Kerangka MHFA: perhatikan perubahan, dekati, dukung rujukan profesional",
        kalimat: ["Akhir-akhir ini kamu lebih sering diam. Aku peduli sama kamu.", "Mau cerita, atau mau menggambar dulu? Dua-duanya boleh.", "Kamu tidak sendirian, ya."],
      },
      en: {
        judul: "A child withdraws or cries often",
        ringkas:
          "Behavior changes that last several days deserve attention. You don't need to guess the cause.",
        langkah: [
          "Approach calmly and say what you see: 'Lately you've been quieter.'",
          "Ask openly and offer ways to share (talking, drawing, or pointing to a card).",
          "Ask simple things: how they sleep, eat, and get along with friends at school.",
          "Watch for a few days using the app's trends; share with the relevant parent/teacher.",
        ],
        hindari: ["Forcing the child to talk.", "Diagnosing ('you're depressed')."],
        rujuk: "If it lasts more than two weeks, or comes with not eating, trouble sleeping or refusing school, refer to a health professional.",
        sumber: "MHFA framework: notice changes, approach, support professional referral",
        kalimat: ["Lately you've been quieter. I care about you.", "Do you want to talk, or draw first? Both are okay.", "You're not alone."],
      },
    },
  },
  {
    id: "dirundung",
    kata: ["bullying", "dirundung", "diejek", "ditertawakan", "perundungan", "dijauhi", "diganggu", "bullied", "teased", "teasing", "excluded", "mocked"],
    isi: {
      id: {
        judul: "Dugaan perundungan (bullying)",
        ringkas:
          "Anak kecil sering belum punya kata untuk perundungan. Utamakan rasa aman dan hubungi pihak sekolah.",
        langkah: [
          "Dengarkan, percayai, dan katakan bahwa itu bukan salah anak.",
          "Catat kejadian: kapan, di mana, siapa yang terlibat, tanpa menginterogasi anak.",
          "Laporkan ke wali kelas atau guru BK sesuai prosedur sekolah.",
          "Ajarkan anak kalimat tegas dan ramah: 'Aku tidak suka. Berhenti.' serta kapan harus melapor.",
        ],
        hindari: ["Menyuruh anak membalas.", "Menegur pelaku di depan anak tanpa koordinasi sekolah."],
        rujuk: "Libatkan guru BK. Bila ada kekerasan fisik atau seksual, segera lapor ke pihak berwenang dan layanan perlindungan anak.",
        sumber: "Panduan pencegahan kekerasan dan perundungan (WHO/UNICEF)",
        kalimat: ["Itu bukan salahmu. Terima kasih sudah cerita.", "Aku percaya sama kamu. Kita cari cara supaya kamu aman.", "Kalau diejek lagi, bilang: Aku tidak suka. Berhenti."],
      },
      en: {
        judul: "Suspected bullying",
        ringkas:
          "Young children often lack the words for bullying. Put safety first and involve the school.",
        langkah: [
          "Listen, believe them, and tell them it is not their fault.",
          "Note the incident: when, where, who was involved, without interrogating the child.",
          "Report to the homeroom teacher or school counselor following school procedure.",
          "Teach a firm, kind sentence: 'I don't like that. Stop.' and when to report.",
        ],
        hindari: ["Telling the child to fight back.", "Confronting the other child in front of them without school coordination."],
        rujuk: "Involve the school counselor. If there is physical or sexual violence, report immediately to the authorities and child protection services.",
        sumber: "Guidance on preventing violence and bullying (WHO/UNICEF)",
        kalimat: ["That isn't your fault. Thank you for telling me.", "I believe you. Let's find a way to keep you safe.", "If it happens again, say: I don't like that. Stop."],
      },
    },
  },
  {
    id: "sakit-badan",
    kata: ["sakit perut", "sakit kepala", "dada", "perut", "badan", "tidak mau sekolah", "cemas", "tummy", "stomach", "headache", "chest", "anxious", "worried", "refuses school", "school refusal"],
    isi: {
      id: {
        judul: "Sering sakit perut/kepala tanpa sebab jelas",
        ringkas:
          "Pada anak kecil, rasa cemas sering muncul sebagai keluhan badan. Keluhannya nyata, jangan dianggap pura-pura.",
        langkah: [
          "Tanggapi keluhan dengan serius dan pastikan tidak ada masalah medis yang perlu diperiksa.",
          "Ajak mengenali: 'Perutmu terasa bagaimana? Kapan biasanya muncul?'",
          "Latih napas pelan bersama sebelum situasi yang membuat cemas (berangkat sekolah).",
          "Bicarakan dengan guru bila keluhan selalu muncul pada situasi tertentu.",
        ],
        hindari: ["Mengatakan 'itu cuma perasaanmu'."],
        rujuk: "Periksakan ke tenaga kesehatan bila keluhan berulang. Bila ada kaitan jelas dengan situasi tertentu, bicarakan dengan guru BK.",
        sumber: "Panduan kesehatan mental anak (WHO), kerangka MHFA",
        kalimat: ["Perutmu sakit ya. Aku percaya itu terasa nyata.", "Kapan biasanya sakitnya muncul?", "Yuk tarik napas pelan sebelum berangkat."],
      },
      en: {
        judul: "Frequent tummy aches or headaches with no clear cause",
        ringkas:
          "In young children, anxiety often shows up as body complaints. The complaints are real, don't treat them as pretending.",
        langkah: [
          "Take the complaint seriously and make sure no medical problem needs checking.",
          "Help them notice: 'How does your tummy feel? When does it usually happen?'",
          "Practice slow breathing together before stressful moments (leaving for school).",
          "Talk with the teacher if the complaints always appear in particular situations.",
        ],
        hindari: ["Saying 'it's just in your head'."],
        rujuk: "See a health professional if complaints keep returning. If clearly linked to certain situations, talk with the school counselor.",
        sumber: "Child mental health guidance (WHO), MHFA framework",
        kalimat: ["Your tummy hurts. I believe it feels real.", "When does it usually start?", "Let's take slow breaths before we leave."],
      },
    },
  },
  {
    id: "bahaya",
    kata: ["bunuh diri", "menyakiti diri", "tidak mau hidup", "ingin mati", "melukai diri", "tidak ingin hidup", "suicide", "hurt themselves", "hurt himself", "hurt herself", "self-harm", "self harm", "want to die", "don't want to live", "dont want to live", "kill myself", "kill themselves"],
    darurat: true,
    isi: {
      id: {
        judul: "Anak bicara ingin menyakiti diri atau tidak ingin hidup",
        ringkas:
          "Ini situasi yang harus ditanggapi segera dan dengan serius. Jangan menanganinya sendirian.",
        langkah: [
          "Tetap tenang, tetap bersama anak, dan jangan tinggalkan anak sendirian.",
          "Dengarkan tanpa menghakimi dan tanyakan langsung dengan lembut tentang apa yang ia pikirkan.",
          "Singkirkan benda berbahaya di sekitar dengan wajar.",
          "Segera hubungi orang dewasa penanggung jawab lain, tenaga kesehatan, atau layanan krisis.",
        ],
        hindari: ["Meremehkan ('ah, masa begitu').", "Berjanji merahasiakan.", "Menunda sampai besok."],
        rujuk: "Hubungi layanan kesehatan jiwa atau layanan darurat setempat sekarang. Layanan Sejiwa 119 ext. 8 (cantumkan nomor yang sudah diverifikasi sebelum dipakai).",
        sumber: "Kerangka MHFA: krisis, tanggapi segera dan rujuk",
        kalimat: ["Aku di sini bersamamu. Aku tidak akan meninggalkanmu sendirian.", "Terima kasih sudah bilang. Itu berani sekali.", "Kita cari orang yang bisa membantu sekarang."],
      },
      en: {
        judul: "A child talks about hurting themselves or not wanting to live",
        ringkas:
          "This must be taken seriously and responded to right away. Don't handle it alone.",
        langkah: [
          "Stay calm, stay with the child, and don't leave them alone.",
          "Listen without judging and gently ask directly about what they are thinking.",
          "Calmly remove dangerous objects nearby.",
          "Immediately contact another responsible adult, a health professional, or a crisis service.",
        ],
        hindari: ["Dismissing it ('oh, you don't mean that').", "Promising to keep it secret.", "Waiting until tomorrow."],
        rujuk: "Contact a mental health service or local emergency service now. Sejiwa 119 ext. 8 in Indonesia (verify the number before real use).",
        sumber: "MHFA framework: crisis, respond immediately and refer",
        kalimat: ["I'm here with you. I won't leave you alone.", "Thank you for telling me. That was very brave.", "Let's find someone who can help right now."],
      },
    },
  },
];

export type Jawaban = Isi & {
  darurat: boolean;
  cocok: boolean;
  /** asal jawaban: model (dari korpus) atau pencocokan korpus tanpa model */
  oleh?: "gemini" | "korpus";
};

const PENOLAKAN: Record<Bahasa, string> = {
  id: "Saya tidak bisa mendiagnosis atau menentukan penyebab kondisi anak. Saya hanya membantu langkah pertolongan pertama dan kapan merujuk ke profesional.",
  en: "I can't diagnose or determine the cause of a child's condition. I can only help with first-aid steps and when to refer to a professional.",
};

const TIDAK_ADA: Record<Bahasa, { judul: string; ringkas: string; rujuk: string }> = {
  id: {
    judul: "Belum ada panduan yang cocok",
    ringkas: "Coba ceritakan yang Anda lihat pada perilaku anak, misalnya marah, menarik diri, sakit perut, atau dugaan perundungan.",
    rujuk: "Bila ragu soal keselamatan anak, hubungi guru BK atau tenaga kesehatan.",
  },
  en: {
    judul: "No matching guidance yet",
    ringkas: "Try describing what you see in the child's behavior, for example anger, withdrawal, tummy aches, or suspected bullying.",
    rujuk: "If you're unsure about the child's safety, contact the school counselor or a health professional.",
  },
};

export function jawab(pertanyaan: string, lang: Bahasa = "id"): Jawaban {
  const q = pertanyaan.toLowerCase();
  let terbaik: Entri | null = null;
  let skor = 0;
  for (const e of KORPUS) {
    const s = e.kata.reduce((n, k) => (q.includes(k) ? n + (k.includes(" ") ? 2 : 1) : n), 0);
    if (e.darurat && s > 0) {
      terbaik = e;
      skor = 99;
      break;
    }
    if (s > skor) {
      terbaik = e;
      skor = s;
    }
  }
  if (!terbaik) {
    const m = TIDAK_ADA[lang];
    return {
      judul: m.judul,
      ringkas: `${PENOLAKAN[lang]} ${m.ringkas}`,
      langkah: [],
      hindari: [],
      rujuk: m.rujuk,
      sumber: "-",
      kalimat: [],
      darurat: false,
      cocok: false,
    };
  }
  return { ...terbaik.isi[lang], darurat: !!terbaik.darurat, cocok: true };
}

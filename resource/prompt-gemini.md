# Prompt Gemini: Aset Ilustrasi Teman Ada (Style Geometric Flat Avatar)

Gaya visual ini menggunakan **modern geometric flat vector animal avatar icon** (lineless / tanpa garis tepi tebal / tanpa sticker border, dengan efek *vertical split-tone flat shading* di bagian tengah seperti referensi).

---

## 🔑 Aturan Emas Konsistensi
1. **Satu chat untuk satu karakter**:
   - Chat 1: Badak (Master Senang ➔ ganti ekspresi)
   - Chat 2: Nuri (Master Senang ➔ ganti ekspresi)
   - Chat 3: Penyu (Master Senang ➔ ganti ekspresi)
2. **Gunakan Master sebagai Image Reference**:
   Setelah gambar ekspresi `senang` jadi, **download gambarnya lalu upload kembali ke chat yang sama** sebagai gambar referensi untuk membuat 4 ekspresi lainnya.
3. Semua gambar di-generate di **latar putih polos** (`solid pure white background`), lalu latar belakangnya dihapus otomatis dengan script:
   ```bash
   python3 scratch_remove_bg.py <path_gambar_input.jpg> public/karakter/<nama_file.png>
   ```

---

## 🎨 Blok Gaya (Tempel di awal setiap prompt Master)

```text
STYLE: Modern geometric flat vector animal avatar icon. Lineless flat vector design with NO black outlines, NO borders, NO sticker cutlines. Symmetrical rounded geometric head shape with a subtle vertical split-tone flat shading down the center (left half slightly lighter, right half slightly darker tone). Friendly, clean, warm color palette. Solid pure white background (#FFFFFF), centered head avatar icon, square 1:1.
```

---

## Langkah 1: Master Tiap Karakter (Ekspresi Senang)

### 1. Badak (Boni) ➔ `badak-senang.png`
```text
STYLE: Modern geometric flat vector animal avatar icon. Lineless flat vector design with NO black outlines, NO borders, NO sticker cutlines. Symmetrical rounded geometric head shape with a subtle vertical split-tone flat shading down the center (left half slightly lighter, right half slightly darker tone). Friendly, clean, warm color palette. Solid pure white background (#FFFFFF), centered head avatar icon, square 1:1.

CHARACTER: "Boni", a cute baby Javan rhinoceros:
- Soft blue-grey / slate blue skin tone (#6B8EB8 and #5A7EA8 split-tone)
- A cute rounded golden-yellow horn (#F5A623) on the snout
- Small rounded ears with soft pink inner ears
- Large friendly circular eyes with layered dark iris and small white sparkle highlights
- Cute snout with two small nostril dots and a cheerful happy open smile
```

---

### 2. Nuri ➔ `nuri-senang.png`
```text
STYLE: Modern geometric flat vector animal avatar icon. Lineless flat vector design with NO black outlines, NO borders, NO sticker cutlines. Symmetrical rounded geometric head shape with a subtle vertical split-tone flat shading down the center (left half slightly lighter, right half slightly darker tone). Friendly, clean, warm color palette. Solid pure white background (#FFFFFF), centered head avatar icon, square 1:1.

CHARACTER: A cute Maluku red lory (nuri merah) parrot:
- Bright crimson-coral red feathers (#E84B3A and #D13B2B split-tone)
- A small yellow-orange tuft/crest feather on top of the head
- Short curved golden-yellow beak (#F5A623)
- Soft cream/pale-yellow patch around the eyes
- Big friendly circular glossy eyes with white highlights
- Expression: very cheerful and happy smile
```

---

### 3. Penyu ➔ `penyu-senang.png`
```text
STYLE: Modern geometric flat vector animal avatar icon. Lineless flat vector design with NO black outlines, NO borders, NO sticker cutlines. Symmetrical rounded geometric head shape with a subtle vertical split-tone flat shading down the center (left half slightly lighter, right half slightly darker tone). Friendly, clean, warm color palette. Solid pure white background (#FFFFFF), centered head avatar icon, square 1:1.

CHARACTER: A cute baby green sea turtle (penyu hijau):
- Soft sage / mint-green skin tone (#72C596 and #5DB282 split-tone)
- Cute rounded head with smooth friendly silhouette
- Subtle dark emerald green shell rim visible softly behind the neck
- Gentle, warm friendly circular eyes with bright catchlights
- Expression: sweet, gentle, happy smile
```

---

## Langkah 2: Membuat 4 Ekspresi Lainnya

> ⚠️ **PENTING**: Di chat yang sama, **unggah gambar master (senang)** karakter tersebut sebagai referensi, lalu gunakan template prompt berikut:

```text
Use the attached image as the exact reference.
Keep the SAME character, same head shape, same split-tone colors, same features, same lineless geometric flat vector art style, and same solid pure white background (#FFFFFF).
Change ONLY the facial expression to: [PILIH SALAH SATU DI BAWAH]
```

### Variasi Ekspresi:

#### 1. Sedih (`-sedih.png`)
```text
SAD: Eyebrows tilted upward in the center, big round eyes looking slightly glossy and teary with one small cute blue teardrop on the cheek, small downturned frowning mouth.
```

#### 2. Marah (`-marah.png`)
```text
ANGRY (cute child-friendly pout, not scary): Eyebrows slanting firmly downward toward the center, eyes slightly narrower and focused, slightly puffed cheeks with a small pouting frowning mouth.
```

#### 3. Bingung (`-bingung.png`)
```text
CONFUSED: One eyebrow raised higher than the other, eyes looking slightly sideways/upward with curiosity, small quirky wavy or tilted mouth.
```

#### 4. Tenang (`-tenang.png`)
```text
CALM / RELAXED: Eyes gently closed as two soft downward-curved happy arc lines, serene peaceful expression, soft gentle closed smile.
```

---

## Ringkasan 15 File Target (`public/karakter/`)

| Karakter | senang | sedih | marah | bingung | tenang |
|---|---|---|---|---|---|
| **Badak** | `badak-senang.png` ✅ | `badak-sedih.png` ✅ | `badak-marah.png` ✅ | `badak-bingung.png` ✅ | `badak-tenang.png` ✅ |
| **Nuri** | `nuri-senang.png` ✅ | `nuri-sedih.png` ✅ | `nuri-marah.png` ✅ | `nuri-bingung.png` ✅ | `nuri-tenang.png` ✅ |
| **Penyu** | `penyu-senang.png` ✅ | `penyu-sedih.png` ✅ | `penyu-marah.png` ✅ | `penyu-bingung.png` ✅ | `penyu-tenang.png` ✅ |

---

## 🪄 Script Otomatis Menghapus Latar Putih

Setelah gambar di-download dari Gemini, letakkan di folder mana saja (misal `public/karakter/raw/`), lalu jalankan:

```bash
# Contoh untuk memproses satu gambar:
python3 scratch_remove_bg.py path_ke_gambar.jpg public/karakter/badak-marah.png

# Atau proses sekaligus semua file .jpg di dalam folder:
python3 -c "
import os, glob
from scratch_remove_bg import remove_background
for f in glob.glob('public/karakter/raw/*.jpg') + glob.glob('public/karakter/raw/*.png'):
    name = os.path.splitext(os.path.basename(f))[0]
    out = f'public/karakter/{name}.png'
    remove_background(f, out)
"
```

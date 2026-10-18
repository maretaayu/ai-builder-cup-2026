# Firestore Rules Final: Teman Ada

Isi di bawah identik dengan `firestore.rules`. Salin ke Firebase Console (Firestore > Rules > Publish),
atau deploy dari terminal: `firebase deploy --only firestore:rules`.

```
rules_version = '2';

// Aturan keamanan Teman Ada.
// Prinsip: tidak ada data yang terbuka untuk publik. Satu anak = satu ruang dengan kode 6 karakter acak.
// Kode berfungsi sebagai kunci masuk bagi perangkat anak; hanya pemilik ruang (orang tua) yang dapat
// membaca sinyal, cek cuaca hati, dan progres belajar anak.
service cloud.firestore {
  match /databases/{database}/documents {

    function masuk() { return request.auth != null; }
    function dewasa() { return masuk() && request.auth.token.firebase.sign_in_provider != 'anonymous'; }
    function pemilik(kode) {
      return dewasa() && get(/databases/$(database)/documents/rooms/$(kode)).data.ownerUid == request.auth.uid;
    }

    // Profil: hanya pemiliknya.
    match /users/{uid} {
      allow read, write: if masuk() && request.auth.uid == uid;
    }

    match /rooms/{kode} {
      // Mengetahui kode ruang cukup untuk melihat namanya (dipakai saat anak bergabung).
      allow get: if masuk();
      // Orang tua hanya dapat mendaftar ruang miliknya sendiri (query where ownerUid == uid).
      allow list: if dewasa() && resource.data.ownerUid == request.auth.uid;
      allow create: if dewasa()
        && request.resource.data.ownerUid == request.auth.uid
        && request.resource.data.nama is string
        && request.resource.data.nama.size() <= 60;
      // Pemilik tidak dapat menyerahkan ruang ke akun lain.
      allow update: if pemilik(kode)
        && request.resource.data.ownerUid == resource.data.ownerUid
        && request.resource.data.nama is string
        && request.resource.data.nama.size() <= 60;
      allow delete: if pemilik(kode);

      // Perangkat anak yang terhubung beserta progres belajarnya.
      match /anggota/{uid} {
        allow create, update: if masuk() && request.auth.uid == uid
          && request.resource.data.keys().hasOnly(['nama', 'species', 'stars', 'progres', 'aktifTs', 'ts'])
          && (!('nama' in request.resource.data) || (request.resource.data.nama is string && request.resource.data.nama.size() <= 30))
          && (!('species' in request.resource.data) || request.resource.data.species in ['badak', 'nuri', 'penyu'])
          && (!('stars' in request.resource.data) || (request.resource.data.stars is number && request.resource.data.stars >= 0 && request.resource.data.stars <= 100000))
          && (!('progres' in request.resource.data) || request.resource.data.progres is map)
          && (!('aktifTs' in request.resource.data) || request.resource.data.aktifTs is number);
        allow read: if masuk() && (request.auth.uid == uid || pemilik(kode));
      }

      match /signals/{id} {
        allow create: if masuk()
          && request.resource.data.anakUid == request.auth.uid
          && request.resource.data.status == 'baru';
        allow read: if masuk() && (resource.data.anakUid == request.auth.uid || pemilik(kode));
        // Anak hanya melengkapi analisis sinyalnya; orang tua hanya mengubah status tanggapan.
        allow update: if masuk() && (
          (resource.data.anakUid == request.auth.uid
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['level', 'alasan', 'saran', 'ai']))
          || (pemilik(kode)
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']))
        );
        allow delete: if pemilik(kode);
      }

      match /checkins/{id} {
        allow create: if masuk() && request.resource.data.anakUid == request.auth.uid;
        allow read: if masuk() && (resource.data.anakUid == request.auth.uid || pemilik(kode));
        allow update, delete: if false;
      }
    }

    // Hasil Academy: setiap peserta menulis miliknya; sesama pengguna dewasa dapat membaca untuk dashboard pelatih.
    match /akademi/{uid} {
      allow read: if dewasa();
      allow write: if dewasa() && request.auth.uid == uid;
    }

    match /{semua=**} {
      allow read, write: if false;
    }
  }
}
```

## Perubahan dari versi sebelumnya

| Area | Perubahan |
|------|-----------|
| `rooms` list | Dari `if false` menjadi `dewasa() && resource.data.ownerUid == request.auth.uid`, agar orang tua bisa melihat daftar anaknya. Query harus memakai `where("ownerUid", "==", uid)`. |
| `rooms` update | `ownerUid` tidak bisa diubah, `nama` wajib string maksimal 60 karakter. |
| `anggota` | Hanya field `nama`, `species`, `stars`, `progres`, `aktifTs`, `ts` yang boleh ditulis, dengan tipe dan batas nilai. |
| `signals` create | Status awal wajib `baru`. |
| `signals` update | Anak hanya boleh mengubah `level`, `alasan`, `saran`, `ai`. Orang tua hanya boleh mengubah `status`. |

## Catatan

- Aturan belum diuji di emulator. Setelah publish, coba alur lengkap: buat kode anak, gabung dari perangkat anak, kirim sinyal, lihat progres, tandai sinyal ditanggapi.
- `akademi` masih terbaca oleh semua akun dewasa (sengaja, untuk dashboard pelatih). Batasi ke akun pelatih bila data mulai nyata.
- Kode ruang 6 karakter bisa ditebak lewat brute force. Risikonya kecil karena ruang kosong tidak membocorkan data, tapi tetap batasi bila dipakai luas.
- Menghapus ruang tidak menghapus subkoleksinya (`anggota`, `signals`, `checkins`).

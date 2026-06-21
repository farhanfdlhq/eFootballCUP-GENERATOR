# eFootball Cup Generator

Sebuah *web application* sederhana berbasis Vanilla HTML, CSS, dan JavaScript untuk komunitas eFootball. Aplikasi ini memungkinkan pengguna membuat bagan turnamen (*Knockout/Bracket*) secara cepat, responsif, dan interaktif langsung dari *browser*, tanpa memerlukan koneksi API yang rumit.

## Fitur Utama

- **Sistem Turnamen Gugur (*Knockout*)**: Otomatis mengatur sistem *seeding* dan membuat slot "BYE" apabila jumlah peserta ganjil.
- **Interaktif (Click-to-Advance)**: Pengguna cukup mengklik nama tim/peserta pada bagan untuk memindahkan mereka ke babak selanjutnya.
- **Perebutan Juara 3**: Terdapat opsi sakelar untuk mengaktifkan perebutan tempat ketiga dari tim yang kalah di ronde semifinal.
- **Pertandingan 2 Leg (Kandang-Tandang)**: Terdapat sakelar untuk menampilkan label "2 Leg" untuk turnamen berformat agregat.
- **Responsif dan Nyaman di Layar Sentuh**: Mendukung fitur *drag & pan* (geser bagan) serta pengaturan *Zoom* (+/-) yang dioptimalkan untuk pengguna Mobile.
- **Desain Premium (eFootball Theme)**: Skema warna (Navy & Yellow Gold) dan antarmuka (*glassmorphism*) yang elegan dan sejalan dengan identitas visual eFootball.

## Cara Menggunakan

1. Buka file `index.html` pada *browser* apa saja (Google Chrome, Safari, Firefox).
2. Tentukan jumlah peserta turnamen. (Minimal 4 pemain).
3. Masukkan nama masing-masing peserta di kolom yang tersedia.
4. Sesuaikan opsi turnamen: *2 Leg*, *Perebutan Juara 3*, atau *Acak Posisi*.
5. Klik tombol **Generate Bagan**.
6. Gunakan kursor atau usap layar sentuh untuk menggeser (*pan*) bagan. Klik nama pemenang pertandingan untuk memajukannya ke babak selanjutnya hingga didapatkan Juara Utama.

## Teknologi yang Digunakan

- HTML5 (Semantic Structure)
- CSS3 (Vanilla CSS, CSS Flexbox/Grid, Transform & Zoom)
- Vanilla JavaScript (DOM Manipulation, Bracket generation algorithm)

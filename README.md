# 🏆 eFootball Cup Generator

Alat pamungkas berbasis web untuk membuat dan mengelola bagan turnamen *eFootball* (atau game *esports* lainnya) bersama teman-teman komunitas (Mabar).

Aplikasi ini dirancang menggunakan Vanilla HTML/CSS/JS tanpa *framework* berat, namun dilengkapi dengan fitur kelas atas yang mensimulasikan manajemen turnamen sesungguhnya.

## ✨ Fitur Unggulan

- **🚀 3 Mode Turnamen Interaktif**:
  1. **Sistem Gugur (Knockout)**: Bagan turnamen klasik layaknya Liga Champions. Sistem gugur dengan *seeding* otomatis.
  2. **Klasemen Liga (Round Robin)**: Sistem poin penuh di mana semua tim saling bertemu. Tabel klasemen ter-update secara *real-time*.
  3. **Fase Grup + Knockout (World Cup Style)**: Peserta dipecah ke beberapa grup, klasemen dihitung, lalu Juara & Runner-up otomatis melaju ke bagan sistem gugur!
- **🌐 Bilingual (ID & EN)**: Mendukung Bahasa Indonesia dan Bahasa Inggris secara langsung tanpa perlu *reload* halaman.
- **💾 Auto-Save (Save & Resume)**: Menggunakan teknologi `localStorage`. Progres turnamen dan skor tidak akan hilang meskipun *browser* tertutup atau ter-refresh.
- **📸 Export to Image**: Tombol praktis untuk langsung mengunduh/menyimpan bagan atau papan klasemen menjadi gambar beresolusi tinggi (PNG) untuk di-share ke grup WhatsApp.
- **📱 Mobile Friendly & Interaktif**: Mendukung kontrol layar sentuh (*Pan & Zoom*) pada bagan yang besar. Tampilan sangat presisi untuk layar HP.
- **⚽ Aturan Sepakbola Asli**: Menyediakan opsi "2 Leg (Kandang-Tandang)" serta laga khusus "Perebutan Juara 3".

## 🛠️ Teknologi yang Digunakan

- **Frontend Core**: HTML5, CSS3, JavaScript (ES6+).
- **Library Tambahan**: [html2canvas](https://html2canvas.hertzen.com/) (Untuk mengekspor tampilan UI menjadi gambar PNG).
- **Desain**: Tema *Dark Mode* Premium (*Navy Blue & Gold*) dengan estetika khas *eFootball*, *Glassmorphism*, dan tipografi modern *Google Fonts (Outfit)*.

## 🚀 Cara Menjalankan Proyek (Local)

1. *Clone repository* ini:
   ```bash
   git clone https://github.com/farhanfdlhq/eFootballCUP-GENERATOR.git
   ```
2. Buka folder proyek hasil clone tersebut.
3. Karena ini menggunakan Vanilla JS murni, Anda bisa langsung melakukan klik ganda (*double click*) pada file `index.html` dan membukanya di *browser* apa saja (Chrome/Safari).
4. (Opsional) Untuk pengalaman pengembangan terbaik, jalankan menggunakan ekstensi **Live Server** di VS Code.

## 🌐 Live Demo
👉 **[Mainkan Sekarang di Vercel](https://e-football-cup-generator.vercel.app/)**

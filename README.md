# Petualangan FAYA

Game edukasi browser untuk anak usia 4–5 tahun: berhitung dan membaca.

## File
- `index.html` — halaman dan struktur game
- `style.css` — desain responsif
- `script.js` — game logic, soal, progres, suara, dekorasi 3D

## Menjalankan lokal
Cara termudah: buka folder ini dengan VS Code dan jalankan menggunakan ekstensi **Live Server**. Karena Three.js dimuat sebagai ES module dari CDN, sebaiknya gunakan server lokal, bukan membuka file HTML langsung.

## Publikasi GitHub Pages
1. Buat repository baru di GitHub.
2. Unggah ketiga file utama (`index.html`, `style.css`, `script.js`) ke root repository.
3. Buka **Settings → Pages**.
4. Pada Build and deployment pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu Save.
6. Tunggu proses publikasi dan buka URL GitHub Pages yang diberikan.

## Catatan
- Dekorasi 3D menggunakan Three.js dari jsDelivr CDN; diperlukan koneksi internet saat game dibuka.
- Suara menggunakan fitur speech synthesis browser. Ketersediaan dan kualitas suara Bahasa Indonesia bergantung pada perangkat/browser.
- Progres disimpan di `localStorage` browser/perangkat yang digunakan.
- Ini adalah versi awal yang dapat dimainkan. Ilustrasi karakter dan benda menggunakan emoji serta dekorasi 3D ringan; aset karakter 3D khusus FAYA dapat ditambahkan kemudian.

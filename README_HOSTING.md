# Panduan Hosting Bot Zayla (Tanpa Kartu Kredit) 🚀

Karena kamu tidak ingin memasukkan kartu kredit, kita akan menggunakan **Render.com**. Render memiliki tier gratis yang tidak memerlukan kartu kredit sama sekali.

## 🏗️ 1. Upload ke GitHub

1.  Buatlah akun di [github.com](https://github.com).
2.  Buat repository baru (contoh: `zayla-bot`).
3.  Upload semua file di folder ini ke sana, **KECUALI** folder `node_modules` dan `session` (karena sudah saya masukkan ke `.gitignore`).

---

## 🚀 2. Deploy di Render.com

1.  Daftar/Login di [Render.com](https://dashboard.render.com).
2.  Klik **New** -> **Web Service**.
3.  Pilih repository GitHub kamu.
4.  Gunakan pengaturan berikut:
    - **Runtime**: `Node` (Pilih Node 18+).
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
    - **Instance Type**: `Free`
5.  Klik **Create Web Service**.

**Penting**: Setelah deploy selesai, kamu akan melihat URL di atas nama service kamu, contoh: `https://zayla-bot-xxxx.onrender.com`. **Itu adalah link bot kamu!**

---

## 😴 3. Cara "Anti-Tidur" (Penting!)

Agar Render tidak mematikan bot kamu saat sepi, kamu harus "membangunkannya" setiap 5-10 menit.

1.  Buka [UptimeRobot.com](https://uptimerobot.com) atau [Cron-job.org](https://cron-job.org).
2.  Buat **New Monitor**.
3.  Pilih **HTTP(S)**.
4.  Masukkan **URL Bot Render** kamu (contoh: `https://zayla-bot-xxxx.onrender.com`).
5.  Set interval setiap **5 menit**.
6.  Selesai! Sekarang bot kamu akan bangun terus 24 jam.

---

## 📱 4. Cara Scan QR Code

1.  Di Dashboard Render, klik bagian **Logs**.
2.  Tunggu sampai log menunjukkan QR Code (kotak-kotak hitam putih).
3.  Buka WhatsApp di HP kamu -> Perangkat Tertaut -> Tautkan Perangkat.
4.  Scan QR Code yang ada di log Render tersebut.---

## 🤗 3. Hosting di Hugging Face (Gratis & No Card) - REKOMENDASI CLOUD

Hugging Face Spaces bisa menjalankan Docker secara gratis tanpa kartu kredit.

1.  Buat akun di [huggingface.co](https://huggingface.co).
2.  Klik **New** -> **Space**.
3.  Beri nama Space kamu (misal: `zayla-bot`).
4.  **PENTING**: Pilih SDK **Docker**.
5.  Pilih **Blank** template.
6.  Klik **Create Space**.
7.  Setelah itu, upload semua file bot kamu ke sana (bisa via web upload atau git).
8.  Hugging Face akan otomatis membaca `Dockerfile` yang sudah saya siapkan dan menjalankan botnya.
9.  **Link Bot**: Ada di bagian atas (contoh: `https://user-zayla-bot.hf.space`). Gunakan link ini di **UptimeRobot** agar bot tidak mati.
10. **Scan QR**: Cek bagian **Logs** di Hugging Face untuk menscan QR Code-nya.

---

## 📱 Cara Alternatif: Hosting di HP (Termux) - 100% Gratis & No Card

Jika kamu tidak punya kartu kredit untuk Render/Railway, ini adalah cara paling populer:

1.  **Install Termux**: Download dari [F-Droid](https://f-droid.org/en/packages/com.termux/) (Jangan dari Play Store, versinya sudah usang).
2.  **Buka Termux**, lalu ketik perintah ini satu per satu:
    ```bash
    pkg update && pkg upgrade
    pkg install nodejs ffmpeg python git
    pip install yt-dlp
    ```
3.  **Ambil Kode kamu dari GitHub**:
    ```bash
    git clone link-github-kamu
    cd nama-repo-kamu
    ```
4.  **Install & Jalankan**:
    ```bash
    npm install
    node index.js
    ```
5.  **Scan QR**: Minta teman untuk memfoto QR yang muncul di HP kamu, lalu kamu scan foto tersebut dengan WhatsApp kamu.

---

## 💤 Cara Agar Bot Termux Tidak Mati

Agar Termux tetap jalan di background meskipun layar HP mati:

1. Tarik bar notifikasi HP ke bawah.
2. Pada notifikasi Termux, klik **"Acquire Wake Lock"**.
3. Selesai! Bot kamu akan jalan terus selama HP nyala dan ada internet.

Selamat mencoba kak! Kalau ada kendala di Termux, tanya saya ya 😆💖

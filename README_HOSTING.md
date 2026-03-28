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
4.  Scan QR Code yang ada di log Render tersebut.

Selamat mencoba kak! Kalau ada kendala, tanya saya ya 😆💖

# Sistem Absensi Siswa

Aplikasi web modern untuk manajemen absensi siswa sekolah, dibangun dengan React, TypeScript, dan Vite.

## 📋 Fitur Unggulan (Skripsi Ready)

- **Smart Kiosk Mode**: Self check-in dengan:
    -   **Face Recognition**: Mendeteksi wajah siswa.
    -   **Liveness Detection (AI)**: Mewajibkan siswa **tersenyum** untuk mencegah spoofing (anti-foto).
    -   **Geofencing**: Validasi radius lokasi sekolah (GPS).
- **Real-time Dashboard**: Data kehadiran masuk secara otomatis (Live Update) tanpa refresh halaman.
- **PWA (Progressive Web App)**:
    -   Bisa diinstall di HP/Laptop.
    -   **Offline Mode**: Aplikasi tetap bisa dibuka tanpa koneksi internet.
- **Advanced Reporting**: Export laporan ke PDF dan Excel.
- **Secure Mobile Access**: Mendukung HTTPS lokal untuk akses kamera di HP.

## 🚀 Cara Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan aplikasi:

1.  **Install Dependencies**
    ```bash
    npm install
    # Jika ada error, gunakan:
    npm install --legacy-peer-deps
    ```

2.  **Download Model AI** (PENTING!)
    Jalankan script untuk mengunduh model deteksi wajah:
    ```bash
    powershell -ExecutionPolicy Bypass -File download-models.ps1
    ```

3.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```

4.  **Akses Browser**
    -   **Laptop**: `https://localhost:5173`
    -   **HP**: `https://192.168.x.x:5173` (Lihat IP di terminal)
    -   *Catatan*: Klik "Advanced" -> "Proceed (Unsafe)" jika muncul peringatan HTTPS merah.

## 🛠️ Teknologi

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **AI / Computer Vision**: Face-api.js (TensorFlow.js based)
- **Backend / Database**: Supabase (PostgreSQL + Real-time)
- **PWA**: Service Worker (Workbox), Manifest
- **Icons**: Lucide React
- [Lucide Icons](https://lucide.dev/) - Ikon modern

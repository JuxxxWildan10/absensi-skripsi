# Laporan Skripsi: Sistem Absensi Siswa Berbasis Web dengan Pengenalan Wajah dan Geolokasi

## 1. Penjelasan Sistem (Isi Website)
Website ini adalah **Sistem Informasi Absensi Siswa Modern** yang dirancang untuk mendigitalkan proses pencatatan kehadiran di sekolah. Sistem ini menggabungkan fitur administrasi lengkap untuk staf pengajar/admin dengan fitur *Kiosk Mode* mandiri untuk siswa melakukan absensi.

Sistem ini memiliki dua antarmuka utama:
1.  **Dashboard Admin/Guru**: Pusat kontrol untuk mengelola data master (siswa, guru, kelas, jadwal), melihat rekap kehadiran secara *real-time*, dan mencetak laporan.
2.  **Kiosk Mode**: Antarmuka khusus yang dipasang di perangkat tablet/komputer di sekolah, tempat siswa melakukan *scan* wajah untuk mencatat kehadiran mereka secara otomatis.

## 2. Cara Kerja Sistem
Sistem bekerja dengan alur sebagai berikut:

**A. Sisi Admin (Pengaturan Awal)**
1.  Admin *login* ke sistem.
2.  Admin menginput data **Kelas**, **Guru**, dan **Siswa**.
3.  Setiap siswa didaftarkan foto wajahnya (perekaman data biometrik) ke dalam sistem untuk referensi *Face Recognition*.
4.  Admin mengatur **Jadwal Pelajaran**.

**B. Sisi Siswa (Proses Absensi)**
1.  Perangkat di sekolah dibuka pada halaman **Kiosk Mode**.
2.  Siswa memilih jadwal/kelas yang sedang berlangsung.
3.  Siswa menghadapkan wajah ke kamera.
4.  **Face Verification**: Sistem menganalisis wajah siswa menggunakan kecerdasan buatan (*AI*) dan mencocokkannya dengan database.
5.  **Location Guard**: Sistem memverifikasi lokasi perangkat (memastikan absensi dilakukan di area sekolah).
6.  Jika wajah cocok dan lokasi valid, kehadiran tercatat sebagai "Hadir" atau "Terlambat" (tergantung waktu).

**C. Sisi Pelaporan**
1.  Data masuk secara *real-time* ke server.
2.  Admin dapat melihat grafik kehadiran harian di Dashboard.
3.  Admin dapat mengunduh laporan bulanan dalam format **PDF** atau **Excel**.

## 3. Keunggulan Sistem
1.  **Anti-Titip Absen**: Menggunakan verifikasi biometrik wajah, sehingga siswa tidak bisa diwakilkan.
2.  **Validasi Lokasi (Geofencing)**: Memastikan absensi hanya bisa dilakukan di titik lokasi yang ditentukan (sekolah).
3.  **Real-time & Paperless**: Mengurangi penggunaan kertas dan data dapat diakses kapan saja.
4.  **Mode Kiosk Mandiri**: Mengurangi beban kerja guru piket karena siswa melakukan absensi sendiri secara mandiri.
5.  **Multi-Platform**: Berbasis web (PWA), dapat diakses dari Laptop, Tablet, maupun HP, dan dapat diinstal seperti aplikasi native.
6.  **Laporan Otomatis**: Fitur ekspor ke PDF dan Excel memudahkan administrasi sekolah.

## 4. Kegunaan (Utility)
*   **Bagi Sekolah**: Meningkatkan kedisiplinan dan akurasi data kehadiran. Mempermudah rekapitulasi laporan bulanan.
*   **Bagi Guru**: Memudahkan pemantauan kehadiran siswa di kelas tanpa perlu memanggil nama satu per satu.
*   **Bagi Siswa**: Proses absensi menjadi cepat, modern, dan transparan.
*   **Bagi Orang Tua**: (Pengembangan lanjut) Transparansi kehadiran anak di sekolah.

## 5. Teknologi yang Digunakan (Tech Stack)
Aplikasi ini dibangun menggunakan teknologi web modern terkini:

*   **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/) (JavaScript dengan tipe data yang ketat untuk keamanan kode).
*   **Frontend Framework**: [React.js](https://react.dev/) (Library UI paling populer).
*   **Build Tool**: [Vite](https://vitejs.dev/) (Untuk performa website yang super cepat).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Framework CSS untuk *styling* yang modern dan responsif).
*   **Database & Backend**: [Supabase](https://supabase.com/) (Backend-as-a-Service yang menyediakan Database Realtime dan Autentikasi).
*   **AI / Machine Learning**: `face-api.js` (Library pengenalan dan pendeteksian wajah di browser).
*   **Charting**: `recharts` (Untuk visualisasi grafik data).
*   **Reporting**: `jspdf` & `jspdf-autotable` (PDF), `xlsx` (Excel).
*   **Icons**: `lucide-react`.

## 6. Penjelasan Struktur File
Berikut adalah penjelasan kegunaan dari setiap file dan folder utama dalam proyek ini:

### **Root (Akar Proyek)**
*   `package.json`: Daftar semua *library* dan dependensi yang digunakan aplikasi.
*   `vite.config.ts`: Konfigurasi *build tool* Vite.
*   `tsconfig.json`: Konfigurasi aturan bahasa TypeScript.
*   `index.html`: File HTML utama yang memuat aplikasi React.
*   `.env`: File konfigurasi rahasia (seperti kunci koneksi ke database).

### **src/ (Source Code Utama)**
*   `main.tsx`: Pintu masuk utama aplikasi (*entry point*).
*   `App.tsx`: Pengatur navigasi (Routing) halaman utama. Menentukan halaman mana yang muncul di URL tertentu.
*   `index.css`: File CSS global, memuat konfigurasi Tailwind CSS.

### **src/contexts/ (State Management)**
*   `AuthContext.tsx`: Mengelola status login pengguna (apakah user sudah login? apakah dia admin?).
*   `DataContext.tsx`: Mengelola data global aplikasi agar bisa diakses di semua halaman tanpa *loading* berulang.

### **src/components/ (Komponen UI Reusable)**
*   `Layout.tsx`: Kerangka tampilan utama Admin (Sidebar + Header + Konten).
*   `LoadingSpinner.tsx`: Tampilan animasi *loading*.
*   `InstallPrompt.tsx`: Notifikasi pop-up untuk menginstal aplikasi (fitur PWA).
*   **src/components/kiosk/**:
    *   `FaceVerification.tsx`: Komponen inti AI untuk mendeteksi wajah siswa.
    *   `LocationGuard.tsx`: Komponen untuk mengecek lokasi GPS pengguna.

### **src/pages/ (Halaman-halaman Website)**
*   `Login.tsx`: Halaman masuk untuk Admin/Guru.
*   `Dashboard.tsx`: Halaman beranda admin berisi statistik dan grafik ringkasan.
*   `Attendance.tsx` (Absensi): Halaman rekap data absensi harian/bulanan.
*   `Students.tsx` (Siswa): Halaman manajemen data siswa (tambah/edit/hapus & registrasi wajah).
*   `Teachers.tsx` (Guru): Halaman manajemen data guru.
*   `Classes.tsx` (Kelas): Halaman manajemen data kelas.
*   `Schedules.tsx` (Jadwal): Halaman pengaturan jadwal pelajaran.
*   `Reports.tsx` (Laporan): Halaman untuk melihat grafik kehadiran dan unduh laporan PDF/Excel.
*   `Kiosk.tsx`: Halaman khusus untuk display tablet absensi (Tampilan Halo, pilih kelas, dan proses scan).

### **src/lib/**
*   `supabase.ts`: Konfigurasi koneksi ke server Supabase.

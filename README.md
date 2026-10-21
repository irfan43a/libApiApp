# 📚 Perpustakaan RESTful API (Express.js & SQL)

Sistem backend RESTful API lengkap untuk manajemen perpustakaan modern berbasis **Express.js** dan database **SQL** (Sequelize ORM). Mendukung manajemen buku dengan upload gambar/cover, kategori, autentikasi pengguna (Admin, Petugas, Member), alur peminjaman & pengembalian buku, sistem perhitungan denda keterlambatan otomatis, pembayaran denda, serta statistik dashboard.

---

## 🚀 Fitur Utama

1. **Autentikasi & Autorisasi (JWT & Bcrypt)**
   - Role: `admin`, `petugas`, `member`.
   - Registrasi member baru, login, dan profile management.
   - Password hashing otomatis menggunakan `bcryptjs`.

2. **Manajemen Buku (CRUD + Cover Gambar)**
   - Tambah buku dengan upload file cover/gambar (Multer).
   - Edit buku (memperbarui data & ganti gambar dengan pembersihan otomatis file lama).
   - Hapus buku (dilengkapi proteksi integritas data agar buku yang memiliki riwayat pinjam tidak terhapus sembarangan).
   - Filter pencarian (judul, penulis, penerbit, ISBN), kategori, pagination, dan status ketersediaan.

3. **Peminjaman Buku (Borrowings)**
   - Validasi ketersediaan stok (`tersedia > 0`).
   - Pengurangan stok otomatis saat buku dipinjam.
   - Pengecekan limit maksimal peminjaman per member (default 3 buku).
   - Pengecekan blokir jika peminjam masih memiliki tagihan denda belum lunas.
   - Penomoran kode transaksi otomatis (format `PJ-YYYYMMDD-XXXX`).

4. **Pengembalian & Perhitungan Denda Otomatis (Fines)**
   - Pengembalian buku dan penambahan kembali stok yang tersedia.
   - Perhitungan otomatis hari keterlambatan terhadap tanggal jatuh tempo.
   - Perhitungan otomatis tarif denda per hari (default: Rp 1.000/hari, dapat disesuaikan di `.env`).
   - Pencatatan otomatis ke tabel `fines` jika terlambat dengan status `BELUM_LUNAS`.

5. **Pelunasan Denda**
   - Admin/petugas dapat memverifikasi pembayaran denda (Tunai, Transfer, QRIS).
   - Riwayat denda per member dan status keterlambatan.
   - Scanner otomatis peminjaman yang melewati batas waktu (`/check-overdue`).

6. **Dashboard Statistik**
   - Ringkasan total judul buku, total eksemplar, stok dipinjam vs tersedia.
   - Total transaksi peminjaman (aktif, terlambat, selesai).
   - Akumulasi nominal denda tertunggak dan denda lunas.
   - Daftar 5 transaksi peminjaman terbaru.

7. **Database Fleksibel (Multi-Dialect SQL)**
   - **SQLite**: Default *zero-config* (langsung jalan tanpa install server DB tambahan).
   - **MySQL / PostgreSQL**: Cukup ubah konfigurasi pada `.env`.

---

## 📁 Struktur Folder Project

```text
library/
├── public/
│   └── uploads/
│       └── covers/           # Tempat penyimpanan file cover buku
├── src/
│   ├── config/
│   │   └── database.js       # Konfigurasi koneksi Sequelize (SQLite/MySQL/PostgreSQL)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── book.controller.js
│   │   ├── borrowing.controller.js
│   │   ├── category.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── fine.controller.js
│   │   └── user.controller.js
│   ├── database/
│   │   ├── library.sqlite    # File database SQLite (otomatis dibuat)
│   │   └── seeders/
│   │       └── seed.js       # Seeder data awal
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── Book.js
│   │   ├── Borrowing.js
│   │   ├── Category.js
│   │   ├── Fine.js
│   │   ├── User.js
│   │   └── index.js          # Relasi antar tabel
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── book.routes.js
│   │   ├── borrowing.routes.js
│   │   ├── category.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── fine.routes.js
│   │   ├── index.js
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── dateHelper.js     # Helper hitung hari & denda
│   │   └── response.js       # Standarisasi respon JSON
│   ├── app.js                # Inisialisasi Express & middlewares
│   └── server.js             # Server listener & sinkronisasi DB
├── tests/
│   └── test-api.js           # Automated End-to-End API Test
├── .env                      # Environment variables
├── .env.example
├── package.json
├── postman_collection.json   # File Postman siap impor
└── README.md
```

---

## 🛠️ Instalasi & Menjalankan Project

### 1. Prasyarat
- **Node.js** (v18 ke atas disarankan)
- **npm**

### 2. Konfigurasi Environment (`.env`)
File `.env` sudah disediakan secara default dengan konfigurasi SQLite:
```env
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=supersecretjwtkey_perpustakaan_2026
JWT_EXPIRES_IN=7d

# Aturan Perpustakaan
FINE_PER_DAY=1000
LOAN_DURATION_DAYS=7
MAX_BORROW_LIMIT=3

# Database (Default: SQLite zero-config)
DB_DIALECT=sqlite
DB_STORAGE=./src/database/library.sqlite

# Jika ingin beralih ke MySQL / PostgreSQL:
# DB_DIALECT=mysql atau postgres
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=library_db
# DB_USER=root
# DB_PASSWORD=
```

### 3. Jalankan Database Seeding
Perintah ini akan membuat semua tabel dan mengisi data dummy awal (admin, kategori, buku dengan cover, peminjaman contoh, dan denda):
```bash
npm run seed
```

### 4. Jalankan Server
- Mode pengembangan (auto-reload):
  ```bash
  npm run dev
  ```
- Mode produksi:
  ```bash
  npm start
  ```
- Menjalankan uji API otomatis:
  ```bash
  node tests/test-api.js
  ```

### 5. Dokumentasi API Interaktif (Swagger UI)
Setelah server berjalan, Anda dapat mengakses dan mencoba seluruh endpoint API langsung melalui browser menggunakan Swagger UI:
- **Swagger UI**: `http://localhost:5000/api/docs` (atau shortcut `http://localhost:5000/docs`)
- **OpenAPI JSON Spec**: `http://localhost:5000/api/docs/json`

> 💡 **Tips Pengujian di Swagger**:
> 1. Jalankan endpoint `POST /api/auth/login` (misal dengan akun admin atau member).
> 2. Salin nilai `token` dari respon.
> 3. Klik tombol **Authorize** di pojok kanan atas Swagger UI, lalu tempel token Anda (`Bearer <token>`).
> 4. Anda sekarang dapat mencoba semua endpoint yang membutuhkan autentikasi langsung dari browser!

---

## 👤 Akun Default Hasil Seeding

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **Admin** | `admin@perpustakaan.com` | `admin123` | Akses penuh seluruh endpoint & kelola anggota |
| **Petugas** | `petugas@perpustakaan.com` | `petugas123` | Kelola buku, proses pinjam/kembali, terima denda |
| **Member 1** | `budi@gmail.com` | `member123` | Pinjam buku, lihat riwayat pinjaman & denda sendiri |
| **Member 2** | `dewi@gmail.com` | `member123` | Pinjam buku, lihat riwayat pinjaman & denda sendiri |

---

## 📖 Ringkasan Endpoint API

Semua endpoint diawali dengan prefix: `http://localhost:5000/api`

### 1. Autentikasi (`/auth`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/auth/register` | Publik | Registrasi akun member baru |
| `POST` | `/auth/login` | Publik | Login (mengembalikan token JWT) |
| `GET` | `/auth/profile` | Login | Mengambil profil user yang sedang login |
| `PUT` | `/auth/profile` | Login | Memperbarui profil atau password sendiri |

### 2. Buku (`/books`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/books` | Publik | Daftar buku (paging `page`, `limit`, search `search`, filter `kategori_id`, `tersedia_hanya`) |
| `GET` | `/books/:id` | Publik | Detail buku & kategorinya |
| `POST` | `/books` | Admin/Petugas | Tambah buku baru (**Form-Data** dengan field file `cover`) |
| `PUT` | `/books/:id` | Admin/Petugas | Update buku & opsi ganti cover baru |
| `DELETE`| `/books/:id` | Admin | Hapus buku (dilindungi proteksi riwayat pinjam) |

> 🖼️ **File Upload Cover**:
> Kirim request menggunakan `multipart/form-data`. Field untuk gambar adalah **`cover`** (Maksimal 3MB, format: `.jpg`, `.jpeg`, `.png`, `.webp`).
> Gambar yang diupload dapat diakses publik melalui browser di: `http://localhost:5000/uploads/covers/<nama-file>`.

### 3. Kategori (`/categories`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/categories` | Publik | Daftar semua kategori & jumlah buku di dalamnya |
| `GET` | `/categories/:id` | Publik | Detail kategori dan daftar bukunya |
| `POST` | `/categories` | Admin/Petugas | Tambah kategori baru |
| `PUT` | `/categories/:id` | Admin/Petugas | Ubah nama atau deskripsi kategori |
| `DELETE`| `/categories/:id` | Admin | Hapus kategori (dicegah jika masih memiliki buku) |

### 4. Peminjaman (`/borrowings`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/borrowings` | Member/Admin | Meminjam buku (otomatis kurangi stok tersedia) |
| `GET` | `/borrowings/my-borrowings` | Member | Riwayat peminjaman user yang sedang login |
| `GET` | `/borrowings` | Admin/Petugas | Daftar seluruh transaksi peminjaman perpustakaan |
| `GET` | `/borrowings/:id` | Member/Admin | Detail peminjaman |
| `POST` | `/borrowings/:id/return` | Admin/Petugas | Kembalikan buku (hitung hari terlambat & denda otomatis) |

**Contoh Request Body Pinjam Buku (`POST /api/borrowings`):**
```json
{
  "buku_id": 1,
  "durasi_hari": 7,
  "catatan": "Peminjaman untuk bahan referensi skripsi"
}
```

### 5. Denda & Pembayaran (`/fines`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/fines` | Admin/Petugas | Daftar seluruh data denda (`?status_pembayaran=BELUM_LUNAS`) |
| `GET` | `/fines/my-fines` | Member | Daftar denda milik user yang sedang login |
| `GET` | `/fines/check-overdue` | Admin/Petugas | Pindai & ubah status pinjaman yang lewat jatuh tempo |
| `GET` | `/fines/:id` | Member/Admin | Detail denda |
| `POST` | `/fines/:id/pay` | Admin/Petugas | Pelunasan denda (metode: `TUNAI`, `TRANSFER`, `QRIS`) |

**Contoh Request Body Pelunasan Denda (`POST /api/fines/:id/pay`):**
```json
{
  "metode_pembayaran": "QRIS",
  "catatan": "Pelunasan diverifikasi melalui bukti transfer QRIS kasir"
}
```

### 6. Dashboard & Laporan (`/dashboard`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Admin/Petugas | Statistik lengkap buku, peminjaman, denda, dan transaksi terbaru |

---

## 📮 Import Postman Collection

File koleksi Postman yang siap pakai telah disertakan di root project:
`postman_collection.json`

**Cara Import ke Postman:**
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di kiri atas.
3. Pilih file `postman_collection.json` dari folder project ini.
4. Di Postman, jalankan request `Login Admin` atau `Login Member` terlebih dahulu, lalu salin token ke variabel koleksi `admin_token` atau `member_token`.

/**
 * Swagger / OpenAPI 3.0 Specification
 * Perpustakaan RESTful API
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: '📚 Perpustakaan RESTful API',
    version: '1.0.0',
    description: `
Dokumentasi lengkap RESTful API untuk Sistem Manajemen Perpustakaan berbasis **Express.js** dan **Sequelize ORM**.

### 🔐 Autentikasi:
Sebagian besar endpoint memerlukan Bearer JWT Token.
Gunakan tombol **Authorize** di kanan atas dan masukkan token Anda dengan format: \`Bearer <token>\` (atau cukup paste token jika format Bearer sudah otomatis).

#### 👤 Akun Bawaan (Hasil Seeder):
- **Admin**: \`admin@perpustakaan.com\` / \`admin123\` (Akses penuh)
- **Petugas**: \`petugas@perpustakaan.com\` / \`petugas123\` (Kelola buku, pinjam/kembali, denda)
- **Member 1**: \`budi@gmail.com\` / \`member123\`
- **Member 2**: \`dewi@gmail.com\` / \`member123\`
    `,
    contact: {
      name: 'Tim Perpustakaan API',
      url: 'https://github.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Autentikasi akun & Profil pengguna' },
    { name: 'Books', description: 'Katalog & Inventaris Buku (CRUD + Cover Gambar)' },
    { name: 'Categories', description: 'Manajemen Kategori Buku' },
    { name: 'Borrowings', description: 'Peminjaman & Pengembalian Buku' },
    { name: 'Fines', description: 'Perhitungan Denda Otomatis & Pelunasan' },
    { name: 'Users', description: 'Manajemen Pengguna (Admin & Petugas)' },
    { name: 'Dashboard', description: 'Statistik & Ringkasan Perpustakaan' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan Token JWT Anda. Contoh: Bearer eyJhbGciOi...',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operasi berhasil dijalankan' },
          data: { type: 'object' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Data berhasil diambil' },
          data: { type: 'array', items: { type: 'object' } },
          pagination: {
            type: 'object',
            properties: {
              totalItems: { type: 'integer', example: 50 },
              totalPages: { type: 'integer', example: 5 },
              currentPage: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Pesan kesalahan yang terjadi' },
          errors: { type: 'object', nullable: true },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama: { type: 'string', example: 'Budi Santoso' },
          email: { type: 'string', format: 'email', example: 'budi@gmail.com' },
          telepon: { type: 'string', example: '081234567890' },
          alamat: { type: 'string', example: 'Jl. Merdeka No. 45, Jakarta' },
          role: { type: 'string', enum: ['admin', 'petugas', 'member'], example: 'member' },
          status: { type: 'string', enum: ['aktif', 'nonaktif'], example: 'aktif' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama_kategori: { type: 'string', example: 'Teknologi & Komputer' },
          deskripsi: { type: 'string', example: 'Buku tentang software engineering, pemrograman, dan sains komputer.' },
          total_buku: { type: 'integer', example: 5 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Book: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          judul: { type: 'string', example: 'Clean Code: A Handbook of Agile Software Craftsmanship' },
          penulis: { type: 'string', example: 'Robert C. Martin' },
          penerbit: { type: 'string', example: 'Prentice Hall' },
          tahun_terbit: { type: 'integer', example: 2008 },
          isbn: { type: 'string', example: '978-0132350884' },
          jumlah_halaman: { type: 'integer', example: 464 },
          stok: { type: 'integer', example: 5 },
          tersedia: { type: 'integer', example: 4 },
          lokasi_rak: { type: 'string', example: 'Rak TK-01' },
          deskripsi: { type: 'string', example: 'Panduan lengkap tentang cara menulis kode yang bersih, rapi, dan mudah dikelola.' },
          cover_gambar: { type: 'string', nullable: true, example: '/uploads/covers/book-1700000000-123.jpg' },
          kategori_id: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          category: { $ref: '#/components/schemas/Category' },
        },
      },
      Borrowing: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          kode_pinjam: { type: 'string', example: 'PJ-20261021-4821' },
          user_id: { type: 'integer', example: 3 },
          buku_id: { type: 'integer', example: 1 },
          tanggal_pinjam: { type: 'string', format: 'date', example: '2026-10-10' },
          tanggal_jatuh_tempo: { type: 'string', format: 'date', example: '2026-10-17' },
          tanggal_kembali: { type: 'string', format: 'date', nullable: true, example: null },
          status: { type: 'string', enum: ['DIPINJAM', 'TERLAMBAT', 'DIKEMBALIKAN'], example: 'DIPINJAM' },
          catatan: { type: 'string', nullable: true, example: 'Referensi tugas akhir' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          book: { $ref: '#/components/schemas/Book' },
          user: { $ref: '#/components/schemas/User' },
          fine: { $ref: '#/components/schemas/Fine' },
        },
      },
      Fine: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          peminjaman_id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 3 },
          jumlah_hari_terlambat: { type: 'integer', example: 4 },
          tarif_per_hari: { type: 'integer', example: 1000 },
          total_denda: { type: 'integer', example: 4000 },
          status_pembayaran: { type: 'string', enum: ['BELUM_LUNAS', 'LUNAS'], example: 'BELUM_LUNAS' },
          tanggal_bayar: { type: 'string', format: 'date-time', nullable: true, example: null },
          metode_pembayaran: { type: 'string', enum: ['TUNAI', 'TRANSFER', 'QRIS', 'LAINNYA'], nullable: true, example: null },
          catatan: { type: 'string', nullable: true, example: 'Keterlambatan pengembalian 4 hari' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: { $ref: '#/components/schemas/User' },
          borrowing: { $ref: '#/components/schemas/Borrowing' },
        },
      },
    },
  },
  paths: {
    // ----------------------------------------------------
    // AUTH
    // ----------------------------------------------------
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrasi Member Baru',
        description: 'Mendaftarkan akun baru dengan role default `member` dan status `aktif`. Mengembalikan data akun beserta token JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama', 'email', 'password'],
                properties: {
                  nama: { type: 'string', example: 'Andi Wijaya' },
                  email: { type: 'string', format: 'email', example: 'andi@gmail.com' },
                  password: { type: 'string', format: 'password', example: 'password123' },
                  telepon: { type: 'string', example: '081233445566' },
                  alamat: { type: 'string', example: 'Jl. Sudirman No 10, Jakarta' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registrasi berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registrasi berhasil' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Input data tidak lengkap', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email sudah terdaftar', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login Pengguna (Admin / Petugas / Member)',
        description: 'Melakukan autentikasi menggunakan email dan password, mengembalikan token JWT untuk autorisasi endpoint berikutnya.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@perpustakaan.com' },
                  password: { type: 'string', format: 'password', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login berhasil' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Email atau password tidak diisi', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'Email atau password salah', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Akun dinonaktifkan', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Lihat Profil Sendiri',
        description: 'Mengambil informasi lengkap pengguna yang saat ini sedang terotentikasi.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profil berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Data profil berhasil diambil' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Token tidak valid / Tidak ada token' },
        },
      },
      put: {
        tags: ['Auth'],
        summary: 'Perbarui Profil Sendiri',
        description: 'Memperbarui informasi nama, telepon, alamat, atau password akun sendiri.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama: { type: 'string', example: 'Budi Santoso Baru' },
                  telepon: { type: 'string', example: '089988776655' },
                  alamat: { type: 'string', example: 'Jl. Melati No 15' },
                  password: { type: 'string', format: 'password', example: 'newpassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profil berhasil diperbarui',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Profil berhasil diperbarui' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Token tidak valid / Tidak ada token' },
        },
      },
    },

    // ----------------------------------------------------
    // BOOKS
    // ----------------------------------------------------
    '/books': {
      get: {
        tags: ['Books'],
        summary: 'Daftar Semua Buku (Publik)',
        description: 'Menampilkan katalog buku dengan fitur pencarian (judul, penulis, penerbit, ISBN), filter kategori, pagination, dan status ketersediaan.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Nomor halaman' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Jumlah data per halaman' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Kata kunci pencarian (judul, penulis, penerbit, isbn)' },
          { name: 'kategori_id', in: 'query', schema: { type: 'integer' }, description: 'Filter berdasarkan ID kategori' },
          { name: 'tersedia_hanya', in: 'query', schema: { type: 'boolean' }, description: 'Tampilkan hanya buku yang memiliki stok tersedia > 0' },
          { name: 'sort_by', in: 'query', schema: { type: 'string', default: 'createdAt' }, description: 'Kolom pengurutan (judul, tahun_terbit, createdAt, dll)' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' }, description: 'Arah pengurutan' },
        ],
        responses: {
          200: {
            description: 'Daftar buku berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Daftar buku berhasil diambil' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        totalItems: { type: 'integer', example: 10 },
                        totalPages: { type: 'integer', example: 1 },
                        currentPage: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Books'],
        summary: 'Tambah Buku Baru (Admin/Petugas)',
        description: 'Menambahkan data buku baru beserta unggah file cover (Format: JPG, PNG, WEBP, maks 3MB).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['judul', 'penulis'],
                properties: {
                  judul: { type: 'string', example: 'Clean Architecture' },
                  penulis: { type: 'string', example: 'Robert C. Martin' },
                  penerbit: { type: 'string', example: 'Prentice Hall' },
                  tahun_terbit: { type: 'integer', example: 2018 },
                  isbn: { type: 'string', example: '978-0134494164' },
                  jumlah_halaman: { type: 'integer', example: 432 },
                  stok: { type: 'integer', example: 5 },
                  lokasi_rak: { type: 'string', example: 'Rak CS-02' },
                  deskripsi: { type: 'string', example: 'Panduan seorang perancang software' },
                  kategori_id: { type: 'integer', example: 1 },
                  cover: { type: 'string', format: 'binary', description: 'File gambar cover buku (Maksimal 3MB)' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Buku berhasil ditambahkan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Buku berhasil ditambahkan' },
                    data: { $ref: '#/components/schemas/Book' },
                  },
                },
              },
            },
          },
          400: { description: 'Input data tidak valid' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden (Hanya Admin / Petugas)' },
          404: { description: 'Kategori tidak ditemukan' },
          409: { description: 'ISBN sudah terdaftar' },
        },
      },
    },
    '/books/{id}': {
      get: {
        tags: ['Books'],
        summary: 'Detail Buku (Publik)',
        description: 'Mendapatkan data detail buku beserta kategorinya berdasarkan ID.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID Buku' },
        ],
        responses: {
          200: {
            description: 'Detail buku berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Detail buku berhasil diambil' },
                    data: { $ref: '#/components/schemas/Book' },
                  },
                },
              },
            },
          },
          404: { description: 'Buku tidak ditemukan' },
        },
      },
      put: {
        tags: ['Books'],
        summary: 'Perbarui Buku (Admin/Petugas)',
        description: 'Memperbarui informasi buku dan dapat mengganti cover gambar secara opsional.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID Buku' },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  judul: { type: 'string', example: 'Clean Architecture (Revisi)' },
                  penulis: { type: 'string', example: 'Robert C. Martin' },
                  penerbit: { type: 'string', example: 'Prentice Hall' },
                  tahun_terbit: { type: 'integer', example: 2020 },
                  isbn: { type: 'string', example: '978-0134494164' },
                  jumlah_halaman: { type: 'integer', example: 450 },
                  stok: { type: 'integer', example: 10 },
                  tersedia: { type: 'integer', example: 8 },
                  lokasi_rak: { type: 'string', example: 'Rak CS-02' },
                  deskripsi: { type: 'string', example: 'Edisi revisi terbaru' },
                  kategori_id: { type: 'integer', example: 1 },
                  cover: { type: 'string', format: 'binary', description: 'Cover gambar baru (opsional)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Buku berhasil diperbarui',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Buku berhasil diperbarui' },
                    data: { $ref: '#/components/schemas/Book' },
                  },
                },
              },
            },
          },
          400: { description: 'Validasi gagal (misal stok kurang dari yang sedang dipinjam)' },
          404: { description: 'Buku tidak ditemukan' },
        },
      },
      delete: {
        tags: ['Books'],
        summary: 'Hapus Buku (Admin)',
        description: 'Menghapus buku secara permanen. Jika buku memiliki riwayat peminjaman, penghapusan akan dicegah untuk integritas data audit.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID Buku' },
        ],
        responses: {
          200: { description: 'Buku berhasil dihapus' },
          400: { description: 'Buku memiliki riwayat peminjaman dan tidak dapat dihapus' },
          403: { description: 'Hanya Admin yang dapat menghapus buku' },
          404: { description: 'Buku tidak ditemukan' },
        },
      },
    },

    // ----------------------------------------------------
    // CATEGORIES
    // ----------------------------------------------------
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Daftar Kategori Buku (Publik)',
        description: 'Mengambil semua kategori buku lengkap dengan kalkulasi jumlah buku (`total_buku`) di dalamnya.',
        responses: {
          200: {
            description: 'Daftar kategori berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Daftar kategori berhasil diambil' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Tambah Kategori Baru (Admin/Petugas)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama_kategori'],
                properties: {
                  nama_kategori: { type: 'string', example: 'Sains & Fisika' },
                  deskripsi: { type: 'string', example: 'Buku seputar fisika murni, astronomi, dan sains terapan.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Kategori berhasil dibuat' },
          400: { description: 'Nama kategori wajib diisi' },
          403: { description: 'Akses terbatas untuk Admin/Petugas' },
        },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Detail Kategori & Daftar Bukunya (Publik)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Detail kategori berhasil diambil' },
          404: { description: 'Kategori tidak ditemukan' },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Ubah Data Kategori (Admin/Petugas)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_kategori: { type: 'string', example: 'Sains & Kosmologi' },
                  deskripsi: { type: 'string', example: 'Deskripsi yang diperbarui' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Kategori berhasil diperbarui' },
          404: { description: 'Kategori tidak ditemukan' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Hapus Kategori (Admin)',
        description: 'Hapus kategori. Penghapusan dicegah jika kategori masih memiliki relasi ke buku.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Kategori berhasil dihapus' },
          400: { description: 'Kategori masih memiliki buku dan tidak dapat dihapus' },
          403: { description: 'Forbidden (Admin only)' },
          404: { description: 'Kategori tidak ditemukan' },
        },
      },
    },

    // ----------------------------------------------------
    // BORROWINGS
    // ----------------------------------------------------
    '/borrowings': {
      get: {
        tags: ['Borrowings'],
        summary: 'Daftar Semua Peminjaman (Admin/Petugas)',
        description: 'Mengambil riwayat seluruh peminjaman di perpustakaan dengan filter status, user, buku, tanggal, dan pagination.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DIPINJAM', 'TERLAMBAT', 'DIKEMBALIKAN'] } },
          { name: 'user_id', in: 'query', schema: { type: 'integer' } },
          { name: 'buku_id', in: 'query', schema: { type: 'integer' } },
          { name: 'dari_tanggal', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'sampai_tanggal', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cari berdasarkan kode peminjaman' },
        ],
        responses: {
          200: {
            description: 'Daftar peminjaman berhasil diambil',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } },
          },
          403: { description: 'Forbidden (Admin/Petugas only)' },
        },
      },
      post: {
        tags: ['Borrowings'],
        summary: 'Peminjaman Buku Baru (Member / Admin / Petugas)',
        description: 'Meminjam buku. Member meminjam untuk dirinya sendiri, sedangkan Admin/Petugas dapat menentukan `user_id` peminjam secara eksplisit.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['buku_id'],
                properties: {
                  buku_id: { type: 'integer', example: 1 },
                  durasi_hari: { type: 'integer', default: 7, example: 7 },
                  catatan: { type: 'string', example: 'Peminjaman untuk bahan referensi tugas kuliah' },
                  user_id: { type: 'integer', description: 'Hanya jika request dijalankan oleh Admin/Petugas', example: 3 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Peminjaman berhasil dicatat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Peminjaman buku berhasil dicatat' },
                    data: { $ref: '#/components/schemas/Borrowing' },
                  },
                },
              },
            },
          },
          400: { description: 'Stok buku habis / Batas peminjaman tercapai / Masih ada denda tertunggak' },
          404: { description: 'Buku atau Pengguna tidak ditemukan' },
        },
      },
    },
    '/borrowings/my-borrowings': {
      get: {
        tags: ['Borrowings'],
        summary: 'Riwayat Peminjaman Saya (Member)',
        description: 'Mengambil riwayat transaksi peminjaman milik member yang sedang login.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DIPINJAM', 'TERLAMBAT', 'DIKEMBALIKAN'] } },
        ],
        responses: {
          200: {
            description: 'Riwayat peminjaman berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Riwayat peminjaman saya berhasil diambil' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Borrowing' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/borrowings/{id}': {
      get: {
        tags: ['Borrowings'],
        summary: 'Detail Peminjaman',
        description: 'Mengambil detail satu peminjaman beserta buku, peminjam, dan informasi denda jika ada.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Detail peminjaman berhasil diambil' },
          403: { description: 'Akses ditolak (Member hanya boleh melihat transaksi miliknya)' },
          404: { description: 'Peminjaman tidak ditemukan' },
        },
      },
    },
    '/borrowings/{id}/return': {
      post: {
        tags: ['Borrowings'],
        summary: 'Proses Pengembalian Buku & Hitung Denda Otomatis (Admin/Petugas)',
        description: 'Mencatat pengembalian buku, memulihkan stok tersedia, dan secara otomatis menghitung denda jika terlambat dari tanggal jatuh tempo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  catatan_pengembalian: { type: 'string', example: 'Buku dikembalikan dalam kondisi baik' },
                  tanggal_kembali_custom: { type: 'string', format: 'date', example: '2026-10-25', description: 'Tanggal pengembalian khusus (opsional, default: hari ini)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Buku berhasil dikembalikan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Buku berhasil dikembalikan tepat waktu tanpa denda.' },
                    data: {
                      type: 'object',
                      properties: {
                        peminjaman: { $ref: '#/components/schemas/Borrowing' },
                        keterlambatan: {
                          type: 'object',
                          properties: {
                            terlambat_hari: { type: 'integer', example: 0 },
                            tarif_per_hari: { type: 'integer', example: 1000 },
                            total_denda: { type: 'integer', example: 0 },
                            status_denda: { type: 'string', example: 'TIDAK_ADA_DENDA' },
                          },
                        },
                        fine: { $ref: '#/components/schemas/Fine', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Buku sudah dikembalikan sebelumnya' },
          404: { description: 'Peminjaman tidak ditemukan' },
        },
      },
    },

    // ----------------------------------------------------
    // FINES
    // ----------------------------------------------------
    '/fines': {
      get: {
        tags: ['Fines'],
        summary: 'Daftar Seluruh Denda (Admin/Petugas)',
        description: 'Melihat seluruh catatan denda perpustakaan beserta total denda tertunggak.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status_pembayaran', in: 'query', schema: { type: 'string', enum: ['BELUM_LUNAS', 'LUNAS'] } },
          { name: 'user_id', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Daftar denda berhasil diambil',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } },
          },
        },
      },
    },
    '/fines/my-fines': {
      get: {
        tags: ['Fines'],
        summary: 'Daftar Denda Saya (Member)',
        description: 'Melihat seluruh tagihan denda milik akun yang sedang login.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Daftar denda saya berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Daftar denda saya berhasil diambil' },
                    data: {
                      type: 'object',
                      properties: {
                        totalUnpaidAmount: { type: 'integer', example: 5000 },
                        fines: { type: 'array', items: { $ref: '#/components/schemas/Fine' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/fines/check-overdue': {
      get: {
        tags: ['Fines'],
        summary: 'Pindai & Update Otomatis Peminjaman Lewat Jatuh Tempo (Admin/Petugas)',
        description: 'Menemukan semua peminjaman aktif yang telah melewati tanggal jatuh tempo dan mengubah statusnya menjadi TERLAMBAT.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Hasil pemindaian peminjaman terlambat' },
        },
      },
    },
    '/fines/{id}': {
      get: {
        tags: ['Fines'],
        summary: 'Detail Denda',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Detail denda berhasil diambil' },
          403: { description: 'Akses ditolak' },
          404: { description: 'Data denda tidak ditemukan' },
        },
      },
    },
    '/fines/{id}/pay': {
      post: {
        tags: ['Fines'],
        summary: 'Pelunasan Denda (Admin/Petugas)',
        description: 'Mencatat verifikasi pelunasan tagihan denda oleh Admin atau Petugas kasir perpustakaan.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  metode_pembayaran: { type: 'string', enum: ['TUNAI', 'TRANSFER', 'QRIS', 'LAINNYA'], default: 'TUNAI', example: 'QRIS' },
                  catatan: { type: 'string', example: 'Diverifikasi via bukti QRIS' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Denda berhasil dilunasi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Pembayaran denda sebesar Rp 5.000 berhasil diverifikasi (LUNAS)' },
                    data: { $ref: '#/components/schemas/Fine' },
                  },
                },
              },
            },
          },
          400: { description: 'Denda sudah lunas sebelumnya' },
          404: { description: 'Data denda tidak ditemukan' },
        },
      },
    },

    // ----------------------------------------------------
    // USERS
    // ----------------------------------------------------
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Daftar Pengguna / Anggota (Admin/Petugas)',
        description: 'Mengambil daftar anggota dan staf perpustakaan dengan filter nama/email/telepon, role, dan pagination.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'petugas', 'member'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['aktif', 'nonaktif'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cari nama, email, atau no telepon' },
        ],
        responses: {
          200: {
            description: 'Daftar pengguna berhasil diambil',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } },
          },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Buat Pengguna Baru (Admin Only)',
        description: 'Menambahkan pengguna baru dengan role bebas (admin, petugas, member).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama', 'email', 'password'],
                properties: {
                  nama: { type: 'string', example: 'Rian Pratama' },
                  email: { type: 'string', format: 'email', example: 'rian@perpustakaan.com' },
                  password: { type: 'string', format: 'password', example: 'rian1234' },
                  telepon: { type: 'string', example: '081299887766' },
                  alamat: { type: 'string', example: 'Jl. Pemuda No 12' },
                  role: { type: 'string', enum: ['admin', 'petugas', 'member'], default: 'member' },
                  status: { type: 'string', enum: ['aktif', 'nonaktif'], default: 'aktif' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pengguna berhasil dibuat' },
          400: { description: 'Input data tidak lengkap' },
          403: { description: 'Forbidden (Admin only)' },
          409: { description: 'Email sudah terdaftar' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Detail Pengguna & Riwayat Pinjaman (Admin/Petugas)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Detail pengguna berhasil diambil' },
          404: { description: 'Pengguna tidak ditemukan' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Ubah Data Pengguna (Admin Only)',
        description: 'Memperbarui data pengguna termasuk role dan status aktif/nonaktif.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama: { type: 'string', example: 'Rian Pratama Edit' },
                  email: { type: 'string', format: 'email', example: 'rian.edit@perpustakaan.com' },
                  password: { type: 'string', format: 'password', example: 'newpassword123' },
                  telepon: { type: 'string', example: '081299887799' },
                  alamat: { type: 'string', example: 'Jl. Pemuda No 12B' },
                  role: { type: 'string', enum: ['admin', 'petugas', 'member'] },
                  status: { type: 'string', enum: ['aktif', 'nonaktif'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Data pengguna berhasil diperbarui' },
          404: { description: 'Pengguna tidak ditemukan' },
          409: { description: 'Email sudah digunakan pengguna lain' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Hapus Pengguna (Admin Only)',
        description: 'Menghapus data pengguna. Dicegah jika pengguna masih memiliki tanggungan peminjaman buku yang aktif.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Pengguna berhasil dihapus' },
          400: { description: 'Pengguna masih memiliki buku yang sedang dipinjam' },
          404: { description: 'Pengguna tidak ditemukan' },
        },
      },
    },

    // ----------------------------------------------------
    // DASHBOARD
    // ----------------------------------------------------
    '/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Statistik & Ringkasan Perpustakaan (Admin/Petugas)',
        description: 'Menyajikan ringkasan inventaris buku (total eksemplar, stok tersedia vs dipinjam), total anggota, statistik transaksi peminjaman, akumulasi denda, serta 5 transaksi peminjaman terbaru.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Statistik perpustakaan berhasil diambil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Statistik perpustakaan berhasil diambil' },
                    data: {
                      type: 'object',
                      properties: {
                        buku: {
                          type: 'object',
                          properties: {
                            total_judul: { type: 'integer', example: 25 },
                            total_eksemplar: { type: 'integer', example: 120 },
                            tersedia: { type: 'integer', example: 95 },
                            dipinjam: { type: 'integer', example: 25 },
                          },
                        },
                        kategori: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 5 },
                          },
                        },
                        anggota: {
                          type: 'object',
                          properties: {
                            total_member: { type: 'integer', example: 50 },
                          },
                        },
                        peminjaman: {
                          type: 'object',
                          properties: {
                            total_transaksi: { type: 'integer', example: 80 },
                            sedang_dipinjam: { type: 'integer', example: 20 },
                            terlambat: { type: 'integer', example: 5 },
                            sudah_kembali: { type: 'integer', example: 55 },
                          },
                        },
                        denda: {
                          type: 'object',
                          properties: {
                            total_denda_lunas: { type: 'integer', example: 150000 },
                            total_denda_tertunggak: { type: 'integer', example: 25000 },
                            jumlah_kasus_tertunggak: { type: 'integer', example: 3 },
                          },
                        },
                        peminjaman_terbaru: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Borrowing' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden (Admin/Petugas only)' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;

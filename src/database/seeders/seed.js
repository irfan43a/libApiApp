require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, User, Category, Book, Borrowing, Fine } = require('../../models');
const { addDays, calculateDaysLate, calculateFine } = require('../../utils/dateHelper');

// Helper to generate a placeholder image if not present
const createPlaceholderImage = (filename, title, bgColor = '#2563eb', textColor = '#ffffff') => {
  const coversDir = path.resolve(__dirname, '../../../public/uploads/covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }

  const filePath = path.join(coversDir, filename);
  if (!fs.existsSync(filePath)) {
    // Generate a simple SVG placeholder image saved as .svg or .png/jpg mockup
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="400" height="600" fill="${bgColor}"/>
      <rect x="20" y="20" width="360" height="560" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.4"/>
      <text x="200" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}" text-anchor="middle">${title}</text>
      <text x="200" y="320" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" opacity="0.8">Perpustakaan Digital</text>
    </svg>`;
    fs.writeFileSync(filePath, svgContent, 'utf-8');
  }
};

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Menghubungkan ke database...');
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Reset tables cleanly for fresh seed
    console.log('[Seeder] Tabel berhasil di-reset dan disinkronkan.');

    // 1. Seed Users
    console.log('[Seeder] Menambahkan data Users...');
    const admin = await User.create({
      nama: 'Administrator Perpustakaan',
      email: 'admin@perpustakaan.com',
      password: 'admin123',
      telepon: '081200000001',
      alamat: 'Jl. Merdeka No. 1, Jakarta Pusat',
      role: 'admin',
      status: 'aktif',
    });

    const petugas = await User.create({
      nama: 'Siti Rahma (Petugas)',
      email: 'petugas@perpustakaan.com',
      password: 'petugas123',
      telepon: '081200000002',
      alamat: 'Jl. Sudirman No. 45, Jakarta Selatan',
      role: 'petugas',
      status: 'aktif',
    });

    const member1 = await User.create({
      nama: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: 'member123',
      telepon: '081234567890',
      alamat: 'Jl. Melati No. 12, Bandung',
      role: 'member',
      status: 'aktif',
    });

    const member2 = await User.create({
      nama: 'Dewi Lestari',
      email: 'dewi@gmail.com',
      password: 'member123',
      telepon: '089876543210',
      alamat: 'Jl. Anggrek No. 8, Yogyakarta',
      role: 'member',
      status: 'aktif',
    });

    // 2. Seed Categories
    console.log('[Seeder] Menambahkan Kategori Buku...');
    const catTeknologi = await Category.create({
      nama_kategori: 'Teknologi & Komputer',
      deskripsi: 'Buku seputar pemrograman, rekayasa perangkat lunak, AI, dan sistem komputer.',
    });

    const catSastra = await Category.create({
      nama_kategori: 'Sastra & Fiksi',
      deskripsi: 'Novel, cerpen, puisi, dan karya fiksi sastra dunia maupun nusantara.',
    });

    const catBisnis = await Category.create({
      nama_kategori: 'Bisnis & Pengembangan Diri',
      deskripsi: 'Buku motivasi, manajemen waktu, kepemimpinan, dan kewirausahaan.',
    });

    const catSains = await Category.create({
      nama_kategori: 'Sains & Matematika',
      deskripsi: 'Buku ilmu pengetahuan alam, matematika murni dan terapan.',
    });

    // Create cover placeholders
    createPlaceholderImage('clean-code.svg', 'Clean Code', '#1e3a8a');
    createPlaceholderImage('javascript-good-parts.svg', 'JavaScript Good Parts', '#b45309');
    createPlaceholderImage('laskar-pelangi.svg', 'Laskar Pelangi', '#047857');
    createPlaceholderImage('bumi-manusia.svg', 'Bumi Manusia', '#b91c1c');
    createPlaceholderImage('atomic-habits.svg', 'Atomic Habits', '#4338ca');

    // 3. Seed Books
    console.log('[Seeder] Menambahkan Buku dan Cover Gambar...');
    const book1 = await Book.create({
      judul: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      penulis: 'Robert C. Martin',
      penerbit: 'Prentice Hall',
      tahun_terbit: 2008,
      isbn: '978-0132350884',
      jumlah_halaman: 464,
      stok: 5,
      tersedia: 4, // 1 dipinjam
      lokasi_rak: 'Rak TK-01',
      deskripsi: 'Buku panduan fundamental untuk menulis kode perangkat lunak yang bersih, mudah dipelihara, dan elegan.',
      cover_gambar: '/uploads/covers/clean-code.svg',
      kategori_id: catTeknologi.id,
    });

    const book2 = await Book.create({
      judul: 'JavaScript: The Good Parts',
      penulis: 'Douglas Crockford',
      penerbit: "O'Reilly Media",
      tahun_terbit: 2008,
      isbn: '978-0596517748',
      jumlah_halaman: 172,
      stok: 3,
      tersedia: 2, // 1 dipinjam
      lokasi_rak: 'Rak TK-02',
      deskripsi: 'Eksplorasi fitur-fitur terbaik bahasa pemrograman JavaScript.',
      cover_gambar: '/uploads/covers/javascript-good-parts.svg',
      kategori_id: catTeknologi.id,
    });

    const book3 = await Book.create({
      judul: 'Laskar Pelangi',
      penulis: 'Andrea Hirata',
      penerbit: 'Bentang Pustaka',
      tahun_terbit: 2005,
      isbn: '978-9793062792',
      jumlah_halaman: 529,
      stok: 4,
      tersedia: 4,
      lokasi_rak: 'Rak SF-01',
      deskripsi: 'Kisah inspiratif tentang sepuluh anak dari keluarga miskin yang bersekolah di sebuah SD Muhammadiyah di Belitung.',
      cover_gambar: '/uploads/covers/laskar-pelangi.svg',
      kategori_id: catSastra.id,
    });

    const book4 = await Book.create({
      judul: 'Bumi Manusia',
      penulis: 'Pramoedya Ananta Toer',
      penerbit: 'Hasta Mitra',
      tahun_terbit: 1980,
      isbn: '978-9799731234',
      jumlah_halaman: 535,
      stok: 3,
      tersedia: 3,
      lokasi_rak: 'Rak SF-02',
      deskripsi: 'Buku pertama dari Tetralogi Buru yang mengisahkan perjuangan Minke di era Hindia Belanda.',
      cover_gambar: '/uploads/covers/bumi-manusia.svg',
      kategori_id: catSastra.id,
    });

    const book5 = await Book.create({
      judul: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
      penulis: 'James Clear',
      penerbit: 'Gramedia Pustaka Utama',
      tahun_terbit: 2019,
      isbn: '978-6020633176',
      jumlah_halaman: 356,
      stok: 6,
      tersedia: 6,
      lokasi_rak: 'Rak BD-01',
      deskripsi: 'Cara mudah dan terbukti untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk.',
      cover_gambar: '/uploads/covers/atomic-habits.svg',
      kategori_id: catBisnis.id,
    });

    // 4. Seed Sample Borrowings & Fines
    console.log('[Seeder] Menambahkan data Peminjaman & Denda...');

    // Scenario 1: Active Loan (On-time, Due in 5 days)
    const today = new Date();
    const pinjam1Date = new Date(today);
    pinjam1Date.setDate(today.getDate() - 2); // 2 days ago
    const tempo1Date = new Date(pinjam1Date);
    tempo1Date.setDate(pinjam1Date.getDate() + 7); // due in 5 days

    await Borrowing.create({
      kode_pinjam: 'PJ-20261015-1001',
      user_id: member1.id,
      buku_id: book1.id,
      tanggal_pinjam: pinjam1Date.toISOString().split('T')[0],
      tanggal_jatuh_tempo: tempo1Date.toISOString().split('T')[0],
      status: 'DIPINJAM',
      catatan: 'Peminjaman pertama Budi untuk skripsi',
    });

    // Scenario 2: Overdue Loan (Borrowed 15 days ago, due 8 days ago)
    const pinjam2Date = new Date(today);
    pinjam2Date.setDate(today.getDate() - 15);
    const tempo2Date = new Date(pinjam2Date);
    tempo2Date.setDate(pinjam2Date.getDate() + 7); // was due 8 days ago!

    const overdueBorrowing = await Borrowing.create({
      kode_pinjam: 'PJ-20261002-1002',
      user_id: member2.id,
      buku_id: book2.id,
      tanggal_pinjam: pinjam2Date.toISOString().split('T')[0],
      tanggal_jatuh_tempo: tempo2Date.toISOString().split('T')[0],
      status: 'TERLAMBAT',
      catatan: 'Terlambat mengembalikan buku JavaScript',
    });

    // Scenario 3: Returned Loan with settled Fine
    const pinjam3Date = new Date(today);
    pinjam3Date.setDate(today.getDate() - 20);
    const tempo3Date = new Date(pinjam3Date);
    tempo3Date.setDate(pinjam3Date.getDate() + 7);
    const kembali3Date = new Date(tempo3Date);
    kembali3Date.setDate(tempo3Date.getDate() + 3); // 3 days late, returned and paid

    const returnedBorrowing = await Borrowing.create({
      kode_pinjam: 'PJ-20260927-1003',
      user_id: member1.id,
      buku_id: book3.id,
      tanggal_pinjam: pinjam3Date.toISOString().split('T')[0],
      tanggal_jatuh_tempo: tempo3Date.toISOString().split('T')[0],
      tanggal_kembali: kembali3Date.toISOString().split('T')[0],
      status: 'DIKEMBALIKAN',
      catatan: 'Pengembalian terlambat 3 hari dan telah lunas.',
    });

    await Fine.create({
      peminjaman_id: returnedBorrowing.id,
      user_id: member1.id,
      jumlah_hari_terlambat: 3,
      tarif_per_hari: 1000,
      total_denda: 3000,
      status_pembayaran: 'LUNAS',
      tanggal_bayar: kembali3Date,
      metode_pembayaran: 'TUNAI',
      catatan: 'Dibayar tunai di kasir perpustakaan',
    });

    console.log('=======================================================');
    console.log('✅ SEEDING BERHASIL SELESAI!');
    console.log('=======================================================');
    console.log('Akun Tersedia:');
    console.log('1. Admin: admin@perpustakaan.com | Password: admin123');
    console.log('2. Petugas: petugas@perpustakaan.com | Password: petugas123');
    console.log('3. Member 1: budi@gmail.com | Password: member123');
    console.log('4. Member 2: dewi@gmail.com | Password: member123');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Terjadi kesalahan saat seeding:', error);
    process.exit(1);
  }
};

seedDatabase();

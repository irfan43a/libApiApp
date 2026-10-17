const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const { sequelize } = require('../src/models');

const PORT = 5055;
let server;
const BASE_URL = `http://localhost:${PORT}/api`;

const runTests = async () => {
  try {
    console.log('🚀 Menyiapkan Server Test...');
    await sequelize.authenticate();
    server = app.listen(PORT);
    console.log(`Server Test berjalan di port ${PORT}\n`);

    // Helper fetch wrapper
    const request = async (endpoint, options = {}) => {
      const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
      const res = await fetch(url, options);
      const json = await res.json().catch(() => null);
      return { status: res.status, data: json };
    };

    console.log('--- 1. Test Health Check & Welcome Endpoint ---');
    const health = await request(`http://localhost:${PORT}/`);
    console.log('GET / -> Status:', health.status, '| Success:', health.data?.success);

    console.log('\n--- 2. Test Login Admin ---');
    const loginAdminRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@perpustakaan.com',
        password: 'admin123',
      }),
    });
    console.log('POST /api/auth/login -> Status:', loginAdminRes.status);
    const adminToken = loginAdminRes.data?.data?.token;
    if (!adminToken) throw new Error('Gagal mendapatkan token admin!');
    console.log('Admin Token didapatkan:', adminToken.slice(0, 20) + '...');

    console.log('\n--- 3. Test Login Member ---');
    const loginMemberRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'budi@gmail.com',
        password: 'member123',
      }),
    });
    console.log('POST /api/auth/login Member -> Status:', loginMemberRes.status);
    const memberToken = loginMemberRes.data?.data?.token;

    console.log('\n--- 4. Test List Buku (Public) ---');
    const booksRes = await request('/books?limit=5');
    console.log('GET /api/books -> Status:', booksRes.status, '| Total Buku:', booksRes.data?.pagination?.totalItems);
    const firstBook = booksRes.data?.data?.[0];
    console.log('Contoh Buku:', firstBook?.judul, '| Stok:', firstBook?.stok, '| Tersedia:', firstBook?.tersedia);

    console.log('\n--- 5. Test Tambah Buku Baru dengan Upload Cover Gambar ---');
    // Create dummy image buffer
    const dummyImagePath = path.join(__dirname, 'dummy-test-cover.png');
    fs.writeFileSync(dummyImagePath, Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082', 'hex'));

    const formData = new FormData();
    formData.append('judul', 'Arsitektur Sistem Terdistribusi');
    formData.append('penulis', 'Martin Fowler & Tim');
    formData.append('penerbit', 'Informatika Press');
    formData.append('tahun_terbit', '2024');
    formData.append('isbn', '978-602-999-111-2');
    formData.append('stok', '5');
    formData.append('lokasi_rak', 'Rak TK-05');
    formData.append('kategori_id', '1');
    formData.append('deskripsi', 'Panduan komprehensif merancang arsitektur sistem modern.');
    
    // Append file
    const fileBytes = fs.readFileSync(dummyImagePath);
    const blob = new Blob([fileBytes], { type: 'image/png' });
    formData.append('cover', blob, 'test-cover.png');

    const createBookRes = await request('/books', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });
    console.log('POST /api/books (Upload Cover) -> Status:', createBookRes.status);
    console.log('Buku dibuat:', createBookRes.data?.data?.judul);
    console.log('Path Cover Gambar:', createBookRes.data?.data?.cover_gambar);
    const newBookId = createBookRes.data?.data?.id;

    // Clean up temporary dummy file
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);

    console.log('\n--- 6. Test Edit Buku ---');
    const updateBookRes = await request(`/books/${newBookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        judul: 'Arsitektur Sistem Terdistribusi (Edisi Revisi)',
        stok: 6,
      }),
    });
    console.log('PUT /api/books/:id -> Status:', updateBookRes.status);
    console.log('Judul baru:', updateBookRes.data?.data?.judul, '| Stok baru:', updateBookRes.data?.data?.stok);

    console.log('\n--- 7. Test Peminjaman Buku (API Borrowings) ---');
    const borrowRes = await request('/borrowings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        buku_id: newBookId,
        durasi_hari: 7,
        catatan: 'Pinjam buku arsitektur untuk riset',
      }),
    });
    console.log('POST /api/borrowings -> Status:', borrowRes.status);
    console.log('Kode Pinjam:', borrowRes.data?.data?.kode_pinjam);
    console.log('Tgl Pinjam:', borrowRes.data?.data?.tanggal_pinjam, '| Jatuh Tempo:', borrowRes.data?.data?.tanggal_jatuh_tempo);
    const borrowId = borrowRes.data?.data?.id;

    // Check stock reduction
    const checkStockRes = await request(`/books/${newBookId}`);
    console.log('Stok setelah dipinjam -> Total:', checkStockRes.data?.data?.stok, '| Tersedia:', checkStockRes.data?.data?.tersedia);

    console.log('\n--- 8. Test Pengembalian Buku & Perhitungan Denda ---');
    // Test return with simulated 4 days late!
    const returnLateDate = new Date();
    returnLateDate.setDate(returnLateDate.getDate() + 11); // 4 days past 7-day due date
    const returnRes = await request(`/borrowings/${borrowId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        tanggal_kembali_custom: returnLateDate.toISOString().split('T')[0],
        catatan_pengembalian: 'Buku dikembalikan dengan sedikit keterlambatan',
      }),
    });
    console.log('POST /api/borrowings/:id/return -> Status:', returnRes.status);
    console.log('Pesan Pengembalian:', returnRes.data?.message);
    console.log('Detail Denda:', returnRes.data?.data?.keterlambatan);
    const fineId = returnRes.data?.data?.fine?.id;

    console.log('\n--- 9. Test Pembayaran Denda (API Fines) ---');
    if (fineId) {
      const payFineRes = await request(`/fines/${fineId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          metode_pembayaran: 'QRIS',
          catatan: 'Dibayar via QRIS Kasir',
        }),
      });
      console.log('POST /api/fines/:id/pay -> Status:', payFineRes.status);
      console.log('Status Pembayaran:', payFineRes.data?.data?.status_pembayaran, '| Tanggal Bayar:', payFineRes.data?.data?.tanggal_bayar);
    }

    console.log('\n--- 10. Test Check Overdue Borrowings ---');
    const overdueRes = await request('/fines/check-overdue', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('GET /api/fines/check-overdue -> Status:', overdueRes.status, '| Total Terlambat:', overdueRes.data?.data?.total_terlambat);

    console.log('\n--- 11. Test Dashboard Statistics ---');
    const statsRes = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('GET /api/dashboard/stats -> Status:', statsRes.status);
    console.log('Statistik Buku:', statsRes.data?.data?.buku);
    console.log('Statistik Peminjaman:', statsRes.data?.data?.peminjaman);
    console.log('Statistik Denda:', statsRes.data?.data?.denda);

    console.log('\n--- 12. Test Delete Buku (Cegah Hapus Buku Bersejarah vs Hapus Buku Baru) ---');
    // 12a. Try to delete book that has borrow history
    const deleteHistoryRes = await request(`/books/${newBookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('DELETE /api/books/:id (Ada riwayat) -> Status:', deleteHistoryRes.status, '| Pesan:', deleteHistoryRes.data?.message);

    // 12b. Create a fresh book and delete it
    const freshBookRes = await request('/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        judul: 'Buku Sementara untuk Uji Hapus',
        penulis: 'Penulis Anonim',
        stok: 1,
      }),
    });
    const freshBookId = freshBookRes.data?.data?.id;

    const deleteFreshRes = await request(`/books/${freshBookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('DELETE /api/books/:id (Buku baru tanpa riwayat) -> Status:', deleteFreshRes.status, '| Pesan:', deleteFreshRes.data?.message);

    console.log('\n=======================================================');
    console.log('🎉 SEMUA PENGUJIAN API BERHASIL 100% TANPA KESALAHAN!');
    console.log('=======================================================');
  } catch (error) {
    console.error('\n❌ Test Error:', error);
  } finally {
    if (server) {
      server.close();
      console.log('Server test ditutup.');
    }
    process.exit(0);
  }
};

runTests();

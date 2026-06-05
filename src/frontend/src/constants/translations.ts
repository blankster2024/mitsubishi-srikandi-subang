export const LABELS = {
  // Common
  name: "Nama",
  email: "Email",
  phone: "Telepon",
  save: "Simpan",
  cancel: "Batal",
  edit: "Edit",
  delete: "Hapus",
  add: "Tambah",
  search: "Cari",
  filter: "Filter",

  // Vehicle
  vehicleName: "Nama Kendaraan",
  description: "Deskripsi",
  basePrice: "Harga Mulai",
  publishStatus: "Status Publikasi",
  variant: "Varian",
  color: "Warna",
  specification: "Spesifikasi",
  feature: "Fitur",

  // Status
  published: "Dipublikasi",
  draft: "Draft",
  active: "Aktif",
  inactive: "Tidak Aktif",

  // Public Pages
  beranda: "Beranda",
  mobilKeluarga: "Mobil Keluarga",
  mobilNiaga: "Mobil Niaga",
  promo: "Promo",
  testimoni: "Testimoni",
  blog: "Blog",
  hubungiKami: "Hubungi Kami",
  simulasiKredit: "Simulasi Kredit",
  hargaMulai: "Harga Mulai",
  lihatDetail: "Lihat Detail",
  hubungiSales: "Hubungi Sales",
  downloadBrosur: "Download Brosur",
  pilihVarian: "Pilih Varian",
  pilihWarna: "Pilih Warna",
  spesifikasi: "Spesifikasi",
  fitur: "Fitur",
  kirimData: "Kirim Data",
  kirimPesan: "Kirim Pesan",
};

export const VALIDATION = {
  required: "Wajib diisi",
  invalidEmail: "Email tidak valid",
  invalidPhone: "Nomor telepon tidak valid",
  minLength: (min: number) => `Minimal ${min} karakter`,
  maxLength: (max: number) => `Maksimal ${max} karakter`,
};

export const MESSAGES = {
  success: {
    save: "Data berhasil disimpan",
    update: "Data berhasil diperbarui",
    delete: "Data berhasil dihapus",
    submit: "Data berhasil dikirim",
  },
  error: {
    save: "Gagal menyimpan data",
    update: "Gagal memperbarui data",
    delete: "Gagal menghapus data",
    load: "Gagal memuat data",
    submit: "Gagal mengirim data",
  },
  confirm: {
    delete: "Apakah Anda yakin ingin menghapus data ini?",
  },
};

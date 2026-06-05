import { useActor } from "@/hooks/useActor";
import { useGetCommercialVehiclesByCategory } from "@/hooks/useCommercialVehicles";
import { useAddLead } from "@/hooks/useCreditSimulation";
import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import { useGetWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

// ─── helpers ─────────────────────────────────────────────────
function formatRupiah(value: number): string {
  if (!value) return "";
  return value.toLocaleString("id-ID");
}

function parseRupiah(str: string): number {
  return Number(str.replace(/[^0-9]/g, "")) || 0;
}

function handleRupiahInput(raw: string, setter: (v: string) => void) {
  const num = parseRupiah(raw);
  setter(num ? formatRupiah(num) : "");
}

const COMMERCIAL_CATEGORIES = [
  { label: "Light Duty", slug: "light-duty" },
  { label: "Medium Duty", slug: "medium-duty" },
  { label: "Tractor Head", slug: "tractor-head" },
];

// ─── component ───────────────────────────────────────────────
export default function KontakPage() {
  const { data: settings } = useGetWebsiteSettings();
  const { actor } = useActor();
  const [consultantPhotoUrl, setConsultantPhotoUrl] = useState<string | null>(
    null,
  );

  // ── contact info from settings ──────────────────────────────
  const phone = settings?.contactPhone || "0852-1234-0778";
  const emailContact = settings?.contactEmail || "fuadmitsubishi2025@gmail.com";
  const address =
    settings?.dealerAddress ||
    "Jl. Otto Iskandardinata No.314, Subang Jawa Barat 41211";
  const operationalHours =
    settings?.operationalHours || "Senin - Sabtu, 08:30 - 16:00";
  const waNumber = settings?.contactWhatsapp
    ? settings.contactWhatsapp.replace(/\D/g, "")
    : "6285212340778";
  const waLink = `https://wa.me/${waNumber}?text=Hai..%20Saya%20tertarik%20dengan%20produk%20mobil%20Mitsubishi..`;
  const consultantName = settings?.salesConsultantName || "Sales Consultant";
  const consultantPhotoId = settings?.salesConsultantPhotoId ?? null;
  const consultantInitial = consultantName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!consultantPhotoId || !actor) {
      setConsultantPhotoUrl(null);
      return;
    }
    let cancelled = false;
    actor
      .getPublicMediaAssetById(consultantPhotoId)
      .then((asset) => {
        if (cancelled) return;
        setConsultantPhotoUrl(asset?.storageUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setConsultantPhotoUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [consultantPhotoId, actor]);

  // ── form state ──────────────────────────────────────────────
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [email, setEmail] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [jenisKendaraan, setJenisKendaraan] = useState<
    "" | "Mobil Keluarga" | "Mobil Niaga"
  >("");
  const [kategori, setKategori] = useState("");
  const [tipeKendaraan, setTipeKendaraan] = useState("");
  const [otr, setOtr] = useState("");
  const [dp, setDp] = useState("");
  const [tenor, setTenor] = useState("");
  const [pesan, setPesan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── vehicle data hooks ─────────────────────────────────────
  const { data: passengerVehicles = [] } = useGetPublishedVehicles();
  const categorySlug =
    COMMERCIAL_CATEGORIES.find((c) => c.label === kategori)?.slug ?? "";
  const { data: commercialVehicles = [] } = useGetCommercialVehiclesByCategory(
    jenisKendaraan === "Mobil Niaga" ? categorySlug : "",
  );

  // ── mutations ──────────────────────────────────────────────
  const addLead = useAddLead();

  // ── derived vehicle list ───────────────────────────────────
  const vehicleOptions: { name: string; price: number }[] =
    jenisKendaraan === "Mobil Keluarga"
      ? passengerVehicles.map((v) => ({
          name: v.vehicleName,
          price: v.variants[0] ? Number(v.variants[0].price) : 0,
        }))
      : jenisKendaraan === "Mobil Niaga" && kategori
        ? commercialVehicles.map((v) => ({
            name: v.name,
            price: v.chassisPrice,
          }))
        : [];

  const showKategori = jenisKendaraan === "Mobil Niaga";
  const showTipe =
    jenisKendaraan === "Mobil Keluarga" ||
    (jenisKendaraan === "Mobil Niaga" && !!kategori);

  function handleJenisChange(val: "" | "Mobil Keluarga" | "Mobil Niaga") {
    setJenisKendaraan(val);
    setKategori("");
    setTipeKendaraan("");
    setOtr("");
  }

  function handleKategoriChange(val: string) {
    setKategori(val);
    setTipeKendaraan("");
    setOtr("");
  }

  function handleTipeChange(val: string) {
    setTipeKendaraan(val);
    const found = vehicleOptions.find((v) => v.name === val);
    if (found) setOtr(formatRupiah(found.price));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const otrNum = parseRupiah(otr);
    const dpNum = parseRupiah(dp);
    const tenorNum = Number(tenor);
    const kategoriLabel =
      jenisKendaraan === "Mobil Keluarga" ? "-" : kategori || "-";

    const fmtOtr = otrNum ? formatRupiah(otrNum) : "0";
    const fmtDp = dpNum ? formatRupiah(dpNum) : "0";

    const waMsg = `Halo Mitsubishi Srikandi Subang,\nSaya tertarik dengan produk mobil Mitsubishi dan ingin konsultasi :\n \nNama           : ${nama}\nAlamat         : ${alamat}\nWhatsApp    : ${noTelp}\nEmail            : ${email}\n \nJenis Mobil : ${jenisKendaraan || "-"}\nKategori       : ${kategoriLabel}\nTipe              : ${tipeKendaraan || "-"}\n \nOTR                 : Rp ${fmtOtr}\nDP                   : Rp ${fmtDp}\nTenor              : ${tenorNum || "-"} Tahun\n \nPesan : ${pesan}`;

    // Save lead to backend (non-blocking)
    try {
      await addLead.mutateAsync({
        name: nama,
        address: alamat,
        email,
        phone: noTelp,
        vehicleType: tipeKendaraan || jenisKendaraan || "-",
        otr: otrNum,
        dp: dpNum,
        tenor: tenorNum,
        monthlyInstallment: 0,
        source: "kontak",
        createdAt: Date.now() * 1_000_000,
      });
    } catch (err) {
      console.error(err);
      // still open WhatsApp even if lead save fails
    }

    const waUrl = `https://wa.me/6285212340778?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    setSubmitted(true);
    setNama("");
    setAlamat("");
    setEmail("");
    setNoTelp("");
    setJenisKendaraan("");
    setKategori("");
    setTipeKendaraan("");
    setOtr("");
    setDp("");
    setTenor("");
    setPesan("");
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 5000);
  }

  const inputCls =
    "border border-gray-300 rounded-sm px-4 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors placeholder:text-gray-400";

  return (
    <div className="bg-white">
      <main>
        {/* ── 13.1 Hero Section ─────────────────────────────────────── */}
        <section
          aria-label="Hero Kontak"
          className="h-[150px] md:h-[250px] bg-[#CC0000] flex items-center justify-center"
        >
          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
              <Phone
                className="w-6 h-6 md:w-8 md:h-8 text-white"
                aria-hidden="true"
              />
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
                Hubungi Kami
              </h1>
            </div>
            <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90 text-white">
              Hubungi kami untuk konsultasi dan informasi lebih lanjut.
            </p>
          </div>
        </section>

        {/* ── 13.2 + 13.3 Kirim Pesan & Info ────────────────────────── */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-10 lg:gap-12">
              {/* Left: Form */}
              <div>
                <h2 className="text-2xl font-bold text-[#333333] mb-1">
                  Kirim Pesan
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Isi formulir berikut dan tim kami akan segera menghubungi
                  Anda.
                </p>

                {submitted && (
                  <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">
                    Pesan berhasil dikirim! Tim kami akan segera menghubungi
                    Anda.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* A. Data Diri */}
                  <div className="bg-gray-50 border border-gray-100 rounded-sm p-4 space-y-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Data Diri
                    </p>
                    <div>
                      <label
                        htmlFor="k-nama"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nama Lengkap <span className="text-[#CC0000]">*</span>
                      </label>
                      <input
                        id="k-nama"
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Isi nama lengkap Anda"
                        className={inputCls}
                        data-ocid="kontak.nama_input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="k-alamat"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Alamat Lengkap <span className="text-[#CC0000]">*</span>
                      </label>
                      <textarea
                        id="k-alamat"
                        required
                        rows={3}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        placeholder="Isi alamat lengkap Anda"
                        className={`${inputCls} resize-none`}
                        data-ocid="kontak.alamat_input"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="k-email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email <span className="text-[#CC0000]">*</span>
                        </label>
                        <input
                          id="k-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Isi dengan Email aktif"
                          className={inputCls}
                          data-ocid="kontak.email_input"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="k-telp"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nomor Telp / WhatsApp{" "}
                          <span className="text-[#CC0000]">*</span>
                        </label>
                        <input
                          id="k-telp"
                          type="text"
                          required
                          value={noTelp}
                          onChange={(e) => setNoTelp(e.target.value)}
                          placeholder="Isi dengan No. Telp / WhatsApp aktif"
                          className={inputCls}
                          data-ocid="kontak.telp_input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* B. Data Kendaraan */}
                  <div className="bg-gray-50 border border-gray-100 rounded-sm p-4 space-y-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Data Kendaraan
                    </p>
                    <div>
                      <label
                        htmlFor="k-jenis"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Jenis Kendaraan
                      </label>
                      <select
                        id="k-jenis"
                        value={jenisKendaraan}
                        onChange={(e) =>
                          handleJenisChange(
                            e.target.value as
                              | ""
                              | "Mobil Keluarga"
                              | "Mobil Niaga",
                          )
                        }
                        className={inputCls}
                        data-ocid="kontak.jenis_select"
                      >
                        <option value="" disabled>
                          Pilih jenis kendaraan
                        </option>
                        <option value="Mobil Keluarga">Mobil Keluarga</option>
                        <option value="Mobil Niaga">Mobil Niaga</option>
                      </select>
                    </div>
                    {showKategori && (
                      <div>
                        <label
                          htmlFor="k-kategori"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Kategori Kendaraan
                        </label>
                        <select
                          id="k-kategori"
                          value={kategori}
                          onChange={(e) => handleKategoriChange(e.target.value)}
                          className={inputCls}
                          data-ocid="kontak.kategori_select"
                        >
                          <option value="" disabled>
                            Pilih kategori kendaraan
                          </option>
                          {COMMERCIAL_CATEGORIES.map((c) => (
                            <option key={c.slug} value={c.label}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {showTipe && (
                      <div>
                        <label
                          htmlFor="k-tipe"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Tipe Kendaraan
                        </label>
                        <select
                          id="k-tipe"
                          value={tipeKendaraan}
                          onChange={(e) => handleTipeChange(e.target.value)}
                          className={inputCls}
                          data-ocid="kontak.tipe_select"
                        >
                          <option value="" disabled>
                            Pilih tipe kendaraan
                          </option>
                          {vehicleOptions.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* C. Data Pembelian */}
                  <div className="bg-gray-50 border border-gray-100 rounded-sm p-4 space-y-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Data Pembelian
                    </p>
                    <div>
                      <label
                        htmlFor="k-otr"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        OTR
                      </label>
                      <input
                        id="k-otr"
                        type="text"
                        value={otr}
                        onChange={(e) =>
                          handleRupiahInput(e.target.value, setOtr)
                        }
                        placeholder="Rp. 0"
                        className={inputCls}
                        data-ocid="kontak.otr_input"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="k-dp"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          DP
                        </label>
                        <input
                          id="k-dp"
                          type="text"
                          value={dp}
                          onChange={(e) =>
                            handleRupiahInput(e.target.value, setDp)
                          }
                          placeholder="Rp. 0"
                          className={inputCls}
                          data-ocid="kontak.dp_input"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="k-tenor"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Tenor
                        </label>
                        <select
                          id="k-tenor"
                          value={tenor}
                          onChange={(e) => setTenor(e.target.value)}
                          className={inputCls}
                          data-ocid="kontak.tenor_select"
                        >
                          <option value="" disabled>
                            Pilih tenor
                          </option>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((y) => (
                            <option key={y} value={y}>
                              {y} Tahun
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pesan */}
                  <div>
                    <label
                      htmlFor="k-pesan"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Pesan
                    </label>
                    <textarea
                      id="k-pesan"
                      rows={4}
                      value={pesan}
                      onChange={(e) => setPesan(e.target.value)}
                      placeholder="Tulis pesan Anda di sini"
                      className={`${inputCls} resize-none`}
                      data-ocid="kontak.pesan_input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    data-ocid="kontak.submit_button"
                    className="w-full bg-[#CC0000] text-white font-semibold rounded-sm py-3 hover:bg-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  >
                    {submitting ? "Mengirim..." : "Kirim Pesan"}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    *Setelah pesan terkirim Anda akan segera dihubungi oleh
                    Sales Consultant kami.
                  </p>
                </form>
              </div>

              {/* Right: Info Kontak + Sales Consultant */}
              <div className="flex flex-col gap-6">
                {/* Informasi Kontak */}
                <div>
                  <h3 className="text-xl font-bold text-[#333333] mb-5">
                    Informasi Kontak
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Phone size={18} className="text-[#CC0000]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                          WhatsApp / Telepon
                        </p>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-[#CC0000] transition-colors"
                        >
                          {phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Mail size={18} className="text-[#CC0000]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                          Email
                        </p>
                        <a
                          href={`mailto:${emailContact}`}
                          className="text-sm font-medium text-gray-800 hover:text-[#CC0000] transition-colors break-all"
                        >
                          {emailContact}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Clock size={18} className="text-[#CC0000]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                          Jam Operasional
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {operationalHours}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-[#CC0000]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                          Alamat
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {address}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-sm">
                    <p className="text-sm text-gray-600 mb-3">
                      Lebih mudah melalui WhatsApp? Hubungi kami langsung
                      sekarang.
                    </p>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid="kontak.primary_button"
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-sm hover:bg-[#1ebe57] transition-colors"
                    >
                      <MessageCircle size={16} />
                      Chat via WhatsApp
                    </a>
                  </div>
                </div>

                {/* Sales Consultant — vertical portrait card */}
                <div className="bg-gray-50 rounded-sm overflow-hidden border border-gray-100 shadow-sm flex flex-col flex-1">
                  {/* Photo — full width, portrait */}
                  <div
                    className="w-full overflow-hidden bg-gray-200"
                    style={{ minHeight: "260px", maxHeight: "360px" }}
                  >
                    {consultantPhotoUrl ? (
                      <img
                        src={consultantPhotoUrl}
                        alt={consultantName}
                        className="w-full h-full object-cover object-top"
                        style={{ minHeight: "260px", maxHeight: "360px" }}
                      />
                    ) : (
                      <div
                        className="w-full bg-gradient-to-b from-[#CC0000] to-[#8B0000] flex items-center justify-center"
                        style={{ minHeight: "260px", maxHeight: "360px" }}
                      >
                        <span
                          className="text-white font-bold"
                          style={{ fontSize: "5rem", lineHeight: 1 }}
                        >
                          {consultantInitial}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#CC0000] uppercase tracking-widest mb-1">
                        Sales Consultant
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {consultantName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Mitsubishi Srikandi Subang
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-[#CC0000] shrink-0" />
                        <span>{phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} className="text-[#CC0000] shrink-0" />
                        <span>{operationalHours}</span>
                      </div>
                    </div>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-[#1ebe57] transition-colors"
                    >
                      <MessageCircle size={15} />
                      Hubungi via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Info Dealer */}
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto py-8 md:py-10 px-4">
            <h2 className="text-2xl font-bold text-[#333333] mb-8">
              Info Dealer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 border border-gray-100 rounded-sm p-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <MapPin size={22} className="text-[#CC0000]" />
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Alamat
                </p>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {address}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-sm p-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Phone size={22} className="text-[#CC0000]" />
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Telepon / WhatsApp
                </p>
                <a
                  href={`tel:${phone}`}
                  className="text-sm text-gray-800 font-medium hover:text-[#CC0000] transition-colors block"
                >
                  {phone}
                </a>
                <a
                  href={`mailto:${emailContact}`}
                  className="text-sm text-gray-500 hover:text-[#CC0000] transition-colors block mt-1 break-all"
                >
                  {emailContact}
                </a>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-sm p-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Clock size={22} className="text-[#CC0000]" />
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Jam Operasional
                </p>
                <p className="text-sm text-gray-800 font-medium">
                  {operationalHours}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Minggu &amp; Hari Libur Nasional: Tutup
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Lokasi */}
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto py-8 md:py-10 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="text-2xl font-bold text-[#333333] mb-4">
                  Lokasi Kami
                </h2>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin
                    size={18}
                    className="text-[#CC0000] mt-0.5 shrink-0"
                  />
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {address}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Kami berlokasi di pusat kota Subang, mudah dijangkau dari
                  berbagai arah. Kunjungi showroom kami dan temukan kendaraan
                  impian Anda.
                </p>
                <a
                  href="https://www.google.com/maps?q=-6.5518470,107.7754491"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#CC0000] text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-red-800 transition-colors"
                >
                  <MapPin size={16} />
                  Buka di Google Maps
                </a>
              </div>
              <div className="rounded-sm overflow-hidden h-80 lg:h-full min-h-[320px]">
                <iframe
                  src="https://www.google.com/maps?q=-6.5518470,107.7754491&z=17&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Mitsubishi Srikandi Subang"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

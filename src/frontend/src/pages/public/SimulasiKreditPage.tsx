import { useGetCommercialVehiclesByCategory } from "@/hooks/useCommercialVehicles";
import {
  useAddLead,
  useGetAllCreditRequirementTabs,
  useGetCreditSettings,
} from "@/hooks/useCreditSimulation";
import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import { Calculator, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Helpers ────────────────────────────────────────────────
function formatRupiah(n: number): string {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("id-ID");
}

const INPUT_CLASS =
  "border border-gray-300 rounded-sm px-4 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors placeholder:text-gray-400 bg-white";

const SELECT_CLASS =
  "border border-gray-300 rounded-sm px-4 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors appearance-none cursor-pointer bg-white placeholder:text-gray-400";

const GROUP_LABEL_CLASS =
  "text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3";

const CARD_CLASS =
  "bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-4";

type DpMode = "nominal" | "percent";
type VehicleTypeVal = "passenger" | "commercial" | "";

interface SimResult {
  dp: number;
  nilaiPembiayaan: number;
  pokokKredit: number;
  bungaTotal: number;
  totalHutang: number;
  angsuranPerBulan: number;
}

// ─── Skeleton ───────────────────────────────────────────────
function FieldSkeleton() {
  return <div className="h-9 bg-gray-100 rounded animate-pulse w-full" />;
}

// ─── Main Component ─────────────────────────────────────────
export default function SimulasiKreditPage() {
  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleTypeVal>("");
  const [vehicleCategory, setVehicleCategory] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicleName, setSelectedVehicleName] = useState("");
  const [otr, setOtr] = useState(0);
  const [otrDisplay, setOtrDisplay] = useState("");
  const [dpMode, setDpMode] = useState<DpMode>("nominal");
  const [dp, setDp] = useState(0);
  const [dpDisplay, setDpDisplay] = useState("");
  const [dpPercent, setDpPercent] = useState(0);
  const [tenor, setTenor] = useState(0);
  const [simulationResult, setSimulationResult] = useState<SimResult | null>(
    null,
  );
  const [activeTabId, setActiveTabId] = useState("");

  // Page title
  useEffect(() => {
    document.title = "Simulasi Kredit — Mitsubishi Srikandi Subang";
  }, []);

  // ─── Hooks (always called) ──────────────────────────────
  const { data: creditSettings } = useGetCreditSettings();
  const { data: tabs } = useGetAllCreditRequirementTabs();
  const { data: passengerVehicles } = useGetPublishedVehicles();
  const { data: commercialVehicles } = useGetCommercialVehiclesByCategory(
    vehicleCategory || "",
  );
  const addLeadMutation = useAddLead();

  // Auto-set first tab
  useEffect(() => {
    if (tabs && tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  // ─── Vehicle dropdown options ──────────────────────────
  const vehicleOptions =
    vehicleType === "passenger"
      ? (passengerVehicles ?? []).map((v) => ({
          value: v.id.toString(),
          label: v.vehicleName,
          price:
            v.variants && v.variants.length > 0
              ? Number(
                  v.variants.reduce(
                    (min, vr) =>
                      Number(vr.price) < min ? Number(vr.price) : min,
                    Number(v.variants[0].price),
                  ),
                )
              : 0,
        }))
      : vehicleType === "commercial"
        ? (commercialVehicles ?? []).map((v) => ({
            value: v.id,
            label: v.name,
            price: v.chassisPrice,
          }))
        : [];

  // ─── Auto-fill OTR when vehicle selected ───────────────
  function handleVehicleSelect(value: string) {
    setSelectedVehicleId(value);
    const found = vehicleOptions.find((o) => o.value === value);
    if (found) {
      setSelectedVehicleName(found.label);
      setOtr(found.price);
      setOtrDisplay(found.price > 0 ? found.price.toLocaleString("id-ID") : "");
    } else {
      setSelectedVehicleName("");
      setOtr(0);
      setOtrDisplay("");
    }
  }

  // Reset cascades
  function handleVehicleTypeChange(value: VehicleTypeVal) {
    setVehicleType(value);
    setVehicleCategory("");
    setSelectedVehicleId("");
    setSelectedVehicleName("");
    setOtr(0);
    setOtrDisplay("");
  }

  function handleVehicleCategoryChange(value: string) {
    setVehicleCategory(value);
    setSelectedVehicleId("");
    setSelectedVehicleName("");
    setOtr(0);
    setOtrDisplay("");
  }

  // ─── OTR input handling ────────────────────────────────
  function handleOtrChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    const num = digits ? Number.parseInt(digits, 10) : 0;
    setOtr(num);
    setOtrDisplay(num ? num.toLocaleString("id-ID") : "");
  }

  // ─── DP input handling ────────────────────────────────
  function handleDpChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    const num = digits ? Number.parseInt(digits, 10) : 0;
    setDp(num);
    setDpDisplay(num ? num.toLocaleString("id-ID") : "");
  }

  // ─── Calculation ───────────────────────────────────────
  function runSimulation() {
    if (!creditSettings || !otr || !tenor) return;

    const tenorBulan = tenor * 12;
    const dpNominal =
      dpMode === "percent" ? Math.round(otr * (dpPercent / 100)) : dp;
    const asuransi = otr * (creditSettings.insurancePercent / 100);
    const provisi = otr * (creditSettings.provisionPercent / 100);
    const nilaiPembiayaan = otr + creditSettings.adminFee + asuransi + provisi;
    const pokokKredit = nilaiPembiayaan - dpNominal;
    const bungaTotal =
      pokokKredit *
      (creditSettings.interestRatePerYear / 100) *
      (tenorBulan / 12);
    const totalHutang = pokokKredit + bungaTotal;
    const angsuranPerBulan = tenorBulan > 0 ? totalHutang / tenorBulan : 0;

    const result: SimResult = {
      dp: Math.round(dpNominal),
      nilaiPembiayaan: Math.round(nilaiPembiayaan),
      pokokKredit: Math.round(pokokKredit),
      bungaTotal: Math.round(bungaTotal),
      totalHutang: Math.round(totalHutang),
      angsuranPerBulan: Math.round(angsuranPerBulan),
    };

    setSimulationResult(result);

    // Save lead
    addLeadMutation.mutate({
      name,
      address,
      email,
      phone,
      vehicleType: selectedVehicleName || "",
      otr,
      dp: Math.round(dpNominal),
      tenor,
      monthlyInstallment: Math.round(angsuranPerBulan),
      source: "simulasi-kredit",
      createdAt: Date.now() * 1_000_000,
    });
  }

  // ─── WhatsApp message ──────────────────────────────────
  function buildWaUrl(): string {
    if (!simulationResult) return "#";
    const jenisLabel =
      vehicleType === "passenger"
        ? "Mobil Keluarga"
        : vehicleType === "commercial"
          ? "Mobil Niaga"
          : "-";
    const kategoriLabel =
      vehicleCategory === "light-duty"
        ? "Light Duty"
        : vehicleCategory === "medium-duty"
          ? "Medium Duty"
          : vehicleCategory === "tractor-head"
            ? "Tractor Head"
            : "-";
    const dpNominal =
      dpMode === "percent" ? Math.round(otr * (dpPercent / 100)) : dp;
    const msg = `Halo Mitsubishi Srikandi Subang,\nSaya ingin konsultasi kredit mobil dengan detail berikut:\n\nNama           : ${name}\nAlamat         : ${address}\nWhatsApp       : ${phone}\nEmail          : ${email}\n\nJenis Mobil    : ${jenisLabel}\nKategori        : ${kategoriLabel}\nTipe             : ${selectedVehicleName || "-"}\n\nSimulasi Kredit:\nOTR              : Rp ${formatNumber(otr)}\nDP               : Rp ${formatNumber(dpNominal)}\nTenor           : ${tenor} Tahun\n\nEstimasi Angsuran:\nRp ${formatNumber(simulationResult.angsuranPerBulan)} / bulan\n\nMohon dibantu informasi dan penawaran terbaiknya. Terima kasih.`;
    return `https://wa.me/6285212340778?text=${encodeURIComponent(msg)}`;
  }

  // ─── Active tab content ────────────────────────────────
  const activeTab = (tabs ?? []).find((t) => t.id === activeTabId);

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section
        aria-label="Hero Simulasi Kredit"
        className="h-[150px] md:h-[250px] bg-[#CC0000] flex items-center justify-center"
      >
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Calculator
              className="w-6 h-6 md:w-8 md:h-8 text-white"
              aria-hidden="true"
            />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Simulasi Kredit
            </h1>
          </div>
          <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90 text-white">
            Hitung estimasi cicilan kendaraan Anda.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* ══════════════════════════════════════════════
              LEFT COLUMN — FORM
          ══════════════════════════════════════════════ */}
          <div className="md:w-[55%]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Form Simulasi Kredit
            </h2>

            {/* Group A: Data Diri */}
            <div className={CARD_CLASS}>
              <div className={GROUP_LABEL_CLASS}>Data Diri</div>
              <div className="space-y-3">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="sim-name"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    id="sim-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Isi nama lengkap Anda"
                    className={INPUT_CLASS}
                    data-ocid="simulasi.name.input"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="sim-address"
                  >
                    Alamat
                  </label>
                  <textarea
                    id="sim-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Isi alamat lengkap Anda"
                    className={`${INPUT_CLASS} resize-none`}
                    data-ocid="simulasi.address.input"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="sim-email"
                  >
                    Email
                  </label>
                  <input
                    id="sim-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Isi dengan Email aktif"
                    className={INPUT_CLASS}
                    data-ocid="simulasi.email.input"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="sim-phone"
                  >
                    Nomor Telp / WhatsApp
                  </label>
                  <input
                    id="sim-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Isi dengan No. Telp / WhatsApp aktif"
                    className={INPUT_CLASS}
                    data-ocid="simulasi.phone.input"
                  />
                </div>
              </div>
            </div>

            {/* Group B: Data Kendaraan */}
            <div className={CARD_CLASS}>
              <div className={GROUP_LABEL_CLASS}>Data Kendaraan</div>
              <div className="space-y-3">
                {/* Jenis Kendaraan */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="sim-vehicle-type"
                  >
                    Jenis Kendaraan
                  </label>
                  <div className="relative">
                    <select
                      id="sim-vehicle-type"
                      value={vehicleType}
                      onChange={(e) =>
                        handleVehicleTypeChange(
                          e.target.value as VehicleTypeVal,
                        )
                      }
                      className={SELECT_CLASS}
                      data-ocid="simulasi.vehicle_type.select"
                    >
                      <option value="" disabled>
                        Pilih jenis kendaraan
                      </option>
                      <option value="passenger">Mobil Keluarga</option>
                      <option value="commercial">Mobil Niaga</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ▾
                    </span>
                  </div>
                </div>

                {/* Kategori Kendaraan — only for commercial */}
                {vehicleType === "commercial" && (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="sim-vehicle-cat"
                    >
                      Kategori Kendaraan
                    </label>
                    <div className="relative">
                      <select
                        id="sim-vehicle-cat"
                        value={vehicleCategory}
                        onChange={(e) =>
                          handleVehicleCategoryChange(e.target.value)
                        }
                        className={SELECT_CLASS}
                        data-ocid="simulasi.vehicle_category.select"
                      >
                        <option value="" disabled>
                          Pilih kategori kendaraan
                        </option>
                        <option value="light-duty">Light Duty</option>
                        <option value="medium-duty">Medium Duty</option>
                        <option value="tractor-head">Tractor Head</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        ▾
                      </span>
                    </div>
                  </div>
                )}

                {/* Tipe Kendaraan */}
                {(vehicleType === "passenger" ||
                  (vehicleType === "commercial" && vehicleCategory !== "")) && (
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="sim-vehicle-id"
                    >
                      Tipe Kendaraan
                    </label>
                    {vehicleOptions.length === 0 ? (
                      <FieldSkeleton />
                    ) : (
                      <div className="relative">
                        <select
                          id="sim-vehicle-id"
                          value={selectedVehicleId}
                          onChange={(e) => handleVehicleSelect(e.target.value)}
                          className={SELECT_CLASS}
                          data-ocid="simulasi.vehicle_id.select"
                        >
                          <option value="" disabled>
                            Pilih tipe kendaraan
                          </option>
                          {vehicleOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          ▾
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Group C: Data Simulasi */}
            <div className={CARD_CLASS}>
              <div className={GROUP_LABEL_CLASS}>Data Simulasi</div>
              <div className="space-y-3">
                {/* OTR */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="sim-otr"
                  >
                    OTR
                  </label>
                  <input
                    id="sim-otr"
                    type="text"
                    inputMode="numeric"
                    value={otrDisplay}
                    onChange={(e) => handleOtrChange(e.target.value)}
                    placeholder="Rp. 0"
                    className={INPUT_CLASS}
                    data-ocid="simulasi.otr.input"
                  />
                </div>

                {/* DP with toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className="text-sm font-medium text-gray-700"
                      htmlFor="sim-dp"
                    >
                      DP
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setDpMode("nominal")}
                        className={`text-xs px-2 py-0.5 rounded-sm border transition-colors ${
                          dpMode === "nominal"
                            ? "bg-[#CC0000] text-white border-[#CC0000]"
                            : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                        }`}
                        data-ocid="simulasi.dp_nominal.toggle"
                      >
                        Nominal
                      </button>
                      <button
                        type="button"
                        onClick={() => setDpMode("percent")}
                        className={`text-xs px-2 py-0.5 rounded-sm border transition-colors ${
                          dpMode === "percent"
                            ? "bg-[#CC0000] text-white border-[#CC0000]"
                            : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                        }`}
                        data-ocid="simulasi.dp_percent.toggle"
                      >
                        Persen (%)
                      </button>
                    </div>
                  </div>
                  {dpMode === "nominal" ? (
                    <input
                      id="sim-dp"
                      type="text"
                      inputMode="numeric"
                      value={dpDisplay}
                      onChange={(e) => handleDpChange(e.target.value)}
                      placeholder="Rp. 0"
                      className={INPUT_CLASS}
                      data-ocid="simulasi.dp.input"
                    />
                  ) : (
                    <input
                      id="sim-dp"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={dpPercent || ""}
                      onChange={(e) =>
                        setDpPercent(Number.parseFloat(e.target.value) || 0)
                      }
                      placeholder="0 %"
                      className={INPUT_CLASS}
                      data-ocid="simulasi.dp_percent.input"
                    />
                  )}
                </div>

                {/* Tenor */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="sim-tenor"
                  >
                    Tenor
                  </label>
                  <div className="relative">
                    <select
                      id="sim-tenor"
                      value={tenor || ""}
                      onChange={(e) =>
                        setTenor(Number.parseInt(e.target.value, 10))
                      }
                      className={SELECT_CLASS}
                      data-ocid="simulasi.tenor.select"
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
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ▾
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={runSimulation}
                className="w-full py-3 bg-[#CC0000] hover:bg-[#B30000] text-white font-bold rounded-sm transition-colors mt-4 text-sm"
                data-ocid="simulasi.hitung.primary_button"
              >
                Hitung Simulasi
              </button>

              {/* Footnote */}
              {creditSettings?.footnote && (
                <p className="text-xs text-gray-400 italic mt-3 leading-relaxed">
                  {creditSettings.footnote}
                </p>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT COLUMN — HASIL + PERSYARATAN
          ══════════════════════════════════════════════ */}
          <div className="md:w-[45%]">
            {/* Hasil Simulasi */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Hasil Simulasi
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              {!simulationResult ? (
                <p
                  className="text-gray-400 text-sm text-center py-8"
                  data-ocid="simulasi.hasil.empty_state"
                >
                  Isi form dan klik Hitung Simulasi untuk melihat hasil.
                </p>
              ) : (
                <>
                  {/* Result rows */}
                  {(
                    [
                      { label: "DP", value: simulationResult.dp },
                      {
                        label: "Nilai Pembiayaan",
                        value: simulationResult.nilaiPembiayaan,
                      },
                      {
                        label: "Pokok Kredit",
                        value: simulationResult.pokokKredit,
                      },
                      {
                        label: "Total Bunga",
                        value: simulationResult.bungaTotal,
                      },
                      {
                        label: "Total Hutang Kredit",
                        value: simulationResult.totalHutang,
                      },
                    ] as const
                  ).map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between py-2 border-b border-gray-100 text-sm"
                    >
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-900">
                        {formatRupiah(value)}
                      </span>
                    </div>
                  ))}

                  {/* Highlight row */}
                  <div
                    className="bg-[#CC0000] text-white font-bold rounded px-3 py-2 mt-2 flex justify-between text-sm"
                    data-ocid="simulasi.angsuran.card"
                  >
                    <span>Estimasi Angsuran / Bulan</span>
                    <span>
                      {formatRupiah(simulationResult.angsuranPerBulan)}
                    </span>
                  </div>

                  {/* WhatsApp Button */}
                  <a
                    href={buildWaUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-4 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-sm flex items-center justify-center gap-2 transition-colors text-sm"
                    data-ocid="simulasi.whatsapp.button"
                  >
                    <MessageCircle size={18} />
                    Kirim Simulasi ke WhatsApp
                  </a>
                </>
              )}
            </div>

            {/* Persyaratan Kredit */}
            <h2 className="text-xl font-bold text-gray-800 mb-4 mt-6">
              Persyaratan Kredit
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {!tabs || tabs.length === 0 ? (
                <p
                  className="text-gray-400 text-sm p-5"
                  data-ocid="simulasi.tabs.empty_state"
                >
                  Persyaratan kredit akan segera tersedia.
                </p>
              ) : (
                <>
                  {/* Mobile: horizontal scrollable tabs */}
                  <div className="block md:hidden border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTabId(tab.id)}
                          className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                            activeTabId === tab.id
                              ? "border-[#CC0000] text-[#CC0000]"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                          data-ocid={`simulasi.tab.${tab.id}`}
                        >
                          {tab.tabName}
                        </button>
                      ))}
                    </div>
                    {/* Mobile content */}
                    <div className="p-4">
                      {activeTab?.requirements.map((req, idx) => (
                        <div
                          key={req.item || String(idx)}
                          className="flex items-start gap-2 py-1.5 text-sm text-gray-700"
                        >
                          <span className="inline-flex w-6 h-6 bg-[#CC0000] text-white text-xs rounded-full items-center justify-center flex-shrink-0 font-medium">
                            {idx + 1}
                          </span>
                          <span>{req.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop: vertical tabs */}
                  <div className="hidden md:flex">
                    <div className="w-1/3 border-r border-gray-200">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTabId(tab.id)}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-gray-100 ${
                            activeTabId === tab.id
                              ? "bg-[#CC0000] text-white"
                              : "bg-white hover:bg-gray-50 text-gray-600"
                          }`}
                          data-ocid={`simulasi.tab.${tab.id}`}
                        >
                          {tab.tabName}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 p-4">
                      {activeTab?.requirements.map((req, idx) => (
                        <div
                          key={req.item || String(idx)}
                          className="flex items-start gap-2 py-1.5 text-sm text-gray-700"
                        >
                          <span className="inline-flex w-6 h-6 bg-[#CC0000] text-white text-xs rounded-full items-center justify-center flex-shrink-0 font-medium">
                            {idx + 1}
                          </span>
                          <span>{req.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

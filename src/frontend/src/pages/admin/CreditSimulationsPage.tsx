import type { CreditRequirementTab } from "@/types/local";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAddCreditRequirementTab,
  useDeleteCreditRequirementTab,
  useGetAllCreditRequirementTabs,
  useGetCreditSettings,
  useUpdateCreditRequirementTab,
  useUpdateCreditSettings,
} from "../../hooks/useCreditSimulation";

// ─── Format rupiah helper ────────────────────────────────────
function formatRupiah(value: number): string {
  return value.toLocaleString("id-ID");
}

// ─── Requirement Items Editor ────────────────────────────────
type ItemEntry = { id: string; value: string };
let _itemCounter = 0;
function makeEntry(value = ""): ItemEntry {
  _itemCounter += 1;
  return { id: `req-${_itemCounter}`, value };
}

function RequirementItemsEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [entries, setEntries] = useState<ItemEntry[]>(() =>
    items.length > 0 ? items.map((v) => makeEntry(v)) : [makeEntry()],
  );

  // Sync outward whenever entries change
  const syncUp = (next: ItemEntry[]) => {
    setEntries(next);
    onChange(next.map((e) => e.value));
  };

  const addItem = () => syncUp([...entries, makeEntry()]);
  const removeItem = (id: string) => syncUp(entries.filter((e) => e.id !== id));
  const updateItem = (id: string, val: string) =>
    syncUp(entries.map((e) => (e.id === id ? { ...e, value: val } : e)));

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-2">
          <input
            type="text"
            value={entry.value}
            onChange={(e) => updateItem(entry.id, e.target.value)}
            placeholder={`Persyaratan ${entries.indexOf(entry) + 1}`}
            className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
          />
          <button
            type="button"
            onClick={() => removeItem(entry.id)}
            className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"
            aria-label="Hapus item"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-sm text-[#CC0000] hover:text-[#B30000] font-medium flex items-center gap-1 mt-1"
      >
        <Plus size={14} /> Tambah Item
      </button>
    </div>
  );
}

// ─── Add Tab Dialog ──────────────────────────────────────────
function AddTabDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tabName, setTabName] = useState("");
  const [tabOrder, setTabOrder] = useState(1);
  const [items, setItems] = useState<string[]>("".split(","));
  const addMutation = useAddCreditRequirementTab();

  useEffect(() => {
    if (open) {
      setTabName("");
      setTabOrder(1);
      setItems([""]);
    }
  }, [open]);

  const handleSave = async () => {
    if (!tabName.trim()) {
      toast.error("Nama tab tidak boleh kosong");
      return;
    }
    const requirements = items
      .map((it) => it.trim())
      .filter(Boolean)
      .map((it) => ({ item: it }));
    try {
      await addMutation.mutateAsync({
        tabName: tabName.trim(),
        requirements,
        order: tabOrder,
      });
      toast.success("Tab berhasil ditambahkan");
      onSuccess();
    } catch {
      toast.error("Gagal menambahkan tab");
    }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      data-ocid="credit_tab.dialog"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Tambah Tab Persyaratan
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="add-tab-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Tab
            </label>
            <input
              id="add-tab-name"
              type="text"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              placeholder="contoh: Karyawan"
              className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
              data-ocid="credit_tab.tab_name.input"
            />
          </div>
          <div>
            <label
              htmlFor="add-tab-order"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Urutan Tampil
            </label>
            <input
              id="add-tab-order"
              type="number"
              value={tabOrder}
              min={1}
              onChange={(e) => setTabOrder(Number(e.target.value))}
              className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
              data-ocid="credit_tab.tab_order.input"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Daftar Persyaratan
            </p>
            <RequirementItemsEditor items={items} onChange={setItems} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-sm hover:bg-gray-50 transition-colors"
            data-ocid="credit_tab.cancel_button"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={addMutation.isPending}
            className="px-5 py-2 bg-[#CC0000] hover:bg-[#B30000] text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50"
            data-ocid="credit_tab.submit_button"
          >
            {addMutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Tab Dialog ─────────────────────────────────────────
function EditTabDialog({
  tab,
  onClose,
  onSuccess,
}: {
  tab: CreditRequirementTab | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tabName, setTabName] = useState("");
  const [tabOrder, setTabOrder] = useState(1);
  const [items, setItems] = useState<string[]>([""]);
  const updateMutation = useUpdateCreditRequirementTab();

  useEffect(() => {
    if (tab) {
      setTabName(tab.tabName);
      setTabOrder(tab.order);
      setItems(
        tab.requirements.length > 0
          ? tab.requirements.map((r) => r.item)
          : [""],
      );
    }
  }, [tab]);

  const handleSave = async () => {
    if (!tab) return;
    if (!tabName.trim()) {
      toast.error("Nama tab tidak boleh kosong");
      return;
    }
    const requirements = items
      .map((it) => it.trim())
      .filter(Boolean)
      .map((it) => ({ item: it }));
    try {
      await updateMutation.mutateAsync({
        id: tab.id,
        tabName: tabName.trim(),
        requirements,
        order: tabOrder,
      });
      toast.success("Tab berhasil diperbarui");
      onSuccess();
    } catch {
      toast.error("Gagal memperbarui tab");
    }
  };

  if (!tab) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      data-ocid="credit_tab_edit.dialog"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Edit Tab Persyaratan
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-tab-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Tab
            </label>
            <input
              id="edit-tab-name"
              type="text"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              placeholder="contoh: Karyawan"
              className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
              data-ocid="credit_tab_edit.tab_name.input"
            />
          </div>
          <div>
            <label
              htmlFor="edit-tab-order"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Urutan Tampil
            </label>
            <input
              id="edit-tab-order"
              type="number"
              value={tabOrder}
              min={1}
              onChange={(e) => setTabOrder(Number(e.target.value))}
              className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
              data-ocid="credit_tab_edit.tab_order.input"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Daftar Persyaratan
            </p>
            <RequirementItemsEditor items={items} onChange={setItems} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-sm hover:bg-gray-50 transition-colors"
            data-ocid="credit_tab_edit.cancel_button"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-5 py-2 bg-[#CC0000] hover:bg-[#B30000] text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50"
            data-ocid="credit_tab_edit.submit_button"
          >
            {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function CreditSimulationsPage() {
  // ── Section 1 state ──
  const { data: creditSettings } = useGetCreditSettings();
  const updateSettings = useUpdateCreditSettings();

  const [adminFee, setAdminFee] = useState(500000);
  const [interestRate, setInterestRate] = useState(5.0);
  const [insurancePercent, setInsurancePercent] = useState(0.5);
  const [provisionPercent, setProvisionPercent] = useState(1.0);
  const [footnote, setFootnote] = useState(
    "*Simulasi ini bersifat perkiraan. Besaran biaya administrasi, bunga, asuransi, dan provisi dapat berbeda pada setiap leasing dan dapat berubah sesuai kebijakan yang berlaku.",
  );

  useEffect(() => {
    if (creditSettings) {
      setAdminFee(creditSettings.adminFee);
      setInterestRate(creditSettings.interestRatePerYear);
      setInsurancePercent(creditSettings.insurancePercent);
      setProvisionPercent(creditSettings.provisionPercent);
      setFootnote(creditSettings.footnote);
    }
  }, [creditSettings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        adminFee,
        interestRatePerYear: interestRate,
        insurancePercent,
        provisionPercent,
        footnote,
      });
      toast.success("Pengaturan berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    }
  };

  // ── Section 2 state ──
  const { data: tabs, isLoading: tabsLoading } =
    useGetAllCreditRequirementTabs();
  const deleteMutation = useDeleteCreditRequirementTab();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTab, setEditingTab] = useState<CreditRequirementTab | null>(
    null,
  );

  const handleDeleteTab = async (tab: CreditRequirementTab) => {
    if (!window.confirm(`Hapus tab "${tab.tabName}"?`)) return;
    try {
      await deleteMutation.mutateAsync(tab.id);
      toast.success("Tab berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus tab");
    }
  };

  return (
    <div className="space-y-8" data-ocid="credit_settings.page">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Simulasi Kredit Setting
        </h1>
        <p className="text-muted-foreground mt-1">
          Atur parameter biaya kredit dan persyaratan pengajuan
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Pengaturan Biaya Kredit                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Pengaturan Biaya Kredit
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Biaya Administrasi */}
            <div>
              <label
                htmlFor="cs-admin-fee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Biaya Administrasi (Rp.)
              </label>
              <input
                id="cs-admin-fee"
                type="number"
                value={adminFee}
                onChange={(e) => setAdminFee(Number(e.target.value))}
                placeholder="500000"
                className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
                data-ocid="credit_settings.admin_fee.input"
              />
              {adminFee > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Rp {formatRupiah(adminFee)}
                </p>
              )}
            </div>

            {/* Bunga per Tahun */}
            <div>
              <label
                htmlFor="cs-interest-rate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bunga per Tahun (%)
              </label>
              <input
                id="cs-interest-rate"
                type="number"
                value={interestRate}
                step="0.1"
                min={0}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="5.0"
                className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
                data-ocid="credit_settings.interest_rate.input"
              />
            </div>

            {/* Asuransi */}
            <div>
              <label
                htmlFor="cs-insurance"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Asuransi (% dari OTR)
              </label>
              <input
                id="cs-insurance"
                type="number"
                value={insurancePercent}
                step="0.01"
                min={0}
                onChange={(e) => setInsurancePercent(Number(e.target.value))}
                placeholder="0.5"
                className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
                data-ocid="credit_settings.insurance.input"
              />
            </div>

            {/* Provisi */}
            <div>
              <label
                htmlFor="cs-provision"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Provisi (% dari OTR)
              </label>
              <input
                id="cs-provision"
                type="number"
                value={provisionPercent}
                step="0.01"
                min={0}
                onChange={(e) => setProvisionPercent(Number(e.target.value))}
                placeholder="1.0"
                className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
                data-ocid="credit_settings.provision.input"
              />
            </div>

            {/* Footnote — full width */}
            <div className="md:col-span-2">
              <label
                htmlFor="cs-footnote"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Footnote (Teks catatan kaki di halaman publik)
              </label>
              <textarea
                id="cs-footnote"
                rows={4}
                value={footnote}
                onChange={(e) => setFootnote(e.target.value)}
                placeholder="*Simulasi ini bersifat perkiraan..."
                className="border border-gray-300 rounded-sm px-3 py-2 w-full text-sm focus:outline-none focus:border-[#CC0000] transition-colors resize-none"
                data-ocid="credit_settings.footnote.textarea"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={updateSettings.isPending}
            className="mt-4 px-6 py-2 bg-[#CC0000] hover:bg-[#B30000] text-white font-semibold rounded-sm text-sm transition-colors disabled:opacity-50"
            data-ocid="credit_settings.submit_button"
          >
            {updateSettings.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Manajemen Persyaratan Kredit              */}
      {/* ══════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Persyaratan Kredit
        </h2>

        <button
          type="button"
          onClick={() => setShowAddDialog(true)}
          className="mb-4 px-4 py-2 bg-[#CC0000] hover:bg-[#B30000] text-white text-sm font-semibold rounded-sm transition-colors flex items-center gap-2"
          data-ocid="credit_tab.open_modal_button"
        >
          <Plus size={16} />
          Tambah Tab Baru
        </button>

        {tabsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : tabs && tabs.length > 0 ? (
          <div className="space-y-3" data-ocid="credit_tab.list">
            {tabs
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((tab, idx) => (
                <div
                  key={tab.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  data-ocid={`credit_tab.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-800 font-medium">
                      {tab.tabName}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tab.requirements.length} persyaratan
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingTab(tab)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      aria-label="Edit tab"
                      data-ocid={`credit_tab.edit_button.${idx + 1}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTab(tab)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Hapus tab"
                      data-ocid={`credit_tab.delete_button.${idx + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p
            className="text-gray-400 text-sm"
            data-ocid="credit_tab.empty_state"
          >
            Belum ada persyaratan kredit. Klik &apos;Tambah Tab Baru&apos; untuk
            memulai.
          </p>
        )}
      </div>

      {/* ── Dialogs ── */}
      <AddTabDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => setShowAddDialog(false)}
      />
      <EditTabDialog
        tab={editingTab}
        onClose={() => setEditingTab(null)}
        onSuccess={() => setEditingTab(null)}
      />
    </div>
  );
}

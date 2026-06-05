import { useDeleteLead, useGetAllLeads } from "@/hooks/useCreditSimulation";
import type { Lead } from "@/types/local";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatDate(ts: number): string {
  if (!ts) return "-";
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sourceLabel(source: string): string {
  if (source === "simulasi-kredit") return "Simulasi Kredit";
  if (source === "kontak") return "Kontak";
  return source;
}

function SourceBadge({ source }: { source: string }) {
  if (source === "simulasi-kredit")
    return (
      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
        Simulasi Kredit
      </span>
    );
  if (source === "kontak")
    return (
      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
        Kontak
      </span>
    );
  return (
    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
      {source}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LeadsPage() {
  const { data: allLeads = [], isLoading } = useGetAllLeads();
  const deleteLead = useDeleteLead();

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredLeads = allLeads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q);
    const matchesSource = !sourceFilter || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Hapus lead "${lead.name}"?`)) return;
    setDeletingId(lead.id);
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("Lead berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus lead");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Export CSV ───────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const headers = [
      "Nama",
      "Alamat",
      "Email",
      "No. Telp / WA",
      "Tipe Kendaraan",
      "OTR",
      "DP",
      "Tenor (Tahun)",
      "Sumber Leads",
      "Tanggal",
    ];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.address,
      lead.email,
      lead.phone,
      lead.vehicleType,
      lead.otr,
      lead.dp,
      lead.tenor,
      sourceLabel(lead.source),
      formatDate(lead.createdAt),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `kontak-leads-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-ocid="leads.page">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Kontak Leads</h1>
        <p className="text-muted-foreground">
          Data leads dari simulasi kredit dan kontak
        </p>
      </div>

      {/* ── Controls Bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600" data-ocid="leads.total_count">
          Total: {filteredLeads.length} leads
        </span>

        <div className="flex-1" />

        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama, email, atau telepon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-sm px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-[#CC0000]"
          data-ocid="leads.search_input"
        />

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-gray-300 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#CC0000]"
          data-ocid="leads.source_filter"
        >
          <option value="">Semua Sumber</option>
          <option value="simulasi-kredit">Simulasi Kredit</option>
          <option value="kontak">Kontak</option>
        </select>

        {/* Export CSV */}
        <button
          type="button"
          onClick={downloadCSV}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-sm flex items-center gap-1.5 transition-colors"
          data-ocid="leads.export_csv_button"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="space-y-2" data-ocid="leads.loading_state">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Desktop Table ── */}
      {!isLoading && (
        <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Nama",
                  "Alamat",
                  "Email",
                  "No. Telp / WA",
                  "Tipe Kendaraan",
                  "OTR",
                  "DP",
                  "Tenor",
                  "Sumber Leads",
                  "Tanggal",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                    data-ocid="leads.empty_state"
                  >
                    Belum ada data leads.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={idx % 2 === 1 ? "bg-gray-50/30" : ""}
                    data-ocid={`leads.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 max-w-[150px] truncate block">
                        {lead.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="max-w-[150px] truncate text-gray-500 text-xs block">
                        {lead.address}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 text-xs">{lead.phone}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {lead.vehicleType}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatRupiah(lead.otr)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatRupiah(lead.dp)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {lead.tenor} Tahun
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={lead.source} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(lead)}
                        disabled={deletingId === lead.id}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        aria-label="Hapus lead"
                        data-ocid={`leads.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile Card List ── */}
      {!isLoading && (
        <div className="block md:hidden">
          {filteredLeads.length === 0 ? (
            <p
              className="text-gray-400 text-sm text-center py-12"
              data-ocid="leads.empty_state"
            >
              Belum ada data leads.
            </p>
          ) : (
            filteredLeads.map((lead, idx) => (
              <div
                key={lead.id}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
                data-ocid={`leads.item.${idx + 1}`}
              >
                {/* Row 1: name + badge */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm leading-snug">
                    {lead.name}
                  </span>
                  <SourceBadge source={lead.source} />
                </div>

                {/* Row 2: phone + email */}
                <div className="mb-1">
                  <p className="text-sm text-gray-600">{lead.phone}</p>
                  <p className="text-xs text-gray-500">{lead.email}</p>
                </div>

                {/* Row 3: vehicle type */}
                <p className="text-sm text-gray-700 mb-2">{lead.vehicleType}</p>

                {/* Row 4: OTR / DP / Tenor */}
                <div className="flex gap-4 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">OTR</p>
                    <p className="text-sm font-medium">
                      {formatRupiah(lead.otr)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">DP</p>
                    <p className="text-sm font-medium">
                      {formatRupiah(lead.dp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tenor</p>
                    <p className="text-sm font-medium">{lead.tenor} Thn</p>
                  </div>
                </div>

                {/* Row 5: date + delete */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDate(lead.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(lead)}
                    disabled={deletingId === lead.id}
                    className="text-red-500 text-xs flex items-center gap-1 hover:text-red-700 transition-colors disabled:opacity-50"
                    data-ocid={`leads.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

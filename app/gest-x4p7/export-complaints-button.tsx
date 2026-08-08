"use client";

type Complaint = {
  created_at: string;
  status: string;
  message: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
};

function csvEscape(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

const STATUS_LABEL: Record<string, string> = { new: "Nouă", read: "Citită", resolved: "Rezolvată" };

export default function ExportComplaintsButton({ complaints, restaurantSlug }: { complaints: Complaint[]; restaurantSlug: string }) {
  const handleExport = () => {
    const header = ["Data", "Status", "Mesaj", "Nume contact", "Telefon", "Email"];
    const rows = complaints.map((c) => [
      new Date(c.created_at).toLocaleString("ro-RO"),
      STATUS_LABEL[c.status] ?? c.status,
      c.message,
      c.contact_name ?? "",
      c.contact_phone ?? "",
      c.contact_email ?? "",
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(",")).join("\n");
    // \ufeff -- BOM, ca Excel sa recunoasca diacriticele UTF-8 corect
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reclamatii-${restaurantSlug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (complaints.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleExport}
      style={{
        fontSize: 12,
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "transparent",
        color: "#9C9382",
        cursor: "pointer",
      }}
    >
      Descarcă CSV
    </button>
  );
}

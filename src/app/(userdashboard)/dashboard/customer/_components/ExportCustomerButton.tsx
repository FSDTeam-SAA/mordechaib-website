"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "./CustomerTable";

type ExportCustomerButtonProps = {
  customers: Customer[];
};

export function ExportCustomerButton({ customers }: ExportCustomerButtonProps) {
  const handleExport = () => {
    if (!customers || customers.length === 0) {
      toast.error("No customer contacts available to export.");
      return;
    }

    const headers = [
      "name",
      "email",
      "phone",
      "company",
      "job_title",
      "avatar_url",
      "location",
      "website",
      "linkedin_url",
      "lead_status",
      "tags",
      "notes",
    ];

    const escapeCsv = (value: unknown): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (
        str.includes(",") ||
        str.includes('"') ||
        str.includes("\n") ||
        str.includes("\r")
      ) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = customers.map((c) => [
      escapeCsv(c.name || ""),
      escapeCsv(c.email || ""),
      escapeCsv(c.phone || ""),
      escapeCsv(c.company || ""),
      escapeCsv(c.jobTitle || ""),
      escapeCsv(c.avatarUrl || ""),
      escapeCsv(c.location || ""),
      escapeCsv(c.website || ""),
      escapeCsv(c.linkedinUrl || ""),
      escapeCsv(c.leadStatus || ""),
      escapeCsv(Array.isArray(c.tags) ? c.tags.join("|") : ""),
      escapeCsv(c.notes || ""),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `customers_export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      `Exported ${customers.length} customer contact${customers.length === 1 ? "" : "s"}.`,
    );
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      title="Export customer contacts as CSV"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#DCE6FA] bg-white px-3 text-sm font-medium text-[#246BFD] transition hover:bg-[#EEF3FF] hover:border-[#B8C4EE]"
    >
      <Download className="size-4" /> Export Customer
    </button>
  );
}

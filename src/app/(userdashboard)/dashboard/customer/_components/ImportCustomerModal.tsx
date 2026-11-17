"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type ImportCustomerModalProps = {
  onImported: () => void;
};

type ImportSummary = {
  received: number;
  created: number;
  skipped: number;
  items?: Array<{
    index: number;
    status: string;
    code?: string;
    message?: string;
  }>;
};

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function ImportCustomerModal({ onImported }: ImportCustomerModalProps) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const reset = () => {
    setFile(null);
    setError("");
    setSummary(null);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    setSummary(null);

    const isCsv =
      selectedFile.name.toLowerCase().endsWith(".csv") ||
      selectedFile.type === "text/csv" ||
      selectedFile.type === "application/vnd.ms-excel" ||
      selectedFile.type === "text/plain";

    if (!isCsv) {
      setError("Please select a valid UTF-8 CSV file (.csv).");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError("CSV file size must be 2 MB or smaller.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const downloadSampleTemplate = () => {
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

    const sampleRows = [
      [
        "Sarah Mitchell",
        "sarah@acme.com",
        "+15551234567",
        "Acme Corp",
        "Marketing Director",
        "",
        "New York, USA",
        "https://acme.com",
        "https://linkedin.com/in/sarahmitchell",
        "HOT_LEAD",
        "VIP|Enterprise",
        "Client is interested in AI workflow automation.",
      ],
      [
        "John Doe",
        "john@techcorp.io",
        "+15559876543",
        "TechCorp Solutions",
        "VP of Sales",
        "",
        "San Francisco, CA",
        "https://techcorp.io",
        "https://linkedin.com/in/johndoe",
        "QUALIFIED",
        "Decision Maker",
        "Scheduled follow up for proposal review.",
      ],
    ];

    const escapeCsv = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent = [
      headers.join(","),
      ...sampleRows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customer_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.info("Downloaded sample CSV import template.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    const accessToken = session?.user?.accessToken;
    if (!accessToken) {
      setError("Your session is missing. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
      const endpoint = `${apiUrl.replace(/\/+$/, "")}/contacts/bulk/import`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string | string[];
        errors?: Array<{ field?: string; messages?: string[] }>;
        data?: {
          summary?: { received: number; created: number; skipped: number };
          items?: Array<{
            index: number;
            status: string;
            code?: string;
            message?: string;
          }>;
        };
      };

      if (!response.ok || !result.success) {
        let msg = "Failed to import contacts from CSV.";
        if (Array.isArray(result.message)) {
          msg = result.message.join(", ");
        } else if (result.message) {
          msg = result.message;
        }

        if (Array.isArray(result.errors) && result.errors.length > 0) {
          const detailed = result.errors
            .map((err) => `${err.field ? `${err.field}: ` : ""}${(err.messages || []).join(", ")}`)
            .filter(Boolean)
            .join("; ");
          if (detailed) msg = `${msg} (${detailed})`;
        }
        throw new Error(msg);
      }

      const resSummary = result.data?.summary ?? {
        received: 0,
        created: 0,
        skipped: 0,
      };

      setSummary({
        received: resSummary.received,
        created: resSummary.created,
        skipped: resSummary.skipped,
        items: result.data?.items,
      });

      toast.success(
        `Imported ${resSummary.created} contact${resSummary.created === 1 ? "" : "s"}${
          resSummary.skipped > 0 ? ` (${resSummary.skipped} skipped)` : ""
        }!`,
      );

      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import contacts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#5B7FF0] bg-white px-3.5 text-sm font-medium text-[#5B7FF0] transition hover:bg-[#5B7FF0]/5 hover:border-[#4E6FDE]"
      >
        <Upload className="size-4" /> Import Customer
      </button>

      <DialogContent
        showClose={false}
        overlayClassName="bg-[#17203A]/30 backdrop-blur-[5px]"
        className="max-h-[calc(100dvh-28px)] w-[calc(100%-28px)] max-w-[620px] gap-0 overflow-y-auto !rounded-[14px] border-0 bg-white p-0 shadow-[0_24px_80px_rgba(14,18,36,0.2)]"
      >
        <header className="flex items-center justify-between border-b border-[#EDF0F8] px-5 py-4">
          <div>
            <DialogTitle className="text-base font-semibold text-[#20263A]">
              Import Customer Contacts
            </DialogTitle>
            <DialogDescription className="text-xs text-[#8390B5]">
              Upload a UTF-8 CSV file to create contacts in bulk (max 2 MB, up to 200 contacts).
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            aria-label="Close dialog"
            className="flex size-7 items-center justify-center rounded-full text-[#8390B5] transition hover:bg-[#F4F6FD] hover:text-[#20263A]"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="p-5 space-y-4">
          {/* Template Download Option */}
          <div className="flex items-center justify-between rounded-xl border border-[#DCE6FA] bg-[#F7F9FE] p-3 text-xs text-[#27304A]">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="size-5 text-[#5B7FF0]" />
              <div>
                <p className="font-medium text-[#0E1224]">Need the CSV format?</p>
                <p className="text-[11px] text-[#7B89AA]">
                  Download a pre-formatted template with all columns and examples.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#B8C4EE] bg-white px-3 text-xs font-medium text-[#246BFD] transition hover:bg-[#EEF3FF]"
            >
              <Download className="size-3.5" /> Template
            </button>
          </div>

          {/* Result Summary */}
          {summary ? (
            <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#10B981]">
                <CheckCircle2 className="size-5" />
                <span>Import Completed</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-white p-2.5 shadow-2xs border border-[#E4EAF8]">
                  <p className="text-lg font-bold text-[#0E1224]">{summary.received}</p>
                  <p className="text-[#8B93B8]">Total Rows</p>
                </div>
                <div className="rounded-lg bg-white p-2.5 shadow-2xs border border-[#E4EAF8]">
                  <p className="text-lg font-bold text-[#10B981]">{summary.created}</p>
                  <p className="text-[#8B93B8]">Created</p>
                </div>
                <div className="rounded-lg bg-white p-2.5 shadow-2xs border border-[#E4EAF8]">
                  <p className="text-lg font-bold text-[#F59E0B]">{summary.skipped}</p>
                  <p className="text-[#8B93B8]">Skipped</p>
                </div>
              </div>

              {summary.skipped > 0 && summary.items && (
                <div className="mt-2 max-h-36 overflow-y-auto rounded-lg bg-white p-2.5 text-xs border border-[#E4EAF8] space-y-1">
                  <p className="font-medium text-[#EF4444]">Skipped Rows:</p>
                  {summary.items
                    .filter((item) => item.status === "SKIPPED")
                    .map((item, idx) => (
                      <p key={idx} className="text-[#64748B]">
                        • Row {item.index + 2}: {item.message || item.code}
                      </p>
                    ))}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-[#DCE6FA] bg-white px-3.5 py-2 text-xs font-medium text-[#27304A] hover:bg-[#F4F6FD]"
                >
                  Upload Another File
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-lg bg-[#5B7FF0] px-4 py-2 text-xs font-medium text-white hover:bg-[#4E6FDE]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                  isDragging
                    ? "border-[#5B7FF0] bg-[#5B7FF0]/5"
                    : file
                      ? "border-[#10B981] bg-[#10B981]/5"
                      : "border-[#DCE6FA] bg-[#F7F9FE] hover:border-[#B8C4EE] hover:bg-[#F0F4FC]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-12 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]">
                      <FileSpreadsheet className="size-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#0E1224]">{file.name}</p>
                    <p className="text-xs text-[#8B93B8]">{formatFileSize(file.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="mt-1 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-[#EF4444] shadow-xs border border-[#EF4444]/20 hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="size-3" /> Change File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-12 items-center justify-center rounded-full bg-[#5B7FF0]/10 text-[#5B7FF0]">
                      <UploadCloud className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0E1224]">
                        Click to browse or drag & drop CSV file
                      </p>
                      <p className="mt-1 text-xs text-[#8B93B8]">
                        Supports UTF-8 CSV (.csv) • Max 2 MB • Up to 200 contacts
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Supported Columns Guide */}
              <div className="rounded-xl bg-[#F4F6FD] p-3 text-[11px] leading-relaxed text-[#64748B]">
                <p className="font-semibold text-[#20263A] mb-1">CSV Format Guidelines:</p>
                <p>
                  • <strong>Required:</strong> <code className="text-[#246BFD]">name</code>, and at least one of{" "}
                  <code className="text-[#246BFD]">email</code> or <code className="text-[#246BFD]">phone</code>.
                </p>
                <p>
                  • <strong>Optional:</strong> <code className="text-[#64748B]">company, job_title, avatar_url, location, website, linkedin_url, lead_status, tags, notes</code>.
                </p>
                <p>
                  • Separate multiple tags using the pipe character <code className="text-[#246BFD]">|</code> (e.g.{" "}
                  <code className="text-[#246BFD]">VIP|Enterprise</code>).
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-10 rounded-[10px] border border-[#DCE6FA] bg-white px-4 text-xs font-medium text-[#27304A] transition hover:bg-[#F4F6FD] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || isSubmitting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#5B7FF0] px-5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(91,127,240,0.22)] transition hover:bg-[#4E6FDE] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" /> Upload & Import
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

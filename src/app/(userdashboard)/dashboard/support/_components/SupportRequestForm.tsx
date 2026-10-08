"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-[148px] animate-pulse bg-[#F5F7FF]" />,
});

const fieldClass =
  "h-11 w-full rounded-xl border-0 bg-[#F5F7FF] px-4 text-base text-[#0E1224] shadow-none placeholder:text-[#8B93B8] focus-visible:ring-[#5B7FF0] sm:h-14 md:text-base";

const categories = [
  "ACCOUNT",
  "BILLING",
  "TECHNICAL",
  "INTEGRATION",
  "AI_ASSISTANT",
  "FEATURE_REQUEST",
  "OTHER",
] as const;

const acceptedFileTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 10 * 1024 * 1024;

type SupportCategory = (typeof categories)[number];

type SupportRequestResponse = {
  success?: boolean;
  message?: string | string[];
  data?: unknown;
};

function getMessage(result: SupportRequestResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function hasEditorContent(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-base font-normal leading-[1.2] text-[#8B93B8]">
      {children}
    </span>
  );
}

export function SupportRequestForm() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [category, setCategory] = useState<SupportCategory>("ACCOUNT");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );

  const createRequest = useMutation({
    mutationFn: async (body: FormData) => {
      const accessToken = session?.user.accessToken;

      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/support/requests`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as SupportRequestResponse;

      if (!response.ok || !result.success) {
        throw new Error(getMessage(result, "Unable to submit support request."));
      }

      return result;
    },
    onSuccess: async (result) => {
      formRef.current?.reset();
      setCategory("ACCOUNT");
      setDescription("");
      setAttachments([]);
      await queryClient.invalidateQueries({ queryKey: ["support-requests"] });
      toast.success(getMessage(result, "Support request submitted successfully."));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit support request.",
      );
    },
  });

  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (!acceptedFileTypes.includes(file.type)) {
        toast.error(`${file.name} must be a PDF, JPG, JPEG, or PNG file.`);
        return;
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} must be 10 MB or smaller.`);
        return;
      }
      validFiles.push(file);
    });

    setAttachments((current) => {
      const fileKeys = new Set(
        current.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );
      const newFiles = validFiles.filter(
        (file) => !fileKeys.has(`${file.name}-${file.size}-${file.lastModified}`),
      );
      return [...current, ...newFiles];
    });

    event.target.value = "";
  };

  const removeFile = (fileToRemove: File) => {
    setAttachments((current) =>
      current.filter((file) => file !== fileToRemove),
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasEditorContent(description)) {
      toast.error("Description is required.");
      return;
    }

    const values = new FormData(event.currentTarget);
    const subject = String(values.get("subject") ?? "").trim();

    if (!subject) {
      toast.error("Subject is required.");
      return;
    }

    const body = new FormData();
    body.append("category", category);
    body.append("subject", subject);
    body.append("description", description);
    attachments.forEach((file) => body.append("attachments", file));
    createRequest.mutate(body);
  };

  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <header className="border-b border-[#E4EAF8] p-4">
        <h2 className="text-xl font-medium text-[#0E1224]">
          Submit a Support Request
        </h2>
      </header>

      <form ref={formRef} onSubmit={submit}>
        <div className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel>Category</FieldLabel>
              <span className="relative block">
                <select
                  name="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as SupportCategory)
                  }
                  disabled={createRequest.isPending}
                  className={`${fieldClass} appearance-none pr-11 outline-none focus:ring-2 focus:ring-[#5B7FF0] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#8B93B8]" />
              </span>
            </label>
            <label className="min-w-0">
              <FieldLabel>Subject</FieldLabel>
              <Input
                name="subject"
                required
                disabled={createRequest.isPending}
                placeholder="Enter request subject......"
                className={fieldClass}
              />
            </label>
          </div>

          <div>
            <label
              htmlFor="support-description"
              className="mb-2 block text-base font-medium text-[#0E1224]"
            >
              Description
            </label>
            <div className="support-quill overflow-hidden rounded-2xl border border-[#F5F7FF] bg-[#F5F7FF]">
              <ReactQuill
                id="support-description"
                theme="snow"
                value={description}
                onChange={setDescription}
                modules={quillModules}
                readOnly={createRequest.isPending}
                placeholder="Describe your issue in details............."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-medium text-[#0E1224]">
              Attachments &amp; Links
            </h3>
            <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-[#F5F7FF] p-4 text-center text-base leading-[1.2] text-[#8B93B8] transition-colors hover:bg-[#EEF2FF]">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={selectFiles}
                disabled={createRequest.isPending}
                className="sr-only"
              />
              <Image
                src="/support-upload.svg"
                alt=""
                width={48}
                height={48}
                unoptimized
                className="size-12"
              />
              <span>Drag &amp; drop files here or</span>
              <span className="text-[#264AFF]">Browse File</span>
              <span>Support: PDF, JPG, JPEG, PNG (10 MB each)</span>
            </label>

            {attachments.length > 0 && (
              <ul
                className="grid gap-2 sm:grid-cols-2"
                aria-label="Selected attachments"
              >
                {attachments.map((file) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex min-w-0 items-center gap-2 rounded-lg bg-[#F5F7FF] px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-[#0E1224]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      disabled={createRequest.isPending}
                      aria-label={`Remove ${file.name}`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#8B93B8] transition hover:bg-white hover:text-[#0E1224] disabled:opacity-50"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="border-t border-[#E4EAF8] p-4">
          <Button
            type="submit"
            disabled={createRequest.isPending}
            className="h-11 w-full rounded-[8px] bg-[#5B7FF0] px-8 text-sm font-normal text-white shadow-none hover:bg-[#4E6FDE] sm:w-auto sm:min-w-[150px]"
          >
            {createRequest.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </footer>
      </form>
    </section>
  );
}

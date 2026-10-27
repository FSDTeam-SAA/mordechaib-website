"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

type Props = {
  properties: Record<string, unknown>;
  isSaving: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (properties: Record<string, string>) => void;
};

const inputClass =
  "h-11 w-full rounded-[12px] border border-[#DCE1EA] bg-white px-3 text-sm text-[#252A40] outline-none transition focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/15 disabled:bg-[#F7F8FB]";

function labelOf(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isImageUrl(key: string, value: string) {
  if (!/^https?:\/\//i.test(value)) return false;
  return (
    /(image|photo|avatar|logo|picture|thumbnail|icon)/i.test(key) ||
    /\.(avif|gif|jpe?g|png|svg|webp)(?:\?.*)?$/i.test(value)
  );
}

function initialValues(properties: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      value == null
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value),
    ]),
  );
}

export function CrmRecordEditForm({
  properties,
  isSaving,
  error,
  onCancel,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    initialValues(properties),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.keys(properties).map((key) => {
          const value = form[key] ?? "";
          const imageField =
            /(image|photo|avatar|logo|picture|thumbnail|icon)/i.test(key) ||
            isImageUrl(key, value);
          return (
            <label key={key} className="grid gap-1.5">
              <span className="text-sm font-medium text-[#343A52]">
                {labelOf(key)}
              </span>
              {imageField && isImageUrl(key, value) && (
                <span
                  role="img"
                  aria-label={`${labelOf(key)} preview`}
                  className="mb-1 block h-28 w-28 rounded-xl border border-[#E4EAF8] bg-[#F7FAFF] bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${JSON.stringify(value)})` }}
                />
              )}
              <input
                type={imageField ? "url" : "text"}
                value={value}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                placeholder={imageField ? "https://example.com/image.jpg" : undefined}
                disabled={isSaving}
                className={inputClass}
              />
            </label>
          );
        })}
      </div>
      {Object.keys(properties).length === 0 && (
        <p className="text-sm text-[#7187B2]">This record has no editable properties.</p>
      )}
      {error && <p className="mt-4 text-sm text-[#C24152]">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E4EAF8] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="h-11 rounded-[12px] border border-[#DCE1EA] px-5 text-sm font-medium text-[#596079] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || Object.keys(properties).length === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#5B7FF0] px-5 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSaving && <LoaderCircle className="size-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

type SchemaOption = string | { label?: string; value?: string | number | boolean; active?: boolean };
export type CrmEditSchemaField = { name?: string; fieldName?: string; label?: string; dataType?: string; providerType?: string; type?: string; required?: boolean; updateable?: boolean; description?: string; options?: SchemaOption[] };
type Props = { properties: Record<string, unknown>; fields: CrmEditSchemaField[]; isSaving: boolean; error?: string; onCancel: () => void; onSubmit: (properties: Record<string, unknown>) => void };

const inputClass = "h-11 w-full rounded-[12px] border border-[#DCE1EA] bg-white px-3 text-sm text-[#252A40] outline-none transition focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/15 disabled:bg-[#F7F8FB]";
const nameOf = (field: CrmEditSchemaField) => field.name ?? field.fieldName ?? "";
const typeOf = (field: CrmEditSchemaField) => (field.dataType ?? field.type ?? field.providerType ?? "STRING").toUpperCase();

function convertValue(value: string, field: CrmEditSchemaField) {
  const type = typeOf(field);
  if (value === "") return value;
  if (/NUMBER|INTEGER|DOUBLE|FLOAT|DECIMAL|CURRENCY/.test(type)) {
    const converted = Number(value);
    return Number.isFinite(converted) ? converted : value;
  }
  if (/BOOLEAN|BOOL/.test(type)) return value === "true";
  if (/DATETIME|TIMESTAMP/.test(type)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }
  return value;
}

function formValue(value: unknown, field: CrmEditSchemaField) {
  if (value == null) return "";
  const stringValue = String(value);
  if (/DATETIME|TIMESTAMP/.test(typeOf(field))) {
    const date = new Date(stringValue);
    if (!Number.isNaN(date.getTime())) {
      const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
      return localTime.toISOString().slice(0, 16);
    }
  }
  return stringValue;
}

export function CrmRecordEditForm({ properties, fields, isSaving, error, onCancel, onSubmit }: Props) {
  const initialForm = Object.fromEntries(fields.map((field) => {
    const name = nameOf(field); const value = properties[name];
    return [name, formValue(value, field)];
  }));
  const [form, setForm] = useState<Record<string, string>>(() => initialForm);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(fields
      .map((field) => [field, form[nameOf(field)]?.trim() ?? ""] as const)
      .filter(([field, value]) => value !== initialForm[nameOf(field)])
      .map(([field, value]) => [nameOf(field), convertValue(value, field)]));
    onSubmit(values);
  }

  return <form onSubmit={submit} noValidate className="p-5 sm:p-6">
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const name = nameOf(field); const label = field.label || name.replaceAll("_", " "); const type = typeOf(field); const value = form[name] ?? "";
        const options = (field.options ?? []).filter((option) => typeof option === "string" || option.active !== false);
        const setValue = (next: string) => setForm((current) => ({ ...current, [name]: next }));
        const inputType = /DATETIME|TIMESTAMP/.test(type) ? "datetime-local" : type === "DATE" ? "date" : /NUMBER|INTEGER|DOUBLE|FLOAT|DECIMAL|CURRENCY/.test(type) ? "number" : /email/i.test(name) ? "email" : /phone|mobile/i.test(name) ? "tel" : /url|website/i.test(name) ? "url" : "text";
        return <label key={name} className="grid gap-1.5"><span className="text-sm font-medium text-[#343A52]">{label}{field.required && <span className="text-[#E44B55]"> *</span>}</span>
          {/BOOLEAN|BOOL/.test(type) ? <select value={value} onChange={(event) => setValue(event.target.value)} required={field.required} disabled={isSaving} className={inputClass}><option value="">Select an option</option><option value="true">Yes</option><option value="false">No</option></select>
          : options.length > 0 ? <select value={value} onChange={(event) => setValue(event.target.value)} required={field.required} disabled={isSaving} className={inputClass}><option value="">Select {label.toLowerCase()}</option>{options.map((option, index) => { const optionValue = typeof option === "string" ? option : String(option.value ?? ""); const optionLabel = typeof option === "string" ? option : option.label ?? optionValue; return <option key={`${optionValue}-${index}`} value={optionValue}>{optionLabel}</option>; })}</select>
          : <input type={inputType} step={inputType === "number" ? "any" : undefined} value={value} onChange={(event) => setValue(event.target.value)} required={field.required} placeholder={field.description} disabled={isSaving} className={inputClass} />}
        </label>;
      })}
    </div>
    {fields.length === 0 && <p className="text-sm text-[#7187B2]">This record has no updateable properties.</p>}
    {error && <p className="mt-4 text-sm text-[#C24152]">{error}</p>}
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E4EAF8] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} disabled={isSaving} className="h-11 rounded-[12px] border border-[#DCE1EA] px-5 text-sm font-medium text-[#596079] disabled:opacity-60">Cancel</button><button type="submit" disabled={isSaving || fields.length === 0} className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#5B7FF0] px-5 text-sm font-medium text-white disabled:opacity-60">{isSaving && <LoaderCircle className="size-4 animate-spin" />}{isSaving ? "Saving..." : "Save Changes"}</button></div>
  </form>;
}

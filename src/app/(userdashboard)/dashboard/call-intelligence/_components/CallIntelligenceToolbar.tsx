import Link from "next/link";
import { Search, Settings2, SlidersHorizontal, X } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  kind: string;
  sourceType: string;
  onKindChange: (value: string) => void;
  onSourceTypeChange: (value: string) => void;
  onReset: () => void;
  filterOpen: boolean;
  onFilterToggle: () => void;
};

const selectClassName = "mt-1.5 h-10 w-full rounded-lg border border-[#E4EAF8] bg-white px-3 text-sm text-[#0E1224] outline-none focus:border-[#5B7FF0]";

export function CallIntelligenceToolbar({ search, onSearchChange, kind, sourceType, onKindChange, onSourceTypeChange, onReset, filterOpen, onFilterToggle }: Props) {
  const activeFilters = Number(Boolean(kind)) + Number(Boolean(sourceType));
  return <>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex h-11 w-full max-w-[320px] items-center gap-2 rounded-lg bg-white px-4 text-[#8B93B8]"><Search className="size-5 shrink-0" strokeWidth={1.5} /><input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search current records..." aria-label="Search calls" className="min-w-0 flex-1 bg-transparent text-xs text-[#141936] outline-none placeholder:text-[#8B93B8]" /><kbd className="rounded border border-[#8B93B8]/5 px-2 py-1 text-[10px]">⌘K</kbd></label>
      <div className="flex items-center gap-3 self-end sm:self-auto"><Link href="/dashboard/call-intelligence/settings" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-base text-[#6B6B6B] transition hover:text-[#5B7FF0]"><Settings2 className="size-5" strokeWidth={1.5} />Setting</Link><button type="button" onClick={onFilterToggle} aria-expanded={filterOpen} className={`relative inline-flex h-11 items-center gap-2 rounded-lg px-4 text-base transition ${filterOpen || activeFilters ? "bg-[#5B7FF0] text-white" : "bg-white text-[#6B6B6B] hover:text-[#5B7FF0]"}`}><SlidersHorizontal className="size-5" strokeWidth={1.5} />Filter{activeFilters > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#5B7FF0]">{activeFilters}</span>}</button></div>
    </div>
    {filterOpen && <section className="mt-4 rounded-xl bg-white p-4 shadow-[0_6px_24px_rgba(14,18,36,0.06)]"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-medium text-[#0E1224]">Filter call intelligence</h2><p className="mt-1 text-xs text-[#8B93B8]">Filter records by kind and source type</p></div><button type="button" onClick={onFilterToggle} aria-label="Close filters" className="flex size-8 items-center justify-center rounded-lg text-[#8B93B8] hover:bg-[#F5F7FF]"><X className="size-5" /></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs text-[#8B93B8]">Kind<select value={kind} onChange={(event) => onKindChange(event.target.value)} className={selectClassName}><option value="">All kinds</option><option value="CALL">Call</option><option value="MEETING">Meeting</option></select></label><label className="text-xs text-[#8B93B8]">Source Type<select value={sourceType} onChange={(event) => onSourceTypeChange(event.target.value)} className={selectClassName}><option value="">All source types</option><option value="CALL_TRANSCRIPT">Call Transcript</option><option value="ZOOM_MEETING">Zoom Meeting</option><option value="GOOGLE_MEET">Google Meet</option></select></label></div><div className="mt-4 flex justify-end"><button type="button" onClick={onReset} disabled={!activeFilters} className="h-9 rounded-lg border border-[#5B7FF0] px-4 text-sm font-medium text-[#5B7FF0] transition hover:bg-[#5B7FF0]/5 disabled:cursor-not-allowed disabled:opacity-40">Reset filters</button></div></section>}
  </>;
}

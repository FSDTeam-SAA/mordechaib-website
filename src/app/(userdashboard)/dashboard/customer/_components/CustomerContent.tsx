"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { RefreshCw, Search, X } from "lucide-react";
import { AddCustomerModal } from "./AddCustomerModal";
import { ImportCustomerModal } from "./ImportCustomerModal";
import { ExportCustomerButton } from "./ExportCustomerButton";
import { CustomerTableSkeleton } from "./CustomerTableSkeleton";
import { Customer, CustomerTable } from "./CustomerTable";

type ContactsResponse = {
  success?: boolean;
  message?: string;
  data?: Customer | Customer[] | {
    items?: Customer[];
    contacts?: Customer[];
    pagination?: { pages: number };
  };
};

function getContacts(data: ContactsResponse["data"]): Customer[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ("id" in data) return [data];
  return data.items ?? data.contacts ?? [];
}

async function fetchContacts(accessToken: string, signal: AbortSignal, params?: URLSearchParams) {
  const query = params ? `?${params}` : "";
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal,
  });
  const result = (await response.json().catch(() => ({}))) as ContactsResponse;
  if (!response.ok || !result.success) throw new Error(result.message || "Unable to load customers.");
  return result.data;
}

export function CustomerContent({ searchable = false }: { searchable?: boolean }) {
  const { data: session, status: sessionStatus } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const accessToken = session?.user.accessToken;
  const trimmedSearch = search.trim();
  const isSearching = searchable && Boolean(trimmedSearch) && Boolean(accessToken);
  const searchReady = trimmedSearch === searchTerm;

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(trimmedSearch), 300);
    return () => window.clearTimeout(timer);
  }, [trimmedSearch]);

  const searchQuery = useQuery({
    queryKey: ["crm-customer-search", session?.user.id, searchTerm, searchPage, requestKey],
    enabled: isSearching && searchReady && sessionStatus === "authenticated",
    retry: false,
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error("Your session is missing. Please sign in again.");
      return fetchContacts(accessToken, signal, new URLSearchParams({
        search: searchTerm,
        page: String(searchPage),
      })).then((data) => data ?? null);
    },
  });

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!accessToken) {
      setCustomers([]);
      setError("Your session is missing. Please sign in again.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadContacts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchContacts(accessToken, controller.signal);
        if (!controller.signal.aborted) setCustomers(getContacts(data));
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setCustomers([]);
        setError(requestError instanceof Error ? requestError.message : "Unable to load customers.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadContacts();
    return () => controller.abort();
  }, [requestKey, accessToken, sessionStatus]);

  const searchData = searchQuery.data;
  const searchPages = searchData && "pagination" in searchData ? searchData.pagination?.pages ?? 0 : 0;
  const tableLoading = isSearching ? !searchReady || searchQuery.isPending : isLoading;
  const tableError = isSearching ? searchQuery.error?.message : error;
  const refreshCustomers = () => setRequestKey((key) => key + 1);

  function updateSearch(value: string) {
    setSearch(value);
    if (value.trim() !== trimmedSearch) setSearchPage(1);
  }

  return (
    <>
      <header className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-semibold text-[#0E1224]">Customers</h1>
          <p className="mt-1 text-sm text-[#8B93B8]">View and manage all of your customer contacts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportCustomerButton customers={customers} />
          <ImportCustomerModal onImported={refreshCustomers} />
          <AddCustomerModal onCreated={refreshCustomers} />
        </div>
      </header>
      {searchable && (
        <div className="mb-3 flex min-h-11 w-full items-center gap-2 rounded-lg border border-[#E4EAF8] bg-white px-3 focus-within:ring-2 focus-within:ring-[#5B7FF0]/30 sm:max-w-md" role="search" aria-label="Customer search">
          <Search className="size-4 shrink-0 text-[#8B93B8]" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search customers"
            placeholder="Search by name, email, phone, company…"
            maxLength={200}
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-[#0E1224] outline-none placeholder:text-[#6B7394] [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button type="button" aria-label="Clear customer search" onClick={() => updateSearch("")} className="flex size-8 shrink-0 items-center justify-center rounded text-[#5B668D] hover:bg-[#F5F7FF]">
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      {tableLoading ? (
        <CustomerTableSkeleton />
      ) : tableError ? (
        <section className="flex min-h-44 flex-col items-center justify-center rounded-lg bg-white p-5 text-center">
          <p className="text-sm text-[#C24152]">{tableError}</p>
          <button type="button" onClick={refreshCustomers} className="mt-3.5 inline-flex h-10 items-center gap-2 rounded-lg border border-[#5B7FF0] px-3.5 text-sm font-medium text-[#5B7FF0] hover:bg-[#5B7FF0]/5">
            <RefreshCw className="size-4" />
            Try again
          </button>
        </section>
      ) : (
        <>
          <CustomerTable customers={isSearching ? getContacts(searchData ?? undefined) : customers} onChanged={refreshCustomers} />
          {isSearching && (searchPages > 1 || searchPage > 1) && (
            <nav aria-label="Customer search pages" className="mt-3 flex flex-wrap items-center justify-end gap-2 text-sm">
              <button type="button" disabled={searchPage === 1} onClick={() => setSearchPage((page) => page - 1)} className="min-h-10 rounded-lg border border-[#E4EAF8] bg-white px-3 text-[#0E1224] disabled:opacity-50">Previous</button>
              <span>Page {searchPage}{searchPages >= searchPage ? ` of ${searchPages}` : ""}</span>
              <button type="button" disabled={searchPage >= searchPages} onClick={() => setSearchPage((page) => page + 1)} className="min-h-10 rounded-lg border border-[#E4EAF8] bg-white px-3 text-[#0E1224] disabled:opacity-50">Next</button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

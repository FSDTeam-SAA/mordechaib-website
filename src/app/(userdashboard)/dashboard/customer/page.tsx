"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw } from "lucide-react";



import { AddCustomerModal } from "./_components/AddCustomerModal";
import { CustomerTableSkeleton } from "./_components/CustomerTableSkeleton";
import { Customer, CustomerTable } from "./_components/CustomerTable";

type ContactsResponse = {
  success?: boolean;
  message?: string;
  data?: Customer | Customer[] | { items?: Customer[]; contacts?: Customer[] };
};

function getContacts(data: ContactsResponse["data"]): Customer[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ("id" in data) return [data];
  return data.items ?? data.contacts ?? [];
}

export default function CustomerPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      setError("Your session is missing. Please sign in again.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadContacts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contacts`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const result = (await response
          .json()
          .catch(() => ({}))) as ContactsResponse;
        if (!response.ok || !result.success)
          throw new Error(result.message || "Unable to load customers.");
        setCustomers(getContacts(result.data));
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setCustomers([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load customers.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadContacts();
    return () => controller.abort();
  }, [requestKey, session?.user.accessToken, sessionStatus]);

  return (
    <main className="min-h-[calc(100vh-83px)] p-4 pb-10">
      <header className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#0E1224]">Customers</h1>
          <p className="mt-1 text-sm text-[#8B93B8]">
            View and manage all of your customer contacts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AddCustomerModal onCreated={() => setRequestKey((key) => key + 1)} />
        </div>
      </header>
      {isLoading ? (
        <CustomerTableSkeleton />
      ) : error ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
          <p className="text-sm text-[#C24152]">{error}</p>
          <button
            type="button"
            onClick={() => setRequestKey((key) => key + 1)}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-[#5B7FF0] px-4 text-sm font-medium text-[#5B7FF0] hover:bg-[#5B7FF0]/5"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </section>
      ) : (
        <CustomerTable customers={customers} onChanged={() => setRequestKey((key) => key + 1)} />
      )}
    </main>
  );
}

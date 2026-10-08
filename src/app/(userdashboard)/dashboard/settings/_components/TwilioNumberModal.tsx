"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, LoaderCircle, Search, ShoppingCart } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type TwilioNumberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase?: (
    phoneNumber: string,
    country: CountryCode,
    forwardingNumber: string,
  ) => void;
};

type CountryCode = "US" | "GB" | "FR";

type AvailableNumber = {
  phoneNumber: string;
  friendlyName: string;
  country: CountryCode;
  locality?: string | null;
  region?: string | null;
  postalCode?: string | null;
  addressRequirements?: string;
  capabilities?: { voice?: boolean; sms?: boolean; mms?: boolean };
};

type AvailableNumbersResponse = {
  success?: boolean;
  message?: string;
  data?: {
    country?: CountryCode;
    type?: string;
    items?: AvailableNumber[];
  };
};

type TwilioConnectionResponse = {
  success?: boolean;
  message?: string;
};

const countries: Array<{
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
}> = [
  { code: "US", name: "United States", callingCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", callingCode: "+44", flag: "🇬🇧" },
  { code: "FR", name: "France", callingCode: "+33", flag: "🇫🇷" },
];

const formatNumber = (number: AvailableNumber, callingCode: string) =>
  number.friendlyName.startsWith("+")
    ? number.friendlyName
    : `${callingCode} ${number.friendlyName}`;

export function TwilioNumberModal({
  open,
  onOpenChange,
  onPurchase,
}: TwilioNumberModalProps) {
  const { data: session } = useSession();
  const [country, setCountry] = useState<CountryCode>("US");
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [forwardingNumber, setForwardingNumber] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const selectedCountry =
    countries.find(({ code }) => code === country) ?? countries[0];
  const selected = availableNumbers.find(
    ({ phoneNumber }) => phoneNumber === selectedNumber,
  );

  useEffect(() => {
    if (!open) return;

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      setAvailableNumbers([]);
      setSelectedNumber("");
      setError("Your session is missing. Please sign in again.");
      return;
    }

    const controller = new AbortController();

    const loadAvailableNumbers = async () => {
      setIsLoading(true);
      setError("");
      setAvailableNumbers([]);
      setSelectedNumber("");

      try {
        const params = new URLSearchParams({
          country,
          limit: "20",
        });
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/twilio/numbers/available?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const result = (await response
          .json()
          .catch(() => ({}))) as AvailableNumbersResponse;

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load available numbers.");
        }

        const numbers = result.data?.items ?? [];
        setAvailableNumbers(numbers);
        setSelectedNumber(numbers[0]?.phoneNumber ?? "");
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load available numbers.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadAvailableNumbers();
    return () => controller.abort();
  }, [country, open, requestKey, session?.user.accessToken]);

  const openPurchaseModal = () => {
    if (!selected) return;
    setForwardingNumber("");
    setPurchaseError("");
    onOpenChange(false);
    setIsPurchaseModalOpen(true);
  };

  const closePurchaseModal = () => {
    if (isPurchasing) return;
    setIsPurchaseModalOpen(false);
    onOpenChange(true);
  };

  const purchaseNumber = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !forwardingNumber.trim() || isPurchasing) return;

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      setPurchaseError("Your session is missing. Please sign in again.");
      return;
    }

    setIsPurchasing(true);
    setPurchaseError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/twilio/connection`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: selected.phoneNumber,
            country,
            forwardingNumber: forwardingNumber.trim(),
            isRecordingEnabled: true,
          }),
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as TwilioConnectionResponse;

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to purchase this number.");
      }

      setIsPurchaseModalOpen(false);
      onPurchase?.(selected.phoneNumber, country, forwardingNumber.trim());
    } catch (requestError) {
      setPurchaseError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to purchase this number.",
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[#0E1224]/45 backdrop-blur-[3px]"
        className="max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[460px] gap-0 overflow-hidden !rounded-[18px] border border-[#E2E6F0] bg-white p-0 shadow-[0_24px_70px_rgba(21,25,54,0.22)] sm:w-full"
      >
        <div className="px-4 pb-5 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
          <header className="px-7 text-center">
            <DialogTitle className="text-[20px] font-semibold leading-7 text-[#15192C] sm:text-[22px]">
              Choose Your Business Number
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-[#626A87]">
              Search available numbers
            </DialogDescription>
          </header>

          <div className="mt-5 overflow-hidden rounded-[10px] border border-[#DCE1EA] bg-white shadow-[0_1px_4px_rgba(19,27,61,0.06)]">
            <div className="grid grid-cols-[minmax(0,1fr)_48px] border-b border-[#E4E7EE]">
              <label className="relative flex h-12 min-w-0 items-center">
                <span
                  className="pointer-events-none absolute left-3.5 text-lg"
                  aria-hidden="true"
                >
                  {selectedCountry.flag}
                </span>
                <select
                  aria-label="Country"
                  className="h-full w-full appearance-none bg-transparent pl-11 pr-8 text-sm font-medium text-[#343A52] outline-none"
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value as CountryCode)
                  }
                >
                  {countries.map(({ code, name, callingCode }) => (
                    <option key={code} value={code}>
                      {name} ({callingCode})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#66708D]">
                  ⌄
                </span>
              </label>
              <div className="flex h-12 items-center justify-center border-l border-[#E4E7EE] text-[#66708D]">
                <Search className="size-[18px]" aria-hidden="true" />
              </div>
            </div>

            <div
              className="p-2"
              role="radiogroup"
              aria-label="Available phone numbers"
            >
              {isLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#7B849E]">
                  <LoaderCircle
                    className="size-5 animate-spin"
                    aria-hidden="true"
                  />
                  Loading available numbers...
                </div>
              ) : error ? (
                <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-sm text-[#C24152]">{error}</p>
                  <button
                    type="button"
                    onClick={() => setRequestKey((key) => key + 1)}
                    className="rounded-md border border-[#6538EB] px-3 py-1.5 text-sm font-medium text-[#6538EB] hover:bg-[#F8F7FF]"
                  >
                    Try again
                  </button>
                </div>
              ) : availableNumbers.length ? (
                <div
                  className="max-h-[min(300px,42dvh)] touch-pan-y overflow-y-scroll overscroll-contain [scrollbar-color:#CBD3E3_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#CBD3E3] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
                  onWheel={(event) => {
                    event.currentTarget.scrollTop += event.deltaY;
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  {availableNumbers.map((number) => {
                    const { phoneNumber, locality, region } = number;
                    const isSelected = selectedNumber === phoneNumber;
                    const location =
                      [locality, region].filter(Boolean).join(", ") || "Local";

                    return (
                      <label
                        key={phoneNumber}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-[#F7F7FC] ${isSelected ? "bg-[#F8F7FF]" : ""}`}
                      >
                        <input
                          type="radio"
                          name="twilio-number"
                          value={phoneNumber}
                          checked={isSelected}
                          onChange={() => setSelectedNumber(phoneNumber)}
                          className="sr-only"
                        />
                        <span
                          className={`flex size-[19px] shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-[#6538EB]" : "border-[#CDD2DE]"}`}
                        >
                          {isSelected && (
                            <span className="size-[9px] rounded-full bg-[#6538EB]" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-[#252A40] sm:text-[15px]">
                          {formatNumber(number, selectedCountry.callingCode)}
                        </span>
                        <span className="max-w-[110px] shrink-0 truncate rounded-md px-2 py-1 text-[11px] font-medium text-[#56607D]">
                          {location}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="px-3 py-8 text-center text-sm text-[#7B849E]">
                  No available numbers found for {selectedCountry.name}.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex min-h-8 items-center justify-center gap-2 text-center text-sm text-[#4D556F]">
            <span>Selected:</span>
            <strong className="text-base font-semibold text-[#20253A]">
              {selected
                ? formatNumber(selected, selectedCountry.callingCode)
                : "None"}
            </strong>
            {selected && (
              <Check className="size-4 text-[#36AD68]" aria-hidden="true" />
            )}
          </div>

          <button
            type="button"
            onClick={openPurchaseModal}
            disabled={!selected}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2.5 rounded-[8px] bg-gradient-to-r from-[#5E2BE5] to-[#6938EF] px-5 text-[15px] font-medium text-white shadow-[0_8px_20px_rgba(99,52,234,0.25)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6636EC] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="size-[19px]" aria-hidden="true" />
            Purchase Number
          </button>
        </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPurchaseModalOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closePurchaseModal();
        }}
      >
        <DialogContent
          overlayClassName="bg-[#0E1224]/45 backdrop-blur-[3px]"
          className="w-[calc(100%-24px)] max-w-[430px] gap-0 overflow-hidden !rounded-[18px] border border-[#E2E6F0] bg-white p-0 shadow-[0_24px_70px_rgba(21,25,54,0.22)]"
          showClose={!isPurchasing}
        >
          <form onSubmit={purchaseNumber} className="px-5 py-6 sm:px-7 sm:py-7">
            <header className="pr-7">
              <DialogTitle className="text-xl font-semibold text-[#15192C]">
                Complete Number Purchase
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm leading-5 text-[#626A87]">
                Enter the phone number where incoming calls should be forwarded.
              </DialogDescription>
            </header>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-[#343A52]">
                  Selected phone number
                </span>
                <input
                  value={
                    selected
                      ? formatNumber(selected, selectedCountry.callingCode)
                      : ""
                  }
                  readOnly
                  className="h-11 rounded-lg border border-[#DCE1EA] bg-[#F7F8FB] px-3 text-sm text-[#596079] outline-none"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-[#343A52]">Country</span>
                <input
                  value={`${selectedCountry.name} (${country})`}
                  readOnly
                  className="h-11 rounded-lg border border-[#DCE1EA] bg-[#F7F8FB] px-3 text-sm text-[#596079] outline-none"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-medium text-[#343A52]">
                  Forwarding number
                </span>
                <input
                  type="tel"
                  value={forwardingNumber}
                  onChange={(event) => setForwardingNumber(event.target.value)}
                  placeholder="e.g. +1 415 555 0123"
                  required
                  autoFocus
                  disabled={isPurchasing}
                  className="h-11 rounded-lg border border-[#DCE1EA] bg-white px-3 text-sm text-[#252A40] outline-none transition placeholder:text-[#A0A7B9] focus:border-[#6538EB] focus:ring-2 focus:ring-[#6538EB]/15 disabled:bg-[#F7F8FB]"
                />
              </label>
            </div>

            {purchaseError && (
              <p className="mt-3 text-sm text-[#C24152]" role="alert">
                {purchaseError}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closePurchaseModal}
                disabled={isPurchasing}
                className="h-11 rounded-lg border border-[#DCE1EA] text-sm font-medium text-[#596079] transition hover:bg-[#F7F8FB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isPurchasing || !forwardingNumber.trim()}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5E2BE5] to-[#6938EF] px-4 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPurchasing && (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                )}
                {isPurchasing ? "Purchasing..." : "Confirm Purchase"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

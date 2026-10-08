"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthPanelAnimation } from "@/lib/useAuthPanelAnimation";
import DateCalendar, {
  formatDateParam,
  parseDateParam,
} from "../starter/_components/DateCalendar";

type RawTimeSlot =
  | string
  | {
      start?: string;
      startTime?: string;
      startsAt?: string;
      dateTime?: string;
      available?: boolean;
    };

type AvailableSlotsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: RawTimeSlot[] | { slots?: RawTimeSlot[]; availableSlots?: RawTimeSlot[] };
};

type BookMeetingResponse = {
  success?: boolean;
  message?: string | string[];
};

const getSlotValue = (slot: RawTimeSlot) => {
  if (typeof slot === "string") return slot;
  return slot.start ?? slot.startTime ?? slot.startsAt ?? slot.dateTime ?? "";
};

type StarterDateSlotPageProps = {
  searchParams?: { date?: string; onboardingSetupId?: string };
};

export default function StarterDateSlotPage({ searchParams }: StarterDateSlotPageProps) {
  const router = useRouter();
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState(() => parseDateParam(searchParams?.date ?? null));
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [onboardingSetupId, setOnboardingSetupId] = useState(
    searchParams?.onboardingSetupId ?? ""
  );
  const [hasResolvedSetupId, setHasResolvedSetupId] = useState(
    Boolean(searchParams?.onboardingSetupId)
  );
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );
  const selectedDateValue = formatDateParam(selectedDate);

  useAuthPanelAnimation(imagePanelRef, formPanelRef, "right");

  useEffect(() => {
    if (!onboardingSetupId) {
      setOnboardingSetupId(localStorage.getItem("onboardingSetupId") || "");
    }
    setHasResolvedSetupId(true);
  }, [onboardingSetupId]);

  const slotsQuery = useQuery({
    queryKey: ["available-onboarding-slots", onboardingSetupId, selectedDateValue, timezone],
    enabled: Boolean(onboardingSetupId),
    retry: false,
    queryFn: async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const query = new URLSearchParams({
        date: selectedDateValue,
        timezone,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/onboarding-setups/${encodeURIComponent(onboardingSetupId)}/available-slots?${query.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const result = (await response.json().catch(() => ({}))) as AvailableSlotsResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Unable to load available time slots");
      }

      const rawSlots = Array.isArray(result.data)
        ? result.data
        : result.data?.slots ?? result.data?.availableSlots ?? [];
      return rawSlots
        .filter((slot) => typeof slot === "string" || slot.available !== false)
        .map(getSlotValue)
        .filter(Boolean);
    },
  });

  useEffect(() => {
    if (slotsQuery.error) {
      toast.error(
        slotsQuery.error instanceof Error
          ? slotsQuery.error.message
          : "Unable to load available time slots"
      );
    }
  }, [slotsQuery.error]);

  const formatSlotTime = (slot: string) => {
    const date = new Date(slot);
    if (Number.isNaN(date.getTime())) return slot;

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(date);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot("");
    const query = new URLSearchParams({ date: formatDateParam(date) });
    if (onboardingSetupId) query.set("onboardingSetupId", onboardingSetupId);
    router.replace(`/starter-dateslot?${query.toString()}`, { scroll: false });
  };

  const bookMeetingMutation = useMutation({
    mutationFn: async () => {
      if (!onboardingSetupId) {
        throw new Error("Onboarding setup ID is missing. Please select your package again.");
      }

      if (!selectedSlot) {
        throw new Error("Please select an available time slot.");
      }

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/onboarding-setups/${encodeURIComponent(onboardingSetupId)}/book-meeting`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            startTime: selectedSlot,
            timezone,
            notes: notes.trim(),
          }),
        }
      );
      const result = (await response.json().catch(() => ({}))) as BookMeetingResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Unable to book your meeting");
      }

      return message;
    },
    onSuccess: (message) => {
      localStorage.removeItem("onboardingSetupId");
      toast.success(message || "Meeting booked successfully.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to book your meeting. Please try again."
      );
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfbfc] px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
      <section className="grid w-full max-w-[1180px] overflow-hidden rounded-[14px] border border-[#e4e5e9] bg-white shadow-[0_3px_12px_rgba(15,23,42,0.12)] md:grid-cols-[1.1fr_1fr]">
        <div ref={formPanelRef} className="flex min-h-[620px] flex-col px-4 py-6 sm:px-7 md:px-8 lg:px-10">
          <button type="button" onClick={() => router.back()} className="inline-flex w-fit items-center gap-2 text-xs font-medium text-[#111526] transition-colors hover:text-[#5f7ff0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0]">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back
          </button>

          <div className="mx-auto mt-5 flex w-full max-w-[550px] flex-1 flex-col sm:mt-7">
            <header className="text-center">
              <h1 className="text-[25px] font-bold leading-tight text-[#111526] sm:text-[30px]">
                AI Business Launch Package
              </h1>
              <p className="mt-2 text-[13px] leading-5 text-[#737783] sm:text-sm">
                Choose a convenient time for your integration call.
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#5f7ff0]">
                Times shown in {timezone}
              </p>
            </header>

            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_92px] sm:gap-4">
              <DateCalendar selectedDate={selectedDate} onSelect={handleDateChange} />

              <div className="grid grid-cols-2 gap-2 min-[430px]:grid-cols-3 sm:grid-cols-1 sm:content-start" role="radiogroup" aria-label="Choose a time">
                {(!hasResolvedSetupId || slotsQuery.isLoading) && Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="h-11 rounded-[9px] sm:h-[48px]" />
                ))}

                {hasResolvedSetupId && !onboardingSetupId && (
                  <div className="col-span-full rounded-[9px] border border-dashed border-[#d8deec] bg-[#fafbfe] px-3 py-5 text-center text-xs leading-5 text-[#737c94]">
                    Onboarding setup ID is missing. Please select your setup package again.
                  </div>
                )}

                {slotsQuery.isError && (
                  <button type="button" onClick={() => slotsQuery.refetch()} className="col-span-full flex min-h-20 items-center justify-center gap-2 rounded-[9px] border border-dashed border-[#d8deec] bg-[#fafbfe] px-3 text-xs font-medium text-[#5f7ff0]">
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    Try loading slots again
                  </button>
                )}

                {slotsQuery.isSuccess && slotsQuery.data.length === 0 && (
                  <div className="col-span-full rounded-[9px] border border-dashed border-[#d8deec] bg-[#fafbfe] px-3 py-5 text-center text-xs leading-5 text-[#737c94]">
                    No slots are available for this date. Please choose another date.
                  </div>
                )}

                {slotsQuery.data?.map((slot) => {
                  const selected = selectedSlot === slot;

                  return (
                    <button key={slot} type="button" role="radio" aria-checked={selected} onClick={() => setSelectedSlot(slot)} className={`flex h-11 items-center justify-center gap-1.5 rounded-[9px] border text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6281ef] focus-visible:ring-offset-1 sm:h-[48px] ${selected ? "border-[#6382f1] bg-[#6382f1] text-white" : "border-[#7893f4] bg-white text-[#6281ef] hover:bg-[#f3f5ff]"}`}>
                      <Clock3 className="size-3" aria-hidden="true" />
                      {formatSlotTime(slot)}
                    </button>
                  );
                })}
              </div>
            </div>

            <label htmlFor="meeting-notes" className="mt-3 block text-sm font-medium text-[#30364a]">
              Notes <span className="font-normal text-[#929bb2]">(optional)</span>
              <textarea
                id="meeting-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Please discuss our CRM migration requirements."
                className="mt-2 min-h-[82px] w-full resize-y rounded-[10px] border border-[#dfe5f7] bg-[#f6f8ff] px-3.5 py-3 text-sm leading-5 text-[#20263a] outline-none transition placeholder:text-[#a1aac0] focus:border-[#6382f1] focus:bg-white focus:ring-2 focus:ring-[#6382f1]/15"
              />
            </label>

            <button type="button" onClick={() => bookMeetingMutation.mutate()} disabled={!selectedSlot || !onboardingSetupId || slotsQuery.isLoading || bookMeetingMutation.isPending} className="mt-3 h-11 w-full rounded-[9px] bg-[#5f7ff0] text-sm font-medium text-white transition-colors hover:bg-[#526fdb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {bookMeetingMutation.isPending ? "Booking..." : "Book A Meeting"}
            </button>
          </div>
        </div>

        <div ref={imagePanelRef} className="relative hidden min-h-[620px] overflow-hidden bg-[#6080f2] md:block">
          <Image src="/auth.png" alt="Noltra AI product benefits" fill priority sizes="(min-width: 1180px) 562px, 48vw" className="object-cover object-center" />
        </div>
      </section>
    </main>
  );
}

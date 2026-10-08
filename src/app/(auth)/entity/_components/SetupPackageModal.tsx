"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  Headphones,
  RefreshCw,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SetupPackage = {
  _id: string;
  code: string;
  name: string;
  description: string;
  setupType: string;
  setupFeeType: string;
  price: number;
  currency: string;
  paymentRequired: boolean;
  meetingRequired: boolean;
  isActive: boolean;
  sortOrder: number;
};

type SetupPackageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackageId: string | null;
  onSelect: (packageId: string) => void;
};

type SetupPackagesResponse = {
  success?: boolean;
  message?: string | string[];
  data?: SetupPackage[];
};

type CreateOnboardingSetupResponse = {
  success?: boolean;
  message?: string | string[];
  stripeUrl?: string;
  stripeCheckoutUrl?: string;
  checkoutUrl?: string;
  paymentUrl?: string;
  data?: {
    _id?: string;
    id?: string;
    stripeUrl?: string;
    stripeCheckoutUrl?: string;
    checkoutUrl?: string;
    checkoutSessionUrl?: string;
    paymentUrl?: string;
    url?: string;
    payment?: { url?: string; checkoutUrl?: string };
    onboardingSetup?: { _id?: string; id?: string };
    setup?: { _id?: string; id?: string };
  };
};

const formatPrice = (setupPackage: SetupPackage) => {
  if (!setupPackage.paymentRequired || setupPackage.price === 0) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: setupPackage.currency,
    maximumFractionDigits: 0,
  }).format(setupPackage.price);
};

function PackageSkeleton() {
  return (
    <div className="min-h-[245px] rounded-[12px] border border-[#e2e6f0] p-5">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="size-10 rounded-[10px]" />
        <Skeleton className="h-6 w-16 rounded-[8px]" />
      </div>
      <Skeleton className="mt-5 h-5 w-3/5 rounded-[6px]" />
      <Skeleton className="mt-3 h-3 w-full rounded-[6px]" />
      <Skeleton className="mt-2 h-3 w-4/5 rounded-[6px]" />
      <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#edf0f6] pt-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-[6px]" />
          <Skeleton className="h-7 w-20 rounded-[6px]" />
        </div>
        <Skeleton className="size-6 rounded-[12px]" />
      </div>
    </div>
  );
}

export function SetupPackageModal({
  open,
  onOpenChange,
  selectedPackageId,
  onSelect,
}: SetupPackageModalProps) {
  const router = useRouter();
  const packagesQuery = useQuery({
    queryKey: ["setup-packages"],
    enabled: open,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/setup-packages`
      );
      const result = (await response.json().catch(() => ({}))) as SetupPackagesResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Unable to load setup packages");
      }

      return (result.data ?? [])
        .filter((setupPackage) => setupPackage.isActive)
        .sort((first, second) => first.sortOrder - second.sortOrder);
    },
  });

  useEffect(() => {
    if (packagesQuery.error) {
      toast.error(
        packagesQuery.error instanceof Error
          ? packagesQuery.error.message
          : "Unable to load setup packages"
      );
    }
  }, [packagesQuery.error]);

  const selectedPackage = packagesQuery.data?.find(
    (setupPackage) => setupPackage._id === selectedPackageId
  );

  const createSetupMutation = useMutation({
    mutationFn: async (setupPackage: SetupPackage) => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/onboarding-setups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            setupPackageId: setupPackage._id,
            paymentSuccessUrl: `${window.location.origin}/payment-sucess`,
            paymentCancelUrl: `${window.location.origin}/payment-cancle`,
          }),
        }
      );
      const result = (await response.json().catch(() => ({}))) as CreateOnboardingSetupResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || !result.success) {
        throw new Error(message || "Unable to confirm your setup package");
      }

      const paymentUrl =
        result.data?.stripeUrl ??
        result.data?.stripeCheckoutUrl ??
        result.data?.checkoutUrl ??
        result.data?.checkoutSessionUrl ??
        result.data?.paymentUrl ??
        result.data?.payment?.checkoutUrl ??
        result.data?.payment?.url ??
        result.data?.url ??
        result.stripeUrl ??
        result.stripeCheckoutUrl ??
        result.checkoutUrl ??
        result.paymentUrl;
      const onboardingSetupId =
        result.data?.onboardingSetup?._id ??
        result.data?.onboardingSetup?.id ??
        result.data?.setup?._id ??
        result.data?.setup?.id ??
        result.data?._id ??
        result.data?.id;

      if (setupPackage.paymentRequired && !paymentUrl) {
        throw new Error("Payment link was not returned. Please try again.");
      }

      if (!setupPackage.paymentRequired && !onboardingSetupId) {
        throw new Error("Onboarding setup ID was not returned. Please try again.");
      }

      return {
        message,
        paymentRequired: setupPackage.paymentRequired,
        paymentUrl,
        onboardingSetupId,
      };
    },
    onSuccess: ({ message, paymentRequired, paymentUrl, onboardingSetupId }) => {
      toast.success(message || "Setup package confirmed successfully.");

      if (onboardingSetupId) {
        localStorage.setItem("onboardingSetupId", onboardingSetupId);
      }

      if (paymentRequired && paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }

      onOpenChange(false);
      router.push("/starter");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to confirm your setup package. Please try again."
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-lenis-prevent
        className="max-h-[92dvh] w-[calc(100%-24px)] max-w-[760px] overflow-y-auto rounded-[16px] border-0 bg-white p-5 shadow-2xl sm:p-8"
      >
        <DialogHeader className="pr-8 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eef2ff] text-[#5f7ff0]">
              <Headphones className="size-5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold leading-tight text-[#111526] sm:text-2xl">
                Choose your integration package
              </DialogTitle>
              <DialogDescription className="mt-1.5 max-w-[590px] text-sm leading-5 text-[#68708a]">
                Select the support level that fits your setup. You can review the fee before
                confirming your choice.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-3 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Setup packages">
          {packagesQuery.isLoading && (
            <>
              <PackageSkeleton />
              <PackageSkeleton />
            </>
          )}

          {packagesQuery.isError && (
            <div className="col-span-full flex min-h-[245px] flex-col items-center justify-center rounded-[12px] border border-dashed border-[#d8deec] bg-[#fafbfe] px-6 text-center">
              <RefreshCw className="size-6 text-[#8b96b3]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#20263a]">Packages could not be loaded</p>
              <p className="mt-1 text-xs text-[#7c859d]">Check your connection and try again.</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => packagesQuery.refetch()}
                className="mt-4 h-9 rounded-[10px] border-[#5f7ff0] text-[#5f7ff0] hover:bg-[#eef2ff] hover:text-[#526fdb]"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try again
              </Button>
            </div>
          )}

          {packagesQuery.isSuccess && packagesQuery.data.length === 0 && (
            <div className="col-span-full flex min-h-[220px] items-center justify-center rounded-[12px] border border-dashed border-[#d8deec] bg-[#fafbfe] px-6 text-center text-sm text-[#68708a]">
              No setup packages are available right now.
            </div>
          )}

          {packagesQuery.data?.map((setupPackage, index) => {
            const selected = selectedPackageId === setupPackage._id;
            const Icon = setupPackage.paymentRequired ? Rocket : BadgeCheck;

            return (
              <button
                key={setupPackage._id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(setupPackage._id)}
                className={cn(
                  "min-h-[245px] rounded-[12px] border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2",
                  selected
                    ? "border-[#5f7ff0] bg-[#f5f7ff] shadow-[0_8px_24px_rgba(95,127,240,0.14)]"
                    : "border-[#e2e6f0] bg-white hover:border-[#b9c6f5] hover:shadow-[0_6px_20px_rgba(31,42,82,0.08)]"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-[10px]",
                      index === 0
                        ? "bg-[#e9f8f3] text-[#16886a]"
                        : "bg-[#fff1ed] text-[#d35b3f]"
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
               
                </div>

                <h3 className="mt-5 text-base font-semibold text-[#171c2f]">{setupPackage.name}</h3>
                <p className="mt-2 min-h-[44px] text-xs leading-[18px] text-[#737c94]">
                  {setupPackage.description}
                </p>

                <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#e8ebf2] pt-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase text-[#8b94ab]">
                      {setupPackage.paymentRequired ? "One-time setup" : "Setup fee"}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#151a2d]">
                      {formatPrice(setupPackage)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-[12px] border",
                      selected
                        ? "border-[#5f7ff0] bg-[#5f7ff0] text-white"
                        : "border-[#b9c0d1] bg-white text-transparent"
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-2 grid grid-cols-2 gap-3 sm:grid sm:grid-cols-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createSetupMutation.isPending}
            className="h-11 rounded-[12px] border-[#cbd1df] text-[#353c51]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedPackage || createSetupMutation.isPending}
            onClick={() => {
              if (selectedPackage) createSetupMutation.mutate(selectedPackage);
            }}
            className="h-11 rounded-[12px] bg-[#5f7ff0] text-white hover:bg-[#526fdb]"
          >
            {createSetupMutation.isPending
              ? "Confirming..."
              : selectedPackage?.paymentRequired
                ? "Continue to payment"
                : "Confirm free package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Mic,
  Phone,
  Rocket,
  Zap,
  type LucideIcon,
} from "lucide-react";
import PricingPlanModal from "@/components/home/PricingPlanModal";
import UsageEstimator from "@/components/home/UsageEstimator";
import { checkoutRequest, type CheckoutPlan } from "@/lib/checkout-api";

type BillingCycle = "month" | "year";

const planAppearance: Record<string, { icon: LucideIcon; color: string }> = {
  STARTER: { icon: Rocket, color: "border-[#5B7FF0]" },
  GROWTH: { icon: Zap, color: "border-[#5BA5E8]" },
  ENTERPRISE: { icon: Building2, color: "border-[#F59E0B]" },
  CUSTOM: { icon: Zap, color: "border-[#A855F7]" },
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const formatLimit = (value: number) => new Intl.NumberFormat("en-US").format(value);

function planGroups(plan: CheckoutPlan) {
  const usage = [
    plan.aiActionsPerMonth != null && `${formatLimit(plan.aiActionsPerMonth)} AI Actions`,
    plan.crmContactsLimit != null && `${formatLimit(plan.crmContactsLimit)} CRM Contacts`,
    plan.callMinutesPerMonth != null && `${formatLimit(plan.callMinutesPerMonth)} call minutes`,
    plan.meetingHoursPerMonth != null && `AI Meeting Capture - ${formatLimit(plan.meetingHoursPerMonth)} hours`,
  ].filter(Boolean) as string[];
  const capabilities = [
    plan.aiAgentsIncluded != null && `${formatLimit(plan.aiAgentsIncluded)} AI agents`,
    ...(plan.features ?? []),
  ].filter(Boolean) as string[];
  const support = [
    plan.usersIncluded != null && `${formatLimit(plan.usersIncluded)} user${plan.usersIncluded === 1 ? "" : "s"} included`,
  ].filter(Boolean) as string[];

  return [
    { title: "Included Monthly Usage", items: usage },
    { title: "Core Capabilities", items: capabilities },
    { title: "Support", items: support },
  ].filter((group) => group.items.length > 0);
}

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("month");
  const plansQuery = useQuery({
    queryKey: ["subscription-plans", billingCycle],
    queryFn: ({ signal }) =>
      checkoutRequest<CheckoutPlan[]>(`/subscription-plans?billingCycle=${billingCycle}`, { signal }),
  });
  const plans = plansQuery.data ?? [];
  const yearlyAvailable = plans.some((plan) => plan.billingCycles?.includes("year"));
  const maximumTrialDays = Math.max(0, ...plans.map((plan) => plan.trialDays ?? 0));

  return (
    <section id="pricing" className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="container mx-auto">
        <div className="mx-auto max-w-[820px] text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#5B7FF014] px-3 py-1.5 text-xs font-medium text-[#5B7FF0]">
            <DollarSign size={13} />
            Simple Pricing
          </div>
          <h2 className="text-3xl font-bold leading-tight text-[#0E1224] sm:text-4xl lg:text-[46px]">
            Start <span className="text-[#5B7FF0]">Free.</span> Scale When You&apos;re{" "}
            <span className="text-[#5B7FF0]">Ready.</span>
          </h2>
          <p className="mt-4 text-sm text-[#6B6B6B] sm:text-base">
            {maximumTrialDays > 0 ? `Enjoy up to a ${maximumTrialDays}-day free trial.` : "Explore our available plans."} We&apos;ll only bill your card if you continue after the trial.
          </p>
        </div>

        <div className="mt-12">
          <UsageEstimator />
        </div>

        <div className="mt-10 text-center">
          <div className="mx-auto flex w-full max-w-[330px] rounded-[16px] bg-[#F5F7FF] p-2" role="group" aria-label="Billing cycle">
            <button
              type="button"
              onClick={() => setBillingCycle("month")}
              aria-pressed={billingCycle === "month"}
              className={`h-12 flex-1 rounded-[12px] text-base font-semibold ${billingCycle === "month" ? "bg-[#5B7FF0] text-white" : "text-[#5B7FF0]"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => yearlyAvailable && setBillingCycle("year")}
              disabled={plansQuery.isSuccess && !yearlyAvailable}
              title={plansQuery.isSuccess && !yearlyAvailable ? "Yearly billing is currently unavailable." : undefined}
              aria-pressed={billingCycle === "year"}
              className={`h-11 flex-1 rounded-lg text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${billingCycle === "year" ? "bg-[#5B7FF0] text-white" : "text-[#5B7FF0]"}`}
            >
              Yearly <span className="ml-1 rounded-full bg-[#DDE7FF] px-2 py-1 text-[12px] text-[#5B7FF0]">2 months free</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plansQuery.isPending && <p role="status" className="col-span-full text-center text-sm text-[#7A849D]">Loading subscription plans…</p>}
          {plansQuery.isError && (
            <div role="alert" className="col-span-full text-center text-sm text-red-500">
              {plansQuery.error.message}{" "}
              <button type="button" onClick={() => void plansQuery.refetch()} className="font-semibold underline">Try again</button>
            </div>
          )}
          {!plansQuery.isPending && !plansQuery.isError && plans.length === 0 && (
            <p className="col-span-full text-center text-sm text-[#7A849D]">No subscription plans are available for this billing cycle.</p>
          )}
          {plans.map((plan) => {
            const appearance = planAppearance[plan.planType] ?? planAppearance.STARTER;
            const Icon = appearance.icon;
            const custom = plan.isInquiryOnly || plan.planType === "CUSTOM";
            const price = billingCycle === "year" ? plan.annualPriceUsd : plan.priceUsd;
            const groups = planGroups(plan);
            return (
              <article key={plan._id} className={`relative flex flex-col rounded-xl border-2 ${appearance.color} bg-white p-5 shadow-sm`}>
                {plan.isMostPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-[12px] bg-[#5B7FF0] px-4 py-1.5 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B7FF0] text-white">
                    <Icon size={20} />
                  </span>
                  <h3 className="text-xl font-bold text-[#0E1224]">{plan.name}</h3>
                </div>
                <p className="mt-4 min-h-[42px] text-base text-[#0E1224]">{plan.tagline || "A flexible plan for your business."}</p>
                <div className="mt-6 border-b pb-6">
                  <span className={custom ? "text-2xl font-bold text-[#0E1224]" : "text-[44px] font-bold leading-none text-[#A567F5]"}>
                    {custom ? "Let's talk" : price == null ? "Contact sales" : money.format(price)}
                  </span>
                  {!custom && price != null && <span className="ml-1 text-sm text-[#7A7A7A]">/{billingCycle === "year" ? "yr" : "mo"}</span>}
                </div>
                <div className="mt-6 space-y-5">
                  {groups.map((group) => (
                    <div key={group.title}>
                      <h4 className="text-[10px] font-bold uppercase tracking-wide text-[#7A849D]">{group.title}</h4>
                      <ul className="mt-2 space-y-2">
                        {group.items.map((item) => (
                          <li key={item} className="flex gap-2 text-sm leading-relaxed text-[#0E1224]">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5BA5E8]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-auto border-t border-[#E5E8F2] pt-4">
                  <p className="text-[18px] font-medium text-[#7A849D]">Communication channels</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-[#596078]">
                    <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4 text-[#D94DCE]" />Calls</span>
                    <span className="inline-flex items-center gap-1"><Mic className="h-4 w-4 text-[#5B7FF0]" />Voice Notes</span>
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4 text-[#5B7FF0]" />Meetings</span>
                  </div>
                </div>

                <PricingPlanModal plan={plan} billingCycle={billingCycle} popular={plan.isMostPopular} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

export type CheckoutPlan = {
  _id: string;
  name: string;
  planType: string;
  tagline?: string;
  priceUsd?: number;
  annualPriceUsd?: number;
  billingCycles?: ("month" | "year")[];
  trialDays?: number;
  meetingHoursPerMonth?: number;
  aiActionsPerMonth?: number;
  crmContactsLimit?: number;
  callMinutesPerMonth?: number;
  usersIncluded?: number;
  aiAgentsIncluded?: number;
  features?: string[];
  isMostPopular?: boolean;
  isInquiryOnly: boolean;
};
export type CheckoutAddon = { _id: string; name: string; description?: string; isInquiryOnly: boolean; tiers: { label: string; priceUsd: number }[] };
export async function checkoutRequest<T>(path: string, options: { token?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/+$/, "");
  if (!base) throw new Error("Backend API URL is not configured.");
  const response = await fetch(`${base}/${path.replace(/^\/+/, "")}`, {
    method: options.body === undefined ? "GET" : "POST",
    headers: { ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body), signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000), cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true) throw new Error(Array.isArray(result?.message) ? result.message.join(". ") : result?.message || "Unable to load checkout. Please try again.");
  if (result.data == null) throw new Error("Invalid checkout response.");
  return result.data as T;
}
export function checkoutBody(planId: string, selected: string[], products: CheckoutAddon[], origin: string, billingCycle: "month" | "year" = "month") {
  const addons = Array.from(new Set(selected)).map(key => {
    const product = products.find(item => key.startsWith(`${item._id}:`));
    const tierIndex = Number(key.slice(key.lastIndexOf(":") + 1));
    if (!product || product.isInquiryOnly || !Number.isInteger(tierIndex) || tierIndex < 0 || !product.tiers[tierIndex]) throw new Error("A selected add-on is unavailable. Please review your selection.");
    return { addonProductId: product._id, tierIndex };
  });
  return { planId, ...(billingCycle === "year" ? { billingCycle } : {}), successUrl: new URL("/dashboard/billing?success=true", origin).href, cancelUrl: new URL("/dashboard/billing?canceled=true", origin).href, addons };
}
export async function startCheckout(planId: string, selected: string[], products: CheckoutAddon[], origin: string, token: string, billingCycle: "month" | "year" = "month") {
  if (!token) throw new Error("Please sign in before starting your trial.");
  const result = await checkoutRequest<{ checkoutUrl: string | null }>("/billing/checkout-session-with-addons", { token, body: checkoutBody(planId, selected, products, origin, billingCycle) });
  if (!result.checkoutUrl) throw new Error("The server did not return a checkout link.");
  const url = new URL(result.checkoutUrl);
  if (url.protocol !== "https:") throw new Error("Invalid checkout link.");
  return url.href;
}

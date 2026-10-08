"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { IntegrationCard } from "./IntegrationCard";
import { TwilioNumberModal } from "./TwilioNumberModal";
import {
  TwilioDetailsModal,
  type TwilioIntegrationDetails,
} from "./TwilioDetailsModal";

type OAuthConnectResponse = {
  success?: boolean;
  message?: string;
  url?: string;
  link?: string;
  redirectUrl?: string;
  authUrl?: string;
  data?: {
    authorizationUrl?: string;
    url?: string;
    link?: string;
    redirectUrl?: string;
    authUrl?: string;
  };
};

type IntegrationItem = TwilioIntegrationDetails & {
  provider: string;
  connected: boolean;
  status?: string;
};

type IntegrationsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    items?: IntegrationItem[];
  };
};

const providerByName: Record<string, string> = {
  Facebook: "FACEBOOK",
  Instagram: "INSTAGRAM",
  "Outlook Calendar": "OUTLOOK_CALENDAR",
  "Google Account": "GOOGLE_CALENDAR",
  Zoom: "ZOOM",
  Twilio: "TWILIO",
  Salesforce: "SALESFORCE",
  "HubSpot CRM": "HUBSPOT",
  "Custom CRM API": "CUSTOM_CRM_API",
};

const integrations = [
  [
    "Facebook",
    "Sync customer messages and schedule page posts",
    "/settings/integrations/facebook.svg",
    false,
  ],
  [
    "Instagram",
    "Manage direct messages and schedule media posts",
    "/settings/integrations/instagram.svg",
    false,
  ],
  [
    "Outlook Calendar",
    "Auto schedule meetings and check availability",
    "/settings/integrations/outlook.svg",
    false,
  ],
  [
    "Google Account",
    "Auto schedule meetings and check availability",
    "/settings/integrations/google-calendar.svg",
    false,
  ],
  [
    "Zoom",
    "Schedule and manage Zoom video meetings",
    "/settings/integrations/zoom.svg",
    false,
  ],
  [
    "Twilio",
    "Ingest voice calls, transcription, and client dialers",
    "/settings/integrations/twilio.svg",
    false,
  ],
  // [
  //   "Gmail",
  //   "Synchronize leads pipeline and client timeline",
  //   "/settings/integrations/gmail.svg",
  //   false,
  // ],
  [
    "Salesforce",
    "Migrate active enterprise contracts and deals",
    "/settings/integrations/salesforce-bg.png",
    false,
  ],
  [
    "HubSpot CRM",
    "Synchronize leads pipeline and client timeline",
    "/settings/integrations/hubspot.svg",
    false,
  ],
  [
    "Custom CRM API",
    "Synchronize leads pipeline and client timeline",
    "/settings/integrations/custom-crm.svg",
    false,
  ],
] as const;

export function IntegrationsPanel() {
  const { data: session } = useSession();
  const [isOutlookConnecting, setIsOutlookConnecting] = useState(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [isTwilioModalOpen, setIsTwilioModalOpen] = useState(false);
  const [isTwilioDetailsOpen, setIsTwilioDetailsOpen] = useState(false);
  const [twilioDetails, setTwilioDetails] =
    useState<TwilioIntegrationDetails | null>(null);
  const [connectingCrmProvider, setConnectingCrmProvider] = useState<
    "HUBSPOT" | "SALESFORCE" | null
  >(null);
  const [isCheckingIntegrations, setIsCheckingIntegrations] = useState(true);
  const [connectedProviders, setConnectedProviders] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const accessToken = session?.user.accessToken;

    if (!accessToken) {
      setIsCheckingIntegrations(false);
      return;
    }

    const controller = new AbortController();

    const getIntegrations = async () => {
      setIsCheckingIntegrations(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/integrations`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const result = (await response
          .json()
          .catch(() => ({}))) as IntegrationsResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load integrations.",
          );
        }

        const items = result.data?.items ?? [];
        const providers = Object.fromEntries(
          items.map(
            ({ provider, connected, status }) => [
              provider.trim().toUpperCase(),
              connected === true || status?.toUpperCase() === "CONNECTED",
            ],
          ),
        );
        setConnectedProviders(providers);
        setTwilioDetails(
          items.find(
            ({ provider }) => provider.trim().toUpperCase() === "TWILIO",
          ) ?? null,
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setConnectedProviders({});
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load integrations.",
        );
      } finally {
        if (!controller.signal.aborted) setIsCheckingIntegrations(false);
      }
    };

    void getIntegrations();

    return () => controller.abort();
  }, [session?.user.accessToken]);

  const connectOutlookCalendar = async () => {
    if (isOutlookConnecting) return;

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      toast.error("Your session is missing. Please sign in again.");
      return;
    }

    setIsOutlookConnecting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/calendar/outlook/oauth/connect`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as OAuthConnectResponse;
      const authorizationUrl = result.data?.authorizationUrl;

      if (!response.ok || !result.success || !authorizationUrl) {
        throw new Error(
          result.message || "Unable to connect Outlook Calendar.",
        );
      }

      window.location.assign(authorizationUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to connect Outlook Calendar.",
      );
      setIsOutlookConnecting(false);
    }
  };

  const connectGoogleCalendar = async () => {
    if (isGoogleConnecting) return;

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      toast.error("Your session is missing. Please sign in again.");
      return;
    }

    // Opening the tab before the request prevents browsers from blocking it.
    const oauthWindow = window.open("about:blank", "_blank");
    if (!oauthWindow) {
      toast.error("Please allow pop-ups to connect Google Calendar.");
      return;
    }

    oauthWindow.document.title = "Connecting Google Calendar...";
    setIsGoogleConnecting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/google-meetings/oauth/connect`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as OAuthConnectResponse;
      const redirectUrl =
        result.data?.authorizationUrl ??
        result.data?.url ??
        result.data?.link ??
        result.data?.redirectUrl ??
        result.data?.authUrl ??
        result.url ??
        result.link ??
        result.redirectUrl ??
        result.authUrl;

      if (!response.ok || !redirectUrl) {
        throw new Error(result.message || "Unable to connect Google Calendar.");
      }

      oauthWindow.location.href = redirectUrl;
    } catch (error) {
      oauthWindow.close();
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to connect Google Calendar.",
      );
    } finally {
      setIsGoogleConnecting(false);
    }
  };

  const connectCrm = async (provider: "HUBSPOT" | "SALESFORCE") => {
    if (connectingCrmProvider) return;

    const providerName = provider === "HUBSPOT" ? "HubSpot CRM" : "Salesforce";

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      toast.error("Your session is missing. Please sign in again.");
      return;
    }

    // Open synchronously so the browser does not block the OAuth tab after fetch.
    const oauthWindow = window.open("about:blank", "_blank");
    if (!oauthWindow) {
      toast.error(`Please allow pop-ups to connect ${providerName}.`);
      return;
    }

    oauthWindow.document.title = `Connecting ${providerName}...`;
    setConnectingCrmProvider(provider);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/connections/${provider}/connect`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as OAuthConnectResponse;
      const authorizationUrl = result.data?.authorizationUrl;

      if (!response.ok || !result.success || !authorizationUrl) {
        throw new Error(result.message || `Unable to connect ${providerName}.`);
      }

      oauthWindow.location.href = authorizationUrl;
    } catch (error) {
      oauthWindow.close();
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to connect ${providerName}.`,
      );
    } finally {
      setConnectingCrmProvider(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg bg-white">
      <header className="border-b border-[#E4EAF8] p-4">
        <h2 className="text-xl font-medium text-[#0E1224]">Integrations</h2>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {integrations.map(([name, description, icon, connected]) => {
          const isOutlookCalendar = name === "Outlook Calendar";
          const isGoogleCalendar = name === "Google Account";
          const isHubSpot = name === "HubSpot CRM";
          const isSalesforce = name === "Salesforce";
          const isTwilio = name === "Twilio";
          const isConnected =
            connectedProviders[providerByName[name]] ?? connected;

          return (
            <IntegrationCard
              key={name}
              name={name}
              description={description}
              icon={icon}
              initiallyConnected={connected}
              connected={isConnected}
              isLoading={
                (isOutlookCalendar && isOutlookConnecting) ||
                (isGoogleCalendar && isGoogleConnecting) ||
                (isHubSpot && connectingCrmProvider === "HUBSPOT") ||
                (isSalesforce && connectingCrmProvider === "SALESFORCE") ||
                isCheckingIntegrations
              }
              onConnect={
                isOutlookCalendar && !isConnected
                  ? () => void connectOutlookCalendar()
                  : isGoogleCalendar && !isConnected
                  ? () => void connectGoogleCalendar()
                  : isHubSpot && !isConnected
                  ? () => void connectCrm("HUBSPOT")
                  : isSalesforce && !isConnected
                  ? () => void connectCrm("SALESFORCE")
                  : isTwilio && !isConnected
                  ? () => setIsTwilioModalOpen(true)
                  : undefined
              }
              onView={
                isTwilio && isConnected
                  ? () => setIsTwilioDetailsOpen(true)
                  : undefined
              }
            />
          );
        })}
      </div>
      <TwilioNumberModal
        open={isTwilioModalOpen}
        onOpenChange={setIsTwilioModalOpen}
        onPurchase={(phoneNumber, purchasedCountry, forwardingNumber) => {
          setConnectedProviders((providers) => ({
            ...providers,
            TWILIO: true,
          }));
          setTwilioDetails({
            provider: "TWILIO",
            label: "Twilio",
            connected: true,
            status: "CONNECTED",
            configuration: {
              twilioNumber: phoneNumber,
              forwardingNumber,
              country: purchasedCountry,
              numberType: "LOCAL",
              enabledFeatures: {
                voice: true,
                sms: false,
                mms: false,
                callRecording: true,
              },
            },
          });
          toast.success(`${phoneNumber} purchased successfully.`);
        }}
      />
      <TwilioDetailsModal
        open={isTwilioDetailsOpen}
        onOpenChange={setIsTwilioDetailsOpen}
        details={twilioDetails}
      />
    </section>
  );
}

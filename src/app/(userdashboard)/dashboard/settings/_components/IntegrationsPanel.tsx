"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LoaderCircle, Unplug } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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

type DisconnectResponse = {
  success?: boolean;
  message?: string | string[];
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
  const [isOutlookDisconnectModalOpen, setIsOutlookDisconnectModalOpen] =
    useState(false);
  const [isOutlookDisconnecting, setIsOutlookDisconnecting] = useState(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [isGoogleDisconnectModalOpen, setIsGoogleDisconnectModalOpen] =
    useState(false);
  const [isGoogleDisconnecting, setIsGoogleDisconnecting] = useState(false);
  const [isTwilioModalOpen, setIsTwilioModalOpen] = useState(false);
  const [isTwilioDetailsOpen, setIsTwilioDetailsOpen] = useState(false);
  const [twilioDetails, setTwilioDetails] =
    useState<TwilioIntegrationDetails | null>(null);
  const [connectingCrmProvider, setConnectingCrmProvider] = useState<
    "HUBSPOT" | "SALESFORCE" | null
  >(null);
  const [crmProviderToDisconnect, setCrmProviderToDisconnect] = useState<
    "HUBSPOT" | "SALESFORCE" | null
  >(null);
  const [disconnectingCrmProvider, setDisconnectingCrmProvider] = useState<
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

  const disconnectOutlookCalendar = async () => {
    if (isOutlookDisconnecting) return;

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      toast.error("Your session is missing. Please sign in again.");
      return;
    }

    setIsOutlookDisconnecting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/calendar/outlook/oauth/connection`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as DisconnectResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || result.success === false) {
        throw new Error(message || "Unable to disconnect Outlook Calendar.");
      }

      setConnectedProviders((providers) => ({
        ...providers,
        OUTLOOK_CALENDAR: false,
      }));
      setIsOutlookDisconnectModalOpen(false);
      toast.success(message || "Outlook Calendar disconnected successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to disconnect Outlook Calendar.",
      );
    } finally {
      setIsOutlookDisconnecting(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (isGoogleDisconnecting) return;

    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      toast.error("Your session is missing. Please sign in again.");
      return;
    }

    setIsGoogleDisconnecting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/google-meetings/oauth/connection`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as DisconnectResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || result.success === false) {
        throw new Error(message || "Unable to disconnect Google Account.");
      }

      setConnectedProviders((providers) => ({
        ...providers,
        GOOGLE_CALENDAR: false,
      }));
      setIsGoogleDisconnectModalOpen(false);
      toast.success(message || "Google Account disconnected successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to disconnect Google Account.",
      );
    } finally {
      setIsGoogleDisconnecting(false);
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

  const disconnectCrm = async (provider: "HUBSPOT" | "SALESFORCE") => {
    if (disconnectingCrmProvider) return;

    const providerName = provider === "HUBSPOT" ? "HubSpot CRM" : "Salesforce";
    const accessToken = session?.user.accessToken;
    if (!accessToken) {
      toast.error("Your session is missing. Please sign in again.");
      return;
    }

    setDisconnectingCrmProvider(provider);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crm/connections/${encodeURIComponent(provider)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as DisconnectResponse;
      const message = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message;

      if (!response.ok || result.success === false) {
        throw new Error(message || `Unable to disconnect ${providerName}.`);
      }

      setConnectedProviders((providers) => ({
        ...providers,
        [provider]: false,
      }));
      setCrmProviderToDisconnect(null);
      toast.success(message || `${providerName} disconnected successfully.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to disconnect ${providerName}.`,
      );
    } finally {
      setDisconnectingCrmProvider(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-[10px] bg-white">
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
                (isOutlookCalendar && isOutlookDisconnecting) ||
                (isGoogleCalendar && isGoogleConnecting) ||
                (isGoogleCalendar && isGoogleDisconnecting) ||
                (isHubSpot && connectingCrmProvider === "HUBSPOT") ||
                (isSalesforce && connectingCrmProvider === "SALESFORCE") ||
                (isHubSpot && disconnectingCrmProvider === "HUBSPOT") ||
                (isSalesforce &&
                  disconnectingCrmProvider === "SALESFORCE") ||
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
              onDisconnect={
                isOutlookCalendar && isConnected
                  ? () => setIsOutlookDisconnectModalOpen(true)
                  : isGoogleCalendar && isConnected
                  ? () => setIsGoogleDisconnectModalOpen(true)
                  : isHubSpot && isConnected
                  ? () => setCrmProviderToDisconnect("HUBSPOT")
                  : isSalesforce && isConnected
                  ? () => setCrmProviderToDisconnect("SALESFORCE")
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
      <Dialog
        open={isOutlookDisconnectModalOpen}
        onOpenChange={(open) => {
          if (!isOutlookDisconnecting) setIsOutlookDisconnectModalOpen(open);
        }}
      >
        <DialogContent
          overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]"
          className="w-[calc(100%-24px)] max-w-[420px] gap-0 !rounded-[16px] border-0 bg-white p-6 text-center shadow-[0_24px_80px_rgba(14,18,36,0.24)]"
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]">
            <Unplug className="size-5" />
          </span>
          <DialogTitle className="mt-4 text-xl font-semibold text-[#0E1224]">
            Disconnect Outlook Calendar?
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-[#73809B]">
            Outlook Calendar meetings will no longer sync with your account.
            Are you sure you want to disconnect it?
          </DialogDescription>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsOutlookDisconnectModalOpen(false)}
              disabled={isOutlookDisconnecting}
              className="h-11 rounded-[10px] border border-[#DCE1EA] text-sm font-medium text-[#596079] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void disconnectOutlookCalendar()}
              disabled={isOutlookDisconnecting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#EF4444] text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-60"
            >
              {isOutlookDisconnecting && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {isOutlookDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isGoogleDisconnectModalOpen}
        onOpenChange={(open) => {
          if (!isGoogleDisconnecting) setIsGoogleDisconnectModalOpen(open);
        }}
      >
        <DialogContent
          overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]"
          className="w-[calc(100%-24px)] max-w-[420px] gap-0 !rounded-[16px] border-0 bg-white p-6 text-center shadow-[0_24px_80px_rgba(14,18,36,0.24)]"
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]">
            <Unplug className="size-5" />
          </span>
          <DialogTitle className="mt-4 text-xl font-semibold text-[#0E1224]">
            Disconnect Google Account?
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-[#73809B]">
            Google Calendar meetings will no longer sync with your account. Are
            you sure you want to disconnect it?
          </DialogDescription>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsGoogleDisconnectModalOpen(false)}
              disabled={isGoogleDisconnecting}
              className="h-11 rounded-[10px] border border-[#DCE1EA] text-sm font-medium text-[#596079] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void disconnectGoogleCalendar()}
              disabled={isGoogleDisconnecting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#EF4444] text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-60"
            >
              {isGoogleDisconnecting && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {isGoogleDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(crmProviderToDisconnect)}
        onOpenChange={(open) => {
          if (!open && !disconnectingCrmProvider) {
            setCrmProviderToDisconnect(null);
          }
        }}
      >
        <DialogContent
          overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]"
          className="w-[calc(100%-24px)] max-w-[420px] gap-0 !rounded-[16px] border-0 bg-white p-6 text-center shadow-[0_24px_80px_rgba(14,18,36,0.24)]"
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]">
            <Unplug className="size-5" />
          </span>
          <DialogTitle className="mt-4 text-xl font-semibold text-[#0E1224]">
            Disconnect {crmProviderToDisconnect === "HUBSPOT"
              ? "HubSpot CRM"
              : "Salesforce"}
            ?
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-[#73809B]">
            This integration will stop syncing with your account. Are you sure
            you want to disconnect it?
          </DialogDescription>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCrmProviderToDisconnect(null)}
              disabled={Boolean(disconnectingCrmProvider)}
              className="h-11 rounded-[10px] border border-[#DCE1EA] text-sm font-medium text-[#596079] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (crmProviderToDisconnect) {
                  void disconnectCrm(crmProviderToDisconnect);
                }
              }}
              disabled={Boolean(disconnectingCrmProvider)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#EF4444] text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-60"
            >
              {disconnectingCrmProvider && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {disconnectingCrmProvider ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

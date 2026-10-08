"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type SupportAttachment =
  | string
  | {
      id?: string;
      name?: string;
      fileName?: string;
      originalName?: string;
      url?: string;
      fileUrl?: string;
      downloadUrl?: string;
      secureUrl?: string;
      mimeType?: string;
      contentType?: string;
      fileType?: string;
      type?: string;
    };

type SupportRequestDetails = {
  id?: string;
  ticketId?: string;
  category?: string;
  subject?: string;
  description?: string;
  attachments?: SupportAttachment[];
  attachmentUrls?: string[];
  attachmentCount?: number;
  request?: SupportRequestDetails;
};

type SupportRequestDetailsResponse = {
  success?: boolean;
  message?: string | string[];
  data?: SupportRequestDetails;
};

type ReportDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string | null;
};

function getMessage(result: SupportRequestDetailsResponse, fallback: string) {
  if (Array.isArray(result.message)) return result.message.join(", ");
  return result.message || fallback;
}

function formatCategory(value?: string) {
  if (!value) return "-";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function descriptionToText(value?: string) {
  if (!value) return "No description provided.";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function getAttachmentUrl(attachment: SupportAttachment) {
  if (typeof attachment === "string") return attachment;
  return (
    attachment.url ??
    attachment.fileUrl ??
    attachment.downloadUrl ??
    attachment.secureUrl ??
    ""
  );
}

function resolveAttachmentUrl(url: string) {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url;

  try {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!apiBase) return url;
    return new URL(url, new URL(apiBase).origin).toString();
  } catch {
    return url;
  }
}

function getAttachmentMimeType(attachment: SupportAttachment) {
  if (typeof attachment === "string") return "";
  return (
    attachment.mimeType ??
    attachment.contentType ??
    attachment.fileType ??
    attachment.type ??
    ""
  ).toLowerCase();
}

function getMediaKind(attachment: SupportAttachment, name: string) {
  const mimeType = getAttachmentMimeType(attachment);
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";

  const url = getAttachmentUrl(attachment);
  const fileName = `${name} ${url}`.split(/[?#]/)[0].toLowerCase();
  if (/\.(avif|gif|jpe?g|png|svg|webp)$/.test(fileName)) return "image";
  if (/\.(m4v|mov|mp4|ogv|webm)$/.test(fileName)) return "video";
  return "file";
}

function getAttachmentName(attachment: SupportAttachment, index: number) {
  if (typeof attachment !== "string") {
    return (
      attachment.originalName ??
      attachment.fileName ??
      attachment.name ??
      `Attachment ${index + 1}`
    );
  }

  try {
    const pathname = new URL(attachment, "http://local").pathname;
    return decodeURIComponent(pathname.split("/").pop() || `Attachment ${index + 1}`);
  } catch {
    return `Attachment ${index + 1}`;
  }
}

function DetailsLoading() {
  return (
    <div className="space-y-4 p-4 sm:p-10">
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
        <div className="h-[74px] animate-pulse rounded-xl bg-[#F5F7FF]" />
        <div className="h-[74px] animate-pulse rounded-xl bg-[#F5F7FF]" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-[#F5F7FF]" />
      <div className="h-28 animate-pulse rounded-xl bg-[#F5F7FF]" />
    </div>
  );
}

function AttachmentPreview({
  attachment,
  index,
}: {
  attachment: SupportAttachment;
  index: number;
}) {
  const name = getAttachmentName(attachment, index);
  const url = resolveAttachmentUrl(getAttachmentUrl(attachment));
  const mediaKind = getMediaKind(attachment, name);
  const mimeType = getAttachmentMimeType(attachment);

  return (
    <article className="min-w-0 overflow-hidden rounded-xl bg-[#F5F7FF]">
      {url && mediaKind === "image" && (
        <div className="flex min-h-40 items-center justify-center bg-[#EEF2FF] p-2 sm:min-h-52">
          {/* User-uploaded files can come from backend hosts not known at build time. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={name}
            loading="lazy"
            className="max-h-[360px] w-full rounded-lg object-contain"
          />
        </div>
      )}

      {url && mediaKind === "video" && (
        <div className="bg-black">
          <video
            controls
            playsInline
            preload="metadata"
            className="max-h-[360px] w-full"
          >
            <source src={url} type={mimeType || undefined} />
            Your browser does not support video playback.
          </video>
        </div>
      )}

      <div className="flex min-h-14 items-center gap-3 px-4 py-2 text-sm">
        <Image
          src="/support-view-file.svg"
          alt=""
          width={32}
          height={32}
          unoptimized
          className="size-8 shrink-0"
        />
        <span className="min-w-0 flex-1 truncate text-[#0E1224]">{name}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md px-2 py-1 text-[#264AFF] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FF0]"
          >
            Open
          </a>
        )}
      </div>
    </article>
  );
}

export function ReportDetailsModal({
  open,
  onOpenChange,
  requestId,
}: ReportDetailsModalProps) {
  const { data: session } = useSession();
  const accessToken = session?.user.accessToken;

  const detailsQuery = useQuery({
    queryKey: ["support-request-details", requestId],
    enabled: open && Boolean(requestId) && Boolean(accessToken),
    queryFn: async () => {
      if (!requestId || !accessToken) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/support/requests/${encodeURIComponent(requestId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as SupportRequestDetailsResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(getMessage(result, "Unable to load request details."));
      }

      return result.data.request ?? result.data;
    },
  });

  useEffect(() => {
    if (detailsQuery.error) {
      toast.error(
        detailsQuery.error instanceof Error
          ? detailsQuery.error.message
          : "Unable to load request details.",
      );
    }
  }, [detailsQuery.error]);

  const details = detailsQuery.data;
  const attachments = details?.attachments ?? details?.attachmentUrls ?? [];

  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        nonModalOverlay
        overlayClassName="bg-black/10 backdrop-blur-[5px]"
        className="max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[511px] gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-[0_1px_4px_rgba(107,107,107,0.7)] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between rounded-t-2xl bg-white p-4 shadow-[0_1px_4px_rgba(107,107,107,0.7)] sm:p-6">
          <div className="min-w-0">
            <DialogTitle className="text-xl font-medium leading-normal text-[#0E1224]">
              Request Details
            </DialogTitle>
            {details?.ticketId && (
              <p className="mt-1 truncate text-sm text-[#8B93B8]">
                {details.ticketId}
              </p>
            )}
          </div>
          <DialogDescription className="sr-only">
            Details for the selected support request
          </DialogDescription>
          <DialogClose className="flex size-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FF0] focus-visible:ring-offset-2">
            <Image
              src="/support-close-circle.svg"
              alt=""
              width={24}
              height={24}
              unoptimized
              className="size-6"
            />
            <span className="sr-only">Close request details</span>
          </DialogClose>
        </div>

        {detailsQuery.isLoading ? (
          <DetailsLoading />
        ) : detailsQuery.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-[#8B93B8]">
              Unable to load request details.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => detailsQuery.refetch()}
              className="mt-4 h-10 border-[#5B7FF0] text-[#5B7FF0]"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:p-4">
              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                <DetailField
                  label="Category"
                  value={formatCategory(details?.category)}
                />
                <DetailField label="Subject" value={details?.subject ?? "-"} />
              </div>

              <div>
                <p className="mb-2 text-base font-medium leading-none text-[#0E1224]">
                  Description
                </p>
                <div className="min-h-[140px] whitespace-pre-wrap break-words rounded-2xl border border-[#F5F7FF] bg-[#F5F7FF] p-4 text-base leading-normal text-[#0E1224] sm:min-h-[160px]">
                  {descriptionToText(details?.description)}
                </div>
              </div>

              <div>
                <p className="mb-4 text-xl font-medium leading-none text-[#0E1224]">
                  Attachments &amp; Links
                </p>
                {attachments.length > 0 ? (
                  <div className="grid gap-2">
                    {attachments.map((attachment, index) => (
                      <AttachmentPreview
                        key={`${getAttachmentName(attachment, index)}-${index}`}
                        attachment={attachment}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[88px] items-center justify-center rounded-xl bg-[#F5F7FF] p-4 text-sm text-[#8B93B8] sm:min-h-[120px]">
                    No attachments added.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-base leading-[1.2] text-[#8B93B8]">{label}</p>
      <div className="truncate rounded-xl bg-[#F5F7FF] p-4 text-base leading-[1.2] text-[#0E1224]">
        {value}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { AlertCircle, CalendarDays, CheckSquare, FileText, Loader2, Mic, Paperclip, Pencil, RefreshCw, Send, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState, type WheelEvent } from "react";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string | string[] };
type MessageAttachment = { id: string; originalName: string; mimeType?: string; sizeBytes?: number };
type AttachmentDownload = { downloadUrl: string };
type ChatMessage = { id: string; conversationId: string; content?: string | null; senderType: string; agentName?: string | null; sourceMessageId?: string | null; attachments?: MessageAttachment[]; createdAt: string };
type MessagesPayload = { items: ChatMessage[]; pagination?: { page: number; pages: number } };
type ClarificationQuestion = { id?: string; question: string; inputType?: string; required?: boolean };
type Proposal = {
  id: string;
  actionType?: string;
  status?: string;
  revision?: number;
  title?: string;
  description?: string;
  priority?: string;
  department?: string;
  tags?: string[];
  startsAt?: string;
  durationMinutes?: number;
  payload?: { title?: string; startsAt?: string; durationMinutes?: number; timezone?: string; platform?: string; agenda?: string; invitees?: string[] };
  clarificationQuestions?: ClarificationQuestion[];
  clarificationAnswers?: Record<string, string>;
};
type IntelligenceDetails = { analysis?: { summary?: string | null } | null; actions?: { priorityTasks?: Proposal[]; meetingSchedules?: Proposal[] } };
type ClarificationHistoryItem = { messageId: string; proposalId: string; questionId: string; question: string; answer: string };
type MeetingEditDraft = { title: string; startsAt: string; durationMinutes: string; timezone: string; invitees: string; platform: string };

const INTELLIGENCE_POLL_INTERVAL_MS = 2_000;
const INTELLIGENCE_POLL_MAX_ATTEMPTS = 150;
const PREVIEW_DELAYED_ERROR = "meeting-preview-delayed";
const MAX_ATTACHMENTS = 10;
const ATTACHMENT_ACCEPT = "image/*,audio/*,video/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf";

type LauraConversationProps = {
  conversationId: string | null;
  accessToken?: string;
  sessionStatus: "authenticated" | "loading" | "unauthenticated";
  onConversationUpdated: (conversationId: string, preview: string, moveToTop?: boolean) => void;
  onStartConversation: () => Promise<string | null>;
};

function apiError(result: ApiEnvelope<unknown>, fallback: string) {
  const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
  return message || fallback;
}

async function fetchMessageIntelligence(accessToken: string, messageId: string, status?: "NEEDS_CLARIFICATION") {
  const query = new URLSearchParams({ sourceType: "USER_MESSAGE", taskLimit: "4", meetingLimit: "4", includeTranscript: "false" });
  if (status) query.set("status", status);
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/${encodeURIComponent(messageId)}/details?${query}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const result = (await response.json().catch(() => ({}))) as ApiEnvelope<IntelligenceDetails>;
  if (!response.ok || !result.success || !result.data) throw new Error(apiError(result, "Unable to get the AI response."));
  return result.data;
}

function UserAvatar() {
  return <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xl font-medium text-[#5B7FF0] shadow-[0_0_4px_rgba(0,0,0,.25)]">RH</span>;
}

function LauraAvatar() {
  return <Image src="/laura.png" alt="Laura" width={36} height={36} className="size-9 shrink-0 rounded-full border border-[#8B93B8] object-cover" />;
}

function LauraMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full max-w-[520px] items-start gap-3 self-start"><LauraAvatar /><div className="min-w-0 flex-1 rounded-bl-2xl rounded-br-2xl rounded-tr-2xl border border-[#F5F7FF] bg-[#F5F7FF] p-3 text-sm leading-normal">{children}</div></div>;
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex max-w-[520px] items-end gap-3 self-end"><div className="rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl bg-[#5B7FF0] p-3 text-sm text-white">{children}</div><UserAvatar /></div>;
}

function LauraThinking({ label }: { label: string }) {
  return <div className="flex w-full max-w-[520px] items-start gap-3 self-start" aria-live="polite"><LauraAvatar /><div className="rounded-bl-2xl rounded-br-2xl rounded-tr-2xl border border-[#F5F7FF] bg-[#F5F7FF] px-4 py-3"><div className="flex items-center gap-2 text-sm text-[#667085]"><span>{label}</span><span className="flex items-center gap-1" aria-label="Loading"><i className="size-1.5 animate-bounce rounded-full bg-[#5B7FF0] [animation-delay:-0.3s]" /><i className="size-1.5 animate-bounce rounded-full bg-[#5B7FF0] [animation-delay:-0.15s]" /><i className="size-1.5 animate-bounce rounded-full bg-[#5B7FF0]" /></span></div></div></div>;
}

function isMessageImage(attachment: MessageAttachment) {
  return attachment.mimeType?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(attachment.originalName.split(".").pop()?.toLowerCase() || "");
}

function MessageAttachmentCard({ messageId, attachment, accessToken }: { messageId: string; attachment: MessageAttachment; accessToken?: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(isMessageImage(attachment));
  const image = isMessageImage(attachment);

  useEffect(() => {
    if (!image || !accessToken) return;
    const controller = new AbortController();
    void fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachment.id)}/download?disposition=inline`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    }).then(async (response) => {
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<AttachmentDownload>;
      if (response.ok && result.success && result.data?.downloadUrl) setPreviewUrl(result.data.downloadUrl);
    }).catch(() => undefined).finally(() => setIsLoadingPreview(false));
    return () => controller.abort();
  }, [accessToken, attachment.id, image, messageId]);

  if (image) return <div className="overflow-hidden rounded-lg border border-white/25 bg-white/10">
    {previewUrl ? <a href={previewUrl} target="_blank" rel="noreferrer" title={`Open ${attachment.originalName}`}><Image src={previewUrl} alt={attachment.originalName} width={240} height={160} unoptimized className="max-h-48 w-auto max-w-full object-cover" /></a> : <div className="flex h-28 w-44 items-center justify-center bg-white/10 text-xs text-white/80">{isLoadingPreview ? <Loader2 className="size-5 animate-spin" /> : "Image preview unavailable"}</div>}
    <div className="flex max-w-full items-center gap-1.5 px-2 py-1.5 text-xs"><Paperclip className="size-3 shrink-0" /><span className="truncate">{attachment.originalName}</span>{attachment.sizeBytes ? <span className="shrink-0 text-white/70">({fileSizeLabel(attachment.sizeBytes)})</span> : null}</div>
  </div>;

  return <div className="flex max-w-full items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-xs"><Paperclip className="size-3 shrink-0" /><span className="truncate">{attachment.originalName}</span>{attachment.sizeBytes ? <span className="shrink-0 text-white/70">({fileSizeLabel(attachment.sizeBytes)})</span> : null}</div>;
}

function allProposals(details: IntelligenceDetails | null) {
  return [...(details?.actions?.meetingSchedules || []), ...(details?.actions?.priorityTasks || [])];
}

function clarificationQuestionLabel(questionId: string) {
  if (questionId === "meeting-platform") return "Which meeting platform would you prefer?";
  if (questionId === "meeting-start-time") return "What date and time should the meeting start?";
  if (questionId === "meeting-duration") return "How long should the meeting be?";
  const inviteeMatch = questionId.match(/^invitee-email-(.+)$/);
  if (inviteeMatch) return `What email address should be used to invite ${inviteeMatch[1].replace(/-/g, " ")}?`;
  return `Please provide ${questionId.replace(/-/g, " ")}.`;
}

function answeredClarifications(messageId: string, details: IntelligenceDetails | null): ClarificationHistoryItem[] {
  return allProposals(details).flatMap((proposal) => {
    const questions = new Map((proposal.clarificationQuestions || [])
      .filter((question): question is ClarificationQuestion & { id: string } => Boolean(question.id))
      .map((question) => [question.id, question.question]));
    return Object.entries(proposal.clarificationAnswers || {}).flatMap(([questionId, answer]) => {
      if (!answer?.trim()) return [];
      return [{
        messageId,
        proposalId: proposal.id,
        questionId,
        question: questions.get(questionId) || clarificationQuestionLabel(questionId),
        answer,
      }];
    });
  });
}

function mergeClarificationHistory(current: ClarificationHistoryItem[], additions: ClarificationHistoryItem[]) {
  const byId = new Map(current.map((item) => [`${item.messageId}:${item.proposalId}:${item.questionId}`, item]));
  additions.forEach((item) => byId.set(`${item.messageId}:${item.proposalId}:${item.questionId}`, item));
  return Array.from(byId.values());
}

function formatMeetingDateTime(startsAt?: string) {
  if (!startsAt) return { date: "Not specified", time: "Not specified" };
  const value = new Date(startsAt);
  if (Number.isNaN(value.getTime())) return { date: startsAt, time: "Not specified" };
  return {
    date: value.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
    time: value.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  };
}

function formatMeetingPlatform(platform?: string) {
  if (!platform) return "Meeting link will be shared";
  return platform.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function meetingPlatformFromProposal(proposal: Proposal) {
  return proposal.payload?.platform || proposal.clarificationAnswers?.["meeting-platform"] || "";
}

function meetingPlatformForPayload(platform?: string) {
  const normalized = platform?.trim().toUpperCase().replace(/[\s-]+/g, "_") || "";
  if (normalized === "GOOGLE_MEET" || normalized === "GOOGLEMEET") return "GOOGLE_MEET";
  if (normalized === "ZOOM" || normalized === "ZOOM_MEET") return "ZOOM";
  return normalized;
}

function meetingInviteesFromProposal(proposal: Proposal) {
  if (proposal.payload?.invitees?.length) return proposal.payload.invitees;
  return Object.entries(proposal.clarificationAnswers || {})
    .filter(([questionId]) => /(?:invitee|attendee).*email|email.*(?:invitee|attendee)/i.test(questionId))
    .flatMap(([, answer]) => inviteesFromText(answer));
}

function toDateTimeLocalValue(startsAt?: string, timezone?: string) {
  if (!startsAt) return "";
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone || undefined, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
    return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
  } catch {
    const pad = (number: number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}

function createMeetingEditDraft(proposal: Proposal): MeetingEditDraft {
  const payload = proposal.payload || {};
  return {
    title: payload.title || proposal.title || "",
    startsAt: toDateTimeLocalValue(payload.startsAt || proposal.startsAt, payload.timezone),
    durationMinutes: String(payload.durationMinutes || proposal.durationMinutes || 30),
    timezone: payload.timezone || "Asia/Dhaka",
    invitees: meetingInviteesFromProposal(proposal).join(", "),
    platform: meetingPlatformForPayload(meetingPlatformFromProposal(proposal)),
  };
}

function dateTimeInTimeZoneToIso(value: string, timezone: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Choose a valid meeting date and time.");
  const [, year, month, day, hour, minute] = match;
  const utcGuess = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  const offsetAt = (timestamp: number) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(timestamp));
    const valueFor = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value || 0);
    return Date.UTC(valueFor("year"), valueFor("month") - 1, valueFor("day"), valueFor("hour"), valueFor("minute"), valueFor("second")) - timestamp;
  };
  let timestamp = utcGuess - offsetAt(utcGuess);
  timestamp = utcGuess - offsetAt(timestamp);
  return new Date(timestamp).toISOString();
}

function inviteesFromText(value: string) {
  return Array.from(new Set(value.split(/[\n,;]/).map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

function fileSizeLabel(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentValidationMessage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(extension);
  const isAudio = file.type.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "aac", "flac", "webm"].includes(extension);
  const isVideo = file.type.startsWith("video/") || ["mp4", "mov", "webm", "mpeg", "mpg", "avi"].includes(extension);
  const isDocument = ["pdf", "txt", "csv", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "rtf"].includes(extension);
  if (!isImage && !isAudio && !isVideo && !isDocument) return `“${file.name}” is not a supported attachment.`;
  const maxBytes = isVideo ? 200 * 1024 * 1024 : isAudio ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > maxBytes) return `“${file.name}” is too large. The limit is ${maxBytes / (1024 * 1024)} MB.`;
  return null;
}

function attachmentKey(file: File, index: number) {
  return `${file.name}-${file.lastModified}-${index}`;
}

function isImageAttachment(file: File) {
  return file.type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(file.name.split(".").pop()?.toLowerCase() || "");
}

export function LauraConversation({ conversationId, accessToken, sessionStatus, onConversationUpdated, onStartConversation }: LauraConversationProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [clarificationHistory, setClarificationHistory] = useState<ClarificationHistoryItem[]>([]);
  const [details, setDetails] = useState<IntelligenceDetails | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isWaitingForAi, setIsWaitingForAi] = useState(false);
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [meetingEditDraft, setMeetingEditDraft] = useState<MeetingEditDraft | null>(null);
  const [isSavingMeetingEdit, setIsSavingMeetingEdit] = useState(false);
  const [meetingEditError, setMeetingEditError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setSuccessMessage] = useState<string | null>(null);
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPreview = useRef("");
  const requestedSummaryIds = useRef(new Set<string>());
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const clearPolling = useCallback(() => {
    if (pollTimeout.current) {
      clearTimeout(pollTimeout.current);
      pollTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    const previews = attachments.flatMap((file, index) => isImageAttachment(file)
      ? [{ key: attachmentKey(file, index), url: URL.createObjectURL(file) }]
      : []);
    setAttachmentPreviewUrls(Object.fromEntries(previews.map(({ key, url }) => [key, url])));
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [attachments]);

  const loadMessages = useCallback(async () => {
    if (!conversationId || !accessToken) return [];
    const messagePages: ChatMessage[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const query = new URLSearchParams({ conversationId, page: String(page), limit: "100" });
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages?${query}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<MessagesPayload>;
      if (!response.ok || !result.success || !result.data) throw new Error(apiError(result, "Unable to load messages."));
      messagePages.push(...result.data.items);
      totalPages = Math.max(1, result.data.pagination?.pages || 1);
      page += 1;
    } while (page <= totalPages);

    // The API returns each page newest-first. Reversing the complete result keeps
    // the whole conversation in natural, oldest-to-newest chat order.
    const chronologicalMessages = messagePages.reverse();
    setMessages(chronologicalMessages);
    const latestMessage = chronologicalMessages.at(-1);
    const preview = latestMessage?.content?.replace(/\s+/g, " ").trim();
    if (preview && preview !== lastPreview.current) {
      lastPreview.current = preview;
      onConversationUpdated(conversationId, preview);
    }
    return chronologicalMessages;
  }, [accessToken, conversationId, onConversationUpdated]);

  const loadIntelligence = useCallback(async (messageId: string, status?: "NEEDS_CLARIFICATION") => {
    if (!accessToken) return null;
    const result = await fetchMessageIntelligence(accessToken, messageId, status);
    setDetails(result);
    if (result.analysis?.summary) setAiSummaries((current) => ({ ...current, [messageId]: result.analysis!.summary! }));
    const answered = answeredClarifications(messageId, result);
    if (answered.length) setClarificationHistory((current) => mergeClarificationHistory(current, answered));
    return result;
  }, [accessToken]);

  const loadHistoricalSummaries = useCallback(async (chatMessages: ChatMessage[]) => {
    if (!accessToken) return;
    const ids = chatMessages.filter((item) => item.senderType.toUpperCase() === "USER" && !requestedSummaryIds.current.has(item.id)).map((item) => item.id);
    ids.forEach((id) => requestedSummaryIds.current.add(id));
    const summaries = await Promise.all(ids.map(async (id) => {
      try {
        const result = await fetchMessageIntelligence(accessToken, id);
        return { id, summary: result.analysis?.summary, answered: answeredClarifications(id, result) };
      } catch {
        requestedSummaryIds.current.delete(id);
        return null;
      }
    }));
    const availableSummaries = summaries.filter((result): result is { id: string; summary: string; answered: ClarificationHistoryItem[] } => Boolean(result?.summary));
    if (availableSummaries.length) setAiSummaries((current) => ({ ...current, ...Object.fromEntries(availableSummaries.map((result) => [result.id, result.summary])) }));
    const answered = summaries.flatMap((result) => result?.answered || []);
    if (answered.length) setClarificationHistory((current) => mergeClarificationHistory(current, answered));
  }, [accessToken]);

  const pollForIntelligence = useCallback(async (messageId: string, attempts = 0, needsClarificationFirst = false) => {
    if (attempts >= INTELLIGENCE_POLL_MAX_ATTEMPTS) {
      setIsWaitingForAi(false);
      setSuccessMessage(null);
      setError(PREVIEW_DELAYED_ERROR);
      return;
    }
    try {
      const nextDetails = await loadIntelligence(messageId, needsClarificationFirst ? "NEEDS_CLARIFICATION" : undefined);
      const proposals = allProposals(nextDetails);
      // clarificationQuestions is the backend's source of truth. Keep asking until
      // it is empty, even when it includes an answer from an earlier revision.
      const hasQuestion = proposals.some((proposal) => proposal.status?.toUpperCase() === "NEEDS_CLARIFICATION" && (proposal.clarificationQuestions || []).some((question) => question.id));
      const hasActionableProposal = proposals.some((proposal) => ["PENDING", "EXECUTED"].includes(proposal.status?.toUpperCase() || "") && (proposal.clarificationQuestions || []).length === 0);
      const hasRefinementInProgress = proposals.some((proposal) => {
        const status = proposal.status?.toUpperCase();
        return status === "ANALYZING";
      });
      const loadedMessages = await loadMessages();
      const hasAssistantReply = loadedMessages.some((item) => item.senderType.toUpperCase() === "AI" && item.sourceMessageId === messageId);
      const hasCompletedAnalysis = Boolean(nextDetails?.analysis);
      const isResolved = hasQuestion || hasActionableProposal || (!hasRefinementInProgress && (hasAssistantReply || hasCompletedAnalysis));
      if (proposals.some((proposal) => proposal.status?.toUpperCase() === "PENDING")) {
        setSuccessMessage(null);
      }
      setIsWaitingForAi(!isResolved);
      if (!isResolved) {
        pollTimeout.current = setTimeout(() => void pollForIntelligence(messageId, attempts + 1, false), INTELLIGENCE_POLL_INTERVAL_MS);
      }
    } catch (pollError) {
      if (attempts < INTELLIGENCE_POLL_MAX_ATTEMPTS - 1) {
        pollTimeout.current = setTimeout(() => void pollForIntelligence(messageId, attempts + 1, false), INTELLIGENCE_POLL_INTERVAL_MS);
      } else {
        setIsWaitingForAi(false);
        setSuccessMessage(null);
        setError(pollError instanceof Error ? pollError.message : "The AI response could not be loaded.");
      }
    }
  }, [loadIntelligence, loadMessages]);

  useEffect(() => {
    clearPolling();
    setMessages([]);
    setAttachments([]);
    setAiSummaries({});
    setClarificationHistory([]);
    setDetails(null);
    setActiveMessageId(null);
    setClarificationAnswer("");
    setIsEditingMeeting(false);
    setMeetingEditDraft(null);
    setMeetingEditError(null);
    setIsWaitingForAi(false);
    lastPreview.current = "";
    requestedSummaryIds.current.clear();
    setError(null);
    setSuccessMessage(null);
    if (!conversationId || !accessToken) return;

    setIsLoadingMessages(true);
    void loadMessages().then((loadedMessages) => {
      void loadHistoricalSummaries(loadedMessages);
      const latestUserMessage = [...loadedMessages].reverse().find((item) => item.senderType.toUpperCase() === "USER");
      if (latestUserMessage) {
        setActiveMessageId(latestUserMessage.id);
        setIsWaitingForAi(true);
        // On reload, request every proposal status. A NEEDS_CLARIFICATION-only
        // response cannot contain the already-prepared PENDING meeting preview.
        void pollForIntelligence(latestUserMessage.id);
      }
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load messages.")).finally(() => setIsLoadingMessages(false));
    return clearPolling;
  }, [accessToken, clearPolling, conversationId, loadHistoricalSummaries, loadMessages, pollForIntelligence]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if ((!content && attachments.length === 0) || !accessToken || isSending) return;
    clearPolling();
    setIsSending(true);
    setError(null);
    setSuccessMessage(null);
    setDetails(null);
    setIsWaitingForAi(true);
    try {
      const targetConversationId = conversationId || await onStartConversation();
      if (!targetConversationId) throw new Error("Unable to start a new chat. Please try again.");
      const body = new FormData();
      body.append("clientMessageId", crypto.randomUUID());
      body.append("conversationId", targetConversationId);
      if (content) body.append("content", content);
      attachments.forEach((file) => body.append("files", file));
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<ChatMessage>;
      if (!response.ok || !result.success || !result.data?.id) throw new Error(apiError(result, "Unable to send your message."));
      setMessage("");
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveMessageId(result.data.id);
      setMessages((current) => [...current, result.data!]);
      onConversationUpdated(targetConversationId, content || attachments[0]?.name || "Attachment", true);
      await loadMessages();
      void pollForIntelligence(result.data.id, 0, true);
    } catch (sendError) {
      setIsWaitingForAi(false);
      setError(sendError instanceof Error ? sendError.message : "Unable to send your message.");
    } finally {
      setIsSending(false);
    }
  }

  function selectAttachments(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    const invalidFile = selected.map(attachmentValidationMessage).find(Boolean);
    if (invalidFile) {
      setError(invalidFile);
      return;
    }
    if (attachments.length + selected.length > MAX_ATTACHMENTS) {
      setError(`You can attach up to ${MAX_ATTACHMENTS} files in one message.`);
      return;
    }
    setError(null);
    setAttachments((current) => [...current, ...selected]);
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, attachmentIndex) => attachmentIndex !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const activeClarification = isWaitingForAi ? undefined : allProposals(details)
    .filter((proposal) => proposal.status?.toUpperCase() === "NEEDS_CLARIFICATION")
    .flatMap((proposal) => (proposal.clarificationQuestions || []).map((question) => ({ proposal, question })))
    .find(({ question }) => question.id);
  const readyMeeting = allProposals(details).find((proposal) => proposal.actionType === "SCHEDULE_MEETING" && ["PENDING", "APPROVED", "EXECUTING", "EXECUTED"].includes(proposal.status?.toUpperCase() || "") && (proposal.clarificationQuestions || []).length === 0);
  const readyTask = allProposals(details).find((proposal) => proposal.actionType === "CREATE_TASK" && ["PENDING", "APPROVED", "EXECUTING", "EXECUTED"].includes(proposal.status?.toUpperCase() || "") && (proposal.clarificationQuestions || []).length === 0);
  const isMeetingPending = readyMeeting?.status?.toUpperCase() === "PENDING";
  const isTaskPending = readyTask?.status?.toUpperCase() === "PENDING";
  const latestUserContent = [...messages].reverse().find((item) => item.senderType.toUpperCase() === "USER")?.content?.trim() || "";
  const needsMeetingDetails = Boolean(details?.analysis && allProposals(details).length === 0 && /\b(meeting|schedule|calendar)\b/i.test(latestUserContent));

  async function submitClarification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeClarification?.proposal.id || !activeClarification.question.id || !clarificationAnswer.trim() || !accessToken) return;
    clearPolling();
    setIsSubmittingClarification(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(activeClarification.proposal.id)}/clarifications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: activeClarification.question.id, answer: clarificationAnswer.trim() }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<Proposal>;
      if (!response.ok || !result.success) throw new Error(apiError(result, "Unable to submit your answer."));
      if (activeMessageId) setClarificationHistory((current) => mergeClarificationHistory(current, [{ messageId: activeMessageId, proposalId: activeClarification.proposal.id, questionId: activeClarification.question.id!, question: activeClarification.question.question, answer: clarificationAnswer.trim() }]));
      setClarificationAnswer("");
      setSuccessMessage("Thanks — Laura is updating the meeting proposal.");
      if (activeMessageId) {
        setIsWaitingForAi(true);
        void pollForIntelligence(activeMessageId);
      }
    } catch (clarificationError) {
      setIsWaitingForAi(false);
      setError(clarificationError instanceof Error ? clarificationError.message : "Unable to submit your answer.");
    } finally {
      setIsSubmittingClarification(false);
    }
  }

  async function approveMeeting() {
    if (!readyMeeting?.id || !isMeetingPending || !accessToken || isApproving) return;
    setIsApproving(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(readyMeeting.id)}/action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<Proposal>;
      if (!response.ok || !result.success) throw new Error(apiError(result, "Unable to approve the meeting."));
      setDetails((current) => current ? {
        ...current,
        actions: {
          ...current.actions,
          meetingSchedules: (current.actions?.meetingSchedules || []).map((proposal) => proposal.id === readyMeeting.id ? { ...proposal, ...result.data, payload: result.data?.payload || proposal.payload } : proposal),
        },
      } : current);
      setSuccessMessage("Meeting approved. Laura is creating it now.");
      if (activeMessageId) {
        setIsWaitingForAi(true);
        void pollForIntelligence(activeMessageId);
      }
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Unable to approve the meeting.");
    } finally {
      setIsApproving(false);
    }
  }

  async function rejectMeeting() {
    if (!readyMeeting?.id || !isMeetingPending || !accessToken || isRejecting) return;
    setIsRejecting(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(readyMeeting.id)}/action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: "Cancelled from the Laura chat" }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<Proposal>;
      if (!response.ok || !result.success) throw new Error(apiError(result, "Unable to cancel the meeting."));
      setDetails((current) => current ? {
        ...current,
        actions: {
          ...current.actions,
          meetingSchedules: (current.actions?.meetingSchedules || []).map((proposal) => proposal.id === readyMeeting.id ? { ...proposal, status: "REJECTED" } : proposal),
        },
      } : current);
      setSuccessMessage("Meeting preview cancelled. No event was added to your calendar.");
    } catch (rejectionError) {
      setError(rejectionError instanceof Error ? rejectionError.message : "Unable to cancel the meeting.");
    } finally {
      setIsRejecting(false);
    }
  }

  async function approveTask() {
    if (!readyTask?.id || !isTaskPending || !accessToken || isApproving) return;
    setIsApproving(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(readyTask.id)}/action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<Proposal>;
      if (!response.ok || !result.success) throw new Error(apiError(result, "Unable to create the task."));
      setDetails((current) => current ? {
        ...current,
        actions: {
          ...current.actions,
          priorityTasks: (current.actions?.priorityTasks || []).map((proposal) => proposal.id === readyTask.id ? { ...proposal, ...result.data } : proposal),
        },
      } : current);
      if (activeMessageId) {
        setIsWaitingForAi(true);
        void pollForIntelligence(activeMessageId);
      }
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "Unable to create the task.");
    } finally {
      setIsApproving(false);
    }
  }

  async function rejectTask() {
    if (!readyTask?.id || !isTaskPending || !accessToken || isRejecting) return;
    setIsRejecting(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(readyTask.id)}/action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: "Cancelled from the Laura chat" }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<Proposal>;
      if (!response.ok || !result.success) throw new Error(apiError(result, "Unable to cancel the task."));
      setDetails((current) => current ? {
        ...current,
        actions: {
          ...current.actions,
          priorityTasks: (current.actions?.priorityTasks || []).map((proposal) => proposal.id === readyTask.id ? { ...proposal, status: "REJECTED" } : proposal),
        },
      } : current);
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "Unable to cancel the task.");
    } finally {
      setIsRejecting(false);
    }
  }

  function openMeetingEditor() {
    if (!readyMeeting || !isMeetingPending) {
      setError("This meeting has already been executed and can no longer be edited from the proposal preview.");
      return;
    }
    setMeetingEditDraft(createMeetingEditDraft(readyMeeting));
    setMeetingEditError(null);
    setIsEditingMeeting(true);
  }

  function cancelMeetingEdit() {
    setIsEditingMeeting(false);
    setMeetingEditDraft(null);
    setMeetingEditError(null);
  }

  async function saveMeetingEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!readyMeeting || !meetingEditDraft || !accessToken || isSavingMeetingEdit) return;
    const title = meetingEditDraft.title.trim();
    const timezone = meetingEditDraft.timezone.trim();
    const durationMinutes = Number(meetingEditDraft.durationMinutes);
    const invitees = inviteesFromText(meetingEditDraft.invitees);
    if (!title || !meetingEditDraft.startsAt || !timezone || !meetingEditDraft.platform || !Number.isInteger(durationMinutes) || durationMinutes < 1 || invitees.length === 0) {
      setMeetingEditError("Add a title, date and time, platform, duration, timezone, and at least one attendee before saving.");
      return;
    }

    setIsSavingMeetingEdit(true);
    setMeetingEditError(null);
    try {
      const payload = {
        title,
        startsAt: dateTimeInTimeZoneToIso(meetingEditDraft.startsAt, timezone),
        durationMinutes,
        timezone,
        invitees,
        platform: meetingEditDraft.platform,
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(readyMeeting.id)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...(Number.isInteger(readyMeeting.revision) ? { expectedRevision: readyMeeting.revision } : {}), payload }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<Proposal>;
      if (response.status === 409) {
        try {
          if (activeMessageId) {
            const refreshedDetails = await fetchMessageIntelligence(accessToken, activeMessageId);
            setDetails(refreshedDetails);
            const refreshedMeeting = allProposals(refreshedDetails).find((proposal) => proposal.id === readyMeeting.id);
            if (refreshedMeeting?.status?.toUpperCase() === "PENDING") setMeetingEditDraft(createMeetingEditDraft(refreshedMeeting));
          }
        } catch {
          // The user can retry manually if the latest proposal cannot be fetched.
        }
        setMeetingEditError("This meeting was updated elsewhere. The latest details have been loaded—review them and save again.");
        return;
      }
      if (!response.ok || !result.success || !result.data) throw new Error(apiError(result, "Unable to save your meeting changes."));
      setDetails((current) => current ? {
        ...current,
        actions: {
          ...current.actions,
          meetingSchedules: (current.actions?.meetingSchedules || []).map((proposal) => proposal.id === readyMeeting.id ? { ...proposal, ...result.data, payload: result.data?.payload || proposal.payload } : proposal),
        },
      } : current);
      setIsEditingMeeting(false);
      setMeetingEditDraft(null);
    } catch (editError) {
      setMeetingEditError(editError instanceof Error ? editError.message : "We couldn't save those meeting changes. Please try again.");
    } finally {
      setIsSavingMeetingEdit(false);
    }
  }

  const inputType = `${activeClarification?.question.inputType || ""} ${activeClarification?.question.question || ""}`.toLowerCase().includes("email") ? "email" : "text";
  const isReady = sessionStatus === "authenticated" && Boolean(accessToken);
  const currentClarificationHistory = clarificationHistory.filter((item) => item.messageId === activeMessageId);
  const thinkingLabel = currentClarificationHistory.length ? "Laura is updating your meeting details" : "Laura is thinking";
  const meetingDateTime = formatMeetingDateTime(readyMeeting?.payload?.startsAt || readyMeeting?.startsAt);
  const isPreviewDelayed = error === PREVIEW_DELAYED_ERROR;

  function checkMeetingPreviewAgain() {
    if (!activeMessageId || isWaitingForAi) return;
    clearPolling();
    setError(null);
    setSuccessMessage(null);
    setIsWaitingForAi(true);
    void pollForIntelligence(activeMessageId);
  }

  useEffect(() => {
    const chat = chatScrollRef.current;
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
  }, [activeClarification?.question.id, currentClarificationHistory.length, isWaitingForAi, messages.length, readyMeeting?.id]);

  function handleChatWheel(event: WheelEvent<HTMLDivElement>) {
    const chat = chatScrollRef.current;
    if (!chat) return;

    // Keep mouse-wheel and trackpad scrolling inside the conversation pane.
    event.preventDefault();
    event.stopPropagation();
    chat.scrollBy({ top: event.deltaY, behavior: "auto" });
  }

  return <section className="flex h-[calc(100svh-300px)] min-h-[400px] flex-col gap-3 bg-transparent">
    <div ref={chatScrollRef} onWheel={handleChatWheel} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-xl bg-white p-4 pr-2 shadow-[0_1px_2px_rgba(32,53,112,0.02)] sm:p-6 sm:pr-4">
      <div className="flex min-h-full flex-col gap-4">
      {!conversationId ? <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#DCE3F5] p-8 text-center text-sm text-[#8B93B8]">Create a New Chat from the sidebar to start talking with Laura.</div> : isLoadingMessages ? <div className="flex flex-1 items-center justify-center text-sm text-[#8B93B8]"><Loader2 className="mr-2 size-4 animate-spin" /> Loading conversation...</div> : <>
        {messages.length === 0 ? <div className="flex flex-1 items-center justify-center text-center text-sm text-[#8B93B8]">This is a new chat. Tell Laura what you would like to do.</div> : messages.flatMap((item) => {
          const isUserMessage = item.senderType.toUpperCase() === "USER";
          const hasSavedAiReply = isUserMessage && messages.some((candidate) => candidate.senderType.toUpperCase() === "AI" && candidate.sourceMessageId === item.id);
          const summary = aiSummaries[item.id];
          const shouldShowSummary = isUserMessage && summary && !hasSavedAiReply && !(needsMeetingDetails && item.id === activeMessageId);
          return [
            isUserMessage ? <UserMessage key={item.id}><div className="space-y-2">{item.content ? <p>{item.content}</p> : null}{item.attachments?.length ? <div className="space-y-2">{item.attachments.map((attachment) => <MessageAttachmentCard key={attachment.id} messageId={item.id} attachment={attachment} accessToken={accessToken} />)}</div> : null}{!item.content && !item.attachments?.length ? <p>Attachment sent</p> : null}</div></UserMessage> : <LauraMessage key={item.id}>{item.agentName ? <p className="mb-1 text-xs font-medium text-[#5B7FF0]">{item.agentName}</p> : null}<p>{item.content || "Laura is preparing a response..."}</p></LauraMessage>,
            shouldShowSummary ? <LauraMessage key={`${item.id}-analysis`}><p>{summary}</p></LauraMessage> : null,
          ];
        })}
        {needsMeetingDetails ? <LauraMessage><p>I can help schedule this meeting. Please confirm that you want me to schedule it and share the date, time, duration, meeting platform, and Tanvir&apos;s email address.</p></LauraMessage> : null}
        {currentClarificationHistory.map((item) => <div key={`${item.proposalId}-${item.questionId}`} className="contents"><LauraMessage><p className="font-medium">{item.question}</p></LauraMessage><UserMessage>{item.answer}</UserMessage></div>)}
        {isWaitingForAi ? <LauraThinking label={thinkingLabel} /> : null}
        {activeClarification ? <LauraMessage><p className="font-medium">{activeClarification.question.question}</p><form onSubmit={submitClarification} className="mt-3 flex gap-2"><input type={inputType} value={clarificationAnswer} onChange={(event) => setClarificationAnswer(event.target.value)} required={activeClarification.question.required !== false} placeholder="Enter your answer" className="min-w-0 flex-1 rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm outline-none focus:border-[#5B7FF0]" /><button type="submit" disabled={isSubmittingClarification || !clarificationAnswer.trim()} className="rounded-lg bg-[#5B7FF0] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmittingClarification ? "Sending..." : "Reply"}</button></form></LauraMessage> : null}
        {readyMeeting ? <LauraMessage>
          <p>{isMeetingPending ? "I’ve put the meeting details together. Please review the preview below, then confirm when you’re ready to add it to your calendar." : "This meeting has been processed. The preview remains available for your reference."}</p>
          <div className="mt-3 rounded-xl border border-[#E3E9FA] bg-white p-3 text-xs shadow-[0_4px_18px_rgba(55,78,143,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#5B7FF0]"><CalendarDays className="size-4" /> Meeting Preview</h3>
              <button type="button" onClick={openMeetingEditor} disabled={!isMeetingPending || isEditingMeeting || isApproving || isRejecting} aria-label="Edit meeting details" title={isMeetingPending ? "Edit meeting details" : "Executed meetings can no longer be edited"} className="flex size-8 items-center justify-center rounded-full bg-[#EEF2FF] text-[#5B7FF0] transition-colors hover:bg-[#DEE6FF] disabled:cursor-not-allowed disabled:opacity-40"><Pencil className="size-4" /></button>
            </div>
            {isEditingMeeting && meetingEditDraft ? <form onSubmit={saveMeetingEdit} className="mt-3 space-y-3 rounded-lg bg-[#F7F9FF] p-3">
              <p className="text-xs font-medium text-[#454E76]">Update the details, then save your changes before confirming.</p>
              <label className="block text-xs font-medium text-[#667085]">Meeting title<input value={meetingEditDraft.title} onChange={(event) => setMeetingEditDraft((current) => current ? { ...current, title: event.target.value } : current)} required className="mt-1.5 w-full rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm text-[#252B48] outline-none focus:border-[#5B7FF0]" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-[#667085]">Date &amp; time<input type="datetime-local" value={meetingEditDraft.startsAt} onChange={(event) => setMeetingEditDraft((current) => current ? { ...current, startsAt: event.target.value } : current)} required className="mt-1.5 w-full rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm text-[#252B48] outline-none focus:border-[#5B7FF0]" /></label>
                <label className="block text-xs font-medium text-[#667085]">Duration (minutes)<input type="number" min="1" step="1" value={meetingEditDraft.durationMinutes} onChange={(event) => setMeetingEditDraft((current) => current ? { ...current, durationMinutes: event.target.value } : current)} required className="mt-1.5 w-full rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm text-[#252B48] outline-none focus:border-[#5B7FF0]" /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-[#667085]">Platform<select value={meetingEditDraft.platform} onChange={(event) => setMeetingEditDraft((current) => current ? { ...current, platform: event.target.value } : current)} required className="mt-1.5 w-full rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm text-[#252B48] outline-none focus:border-[#5B7FF0]"><option value="">Choose a platform</option><option value="GOOGLE_MEET">Google Meet</option><option value="ZOOM">Zoom</option></select></label>
                <label className="block text-xs font-medium text-[#667085]">Timezone<input value={meetingEditDraft.timezone} onChange={(event) => setMeetingEditDraft((current) => current ? { ...current, timezone: event.target.value } : current)} required placeholder="Asia/Dhaka" className="mt-1.5 w-full rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm text-[#252B48] outline-none focus:border-[#5B7FF0]" /></label>
              </div>
              <label className="block text-xs font-medium text-[#667085]">Attendees<span className="ml-1 font-normal text-[#8B93B8]">(separate emails with commas)</span><input type="text" value={meetingEditDraft.invitees} onChange={(event) => setMeetingEditDraft((current) => current ? { ...current, invitees: event.target.value } : current)} required placeholder="name@example.com, teammate@example.com" className="mt-1.5 w-full rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm text-[#252B48] outline-none focus:border-[#5B7FF0]" /></label>
              {meetingEditError ? <p className="rounded-md border border-[#F6D9A9] bg-[#FFF9EE] px-2.5 py-2 text-xs text-[#93601A]" role="alert">{meetingEditError}</p> : null}
              <div className="flex gap-2 pt-1"><button type="button" onClick={cancelMeetingEdit} disabled={isSavingMeetingEdit} className="rounded-lg border border-[#B9C5E7] px-3 py-2 text-sm text-[#65719B] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">Cancel</button><button type="submit" disabled={isSavingMeetingEdit} className="flex-1 rounded-lg bg-[#5B7FF0] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4C6FE0] disabled:cursor-not-allowed disabled:opacity-60">{isSavingMeetingEdit ? "Saving changes..." : "Save changes"}</button></div>
            </form> : <>
              <dl className="mt-3 grid grid-cols-[82px_1fr] gap-y-2.5 text-[#555577]"><dt className="text-[#8B93B8]">Title</dt><dd className="font-medium text-[#252B48]">{readyMeeting.payload?.title || readyMeeting.title || "New meeting"}</dd><dt className="text-[#8B93B8]">Date</dt><dd>{meetingDateTime.date}</dd><dt className="text-[#8B93B8]">Time</dt><dd>{meetingDateTime.time}{readyMeeting.payload?.timezone ? ` (${readyMeeting.payload.timezone})` : ""}</dd><dt className="text-[#8B93B8]">Duration</dt><dd>{readyMeeting.payload?.durationMinutes || readyMeeting.durationMinutes || 30} minutes</dd><dt className="text-[#8B93B8]">Platform</dt><dd>{formatMeetingPlatform(meetingPlatformFromProposal(readyMeeting))}</dd><dt className="text-[#8B93B8]">Attendees</dt><dd className="break-words">{meetingInviteesFromProposal(readyMeeting).join(", ") || "Not specified"}</dd></dl>
              {isMeetingPending ? <div className="mt-4 flex gap-2"><button type="button" onClick={() => void rejectMeeting()} disabled={isRejecting || isApproving} className="rounded-lg border border-[#B9C5E7] px-3 py-2 text-sm text-[#65719B] transition-colors hover:bg-[#F5F7FF] disabled:cursor-not-allowed disabled:opacity-60">{isRejecting ? "Cancelling..." : "Cancel"}</button><button type="button" onClick={() => void approveMeeting()} disabled={isApproving || isRejecting} className="flex-1 rounded-lg bg-[#5B7FF0] px-3 py-2 text-sm text-white transition-colors hover:bg-[#4C6FE0] disabled:cursor-not-allowed disabled:opacity-60">{isApproving ? "Adding to calendar..." : "Confirm & Add to calendar"}</button></div> : <div className="mt-4 rounded-lg bg-[#EEF2FF] px-3 py-2 text-center text-sm font-medium text-[#5B7FF0]">{readyMeeting.status?.toUpperCase() === "EXECUTED" ? "Executed" : readyMeeting.status?.replace(/_/g, " ")}</div>}
            </>}
          </div>
        </LauraMessage> : null}
        {readyTask ? <LauraMessage>
          <p>{isTaskPending ? "I’ve prepared this task for your approval. Review the details below, then create it when you’re ready." : "This task has been processed. The preview remains available for your reference."}</p>
          <div className="mt-3 rounded-xl border border-[#E3E9FA] bg-white p-3 text-xs shadow-[0_4px_18px_rgba(55,78,143,0.08)]">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#5B7FF0]"><CheckSquare className="size-4" /> Task Preview</h3>
            <dl className="mt-3 grid grid-cols-[82px_1fr] gap-y-2.5 text-[#555577]"><dt className="text-[#8B93B8]">Title</dt><dd className="font-medium text-[#252B48]">{readyTask.title || "New task"}</dd><dt className="text-[#8B93B8]">Details</dt><dd className="break-words">{readyTask.description || "No additional details provided"}</dd><dt className="text-[#8B93B8]">Priority</dt><dd>{formatMeetingPlatform(readyTask.priority || "MEDIUM")}</dd><dt className="text-[#8B93B8]">Department</dt><dd>{formatMeetingPlatform(readyTask.department || "Not specified")}</dd><dt className="text-[#8B93B8]">Tags</dt><dd className="flex flex-wrap gap-1.5">{readyTask.tags?.length ? readyTask.tags.map((tag) => <span key={tag} className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[#5B7FF0]">#{tag}</span>) : "No tags"}</dd></dl>
            {isTaskPending ? <div className="mt-4 flex gap-2"><button type="button" onClick={() => void rejectTask()} disabled={isRejecting || isApproving} className="rounded-lg border border-[#B9C5E7] px-3 py-2 text-sm text-[#65719B] transition-colors hover:bg-[#F5F7FF] disabled:cursor-not-allowed disabled:opacity-60">{isRejecting ? "Cancelling..." : "Cancel"}</button><button type="button" onClick={() => void approveTask()} disabled={isApproving || isRejecting} className="flex-1 rounded-lg bg-[#5B7FF0] px-3 py-2 text-sm text-white transition-colors hover:bg-[#4C6FE0] disabled:cursor-not-allowed disabled:opacity-60">{isApproving ? "Creating task..." : "Confirm & Create task"}</button></div> : <div className="mt-4 rounded-lg bg-[#EEF2FF] px-3 py-2 text-center text-sm font-medium text-[#5B7FF0]">{readyTask.status?.toUpperCase() === "EXECUTED" ? "Executed" : readyTask.status?.replace(/_/g, " ")}</div>}
          </div>
        </LauraMessage> : null}
      </>}
      </div>
    </div>
    {error ? <div className="flex items-center justify-between gap-3 rounded-xl border border-[#F6D9A9] bg-[#FFF9EE] px-3 py-2.5" role="alert"><div className="flex min-w-0 items-start gap-2"><AlertCircle className="mt-0.5 size-4 shrink-0 text-[#D97706]" /><div><p className="text-sm font-medium text-[#7A4A0A]">{isPreviewDelayed ? "Laura is still preparing your meeting preview" : "Laura needs a moment"}</p><p className="mt-0.5 text-xs text-[#93601A]">{isPreviewDelayed ? "Your confirmed meeting details are saved. It can take a little longer to prepare the final preview." : error}</p></div></div>{isPreviewDelayed ? <button type="button" onClick={checkMeetingPreviewAgain} disabled={isWaitingForAi} className="flex shrink-0 items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-[#5B7FF0] shadow-sm transition-colors hover:bg-[#F5F7FF] disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw className={`size-3.5 ${isWaitingForAi ? "animate-spin" : ""}`} /> Check preview</button> : null}</div> : null}
    {attachments.length ? <div className="rounded-xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(32,53,112,0.02)]"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-[#252B48]">{attachments.length} file{attachments.length > 1 ? "s" : ""} ready to send</span><span className="text-[#8B93B8]">Up to {MAX_ATTACHMENTS} files</span></div><div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">{attachments.map((file, index) => { const key = attachmentKey(file, index); const previewUrl = attachmentPreviewUrls[key]; return <div key={key} className="flex max-w-full items-center gap-2 rounded-lg bg-[#F5F7FF] px-2 py-1.5 text-xs text-[#454E76]">{previewUrl ? <Image src={previewUrl} alt={`${file.name} preview`} width={36} height={36} unoptimized className="size-9 shrink-0 rounded-md border border-[#DCE3F5] object-cover" /> : <FileText className="size-4 shrink-0 text-[#5B7FF0]" />}<span className="max-w-48 truncate">{file.name}</span><span className="shrink-0 text-[#8B93B8]">{fileSizeLabel(file.size)}</span><button type="button" onClick={() => removeAttachment(index)} aria-label={`Remove ${file.name}`} className="rounded p-0.5 text-[#8B93B8] transition-colors hover:bg-white hover:text-[#EF4444]"><X className="size-3.5" /></button></div>; })}</div></div> : null}
    <form onSubmit={submitMessage} className="flex h-20 items-center gap-4 rounded-xl bg-white px-6 shadow-[0_1px_2px_rgba(32,53,112,0.03)] sm:px-10">
      <input ref={fileInputRef} type="file" multiple accept={ATTACHMENT_ACCEPT} onChange={(event) => selectAttachments(event.target.files)} disabled={!isReady || isSending} className="hidden" />
      <button type="button" aria-label="Attach files" onClick={() => fileInputRef.current?.click()} disabled={!isReady || isSending} className="flex size-10 shrink-0 items-center justify-center text-[#0E1224] transition-colors hover:text-[#5B7FF0] disabled:cursor-not-allowed disabled:opacity-45" title="Attach files"><Paperclip className="size-7" strokeWidth={1.7} /></button>
      <input value={message} onChange={(event) => setMessage(event.target.value)} disabled={!isReady || isSending} placeholder={conversationId ? "Share what’s on your mind..." : "Start a new chat with a message..."} className="min-w-0 flex-1 bg-transparent text-lg text-[#252B48] outline-none placeholder:text-[#667085] disabled:cursor-not-allowed" />
      <button type="button" aria-label="Voice message" disabled className="flex size-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-[#F5F7FF] text-[#0E1224] opacity-70" title="Voice messages are not enabled in this chat yet"><Mic className="size-6" strokeWidth={1.7} /></button>
      <button type="submit" disabled={(!message.trim() && attachments.length === 0) || !isReady || isSending} aria-label="Send message" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0] text-white shadow-[0_4px_10px_rgba(91,127,240,0.22)] transition-colors hover:bg-[#4C6FE0] disabled:cursor-not-allowed disabled:opacity-60">{isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-7" strokeWidth={1.6} />}</button>
    </form>
  </section>;
}

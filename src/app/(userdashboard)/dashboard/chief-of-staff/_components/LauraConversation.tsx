"use client";

import Image from "next/image";
import { CalendarDays, Loader2, Mic, Paperclip, Send } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string | string[] };
type ChatMessage = { id: string; conversationId: string; content?: string | null; senderType: string; agentName?: string | null; sourceMessageId?: string | null; createdAt: string };
type MessagesPayload = { items: ChatMessage[] };
type ClarificationQuestion = { id?: string; question: string; inputType?: string; required?: boolean };
type Proposal = {
  id: string;
  actionType?: string;
  status?: string;
  title?: string;
  startsAt?: string;
  durationMinutes?: number;
  payload?: { title?: string; startsAt?: string; durationMinutes?: number; timezone?: string; invitees?: string[] };
  clarificationQuestions?: ClarificationQuestion[];
  clarificationAnswers?: Record<string, string>;
};
type IntelligenceDetails = { analysis?: { summary?: string | null } | null; actions?: { priorityTasks?: Proposal[]; meetingSchedules?: Proposal[] } };
type ClarificationHistoryItem = { messageId: string; proposalId: string; questionId: string; question: string; answer: string };

type LauraConversationProps = {
  conversationId: string | null;
  accessToken?: string;
  sessionStatus: "authenticated" | "loading" | "unauthenticated";
  onConversationUpdated: (conversationId: string, preview: string, moveToTop?: boolean) => void;
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

function allProposals(details: IntelligenceDetails | null) {
  return [...(details?.actions?.meetingSchedules || []), ...(details?.actions?.priorityTasks || [])];
}

function answeredClarifications(messageId: string, details: IntelligenceDetails | null): ClarificationHistoryItem[] {
  return allProposals(details).flatMap((proposal) => (proposal.clarificationQuestions || []).flatMap((question) => {
    const answer = question.id ? proposal.clarificationAnswers?.[question.id] : undefined;
    return question.id && answer ? [{ messageId, proposalId: proposal.id, questionId: question.id, question: question.question, answer }] : [];
  }));
}

function mergeClarificationHistory(current: ClarificationHistoryItem[], additions: ClarificationHistoryItem[]) {
  const byId = new Map(current.map((item) => [`${item.messageId}:${item.proposalId}:${item.questionId}`, item]));
  additions.forEach((item) => byId.set(`${item.messageId}:${item.proposalId}:${item.questionId}`, item));
  return Array.from(byId.values());
}

export function LauraConversation({ conversationId, accessToken, sessionStatus, onConversationUpdated }: LauraConversationProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [clarificationHistory, setClarificationHistory] = useState<ClarificationHistoryItem[]>([]);
  const [locallyAnsweredQuestionIds, setLocallyAnsweredQuestionIds] = useState<Set<string>>(() => new Set());
  const [details, setDetails] = useState<IntelligenceDetails | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isWaitingForAi, setIsWaitingForAi] = useState(false);
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPreview = useRef("");
  const requestedSummaryIds = useRef(new Set<string>());
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const clearPolling = useCallback(() => {
    if (pollTimeout.current) {
      clearTimeout(pollTimeout.current);
      pollTimeout.current = null;
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!conversationId || !accessToken) return [];
    const query = new URLSearchParams({ conversationId, page: "1", limit: "30" });
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages?${query}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const result = (await response.json().catch(() => ({}))) as ApiEnvelope<MessagesPayload>;
    if (!response.ok || !result.success || !result.data) throw new Error(apiError(result, "Unable to load messages."));
    const chronologicalMessages = [...result.data.items].reverse();
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
    if (attempts >= 30) {
      setIsWaitingForAi(false);
      return;
    }
    try {
      const nextDetails = await loadIntelligence(messageId, needsClarificationFirst ? "NEEDS_CLARIFICATION" : undefined);
      const proposals = allProposals(nextDetails);
      const hasQuestion = proposals.some((proposal) => (proposal.clarificationQuestions || []).some((question) => question.id && !proposal.clarificationAnswers?.[question.id]));
      const hasActionableProposal = proposals.some((proposal) => ["PENDING", "EXECUTED"].includes(proposal.status?.toUpperCase() || ""));
      const hasUnresolvedProposal = proposals.some((proposal) => proposal.status?.toUpperCase() === "ANALYZING");
      const loadedMessages = await loadMessages();
      const hasAssistantReply = loadedMessages.some((item) => item.senderType.toUpperCase() === "AI" && item.sourceMessageId === messageId);
      const hasCompletedAnalysis = Boolean(nextDetails?.analysis);
      const isResolved = hasQuestion || hasActionableProposal || (!hasUnresolvedProposal && (hasAssistantReply || hasCompletedAnalysis));
      setIsWaitingForAi(!isResolved);
      if (!isResolved) {
        pollTimeout.current = setTimeout(() => void pollForIntelligence(messageId, attempts + 1, false), 2_000);
      }
    } catch (pollError) {
      if (attempts < 29) {
        pollTimeout.current = setTimeout(() => void pollForIntelligence(messageId, attempts + 1, false), 2_000);
      } else {
        setIsWaitingForAi(false);
        setError(pollError instanceof Error ? pollError.message : "The AI response could not be loaded.");
      }
    }
  }, [loadIntelligence, loadMessages]);

  useEffect(() => {
    clearPolling();
    setMessages([]);
    setAiSummaries({});
    setClarificationHistory([]);
    setLocallyAnsweredQuestionIds(new Set());
    setDetails(null);
    setActiveMessageId(null);
    setClarificationAnswer("");
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
        void pollForIntelligence(latestUserMessage.id, 0, true);
      }
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load messages.")).finally(() => setIsLoadingMessages(false));
    return clearPolling;
  }, [accessToken, clearPolling, conversationId, loadHistoricalSummaries, loadMessages, pollForIntelligence]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if (!content || !conversationId || !accessToken || isSending) return;
    clearPolling();
    setIsSending(true);
    setError(null);
    setSuccessMessage(null);
    setDetails(null);
    setIsWaitingForAi(true);
    try {
      const body = new FormData();
      body.append("clientMessageId", crypto.randomUUID());
      body.append("conversationId", conversationId);
      body.append("content", content);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/messages`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body });
      const result = (await response.json().catch(() => ({}))) as ApiEnvelope<ChatMessage>;
      if (!response.ok || !result.success || !result.data?.id) throw new Error(apiError(result, "Unable to send your message."));
      setMessage("");
      setActiveMessageId(result.data.id);
      setMessages((current) => [...current, result.data!]);
      onConversationUpdated(conversationId, content, true);
      await loadMessages();
      void pollForIntelligence(result.data.id, 0, true);
    } catch (sendError) {
      setIsWaitingForAi(false);
      setError(sendError instanceof Error ? sendError.message : "Unable to send your message.");
    } finally {
      setIsSending(false);
    }
  }

  const activeClarification = isWaitingForAi ? undefined : allProposals(details).flatMap((proposal) => (proposal.clarificationQuestions || []).map((question) => ({ proposal, question }))).find(({ proposal, question }) => question.id && !proposal.clarificationAnswers?.[question.id] && !locallyAnsweredQuestionIds.has(question.id));
  const readyMeeting = allProposals(details).find((proposal) => proposal.actionType === "SCHEDULE_MEETING" && proposal.status?.toUpperCase() === "PENDING" && !(proposal.clarificationQuestions || []).some((question) => question.id && !proposal.clarificationAnswers?.[question.id]));
  const executedMeeting = allProposals(details).find((proposal) => proposal.status?.toUpperCase() === "EXECUTED");
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
      setLocallyAnsweredQuestionIds((current) => new Set(current).add(activeClarification.question.id!));
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
    if (!readyMeeting?.id || !accessToken || isApproving) return;
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
      setSuccessMessage("Meeting approved. Laura is creating it now.");
      if (activeMessageId) void pollForIntelligence(activeMessageId);
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Unable to approve the meeting.");
    } finally {
      setIsApproving(false);
    }
  }

  const inputType = `${activeClarification?.question.inputType || ""} ${activeClarification?.question.question || ""}`.toLowerCase().includes("email") ? "email" : "text";
  const isReady = sessionStatus === "authenticated" && Boolean(accessToken);
  const currentClarificationHistory = clarificationHistory.filter((item) => item.messageId === activeMessageId);
  const thinkingLabel = currentClarificationHistory.length ? "Laura is updating your meeting details" : "Laura is thinking";

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeClarification?.question.id, currentClarificationHistory.length, isWaitingForAi, messages.length, readyMeeting?.id]);

  return <section className="mt-4 flex h-[calc(100vh-190px)] min-h-[520px] flex-col bg-white py-4">
    <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-white p-4 pr-2 sm:p-6 sm:pr-4">
      <div className="flex min-h-full flex-col gap-4">
      {!conversationId ? <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#DCE3F5] p-8 text-center text-sm text-[#8B93B8]">Create a New Chat from the sidebar to start talking with Laura.</div> : isLoadingMessages ? <div className="flex flex-1 items-center justify-center text-sm text-[#8B93B8]"><Loader2 className="mr-2 size-4 animate-spin" /> Loading conversation...</div> : <>
        {messages.length === 0 ? <div className="flex flex-1 items-center justify-center text-center text-sm text-[#8B93B8]">This is a new chat. Tell Laura what you would like to do.</div> : messages.flatMap((item) => {
          const isUserMessage = item.senderType.toUpperCase() === "USER";
          const hasSavedAiReply = isUserMessage && messages.some((candidate) => candidate.senderType.toUpperCase() === "AI" && candidate.sourceMessageId === item.id);
          const summary = aiSummaries[item.id];
          const shouldShowSummary = isUserMessage && summary && !hasSavedAiReply && !(needsMeetingDetails && item.id === activeMessageId);
          return [
            isUserMessage ? <UserMessage key={item.id}>{item.content || "Attachment sent"}</UserMessage> : <LauraMessage key={item.id}>{item.agentName ? <p className="mb-1 text-xs font-medium text-[#5B7FF0]">{item.agentName}</p> : null}<p>{item.content || "Laura is preparing a response..."}</p></LauraMessage>,
            shouldShowSummary ? <LauraMessage key={`${item.id}-analysis`}><p>{summary}</p></LauraMessage> : null,
          ];
        })}
        {needsMeetingDetails ? <LauraMessage><p>I can help schedule this meeting. Please confirm that you want me to schedule it and share the date, time, duration, meeting platform, and Tanvir&apos;s email address.</p></LauraMessage> : null}
        {currentClarificationHistory.map((item) => <div key={`${item.proposalId}-${item.questionId}`} className="contents"><LauraMessage><p className="font-medium">{item.question}</p></LauraMessage><UserMessage>{item.answer}</UserMessage></div>)}
        {currentClarificationHistory.length ? <p className="self-start pl-12 text-xs text-[#10B981]">✓ {currentClarificationHistory.length} meeting detail{currentClarificationHistory.length > 1 ? "s" : ""} confirmed</p> : null}
        {isWaitingForAi ? <LauraThinking label={thinkingLabel} /> : null}
        {activeClarification ? <LauraMessage><p className="font-medium">{activeClarification.question.question}</p><form onSubmit={submitClarification} className="mt-3 flex gap-2"><input type={inputType} value={clarificationAnswer} onChange={(event) => setClarificationAnswer(event.target.value)} required={activeClarification.question.required !== false} placeholder="Enter your answer" className="min-w-0 flex-1 rounded-lg border border-[#DCE3F5] bg-white px-3 py-2 text-sm outline-none focus:border-[#5B7FF0]" /><button type="submit" disabled={isSubmittingClarification || !clarificationAnswer.trim()} className="rounded-lg bg-[#5B7FF0] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmittingClarification ? "Sending..." : "Reply"}</button></form></LauraMessage> : null}
        {readyMeeting ? <LauraMessage><p>I&apos;ve prepared this meeting for your approval.</p><div className="mt-3 rounded-lg bg-white p-3 text-xs shadow-[0_0_4px_rgba(0,0,0,.16)]"><h3 className="flex items-center gap-2 text-sm text-[#5B7FF0]"><CalendarDays className="size-4" /> Meeting Preview</h3><dl className="mt-2 grid grid-cols-[76px_1fr] gap-y-2 text-[#555577]"><dt>Title:</dt><dd>{readyMeeting.payload?.title || readyMeeting.title || "New meeting"}</dd><dt>Time:</dt><dd>{readyMeeting.payload?.startsAt || readyMeeting.startsAt ? new Date(readyMeeting.payload?.startsAt || readyMeeting.startsAt || "").toLocaleString() : "Not specified"}</dd><dt>Duration:</dt><dd>{readyMeeting.payload?.durationMinutes || readyMeeting.durationMinutes || 30} minutes</dd><dt>Attendees:</dt><dd>{readyMeeting.payload?.invitees?.join(", ") || "Not specified"}</dd></dl><button type="button" onClick={() => void approveMeeting()} disabled={isApproving} className="mt-3 w-full rounded-lg bg-[#5B7FF0] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60">{isApproving ? "Approving..." : "Confirm & Add to calendar"}</button></div></LauraMessage> : null}
        {executedMeeting ? <LauraMessage><p className="font-medium text-[#10B981]">Your meeting has been created successfully.</p></LauraMessage> : null}
        <div ref={conversationEndRef} />
      </>}
      </div>
    </div>
    {error ? <p className="px-4 pb-2 text-sm text-[#EF4444]">{error}</p> : null}
    {successMessage ? <p className="px-4 pb-2 text-sm text-[#10B981]">{successMessage}</p> : null}
    <form onSubmit={submitMessage} className="mt-2 flex h-[72px] items-center gap-3 rounded-lg bg-white px-4 sm:px-8">
      <button type="button" aria-label="Attach file" disabled className="cursor-not-allowed opacity-45" title="Attachments are not enabled in this chat yet"><Paperclip className="size-6" strokeWidth={1.6} /></button>
      <input value={message} onChange={(event) => setMessage(event.target.value)} disabled={!conversationId || !isReady || isSending} placeholder={conversationId ? "Share what’s on your mind..." : "Create a New Chat to start"} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#8B93B8] disabled:cursor-not-allowed" />
      <button type="button" aria-label="Voice message" disabled className="flex size-10 cursor-not-allowed items-center justify-center rounded-full bg-[#F5F7FF] opacity-45" title="Voice messages are not enabled in this chat yet"><Mic className="size-6" strokeWidth={1.6} /></button>
      <button type="submit" disabled={!message.trim() || !conversationId || !isReady || isSending} aria-label="Send message" className="flex size-10 items-center justify-center rounded-full bg-[#5B7FF0] text-white disabled:cursor-not-allowed disabled:opacity-60">{isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-6" strokeWidth={1.6} />}</button>
    </form>
  </section>;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CalendarCheck2,
  Check,
  Download,
  Mail,
  Play,
  Search,
  SquareCheckBig,
  TriangleAlert,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { CallDetailsSkeleton } from "../_components/CallDetailsSkeleton";
import { PriorityTaskDetailsModal } from "../_components/PriorityTaskDetailsModal";
import { ClarificationAnswerModal } from "../_components/ClarificationAnswerModal";
import type { CallDetails, ClarificationQuestion } from "../_components/callDetailsTypes";
import { getCallDetailsSourceType } from "../_components/types";

const waveform = [
  4, 4, 5, 5, 11, 11, 6, 6, 3, 3, 7, 9, 9, 4, 4, 8, 8, 6, 6, 12, 12, 8, 8, 5, 5,
  7, 7, 11, 11, 11, 11,
];

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[#E4EAF8] pb-4 text-xl font-medium text-[#0E1224]">
      {children}
    </h2>
  );
}
function CallDetailsContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const sourceId = params.id;
  const sourceType = getCallDetailsSourceType(
    "",
    searchParams.get("sourceType") || "",
  );
  const accessToken = session?.user.accessToken;
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selectedClarification, setSelectedClarification] = useState<{ proposalId: string; question: ClarificationQuestion } | null>(null);
  const detailsQuery = useQuery({
    queryKey: ["call-intelligence-details", sourceId, sourceType],
    enabled: sessionStatus === "authenticated" && Boolean(accessToken) && Boolean(sourceId) && Boolean(sourceType),
    queryFn: async () => {
      if (!accessToken || !sourceId || !sourceType) throw new Error("Call source information is missing.");
      const query = new URLSearchParams({ sourceType, includeTranscript: "true" });
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/${encodeURIComponent(sourceId)}/details?${query}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string | string[]; data?: CallDetails };
      if (!response.ok || !result.success || !result.data) { const message = Array.isArray(result.message) ? result.message.join(", ") : result.message; throw new Error(message || "Unable to load call details."); }
      return result.data;
    },
  });
  const details = detailsQuery.data;
  const transcript = useMemo(() => {
    const classifiedSegments = details?.analysis?.classifiedSegments || [];
    const segments = classifiedSegments.length ? classifiedSegments : details?.transcript.segments || [];
    if (segments.length) return segments.map((segment, index) => {
      const startTime = segment.startTimeSeconds;
      const time = typeof startTime === "number" ? `${Math.floor(startTime / 60).toString().padStart(2,"0")}:${Math.floor(startTime % 60).toString().padStart(2,"0")} min` : typeof segment.confidence === "number" ? `${Math.round(segment.confidence * 100)}% confidence` : "AI classified";
      return { id: segment.id || `segment-${index}`, name: segment.speaker || "Unknown speaker", avatar: index % 2 ? "/call-intelligence/details/avatar-4.png" : "/call-intelligence/details/avatar-2.png", time, text: segment.text || "", type: segment.category === "OBJECTION" ? "Objections" : segment.category === "COMMITMENT" ? "Commitments" : segment.category === "ACTION_ITEM" ? "Action Item" : "All" };
    });
    return details?.transcript.text ? [{ id: "full-transcript", name: "Transcript", avatar: "/call-intelligence/details/avatar-2.png", time: "Full transcript", text: details.transcript.text, type: "All" }] : [];
  }, [details]);
  const priorityTasks = useMemo(() => (details?.actions.priorityTasks || []).filter((item) => item.status?.toUpperCase() !== "NEEDS_CLARIFICATION").map((item) => [item.id, item.title || "Untitled task", item.dueDate ? new Date(item.dueDate).toLocaleString() : "No due date", item.priority || "MEDIUM", item.priority === "HIGH" ? "bg-[#EF4444]/10 text-[#EF4444]" : item.priority === "LOW" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/15 text-[#F59E0B]", item.status || "PENDING"] as const), [details]);
  const schedule = useMemo(() => (details?.actions.meetingSchedules || []).filter((item) => item.status?.toUpperCase() !== "NEEDS_CLARIFICATION").map((item) => [item.id, item.title || "Untitled meeting", item.startsAt ? new Date(item.startsAt).toLocaleString() : "Time not specified", item.status || "PENDING"] as const), [details]);
  const clarificationQuestions = useMemo(() => {
    const questions = [...(details?.actions.priorityTasks || []), ...(details?.actions.meetingSchedules || [])].flatMap((item) =>
      (item.clarificationQuestions || []).map((question) => ({
        proposalId: item.id,
        question,
        answered: Boolean(question.id && Object.prototype.hasOwnProperty.call(item.clarificationAnswers || {}, question.id)),
      })),
    );
    return questions.filter((item, index) => questions.findIndex((entry) => entry.proposalId === item.proposalId && (entry.question.id && item.question.id ? entry.question.id === item.question.id : entry.question.question === item.question.question)) === index);
  }, [details]);
  const patternData = details?.analysis?.patternDetection || {};
  const patterns = Object.entries(patternData).filter((entry): entry is [string, number] => typeof entry[1] === "number").map(([key,value]) => [key.replace(/([A-Z])/g," $1").replace(/^./, (letter) => letter.toUpperCase()), `${value}%`]);
  const sentiment = details?.analysis?.sentimentAnalysis?.score;
  const positive = sentiment?.positive ?? 0;
  const neutral = sentiment?.neutral ?? 0;
  const negative = sentiment?.negative ?? 0;
  const confidence = Math.round((details?.analysis?.overallConfidence ?? 0) * 100);
  const occurredAt = details?.metadata.occurredAt || details?.metadata.startsAt;
  const durationMinutes = details?.metadata.durationMinutes ?? Math.round((details?.metadata.durationSeconds ?? 0) / 60);
  const filteredTranscript = useMemo(
    () =>
      transcript.filter(
        (item) =>
          (tab === "All" || item.type === tab) &&
          `${item.name} ${item.text}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, tab, transcript],
  );

  if (sessionStatus === "loading" || (Boolean(sourceType) && detailsQuery.isPending)) return <CallDetailsSkeleton />;
  if (!sourceType || detailsQuery.isError || !details) return <main className="min-h-[calc(100vh-83px)] p-4"><div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-white p-6 text-center"><AlertCircle className="size-10 text-[#EF4444]"/><h2 className="mt-3 text-lg font-semibold">Call details could not be loaded</h2><p className="mt-1 text-sm text-[#8B93B8]">{!sourceType ? "sourceType is missing from the URL." : detailsQuery.error instanceof Error ? detailsQuery.error.message : "Please try again."}</p>{sourceType && <button onClick={() => void detailsQuery.refetch()} className="mt-5 flex h-10 items-center gap-2 rounded-lg bg-[#5B7FF0] px-5 text-sm text-white"><RefreshCw className="size-4"/>Try again</button>}</div></main>;

  return (
    <main className="min-h-[calc(100vh-83px)] p-4 text-[#0E1224]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/call-intelligence"
          className="inline-flex h-10 items-center gap-2 text-base font-medium"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-white">
            <ArrowLeft className="size-5" />
          </span>
          Return to Overview
        </Link>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-white px-4 text-sm font-medium">
            <Mail className="size-5" />
            Send Email
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#5B7FF0] px-4 text-sm font-medium text-white">
            <Download className="size-5" />
            Download Report
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl bg-white p-6">
            <div className="flex items-center gap-4">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#5B9CD5]/10">
                <Image
                  src="/call-intelligence/details/avatar-3.png"
                  alt="AI"
                  width={24}
                  height={24}
                  className="size-6 object-contain"
                />
              </span>
              <h2 className="flex-1 text-xl font-medium">Chat Summary</h2>
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#F4BE5E]/15 text-[#F59E0B]">
                <TriangleAlert className="size-5" />
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-justify text-base leading-[1.45] text-[#6B6B6B]">{details.analysis?.summary || "AI summary is not available for this call."}</p>
          </article>
          <article className="rounded-2xl bg-white p-6">
            <CardTitle>Meeting Transcript</CardTitle>
            <div className="mt-4 rounded-lg p-2 shadow-[0_0_4px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between border-b border-[#F5F7FF] pb-2">
                <div>
                  <p className="font-medium">Recorded Call Audio</p>
                  <p className="mt-2 text-xs text-[#6B6B6B]">
                    Recorded : {occurredAt ? new Date(occurredAt).toLocaleString() : "Not available"}
                  </p>
                </div>
                <p className="text-xs text-[#6B6B6B]">
                  <span className="text-[#0E1224]">{durationMinutes} min</span>
                </p>
              </div>
              <div className="mt-2 flex h-9 items-center gap-2 rounded-lg bg-[#F5F7FF] px-2">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="flex size-6 items-center justify-center rounded-full bg-[#5B7FF0]/10 text-[#5B7FF0]"
                >
                  <Play
                    className={`size-3 fill-current ${playing ? "animate-pulse" : ""}`}
                  />
                </button>
                <div className="flex flex-1 items-end gap-px">
                  {waveform.map((height, index) => (
                    <i
                      key={index}
                      style={{ height }}
                      className={`flex-1 rounded-sm ${index < 11 ? "bg-[#5B7FF0]" : "bg-[#D9D9D9]/40"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <label className="mt-4 flex h-11 items-center gap-2 rounded-lg border border-[#8B93B8]/10 px-3">
              <Search className="size-5 text-[#8B93B8]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
              <kbd className="rounded border border-[#8B93B8]/5 px-2 py-1 text-xs text-[#8B93B8]">
                ⌘K
              </kbd>
            </label>
            <div className="mt-4 flex overflow-x-auto rounded-[10px] bg-[#F5F7FF] p-1">
              {["All", "Objections", "Commitments", "Action Item"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setTab(item)}
                    className={`min-w-max flex-1 rounded-[10px] px-4 py-2 text-sm ${tab === item ? "bg-[#5B7FF0] text-white" : "text-[#8B93B8]"}`}
                  >
                    {item}<span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === item ? "bg-white/20 text-white" : "bg-white text-[#8B93B8]"}`}>{item === "All" ? transcript.length : transcript.filter((segment) => segment.type === item).length}</span>
                  </button>
                ),
              )}
            </div>
            <div className="mt-4 max-h-[250px] space-y-6 overflow-y-auto pr-2">
              {filteredTranscript.length === 0 ? <p className="rounded-lg bg-[#F5F7FF] p-4 text-center text-sm text-[#8B93B8]">No {tab === "All" ? "classified transcript segments" : tab.toLowerCase()} found.</p> : filteredTranscript.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.avatar}
                      alt=""
                      width={42}
                      height={42}
                      className="size-[42px] rounded-full object-cover"
                    />
                    <strong className="flex-1 text-sm font-medium">
                      {item.name}
                    </strong>
                    {item.type !== "All" && <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${item.type === "Commitments" ? "bg-[#10B981]/10 text-[#10B981]" : item.type === "Action Item" ? "bg-[#5B7FF0]/10 text-[#5B7FF0]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{item.type}</span>}
                    <span className="text-xs text-[#8B93B8]">{item.time}</span>
                  </div>
                  <p className="mt-3 text-sm text-[#6B6B6B]">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl bg-white p-6">
            <CardTitle>Sentiment analysis</CardTitle>
            <div className="mt-7 flex flex-col items-center justify-center gap-8 sm:flex-row lg:flex-col 2xl:flex-row">
              <div className="flex size-[170px] items-center justify-center rounded-full" style={{background:`conic-gradient(#10B981 0 ${positive}%, #F59E0B ${positive}% ${positive + neutral}%, #EF4444 ${positive + neutral}% 100%)`}}>
                <div className="flex size-[112px] flex-col items-center justify-center rounded-full bg-white">
                  <strong className="text-xl">{positive}%</strong>
                  <span className="text-xs">Positive</span>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <p>
                  <i className="mr-2 inline-block size-2 rounded-full bg-[#10B981]" />
                  Positive {positive}%
                </p>
                <p>
                  <i className="mr-2 inline-block size-2 rounded-full bg-[#F59E0B]" />
                  Neutral {neutral}%
                </p>
                <p>
                  <i className="mr-2 inline-block size-2 rounded-full bg-[#EF4444]" />
                  Negative {negative}%
                </p>
              </div>
            </div>
            <div className="mt-7 flex justify-between border-t border-[#E4EAF8] pt-4">
              <span>Confidence Score</span>
              <strong className="text-xl text-[#10B981]">{confidence}%</strong>
            </div>
          </article>
          <article className="rounded-xl bg-white p-6">
            <CardTitle>Revenue Impact</CardTitle>
            <div className="mt-4 space-y-2">
              {[
                ["Potential Upsell", "+$8,000", "text-[#10B981]"],
                ["Renewal Probability", "92%", "text-[#10B981]"],
                ["Churn Risk", "8%", "text-[#EF4444]"],
                ["Deal Stage", "Proposal Sent", "text-[#5B7FF0]"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="flex h-9 items-center rounded-lg bg-[#F5F7FF] px-2 text-sm"
                >
                  <i className="mr-2 h-5 w-1 rounded-full bg-[#10B981]" />
                  <span className="flex-1 text-[#8B93B8]">{label}</span>
                  <strong className={color}>{value}</strong>
                  <span className="ml-4 flex items-end gap-px">
                    {[3, 5, 4, 8, 6, 11].map((h, i) => (
                      <i
                        key={i}
                        style={{ height: h }}
                        className="w-1 bg-[#5B7FF0]/50"
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-xl bg-white p-6">
            <CardTitle>Clarification Questions</CardTitle>
            <div className="mt-4 space-y-2">
              {clarificationQuestions.length === 0 ? <p className="rounded-lg bg-[#F5F7FF] p-4 text-center text-sm text-[#8B93B8]">No clarification questions are required.</p> : clarificationQuestions.map((item, index) => (
                <div
                  key={`${item.proposalId}-${item.question.id || index}`}
                  className="flex items-start gap-3 rounded-lg bg-[#F5F7FF] p-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0] text-xs font-semibold text-white">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5 text-[#0E1224]">{item.question.question}</p>
                  </div>
                  <button type="button" disabled={item.answered} onClick={() => setSelectedClarification({ proposalId: item.proposalId, question: item.question })} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-[#5B7FF0] px-4 text-xs font-medium text-white transition-colors hover:bg-[#4E6FDE] disabled:cursor-not-allowed disabled:bg-[#10B981]/10 disabled:text-[#10B981]">
                    {item.answered && <Check className="size-3.5" />}{item.answered ? "Answered" : "Answer"}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl bg-white p-6">
            <h2 className="text-xl font-medium">Customer Intelligence</h2>
            <div className="mt-4 flex items-center gap-3">
              <Image
                src="/call-intelligence/details/avatar-2.png"
                alt="Call participant"
                width={42}
                height={42}
                className="size-[42px] rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{details.metadata.title || "Call intelligence source"}</p>
                <p className="mt-2 text-xs text-[#8B93B8]">{details.metadata.platform?.replaceAll("_", " ") || details.source.type.replaceAll("_", " ")}</p>
              </div>
              <span className="rounded-lg bg-[#10B981]/10 px-2 py-1 text-sm text-[#10B981]">
                {details.metadata.status?.replaceAll("_", " ") || "Available"}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ["Health Score", `${details.analysis?.customerIntelligence?.healthScore ?? 0}%`],
                ["Risk Level", details.analysis?.customerIntelligence?.riskLevel || "Not available"],
                ["Source Type", details.source.type.replaceAll("_", " ")],
                ["Duration", `${durationMinutes} min`],
                ["AI Bot", details.metadata.botName || "Not assigned"],
              ].map(([label, value], i) => (
                <div
                  key={`${label}-${i}`}
                  className="flex h-9 items-center justify-between rounded-lg bg-[#F5F7FF] px-2 text-sm"
                >
                  <span>{label}</span>
                  <span
                    className={
                      i < 2 ? "text-[#10B981]" : i === 4 ? "text-[#D24FC7]" : ""
                    }
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-2xl bg-white p-6">
            <h2 className="text-xl font-medium">Pattern Detecting</h2>
            <p className="mt-2 border-b border-[#E4EAF8] pb-4 text-xs text-[#8B93B8]">
              AI-detected conversation patterns
            </p>
            <div className="mt-4 space-y-4">
              {patterns.map(([label, value]) => (
                <div
                  key={label}
                  className="flex h-9 items-center rounded-lg bg-[#F5F7FF] pr-2 text-sm"
                >
                  <i className="mr-4 h-5 w-1 rounded-full bg-[#10B981]" />
                  <span className="flex-1">{label}</span>
                  <span className="text-[#5B7FF0]">{value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl bg-white p-6">
            <div className="flex items-center gap-2 border-b border-[#E4EAF8] pb-4">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#5B9CD5]/10 text-[#5B9CD5]">
                <SquareCheckBig className="size-5" />
              </span>
              <h2 className="text-xl font-medium">Priority task</h2>
            </div>
            <div className="mt-4 space-y-2">
              {priorityTasks.map(([proposalId, title, date, risk, style, status]) => (
                <div
                  key={proposalId}
                  className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2"
                >
                  <i className="mr-2 h-10 w-1 rounded-full bg-[#D24FC7]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{title}</p>
                    <p className="mt-1 text-xs text-[#8B93B8]">{date}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${style}`}>
                    {risk}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${status === "COMPLETED" || status === "APPROVED" ? "bg-[#10B981]/10 text-[#10B981]" : status === "REJECTED" || status === "FAILED" ? "bg-[#EF4444]/10 text-[#EF4444]" : status === "IN_PROGRESS" ? "bg-[#5B7FF0]/10 text-[#5B7FF0]" : "bg-[#F59E0B]/15 text-[#F59E0B]"}`}>
                    {status.replaceAll("_", " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProposalId(proposalId)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-[#5B7FF0] px-3 text-xs font-medium text-white transition-colors hover:bg-[#4A6EE0]"
                  >
                    <Eye className="size-3.5" /> View Details
                  </button>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-2xl bg-white p-6">
            <div className="flex items-center gap-2 border-b border-[#E4EAF8] pb-4">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#10B981]/10 text-[#10B981]">
                <CalendarCheck2 className="size-5" />
              </span>
              <h2 className="text-xl font-medium">Meeting Schedule</h2>
            </div>
            <div className="mt-4 space-y-2">
              {schedule.map(([proposalId, title, date, status]) => (
                <div
                  key={proposalId}
                  className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F5F7FF] py-2 pr-2"
                >
                  <i className="mr-2 h-10 w-1 rounded-full bg-[#10B981]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{title}</p>
                    <p className="mt-1 text-xs text-[#8B93B8]">{date}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${status === "APPROVED" ? "bg-[#10B981]/10 text-[#10B981]" : status === "REJECTED" || status === "FAILED" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/15 text-[#F59E0B]"}`}>{status.replaceAll("_", " ")}</span>
                  <button type="button" onClick={() => setSelectedProposalId(proposalId)} className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-[#5B7FF0] px-3 text-xs font-medium text-white transition-colors hover:bg-[#4A6EE0]"><Eye className="size-3.5" /> View Details</button>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
      <PriorityTaskDetailsModal
        proposalId={selectedProposalId}
        open={Boolean(selectedProposalId)}
        onOpenChange={(open) => !open && setSelectedProposalId(null)}
      />
      <ClarificationAnswerModal
        open={Boolean(selectedClarification)}
        proposalId={selectedClarification?.proposalId || null}
        question={selectedClarification?.question || null}
        onOpenChange={(open) => !open && setSelectedClarification(null)}
      />
    </main>
  );
}

export default function CallDetailsPage() {
  return (
    <Suspense fallback={<CallDetailsSkeleton />}>
      <CallDetailsContent />
    </Suspense>
  );
}

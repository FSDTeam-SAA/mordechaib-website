"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarCheck2,
  Check,
  Download,
  Mail,
  Play,
  Pause,
  Search,
  SquareCheckBig,
  TriangleAlert,
  AlertCircle,
  RefreshCw,
  Eye,
  Loader2,
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
    <h2 className="border-b border-[#E4EAF8] pb-3.5 text-[1.1875rem]/[1.75rem] font-medium text-[#0E1224]">
      {children}
    </h2>
  );
}

function buildPlaybackUrl(playbackPath: string): string {
  if (!playbackPath) return "";
  if (/^https?:\/\//i.test(playbackPath)) return playbackPath;
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
  try {
    const parsed = new URL(apiUrl);
    const apiPrefix = parsed.pathname.replace(/\/+$/, "");
    const normalized = playbackPath.startsWith("/") ? playbackPath : `/${playbackPath}`;
    if (apiPrefix && normalized.startsWith(apiPrefix)) {
      return `${parsed.origin}${normalized}`;
    }
    return `${parsed.origin}${apiPrefix}${normalized}`;
  } catch {
    const origin = apiUrl.replace(/\/api\/v1\/?$/, "");
    return `${origin}${playbackPath.startsWith("/") ? "" : "/"}${playbackPath}`;
  }
}

function formatAudioTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackExpiresAt, setPlaybackExpiresAt] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, []);

  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
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

  const isMeeting = Boolean(
    sourceType === "ZOOM_MEETING" ||
    sourceType === "GOOGLE_MEET" ||
    details?.source?.type === "ZOOM_MEETING" ||
    details?.source?.type === "GOOGLE_MEET" ||
    details?.metadata?.kind?.toUpperCase() === "MEETING" ||
    details?.metadata?.platform?.toUpperCase() === "ZOOM" ||
    details?.metadata?.platform?.toUpperCase() === "GOOGLE_MEET"
  );

  const isAudioCall = !isMeeting && Boolean(
    sourceType === "CALL_AUDIO" ||
    sourceType === "CALL_TRANSCRIPT" ||
    details?.source?.type === "CALL_AUDIO" ||
    details?.source?.type === "CALL_TRANSCRIPT" ||
    details?.metadata?.kind?.toUpperCase() === "CALL" ||
    Boolean(details?.audio?.available)
  );

  const totalAudioDuration =
    audioDuration || (details?.metadata.durationSeconds ?? (durationMinutes * 60));

  const progressRatio =
    totalAudioDuration > 0
      ? Math.min(1, Math.max(0, currentTime / totalAudioDuration))
      : 0;

  const activeBarCount = Math.floor(progressRatio * waveform.length);

  const handleTogglePlay = async () => {
    try {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        return;
      }

      let url = playbackUrl;
      const isExpired = playbackExpiresAt
        ? Date.now() >= playbackExpiresAt - 10000
        : true;

      if (!url || isExpired) {
        if (!accessToken || !sourceId || !sourceType) {
          toast.error("Call information is missing.");
          return;
        }
        setIsLoadingAudio(true);
        const query = new URLSearchParams({ sourceType });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/${encodeURIComponent(sourceId)}/audio/playback?${query}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          message?: string | string[];
          data?: { playbackPath: string; expiresAt?: string };
        };

        if (!res.ok || !data.success || !data.data?.playbackPath) {
          const msg = Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to load audio playback URL.";
          throw new Error(msg);
        }

        url = buildPlaybackUrl(data.data.playbackPath);
        const expTime = data.data.expiresAt
          ? new Date(data.data.expiresAt).getTime()
          : Date.now() + 15 * 60 * 1000;
        setPlaybackUrl(url);
        setPlaybackExpiresAt(expTime);
      }

      if (audioRef.current) {
        if (audioRef.current.src !== url) {
          audioRef.current.src = url;
          audioRef.current.load();
        }
        await audioRef.current.play();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to play call audio.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleWaveformClick = (index: number) => {
    if (!totalAudioDuration) return;
    const ratio = (index + 0.5) / waveform.length;
    const targetTime = ratio * totalAudioDuration;
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      if (!isPlaying) {
        void handleTogglePlay();
      }
    }
  };

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

  const revenueImpactItems = useMemo(() => {
    const crm = details?.extensions?.crm;
    const revenue = crm?.revenue;
    const commercial = crm?.commercial;
    const isRevenueAvailable = revenue?.availability === "AVAILABLE";

    if (!isRevenueAvailable) {
      return [
        ["Potential Upsell", "$0", "text-[#10B981]"],
        ["Renewal Probability", "0%", "text-[#10B981]"],
        ["Churn Risk", "0%", "text-[#EF4444]"],
        ["Deal Stage", "0", "text-[#5B7FF0]"],
      ] as const;
    }

    // 1. Potential Upsell / Deal Value
    const rawUpsell =
      (commercial?.expansionPotential?.availability === "AVAILABLE" &&
      typeof commercial?.expansionPotential?.value === "number"
        ? commercial.expansionPotential.value
        : null) ??
      (typeof revenue?.value === "number"
        ? revenue.value
        : typeof commercial?.dealValue?.value === "number"
          ? commercial.dealValue.value
          : revenue?.breakdown?.[0]?.value);

    let upsellValue = "$0";
    if (typeof rawUpsell === "number" && !Number.isNaN(rawUpsell)) {
      if (rawUpsell > 0) {
        upsellValue = `+$${rawUpsell.toLocaleString()}`;
      } else if (rawUpsell === 0) {
        upsellValue = "$0";
      } else {
        upsellValue = `-$${Math.abs(rawUpsell).toLocaleString()}`;
      }
    }

    // 2. Renewal Probability / Close Probability
    const probAvail = commercial?.closeProbability?.availability;
    const rawProbability =
      (probAvail === "AVAILABLE" || probAvail === "PARTIAL") &&
      typeof commercial?.closeProbability?.value === "number"
        ? commercial.closeProbability.value
        : typeof revenue?.probability === "number"
          ? revenue.probability
          : typeof revenue?.closeProbability?.value === "number"
            ? revenue.closeProbability.value
            : null;

    let probabilityValue = "0%";
    if (typeof rawProbability === "number" && !Number.isNaN(rawProbability)) {
      probabilityValue = `${Math.round(rawProbability)}%`;
    }

    // 3. Churn Risk
    let churnRiskValue = "0%";
    if (typeof commercial?.churnRisk === "number") {
      churnRiskValue = `${Math.round(commercial.churnRisk)}%`;
    } else if (typeof revenue?.churnRisk === "number") {
      churnRiskValue = `${Math.round(revenue.churnRisk)}%`;
    } else if (
      typeof details?.analysis?.customerIntelligence?.healthScore === "number"
    ) {
      const churn = Math.max(
        0,
        Math.min(
          100,
          100 - Math.round(details.analysis.customerIntelligence.healthScore),
        ),
      );
      churnRiskValue = `${churn}%`;
    }

    // 4. Deal Stage
    const stage =
      commercial?.dealStage ||
      commercial?.stage ||
      revenue?.dealStage ||
      revenue?.stage ||
      (crm as Record<string, unknown> | undefined)?.dealStage ||
      (crm as Record<string, unknown> | undefined)?.stage ||
      (details?.metadata as Record<string, unknown> | undefined)?.dealStage ||
      (details?.metadata as Record<string, unknown> | undefined)?.stage ||
      ((crm?.linkedDealCount ?? 0) > 0 ? "Open" : null);

    const dealStageValue = stage && typeof stage === "string" ? stage : "0";

    return [
      ["Potential Upsell", upsellValue, "text-[#10B981]"],
      ["Renewal Probability", probabilityValue, "text-[#10B981]"],
      ["Churn Risk", churnRiskValue, "text-[#EF4444]"],
      ["Deal Stage", dealStageValue, "text-[#5B7FF0]"],
    ] as const;
  }, [details]);

  const downloadReport = async () => {
    const reportSourceId = details?.source.id;
    if (!reportSourceId || !sourceType || !accessToken || isDownloadingReport) {
      if (!accessToken) toast.error("Your session is missing. Please sign in again.");
      else if (!reportSourceId) toast.error("Report source ID is missing.");
      else if (!sourceType) toast.error("Report source type is missing.");
      return;
    }

    setIsDownloadingReport(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/${encodeURIComponent(reportSourceId)}/report?${new URLSearchParams({ sourceType })}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { message?: string | string[] };
        const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
        throw new Error(message || "Unable to download the report.");
      }

      const report = await response.blob();
      if (!report.size) throw new Error("The downloaded report is empty.");

      const disposition = response.headers.get("content-disposition");
      const encodedFilename = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const plainFilename = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
      const filename = encodedFilename
        ? decodeURIComponent(encodedFilename)
        : plainFilename || `call-report-${reportSourceId}.pdf`;
      const downloadUrl = URL.createObjectURL(report);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      toast.success("Report downloaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download the report.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  if (sessionStatus === "loading" || (Boolean(sourceType) && detailsQuery.isPending)) return <CallDetailsSkeleton />;
  if (!sourceType || detailsQuery.isError || !details) return <main className="min-h-[calc(100vh-83px)] min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5"><div className="flex min-h-56 flex-col items-center justify-center min-w-0 rounded-xl bg-white p-3 sm:p-4 text-center"><AlertCircle className="size-10 text-[#EF4444]"/><h2 className="mt-2.5 text-[1.0625rem]/[1.75rem] font-semibold">Call details could not be loaded</h2><p className="mt-1 text-sm text-[#8B93B8]">{!sourceType ? "sourceType is missing from the URL." : detailsQuery.error instanceof Error ? detailsQuery.error.message : "Please try again."}</p>{sourceType && <button onClick={() => void detailsQuery.refetch()} className="mt-[1.125rem] flex h-10 items-center gap-2 rounded-lg bg-[#5B7FF0] px-[1.125rem] text-sm text-white"><RefreshCw className="size-4"/>Try again</button>}</div></main>;

  return (
    <main className="min-h-[calc(100vh-83px)] min-w-0 p-2.5 pb-7 sm:p-3.5 sm:pb-9 lg:px-5 lg:pt-5 text-[#0E1224]">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/call-intelligence"
          className="inline-flex h-10 items-center gap-2 text-[0.9375rem]/[1.5rem] font-medium"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-white">
            <ArrowLeft className="size-5" />
          </span>
          Return to Overview
        </Link>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-white px-3.5 text-sm font-medium">
            <Mail className="size-5" />
            Send Email
          </button>
          <button
            type="button"
            onClick={() => void downloadReport()}
            disabled={isDownloadingReport}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#5B7FF0] px-3.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloadingReport ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}
            {isDownloadingReport ? "Downloading..." : "Download Report"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="min-w-0 rounded-2xl bg-white p-3 sm:p-4">
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
              <h2 className="flex-1 text-[1.1875rem]/[1.75rem] font-medium">Chat Summary</h2>
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#F4BE5E]/15 text-[#F59E0B]">
                <TriangleAlert className="size-5" />
              </span>
            </div>
            <p className="mt-3.5 whitespace-pre-wrap text-justify text-[0.9375rem]/[1.5rem] leading-[1.45] text-[#6B6B6B]">{details.analysis?.summary || "AI summary is not available for this call."}</p>
          </article>
          <article className="min-w-0 rounded-2xl bg-white p-3 sm:p-4">
            <CardTitle>{isMeeting ? "Meeting Transcript" : "Call Transcript"}</CardTitle>
            {isAudioCall && (
              <div className="mt-3.5 rounded-lg p-2.5 shadow-[0_0_4px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between border-b border-[#F5F7FF] pb-2">
                  <div>
                    <p className="font-medium text-[#0E1224]">Recorded Call Audio</p>
                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      Recorded : {occurredAt ? new Date(occurredAt).toLocaleString() : "Not available"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#0E1224] tabular-nums">
                      {formatAudioTime(currentTime)} / {formatAudioTime(totalAudioDuration)}
                    </p>
                    <p className="mt-1 text-[11px] text-[#8B93B8]">
                      {isLoadingAudio
                        ? "Loading audio..."
                        : isPlaying
                          ? "Playing"
                          : currentTime > 0
                            ? "Paused"
                            : `${durationMinutes} min`}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex h-10 items-center gap-2.5 rounded-lg bg-[#F5F7FF] px-2.5">
                  <button
                    type="button"
                    onClick={() => void handleTogglePlay()}
                    disabled={isLoadingAudio}
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0]/10 text-[#5B7FF0] transition hover:bg-[#5B7FF0] hover:text-white disabled:opacity-60"
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="size-3.5 fill-current" />
                    ) : (
                      <Play className="size-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                  <div className="flex flex-1 items-end gap-0.5 h-6 py-0.5 cursor-pointer">
                    {waveform.map((height, index) => {
                      const isActive =
                        index <= activeBarCount && (currentTime > 0 || isPlaying);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleWaveformClick(index)}
                          style={{ height }}
                          aria-label={`Seek to ${Math.round(((index + 1) / waveform.length) * 100)}%`}
                          className={`flex-1 rounded-sm transition-colors hover:bg-[#5B7FF0] cursor-pointer ${
                            isActive ? "bg-[#5B7FF0]" : "bg-[#D9D9D9]/50"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  preload="none"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setCurrentTime(audioRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current && audioRef.current.duration) {
                      setAudioDuration(audioRef.current.duration);
                    }
                  }}
                  onError={() => {
                    setIsPlaying(false);
                    setIsLoadingAudio(false);
                  }}
                  className="hidden"
                />
              </div>
            )}
            <label className="mt-3.5 flex h-11 items-center gap-2 rounded-lg border border-[#8B93B8]/10 px-2.5">
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
            <div className="mt-3.5 flex overflow-x-auto rounded-[10px] bg-[#F5F7FF] p-1">
              {["All", "Objections", "Commitments", "Action Item"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setTab(item)}
                    className={`min-w-max flex-1 rounded-[10px] px-3.5 py-2 text-sm ${tab === item ? "bg-[#5B7FF0] text-white" : "text-[#8B93B8]"}`}
                  >
                    {item}<span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === item ? "bg-white/20 text-white" : "bg-white text-[#8B93B8]"}`}>{item === "All" ? transcript.length : transcript.filter((segment) => segment.type === item).length}</span>
                  </button>
                ),
              )}
            </div>
            <div className="mt-3.5 max-h-[250px] space-y-6 overflow-y-auto pr-2">
              {filteredTranscript.length === 0 ? <p className="rounded-lg bg-[#F5F7FF] p-3.5 text-center text-sm text-[#8B93B8]">No {tab === "All" ? "classified transcript segments" : tab.toLowerCase()} found.</p> : filteredTranscript.map((item) => (
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
                  <p className="mt-2.5 text-sm text-[#6B6B6B]">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-3 xl:grid-cols-3">
          <article className="min-w-0 rounded-xl bg-white p-3 sm:p-4">
            <CardTitle>Sentiment analysis</CardTitle>
            <div className="mt-6 flex flex-col items-center justify-center gap-8 sm:flex-row lg:flex-col 2xl:flex-row">
              <div className="flex size-[170px] items-center justify-center rounded-full" style={{background:`conic-gradient(#10B981 0 ${positive}%, #F59E0B ${positive}% ${positive + neutral}%, #EF4444 ${positive + neutral}% 100%)`}}>
                <div className="flex size-[112px] flex-col items-center justify-center rounded-full bg-white">
                  <strong className="text-[1.1875rem]/[1.75rem]">{positive}%</strong>
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
            <div className="mt-6 flex justify-between border-t border-[#E4EAF8] pt-3.5">
              <span>Confidence Score</span>
              <strong className="text-[1.1875rem]/[1.75rem] text-[#10B981]">{confidence}%</strong>
            </div>
          </article>
          <article className="min-w-0 rounded-xl bg-white p-3 sm:p-4">
            <CardTitle>Revenue Impact</CardTitle>
            <div className="mt-3.5 space-y-2">
              {revenueImpactItems.map(([label, value, color]) => (
                <div
                  key={label}
                  className="flex h-9 items-center rounded-lg bg-[#F5F7FF] px-2 text-sm"
                >
                  <i className="mr-2 h-5 w-1 rounded-full bg-[#10B981]" />
                  <span className="flex-1 text-[#8B93B8]">{label}</span>
                  <strong className={color}>{value}</strong>
                  <span className="ml-3.5 flex items-end gap-px">
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
          <article className="min-w-0 rounded-xl bg-white p-3 sm:p-4">
            <CardTitle>Clarification Questions</CardTitle>
            <div className="mt-3.5 space-y-2">
              {clarificationQuestions.length === 0 ? <p className="rounded-lg bg-[#F5F7FF] p-3.5 text-center text-sm text-[#8B93B8]">No clarification questions are required.</p> : clarificationQuestions.map((item, index) => (
                <div
                  key={`${item.proposalId}-${item.question.id || index}`}
                  className="flex items-start gap-3 rounded-lg bg-[#F5F7FF] p-2.5"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0] text-xs font-semibold text-white">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5 text-[#0E1224]">{item.question.question}</p>
                  </div>
                  <button type="button" disabled={item.answered} onClick={() => setSelectedClarification({ proposalId: item.proposalId, question: item.question })} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-[#5B7FF0] px-3.5 text-xs font-medium text-white transition-colors hover:bg-[#4E6FDE] disabled:cursor-not-allowed disabled:bg-[#10B981]/10 disabled:text-[#10B981]">
                    {item.answered && <Check className="size-3.5" />}{item.answered ? "Answered" : "Answer"}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="min-w-0 rounded-2xl bg-white p-3 sm:p-4">
            <h2 className="text-[1.1875rem]/[1.75rem] font-medium">Customer Intelligence</h2>
            <div className="mt-3.5 flex items-center gap-3">
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
            <div className="mt-3.5 space-y-2">
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
          <article className="min-w-0 rounded-2xl bg-white p-3 sm:p-4">
            <h2 className="text-[1.1875rem]/[1.75rem] font-medium">Pattern Detecting</h2>
            <p className="mt-2 border-b border-[#E4EAF8] pb-3.5 text-xs text-[#8B93B8]">
              AI-detected conversation patterns
            </p>
            <div className="mt-3.5 space-y-4">
              {patterns.map(([label, value]) => (
                <div
                  key={label}
                  className="flex h-9 items-center rounded-lg bg-[#F5F7FF] pr-2 text-sm"
                >
                  <i className="mr-3.5 h-5 w-1 rounded-full bg-[#10B981]" />
                  <span className="flex-1">{label}</span>
                  <span className="text-[#5B7FF0]">{value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="min-w-0 rounded-2xl bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-[#E4EAF8] pb-3.5">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#5B9CD5]/10 text-[#5B9CD5]">
                <SquareCheckBig className="size-5" />
              </span>
              <h2 className="text-[1.1875rem]/[1.75rem] font-medium">Priority task</h2>
            </div>
            <div className="mt-3.5 space-y-2">
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
                    className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-[#5B7FF0] px-2.5 text-xs font-medium text-white transition-colors hover:bg-[#4A6EE0]"
                  >
                    <Eye className="size-3.5" /> View Details
                  </button>
                </div>
              ))}
            </div>
          </article>
          <article className="min-w-0 rounded-2xl bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-[#E4EAF8] pb-3.5">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#10B981]/10 text-[#10B981]">
                <CalendarCheck2 className="size-5" />
              </span>
              <h2 className="text-[1.1875rem]/[1.75rem] font-medium">Meeting Schedule</h2>
            </div>
            <div className="mt-3.5 space-y-2">
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
                  <button type="button" onClick={() => setSelectedProposalId(proposalId)} className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-[#5B7FF0] px-2.5 text-xs font-medium text-white transition-colors hover:bg-[#4A6EE0]"><Eye className="size-3.5" /> View Details</button>
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

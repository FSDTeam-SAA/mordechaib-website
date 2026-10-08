export type CallRecord = {
  source: { type: string; id: string };
  sourceId: string;
  kind: string;
  title: string;
  platform: string;
  status: string;
  occurredAt: string;
  durationSeconds: number;
  botName?: string;
  transcriptAvailable: boolean;
  audioAvailable: boolean;
  createdAt: string;
  detailsPath: string;
};

export type CallMetric = {
  value: string;
  label: string;
  icon: string;
  chart: string;
  iconBackground: string;
};

export type CallDetailsSourceType =
  | "CALL_AUDIO"
  | "CALL_TRANSCRIPT"
  | "ZOOM_MEETING"
  | "GOOGLE_MEET";

export function getCallDetailsSourceType(
  kind: string,
  sourceType: string,
): CallDetailsSourceType | "" {
  const normalizedKind = kind.trim().toUpperCase();
  const normalizedSource = sourceType.trim().toUpperCase();
  if (normalizedKind === "CALL") return "CALL_TRANSCRIPT";
  if (["CALL", "TWILIO"].includes(normalizedSource)) return "CALL_TRANSCRIPT";
  if (normalizedSource === "CALL_AUDIO") return "CALL_AUDIO";
  if (normalizedSource === "CALL_TRANSCRIPT") return "CALL_TRANSCRIPT";
  if (normalizedSource === "ZOOM_MEETING" || normalizedSource === "ZOOM")
    return "ZOOM_MEETING";
  if (["GOOGLE_MEET", "GOOGLE_MEETING", "GOOGLE"].includes(normalizedSource))
    return "GOOGLE_MEET";
  return "";
}

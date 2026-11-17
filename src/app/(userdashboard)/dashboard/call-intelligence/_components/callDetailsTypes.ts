export type TranscriptSegment = { id?: string; speaker?: string; text?: string; startTimeSeconds?: number; endTimeSeconds?: number; category?: string; confidence?: number };
export type ClarificationQuestion = { id?: string; field?: string; question: string; inputType?: string; required?: boolean };
export type ActionItem = { id: string; title?: string; description?: string; priority?: string; dueDate?: string; startsAt?: string; durationMinutes?: number; status?: string; platform?: string; clarificationQuestions?: ClarificationQuestion[]; clarificationAnswers?: Record<string, string> };

export type CrmRevenueData = {
  availability?: "AVAILABLE" | "UNAVAILABLE";
  aggregateAvailable?: boolean;
  value?: number | null;
  currency?: string | null;
  dealCount?: number;
  breakdown?: Array<{ currency: string; value: number; dealCount: number }>;
  semantic?: string;
  attribution?: string;
  attributedToSource?: boolean;
  reason?: string | null;
  probability?: number | null;
  closeProbability?: {
    availability?: "AVAILABLE" | "PARTIAL" | "UNAVAILABLE";
    value?: number | null;
  };
  churnRisk?: number | null;
  stage?: string | null;
  dealStage?: string | null;
};

export type CrmCommercialData = {
  dealValue?: {
    availability?: "AVAILABLE" | "UNAVAILABLE";
    aggregateAvailable?: boolean;
    value?: number | null;
    currency?: string | null;
    dealCount?: number;
    breakdown?: Array<{ currency: string; value: number; dealCount: number }>;
    reason?: string | null;
  };
  closeProbability?: {
    availability?: "AVAILABLE" | "PARTIAL" | "UNAVAILABLE";
    value?: number | null;
    unit?: string;
    coverage?: { withProbability: number; totalDeals: number };
    source?: string;
    reason?: string | null;
  };
  expectedClose?: {
    availability?: "AVAILABLE" | "UNAVAILABLE";
    value?: string | null;
    dealId?: string;
    source?: string;
    reason?: string | null;
  };
  expansionPotential?: {
    availability?: "AVAILABLE" | "UNAVAILABLE";
    value?: number | null;
    reason?: string | null;
  };
  lifetimeValue?: {
    availability?: "AVAILABLE" | "UNAVAILABLE";
    value?: number | null;
    currency?: string | null;
    reason?: string | null;
  };
  churnRisk?: number | null;
  dealStage?: string | null;
  stage?: string | null;
};

export type CrmExtension = {
  availability?: "AVAILABLE" | "UNAVAILABLE";
  reason?: string | null;
  customer?: {
    id?: string;
    name?: string;
    company?: string | null;
  } | null;
  resolution?: string | null;
  linkedDealCount?: number;
  revenue?: CrmRevenueData;
  commercial?: CrmCommercialData | null;
};

export type CallDetails = {
  source: { type: string; id: string };
  metadata: { kind?: string; platform?: string; status?: string; title?: string; occurredAt?: string; startsAt?: string; durationSeconds?: number; durationMinutes?: number; botName?: string };
  audio: { available?: boolean; downloadPath?: string | null };
  transcript: { available?: boolean; included?: boolean; text?: string; segments?: TranscriptSegment[] };
  analysis: null | { summary?: string; overallConfidence?: number; sentimentAnalysis?: { score?: { positive?: number; neutral?: number; negative?: number } }; customerIntelligence?: { healthScore?: number; riskLevel?: string }; patternDetection?: Record<string, number | undefined>; classifiedSegments?: TranscriptSegment[] };
  actions: { priorityTasks?: ActionItem[]; meetingSchedules?: ActionItem[] };
  extensions?: { crm?: CrmExtension };
};

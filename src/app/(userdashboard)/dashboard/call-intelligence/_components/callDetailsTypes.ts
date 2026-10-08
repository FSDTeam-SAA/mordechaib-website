export type TranscriptSegment = { id?: string; speaker?: string; text?: string; startTimeSeconds?: number; endTimeSeconds?: number; category?: string; confidence?: number };
export type ClarificationQuestion = { id?: string; field?: string; question: string; inputType?: string; required?: boolean };
export type ActionItem = { id: string; title?: string; description?: string; priority?: string; dueDate?: string; startsAt?: string; durationMinutes?: number; status?: string; platform?: string; clarificationQuestions?: ClarificationQuestion[]; clarificationAnswers?: Record<string, string> };
export type CallDetails = {
  source: { type: string; id: string };
  metadata: { kind?: string; platform?: string; status?: string; title?: string; occurredAt?: string; startsAt?: string; durationSeconds?: number; durationMinutes?: number; botName?: string };
  audio: { available?: boolean; downloadPath?: string | null };
  transcript: { available?: boolean; included?: boolean; text?: string; segments?: TranscriptSegment[] };
  analysis: null | { summary?: string; overallConfidence?: number; sentimentAnalysis?: { score?: { positive?: number; neutral?: number; negative?: number } }; customerIntelligence?: { healthScore?: number; riskLevel?: string }; patternDetection?: Record<string, number | undefined>; classifiedSegments?: TranscriptSegment[] };
  actions: { priorityTasks?: ActionItem[]; meetingSchedules?: ActionItem[] };
  extensions?: { crm?: unknown };
};

export type DiagnosticChoice = { label: string; text: string; points: number };
export type DiagnosticQuestion = { id: string; title: string; description?: string; order: number; choices: DiagnosticChoice[] };
export type DiagnosticCategory = { id: string; title: string; order: number; questions: DiagnosticQuestion[] };
export type Questionnaire = { categories: DiagnosticCategory[]; totalQuestions: number };
export type AssessmentAnswer = { questionId: string; categoryId: string; categoryTitle?: string | null; questionTitle?: string | null; questionDescription?: string | null; selectedChoiceLabel: string; selectedChoiceText?: string | null; pointsAwarded: number; allChoices: DiagnosticChoice[] };
export type AssessmentResult = { id: string; totalScore: number; maxPossibleScore: number; questionsAnswered: number; totalQuestions: number; completedAt?: string; createdAt?: string; status: "completed" | "in_progress"; answersByCategory: Array<{ categoryId: string; categoryTitle?: string | null; answers: AssessmentAnswer[] }> };
export type AssessmentHistoryItem = { _id: string; totalScore: number; maxPossibleScore: number; questionsAnswered: number; totalQuestions: number; completedAt?: string; createdAt?: string; status: "completed" | "in_progress" };
export type AssessmentHistory = { items: AssessmentHistoryItem[]; total: number; page: number; limit: number; pages: number };

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

async function request<T>(path: string, accessToken: string, init?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("The backend API URL is not configured.");
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${accessToken}`, ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || payload.success === false || !payload.data) throw new Error(payload.message || "Unable to complete the diagnostic request.");
  return payload.data;
}

export const getQuestionnaire = (accessToken: string) => request<Questionnaire>("/diagnostic/questions", accessToken);
export const submitAssessment = (accessToken: string, answers: Array<{ questionId: string; selectedChoiceLabel: string }>) => request("/diagnostic/assessments", accessToken, { method: "POST", body: JSON.stringify({ answers }) });
export const getLatestAssessment = (accessToken: string) => request<AssessmentResult>("/diagnostic/assessments/latest", accessToken);
export const getAssessmentHistory = (accessToken: string) => request<AssessmentHistory>("/diagnostic/assessments?page=1&limit=10", accessToken);
export const getAssessmentDetail = (accessToken: string, id: string) => request<AssessmentResult>(`/diagnostic/assessments/${encodeURIComponent(id)}`, accessToken);

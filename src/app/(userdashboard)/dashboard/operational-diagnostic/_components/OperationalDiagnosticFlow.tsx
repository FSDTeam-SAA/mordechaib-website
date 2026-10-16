"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCheck, Eye, Loader2, Play, RotateCcw, X } from "lucide-react";
import { getAssessmentDetail, getAssessmentHistory, getLatestAssessment, getQuestionnaire, submitAssessment, type AssessmentHistory, type AssessmentResult, type DiagnosticCategory, type DiagnosticQuestion, type Questionnaire } from "./diagnostic-api";

type Stage = "intro" | "question" | "complete" | "result" | "detail" | null;
type Step = { category: DiagnosticCategory; question: DiagnosticQuestion };

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—";
const formatTime = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—";

export default function OperationalDiagnosticFlow() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [detail, setDetail] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentHistory | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = session?.user.accessToken;
  const steps = useMemo<Step[]>(() => questionnaire?.categories.slice().sort((a, b) => a.order - b.order).flatMap(category => category.questions.slice().sort((a, b) => a.order - b.order).map(question => ({ category, question }))) ?? [], [questionnaire]);
  const current = steps[index];
  const close = () => { if (!loading) { setStage(null); setError(""); } };
  const failWithoutToken = () => { setError("Your session is missing. Please sign in again."); return true; };
  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true); setHistoryError("");
    try { setHistory(await getAssessmentHistory(token)); }
    catch (err) { setHistoryError(err instanceof Error ? err.message : "Unable to load diagnostic history."); }
    finally { setHistoryLoading(false); }
  }, [token]);
  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const start = async () => {
    if (!token) return failWithoutToken();
    setError(""); setLoading(true);
    try { const data = await getQuestionnaire(token); if (!data.totalQuestions) throw new Error("There are no active diagnostic questions yet."); setQuestionnaire(data); setAnswers({}); setIndex(0); setStage("question"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to start the diagnostic."); }
    finally { setLoading(false); }
  };
  const next = async () => {
    if (!current || !answers[current.question.id]) return;
    if (index < steps.length - 1) { setIndex(value => value + 1); return; }
    if (!token) return failWithoutToken();
    setError(""); setLoading(true);
    try { await submitAssessment(token, steps.map(({ question }) => ({ questionId: question.id, selectedChoiceLabel: answers[question.id] }))); setStage("complete"); void loadHistory(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to submit your assessment."); }
    finally { setLoading(false); }
  };
  const viewResults = async () => {
    if (!token) return failWithoutToken();
    setError(""); setLoading(true);
    try { setResult(await getLatestAssessment(token)); setStage("result"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load your assessment result."); }
    finally { setLoading(false); }
  };
  const viewDetail = async (id: string) => {
    if (!token) return failWithoutToken();
    setDetail(null); setError(""); setStage("detail"); setLoading(true);
    try { setDetail(await getAssessmentDetail(token, id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load assessment details."); }
    finally { setLoading(false); }
  };
  const restart = () => { setQuestionnaire(null); setAnswers({}); setIndex(0); setResult(null); setError(""); setStage("intro"); };

  return <section className="min-h-[calc(100dvh-83px)] bg-[#F5F7FF] p-4 sm:p-6"><div className="w-full"><div className="rounded-2xl border border-[#E4EAF8] bg-white p-6 shadow-[0_4px_20px_rgba(27,39,94,0.05)] sm:p-8"><span className="inline-flex size-12 items-center justify-center rounded-xl bg-[#5B7FF0]/10 text-[#5B7FF0]"><ClipboardCheck className="size-6" /></span><h2 className="mt-5 text-2xl font-semibold text-[#0E1224]">Operational Diagnostic</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#64748B]">Assess the strength of your operations, discover opportunities for improvement, and receive a clear scorecard for your organization.</p><button type="button" onClick={() => { setError(""); setStage("intro"); }} className="mt-7 inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#5B7FF0] px-5 text-sm font-semibold text-white hover:bg-[#4B6DE0]"><Play className="size-4 fill-current" /> Start Diagnostic</button></div><History history={history} loading={historyLoading} error={historyError} onRetry={() => void loadHistory()} onView={id => void viewDetail(id)} /></div>{stage && <Modal onClose={close}>{stage === "intro" && <Intro loading={loading} error={error} onStart={() => void start()} />}{stage === "question" && current && <Question step={current} index={index} total={steps.length} selected={answers[current.question.id]} loading={loading} error={error} onSelect={label => setAnswers(value => ({ ...value, [current.question.id]: label }))} onBack={() => setIndex(value => Math.max(0, value - 1))} onNext={() => void next()} />}{stage === "complete" && <Complete loading={loading} error={error} onBack={close} onView={() => void viewResults()} />}{stage === "result" && result && <Result result={result} onDashboard={() => router.push("/dashboard")} onRestart={restart} />}{stage === "detail" && <AssessmentDetail detail={detail} loading={loading} error={error} />}</Modal>}</section>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#11182B]/25 p-4 backdrop-blur-[5px]" role="dialog" aria-modal="true"><div className="relative max-h-[calc(100dvh-32px)] w-full max-w-[680px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><button type="button" onClick={onClose} aria-label="Close diagnostic" className="absolute right-4 top-4 rounded-md p-1 text-[#8B93B8] hover:bg-[#F5F7FF]"><X className="size-4" /></button>{children}</div></div>; }
function Brand() { return <Image src="/logo2.png" alt="Noltra.ai" width={82} height={20} className="h-5 w-auto" priority />; }
function Message({ error }: { error: string }) { return error ? <p role="alert" className="mt-4 text-sm text-[#E05252]">{error}</p> : null; }

function History({ history, loading, error, onRetry, onView }: { history: AssessmentHistory | null; loading: boolean; error: string; onRetry: () => void; onView: (id: string) => void }) {
  return <section className="mt-6 overflow-hidden rounded-2xl border border-[#E4EAF8] bg-white shadow-[0_4px_20px_rgba(27,39,94,0.05)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1FA] px-5 py-4 sm:px-6"><div><h2 className="text-lg font-semibold text-[#0E1224]">Diagnostic History</h2><p className="mt-1 text-sm text-[#8B93B8]">Your completed operational diagnostic assessments.</p></div>{history && <span className="rounded-full bg-[#F1F4FF] px-3 py-1 text-xs font-medium text-[#5B7FF0]">{history.total} total</span>}</div>{loading ? <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#8B93B8]"><Loader2 className="size-4 animate-spin" /> Loading history…</div> : error ? <div className="min-h-40 px-6 py-10 text-center"><p className="text-sm text-[#E05252]">{error}</p><button type="button" onClick={onRetry} className="mt-3 text-sm font-medium text-[#5B7FF0] hover:underline">Try again</button></div> : !history?.items.length ? <div className="min-h-40 px-6 py-10 text-center text-sm text-[#8B93B8]">No diagnostic assessments yet. Start your first assessment above.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><caption className="sr-only">Operational diagnostic assessment history</caption><thead className="bg-[#FAFBFF] text-xs font-semibold text-[#737D95]"><tr><th className="px-5 py-3.5 sm:px-6">Assessment Date</th><th className="px-5 py-3.5">Score</th><th className="px-5 py-3.5">Questions Answered</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right sm:px-6">Details</th></tr></thead><tbody className="divide-y divide-[#EEF1FA]">{history.items.map(item => <tr key={item._id} className="text-sm text-[#30364E] hover:bg-[#FAFBFF]"><td className="px-5 py-4 font-medium sm:px-6"><p>{formatDate(item.completedAt ?? item.createdAt)}</p><p className="mt-1 text-xs font-normal text-[#8B93B8]">{formatTime(item.completedAt ?? item.createdAt)}</p></td><td className="px-5 py-4"><span className="font-semibold text-[#5B7FF0]">{item.totalScore}</span><span className="text-[#8B93B8]"> / {item.maxPossibleScore}</span></td><td className="px-5 py-4">{item.questionsAnswered} / {item.totalQuestions}</td><td className="px-5 py-4"><span className="inline-flex rounded-full bg-[#E6F8ED] px-2.5 py-1 text-xs font-medium text-[#138A45]">{item.status === "completed" ? "Completed" : "In Progress"}</span></td><td className="px-5 py-4 text-right sm:px-6"><button type="button" onClick={() => onView(item._id)} aria-label="View assessment details" title="View assessment details" className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-[#DCE4FF] bg-[#F6F8FF] text-[#5B7FF0] hover:bg-[#EAF0FF]"><Eye className="size-4" /></button></td></tr>)}</tbody></table></div>}</section>;
}

function AssessmentDetail({ detail, loading, error }: { detail: AssessmentResult | null; loading: boolean; error: string }) {
  if (loading) return <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-[#8B93B8]"><Loader2 className="size-5 animate-spin" /> Loading assessment details…</div>;
  if (error || !detail) return <div className="min-h-72 px-5 py-16 text-center"><p className="text-sm text-[#E05252]">{error || "Assessment details could not be loaded."}</p></div>;
  return <div className="py-2"><div className="flex items-start justify-between gap-4"><Brand /><span className="rounded-full bg-[#E6F8ED] px-2.5 py-1 text-xs font-medium text-[#138A45]">{detail.status === "completed" ? "Completed" : "In Progress"}</span></div><h2 className="mt-7 text-xl font-semibold text-[#0E1224]">Assessment Details</h2><p className="mt-1 text-sm text-[#8B93B8]">Completed on {formatDate(detail.completedAt ?? detail.createdAt)} at {formatTime(detail.completedAt ?? detail.createdAt)}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Overall Score" value={`${detail.totalScore} / ${detail.maxPossibleScore}`} /><Metric label="Questions Answered" value={`${detail.questionsAnswered} / ${detail.totalQuestions}`} /><Metric label="Assessment Status" value={detail.status === "completed" ? "Completed" : "In Progress"} /></div><div className="mt-6 space-y-5">{detail.answersByCategory.map(category => <section key={category.categoryId}><h3 className="text-sm font-semibold uppercase tracking-wide text-[#5B7FF0]">{category.categoryTitle || "Operational Diagnostic"}</h3><div className="mt-2 space-y-2">{category.answers.map(answer => <article key={answer.questionId} className="rounded-xl border border-[#E4EAF8] bg-[#FAFBFF] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-[#30364E]">{answer.questionTitle || "Diagnostic question"}</h4>{answer.questionDescription && <p className="mt-1 text-xs leading-5 text-[#8B93B8]">{answer.questionDescription}</p>}</div><span className="rounded-lg bg-[#5B7FF0]/10 px-2.5 py-1 text-xs font-semibold text-[#4D6DE0]">{answer.pointsAwarded} pts</span></div><div className="mt-3 flex items-start gap-2 text-sm text-[#47536E]"><span className="flex size-5 shrink-0 items-center justify-center rounded border border-[#5B7FF0] bg-[#5B7FF0] text-xs font-semibold text-white">{answer.selectedChoiceLabel}</span><span>{answer.selectedChoiceText || "Selected response"}</span></div></article>)}</div></section>)}</div></div>;
}

function Intro({ loading, error, onStart }: { loading: boolean; error: string; onStart: () => void }) { return <div className="py-5 text-center sm:py-8"><div className="flex justify-center"><Brand /></div><p className="mt-7 text-xs font-medium text-[#5B7FF0]">Let&apos;s understand your operation.</p><h2 className="mt-2 text-2xl font-semibold text-[#0E1224]">Operational Diagnostic</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#64748B]">Answer a few quick questions to help us understand your current workflow and identify opportunities for improvement.</p><Message error={error} /><button type="button" disabled={loading} onClick={onStart} className="mt-7 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#5B7FF0] text-sm font-semibold text-white hover:bg-[#4B6DE0] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />} Start Diagnostic</button></div>; }

function Question({ step, index, total, selected, loading, error, onSelect, onBack, onNext }: { step: Step; index: number; total: number; selected?: string; loading: boolean; error: string; onSelect: (label: string) => void; onBack: () => void; onNext: () => void }) { return <div><div className="flex items-start justify-between gap-4"><Brand /><p className="text-xs font-medium text-[#0E1224]">Question {index + 1} of {total}</p></div><p className="mt-8 text-center text-xs font-semibold uppercase tracking-wide text-[#5B7FF0]">{step.category.title}</p><div className="mt-4 rounded-xl border border-[#E4EAF8] p-4"><h2 className="text-sm font-semibold text-[#5B7FF0]">{step.question.title}</h2>{step.question.description && <p className="mt-2 text-xs leading-5 text-[#64748B]">{step.question.description}</p>}<div className="mt-4 grid gap-2 sm:grid-cols-2">{step.question.choices.map(choice => <button key={choice.label} type="button" onClick={() => onSelect(choice.label)} className={`flex min-h-12 cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-left text-xs leading-4 ${selected === choice.label ? "border-[#5B7FF0] bg-[#5B7FF0]/10 text-[#283E9D]" : "border-transparent hover:bg-[#F5F7FF]"}`}><span className={`mt-px flex size-4 shrink-0 items-center justify-center rounded border ${selected === choice.label ? "border-[#5B7FF0] bg-[#5B7FF0] text-white" : "border-[#AAB7DC]"}`}>{selected === choice.label && <Check className="size-3" />}</span><span><b>{choice.label}.</b> {choice.text} <b>({choice.points} pts)</b></span></button>)}</div></div><Message error={error} /><div className="mt-6 grid grid-cols-[96px_1fr] gap-2"><button type="button" disabled={index === 0 || loading} onClick={onBack} className="flex h-10 items-center justify-center gap-1 rounded-lg border border-[#8B93B8] text-xs font-medium text-[#30364E] disabled:opacity-40"><ArrowLeft className="size-3.5" /> Back</button><button type="button" disabled={!selected || loading} onClick={onNext} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#5B7FF0] text-xs font-semibold text-white disabled:opacity-50">{loading && <Loader2 className="size-4 animate-spin" />}{index === total - 1 ? "Submit Assessment" : "Next"}<ArrowRight className="size-3.5" /></button></div></div>; }

function Complete({ loading, error, onBack, onView }: { loading: boolean; error: string; onBack: () => void; onView: () => void }) { return <div className="py-5 text-center sm:py-8"><div className="flex justify-start"><Brand /></div><span className="mx-auto mt-7 flex size-16 items-center justify-center rounded-full bg-[#DDF8E7] text-[#22C55E]"><CheckCircle2 className="size-8" /></span><h2 className="mt-5 text-xl font-semibold text-[#5B7FF0]">Assessment Complete!</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#64748B]">Thank you for completing your assessment. We&apos;re analyzing your responses to identify key opportunities, risks, and areas for improvement.</p><div className="mx-auto mt-5 w-fit space-y-2 text-left text-xs text-[#40506A]"><p><Check className="mr-2 inline size-3.5 text-[#22A35A]" />All questions answered</p><p><Check className="mr-2 inline size-3.5 text-[#22A35A]" />Responses saved</p><p><Check className="mr-2 inline size-3.5 text-[#22A35A]" />Assessment submitted</p></div><Message error={error} /><div className="mt-7 grid grid-cols-[1fr_1.7fr] gap-2"><button type="button" onClick={onBack} className="h-10 rounded-lg border border-[#8B93B8] text-xs font-medium text-[#30364E]">Go Back to Platform</button><button type="button" disabled={loading} onClick={onView} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#5B7FF0] text-xs font-semibold text-white disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />} View My Results</button></div></div>; }

function Result({ result, onDashboard, onRestart }: { result: AssessmentResult; onDashboard: () => void; onRestart: () => void }) { const percentage = result.maxPossibleScore ? Math.round((result.totalScore / result.maxPossibleScore) * 100) : 0; return <div className="py-4 text-center"><div className="flex justify-start"><Brand /></div><span className="mx-auto mt-6 flex size-14 items-center justify-center rounded-full bg-[#E9EEFF] text-[#5B7FF0]"><CheckCircle2 className="size-7" /></span><h2 className="mt-4 text-xl font-semibold text-[#5B7FF0]">Your Assessment Report</h2><p className="mt-2 text-sm text-[#64748B]">Thank you for completing the assessment. Here&apos;s your overall score based on your answers.</p><div className="mx-auto mt-5 flex size-36 flex-col items-center justify-center rounded-full border-[6px] border-[#5B7FF0] ring-4 ring-[#E9EEFF]"><strong className="text-4xl font-semibold text-[#5B7FF0]">{result.totalScore}</strong><span className="mt-1 text-lg text-[#64748B]">/ {result.maxPossibleScore}</span><span className="mt-1 text-[10px] font-medium text-[#5B7FF0]">{percentage}% score</span></div><div className="mt-7 grid gap-2 sm:grid-cols-3"><Metric label="Assessment Date" value={formatDate(result.completedAt ?? result.createdAt)} /><Metric label="Time" value={formatTime(result.completedAt ?? result.createdAt)} /><Metric label="Questions Answered" value={`${result.questionsAnswered} / ${result.totalQuestions}`} /></div><button type="button" onClick={onDashboard} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#5B7FF0] text-sm font-semibold text-white"><ClipboardCheck className="size-4" /> Go To Dashboard</button><button type="button" onClick={onRestart} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#5B7FF0] hover:underline"><RotateCcw className="size-3.5" /> Start another diagnostic</button></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#F5F7FF] px-3 py-3"><p className="text-[10px] text-[#8B93B8]">{label}</p><p className="mt-1 text-xs font-semibold text-[#30364E]">{value}</p></div>; }

"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bot,
  CheckCircle2,
  FileText,
  RefreshCw,
  Loader2,
  Pencil,
  Plus,
  Save,
  Tag,
  Trash2,
  XCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type ProposalDetails = {
  id: string;
  proposalId?: string;
  actionType?: string;
  proposedByAgent?: { id?: string; name?: string; type?: string };
  source?: { type?: string; id?: string };
  payload?: {
    title?: string;
    description?: string;
    department?: string;
    priority?: string;
    subtasks?: Array<{ title?: string; isComplete?: boolean | null; dueDate?: string | null }>;
    tags?: string[];
    startsAt?: string;
    startTime?: string;
    endTime?: string;
    durationMinutes?: number;
    platform?: string;
    attendees?: string[];
    invitees?: string[];
  };
  confidence?: number;
  evidence?: Array<{ text?: string }>;
  status?: string;
  revision?: number;
  createdAt?: string;
  updatedAt?: string;
};

type PriorityTaskDetailsModalProps = {
  proposalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatLabel = (value?: string) =>
  value ? value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : "Not specified";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "Not specified";

function LoadingState() {
  return (
    <div className="space-y-4 p-5 sm:p-6">
      {["h-8 w-2/3", "h-20 w-full", "h-28 w-full", "h-16 w-full"].map((size) => (
        <div key={size} className={`animate-pulse rounded-[12px] bg-[#F5F7FF] ${size}`} />
      ))}
    </div>
  );
}

export function PriorityTaskDetailsModal({ proposalId, open, onOpenChange }: PriorityTaskDetailsModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = session?.user.accessToken;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<NonNullable<ProposalDetails["payload"]>>({});
  const [tagInput, setTagInput] = useState("");
  const proposalQuery = useQuery({
    queryKey: ["call-intelligence-proposal", proposalId],
    enabled: open && Boolean(proposalId) && Boolean(accessToken),
    queryFn: async () => {
      if (!proposalId || !accessToken) throw new Error("Proposal information is missing.");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(proposalId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string | string[];
        data?: ProposalDetails;
      };
      if (!response.ok || !result.success || !result.data) {
        const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
        throw new Error(message || "Unable to load proposal details.");
      }
      return result.data;
    },
  });

  const proposal = proposalQuery.data;
  const priority = proposal?.payload?.priority?.toUpperCase();
  const isMeeting = proposal?.actionType?.toUpperCase().includes("MEETING") ?? false;

  useEffect(() => {
    if (proposal?.payload) setForm(structuredClone(proposal.payload));
  }, [proposal]);

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setTagInput("");
    }
  }, [open]);

  const getMessage = (result: { message?: string | string[] }, fallback: string) =>
    Array.isArray(result.message) ? result.message.join(", ") : result.message || fallback;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!proposalId || !accessToken) throw new Error("Proposal information is missing.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(proposalId)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ payload: form }),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string | string[] };
      if (!response.ok || !result.success) throw new Error(getMessage(result, "Unable to update proposal."));
      return result;
    },
    onSuccess: async (result) => {
      toast.success(getMessage(result, "Proposal updated successfully."));
      setIsEditing(false);
      await Promise.all([
        proposalQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["call-intelligence-details"] }),
      ]);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update proposal."),
  });

  const actionMutation = useMutation({
    mutationFn: async (action: "APPROVE" | "REJECT") => {
      if (!proposalId || !accessToken) throw new Error("Proposal information is missing.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(proposalId)}/action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string | string[] };
      if (!response.ok || !result.success) throw new Error(getMessage(result, `Unable to ${action.toLowerCase()} proposal.`));
      return { result, action };
    },
    onSuccess: async ({ result, action }) => {
      toast.success(getMessage(result, `Proposal ${action === "APPROVE" ? "approved" : "rejected"} successfully.`));
      await queryClient.invalidateQueries({ queryKey: ["call-intelligence-details"] });
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update proposal status."),
  });

  const inputClass = "mt-1.5 w-full rounded-[8px] border border-[#E4EAF8] bg-white px-3 py-2.5 text-sm text-[#0E1224] outline-none focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/10";
  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag) return;
    setForm((current) => ({
      ...current,
      tags: (current.tags || []).some((item) => item.toLowerCase() === tag.toLowerCase())
        ? current.tags
        : [...(current.tags || []), tag],
    }));
    setTagInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-lenis-prevent
        showClose={false}
        overlayClassName="bg-black/30 backdrop-blur-[3px]"
        className="flex max-h-[calc(100dvh-32px)] w-[calc(100%-24px)] max-w-[720px] flex-col gap-0 overflow-hidden !rounded-[16px] border-0 bg-white p-0 shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-[#E4EAF8] px-5 py-4 sm:px-6">
          <div>
            <DialogTitle className="text-xl font-medium text-[#0E1224]">{isMeeting ? "Meeting Schedule Details" : "Priority Task Details"}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-[#8B93B8]">AI-generated proposal information</DialogDescription>
          </div>
          <DialogClose asChild>
            <button type="button" aria-label="Close proposal details" className="flex size-9 items-center justify-center rounded-[999px] bg-[#F5F7FF] text-[#64748B] hover:bg-[#E4EAF8]">
              <X className="size-5" />
            </button>
          </DialogClose>
        </header>

        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {proposalQuery.isPending ? (
            <LoadingState />
          ) : proposalQuery.isError || !proposal ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-[#8B93B8]">{proposalQuery.error instanceof Error ? proposalQuery.error.message : "Unable to load proposal details."}</p>
              <button type="button" onClick={() => void proposalQuery.refetch()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#5B7FF0] px-4 text-sm text-white">
                <RefreshCw className="size-4" /> Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6 p-5 sm:p-6">
              {isEditing ? (
                <section className="space-y-4">
                  <label className="block text-sm font-medium text-[#0E1224]">Title<input value={form.title || ""} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} /></label>
                  <label className="block text-sm font-medium text-[#0E1224]">Description<textarea rows={4} value={form.description || ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={inputClass} /></label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-[#0E1224]">Department<input value={form.department || ""} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value.toUpperCase() }))} className={inputClass} /></label>
                    <label className="block text-sm font-medium text-[#0E1224]">Priority<select value={form.priority || "MEDIUM"} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className={inputClass}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
                  </div>
                  <div>
                    <label htmlFor="proposal-tag" className="block text-sm font-medium text-[#0E1224]">Tags</label>
                    <div className="mt-1.5 flex gap-2">
                      <input id="proposal-tag" value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }} placeholder="Type a tag and press Enter" className="min-w-0 flex-1 rounded-[8px] border border-[#E4EAF8] bg-white px-3 py-2.5 text-sm text-[#0E1224] outline-none focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/10" />
                      <button type="button" onClick={addTag} disabled={!tagInput.trim()} className="inline-flex h-[42px] items-center gap-1 rounded-[8px] bg-[#5B7FF0] px-4 text-sm font-medium text-white disabled:opacity-50"><Plus className="size-4" /> Add</button>
                    </div>
                    {(form.tags || []).length ? <div className="mt-3 flex flex-wrap gap-2">{form.tags?.map((tag) => <span key={tag} className="inline-flex items-center gap-1.5 rounded-[999px] bg-[#5B7FF0]/10 px-3 py-1.5 text-sm text-[#5B7FF0]">#{tag}<button type="button" aria-label={`Remove ${tag} tag`} onClick={() => setForm((current) => ({ ...current, tags: current.tags?.filter((item) => item !== tag) }))} className="flex size-4 items-center justify-center rounded-[999px] hover:bg-[#5B7FF0]/15"><X className="size-3" /></button></span>)}</div> : <p className="mt-2 text-xs text-[#8B93B8]">No tags added yet.</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Subtasks</h3><button type="button" onClick={() => setForm((current) => ({ ...current, subtasks: [...(current.subtasks || []), { title: "", isComplete: false, dueDate: null }] }))} className="inline-flex items-center gap-1 text-sm text-[#5B7FF0]"><Plus className="size-4" /> Add subtask</button></div>
                    <div className="mt-2 space-y-2">{(form.subtasks || []).map((subtask, index) => <div key={index} className="grid gap-2 rounded-[8px] bg-[#F5F7FF] p-3 sm:grid-cols-[auto_1fr_160px_auto] sm:items-center"><input type="checkbox" checked={Boolean(subtask.isComplete)} onChange={(event) => setForm((current) => ({ ...current, subtasks: current.subtasks?.map((item, itemIndex) => itemIndex === index ? { ...item, isComplete: event.target.checked } : item) }))} className="size-4 accent-[#5B7FF0]" /><input aria-label={`Subtask ${index + 1} title`} value={subtask.title || ""} onChange={(event) => setForm((current) => ({ ...current, subtasks: current.subtasks?.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} className="rounded-[8px] border border-[#E4EAF8] bg-white px-3 py-2 text-sm outline-none focus:border-[#5B7FF0]" /><input aria-label={`Subtask ${index + 1} due date`} type="date" value={subtask.dueDate?.slice(0, 10) || ""} onChange={(event) => setForm((current) => ({ ...current, subtasks: current.subtasks?.map((item, itemIndex) => itemIndex === index ? { ...item, dueDate: event.target.value || null } : item) }))} className="rounded-[8px] border border-[#E4EAF8] bg-white px-3 py-2 text-sm outline-none focus:border-[#5B7FF0]" /><button type="button" aria-label={`Remove subtask ${index + 1}`} onClick={() => setForm((current) => ({ ...current, subtasks: current.subtasks?.filter((_, itemIndex) => itemIndex !== index) }))} className="text-[#EF4444]"><Trash2 className="size-4" /></button></div>)}</div>
                  </div>
                </section>
              ) : <section>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-[999px] bg-[#5B7FF0]/10 px-3 py-1 text-xs font-medium text-[#5B7FF0]">{formatLabel(proposal.status)}</span>
                  <span className={`rounded-[999px] px-3 py-1 text-xs font-medium ${priority === "HIGH" ? "bg-[#EF4444]/10 text-[#EF4444]" : priority === "LOW" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/15 text-[#F59E0B]"}`}>{formatLabel(priority)} priority</span>
                  {typeof proposal.confidence === "number" && <span className="rounded-[999px] bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#10B981]">{Math.round(proposal.confidence * 100)}% confidence</span>}
                </div>
                <h2 className="mt-4 break-words text-2xl font-semibold text-[#0E1224]">{proposal.payload?.title || "Untitled task"}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#64748B]">{proposal.payload?.description || "No description provided."}</p>
              </section>}

              {!isEditing && <>
              <section className="grid gap-3 sm:grid-cols-3">
                {[
                  [<FileText key="department" className="size-4" />, "Department", formatLabel(proposal.payload?.department)],
                  [<Bot key="agent" className="size-4" />, "Proposed by", proposal.proposedByAgent?.name || "Not specified"],
                  [<CheckCircle2 key="action" className="size-4" />, "Action", formatLabel(proposal.actionType)],
                ].map(([icon, label, value]) => (
                  <div key={String(label)} className="rounded-[12px] bg-[#F5F7FF] p-4">
                    <div className="flex items-center gap-2 text-xs text-[#8B93B8]">{icon}{label}</div>
                    <p className="mt-2 break-words text-sm font-medium text-[#0E1224]">{value}</p>
                  </div>
                ))}
              </section>

              {isMeeting && <section className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Start time", formatDate(proposal.payload?.startsAt || proposal.payload?.startTime)],
                  ["End time", formatDate(proposal.payload?.endTime)],
                  ["Duration", proposal.payload?.durationMinutes ? `${proposal.payload.durationMinutes} minutes` : "Not specified"],
                  ["Platform", formatLabel(proposal.payload?.platform)],
                ].map(([label, value]) => <div key={label} className="rounded-[12px] bg-[#F5F7FF] p-4"><p className="text-xs text-[#8B93B8]">{label}</p><p className="mt-2 break-words text-sm font-medium text-[#0E1224]">{value}</p></div>)}
                {(proposal.payload?.attendees?.length || proposal.payload?.invitees?.length) ? <div className="rounded-[12px] bg-[#F5F7FF] p-4 sm:col-span-2"><p className="text-xs text-[#8B93B8]">Invitees</p><div className="mt-2 flex flex-wrap gap-2">{(proposal.payload.attendees || proposal.payload.invitees || []).map((email) => <span key={email} className="rounded-[999px] bg-white px-3 py-1 text-sm text-[#5B7FF0]">{email}</span>)}</div></div> : null}
              </section>}

              <section>
                <h3 className="font-medium text-[#0E1224]">Subtasks</h3>
                <div className="mt-3 space-y-2">
                  {proposal.payload?.subtasks?.length ? proposal.payload.subtasks.map((subtask, index) => (
                    <div key={`${subtask.title}-${index}`} className="flex items-start gap-3 rounded-[8px] bg-[#F5F7FF] p-3">
                      <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${subtask.isComplete ? "text-[#10B981]" : "text-[#8B93B8]"}`} />
                      <div className="min-w-0"><p className="text-sm text-[#0E1224]">{subtask.title || `Subtask ${index + 1}`}</p><p className="mt-1 text-xs text-[#8B93B8]">Due: {formatDate(subtask.dueDate)}</p></div>
                    </div>
                  )) : <p className="rounded-[8px] bg-[#F5F7FF] p-3 text-sm text-[#8B93B8]">No subtasks available.</p>}
                </div>
              </section>

              {proposal.payload?.tags?.length ? <section><h3 className="flex items-center gap-2 font-medium"><Tag className="size-4 text-[#5B7FF0]" />Tags</h3><div className="mt-3 flex flex-wrap gap-2">{proposal.payload.tags.map((tag) => <span key={tag} className="rounded-[8px] bg-[#5B7FF0]/10 px-3 py-1.5 text-sm text-[#5B7FF0]">#{tag}</span>)}</div></section> : null}

              {proposal.evidence?.length ? <section><h3 className="font-medium">Evidence</h3><div className="mt-3 space-y-2">{proposal.evidence.map((item, index) => <blockquote key={index} className="rounded-[8px] border-l-4 border-[#5B7FF0] bg-[#F5F7FF] p-3 text-sm italic leading-6 text-[#64748B]">“{item.text}”</blockquote>)}</div></section> : null}
              </>}

              <footer className="grid gap-2 border-t border-[#E4EAF8] pt-4 text-xs text-[#8B93B8] sm:grid-cols-2"><p>Created: {formatDate(proposal.createdAt)}</p><p className="sm:text-right">Updated: {formatDate(proposal.updatedAt)}</p></footer>
            </div>
          )}
        </div>
        {proposal && !proposalQuery.isError ? <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-[#E4EAF8] bg-white px-5 py-4 sm:px-6">
          {isEditing ? <>
            <button type="button" disabled={saveMutation.isPending} onClick={() => { setForm(structuredClone(proposal.payload || {})); setIsEditing(false); }} className="h-10 rounded-[8px] border border-[#E4EAF8] px-5 text-sm font-medium text-[#64748B] disabled:opacity-50">Cancel</button>
            <button type="button" disabled={saveMutation.isPending || !form.title?.trim()} onClick={() => saveMutation.mutate()} className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#5B7FF0] px-5 text-sm font-medium text-white disabled:opacity-50">{saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes</button>
          </> : <>
            <button type="button" disabled={actionMutation.isPending} onClick={() => setIsEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#5B7FF0] px-5 text-sm font-medium text-[#5B7FF0] disabled:opacity-50"><Pencil className="size-4" /> Edit</button>
            <button type="button" disabled={actionMutation.isPending || proposal.status === "APPROVED" || proposal.status === "REJECTED"} onClick={() => actionMutation.mutate("REJECT")} className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#EF4444] px-5 text-sm font-medium text-white disabled:opacity-50">{actionMutation.isPending && actionMutation.variables === "REJECT" ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />} {proposal.status === "REJECTED" ? "Rejected" : "Reject"}</button>
            <button type="button" disabled={actionMutation.isPending || proposal.status === "APPROVED" || proposal.status === "REJECTED"} onClick={() => actionMutation.mutate("APPROVE")} className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#10B981] px-5 text-sm font-medium text-white disabled:opacity-50">{actionMutation.isPending && actionMutation.variables === "APPROVE" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} {proposal.status === "APPROVED" ? "Approved" : "Approve"}</button>
          </>}
        </footer> : null}
      </DialogContent>
    </Dialog>
  );
}

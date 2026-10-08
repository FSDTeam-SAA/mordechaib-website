"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AlertCircle, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClarificationQuestion } from "./callDetailsTypes";

type ClarificationAnswerModalProps = {
  open: boolean;
  proposalId: string | null;
  question: ClarificationQuestion | null;
  onOpenChange: (open: boolean) => void;
};

const getInputType = (question: ClarificationQuestion | null) => {
  const type = `${question?.inputType || ""} ${question?.field || ""}`.toLowerCase();
  if (type.includes("email")) return "email";
  if (type.includes("date") || type.includes("time")) return "datetime-local";
  if (type.includes("number")) return "number";
  return "text";
};

export function ClarificationAnswerModal({ open, proposalId, question, onOpenChange }: ClarificationAnswerModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState("");
  const inputType = getInputType(question);

  useEffect(() => {
    if (!open) setAnswer("");
  }, [open]);

  const answerMutation = useMutation({
    mutationFn: async () => {
      const accessToken = session?.user.accessToken;
      if (!proposalId || !question?.id || !accessToken) throw new Error("Clarification information is missing.");
      if (!answer.trim()) throw new Error("Please enter an answer.");

      const formattedAnswer = inputType === "datetime-local"
        ? new Date(answer).toISOString()
        : answer.trim();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/call-intelligence/proposals/${encodeURIComponent(proposalId)}/clarifications`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id, answer: formattedAnswer }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string | string[] };
      if (!response.ok || !result.success) {
        const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
        throw new Error(message || "Unable to submit clarification answer.");
      }
      return result;
    },
    onSuccess: async (result) => {
      const message = Array.isArray(result.message) ? result.message.join(", ") : result.message;
      toast.success(message || "Clarification answer submitted successfully.");
      await queryClient.invalidateQueries({ queryKey: ["call-intelligence-details"] });
      onOpenChange(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to submit clarification answer."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} overlayClassName="bg-black/30 backdrop-blur-[3px]" className="w-[calc(100%-24px)] max-w-[560px] gap-0 overflow-hidden !rounded-[16px] border-0 bg-white p-0 shadow-xl">
        <header className="flex items-start justify-between border-b border-[#E4EAF8] px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <DialogTitle className="text-xl font-medium text-[#0E1224]">Answer Clarification</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-[#8B93B8]">Provide the missing information for this proposal.</DialogDescription>
          </div>
          <DialogClose asChild><button type="button" aria-label="Close clarification modal" className="flex size-9 shrink-0 items-center justify-center rounded-[999px] bg-[#F5F7FF] text-[#64748B] hover:bg-[#E4EAF8]"><X className="size-5" /></button></DialogClose>
        </header>

        <form onSubmit={(event) => { event.preventDefault(); answerMutation.mutate(); }} className="p-5 sm:p-6">
          <div className="rounded-[8px] bg-[#F5F7FF] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8B93B8]">Question</p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#0E1224]">{question?.question}</p>
          </div>
          <label htmlFor="clarification-answer" className="mt-5 block text-sm font-medium text-[#0E1224]">Your answer {question?.required !== false && <span className="text-[#EF4444]">*</span>}</label>
          <input id="clarification-answer" type={inputType} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={inputType === "email" ? "name@example.com" : "Enter your answer"} required={question?.required !== false} className="mt-2 h-11 w-full rounded-[8px] border border-[#E4EAF8] px-3 text-sm outline-none focus:border-[#5B7FF0] focus:ring-2 focus:ring-[#5B7FF0]/10" />
          {answerMutation.isError && <p className="mt-3 flex items-start gap-2 text-sm text-[#EF4444]"><AlertCircle className="mt-0.5 size-4 shrink-0" />{answerMutation.error instanceof Error ? answerMutation.error.message : "Unable to submit answer."}</p>}
          <div className="mt-6 flex justify-end gap-3 border-t border-[#E4EAF8] pt-4">
            <DialogClose asChild><button type="button" disabled={answerMutation.isPending} className="h-10 rounded-[8px] border border-[#E4EAF8] px-5 text-sm font-medium text-[#64748B] disabled:opacity-50">Cancel</button></DialogClose>
            <button type="submit" disabled={answerMutation.isPending || !answer.trim()} className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#5B7FF0] px-5 text-sm font-medium text-white disabled:opacity-50">{answerMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit Answer</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

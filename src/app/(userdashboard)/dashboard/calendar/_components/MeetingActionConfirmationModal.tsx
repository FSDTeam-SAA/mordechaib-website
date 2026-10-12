"use client";

import { CalendarX2, LoaderCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type MeetingAction = "cancel" | "delete";

type MeetingActionConfirmationModalProps = {
  open: boolean;
  action: MeetingAction;
  meetingTitle?: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function MeetingActionConfirmationModal({
  open,
  action,
  meetingTitle,
  isPending,
  onOpenChange,
  onConfirm,
}: MeetingActionConfirmationModalProps) {
  const isCancel = action === "cancel";
  const actionLabel = isCancel ? "Cancel Meeting" : "Delete Meeting";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        overlayClassName="bg-[#0E1224]/40 backdrop-blur-[4px]"
        className="w-[calc(100%-24px)] max-w-[420px] gap-0 !rounded-[16px] border-0 bg-white p-6 text-center shadow-[0_24px_80px_rgba(14,18,36,0.24)]"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]">
          {isCancel ? (
            <CalendarX2 className="size-5" />
          ) : (
            <Trash2 className="size-5" />
          )}
        </span>
        <DialogTitle className="mt-4 text-xl font-semibold text-[#0E1224]">
          {actionLabel}?
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-6 text-[#73809B]">
          Are you sure you want to {action}{" "}
          <strong className="text-[#343A52]">
            {meetingTitle || "this meeting"}
          </strong>
          ?{!isCancel && " This action cannot be undone."}
        </DialogDescription>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-11 rounded-[12px] border border-[#DCE1EA] text-sm font-medium text-[#596079] disabled:opacity-60"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#EF4444] text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-60"
          >
            {isPending && <LoaderCircle className="size-4 animate-spin" />}
            {isPending
              ? isCancel
                ? "Cancelling..."
                : "Deleting..."
              : actionLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

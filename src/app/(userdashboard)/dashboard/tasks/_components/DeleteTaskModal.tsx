"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteTaskModalProps = {
  open: boolean;
  taskTitle?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function DeleteTaskModal({
  open,
  taskTitle,
  onOpenChange,
  onConfirm,
  isPending = false,
}: DeleteTaskModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showClose={false}
        overlayClassName="bg-black/30 backdrop-blur-[3px]"
        className="w-[calc(100%-32px)] max-w-[480px] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl"
      >
        <div className="flex items-center gap-3 border-b border-[#E4EAF8] p-[1.125rem]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]">
            <Trash2 className="size-5" />
          </span>
          <DialogTitle className="text-[1.1875rem]/[1.75rem] font-medium text-[#0E1224]">
            Delete Task
          </DialogTitle>
        </div>

        <div className="p-[1.125rem] sm:p-5">
          <DialogDescription className="text-[0.9375rem]/[1.5rem] leading-6 text-[#64748B]">
            Are you sure you want to delete
            {taskTitle ? (
              <span className="font-medium text-[#0E1224]"> “{taskTitle}”</span>
            ) : (
              " this task"
            )}
            ? This action cannot be undone.
          </DialogDescription>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="h-11 border-[#5B7FF0] text-[#5B7FF0] hover:bg-[#F5F7FF] hover:text-[#5B7FF0]"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="h-11 bg-[#EF4444] text-white hover:bg-[#DC2626]"
            >
              {isPending ? "Deleting..." : "Delete Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function DeleteReportModal({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: DeleteReportModalProps) {
  return (
    <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        nonModalOverlay
        overlayClassName="bg-black/10 backdrop-blur-[5px]"
        className="max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[511px] gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-[0_1px_4px_rgba(107,107,107,0.7)] sm:rounded-2xl"
      >
        <div className="flex items-center gap-2 rounded-t-2xl bg-white p-4 shadow-[0_1px_4px_rgba(107,107,107,0.7)] sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[rgba(220,38,38,0.05)]">
            <Image
              src="/support-delete-small.svg"
              alt=""
              width={20}
              height={20}
              unoptimized
              className="size-5"
            />
          </span>
          <DialogTitle className="min-w-0 text-xl font-medium leading-normal text-[#0E1224]">
            Confirm Deletion
          </DialogTitle>
        </div>

        <div className="flex flex-col items-center gap-8 p-4 text-center sm:p-6">
          <Image
            src="/support-delete-large.svg"
            alt=""
            width={48}
            height={48}
            unoptimized
            className="size-12"
          />
          <p className="text-2xl font-medium leading-none text-[#0E1224]">
            Delete Report?
          </p>
          <DialogDescription className="text-sm font-normal leading-none text-[#0E1224]">
            Are you sure want to delete this report
          </DialogDescription>

          <div className="grid w-full grid-cols-1 gap-4 min-[400px]:grid-cols-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="h-[51px] rounded-lg border-[#5B7FF0] bg-white px-8 text-base font-medium text-[#5B7FF0] shadow-none hover:bg-[#F5F7FF] hover:text-[#5B7FF0]"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="h-[51px] rounded-lg bg-[#5B7FF0] px-8 text-base font-medium text-white shadow-none hover:bg-[#4E6FDE]"
            >
              {isPending ? "Deleting..." : "Delete Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

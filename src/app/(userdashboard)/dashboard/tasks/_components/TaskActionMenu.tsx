"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

type TaskActionMenuProps = {
  taskTitle: string;
  isComplete: boolean;
  onViewDetails: () => void;
  onEdit: () => void;
  onMarkComplete: () => void;
  onDelete: () => void;
};

export function TaskActionMenu({
  taskTitle,
  isComplete,
  onViewDetails,
  onEdit,
  onMarkComplete,
  onDelete,
}: TaskActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const closeAfter = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label={`More actions for ${taskTitle}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded p-1 text-[#8B93B8] transition-colors hover:bg-[#F5F7FF] hover:text-[#64748B]"
      >
        <MoreHorizontal className="size-6" />
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label={`Actions for ${taskTitle}`}
          className="absolute right-0 top-full z-30 mt-1 flex w-[176px] flex-col gap-2 bg-[#F5F7FF] p-2"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => closeAfter(onViewDetails)}
            className="flex h-5 w-full items-center gap-1 whitespace-nowrap text-left font-sans text-base font-normal leading-normal text-[#64748B]"
          >
            <Image src="/task-actions/view-details.svg" alt="" width={20} height={20} unoptimized />
            View Details
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => closeAfter(onEdit)}
            className="flex h-5 w-full items-center gap-1 whitespace-nowrap text-left font-sans text-base font-normal leading-normal text-[#5B7FF0]"
          >
            <Image src="/task-actions/edit-task.svg" alt="" width={20} height={20} unoptimized />
            Edit Task
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => closeAfter(onMarkComplete)}
            className="flex h-5 w-full items-center gap-1 whitespace-nowrap text-left font-sans text-base font-normal leading-normal text-[#10B981]"
          >
            <Image src="/task-actions/mark-complete.svg" alt="" width={20} height={20} unoptimized />
            {isComplete ? "Mark as Incomplete" : "Mark as Complete"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => closeAfter(onDelete)}
            className="flex h-5 w-full items-center gap-1 whitespace-nowrap text-left font-sans text-base font-normal leading-normal text-[#EF4444]"
          >
            <Image src="/task-actions/delete-task.svg" alt="" width={20} height={20} unoptimized />
            Delete Task
          </button>
        </div>
      )}
    </div>
  );
}

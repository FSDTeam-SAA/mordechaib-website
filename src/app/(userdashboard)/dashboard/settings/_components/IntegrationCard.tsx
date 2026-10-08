"use client";

import Image from "next/image";
import { Eye } from "lucide-react";

type IntegrationCardProps = {
  name: string;
  description: string;
  icon: string;
  initiallyConnected?: boolean;
  connected?: boolean;
  isLoading?: boolean;
  onConnect?: () => void;
  onView?: () => void;
};

export function IntegrationCard({
  name,
  description,
  icon,
  initiallyConnected = false,
  connected: controlledConnected,
  isLoading = false,
  onConnect,
  onView,
}: IntegrationCardProps) {
  const isConnected = controlledConnected ?? initiallyConnected;

  const handleClick = () => {
    onConnect?.();
  };

  return (
    <article className="relative flex min-h-[70px] flex-col gap-3 overflow-hidden rounded-[10px] bg-white py-3 pl-4 pr-3 shadow-[0_0_2px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center">
      <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[#5B7FF0]" />
      <Image src={icon} alt="" width={24} height={24} unoptimized className="size-6 shrink-0 object-contain" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-medium text-[#0E1224]">{name}</h3>
        <p className="mt-1 text-xs leading-normal text-[#8B93B8]">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onView && (
          <button
            type="button"
            onClick={onView}
            aria-label={`View ${name} details`}
            className="flex size-9 items-center justify-center rounded-[10px] border border-[#DCE3F2] text-[#5B7FF0] transition-colors hover:border-[#5B7FF0] hover:bg-[#5B7FF0]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FF0]/30"
          >
            <Eye className="size-[18px]" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className={`h-9 shrink-0 rounded-[12px] border px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isConnected ? "border-[#5B7FF0] bg-[#5B7FF0] text-white hover:bg-[#4E6FDE]" : "border-[#5B7FF0] bg-white text-[#5B7FF0] hover:bg-[#5B7FF0]/5"}`}
        >
          {isLoading ? "Checking..." : isConnected ? "Connected" : "Connect"}
        </button>
      </div>
    </article>
  );
}

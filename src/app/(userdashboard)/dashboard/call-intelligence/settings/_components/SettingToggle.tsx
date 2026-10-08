"use client";

import { useState } from "react";

type SettingToggleProps = {
  title: string;
  description: string;
  defaultChecked?: boolean;
};

export default function SettingToggle({
  title,
  description,
  defaultChecked = true,
}: SettingToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex min-h-[68px] items-center gap-4 rounded-2xl px-0 py-3 sm:px-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-normal text-[#0E1224] sm:text-base">
          {title}
        </p>
        <p className="mt-2 text-[11px] leading-normal text-[#6B6B6B] sm:text-xs">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => setChecked((current) => !current)}
        className={`relative h-6 w-[42px] shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FF0]/40 focus-visible:ring-offset-2 ${
          checked
            ? "border-[#5B7FF0] bg-[#5B7FF0]"
            : "border-[#CBD0E1] bg-[#E4EAF8]"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

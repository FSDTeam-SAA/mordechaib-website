"use client";

import { useState } from "react";

const UsageEstimator = () => {
  const [calls, setCalls] = useState(5000);
  const [actions, setActions] = useState(5000);
  const [meetingHours, setMeetingHours] = useState(30);
  return (
    <section>
      <div className="container mx-auto">
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="h-px flex-1 bg-[#DDE3F5]" />
          <h2 className="shrink-0 text-center text-xl font-bold text-[#0E1224] sm:text-3xl">
            Estimate your usage
          </h2>
          <div className="h-px flex-1 bg-[#DDE3F5]" />
        </div>

        <div className="mx-auto mt-9 grid max-w-[860px] gap-20 lg:max-w-[1280px] lg:grid-cols-3 lg:gap-24">
          <div>
            <div className="flex items-center justify-between text-sm font-bold text-[#0E1224]">
              <span>Monthly Calls</span>
            </div>
            <div className="relative mt-5 h-2 rounded-full bg-[#BFBFBF] focus-within:ring-2 focus-within:ring-[#5B7FF0] focus-within:ring-offset-4">
               <div className="relative h-full rounded-full bg-[#5B7FF0]" style={{ width: `${((calls - 0) / 10000) * 100}%` }}>
                <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border border-[#5B7FF0] bg-white shadow-[0_0_0_3px_rgba(217,77,206,0.12)]" />
              </div>
                <span className="absolute -top-10 -translate-x-1/2 whitespace-nowrap rounded-[12px] bg-[#5B7FF0] px-2 py-1 text-xs font-bold text-white after:absolute after:-bottom-2 after:left-0 after:border-l-[10px] after:border-t-[10px] after:border-l-transparent after:border-t-[#5B7FF0] sm:-top-11 sm:px-3 sm:py-1.5 sm:text-base" style={{ left: `clamp(36px, ${((calls - 0) / 10000) * 100}%, calc(100% - 36px))` }}>
                  {calls}
                </span>
              <input
                type="range"
                aria-label="Monthly Calls"
                min={0}
                max={10000}
                step={100}
                value={calls}
                onChange={(event) => setCalls(Number(event.target.value))}
                className="absolute -inset-y-3 left-0 z-10 m-0 h-8 w-full cursor-pointer opacity-0"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm font-bold text-[#0E1224]">
              <span>Monthly Actions</span>
            </div>
            <div className="relative mt-5 h-2 rounded-full bg-[#BFBFBF] focus-within:ring-2 focus-within:ring-[#5B7FF0] focus-within:ring-offset-4">
              <div className="relative h-full rounded-full bg-[#D94DCE]" style={{ width: `${((actions - 0) / 10000) * 100}%` }}>
                <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border border-[#D94DCE] bg-white shadow-[0_0_0_3px_rgba(217,77,206,0.12)]" />
              </div>
                <span className="absolute -top-10 -translate-x-1/2 whitespace-nowrap rounded-[12px] bg-[#D94DCE] px-2 py-1 text-xs font-bold text-white after:absolute after:-bottom-2 after:left-0 after:border-l-[10px] after:border-t-[10px] after:border-l-transparent after:border-t-[#D94DCE] sm:-top-11 sm:px-3 sm:py-1.5 sm:text-base" style={{ left: `clamp(36px, ${((actions - 0) / 10000) * 100}%, calc(100% - 36px))` }}>
                  {actions}
                </span>
              <input
                type="range"
                aria-label="Monthly Actions"
                min={0}
                max={10000}
                step={100}
                value={actions}
                onChange={(event) => setActions(Number(event.target.value))}
                className="absolute -inset-y-3 left-0 z-10 m-0 h-8 w-full cursor-pointer opacity-0"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm font-bold text-[#0E1224]">
              <span>Meeting Hours</span>
            </div>
            <div className="relative mt-5 h-2 rounded-full bg-[#BFBFBF] focus-within:ring-2 focus-within:ring-[#5B7FF0] focus-within:ring-offset-4">
               <div className="relative h-full rounded-full bg-[#279C95]" style={{ width: `${((meetingHours - 10) / 65) * 100}%` }}>
                <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border border-[#279C95] bg-white shadow-[0_0_0_3px_rgba(39,156,149,0.12)]" />
              </div>
                <span className="absolute -top-10 -translate-x-1/2 whitespace-nowrap rounded-[12px] bg-[#279C95] px-2 py-1 text-xs font-bold text-white after:absolute after:-bottom-2 after:left-0 after:border-l-[10px] after:border-t-[10px] after:border-l-transparent after:border-t-[#279C95] sm:-top-11 sm:px-3 sm:py-1.5 sm:text-base" style={{ left: `clamp(36px, ${((meetingHours - 10) / 65) * 100}%, calc(100% - 36px))` }}>
                  {meetingHours} hrs
                </span>
              <input
                type="range"
                aria-label="Meeting Hours"
                min={10}
                max={75}
                step={1}
                value={meetingHours}
                onChange={(event) => setMeetingHours(Number(event.target.value))}
                className="absolute -inset-y-3 left-0 z-10 m-0 h-8 w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-[1100px] text-center text-sm font-bold leading-7 text-[#5B7FF0]">
          Recommended: Growth plan · Add-ons: 2,000 call minutes, 5,000 AI actions, and Meeting Capture.
        </p>
      </div>
    </section>
  );
};

export default UsageEstimator;

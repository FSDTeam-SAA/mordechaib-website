import { ChartShell, PeriodTabs } from "./ChartShell";

export function GrowthOverviewChart() {
  return (
    <ChartShell title="Growth Overview" subtitle="Tasks vs Meetings growth over time" controls={<PeriodTabs />}>
      <div className="mt-4 aspect-[1.85/1] min-h-[230px] w-full">
        <svg viewBox="0 0 520 280" className="size-full" role="img" aria-label="Tasks and meetings growth from June to December">
          {[25, 80, 135, 190, 245].map((y) => <line key={y} x1="45" y1={y} x2="475" y2={y} stroke="#F5F7FF" />)}
          {["180%", "100%", "60%", "40%", "20%"].map((label,index) => <text key={label} x="0" y={30+index*55} fill="#8B93B8" fontSize="13">{label}</text>)}
          {["300%", "200%", "120%", "60%", "0%"].map((label,index) => <text key={label} x="485" y={30+index*55} fill="#8B93B8" fontSize="13">{label}</text>)}
          <path d="M45 147 C80 100 105 80 135 70 C165 60 175 100 210 84 C245 48 270 62 300 62 C330 62 350 48 380 48 C412 75 428 42 445 22" fill="none" stroke="#D946EF" strokeWidth="2" />
          <path d="M45 208 C80 175 105 160 135 170 C165 185 178 170 210 158 C245 140 275 155 305 151 C335 148 355 137 383 142 C412 158 428 124 445 111" fill="none" stroke="#5B7FF0" strokeWidth="2" />
          <circle cx="45" cy="147" r="5" fill="#D946EF"/><circle cx="445" cy="22" r="5" fill="#D946EF"/><circle cx="45" cy="208" r="5" fill="#5B7FF0"/><circle cx="445" cy="111" r="5" fill="#5B7FF0"/>
          {["Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((label,index) => <text key={label} x={45+index*66.7} y="245" fill="#8B93B8" fontSize="12" textAnchor="middle">{label}</text>)}
          <circle cx="110" cy="266" r="4" fill="#5B7FF0"/><text x="121" y="270" fill="#5B7FF0" fontSize="11">Meetings Auto-Scheduled</text><circle cx="304" cy="266" r="4" fill="#D946EF"/><text x="315" y="270" fill="#D946EF" fontSize="11">Tasks Automated</text>
        </svg>
      </div>
    </ChartShell>
  );
}

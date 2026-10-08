import { ChartShell, PeriodTabs } from "./ChartShell";

export function MonthlySavingsChart() {
  return (
    <ChartShell title="Monthly Savings Trend" subtitle="Estimated money saved overtime" controls={<PeriodTabs />}>
      <div className="mt-4 aspect-[1.85/1] min-h-[230px] w-full">
        <svg viewBox="0 0 520 280" className="size-full" role="img" aria-label="Monthly savings trend from June to July">
          <defs><linearGradient id="savings-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10B981" stopOpacity="0.25" /><stop offset="1" stopColor="#10B981" stopOpacity="0.08" /></linearGradient></defs>
          {[25, 80, 135, 190, 245].map((y) => <line key={y} x1="45" y1={y} x2="505" y2={y} stroke="#F5F7FF" />)}
          {["2000", "1500", "1000", "500", "0"].map((label, index) => <text key={label} x="0" y={30 + index * 55} fill="#8B93B8" fontSize="13">{label}</text>)}
          <path d="M45 245 C55 225 62 215 70 215 C92 215 105 225 115 215 L115 178 C135 173 155 195 175 185 C190 176 200 165 215 172 C235 205 250 194 260 177 C280 175 293 190 315 182 C335 174 350 190 365 174 L365 150 C380 140 399 150 414 130 L414 112 C430 109 448 117 458 98 L458 75 C475 74 490 72 505 71 L505 245 Z" fill="url(#savings-fill)" />
          <path d="M45 245 C55 225 62 215 70 215 C92 215 105 225 115 215 L115 178 C135 173 155 195 175 185 C190 176 200 165 215 172 C235 205 250 194 260 177 C280 175 293 190 315 182 C335 174 350 190 365 174 L365 150 C380 140 399 150 414 130 L414 112 C430 109 448 117 458 98 L458 75 C475 74 490 72 505 71" fill="none" stroke="#10B981" strokeWidth="1.5" />
          {[[70,215],[115,178],[215,172],[260,177],[365,150],[414,112],[458,75]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#10B981" />)}
          <rect x="438" y="53" width="43" height="20" rx="2" fill="#10B981" /><text x="459.5" y="67" textAnchor="middle" fill="white" fontSize="11">$300</text>
          {["W1 Jun","W2 Jun","W3 Jun","W4 Jun","W1 Jul","W2 Jul"].map((label,index) => <text key={label} x={48 + index*89} y="270" fill="#8B93B8" fontSize="12" textAnchor={index === 0 ? "start" : "middle"}>{label}</text>)}
        </svg>
      </div>
    </ChartShell>
  );
}

type Legend = {
  label: string;
  value: string;
  amount: number;
  color: string;
};

function createDonutGradient(legend: Legend[]) {
  const total = legend.reduce((sum, item) => sum + Math.max(0, item.amount), 0);
  if (total === 0) return "conic-gradient(#E4EAF8 0 100%)";

  let start = 0;
  const segments = legend
    .filter((item) => item.amount > 0)
    .map((item) => {
      const end = start + (item.amount / total) * 100;
      const segment = `${item.color} ${start}% ${end}%`;
      start = end;
      return segment;
    });

  return `conic-gradient(${segments.join(", ")})`;
}

export function SummaryDonutCard({
  title,
  score,
  scoreLabel,
  periodLabel,
  legend,
}: {
  title: string;
  score: string;
  scoreLabel: string;
  periodLabel: string;
  legend: Legend[];
}) {
  return (
    <section className="rounded-xl bg-white p-6">
      <header className="flex items-center justify-between gap-3 border-b border-[#E4EAF8] pb-4">
        <h2 className="text-xl font-medium text-[#0E1224]">{title}</h2>
        <span className="shrink-0 text-sm font-medium text-[#5B7FF0]">
          {periodLabel}
        </span>
      </header>
      <div className="mt-4 flex flex-col items-center gap-4 min-[420px]:flex-row">
        <div
          className="flex size-40 shrink-0 items-center justify-center rounded-full"
          style={{ background: createDonutGradient(legend) }}
        >
          <div className="flex size-[124px] flex-col items-center justify-center rounded-full bg-white text-center">
            <p className="text-3xl font-medium text-[#0E1224]">{score}</p>
            <p className="px-2 text-sm text-[#8B93B8]">{scoreLabel}</p>
          </div>
        </div>
        <div className="w-full min-w-0 flex-1 space-y-2">
          {legend.map((item) => (
            <div className="flex items-center gap-2 text-sm" key={item.label}>
              <i
                className="size-2 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <span className="min-w-0 flex-1 truncate text-[#0E1224]">
                {item.label}
              </span>
              <strong style={{ color: item.color }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

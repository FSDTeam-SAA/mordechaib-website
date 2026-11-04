type Point = { date: string; value: number };
type XY = { x: number; y: number };

function smoothPath(points: XY[]) {
  if (!points.length) return "";
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`;
  return points.reduce((path, point, index) => {
    if (index === 0) return `M${point.x} ${point.y}`;
    const previous = points[index - 1];
    const before = points[index - 2] || previous;
    const after = points[index + 1] || point;
    const cp1x = previous.x + (point.x - before.x) / 6;
    const cp1y = previous.y + (point.y - before.y) / 6;
    const cp2x = point.x - (after.x - previous.x) / 6;
    const cp2y = point.y - (after.y - previous.y) / 6;
    return `${path} C${cp1x} ${cp1y},${cp2x} ${cp2y},${point.x} ${point.y}`;
  }, "");
}

export function DynamicLineChart({ primary, secondary, currency }: { primary: Point[]; secondary?: Point[]; currency?: string }) {
  const width = 520, left = 45, right = secondary ? 45 : 15;
  const top = 25, plotBottom = secondary ? 220 : 245;
  const values = [...primary.map(item => item.value), ...(secondary || []).map(item => item.value)];
  const max = Math.max(...values, 1);
  const xy = (items: Point[]) => items.map((item, index) => ({
    x: left + index * (width - left - right) / Math.max(items.length - 1, 1),
    y: top + (plotBottom - top) * (1 - item.value / max),
  }));
  const primaryPoints = xy(primary);
  const secondaryPoints = secondary ? xy(secondary) : [];
  const primaryPath = smoothPath(primaryPoints);
  const secondaryPath = smoothPath(secondaryPoints);
  const labelIndexes = primary.map((_, index) => index).filter(index => index === 0 || index === primary.length - 1 || index % Math.max(1, Math.ceil(primary.length / 5)) === 0);
  const last = primaryPoints.at(-1);
  const lastValue = primary.at(-1)?.value ?? 0;

  return (
    <div className="mt-4 aspect-[1.85/1] min-h-[230px] w-full">
      <svg viewBox="0 0 520 280" className="size-full" role="img" aria-label="ROI trend chart">
        <defs>
          <linearGradient id="savings-fill-live" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {[0, .25, .5, .75, 1].map(tick => {
          const y = top + (plotBottom - top) * (1 - tick);
          return <g key={tick}><line x1={left} x2={width-right} y1={y} y2={y} stroke="#F5F7FF" />{!secondary && <text x="0" y={y+4} fill="#8B93B8" fontSize="12">{currency ? new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(max*tick) : Math.round(max*tick)}</text>}</g>;
        })}

        {secondary && ["20%", "40%", "60%", "100%", "180%"].map((label,index) => <text key={label} x="0" y={plotBottom-index*(plotBottom-top)/4+4} fill="#8B93B8" fontSize="12">{label}</text>)}
        {secondary && ["0%", "60%", "120%", "200%", "300%"].map((label,index) => <text key={label} x="485" y={plotBottom-index*(plotBottom-top)/4+4} fill="#8B93B8" fontSize="12">{label}</text>)}

        {!secondary && primaryPoints.length > 1 && <path d={`${primaryPath} L${primaryPoints.at(-1)?.x} ${plotBottom} L${primaryPoints[0].x} ${plotBottom} Z`} fill="url(#savings-fill-live)" />}
        <path d={primaryPath} fill="none" stroke={secondary ? "#D946EF" : "#10B981"} strokeWidth="2" />
        {secondary && <path d={secondaryPath} fill="none" stroke="#5B7FF0" strokeWidth="2" />}

        {!secondary && primaryPoints.filter((_,index) => index === 0 || index === primaryPoints.length-1 || index % Math.max(1,Math.ceil(primaryPoints.length/7)) === 0).map((point,index) => <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="4" fill="#10B981" />)}
        {secondary && primaryPoints.length > 0 && <><circle cx={primaryPoints[0].x} cy={primaryPoints[0].y} r="5" fill="#D946EF"/><circle cx={primaryPoints.at(-1)?.x} cy={primaryPoints.at(-1)?.y} r="5" fill="#D946EF"/></>}
        {secondary && secondaryPoints.length > 0 && <><circle cx={secondaryPoints[0].x} cy={secondaryPoints[0].y} r="5" fill="#5B7FF0"/><circle cx={secondaryPoints.at(-1)?.x} cy={secondaryPoints.at(-1)?.y} r="5" fill="#5B7FF0"/></>}

        {!secondary && last && <g><rect x={Math.min(last.x-22,width-58)} y={Math.max(2,last.y-27)} width="46" height="20" rx="2" fill="#10B981"/><text x={Math.min(last.x+1,width-35)} y={Math.max(16,last.y-13)} textAnchor="middle" fill="white" fontSize="11">{currency ? new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:0}).format(lastValue) : lastValue}</text></g>}

        {labelIndexes.map(index => <text key={`${primary[index].date}-${index}`} x={primaryPoints[index].x} y={secondary ? 242 : 270} textAnchor={index === 0 ? "start" : index === primary.length-1 ? "end" : "middle"} fill="#8B93B8" fontSize="11">{new Intl.DateTimeFormat("en-US", { month: "short", day: primary.length > 12 ? undefined : "numeric" }).format(new Date(`${primary[index].date}T12:00:00Z`))}</text>)}

        {secondary && <g><circle cx="110" cy="266" r="4" fill="#5B7FF0"/><text x="121" y="270" fill="#5B7FF0" fontSize="11">Meetings Auto-Scheduled</text><circle cx="304" cy="266" r="4" fill="#D946EF"/><text x="315" y="270" fill="#D946EF" fontSize="11">Tasks Automated</text></g>}
      </svg>
    </div>
  );
}

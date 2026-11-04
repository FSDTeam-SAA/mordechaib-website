import { ChartShell, PeriodTabs } from "./ChartShell";
import { DynamicLineChart } from "./DynamicLineChart";
import { useRoiDashboard } from "./RoiDashboardClient";

export function GrowthOverviewChart() {
  const {data}=useRoiDashboard();
  return (
    <ChartShell title="Growth Overview" subtitle="Tasks vs Meetings growth over time" controls={<PeriodTabs />}>
      <DynamicLineChart primary={data.growthOverview.tasksAutomated} secondary={data.growthOverview.meetingsAutoScheduled}/>
    </ChartShell>
  );
}

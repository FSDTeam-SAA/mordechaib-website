import { ChartShell, PeriodTabs } from "./ChartShell";
import { DynamicLineChart } from "./DynamicLineChart";
import { useRoiDashboard } from "./RoiDashboardClient";

export function MonthlySavingsChart() {
  const {data}=useRoiDashboard();
  return (
    <ChartShell title="Monthly Savings Trend" subtitle="Estimated money saved overtime" controls={<PeriodTabs />}>
      <DynamicLineChart primary={data.savingsTrend.map(item=>({date:item.date,value:item.moneySaved}))} currency={data.configuration.currency}/>
    </ChartShell>
  );
}

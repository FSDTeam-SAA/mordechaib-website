import { GrowthOverviewChart } from "./_components/GrowthOverviewChart";
import { KpiCards } from "./_components/KpiCards";
import { MonthlySavingsChart } from "./_components/MonthlySavingsChart";
import { ProjectionBanner } from "./_components/ProjectionBanner";
import { SavingsBreakdown } from "./_components/SavingsBreakdown";
import { TasksByAgentChart } from "./_components/TasksByAgentChart";
import { TimeSavedByCategory } from "./_components/TimeSavedByCategory";

export default function RoiDashboardPage() {
  return (
    <div className="space-y-4 p-4 pb-10">
      <KpiCards />
      <ProjectionBanner />
      <section className="grid gap-4 xl:grid-cols-2">
        <MonthlySavingsChart />
        <GrowthOverviewChart />
      </section>
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <TasksByAgentChart />
        <TimeSavedByCategory />
        <SavingsBreakdown />
      </section>
    </div>
  );
}

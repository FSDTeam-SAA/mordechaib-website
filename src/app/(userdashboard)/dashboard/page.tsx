import { AiWorkforceCard } from "./_components/AiWorkforceCard";
import { DashboardKpiCards } from "./_components/DashboardKpiCards";
import { ExecutiveBriefingCard } from "./_components/ExecutiveBriefingCard";
import { RecentVoiceNotesCard } from "./_components/RecentVoiceNotesCard";
import { TaskOverviewCard } from "./_components/TaskOverviewCard";
import { TopPrioritiesCard } from "./_components/TopPrioritiesCard";
import { UpcomingMeetingsCard } from "./_components/UpcomingMeetingsCard";

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-4 pb-10">
      <DashboardKpiCards />
      <AiWorkforceCard />

      <section className="grid gap-4 xl:grid-cols-2">
        <UpcomingMeetingsCard />
        <ExecutiveBriefingCard />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <RecentVoiceNotesCard />
        <TaskOverviewCard />
        <TopPrioritiesCard />
      </section>
    </div>
  );
}

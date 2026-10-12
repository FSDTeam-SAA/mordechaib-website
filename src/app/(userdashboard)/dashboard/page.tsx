import { AiWorkforceCard } from "./_components/AiWorkforceCard";
import { DashboardKpiCards } from "./_components/DashboardKpiCards";
import { ExecutiveBriefingCard } from "./_components/ExecutiveBriefingCard";
import { RecentVoiceNotesCard } from "./_components/RecentVoiceNotesCard";
import { TaskOverviewCard } from "./_components/TaskOverviewCard";
import { TopPrioritiesCard } from "./_components/TopPrioritiesCard";
import { UpcomingMeetingsCard } from "./_components/UpcomingMeetingsCard";

export default function DashboardPage() {
  return (
    <div className="w-full min-w-0 space-y-3 p-3 pb-8 sm:space-y-4 sm:p-4 sm:pb-10 lg:p-6">
      <DashboardKpiCards />
      <AiWorkforceCard />

      <section className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <UpcomingMeetingsCard />
        <ExecutiveBriefingCard />
      </section>

      <section className="grid gap-3 sm:gap-4 xl:grid-cols-3">
        <RecentVoiceNotesCard />
        <TaskOverviewCard />
        <TopPrioritiesCard />
      </section>
    </div>
  );
}

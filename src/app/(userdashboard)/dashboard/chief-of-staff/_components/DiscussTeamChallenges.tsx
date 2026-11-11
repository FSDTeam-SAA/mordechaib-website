import type { ReactNode } from "react";
import type { BriefingSection } from "./ExecutiveBriefings";

type DiscussTeamChallengesProps = {
  sections: BriefingSection[];
  renderSection: (section: BriefingSection, index: number) => ReactNode;
};

/** Renders Team Challenges sections supplied by the Executive Briefing API. */
export function DiscussTeamChallenges({
  sections,
  renderSection,
}: DiscussTeamChallengesProps) {
  return <>{sections.map(renderSection)}</>;
}

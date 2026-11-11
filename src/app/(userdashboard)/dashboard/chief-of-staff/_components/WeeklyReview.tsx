import type { ReactNode } from "react";
import type { BriefingSection } from "./ExecutiveBriefings";

type WeeklyReviewProps = {
  sections: BriefingSection[];
  renderSection: (section: BriefingSection, index: number) => ReactNode;
};

/** Renders Weekly Review sections supplied by the Executive Briefing API. */
export function WeeklyReview({ sections, renderSection }: WeeklyReviewProps) {
  return <>{sections.map(renderSection)}</>;
}

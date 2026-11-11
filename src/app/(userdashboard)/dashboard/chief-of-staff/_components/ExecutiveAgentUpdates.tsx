import type { ReactNode } from "react";
import type { BriefingSection } from "./ExecutiveBriefings";

type ExecutiveAgentUpdatesProps = {
  section: BriefingSection;
  index: number;
  renderSection: (section: BriefingSection, index: number) => ReactNode;
};

/** Renders the API-provided agent-update section for today's briefing. */
export function ExecutiveAgentUpdates({
  section,
  index,
  renderSection,
}: ExecutiveAgentUpdatesProps) {
  return <>{renderSection(section, index)}</>;
}

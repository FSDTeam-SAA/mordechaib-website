import type { ReactNode } from "react";
import type { BriefingSection } from "./ExecutiveBriefings";

type ExecutiveMetricsProps = {
  section: BriefingSection;
  index: number;
  renderSection: (section: BriefingSection, index: number) => ReactNode;
};

/** Renders one API-provided non-agent section for today's briefing. */
export function ExecutiveMetrics({
  section,
  index,
  renderSection,
}: ExecutiveMetricsProps) {
  return <>{renderSection(section, index)}</>;
}

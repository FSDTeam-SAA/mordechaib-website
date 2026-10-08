const metrics = [
  {
    value: "1 Unified Platform",
    label: "Replace tool fragmentation",
  },
  {
    value: "6 AI Agents",
    label: "Built for operational efficiency",
  },
  {
    value: "40+ Hours Saved Weekly",
    label: "Per team, not per user",
  },
  {
    value: "Day 1 Efficiency",
    label: "Immediate operational lift",
  },
];

function AboutMetrics() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid container grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.value}
            className={`flex min-h-[110px] flex-col items-center justify-center px-5 py-6 text-center sm:min-h-[120px] lg:min-h-[90px] lg:py-3 ${
              index > 0 ? "border-t border-[#D9DCE5] sm:border-t-0" : ""
            } ${index % 2 === 1 ? "sm:border-l" : ""} ${
              index >= 2 ? "sm:border-t lg:border-t-0" : ""
            } ${index > 0 ? "lg:border-l" : "lg:border-l-0"}`}
          >
            <p className="text-base font-medium leading-tight text-[#0E1224] sm:text-[26px]">
              {metric.value}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#6B7280] sm:text-[18px]">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AboutMetrics;

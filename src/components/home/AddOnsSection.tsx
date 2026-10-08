import { CalendarDays, CheckCircle2, Phone, Rocket, Workflow } from "lucide-react";

const addOns = [
  {
    title: "AI Actions Packs",
    icon: Workflow,
    color: "border-[#5B7FF0]",
    iconBg: "bg-[#5B7FF0]",
    text: "text-[#5B7FF0]",
    items: ["1,000 Ai Actions - $25", "5000 Ai Actions - $90", "10,000 Ai Actions - $300"],
  },
  {
    title: "AI Voice Minutes Packs",
    icon: Phone,
    color: "border-[#D94DCE]",
    iconBg: "bg-[#D94DCE]",
    text: "text-[#D94DCE]",
    items: ["500 Voice Minutes - $12", "2000 Voice Minutes - $40", "10,000 Voice Minutes - $180"],
  },
  {
    title: "Operations Booster Pack",
    icon: Rocket,
    color: "border-[#F59E0B]",
    iconBg: "bg-[#F59E0B]",
    text: "text-[#F59E0B]",
    items: ["+10,000 Ai Actions", "+1,000 Voice Minutes", "Priority Support"],
  },
  {
    title: "AI Meeting Capture",
    icon: CalendarDays,
    color: "border-[#AFDDBD]",
    iconBg: "bg-[#409B68]",
    text: "text-[#409B68]",
    items: ["10 meeting hours — $12", "30 meeting hours — $32", "75 meeting hours — $75"],
  },
];

const AddOnsSection = () => {
  return (
    <section className="bg-[linear-gradient(135deg,rgba(91,156,213,0.06)_0%,rgba(217,70,239,0.06)_100%)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="h-px flex-1 bg-[#DDE3F5]" />
          <div className="text-center">
            <h2 className="text-[28px] font-bold tracking-normal text-[#0E1224] sm:text-4xl lg:text-[44px]">
              ADD - ONS
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#6B6B6B] sm:mt-4 sm:text-base">
              Click &ldquo;Start Free Trial&rdquo; on your preferred plan, then select the add-ons you need.
            </p>
          </div>
          <div className="h-px flex-1 bg-[#DDE3F5]" />
        </div>

        <div className="mx-auto mt-8 grid max-w-[1280px] gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {addOns.map((addOn) => {
            const Icon = addOn.icon;

            return (
              <article
                key={addOn.title}
                className={`rounded-xl border-2 ${addOn.color} bg-white/55 p-4 shadow-sm backdrop-blur`}
              >
                <div className="flex items-center gap-2 border-b border-[#E5E8F2] pb-4">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${addOn.iconBg}`}>
                    <Icon size={20} />
                  </span>
                  <h3 className="whitespace-nowrap text-sm font-bold leading-tight text-[#0E1224] sm:text-base xl:text-sm 2xl:text-base">{addOn.title}</h3>
                </div>

                <ul className="mt-5 space-y-4">
                  {addOn.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#0E1224]">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${addOn.text}`} />
                      {item}
                    </li>
                  ))}
                </ul>

              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AddOnsSection;

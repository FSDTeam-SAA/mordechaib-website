import Image from "next/image";
import { Check } from "lucide-react";

const missionPoints = [
  "Turn conversations into organized tasks and workflows",
  "Remove repetitive work so owners reclaim real time",
  "Centralize CRM, tasks, meetings, and insights",
  "Deliver secure, reliable, easy-to-use AI",
  "Improve continuously based on real stories and real needs",
];

function OurMission() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="container mx-auto grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src="/about3.png"
            alt="Noltra mission"
            fill
            sizes="(max-width: 1023px) 92vw, 48vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="text-[30px] font-bold leading-tight text-[#0E1224] sm:text-[36px] lg:text-[48px]">
            Our Mission With <span className="text-[#5B7FF0]">Noltra</span>
          </h2>
          <h3 className="mt-5 text-base font-midium  text-[#141936] sm:text-xl">
            To protect the people who carry the weight of their communities
          </h3>

          <p className="mt-5 text-sm leading-relaxed text-[#141936] sm:text-xl">
            Small-business owners are dreamers, parents, immigrants, leaders - and
            they deserve tools that make their lives easier. Our mission is to build
            AI that quietly handles the chaos so owners can focus on customers,
            revenue, and the life they&apos;re building. Noltra is the system I wish I
            had. Now it&apos;s the system I&apos;m committed to giving others.
          </p>

          <ul className="mt-6 space-y-4">
            {missionPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-[#20263D] sm:text-xl font-medium">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0] text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-[#141936] sm:text-base">
            Noltra isn&apos;t just software - it&apos;s a promise that you don&apos;t have to
            run your business alone.
          </p>
        </div>
      </div>
    </section>
  );
}

export default OurMission;

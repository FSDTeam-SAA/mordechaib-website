import Image from "next/image";
import { Check } from "lucide-react";

const visionPoints = [
  "Conversations become action: Calls, meetings, and voice notes automatically turn into tasks, follow-ups, and next steps.",
  "AI works as a team: Specialized AI agents collaborate across Sales, Marketing, Operations, and Customer Support.",
  "Nothing falls through the cracks: Tasks, commitments, and customer interactions stay organized and connected.",
  "Business owners stay in control: AI handles repetitive operational work while people focus on decisions, relationships, and growth.",
  "Businesses operate with greater intelligence: One connected platform brings people, workflows, and AI together.",
];

function OurVision() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="container mx-auto grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 lg:order-1">
          <h2 className="text-[30px] font-midium leading-tight text-[#0E1224] sm:text-[36px] lg:text-[48px]">
            Our Vision With <span className="text-[#5B7FF0]">Noltra</span>
          </h2>
          <h3 className="mt-5 text-base font-midium leading-tight text-[#141936] sm:text-2xl">
            A smarter way to run a business. An AI workforce that works alongside you.
          </h3>

          <div className="mt-5 space-y-4 text-sm leading-relaxed font-normal text-[#141936] sm:text-xl">
            <p>
              Noltra was built around a simple belief: business owners shouldn&apos;t have
              to manage every task, chase every follow-up, or carry every operational
              responsibility themselves.
            </p>
            <p>
              Running a business involves countless conversations, decisions, and
              responsibilities. Too much time is spent coordinating work instead of
              moving the business forward.
            </p>
            <p>
              We envisioned a different future — one where AI doesn&apos;t just provide
              answers or automate individual tasks, but actively helps run business
              operations.
            </p>
            <p>
              Our vision is to make every business more intelligent, organized, and
              efficient through an AI Chief of Staff that coordinates specialized AI
              agents, understands business context, and turns everyday conversations
              into execution.
            </p>
          </div>

          <ul className="mt-6 space-y-4">
            {visionPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-[#141936] sm:text-xl font-normal">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#5B7FF0] text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#141936] sm:text-xl">
            <p>Our goal isn&apos;t to build another tool businesses have to manage.</p>
            <p>
              We&apos;re building the future of business operations — where every
              business has an AI Chief of Staff and an entire AI workforce working
              behind it.
            </p>
          </div>
        </div>

        <div className="relative order-1 aspect-[16/9] overflow-hidden rounded-lg lg:order-2">
          <Image
            src="/about2.png"
            alt="Noltra vision"
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default OurVision;

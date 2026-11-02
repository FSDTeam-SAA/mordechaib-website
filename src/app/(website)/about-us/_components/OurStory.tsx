import Image from "next/image";
import { BookOpen } from "lucide-react";

function OurStory() {
  return (
    <section className="bg-[#F5F7F] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto container text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9EDFF] px-3 py-1.5 text-xs font-medium text-[#5B7FF0]">
          <BookOpen size={13} />
          Our Story
        </span>

        <h2 className="mt-4 text-[30px] font-bold leading-tight text-black sm:text-[38px] lg:text-[42px]">
          Built for Small Business Owners Like Us
        </h2>

        <div className="relative mx-auto mt-8 aspect-[16/9] w-full max-w-[760px] overflow-hidden rounded-sm bg-white">
          <Image
            src="/owner.png"
            alt="Mordy and Noa, Noltra founders"
            fill
            sizes="(max-width: 767px) 92vw, 760px"
            className="object-cover"
          />
        
        </div>

        <div className="mx-auto mt-7 max-w-[1400px] text-[#141936]">
          <h3 className="text-base font-semibold sm:text-2xl">
            Noltra was created with a simple belief:
          </h3>
          <p className="mt-1 text-base text-[#141936] leading-relaxed sm:text-base">
            Every business deserves an AI workforce that makes running a business
            easier. As a husband, father, and founder, <strong>Mordy</strong>, together
            with his wife <strong>Noa</strong>, understands the challenges of balancing
            business, family, and everyday responsibilities.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#141936] sm:text-base">
            That experience inspired them to build Noltra — an AI Chief of Staff that
            turns conversations into action, coordinates AI agents, and helps business
            owners spend less time managing work and more time growing their businesses.
          </p>
        </div>
      </div>
    </section>
  );
}

export default OurStory;

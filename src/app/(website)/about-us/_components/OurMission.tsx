import Image from "next/image";

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
            Give every business the power of an AI workforce.
          </h3>

          <p className="mt-5 text-sm leading-relaxed text-[#141936] sm:text-xl">
            Our mission is to help businesses operate smarter by turning everyday
            conversations into action. Noltra&apos;s AI Chief of Staff coordinates
            specialized AI agents to manage tasks, automate follow-ups, organize
            operations, and keep work moving forward.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-[#141936] sm:text-xl">
            We believe business owners should spend less time managing operations
            and more time focusing on customers, growth, and what matters most.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-[#141936] sm:text-xl">
            Our goal is simple: give every business an intelligent AI workforce that
            works alongside them, so they never have to do everything alone.
          </p>
        </div>
      </div>
    </section>
  );
}

export default OurMission;

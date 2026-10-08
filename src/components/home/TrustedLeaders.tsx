"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Michael Brown",
    role: "FOUNDER @TIN2",
    image: "/profile.png",
    quote:
      "As a founder navigating rapid scale is incredibly isolating. The tactical advice and leadership frameworks I received completely redefined how I manage my executive team and drive growth.",
  },
  {
    name: "Sarah Johnson",
    role: "FOUNDER @VISIBILITY ITYENGINE",
    quote:
      "The clarity I received was life-changing. My advisor was spot-on and incredibly compassionate during a highly challenging phase of scaling our marketing platform.",
  },
  {
    name: "Emma Davis",
    role: "MANAGER @FAANG BUDDY",
    image: "/review.png",
    quote:
      "I needed a sounding board to pressure-test our quarterly strategy. The guidance was incredibly practical, helping us identify critical bottlenecks in our operations and double down on what works.",
  },
  {
    name: "Jarrad",
    role: "FOUNDER @JL STUDIO",
    quote:
      "I was struggling with burnout and direction in a high-pressure corporate role. This coaching gave me a clear, actionable roadmap to navigate politics, advocate for myself, and finally secure my promotion.",
  },
  {
    name: "Michael Lee",
    role: "FOUNDER @OPERATIONS",
    image: "/profile.png",
    quote:
      "The strategic advice helped me rebuild the operating rhythm of my business and improve execution across the team.",
  },
];

const StarRating = () => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className="flex h-5 w-5 items-center justify-center bg-[#5B7FF0] text-[13px] leading-none text-white"
      >
        ★
      </span>
    ))}
  </div>
);

const TrustedLeaders = () => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = window.setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [api]);

  return (
    <section className="overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="container mx-auto">
        <h2 className="text-center text-[28px] font-bold leading-tight text-[#0E1224] sm:text-4xl lg:text-[42px]">
          Trusted by <span className="text-[#5B7FF0]">CEO&apos;s</span> and Small
          Business <span className="text-[#5B7FF0]">Leaders</span>
        </h2>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="mx-auto mt-9 w-full sm:mt-12"
      >
        <CarouselContent className="-ml-5">
          {testimonials.map((item) => (
            <CarouselItem
              key={`${item.name}-${item.role}`}
              className="basis-[92%] pl-5 sm:basis-[48%] lg:basis-[31%] xl:basis-[24%]"
            >
              <article className="h-[380px] overflow-hidden rounded-[12px] border border-[#B6C9FF] bg-white shadow-[0_0_8px_rgba(91,127,240,0.55)] sm:h-[427px]">
                {item.image ? (
                  <div className="relative h-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 86vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,2,83,0.35)_44.52%,#6366F1_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-sm leading-relaxed">&quot;{item.quote}&quot;</p>
                      <div className="mt-5 border-t border-white/25 pt-4">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="mt-1 text-xs uppercase text-white/80">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col p-5">
                    <StarRating />
                    <p className="mt-5 text-base leading-relaxed text-[#0E1224] sm:mt-6 sm:text-xl">
                      &quot;{item.quote}&quot;
                    </p>
                    <div className="mt-auto border-t border-[#E5E7F0] pt-4">
                      <h3 className="text-lg font-semibold text-[#0E1224]">{item.name}</h3>
                      <p className="mt-1 text-xs uppercase text-[#6B6B6B]">{item.role}</p>
                    </div>
                  </div>
                )}
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default TrustedLeaders;

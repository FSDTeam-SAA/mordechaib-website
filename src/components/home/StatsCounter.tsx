"use client";

import { useEffect, useRef, useState } from "react";

type StatItem = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
};

const stats: StatItem[] = [
  {
    value: 50,
    suffix: "%",
    label: "Time saved on daily tasks",
  },
  {
    value: 2.5,
    suffix: "x",
    decimals: 1,
    label: "Revenue growth reported",
  },
  {
    value: 200,
    suffix: "+",
    label: "Small businesses served",
  },
  {
    value: 499,
    prefix: "$",
    label: "Avg monthly savings per user",
  },
];

const formatValue = (stat: StatItem, progress: number) => {
  const animatedValue = stat.value * progress;
  const value =
    stat.decimals !== undefined
      ? animatedValue.toFixed(stat.decimals)
      : Math.round(animatedValue).toString();

  return `${stat.prefix ?? ""}${value}${stat.suffix ?? ""}`;
};

const StatsCounter = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const duration = 1500;
    let frameId = 0;
    let hasAnimated = false;

    const animate = () => {
      const startTime = performance.now();

      const tick = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const nextProgress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - nextProgress, 3);

        setProgress(easedProgress);

        if (nextProgress < 1) {
          frameId = requestAnimationFrame(tick);
        }
      };

      frameId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="container mx-auto">
        <div className="grid divide-y divide-[#CECECE] rounded-none bg-white sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative flex min-h-[104px] flex-col items-center justify-center px-4 py-6 text-center sm:min-h-[122px] sm:px-8 sm:py-8"
            >
              {index % 2 === 1 && (
                <span className="absolute left-0 top-1/2 hidden h-[76px] w-px -translate-y-1/2 bg-[#CECECE] sm:block lg:hidden" />
              )}
              {index > 0 && (
                <span className="absolute left-0 top-1/2 hidden h-[76px] w-px -translate-y-1/2 bg-[#CECECE] lg:block" />
              )}
              <p className="text-[34px] font-bold leading-none tracking-normal text-[#000000] sm:text-[44px] lg:text-[60px]">
                {formatValue(stat, progress)}
              </p>
              <p className="mt-3 text-sm font-normal leading-relaxed text-[#6B6B6B] sm:mt-4 sm:text-lg lg:text-xl">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;

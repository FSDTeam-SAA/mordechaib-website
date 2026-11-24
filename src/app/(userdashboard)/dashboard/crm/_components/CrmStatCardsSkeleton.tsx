"use client";

export function CrmStatCardsSkeleton() {
  return (
    <section
      aria-label="CRM summary loading"
      className="grid gap-3 sm:grid-cols-2 min-[1200px]:grid-cols-4"
    >
      {[0, 1, 2, 3].map((index) => (
        <article
          key={index}
          className="relative min-h-32 min-w-0 overflow-hidden rounded-[12px] bg-white p-3"
        >
          <div className="flex size-10 animate-pulse items-center justify-center rounded-xl bg-[#F0F3FA]" />
          <div className="mt-2 min-w-0 pr-[104px]">
            <div className="h-8 w-24 animate-pulse rounded-md bg-[#E4EAF8]" />
            <div className="mt-1 h-4 w-28 animate-pulse rounded bg-[#F0F3FA]" />
            <div className="mt-2 flex items-center gap-1.5">
              <div className="h-4 w-14 animate-pulse rounded-lg bg-[#E4EAF8]" />
              <div className="h-3 w-16 animate-pulse rounded bg-[#F0F3FA]" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 h-[65px] w-[108px] animate-pulse rounded-lg bg-[#F5F7FF]" />
        </article>
      ))}
    </section>
  );
}

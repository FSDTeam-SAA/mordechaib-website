"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LegalPageAnimations = () => {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-legal-page]");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const pageSections = Array.from(root.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === "SECTION"
      );
      const heroContent = pageSections[0]?.firstElementChild;

      if (heroContent) {
        gsap.fromTo(
          Array.from(heroContent.children),
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.14, ease: "power3.out" }
        );
      }

      const contentSection = pageSections[1];
      const contentGrid = contentSection?.firstElementChild;
      const aside = contentGrid?.querySelector<HTMLElement>("aside");
      const contentMain = contentGrid?.querySelector<HTMLElement>("main");

      if (aside && contentSection) {
        gsap.fromTo(
          aside,
          { autoAlpha: 0, x: -28 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: contentSection, start: "top 82%", once: true },
          }
        );
      }

      if (contentMain) {
        const summary = contentMain.firstElementChild;
        if (summary) {
          gsap.fromTo(
            summary,
            { autoAlpha: 0, y: 20, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.62,
              ease: "power2.out",
              scrollTrigger: { trigger: summary, start: "top 88%", once: true },
            }
          );
        }

        const legalSections = Array.from(
          contentMain.querySelectorAll<HTMLElement>("section[id^='section-']")
        );

        legalSections.forEach((section) => {
          const bullets = section.querySelectorAll<HTMLElement>("li");
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: section, start: "top 88%", once: true },
          });

          timeline.fromTo(
            section,
            { autoAlpha: 0, x: 24 },
            { autoAlpha: 1, x: 0, duration: 0.58, ease: "power3.out" }
          );

          if (bullets.length) {
            timeline.fromTo(
              bullets,
              { autoAlpha: 0, x: 14 },
              { autoAlpha: 1, x: 0, duration: 0.32, stagger: 0.05, ease: "power2.out" },
              "-=0.25"
            );
          }
        });
      }

    }, root);

    return () => context.revert();
  }, []);

  return null;
};

export default LegalPageAnimations;

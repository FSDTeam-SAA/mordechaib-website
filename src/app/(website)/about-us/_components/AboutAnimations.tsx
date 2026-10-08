"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const AboutAnimations = () => {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-about-page]");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>(":scope > section"));
      const hero = sections[0];

      if (hero) {
        const heroGrid = hero.firstElementChild;
        const heroCopy = heroGrid?.firstElementChild;
        const heroVisual = heroGrid?.lastElementChild;

        if (heroCopy) {
          gsap.fromTo(
            Array.from(heroCopy.children),
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.12, ease: "power3.out" }
          );
        }

        if (heroVisual) {
          gsap.fromTo(
            heroVisual,
            { autoAlpha: 0, x: 60, scale: 1.06, clipPath: "inset(0 0 0 100% round 14px)" },
            {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              clipPath: "inset(0 0 0 0% round 14px)",
              duration: 1.05,
              delay: 0.12,
              ease: "power4.out",
            }
          );
        }
      }

      const metricItems = sections[1]?.querySelectorAll<HTMLElement>(":scope > div > div");
      if (metricItems?.length) {
        gsap.fromTo(
          metricItems,
          { autoAlpha: 0, y: 24, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: sections[1], start: "top 82%", once: true },
          }
        );
      }

      sections.slice(2).forEach((section, relativeIndex) => {
        const sectionIndex = relativeIndex + 2;
        const heading = section.querySelector<HTMLElement>("h2");

        if (heading) {
          gsap.fromTo(
            heading,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
              scrollTrigger: { trigger: heading, start: "top 86%", once: true },
            }
          );
        }

        if ([2, 4, 5, 6].includes(sectionIndex)) {
          const imageFrame = section.querySelector("img")?.parentElement;
          if (imageFrame) {
            const fromLeft = sectionIndex % 2 === 0;
            gsap.fromTo(
              imageFrame,
              {
                autoAlpha: 0,
                scale: 1.04,
                clipPath: fromLeft
                  ? "inset(0 100% 0 0 round 10px)"
                  : "inset(0 0 0 100% round 10px)",
              },
              {
                autoAlpha: 1,
                scale: 1,
                clipPath: "inset(0 0% 0 0 round 10px)",
                duration: 0.95,
                ease: "power4.out",
                scrollTrigger: { trigger: imageFrame, start: "top 84%", once: true },
              }
            );
          }
        }

        const listItems = Array.from(section.querySelectorAll<HTMLElement>("li"));
        if (listItems.length) {
          gsap.fromTo(
            listItems,
            { autoAlpha: 0, x: -22 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.48,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: { trigger: listItems[0], start: "top 88%", once: true },
            }
          );
        }

        const cards = Array.from(section.querySelectorAll<HTMLElement>("article"));
        if (cards.length) {
          gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 38, rotateX: 8, transformPerspective: 700 },
            {
              autoAlpha: 1,
              y: 0,
              rotateX: 0,
              duration: 0.68,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: cards[0], start: "top 87%", once: true },
            }
          );
        }
      });
    }, root);

    return () => context.revert();
  }, []);

  return null;
};

export default AboutAnimations;

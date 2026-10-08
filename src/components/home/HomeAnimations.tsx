"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HomeAnimations = () => {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-home-page]");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const heroCopy = root.querySelector<HTMLElement>("[data-hero-copy]");
      const heroVisual = root.querySelector<HTMLElement>("[data-hero-visual]");

      if (heroCopy) {
        const heroItems = Array.from(heroCopy.children);
        gsap.fromTo(
          heroItems,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power3.out" }
        );
      }

      if (heroVisual) {
        gsap.fromTo(
          heroVisual,
          { autoAlpha: 0, x: 34, scale: 0.97 },
          { autoAlpha: 1, x: 0, scale: 1, duration: 0.9, delay: 0.15, ease: "power3.out" }
        );
        gsap.to(heroVisual, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: heroVisual,
            start: "top 30%",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      const sections = Array.from(root.querySelectorAll<HTMLElement>(":scope > section")).slice(1);

      sections.forEach((section) => {
        const heading = section.querySelector<HTMLElement>("h2");
        if (heading) {
          gsap.fromTo(
            heading,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: heading, start: "top 86%", once: true },
            }
          );
        }

        const cards = Array.from(section.querySelectorAll<HTMLElement>("article"));
        if (cards.length) {
          gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 30 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.58,
              stagger: 0.07,
              ease: "power2.out",
              scrollTrigger: { trigger: cards[0], start: "top 88%", once: true },
            }
          );
        }

        const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-home-step]"));
        if (steps.length) {
          const stepTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: steps[0].parentElement,
              start: "top 78%",
              once: true,
            },
          });

          stepTimeline.fromTo(
            steps,
            {
              autoAlpha: 0,
              y: 34,
              scale: 0.97,
              clipPath: "inset(0 0 100% 0 round 8px)",
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              clipPath: "inset(0 0 0% 0 round 8px)",
              duration: 0.62,
              stagger: 0.16,
              ease: "power3.out",
            }
          );
        }

        const form = section.querySelector<HTMLElement>("form");
        if (form) {
          gsap.fromTo(
            form,
            { autoAlpha: 0, x: 24 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: form, start: "top 86%", once: true },
            }
          );
        }
      });
    }, root);

    return () => context.revert();
  }, []);

  return null;
};

export default HomeAnimations;

"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";

export function useAuthPanelAnimation(
  imagePanel: RefObject<HTMLDivElement>,
  formPanel: RefObject<HTMLDivElement>,
  imageFrom: "left" | "right"
) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();

    media.add("(min-width: 768px)", () => {
      const direction = imageFrom === "right" ? 100 : -100;
      const timeline = gsap.timeline({ defaults: { ease: "power3.inOut" } });

      timeline
        .fromTo(
          imagePanel.current,
          { xPercent: direction, zIndex: 10 },
          { xPercent: 0, duration: 0.75 }
        )
        .fromTo(
          formPanel.current,
          { autoAlpha: 0, x: direction > 0 ? -24 : 24 },
          { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out" },
          "-=0.3"
        );
    });

    return () => media.revert();
  }, [formPanel, imageFrom, imagePanel]);
}

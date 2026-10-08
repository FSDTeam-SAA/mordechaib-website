"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface Props {
  children: ReactNode;
}

const HASH_SCROLL_OFFSET = -110;
const HASH_SCROLL_RETRY_DELAY = 60;
const HASH_SCROLL_RETRY_LIMIT = 20;

export default function SmoothScrollProvider({ children }: Props) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const hashRetryTimeoutRef = useRef<number | null>(null);

  const clearHashRetryTimeout = useCallback(() => {
    if (hashRetryTimeoutRef.current !== null) {
      window.clearTimeout(hashRetryTimeoutRef.current);
      hashRetryTimeoutRef.current = null;
    }
  }, []);

  const scrollToCurrentHash = useCallback(() => {
    const tryScrollToHash = (attempt = 0) => {
      const hash = window.location.hash;
      if (!hash || hash === "#") return;

      const decodedId = decodeURIComponent(hash.slice(1));
      const targetElement = document.getElementById(decodedId);
      const lenis = lenisRef.current;

      if (!targetElement || !lenis) {
        if (attempt >= HASH_SCROLL_RETRY_LIMIT) return;

        clearHashRetryTimeout();
        hashRetryTimeoutRef.current = window.setTimeout(
          () => tryScrollToHash(attempt + 1),
          HASH_SCROLL_RETRY_DELAY
        );
        return;
      }

      lenis.scrollTo(targetElement, {
        offset: HASH_SCROLL_OFFSET,
        duration: 1.1,
        force: true,
      });
    };

    tryScrollToHash();
  }, [clearHashRetryTimeout]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lenis = new Lenis({
      lerp: reduceMotion ? 1 : 0.09,
      smoothWheel: !reduceMotion,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = window.requestAnimationFrame(raf);
    };

    rafIdRef.current = window.requestAnimationFrame(raf);

    const handleHashChange = () => {
      clearHashRetryTimeout();
      scrollToCurrentHash();
    };

    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event
        .composedPath()
        .find(
          (node): node is HTMLAnchorElement =>
            node instanceof HTMLAnchorElement && Boolean(node.href),
        );

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetUrl = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);
      const isSamePage =
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname === currentUrl.pathname;

      if (!isSamePage) return;

      const lenis = lenisRef.current;
      if (!lenis) return;

      if (href === "#") {
        event.preventDefault();
        window.history.pushState(
          {},
          "",
          `${window.location.pathname}${window.location.search}`,
        );
        lenis.scrollTo(0, {
          duration: 1.1,
          force: true,
        });
        return;
      }

      if (!targetUrl.hash) return;

      const decodedId = decodeURIComponent(targetUrl.hash.slice(1));
      const targetElement = document.getElementById(decodedId);
      if (!targetElement) return;

      event.preventDefault();
      window.history.pushState({}, "", targetUrl.hash);
      lenis.scrollTo(targetElement, {
        offset: HASH_SCROLL_OFFSET,
        duration: 1.1,
        force: true,
      });
    };

    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleAnchorClick, true);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleAnchorClick, true);
      clearHashRetryTimeout();
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [clearHashRetryTimeout, scrollToCurrentHash]);

  useEffect(() => {
    clearHashRetryTimeout();
    scrollToCurrentHash();
  }, [pathname, clearHashRetryTimeout, scrollToCurrentHash]);

  return <>{children}</>;
}

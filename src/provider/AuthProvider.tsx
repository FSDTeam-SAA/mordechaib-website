"use client";

import React, { useEffect, useRef } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { getJwtExpirationTime } from "@/lib/auth-token";

function SessionTimeoutWatcher() {
  const { data: session, status } = useSession();
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const performAutoLogout = () => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      try {
        localStorage.removeItem("accessToken");
      } catch {
        // ignore
      }
      toast.error("Your session has expired. Please sign in again.");
      signOut({ callbackUrl: "/login" });
    };

    if (session.error === "AccessTokenExpired") {
      performAutoLogout();
      return;
    }

    const token = session.user?.accessToken;
    if (!token) return;

    const expiresAt =
      session.user?.accessTokenExpiresAt || getJwtExpirationTime(token);
    if (!expiresAt) return;

    const checkExpiration = () => {
      const now = Date.now();
      if (now >= expiresAt) {
        performAutoLogout();
      }
    };

    // 1. Check immediately on mount/update
    checkExpiration();

    // 2. Schedule timeout for the exact expiry moment
    const remainingMs = expiresAt - Date.now();
    let timeoutId: NodeJS.Timeout | null = null;
    if (remainingMs > 0) {
      const safeDelay = Math.min(remainingMs, 2147483647);
      timeoutId = setTimeout(() => {
        checkExpiration();
      }, safeDelay);
    }

    // 3. Periodic interval check every 10 seconds
    const intervalId = setInterval(checkExpiration, 10000);

    // 4. Check on window focus or visibility change (e.g. returning from another tab or sleep)
    const handleFocusOrVisible = () => {
      checkExpiration();
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, [session, status]);

  return null;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <SessionTimeoutWatcher />
      {children}
    </SessionProvider>
  );
};

export default AuthProvider;

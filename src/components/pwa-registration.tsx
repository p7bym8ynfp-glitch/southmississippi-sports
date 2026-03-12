"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const cleanupVersion = "2026-03-12";
    const cleanupFlag = `smsports-cleanup-${cleanupVersion}`;

    void (async () => {
      let didCleanup = false;

      try {
        const registrations = await navigator.serviceWorker.getRegistrations();

        if (registrations.length > 0) {
          await Promise.all(
            registrations.map((registration) => registration.unregister()),
          );
          didCleanup = true;
        }
      } catch {
        // Service workers are optional here, so we fail silently.
      }

      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          const staleKeys = keys.filter((key) =>
            key.startsWith("southmississippi-sports"),
          );

          if (staleKeys.length > 0) {
            await Promise.all(staleKeys.map((key) => caches.delete(key)));
            didCleanup = true;
          }
        } catch {
          // Cache cleanup is best-effort only.
        }
      }

      if (didCleanup && sessionStorage.getItem(cleanupFlag) !== "done") {
        sessionStorage.setItem(cleanupFlag, "done");
        window.location.reload();
      }
    })();
  }, []);

  return null;
}

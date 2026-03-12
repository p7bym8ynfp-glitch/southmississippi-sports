"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      )
      .catch(() => {
        // Service workers are optional here, so we fail silently.
      });

    if ("caches" in window) {
      void caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("southmississippi-sports"))
              .map((key) => caches.delete(key)),
          ),
        )
        .catch(() => {
          // Cache cleanup is best-effort only.
        });
    }
  }, []);

  return null;
}

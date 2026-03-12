"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/service-worker.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => {
        // Service workers are optional here, so we fail silently.
      });
  }, []);

  return null;
}

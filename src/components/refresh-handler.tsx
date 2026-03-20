"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RefreshHandler({ hasBundle }: { hasBundle: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasBundle) {
      const interval = setInterval(() => {
        router.refresh();
      }, 5000);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 30000); // Stop after 30 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [hasBundle, router]);

  return null;
}

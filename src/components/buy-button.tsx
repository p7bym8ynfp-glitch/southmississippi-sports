"use client";

import { useState, useTransition } from "react";

import type { ProductKind } from "@/lib/types";

type BuyButtonProps = {
  kind: ProductKind;
  gameId: string;
  photoId?: string;
  className?: string;
  children: React.ReactNode;
};

export function BuyButton({
  kind,
  gameId,
  photoId,
  className,
  children,
}: BuyButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setError(null);

            const response = await fetch("/api/checkout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ kind, gameId, photoId }),
            });

            const payload = (await response.json()) as {
              error?: string;
              url?: string;
            };

            if (!response.ok || !payload.url) {
              setError(
                payload.error || "Checkout could not start. Please try again.",
              );
              return;
            }

            window.location.href = payload.url;
          });
        }}
      >
        {pending ? "Opening checkout..." : children}
      </button>
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  );
}

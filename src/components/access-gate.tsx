"use client";

import React, { useEffect, useState } from "react";

interface AccessGateProps {
  children: React.ReactNode;
  requiredCode: string;
}

export function AccessGate({ children, requiredCode }: AccessGateProps) {
  const [granted, setGranted] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isGranted = localStorage.getItem("site-access-granted") === "true";
    if (isGranted || !requiredCode) {
      setGranted(true);
    }
    setLoading(false);
  }, [requiredCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === requiredCode.trim().toLowerCase()) {
      localStorage.setItem("site-access-granted", "true");
      setGranted(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (loading) return null;

  if (granted) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080a0c] p-6 text-white text-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-[linear-gradient(135deg,#a13b2f,#1f3857)] flex items-center justify-center shadow-xl">
             <img src="/storage/watermark.png" alt="QR Access" className="w-12 h-12 invert brightness-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">South Mississippi Sports</h1>
          <p className="text-slate-400">
            Please enter your access code to enter the gallery.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter access code"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-xl focus:border-[#a13b2f] focus:outline-none focus:ring-1 focus:ring-[#a13b2f] transition-all"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm font-medium animate-in slide-in-from-top-2">
              Incorrect code. Please try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-[#a13b2f] py-4 text-lg font-semibold shadow-lg hover:bg-[#b14a3e] active:scale-[0.98] transition-all"
          >
            Enter Website
          </button>
        </form>

        <p className="text-xs text-slate-500 uppercase tracking-widest pt-8">
          The code is encoded in your physical ticket QR code
        </p>
      </div>
    </div>
  );
}

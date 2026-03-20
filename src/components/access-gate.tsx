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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050d18] p-6 text-white text-center font-sans overflow-hidden">
      {/* Background with Stadium Hero */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 grayscale-[40%]" 
        style={{ backgroundImage: 'url("/hero-bg.png")' }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-[#050d18] via-[#050d18]/80 to-transparent" />
      
      <div className="relative z-10 w-full max-w-sm space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="space-y-6">
          <div className="mx-auto w-32 h-32 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl group transition-all duration-500 hover:border-[#ff3b3b]/50">
             <img 
               src="/watermark.png" 
               alt="QR Access" 
               className="w-20 h-20 opacity-80 group-hover:opacity-100 transition-opacity" 
               onError={(e) => (e.currentTarget.style.display = 'none')} 
             />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter uppercase italic leading-[1] text-white">
              SOUTHERN MISSISSIPPI SPORTS
            </h1>
            <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#ff3b3b]">
              ACCESS GATEWAY
            </p>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Please enter your unique access code found on your event ticket to enter the public gallery.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER CODE"
              className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-5 text-center text-2xl font-bold tracking-widest placeholder:text-slate-600 focus:border-[#ff3b3b] focus:outline-none focus:ring-1 focus:ring-[#ff3b3b] transition-all"
              autoFocus
            />
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#ff3b3b]/0 group-focus-within:ring-[#ff3b3b]/20 transition-all pointer-events-none" />
          </div>
          
          {error && (
            <p className="text-red-500 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-2">
              ACCESS DENIED. INVALID CODE.
            </p>
          )}
          
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#ff3b3b] py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgba(255,59,59,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            VERIFY & ENTER
          </button>
        </form>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] pt-12 border-t border-white/5">
          STADIUM MEDIA ACCESS SYSTEM 2.0
        </p>
      </div>
    </div>
  );
}

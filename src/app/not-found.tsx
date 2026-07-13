"use client";

import React from "react";
import Link from "next/link";
import { Compass, Navigation } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-navy-dark p-6 font-sans">
      <div className="glass-panel max-w-md w-full p-8 border border-brand-surface-3/30 rounded-2xl flex flex-col gap-6 text-center shadow-2xl relative bg-brand-navy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-gate-purple/5 rounded-full blur-3xl -z-10" aria-hidden="true"></div>
        
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 bg-brand-gate-purple/10 border border-brand-gate-purple/30 rounded-full flex items-center justify-center text-brand-gate-purple glow-pulse-blue">
            <Compass size={24} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-black tracking-wider uppercase text-white mt-2">
            Section Not Found
          </h2>
          <p className="text-[10px] text-brand-gate-purple font-bold uppercase tracking-widest">
            HTTP 404 Alert
          </p>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          The ticket section or operations sub-route you are attempting to visit does not exist inside MetLife Stadium.
        </p>

        <div className="flex justify-center mt-2">
          <Link
            href="/"
            className="px-6 py-2.5 bg-white text-black font-bold rounded-md hover:bg-brand-ops-cyan hover:text-black transition-all duration-300 text-xs flex items-center justify-center gap-2"
          >
            <Navigation size={14} aria-hidden="true" />
            Return to ArenaSync Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

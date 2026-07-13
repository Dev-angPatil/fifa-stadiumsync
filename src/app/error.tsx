"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("MetLife Operations Console Crash:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-navy-dark p-6 font-sans">
      <div className="glass-panel max-w-lg w-full p-8 border border-brand-medical-red/30 rounded-2xl flex flex-col gap-6 text-center shadow-2xl relative bg-brand-navy">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-medical-red/5 rounded-full blur-3xl -z-10" aria-hidden="true"></div>
        
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 bg-brand-medical-red/10 border border-brand-medical-red/30 rounded-full flex items-center justify-center text-brand-medical-red glow-pulse-rose">
            <AlertTriangle size={24} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-black tracking-wider uppercase text-white mt-2">
            Logistics Console Interruption
          </h2>
          <p className="text-[10px] text-brand-medical-red font-bold uppercase tracking-widest">
            System Error Boundary
          </p>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          The operations dashboard encountered an unexpected rendering bottleneck or telemetry stream mismatch. Diagnostic details have been logged to the command center.
        </p>

        <div className="bg-brand-navy-dark border border-brand-surface-3/30 rounded-lg p-4 text-left font-mono text-[10px] text-slate-300">
          <span className="text-brand-medical-red font-bold uppercase tracking-wider block mb-1">Error Digest:</span>
          <code className="block break-all leading-normal">
            {error.message || "Unknown client-side exception"}
          </code>
          {error.digest && (
            <span className="block mt-1 text-slate-500 font-semibold">
              ID: {error.digest}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-white text-black font-bold rounded-md hover:bg-brand-ops-cyan hover:text-black transition-all duration-300 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Reset Logistics Console
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-surface-2 text-slate-300 border border-brand-surface-3/45 font-bold rounded-md hover:bg-brand-surface-3 hover:text-white transition-all duration-300 text-xs cursor-pointer"
          >
            Force Reload Application
          </button>
        </div>
      </div>
    </div>
  );
}

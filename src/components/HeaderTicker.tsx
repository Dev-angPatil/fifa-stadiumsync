"use client";

import React from "react";
import { METLIFE_STADIUM_INFO, SustainabilityMetrics } from "@/lib/stadiumData";

interface HeaderTickerProps {
  sustainability: SustainabilityMetrics;
}

export default function HeaderTicker({ sustainability }: HeaderTickerProps) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="bg-brand-navy-dark text-xs font-semibold py-2 px-4 flex items-center justify-between border-b border-brand-surface-3/30 overflow-x-auto whitespace-nowrap gap-6 z-10"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-brand-eco-green animate-pulse"></span>
        <span className="text-brand-alert-yellow font-bold">LIVE MATCH:</span>
        <span className="text-slate-100">{METLIFE_STADIUM_INFO.matchDescription}</span>
      </div>
      <div className="flex items-center gap-6 text-slate-400">
        <span>🏟️ Attendance: <strong className="text-white font-bold">{METLIFE_STADIUM_INFO.currentAttendance.toLocaleString()} / {METLIFE_STADIUM_INFO.capacity.toLocaleString()}</strong></span>
        <span>🌤️ Weather: <strong className="text-white font-bold">{METLIFE_STADIUM_INFO.weather}</strong></span>
        <span className="flex items-center gap-1">⚡ Renewables: <strong className="text-brand-eco-green font-bold">{sustainability.energyRenewablePercent}%</strong></span>
        <span>♻️ Compost/Recycle: <strong className="text-white font-bold">{(sustainability.compostWasteKg + sustainability.recycleWasteKg).toLocaleString()} kg</strong></span>
      </div>
    </div>
  );
}

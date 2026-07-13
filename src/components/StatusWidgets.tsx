"use client";

import React from "react";
import { GateInfo, TransitRoute, SustainabilityMetrics } from "@/lib/stadiumData";
import { Clock, Bus, Leaf, Droplet, Trash2 } from "lucide-react";

interface StatusWidgetsProps {
  gates: GateInfo[];
  transits: TransitRoute[];
  sustainability: SustainabilityMetrics;
}

export default function StatusWidgets({ gates, transits, sustainability }: StatusWidgetsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      
      {/* Gates Queue List (Terraform Purple theme) */}
      <section aria-labelledby="wait-times-heading" className="glass-panel rounded-2xl p-4 flex flex-col gap-3 bg-brand-navy border border-brand-surface-3/30 hover:border-brand-gate-purple/30 transition-all duration-300">
        <h3 id="wait-times-heading" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Clock size={14} className="text-brand-gate-purple" aria-hidden="true" />
          Live Gate Wait Times
        </h3>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
          {gates.map((g) => (
            <div key={g.id} className="flex items-center justify-between text-xs py-1.5 px-2 bg-brand-navy-dark border border-brand-surface-3/20 rounded-lg">
              <span className="font-semibold text-slate-200">{g.name.split(" ")[0]}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-black text-[10px] border ${
                  g.status === "Open"
                    ? g.queueTimeMin > 20 
                      ? "bg-brand-alert-yellow/10 text-brand-alert-yellow border-brand-alert-yellow/20" 
                      : "bg-brand-gate-purple/10 text-brand-gate-purple border-brand-gate-purple/20"
                    : g.status === "Delayed" 
                      ? "bg-brand-alert-yellow/10 text-brand-alert-yellow border-brand-alert-yellow/20" 
                      : "bg-brand-medical-red/10 text-brand-medical-red border-brand-medical-red/20"
                }`}>
                  {g.status === "Open" ? `${g.queueTimeMin} min` : g.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Public Transit status (Vagrant Blue theme) */}
      <section aria-labelledby="transit-heading" className="glass-panel rounded-2xl p-4 flex flex-col gap-3 bg-brand-navy border border-brand-surface-3/30 hover:border-brand-transit-blue/30 transition-all duration-300">
        <h3 id="transit-heading" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Bus size={14} className="text-brand-transit-blue" aria-hidden="true" />
          Transit & Egress Schedules
        </h3>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
          {transits.map((t) => (
            <div key={t.id} className="flex flex-col gap-0.5 text-xs py-1.5 px-2 bg-brand-navy-dark border border-brand-surface-3/20 rounded-lg">
              <div className="flex justify-between items-center font-semibold text-slate-200">
                <span className="truncate">{t.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                  t.status === "Normal" 
                    ? "bg-brand-transit-blue/10 text-brand-transit-blue border-brand-transit-blue/20" 
                    : "bg-brand-alert-yellow/10 text-brand-alert-yellow border-brand-alert-yellow/20"
                }`}>
                  {t.status === "Normal" ? `${t.nextDepartureMin}m dep` : "Delayed"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">{t.statusMessage}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainability Metrics (Nomad Green theme) */}
      <section aria-labelledby="sustainability-heading" className="glass-panel rounded-2xl p-4 flex flex-col gap-3 bg-brand-navy border border-brand-surface-3/30 hover:border-brand-eco-green/30 transition-all duration-300">
        <h3 id="sustainability-heading" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Leaf size={14} className="text-brand-eco-green" aria-hidden="true" />
          World Cup Sustainability
        </h3>
        <div className="flex flex-col gap-2 text-xs">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Clean Energy (Solar Canopy)</span>
              <span className="font-bold text-brand-eco-green">{sustainability.energyRenewablePercent}%</span>
            </div>
            <div className="w-full bg-brand-surface-2 rounded-full h-1.5">
              <div className="bg-brand-eco-green h-1.5 rounded-full" style={{ width: `${sustainability.energyRenewablePercent}%` }}></div>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 bg-brand-navy-dark px-2 rounded-lg border border-brand-surface-3/20">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Droplet size={10} className="text-brand-ops-cyan" aria-hidden="true" /> Water Saved
            </span>
            <span className="font-bold text-white text-xs">{sustainability.waterSavedGallons.toLocaleString()} gal</span>
          </div>

          <div className="flex justify-between items-center py-1 bg-brand-navy-dark px-2 rounded-lg border border-brand-surface-3/20">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Trash2 size={10} className="text-brand-eco-green" aria-hidden="true" /> Compost / Recycle
            </span>
            <span className="font-bold text-white text-xs">{(sustainability.compostWasteKg + sustainability.recycleWasteKg).toLocaleString()} kg</span>
          </div>
        </div>
      </section>

    </div>
  );
}

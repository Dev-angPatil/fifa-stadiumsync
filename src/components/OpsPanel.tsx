"use client";

import React from "react";
import { StadiumIncident } from "@/lib/stadiumData";
import { ShieldAlert, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";

interface OpsPanelProps {
  aiAdvice: {
    alerts: string[];
    recommendations: {
      title: string;
      description: string;
      priority: "Low" | "Medium" | "High" | "Critical";
      impactArea: string;
      suggestedAction: string;
    }[];
  };
  incidents: StadiumIncident[];
  onSimulateIncident: (
    category: StadiumIncident["category"],
    section: string,
    description: string,
    severity: StadiumIncident["severity"]
  ) => void;
  onDispatchIncident: (id: string) => void;
  onResolveIncident: (id: string, description: string) => void;
}

export default function OpsPanel({
  aiAdvice,
  incidents,
  onSimulateIncident,
  onDispatchIncident,
  onResolveIncident
}: OpsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      
      {/* AI Dispatch & Recommendations (Waypoint Cyan Theme) */}
      <article aria-labelledby="ai-ops-heading" className="glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-brand-ops-cyan/20 bg-brand-navy">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-ops-cyan/10 text-brand-ops-cyan">
              <Sparkles size={16} aria-hidden="true" />
            </div>
            <div>
              <h3 id="ai-ops-heading" className="font-extrabold text-white text-xs tracking-wider uppercase">Ops AI Anomaly Dispatch</h3>
              <p className="text-[10px] text-brand-ops-cyan font-bold uppercase tracking-widest mt-0.5">Waypoint Advisor</p>
            </div>
          </div>
          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded font-mono text-slate-400 flex items-center gap-1 border border-brand-surface-3/30">
            <RefreshCw size={8} className="animate-spin text-brand-ops-cyan" aria-hidden="true" />
            Reactive
          </span>
        </div>

        {/* AI Alerts Ticker (Vault Yellow / Consul Red Theme) */}
        {aiAdvice.alerts.length > 0 && (
          <div className="bg-brand-medical-red/10 border border-brand-medical-red/20 rounded-xl p-3 flex flex-col gap-1.5" role="alert" aria-live="assertive">
            <span className="text-[10px] font-black uppercase text-brand-medical-red tracking-widest flex items-center gap-1">
              <AlertTriangle size={12} aria-hidden="true" />
              Active Operations Anomalies
            </span>
            <div className="flex flex-col gap-1 text-[11px] text-slate-200 pl-1">
              {aiAdvice.alerts.slice(0, 3).map((alert, i) => (
                <div key={i} className="flex items-start gap-1">
                  <span className="text-brand-medical-red" aria-hidden="true">•</span>
                  <span className="truncate">{alert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions Card List */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[290px] pr-1" aria-label="AI Recommendations list">
          {aiAdvice.recommendations.map((rec, i) => {
            const priorityStyles = 
              rec.priority === "Critical" 
                ? "bg-brand-medical-red/20 text-brand-medical-red border-brand-medical-red/35" 
                : rec.priority === "High" 
                  ? "bg-brand-alert-yellow/20 text-brand-alert-yellow border-brand-alert-yellow/35"
                  : "bg-brand-transit-blue/20 text-brand-transit-blue border-brand-transit-blue/35";

            return (
              <div 
                key={i} 
                className="bg-brand-surface-2 border border-brand-surface-3/40 rounded-xl p-3.5 flex flex-col gap-2 relative hover:border-brand-ops-cyan/35 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white leading-tight">{rec.title}</span>
                  <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded border ${priorityStyles}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{rec.description}</p>
                
                <div className="bg-brand-navy-dark border border-brand-surface-3/20 rounded-lg p-2.5 mt-1 text-[10px] text-slate-300">
                  <span className="font-extrabold text-brand-ops-cyan uppercase tracking-wider block mb-1">Suggested AI Action Plan:</span>
                  {rec.suggestedAction}
                </div>
              </div>
            );
          })}
        </div>
      </article>

      {/* Operations Incident Control (Simulator) */}
      <article aria-labelledby="ops-sim-heading" className="glass-panel rounded-2xl p-5 flex flex-col gap-4 bg-brand-navy border border-brand-surface-3/30">
        <div>
          <h3 id="ops-sim-heading" className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-1.5">
            <ShieldAlert size={16} className="text-brand-alert-yellow" aria-hidden="true" />
            Ops Incident Center (Simulator)
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Trigger sensor and logistics anomalies to test AI recommendations</p>
        </div>

        {/* Simulation Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onSimulateIncident(
              "Safety",
              "Gate C Plaza",
              "Scanner hardware fault in entry Plaza Gate C. Queue backlog expanding.",
              "High"
            )}
            aria-label="Simulate Gate C scanner fault"
            className="py-2.5 px-3 rounded-md border border-brand-medical-red/20 bg-brand-medical-red/5 hover:bg-brand-medical-red/15 text-brand-medical-red text-left transition-colors font-medium flex flex-col justify-between h-16 cursor-pointer"
          >
            <span className="text-[10px] font-bold">🚨 GATE C FAULT</span>
            <span className="text-[9px] text-slate-400">Jam scanners</span>
          </button>

          <button
            onClick={() => onSimulateIncident(
              "Crowd",
              "Gate B Entrance",
              "Crowd congestion surge at Gate B. Queue wait exceeds 40 mins.",
              "High"
            )}
            aria-label="Simulate Gate B crowd surge"
            className="py-2.5 px-3 rounded-md border border-brand-alert-yellow/20 bg-brand-alert-yellow/5 hover:bg-brand-alert-yellow/15 text-brand-alert-yellow text-left transition-colors font-medium flex flex-col justify-between h-16 cursor-pointer"
          >
            <span className="text-[10px] font-bold">👥 GATE B SURGE</span>
            <span className="text-[9px] text-slate-400">Simulate bottleneck</span>
          </button>

          <button
            onClick={() => onSimulateIncident(
              "Operations",
              "Concession Sec 128",
              "Concession Jersey Grill register crash. Long serving lines forming.",
              "Medium"
            )}
            aria-label="Simulate concession register crash"
            className="py-2.5 px-3 rounded-md border border-brand-transit-blue/20 bg-brand-transit-blue/5 hover:bg-brand-transit-blue/15 text-brand-transit-blue text-left transition-colors font-medium flex flex-col justify-between h-16 cursor-pointer"
          >
            <span className="text-[10px] font-bold">🍔 CONCESSION CRASH</span>
            <span className="text-[9px] text-slate-400">Grill lines busy</span>
          </button>

          <button
            onClick={() => onSimulateIncident(
              "Operations",
              "Meadowlands Station",
              "NJ Transit Rail signal delay. Egress backup expected at train terminals.",
              "Medium"
            )}
            aria-label="Simulate train signal delay"
            className="py-2.5 px-3 rounded-md border border-brand-gate-purple/20 bg-brand-gate-purple/5 hover:bg-brand-gate-purple/15 text-brand-gate-purple text-left transition-colors font-medium flex flex-col justify-between h-16 cursor-pointer"
          >
            <span className="text-[10px] font-bold">🚆 NJ RAIL DELAY</span>
            <span className="text-[9px] text-slate-400">Train blockages</span>
          </button>
        </div>

        <div className="border-t border-brand-surface-3/20 my-1" aria-hidden="true"></div>

        {/* Active Incident List */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1" aria-label="Active incident list">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Incident Dispatch Queue ({incidents.filter(inc => inc.status !== "Resolved").length})</span>
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-brand-navy-dark border border-brand-surface-3/20 rounded-lg p-2.5 flex flex-col gap-1.5 text-[11px] relative">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">{inc.section}</span>
                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-black border ${
                  inc.status === "New" 
                    ? "bg-brand-medical-red/10 text-brand-medical-red border-brand-medical-red/20" 
                    : inc.status === "Dispatched" 
                      ? "bg-brand-alert-yellow/10 text-brand-alert-yellow border-brand-alert-yellow/20" 
                      : "bg-brand-eco-green/10 text-brand-eco-green border-brand-eco-green/20"
                }`}>
                  {inc.status}
                </span>
              </div>
              <p className="text-slate-400 leading-tight">{inc.description}</p>
              
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-brand-surface-3/20">
                <span className="text-slate-500 truncate">Staff: <strong className="text-slate-300 font-medium">{inc.assignedStaff}</strong></span>
                <div className="flex gap-1 shrink-0">
                  {inc.status === "New" && (
                    <button 
                      onClick={() => onDispatchIncident(inc.id)}
                      aria-label={`Dispatch staff for incident at ${inc.section}`}
                      className="px-2.5 py-0.5 bg-white text-black font-bold rounded text-[9px] hover:bg-brand-ops-cyan hover:text-black transition-colors cursor-pointer"
                    >
                      Dispatch
                    </button>
                  )}
                  {inc.status !== "Resolved" && (
                    <button 
                      onClick={() => onResolveIncident(inc.id, inc.description)}
                      aria-label={`Resolve incident at ${inc.section}`}
                      className="px-2.5 py-0.5 bg-brand-surface-2 text-slate-300 border border-brand-surface-3/45 font-bold rounded text-[9px] hover:bg-brand-surface-3 transition-colors cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

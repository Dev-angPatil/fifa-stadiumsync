"use client";

import React from "react";
import { GateInfo, ConcessionStand, StadiumIncident } from "@/lib/stadiumData";
import { AlertTriangle, Layers } from "lucide-react";

interface StadiumMapProps {
  gates: GateInfo[];
  concessions: ConcessionStand[];
  incidents: StadiumIncident[];
}

export default function StadiumMap({ gates, concessions, incidents }: StadiumMapProps) {
  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden bg-brand-navy border border-brand-surface-3/30">
      {/* Ambient Background Lights */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-ops-cyan/5 rounded-full blur-3xl -z-10" aria-hidden="true"></div>
      
      <div className="flex items-center justify-between">
        <div>
          <h2 id="map-heading" className="font-extrabold text-white flex items-center gap-2 text-sm tracking-wide uppercase">
            <Layers size={16} className="text-brand-ops-cyan" aria-hidden="true" />
            MetLife Arena Digital Twin Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">Live gate queues, concessions, and active logistics incidents</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] bg-brand-eco-green/10 text-brand-eco-green px-2.5 py-1 rounded-md font-semibold border border-brand-eco-green/20 animate-pulse" aria-live="polite">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-eco-green" aria-hidden="true"></span>
            Telemetry Stream Active
          </span>
        </div>
      </div>

      {/* Stadium SVG Interactive Grid Map */}
      <div 
        role="region" 
        aria-label="MetLife Arena Digital Twin Map showing live gate wait times, concession statuses, and active incidents" 
        className="w-full aspect-[4/3] max-h-[460px] bg-brand-navy-dark border border-brand-surface-3/45 rounded-xl p-6 flex items-center justify-center relative overflow-hidden shadow-inner"
      >
        {/* Grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true"></div>
        
        {/* Main Stadium Outer Ring */}
        <div className="relative w-full h-full max-w-[480px] max-h-[360px] border-4 border-dashed border-brand-surface-3/20 rounded-[80px_160px] flex items-center justify-center">
          
          {/* Stadium Middle Ring */}
          <div className="w-[82%] h-[82%] border border-brand-surface-3/30 rounded-[60px_120px] flex items-center justify-center bg-brand-navy-dark/40">
            
            {/* Inner Bowl / Field */}
            <div className="w-[65%] h-[65%] bg-gradient-to-br from-brand-eco-green/5 via-brand-navy/60 to-brand-ops-cyan/10 border-2 border-brand-eco-green/30 rounded-[40px_80px] flex flex-col items-center justify-center p-4 relative shadow-2xl">
              <div className="absolute inset-4 border border-brand-surface-3/20 rounded-[30px_60px] flex flex-col items-center justify-center">
                <span className="text-[9px] font-black uppercase text-brand-eco-green/60 tracking-widest">MetLife Field</span>
                <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-wider">FIFA Pitch Layout</span>
              </div>
            </div>
          </div>

          {/* Gate SVG Markers */}
          {gates.map((gate) => {
            const statusColors = 
              gate.status === "Open" 
                ? gate.queueTimeMin > 20 
                  ? "bg-brand-alert-yellow text-brand-alert-yellow border-brand-alert-yellow/20" 
                  : "bg-brand-eco-green text-brand-eco-green border-brand-eco-green/20"
                : gate.status === "Delayed"
                  ? "bg-brand-alert-yellow text-brand-alert-yellow border-brand-alert-yellow/20 animate-pulse"
                  : "bg-brand-medical-red text-brand-medical-red border-brand-medical-red/20";

            return (
              <div 
                key={gate.id} 
                style={{ left: `${gate.coordinate.x}%`, top: `${gate.coordinate.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                role="button"
                tabIndex={0}
                aria-label={`${gate.name}. Wait time is ${gate.queueTimeMin} minutes. Status is ${gate.status}.`}
              >
                {/* Pulse Ring */}
                <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-35 animate-ping -z-10 ${
                  gate.status === "Open"
                    ? gate.queueTimeMin > 20 ? "bg-brand-alert-yellow" : "bg-brand-eco-green"
                    : gate.status === "Delayed" ? "bg-brand-alert-yellow" : "bg-brand-medical-red"
                }`} aria-hidden="true"></span>

                <div className={`h-7 w-7 rounded-full flex items-center justify-center border font-bold text-[9px] shadow-lg bg-brand-navy-dark ${statusColors}`} aria-hidden="true">
                  {gate.id.split("-")[1].toUpperCase()}
                </div>
                
                {/* Popover tooltip */}
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-44 bg-brand-surface-2 border border-brand-surface-3 p-2.5 rounded-lg text-left shadow-2xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-30">
                  <p className="text-xs font-black text-white">{gate.name}</p>
                  <div className="flex justify-between items-center mt-1 text-[10px]">
                    <span className="text-slate-400">Status:</span>
                    <span className={`font-bold ${gate.status === "Open" ? "text-brand-eco-green" : "text-brand-medical-red"}`}>{gate.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Queue Time:</span>
                    <span className="font-bold text-white">{gate.queueTimeMin} mins</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Flow Rate:</span>
                    <span className="font-bold text-slate-200">{gate.currentFlow} pax/min</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Concession Stand Markers */}
          {concessions.map((con) => (
            <div 
              key={con.id} 
              style={{ left: `${con.coordinate.x}%`, top: `${con.coordinate.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              role="button"
              tabIndex={0}
              aria-label={`${con.name}. Proximity: ${con.location}. Wait time is ${con.queueTimeMin} minutes. Featured item: ${con.featuredItem}. ${con.isEcoFriendly ? 'Eco-friendly certified.' : ''}`}
            >
              <div className={`h-4 w-4 rounded-full flex items-center justify-center border text-[8px] font-black shadow-md ${
                con.isEcoFriendly 
                  ? "bg-brand-eco-green/10 text-brand-eco-green border-brand-eco-green/30" 
                  : "bg-brand-transit-blue/10 text-brand-transit-blue border-brand-transit-blue/30"
              }`} aria-hidden="true">
                🏪
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 bg-brand-surface-2 border border-brand-surface-3 p-2.5 rounded-lg text-left shadow-2xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-30">
                <p className="text-xs font-bold text-white">{con.name}</p>
                <p className="text-[10px] text-brand-eco-green mt-0.5">{con.featuredItem}</p>
                <div className="flex justify-between items-center mt-1 text-[10px]">
                  <span className="text-slate-400">Wait:</span>
                  <span className="font-bold text-white">{con.queueTimeMin} mins</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Eco-Friendly:</span>
                  <span className="font-bold text-brand-eco-green">{con.isEcoFriendly ? "Yes ✅" : "No"}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Active Incidents Overlay Markers */}
          {incidents.filter(inc => inc.status !== "Resolved").map((inc) => (
            <div 
              key={inc.id}
              className="absolute z-20 cursor-pointer animate-bounce"
              style={{ 
                left: inc.section.includes("Gate C") ? "75%" : inc.section.includes("124") ? "45%" : "30%", 
                top: inc.section.includes("Gate C") ? "75%" : inc.section.includes("124") ? "60%" : "25%" 
              }}
              role="alert"
              tabIndex={0}
              aria-label={`Incident reported: ${inc.description}. Section: ${inc.section}. Severity: ${inc.severity}. Status: ${inc.status}. Assigned to: ${inc.assignedStaff}.`}
            >
              <div className={`h-6 w-6 border border-white rounded-full flex items-center justify-center text-xs shadow-lg ${
                inc.category === "Medical" 
                  ? "bg-brand-medical-red glow-pulse-rose" 
                  : "bg-brand-alert-yellow glow-pulse-amber"
              }`} aria-hidden="true">
                🚨
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-brand-surface-2 border border-brand-surface-3 p-2.5 rounded-lg text-left shadow-2xl z-30">
                <div className="flex items-center gap-1.5 text-[10px] text-brand-alert-yellow font-bold uppercase">
                  <AlertTriangle size={10} aria-hidden="true" />
                  {inc.category} Alert
                </div>
                <p className="text-xs font-bold text-white mt-1">{inc.description}</p>
                <div className="flex justify-between items-center mt-1.5 text-[10px]">
                  <span className="text-slate-400">Assigned to:</span>
                  <span className="font-semibold text-slate-200">{inc.assignedStaff}</span>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-2 pt-3 border-t border-brand-surface-3/30 text-xs text-slate-400" aria-label="Map legend">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-eco-green" aria-hidden="true"></span> Gate Open (Low Queue)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-alert-yellow" aria-hidden="true"></span> Gate Congested
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-alert-yellow animate-pulse" aria-hidden="true"></span> Gate Technical Issue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-eco-green" aria-hidden="true"></span> Eco Concession Stand
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-brand-medical-red flex items-center justify-center text-[7px]" aria-hidden="true">🚨</span> Active Incident
        </span>
      </div>
    </div>
  );
}

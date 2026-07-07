"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  INITIAL_GATES, 
  INITIAL_CONCESSIONS, 
  INITIAL_TRANSIT, 
  INITIAL_SUSTAINABILITY, 
  INITIAL_INCIDENTS,
  METLIFE_STADIUM_INFO,
  GateInfo,
  ConcessionStand,
  TransitRoute,
  StadiumIncident,
  SustainabilityMetrics,
  getRouteForSection
} from "@/lib/stadiumData";
import { getFanAIResponse, getOpsAIAdvice } from "@/lib/gemini";
import { 
  ShieldAlert, 
  Users, 
  Compass, 
  Bus, 
  Leaf, 
  AlertTriangle, 
  Send, 
  Clock, 
  Navigation, 
  Activity, 
  Languages, 
  Accessibility, 
  Search, 
  Droplet,
  Trash2,
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function Home() {
  // Application Roles / Tabs: 'ops' (Stadium Operations) or 'fan' (Fan Companion)
  const [activeRole, setActiveRole] = useState<"ops" | "fan">("ops");

  // Live Simulation States
  const [gates, setGates] = useState<GateInfo[]>(INITIAL_GATES);
  const [concessions, setConcessions] = useState<ConcessionStand[]>(INITIAL_CONCESSIONS);
  const [transits, setTransits] = useState<TransitRoute[]>(INITIAL_TRANSIT);
  const [sustainability] = useState<SustainabilityMetrics>(INITIAL_SUSTAINABILITY);
  const [incidents, setIncidents] = useState<StadiumIncident[]>(INITIAL_INCIDENTS);
  
  // AI Ops Recommendations State
  const [aiAdvice, setAiAdvice] = useState<{
    alerts: string[];
    recommendations: {
      title: string;
      description: string;
      priority: "Low" | "Medium" | "High" | "Critical";
      impactArea: string;
      suggestedAction: string;
    }[];
  }>({ alerts: [], recommendations: [] });

  // Fan Portal states
  const [fanTicketSection, setFanTicketSection] = useState<string>("114");

  // Calculate route dynamically on render to avoid cascading renders
  const routingResult = React.useMemo(() => {
    const secNum = parseInt(fanTicketSection);
    if (!isNaN(secNum) && secNum >= 100 && secNum <= 350) {
      return getRouteForSection(secNum, gates, concessions);
    }
    return null;
  }, [fanTicketSection, gates, concessions]);
  
  // Chatbot states
  const [chatMessages, setChatMessages] = useState<{
    sender: "bot" | "user";
    text: string;
    detectedLang?: string;
    suggestedAction?: { label: string; action: string };
  }[]>([
    {
      sender: "bot",
      text: "Welcome to MetLife Stadium! I am your ArenaSync AI Companion. Ask me anything about tickets, safety, transportation, sustainability, or accessibility at the stadium in Spanish, French, Arabic, German, or English!",
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Trigger AI Operations update whenever the stadium state changes
  useEffect(() => {
    async function updateAIAdvice() {
      const advice = await getOpsAIAdvice(gates, concessions, transits, incidents);
      setAiAdvice(advice);
    }
    updateAIAdvice();
  }, [gates, concessions, transits, incidents]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotTyping]);

  // Handle fan sending message to chatbot
  const handleSendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    setChatMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setUserInput("");
    setIsBotTyping(true);

    // Call GenAI interface
    const response = await getFanAIResponse(textToSend);

    setIsBotTyping(false);
    setChatMessages((prev) => [
      ...prev,
      { 
        sender: "bot", 
        text: response.text, 
        detectedLang: response.detectedLanguage,
        suggestedAction: response.suggestedAction
      }
    ]);
  };

  // Preset quick questions for fans
  const quickQuestions = [
    { label: "Is Gate C busy?", q: "Is Gate C experiencing delays or long queues?" },
    { label: "How to NYC?", q: "What is the best way to travel back to New York City after the game?" },
    { label: "Sensory Rooms?", q: "Where are the sensory rooms and accessible services located?" },
    { label: "Eco refill?", q: "Can I bring my own water bottle, and where are the refill stations?" }
  ];

  // Quick Action: Simulate stadium incident
  const handleSimulateIncident = (
    category: StadiumIncident["category"],
    section: string,
    description: string,
    severity: StadiumIncident["severity"]
  ) => {
    const newInc: StadiumIncident = {
      id: `inc-${Date.now()}`,
      category,
      section,
      description,
      reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "New",
      severity,
      assignedStaff: "Pending Dispatch"
    };

    setIncidents((prev) => [newInc, ...prev]);

    // Apply side-effects for realism
    if (description.includes("Gate C")) {
      setGates((prev) => prev.map(g => g.id === "gate-c" ? { ...g, status: "Delayed", queueTimeMin: 55 } : g));
    } else if (description.includes("Gate B")) {
      setGates((prev) => prev.map(g => g.id === "gate-b" ? { ...g, queueTimeMin: 40, currentFlow: 220 } : g));
    } else if (description.includes("Concession Jersey Grill")) {
      setConcessions((prev) => prev.map(c => c.id === "con-2" ? { ...c, status: "Busy", queueTimeMin: 30 } : c));
    } else if (description.includes("NJ Transit")) {
      setTransits((prev) => prev.map(t => t.id === "transit-train" ? { ...t, status: "Delayed", statusMessage: "Signal delay near Secaucus. Expect 15-minute gaps." } : t));
    }
  };

  // Dispatch incident staff
  const handleDispatchIncident = (id: string) => {
    setIncidents((prev) => prev.map(inc => {
      if (inc.id === id) {
        let assigned = "Security Rapid Unit 4";
        if (inc.category === "Sustainability") assigned = "Eco-Squad Volunteers (Unit Green)";
        if (inc.category === "Medical") assigned = "First Aid Unit 2 + Volunteer Steward Unit 5";
        return { ...inc, status: "Dispatched", assignedStaff: assigned };
      }
      return inc;
    }));
  };

  // Resolve incident
  const handleResolveIncident = (id: string, description: string) => {
    setIncidents((prev) => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: "Resolved", assignedStaff: "Resolved" };
      }
      return inc;
    }));

    // Reset affected gates/concessions
    if (description.includes("Gate C")) {
      setGates((prev) => prev.map(g => g.id === "gate-c" ? { ...g, status: "Open", queueTimeMin: 12 } : g));
    } else if (description.includes("Gate B")) {
      setGates((prev) => prev.map(g => g.id === "gate-b" ? { ...g, queueTimeMin: 15, currentFlow: 140 } : g));
    } else if (description.includes("Concession Jersey Grill")) {
      setConcessions((prev) => prev.map(c => c.id === "con-2" ? { ...c, status: "Active", queueTimeMin: 8 } : c));
    } else if (description.includes("NJ Transit")) {
      setTransits((prev) => prev.map(t => t.id === "transit-train" ? { ...t, status: "Normal", statusMessage: "Trains operating on 10-minute intervals post-match." } : t));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Global Live Match Header Ticker */}
      <div className="bg-gradient-to-r from-brand-navy-dark via-brand-blue to-brand-emerald text-xs font-semibold py-2 px-4 flex items-center justify-between border-b border-white/5 overflow-x-auto whitespace-nowrap gap-6 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand-emerald animate-pulse"></span>
          <span className="text-brand-gold font-bold">LIVE MATCH:</span>
          <span>{METLIFE_STADIUM_INFO.matchDescription}</span>
        </div>
        <div className="flex items-center gap-6 text-slate-300">
          <span>🏟️ Attendance: <strong className="text-white">{METLIFE_STADIUM_INFO.currentAttendance.toLocaleString()} / {METLIFE_STADIUM_INFO.capacity.toLocaleString()}</strong></span>
          <span>🌤️ Weather: <strong className="text-white">{METLIFE_STADIUM_INFO.weather}</strong></span>
          <span className="flex items-center gap-1">⚡ Renewables: <strong className="text-brand-emerald-light">{sustainability.energyRenewablePercent}%</strong></span>
          <span>♻️ Compost/Recycle: <strong className="text-white">{(sustainability.compostWasteKg + sustainability.recycleWasteKg).toLocaleString()} kg</strong></span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="glass-panel sticky top-0 py-4 px-6 flex items-center justify-between z-20 border-x-0">
        <div className="flex items-center gap-3">
          <div className="bg-brand-gold text-brand-navy p-2 rounded-lg font-black text-xl shadow-lg shadow-brand-gold/10 flex items-center justify-center">
            ⚽
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-cyan">
              FIFA ArenaSync
            </h1>
            <p className="text-[10px] text-brand-emerald-light font-bold uppercase tracking-widest">
              World Cup 2026 Operations
            </p>
          </div>
        </div>

        {/* Role Toggle Switch */}
        <div className="bg-brand-navy-dark/80 p-1.5 rounded-full border border-white/5 flex gap-1 shadow-inner">
          <button
            onClick={() => setActiveRole("ops")}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeRole === "ops"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={14} />
            Ops Command Center
          </button>
          <button
            onClick={() => setActiveRole("fan")}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeRole === "fan"
                ? "bg-brand-emerald text-brand-navy-dark shadow-md shadow-brand-emerald/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users size={14} />
            Fan Companion Portal
          </button>
        </div>
      </header>

      {/* 3. Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Lg: 8 cols) - Stadium Visualizer Map & Live Stats */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Stadium Interactive Map Card */}
          <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white flex items-center gap-2 text-base">
                  <Layers size={18} className="text-brand-cyan" />
                  MetLife Arena Digital Twin Map
                </h3>
                <p className="text-xs text-slate-400">Live gate queue times, concessions & active incidents</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Map Feeds
                </span>
              </div>
            </div>

            {/* Stadium SVG Interactive Grid Map */}
            <div className="w-full aspect-[4/3] max-h-[460px] bg-brand-navy-dark/95 border border-white/5 rounded-xl p-6 flex items-center justify-center relative overflow-hidden shadow-inner">
              
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Main Stadium Outer Ring */}
              <div className="relative w-full h-full max-w-[480px] max-h-[360px] border-4 border-dashed border-slate-700/20 rounded-[80px_160px] flex items-center justify-center">
                
                {/* Stadium Middle Ring */}
                <div className="w-[82%] h-[82%] border border-slate-600/30 rounded-[60px_120px] flex items-center justify-center bg-slate-900/10">
                  
                  {/* Inner Bowl / Field */}
                  <div className="w-[65%] h-[65%] bg-gradient-to-br from-brand-emerald/10 via-brand-navy/60 to-brand-blue/20 border-2 border-brand-emerald/40 rounded-[40px_80px] flex flex-col items-center justify-center p-4 relative shadow-2xl">
                    <div className="absolute inset-4 border border-white/5 rounded-[30px_60px] flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase text-brand-emerald/70 tracking-widest">MetLife Field</span>
                      <span className="text-[9px] text-slate-500 mt-1">FIFA Pitch Layout</span>
                    </div>
                  </div>
                </div>

                {/* Gate SVG Markers */}
                {gates.map((gate) => {
                  const statusColors = 
                    gate.status === "Open" 
                      ? gate.queueTimeMin > 20 
                        ? "bg-amber-500 text-amber-500 border-amber-500/20" 
                        : "bg-brand-emerald text-brand-emerald border-brand-emerald/20"
                      : gate.status === "Delayed"
                        ? "bg-yellow-500 text-yellow-500 border-yellow-500/20 animate-pulse"
                        : "bg-rose-500 text-rose-500 border-rose-500/20";

                  return (
                    <div 
                      key={gate.id} 
                      style={{ left: `${gate.coordinate.x}%`, top: `${gate.coordinate.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                    >
                      {/* Pulse Ring */}
                      <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-35 animate-ping -z-10 ${
                        gate.status === "Open"
                          ? gate.queueTimeMin > 20 ? "bg-amber-500" : "bg-brand-emerald"
                          : gate.status === "Delayed" ? "bg-yellow-500" : "bg-rose-500"
                      }`}></span>

                      <div className={`h-7 w-7 rounded-full flex items-center justify-center border font-bold text-[9px] shadow-lg bg-brand-navy-dark ${statusColors}`}>
                        {gate.id.split("-")[1].toUpperCase()}
                      </div>
                      
                      {/* Popover tooltip */}
                      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-44 bg-brand-navy-dark border border-white/10 p-2.5 rounded-lg text-left shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                        <p className="text-xs font-black text-white">{gate.name}</p>
                        <div className="flex justify-between items-center mt-1 text-[10px]">
                          <span className="text-slate-400">Status:</span>
                          <span className={`font-bold ${gate.status === "Open" ? "text-brand-emerald-light" : "text-rose-400"}`}>{gate.status}</span>
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
                  >
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center border text-[8px] font-black shadow-md ${
                      con.isEcoFriendly 
                        ? "bg-brand-emerald-light text-brand-navy border-brand-emerald/30" 
                        : "bg-brand-blue text-white border-white/10"
                    }`}>
                      🏪
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 bg-brand-navy-dark border border-white/10 p-2.5 rounded-lg text-left shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                      <p className="text-xs font-bold text-white">{con.name}</p>
                      <p className="text-[10px] text-brand-emerald-light mt-0.5">{con.featuredItem}</p>
                      <div className="flex justify-between items-center mt-1 text-[10px]">
                        <span className="text-slate-400">Wait:</span>
                        <span className="font-bold text-white">{con.queueTimeMin} mins</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Eco-Friendly:</span>
                        <span className="font-bold text-brand-emerald-light">{con.isEcoFriendly ? "Yes ✅" : "No"}</span>
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
                      // Anchor incident coordinates based on their categories or sections
                      left: inc.section.includes("Gate C") ? "75%" : inc.section.includes("124") ? "45%" : "30%", 
                      top: inc.section.includes("Gate C") ? "75%" : inc.section.includes("124") ? "60%" : "25%" 
                    }}
                  >
                    <div className="h-6 w-6 bg-rose-500 border border-white rounded-full flex items-center justify-center text-xs shadow-lg glow-pulse-rose">
                      🚨
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-brand-navy-dark border border-rose-500 p-2.5 rounded-lg text-left shadow-2xl z-30">
                      <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold uppercase">
                        <AlertTriangle size={10} />
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
            <div className="flex flex-wrap items-center justify-center gap-6 mt-2 pt-3 border-t border-white/5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-emerald"></span> Gate Open (Low Queue)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span> Gate Congested
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 animate-pulse"></span> Gate Delayed / Technical issue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-emerald-light"></span> Eco Concession Stand
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500 flex items-center justify-center text-[7px]">🚨</span> Active Incident
              </span>
            </div>

          </div>

          {/* Stadium Status Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Gates Queue list */}
            <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-brand-cyan" />
                Live Gate Wait Times
              </h4>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
                {gates.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-xs py-1.5 px-2 bg-brand-navy-dark/50 border border-white/5 rounded-lg">
                    <span className="font-semibold text-slate-200">{g.name.split(" ")[0]}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-black ${
                        g.status === "Open"
                          ? g.queueTimeMin > 20 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-brand-emerald-light"
                          : g.status === "Delayed" ? "bg-yellow-500/10 text-yellow-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {g.status === "Open" ? `${g.queueTimeMin} min` : g.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Transit status */}
            <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bus size={14} className="text-brand-cyan" />
                Transit & Egress Schedules
              </h4>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
                {transits.map((t) => (
                  <div key={t.id} className="flex flex-col gap-0.5 text-xs py-1.5 px-2 bg-brand-navy-dark/50 border border-white/5 rounded-lg">
                    <div className="flex justify-between items-center font-semibold text-slate-200">
                      <span className="truncate">{t.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        t.status === "Normal" ? "bg-emerald-500/10 text-brand-emerald-light" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {t.status === "Normal" ? `${t.nextDepartureMin}m dep` : "Delayed"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">{t.statusMessage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sustainability Metrics */}
            <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Leaf size={14} className="text-brand-emerald-light" />
                World Cup Sustainability
              </h4>
              <div className="flex flex-col gap-2 text-xs">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Clean Energy Generation (Solar Ring)</span>
                    <span className="font-bold text-brand-emerald-light">{sustainability.energyRenewablePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-brand-emerald h-1.5 rounded-full" style={{ width: `${sustainability.energyRenewablePercent}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 bg-brand-navy-dark/50 px-2 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Droplet size={10} className="text-blue-400" /> Water Saved</span>
                  <span className="font-bold text-white text-xs">{sustainability.waterSavedGallons.toLocaleString()} gal</span>
                </div>

                <div className="flex justify-between items-center py-1 bg-brand-navy-dark/50 px-2 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Trash2 size={10} className="text-emerald-400" /> Compost / Recycle</span>
                  <span className="font-bold text-white text-xs">{(sustainability.compostWasteKg + sustainability.recycleWasteKg).toLocaleString()} kg</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (Lg: 4 cols) - Role Specific Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* ACTIVE ROLE 1: STADIUM OPERATIONS DASHBOARD */}
          {activeRole === "ops" && (
            <>
              {/* AI Dispatch & Recommendations */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-brand-cyan/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-cyan/10 text-brand-cyan">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Ops AI Anomaly Dispatch</h3>
                      <p className="text-[10px] text-brand-cyan font-bold uppercase tracking-wider">Generative Advisor</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded font-mono text-slate-400 flex items-center gap-1">
                    <RefreshCw size={8} className="animate-spin" />
                    Reactive
                  </span>
                </div>

                {/* AI Alerts Ticker */}
                {aiAdvice.alerts.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Active Operations Anomalies
                    </span>
                    <div className="flex flex-col gap-1 text-[11px] text-slate-200 pl-1">
                      {aiAdvice.alerts.slice(0, 3).map((alert, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-rose-400">•</span>
                          <span className="truncate">{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions Card List */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[290px] pr-1">
                  {aiAdvice.recommendations.map((rec, i) => {
                    const priorityStyles = 
                      rec.priority === "Critical" 
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30" 
                        : rec.priority === "High" 
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30";

                    return (
                      <div 
                        key={i} 
                        className="bg-brand-navy-dark/75 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2 relative hover:border-brand-cyan/30 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-white leading-tight">{rec.title}</span>
                          <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded border ${priorityStyles}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{rec.description}</p>
                        
                        <div className="bg-brand-navy-dark/95 border border-white/5 rounded-lg p-2.5 mt-1 text-[10px] text-slate-300">
                          <span className="font-extrabold text-brand-cyan uppercase tracking-wider block mb-1">Suggested AI Action Plan:</span>
                          {rec.suggestedAction}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operations Incident Control (Simulator) */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <ShieldAlert size={16} className="text-brand-gold" />
                    Ops Incident Center (Simulator)
                  </h3>
                  <p className="text-[10px] text-slate-400">Trigger sensor and logistics anomalies to test AI recommendations</p>
                </div>

                {/* Simulation Buttons Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleSimulateIncident(
                      "Safety",
                      "Gate C Plaza",
                      "Scanner hardware fault in entry Plaza Gate C. Queue backlog expanding.",
                      "High"
                    )}
                    className="py-2 px-3 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 text-left transition-colors font-medium flex flex-col justify-between h-16"
                  >
                    <span className="text-[10px] font-bold text-rose-400">🚨 GATE C FAULT</span>
                    <span className="text-[9px] text-slate-400">Jam scanners</span>
                  </button>

                  <button
                    onClick={() => handleSimulateIncident(
                      "Crowd",
                      "Gate B Entrance",
                      "Crowd congestion surge at Gate B. Queue wait exceeds 40 mins.",
                      "High"
                    )}
                    className="py-2 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 text-left transition-colors font-medium flex flex-col justify-between h-16"
                  >
                    <span className="text-[10px] font-bold text-amber-400">👥 GATE B SURGE</span>
                    <span className="text-[9px] text-slate-400">Simulate bottleneck</span>
                  </button>

                  <button
                    onClick={() => handleSimulateIncident(
                      "Operations",
                      "Concession Sec 128",
                      "Concession Jersey Grill register crash. Long serving lines forming.",
                      "Medium"
                    )}
                    className="py-2 px-3 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-300 text-left transition-colors font-medium flex flex-col justify-between h-16"
                  >
                    <span className="text-[10px] font-bold text-blue-400">🍔 CONCESSION CRASH</span>
                    <span className="text-[9px] text-slate-400">Grill lines busy</span>
                  </button>

                  <button
                    onClick={() => handleSimulateIncident(
                      "Operations",
                      "Meadowlands Station",
                      "NJ Transit Rail signal delay. Egress backup expected at train terminals.",
                      "Medium"
                    )}
                    className="py-2 px-3 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 text-left transition-colors font-medium flex flex-col justify-between h-16"
                  >
                    <span className="text-[10px] font-bold text-purple-400">🚆 NJ RAIL DELAY</span>
                    <span className="text-[9px] text-slate-400">Train blockages</span>
                  </button>
                </div>

                <div className="border-t border-white/5 my-1"></div>

                {/* Active Incident List */}
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Incident Dispatch Queue ({incidents.filter(inc => inc.status !== "Resolved").length})</span>
                  {incidents.map((inc) => (
                    <div key={inc.id} className="bg-brand-navy-dark/60 border border-white/5 rounded-lg p-2.5 flex flex-col gap-1.5 text-[11px] relative">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{inc.section}</span>
                        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-black ${
                          inc.status === "New" ? "bg-rose-500/10 text-rose-400" : inc.status === "Dispatched" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-brand-emerald-light"
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-tight">{inc.description}</p>
                      
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/5">
                        <span className="text-slate-500 truncate">Staff: <strong className="text-slate-300">{inc.assignedStaff}</strong></span>
                        <div className="flex gap-1 shrink-0">
                          {inc.status === "New" && (
                            <button 
                              onClick={() => handleDispatchIncident(inc.id)}
                              className="px-2 py-0.5 bg-brand-cyan text-brand-navy font-bold rounded text-[9px] hover:bg-white transition-colors"
                            >
                              Dispatch
                            </button>
                          )}
                          {inc.status !== "Resolved" && (
                            <button 
                              onClick={() => handleResolveIncident(inc.id, inc.description)}
                              className="px-2 py-0.5 bg-slate-800 text-slate-300 font-bold rounded text-[9px] hover:bg-slate-700 transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ACTIVE ROLE 2: FIFA FAN COMPANION PORTAL */}
          {activeRole === "fan" && (
            <>
              {/* Fan Smart seat & gate router */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-brand-emerald/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-emerald/10 text-brand-emerald-light">
                    <Compass size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Smart Seat & Concession Navigator</h3>
                    <p className="text-[10px] text-brand-emerald-light font-bold uppercase tracking-wider">Egress Routing</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      placeholder="Enter Seat Section (e.g. 114)"
                      value={fanTicketSection}
                      onChange={(e) => setFanTicketSection(e.target.value)}
                      className="w-full bg-brand-navy-dark border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-white"
                      min="100"
                      max="350"
                    />
                  </div>
                </div>

                {routingResult ? (
                  <div className="bg-brand-navy-dark/65 border border-white/5 rounded-xl p-3 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-start border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-black block">Section {fanTicketSection} Gate Entry</span>
                        <span className="font-black text-brand-emerald-light text-sm">{routingResult.optimalGate.name}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        routingResult.optimalGate.queueTimeMin > 20 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-brand-emerald-light"
                      }`}>
                        Wait: {routingResult.optimalGate.queueTimeMin} mins
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300 block mb-0.5">Alt Secondary Entrance:</span>
                      Use <strong className="text-slate-200">{routingResult.secondaryGate.name}</strong> if Gate A Plaza is congested ({routingResult.secondaryGate.queueTimeMin}m wait).
                    </div>

                    <div className="border-t border-white/5 my-1"></div>

                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Closest Eco Concessions:</span>
                      <div className="flex flex-col gap-1.5">
                        {routingResult.closestConcessions.map((c: ConcessionStand) => (
                          <div key={c.id} className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-200">{c.name} ({c.location})</span>
                            <div className="flex items-center gap-1.5">
                              {c.isEcoFriendly && <span className="text-[8px] bg-brand-emerald/10 text-brand-emerald-light px-1 py-0.5 rounded font-black">ECO</span>}
                              <span className="text-slate-400 font-bold">{c.queueTimeMin}m wait</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 my-1"></div>

                    <div className="text-[10px] text-slate-300 bg-brand-navy-dark/95 p-2 rounded border border-white/5 flex items-start gap-1.5">
                      <Accessibility size={12} className="text-brand-cyan shrink-0 mt-0.5" />
                      <span>{routingResult.accessibilityNotes}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500 py-6 border border-dashed border-white/5 rounded-xl">
                    Enter your ticket section number above (100 - 350) to fetch real-time routes.
                  </div>
                )}
              </div>

              {/* GenAI Multilingual Virtual Chat Companion */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 flex-1 min-h-[350px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-emerald/10 text-brand-emerald-light">
                      <Languages size={16} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Multilingual AI Companion</h3>
                      <p className="text-[10px] text-brand-emerald-light font-bold uppercase tracking-wider">FIFA Assistant</p>
                    </div>
                  </div>
                  <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded font-mono text-slate-400 flex items-center gap-1">
                    <Sparkles size={8} className="text-brand-gold animate-pulse" />
                    Generative
                  </span>
                </div>

                {/* Chat window */}
                <div className="bg-brand-navy-dark/75 border border-white/5 rounded-xl p-3 flex-1 flex flex-col gap-3 h-64 overflow-y-auto relative shadow-inner">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      {msg.sender === "bot" && msg.detectedLang && (
                        <span className="text-[8px] text-brand-emerald-light uppercase font-bold tracking-wider mb-0.5">
                          Detected: {msg.detectedLang}
                        </span>
                      )}
                      
                      <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                        msg.sender === "user" 
                          ? "bg-brand-blue text-white rounded-br-none" 
                          : "bg-brand-navy border border-white/5 text-slate-200 rounded-bl-none"
                      }`}>
                        {msg.text}
                      </div>

                      {/* Chat Suggested Action button */}
                      {msg.sender === "bot" && msg.suggestedAction && (
                        <button
                          onClick={() => {
                            if (msg.suggestedAction?.action === "transportation") {
                              // Perform trigger action
                              handleSendChatMessage("What is the NJ Transit Train status?");
                            } else if (msg.suggestedAction?.action === "accessibility") {
                              handleSendChatMessage("What accessibility features are in MetLife Stadium?");
                            }
                          }}
                          className="mt-1.5 text-[9px] bg-brand-emerald/10 text-brand-emerald-light border border-brand-emerald/20 px-2 py-1 rounded hover:bg-brand-emerald hover:text-brand-navy-dark transition-colors font-bold flex items-center gap-1"
                        >
                          <Navigation size={8} />
                          {msg.suggestedAction.label}
                        </button>
                      )}
                    </div>
                  ))}

                  {isBotTyping && (
                    <div className="self-start flex flex-col max-w-[85%]">
                      <div className="bg-brand-navy border border-white/5 p-2 rounded-xl rounded-bl-none flex gap-1 items-center">
                        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Preset quick question shortcuts */}
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((qq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChatMessage(qq.q)}
                      className="text-[9px] bg-white/5 hover:bg-brand-emerald/10 hover:text-brand-emerald-light text-slate-300 border border-white/5 hover:border-brand-emerald/20 py-1 px-2 rounded-lg transition-colors font-semibold"
                    >
                      {qq.label}
                    </button>
                  ))}
                </div>

                {/* Chat input box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask AI Companion..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(userInput); }}
                    className="flex-1 bg-brand-navy-dark border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-white"
                  />
                  <button
                    onClick={() => handleSendChatMessage(userInput)}
                    className="p-2 bg-brand-emerald hover:bg-white text-brand-navy-dark font-black rounded-lg transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

      </main>

      {/* 4. Footer */}
      <footer className="glass-panel py-6 px-6 mt-12 border-x-0 border-b-0 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">FIFA ArenaSync</span>
            <span>• GenAI-Powered Tournament Venue Operations Portal</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Stadium Guidelines</a>
            <a href="#" className="hover:text-white transition-colors">Zero-Waste Standard</a>
            <a href="#" className="hover:text-white transition-colors">Contact Dispatch</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

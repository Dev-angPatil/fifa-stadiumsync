"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  INITIAL_GATES, 
  INITIAL_CONCESSIONS, 
  INITIAL_TRANSIT, 
  INITIAL_SUSTAINABILITY, 
  INITIAL_INCIDENTS,
  GateInfo,
  ConcessionStand,
  TransitRoute,
  StadiumIncident,
  SustainabilityMetrics,
  getRouteForSection
} from "@/lib/stadiumData";
import { getFanAIResponse, getOpsAIAdvice } from "@/lib/gemini";
import { Activity, Users } from "lucide-react";

// Import modular components
import HeaderTicker from "@/components/HeaderTicker";
import StadiumMap from "@/components/StadiumMap";
import StatusWidgets from "@/components/StatusWidgets";
import OpsPanel from "@/components/OpsPanel";
import FanPanel from "@/components/FanPanel";

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

  // Trigger AI Operations update whenever the stadium state changes (with debounce and cancellation)
  useEffect(() => {
    const controller = new AbortController();
    
    const timeoutId = setTimeout(async () => {
      try {
        const advice = await getOpsAIAdvice(gates, concessions, transits, incidents, controller.signal);
        setAiAdvice(advice);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to update AI operational advice:", error);
        }
      }
    }, 300); // 300ms debounce to prevent redundant API queries on fast state changes

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [gates, concessions, transits, incidents]);

  // Handle fan sending message to chatbot (memoized)
  const handleSendChatMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    setChatMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setUserInput("");
    setIsBotTyping(true);

    try {
      // Call GenAI interface
      const response = await getFanAIResponse(textToSend);
      setChatMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: response.text, 
          detectedLang: response.detectedLanguage,
          suggestedAction: response.suggestedAction
        }
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: "Sorry, I am currently experiencing connection difficulties. Please check your network or try again.",
        }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  }, []);

  // Quick Action: Simulate stadium incident (memoized)
  const handleSimulateIncident = useCallback((
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
  }, []);

  // Dispatch incident staff (memoized)
  const handleDispatchIncident = useCallback((id: string) => {
    setIncidents((prev) => prev.map(inc => {
      if (inc.id === id) {
        let assigned = "Security Rapid Unit 4";
        if (inc.category === "Sustainability") assigned = "Eco-Squad Volunteers (Unit Green)";
        if (inc.category === "Medical") assigned = "First Aid Unit 2 + Volunteer Steward Unit 5";
        return { ...inc, status: "Dispatched", assignedStaff: assigned };
      }
      return inc;
    }));
  }, []);

  // Resolve incident (memoized)
  const handleResolveIncident = useCallback((id: string, description: string) => {
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
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Global Live Match Header Ticker */}
      <HeaderTicker sustainability={sustainability} />

      {/* 2. Main Navigation Bar */}
      <header className="glass-panel sticky top-0 py-4 px-6 flex items-center justify-between z-20 border-x-0 bg-brand-navy">
        <div className="flex items-center gap-3">
          <div className="bg-brand-gold text-brand-navy-dark p-2 rounded-lg font-black text-xl shadow-lg shadow-brand-gold/10 flex items-center justify-center" aria-hidden="true">
            ⚽
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-cyan">
              FIFA ArenaSync
            </h1>
            <p className="text-[10px] text-brand-ops-cyan font-bold uppercase tracking-widest">
              World Cup 2026 Operations
            </p>
          </div>
        </div>

        {/* Role Toggle Switch */}
        <nav aria-label="Role switcher" className="bg-brand-navy-dark/80 p-1.5 rounded-full border border-brand-surface-3/30 flex gap-1 shadow-inner">
          <button
            onClick={() => setActiveRole("ops")}
            aria-pressed={activeRole === "ops"}
            aria-label="Ops Command Center"
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              activeRole === "ops"
                ? "bg-brand-transit-blue text-white shadow-md shadow-brand-transit-blue/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={14} aria-hidden="true" />
            Ops Command Center
          </button>
          <button
            onClick={() => setActiveRole("fan")}
            aria-pressed={activeRole === "fan"}
            aria-label="Fan Companion Portal"
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              activeRole === "fan"
                ? "bg-brand-eco-green text-brand-navy-dark shadow-md shadow-brand-eco-green/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users size={14} aria-hidden="true" />
            Fan Companion Portal
          </button>
        </nav>
      </header>

      {/* 3. Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Lg: 8 cols) - Stadium Visualizer Map & Live Stats */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Stadium Interactive Map Component */}
          <StadiumMap gates={gates} concessions={concessions} incidents={incidents} />

          {/* Stadium Status Cards Grid Component */}
          <StatusWidgets gates={gates} transits={transits} sustainability={sustainability} />

        </div>

        {/* RIGHT COLUMN (Lg: 4 cols) - Role Specific Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* ACTIVE ROLE 1: STADIUM OPERATIONS DASHBOARD */}
          {activeRole === "ops" && (
            <OpsPanel 
              aiAdvice={aiAdvice}
              incidents={incidents}
              onSimulateIncident={handleSimulateIncident}
              onDispatchIncident={handleDispatchIncident}
              onResolveIncident={handleResolveIncident}
            />
          )}

          {/* ACTIVE ROLE 2: FIFA FAN COMPANION PORTAL */}
          {activeRole === "fan" && (
            <FanPanel 
              fanTicketSection={fanTicketSection}
              setFanTicketSection={setFanTicketSection}
              routingResult={routingResult}
              chatMessages={chatMessages}
              isBotTyping={isBotTyping}
              userInput={userInput}
              setUserInput={setUserInput}
              handleSendChatMessage={handleSendChatMessage}
            />
          )}

        </div>

      </main>

      {/* 4. Footer */}
      <footer className="glass-panel py-6 px-6 mt-12 border-x-0 border-b-0 text-xs text-slate-400 bg-brand-navy border border-brand-surface-3/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">FIFA ArenaSync</span>
            <span>• GenAI-Powered Tournament Venue Operations Portal</span>
          </div>
          <nav aria-label="Footer links" className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Stadium Guidelines</a>
            <a href="#" className="hover:text-white transition-colors">Zero-Waste Standard</a>
            <a href="#" className="hover:text-white transition-colors">Contact Dispatch</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

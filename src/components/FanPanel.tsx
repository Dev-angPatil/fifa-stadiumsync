"use client";

import React from "react";
import { GateInfo, ConcessionStand } from "@/lib/stadiumData";
import { Compass, Search, Accessibility, Languages, Sparkles, Navigation, Send } from "lucide-react";

interface FanPanelProps {
  fanTicketSection: string;
  setFanTicketSection: (val: string) => void;
  routingResult: {
    optimalGate: GateInfo;
    secondaryGate: GateInfo;
    closestConcessions: ConcessionStand[];
    accessibilityNotes: string;
  } | null;
  chatMessages: {
    sender: "bot" | "user";
    text: string;
    detectedLang?: string;
    suggestedAction?: { label: string; action: string };
  }[];
  isBotTyping: boolean;
  userInput: string;
  setUserInput: (val: string) => void;
  handleSendChatMessage: (msg: string) => void;
}

export default function FanPanel({
  fanTicketSection,
  setFanTicketSection,
  routingResult,
  chatMessages,
  isBotTyping,
  userInput,
  setUserInput,
  handleSendChatMessage
}: FanPanelProps) {
  
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotTyping]);

  const quickQuestions = [
    { label: "Is Gate C busy?", q: "Is Gate C experiencing delays or long queues?" },
    { label: "How to NYC?", q: "What is the best way to travel back to New York City after the game?" },
    { label: "Sensory Rooms?", q: "Where are the sensory rooms and accessible services located?" },
    { label: "Eco refill?", q: "Can I bring my own water bottle, and where are the refill stations?" }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Fan Smart Seat & Gate Router (Nomad Green/Consul Red theme) */}
      <article aria-labelledby="fan-nav-heading" className="glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-brand-eco-green/20 bg-brand-navy">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-eco-green/10 text-brand-eco-green">
            <Compass size={16} aria-hidden="true" />
          </div>
          <div>
            <h3 id="fan-nav-heading" className="font-extrabold text-white text-xs tracking-wider uppercase">Smart Seat & Concession Navigator</h3>
            <p className="text-[10px] text-brand-eco-green font-bold uppercase tracking-widest mt-0.5">Egress Routing</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="number"
              placeholder="Enter Seat Section (e.g. 114)"
              value={fanTicketSection}
              aria-label="Seat Section Number"
              onChange={(e) => setFanTicketSection(e.target.value)}
              className="w-full bg-brand-navy-dark border border-brand-surface-3 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-ops-cyan focus:ring-1 focus:ring-brand-ops-cyan text-white"
              min="100"
              max="350"
            />
          </div>
        </div>

        {routingResult ? (
          <div className="bg-brand-navy-dark border border-brand-surface-3/30 rounded-xl p-3.5 flex flex-col gap-3.5 text-xs" aria-live="polite">
            <div className="flex justify-between items-start border-b border-brand-surface-3/20 pb-2.5">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-0.5">Section {fanTicketSection} Gate Entry</span>
                <span className="font-black text-brand-ops-cyan text-sm">{routingResult.optimalGate.name}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                routingResult.optimalGate.queueTimeMin > 20 
                  ? "bg-brand-alert-yellow/10 text-brand-alert-yellow border-brand-alert-yellow/20" 
                  : "bg-brand-eco-green/10 text-brand-eco-green border-brand-eco-green/20"
              }`}>
                Wait: {routingResult.optimalGate.queueTimeMin} mins
              </span>
            </div>

            <div className="text-[11px] text-slate-400 leading-normal">
              <span className="font-bold text-slate-300 block mb-0.5 uppercase tracking-wide text-[9px]">Alt Secondary Entrance:</span>
              Use <strong className="text-slate-200">{routingResult.secondaryGate.name}</strong> if main gates are congested ({routingResult.secondaryGate.queueTimeMin}m wait).
            </div>

            <div className="border-t border-brand-surface-3/20 my-0.5" aria-hidden="true"></div>

            <div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-2">Closest Eco Concessions:</span>
              <div className="flex flex-col gap-2">
                {routingResult.closestConcessions.map((c: ConcessionStand) => (
                  <div key={c.id} className="flex justify-between items-center text-[11px] py-1 bg-brand-surface-2/30 px-2 rounded border border-brand-surface-3/15">
                    <span className="font-semibold text-slate-200">{c.name} ({c.location})</span>
                    <div className="flex items-center gap-1.5">
                      {c.isEcoFriendly && <span className="text-[8px] bg-brand-eco-green/10 text-brand-eco-green border border-brand-eco-green/20 px-1 py-0.5 rounded font-black">ECO</span>}
                      <span className="text-slate-400 font-bold">{c.queueTimeMin}m wait</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-brand-surface-3/20 my-0.5" aria-hidden="true"></div>

            <div className="text-[10px] text-slate-300 bg-brand-navy-dark p-2.5 rounded border border-brand-surface-3/30 flex items-start gap-2">
              <Accessibility size={14} className="text-brand-ops-cyan shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-normal">{routingResult.accessibilityNotes}</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 py-6 border border-dashed border-brand-surface-3/30 rounded-xl bg-brand-navy-dark/30">
            Enter your ticket section number above (100 - 350) to fetch real-time routes.
          </div>
        )}
      </article>

      {/* GenAI Multilingual Virtual Chat Companion (Waypoint Cyan Theme) */}
      <article aria-labelledby="chat-heading" className="glass-panel rounded-2xl p-5 flex flex-col gap-4 flex-1 min-h-[350px] bg-brand-navy">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-ops-cyan/10 text-brand-ops-cyan">
              <Languages size={16} aria-hidden="true" />
            </div>
            <div>
              <h3 id="chat-heading" className="font-extrabold text-white text-xs tracking-wider uppercase">Multilingual AI Companion</h3>
              <p className="text-[10px] text-brand-ops-cyan font-bold uppercase tracking-widest mt-0.5">FIFA Assistant</p>
            </div>
          </div>
          <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded font-mono text-slate-400 flex items-center gap-1 border border-brand-surface-3/30">
            <Sparkles size={8} className="text-brand-alert-yellow animate-pulse" aria-hidden="true" />
            Generative
          </span>
        </div>

        {/* Chat Message Window */}
        <div 
          role="log"
          aria-label="Chat messages history"
          className="bg-brand-navy-dark border border-brand-surface-3/45 rounded-xl p-3 flex-1 flex flex-col gap-3 h-64 overflow-y-auto relative shadow-inner"
        >
          {chatMessages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              {msg.sender === "bot" && msg.detectedLang && (
                <span className="text-[8px] text-brand-ops-cyan uppercase font-bold tracking-widest mb-0.5">
                  Detected: {msg.detectedLang}
                </span>
              )}
              
              <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                msg.sender === "user" 
                  ? "bg-brand-transit-blue text-white rounded-md rounded-br-none" 
                  : "bg-brand-surface-2 border border-brand-surface-3/20 text-slate-200 rounded-md rounded-bl-none"
              }`}>
                {msg.text}
              </div>

              {/* Suggested Action Shortcuts */}
              {msg.sender === "bot" && msg.suggestedAction && (
                <button
                  onClick={() => {
                    if (msg.suggestedAction?.action === "transportation") {
                      handleSendChatMessage("What is the NJ Transit Train status?");
                    } else if (msg.suggestedAction?.action === "accessibility") {
                      handleSendChatMessage("What accessibility features are in MetLife Stadium?");
                    }
                  }}
                  aria-label={`Shortcut: ${msg.suggestedAction.label}`}
                  className="mt-1.5 text-[9px] bg-brand-ops-cyan/15 text-brand-ops-cyan border border-brand-ops-cyan/25 px-2 py-1 rounded hover:bg-brand-ops-cyan hover:text-black transition-colors font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Navigation size={8} aria-hidden="true" />
                  {msg.suggestedAction.label}
                </button>
              )}
            </div>
          ))}

          {isBotTyping && (
            <div className="self-start flex flex-col max-w-[85%]" aria-label="AI bot is typing">
              <div className="bg-brand-surface-2 border border-brand-surface-3/25 p-2 rounded-md rounded-bl-none flex gap-1.5 items-center">
                <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Tags */}
        <div className="flex flex-wrap gap-1.5" aria-label="Quick questions shortcuts">
          {quickQuestions.map((qq, idx) => (
            <button
              key={idx}
              onClick={() => handleSendChatMessage(qq.q)}
              className="text-[9px] bg-brand-surface-2 hover:bg-brand-ops-cyan/15 hover:text-brand-ops-cyan text-slate-300 border border-brand-surface-3/30 hover:border-brand-ops-cyan/25 py-1 px-2 rounded-md transition-colors font-semibold cursor-pointer"
            >
              {qq.label}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI Companion..."
            value={userInput}
            aria-label="Type message to AI Companion"
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(userInput); }}
            className="flex-1 bg-brand-navy-dark border border-brand-surface-3 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-brand-ops-cyan focus:ring-1 focus:ring-brand-ops-cyan text-white"
          />
          <button
            onClick={() => handleSendChatMessage(userInput)}
            aria-label="Send message to AI Companion"
            className="p-2.5 bg-white text-black hover:bg-brand-ops-cyan transition-colors font-black rounded-md cursor-pointer"
          >
            <Send size={14} aria-hidden="true" />
          </button>
        </div>
      </article>

    </div>
  );
}

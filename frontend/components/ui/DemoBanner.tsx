"use client";

import React, { useState, useEffect } from "react";
import { isDemoMode, setDemoMode } from "@/lib/api";
import { FlaskConical, Server, ArrowRightLeft, ShieldAlert } from "lucide-react";

export function DemoBanner() {
  const [demo, setDemo] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setDemo(isDemoMode());

    const handleModeChange = () => {
      setDemo(isDemoMode());
    };

    window.addEventListener("demo-mode-changed", handleModeChange);
    return () => window.removeEventListener("demo-mode-changed", handleModeChange);
  }, []);

  if (!mounted) return null;

  const handleToggle = () => {
    const next = !demo;
    setDemo(next);
    setDemoMode(next);
  };

  return (
    <div className="w-full bg-navy-900/90 border-b border-card-border px-4 py-1.5 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {demo ? (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-slate-200">
                <strong className="text-amber-400">DEMO MODE ACTIVE:</strong> Using deterministic simulation data. Payments will not charge real accounts.
              </span>
            </>
          ) : (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-slate-200">
                <strong className="text-emerald-400">LIVE API MODE:</strong> Connected to backend{" "}
                <code className="text-violet-300 font-mono bg-navy-800 px-1 py-0.5 rounded">
                  {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}
                </code>
              </span>
            </>
          )}
        </div>

        <button
          onClick={handleToggle}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white border border-card-border transition-colors font-medium cursor-pointer"
          title={demo ? "Switch to live backend server" : "Switch to standalone demo simulation"}
        >
          <ArrowRightLeft className="w-3 h-3 text-violet-400" />
          <span>Switch to {demo ? "Live API Mode" : "Demo Mode"}</span>
        </button>
      </div>
    </div>
  );
}


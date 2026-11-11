import React from "react";
import Link from "next/link";
import { ShieldAlert, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-card-border bg-navy-950 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-glow">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white">
              Mandate<span className="text-violet-400">Gate</span>
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic spending control & payment gateway for autonomous AI agents.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-violet-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/mandates" className="hover:text-violet-400 transition-colors">
            Spending Mandates
          </Link>
          <Link href="/shopping" className="hover:text-violet-400 transition-colors">
            AI Assistant
          </Link>
          <Link href="/approvals" className="hover:text-violet-400 transition-colors">
            Approvals
          </Link>
          <Link href="/transactions" className="hover:text-violet-400 transition-colors">
            Audit Ledger
          </Link>
          <Link href="/settings" className="hover:text-violet-400 transition-colors">
            Settings
          </Link>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>PayPal AI Hackathon 2026</span>
          <span>•</span>
          <span className="text-violet-400 font-medium">Safe Agentic Commerce</span>
        </div>
      </div>
    </footer>
  );
}


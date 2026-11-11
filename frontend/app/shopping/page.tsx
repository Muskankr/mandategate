"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/navigation/AppShell";
import { ShoppingChat } from "@/shopping/ShoppingChat";
import { Plus, CheckSquare } from "lucide-react";

export default function ShoppingPage() {
  return (
    <AppShell
      title="Autonomous AI Shopping Assistant"
      subtitle="Instruct your AI agent to discover verified products guarded by deterministic mandate policies"
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/approvals"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>Approval Queue</span>
          </Link>
          <Link
            href="/mandates/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Mandate</span>
          </Link>
        </div>
      }
    >
      <ShoppingChat />
    </AppShell>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/navigation/AppShell";
import { MandateCard } from "@/mandates/MandateCard";
import { Mandate } from "@/types";
import { api } from "@/lib/api";
import { Plus, ShieldAlert, Filter, Search, Loader2 } from "lucide-react";

export default function MandatesPage() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "EXPIRED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadMandates = async () => {
    setLoading(true);
    try {
      const data = await api.getMandates();
      setMandates(data);
    } catch (err) {
      console.error("Failed to load mandates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandates();
  }, []);

  const filteredMandates = mandates.filter((m) => {
    const matchesStatus =
      filterStatus === "ALL"
        ? true
        : filterStatus === "ACTIVE"
        ? m.status === "ACTIVE"
        : m.status !== "ACTIVE";

    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.instruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <AppShell
      title="Spending Mandates"
      subtitle="Autonomous policies defining budget caps, categories, and human approval limits"
      action={
        <Link
          href="/mandates/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Mandate</span>
        </Link>
      }
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-card-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies by name, directive, or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-navy-900 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-navy-900 border border-card-border rounded-lg p-1 text-xs">
          {(["ALL", "ACTIVE", "EXPIRED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterStatus === st
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Policies" : st === "ACTIVE" ? "Active" : "Past & Revoked"}
            </button>
          ))}
        </div>
      </div>

      {/* Mandates Grid */}
      {loading ? (
        <div className="p-16 text-center rounded-xl bg-card border border-card-border">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading spending mandates...</p>
        </div>
      ) : filteredMandates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMandates.map((m) => (
            <MandateCard key={m.id} mandate={m} onRevoked={() => loadMandates()} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-xl bg-card border border-card-border space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="font-bold text-white text-sm">No mandates found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No policies match your search query."
              : "Create a spending mandate to grant controlled purchasing bounds to your AI agent."}
          </p>
          <Link
            href="/mandates/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Mandate</span>
          </Link>
        </div>
      )}
    </AppShell>
  );
}


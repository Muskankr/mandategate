"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/navigation/AppShell";
import { ApprovalCard } from "@/approvals/ApprovalCard";
import { ApprovalRequest } from "@/types";
import { api } from "@/lib/api";
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"PENDING" | "PROCESSED" | "ALL">("PENDING");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getApprovals();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load approvals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const filtered = requests.filter((r) => {
    if (filterTab === "PENDING") return r.status === "PENDING";
    if (filterTab === "PROCESSED") return r.status !== "PENDING";
    return true;
  });

  return (
    <AppShell
      title="Human Approval Center"
      subtitle="Review purchases that triggered approval threshold or high-value policy rules"
      action={
        <button
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">
            Deterministic Threshold Interception
          </span>
          <p className="leading-relaxed text-amber-200/90">
            When an autonomous shopping agent selects a product that costs more than a mandate's auto-approval limit, transaction execution pauses immediately. Operator sign-off creates a real PayPal Sandbox session before money can move.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-card-border pb-3">
        <button
          onClick={() => setFilterTab("PENDING")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            filterTab === "PENDING"
              ? "bg-violet-600 text-white shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-navy-850"
          }`}
        >
          <span>Pending Approvals</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-navy-950 font-bold text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab("PROCESSED")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            filterTab === "PROCESSED"
              ? "bg-violet-600 text-white shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-navy-850"
          }`}
        >
          Past Decided
        </button>

        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            filterTab === "ALL"
              ? "bg-violet-600 text-white shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-navy-850"
          }`}
        >
          All Requests
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-16 text-center rounded-xl bg-card border border-card-border">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading approval requests...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((req) => (
            <ApprovalCard
              key={req.id}
              request={req}
              onProcessed={() => loadRequests()}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-xl bg-card border border-card-border space-y-3">
          <CheckSquare className="w-10 h-10 text-emerald-400/60 mx-auto" />
          <h4 className="font-bold text-white text-sm">
            {filterTab === "PENDING"
              ? "No pending approval requests"
              : "No approval requests found"}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterTab === "PENDING"
              ? "All autonomous agent purchases are either within threshold limits or have been reviewed."
              : "No requests match the selected view."}
          </p>
          <Link
            href="/shopping"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-card-border text-xs font-semibold transition-colors mt-2"
          >
            <span>Test with AI Shopping Agent</span>
          </Link>
        </div>
      )}
    </AppShell>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/navigation/AppShell";
import { Mandate } from "@/types";
import { api, isDemoMode, setDemoMode } from "@/lib/api";
import { useToast } from "@/ui/Toast";
import { StatusBadge } from "@/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Settings,
  Shield,
  Server,
  CreditCard,
  Ban,
  Database,
  Lock,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { success, error } = useToast();
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [demoActive, setDemoActive] = useState<boolean>(true);
  const [currency, setCurrency] = useState<string>("USD");
  const [backendUrl, setBackendUrl] = useState<string>(
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  );

  useEffect(() => {
    setDemoActive(isDemoMode());
    async function load() {
      try {
        const list = await api.getMandates();
        setMandates(list);
      } catch (err) {
        console.error("Failed to load mandates in settings", err);
      }
    }
    load();
  }, []);

  const handleToggleDemo = () => {
    const next = !demoActive;
    setDemoActive(next);
    setDemoMode(next);
    success(
      next ? "Demo Mode Activated" : "Live API Mode Activated",
      next
        ? "Frontend now operates using deterministic client-side mock policies."
        : `Frontend will now dispatch requests to backend at ${backendUrl}.`
    );
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke policy "${name}"?`)) return;
    try {
      await api.revokeMandate(id);
      setMandates((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "REVOKED" as const } : m))
      );
      success("Mandate Revoked", `Policy "${name}" has been disabled.`);
    } catch (err: any) {
      error("Revocation Failed", err.message);
    }
  };

  return (
    <AppShell
      title="Platform Settings & Governance"
      subtitle="Configure runtime environments, security boundaries, and active spending policies"
    >
      <div className="max-w-4xl space-y-6">
        {/* Environment & Backend Connection */}
        <div className="rounded-xl bg-card border border-card-border p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-card-border">
            <div className="p-2 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Runtime Environment</h3>
              <p className="text-xs text-slate-400">
                Manage backend connectivity and demo simulation state
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-navy-900 border border-card-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">
                  Demo Simulation Mode
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    demoActive
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {demoActive ? "ACTIVE (SIMULATION)" : "DISABLED (LIVE BACKEND)"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Allows testing the full agent purchasing and policy evaluation workflow without requiring an active backend or live PayPal merchant account.
              </p>
            </div>

            <button
              onClick={handleToggleDemo}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 hover:text-white border border-card-border text-xs font-semibold transition-colors shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-violet-400" />
              <span>Switch to {demoActive ? "Live API" : "Demo Mode"}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Backend API Base URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              disabled
              className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-card-border text-xs text-slate-400 font-mono focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Configured via <code className="text-violet-300 font-mono">NEXT_PUBLIC_API_BASE_URL</code> in <code className="text-violet-300 font-mono">.env.local</code>.
            </p>
          </div>
        </div>

        {/* PayPal Integration & Security Architecture */}
        <div className="rounded-xl bg-card border border-card-border p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-card-border">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">PayPal Integration Status</h3>
              <p className="text-xs text-slate-400">
                PayPal Sandbox checkout contract and security boundary verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-navy-900 border border-card-border space-y-1.5">
              <span className="font-semibold text-slate-200 block">
                Target Payment Environment
              </span>
              <p className="text-violet-400 font-mono text-[11px]">PayPal Sandbox (V2 Orders API)</p>
              <p className="text-slate-400 text-[11px]">
                Redirects users to official PayPal approval URLs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-900 border border-card-border space-y-1.5">
              <span className="font-semibold text-slate-200 block">
                Security Guarantee
              </span>
              <p className="text-emerald-400 font-mono text-[11px]">Strict Backend Separation</p>
              <p className="text-slate-400 text-[11px]">
                No PayPal client secrets are bundled in the frontend client.
              </p>
            </div>
          </div>
        </div>

        {/* Active Policies & Quick Revocation */}
        <div className="rounded-xl bg-card border border-card-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-card-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Spending Policies Overview</h3>
                <p className="text-xs text-slate-400">
                  Quickly inspect and revoke live agent spending envelopes
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-card-border/60">
            {mandates.map((m) => (
              <div
                key={m.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{m.name}</span>
                    <StatusBadge status={m.status} size="sm" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Budget: {formatCurrency(m.total_budget, m.currency)} • Remaining:{" "}
                    {formatCurrency(m.remaining_budget, m.currency)} • Expiry:{" "}
                    {formatDate(m.expiry_date)}
                  </p>
                </div>

                {m.status === "ACTIVE" ? (
                  <button
                    onClick={() => handleRevoke(m.id, m.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors shrink-0"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                ) : (
                  <span className="text-slate-500 text-[11px] font-mono">
                    Inactive
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/navigation/AppShell";
import { MetricCard } from "@/ui/MetricCard";
import { StatusBadge } from "@/ui/StatusBadge";
import { SpendingChart } from "@/dashboard/SpendingChart";
import { CategoryChart } from "@/dashboard/CategoryChart";
import { RecentActivity } from "@/dashboard/RecentActivity";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { api } from "@/lib/api";
import { DashboardMetrics } from "@/types";
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Plus,
  ArrowRight,
  Bot,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AppShell
      title="Autonomous Spending Dashboard"
      subtitle="Real-time mandate enforcement, budget allocations, and PayPal payment streams"
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/shopping"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <Bot className="w-4 h-4 text-violet-400" />
            <span>AI Assistant</span>
          </Link>
          <Link
            href="/mandates/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Mandate</span>
          </Link>
        </div>
      }
    >
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Mandate Budget"
          value={formatCurrency(metrics?.total_budget ?? 0)}
          subtitle="Allocated across all policies"
          icon={DollarSign}
          accentColor="violet"
        />
        <MetricCard
          title="Total Spent"
          value={formatCurrency(metrics?.total_spent ?? 0)}
          subtitle={`${Math.round(((metrics?.total_spent ?? 0) / (metrics?.total_budget || 1)) * 100)}% utilization`}
          icon={TrendingUp}
          accentColor="blue"
        />
        <MetricCard
          title="Remaining Budget"
          value={formatCurrency(metrics?.remaining_budget ?? 0)}
          subtitle="Available for agent spending"
          icon={ShieldCheck}
          accentColor="emerald"
        />
        <MetricCard
          title="Active Mandates"
          value={String(metrics?.active_mandates ?? 0)}
          subtitle="Policies actively guarded"
          icon={Layers}
          accentColor="violet"
        />
        <MetricCard
          title="Pending Approvals"
          value={String(metrics?.pending_approvals ?? 0)}
          subtitle="Requiring human authorization"
          icon={AlertTriangle}
          accentColor="amber"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-card-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Spending Velocity & Budget Cap
              </h3>
              <p className="text-xs text-slate-400">
                Cumulative agent transactions vs overall mandate boundary
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
              30-Day Window
            </span>
          </div>
          {metrics && <SpendingChart data={metrics.spending_trend} />}
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="rounded-xl bg-card border border-card-border p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Spending by Category
            </h3>
            <p className="text-xs text-slate-400">
              Distribution across permitted business domains
            </p>
          </div>
          {metrics && <CategoryChart data={metrics.category_breakdown} />}
        </div>
      </div>

      {/* Recent AI Activity & Transactions Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-card-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Recent Ledger Transactions
              </h3>
              <p className="text-xs text-slate-400">
                Latest autonomous purchases verified by policy engine
              </p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>View AG Grid Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-card-border text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Product / Item</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Mandate</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/60">
                {metrics?.recent_transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-3 pl-2">
                      <span className="font-semibold text-slate-200 block truncate max-w-[200px]">
                        {txn.product_title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {txn.id}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">
                      {formatCurrency(txn.amount, txn.currency)}
                    </td>
                    <td className="py-3 text-slate-400 truncate max-w-[150px]">
                      {txn.mandate_name}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={txn.payment_status} size="sm" />
                    </td>
                    <td className="py-3 pr-2 text-right text-slate-500">
                      {formatDateTime(txn.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI Activity Feed (1 col) */}
        <div className="rounded-xl bg-card border border-card-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Live AI Activity Log
              </h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          {metrics && <RecentActivity activities={metrics.ai_activity} />}
        </div>
      </div>
    </AppShell>
  );
}


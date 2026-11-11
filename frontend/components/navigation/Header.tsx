"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Plus,
  Shield,
  Bot,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { api, isDemoMode } from "@/lib/api";
import { ApprovalRequest, Transaction } from "@/types";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

interface Notification {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  subtitle: string;
  href?: string;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [approvals, transactions] = await Promise.all([
        api.getApprovals(),
        api.getTransactions(),
      ]);

      const items: Notification[] = [];

      const pending = approvals.filter((a: ApprovalRequest) => a.status === "PENDING");
      for (const a of pending.slice(0, 3)) {
        items.push({
          id: a.id,
          type: "warning",
          title: `Approval Required: ${a.product.title}`,
          subtitle: `Amount ($${a.amount.toFixed(2)}) exceeds threshold.`,
          href: "/approvals",
        });
      }

      const recent = transactions
        .filter((t: Transaction) => t.payment_status === "COMPLETED")
        .slice(0, 2);
      for (const t of recent) {
        items.push({
          id: t.id,
          type: "success",
          title: `Completed: ${t.product_title}`,
          subtitle: `$${t.amount.toFixed(2)} — ${t.mandate_name}`,
        });
      }

      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = notifications.filter((n) => n.type === "warning").length;

  return (
    <header className="h-16 border-b border-card-border bg-navy-950/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-semibold border border-violet-500/30">
            PayPal AI Agent Guard
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-400 font-medium">Deterministic Spending Policy Engine</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/mandates/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Mandate</span>
        </Link>

        {/* Notifications toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-850 relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-navy-900 border border-card-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Agent Notifications
                </span>
                {pendingCount > 0 && (
                  <span className="text-[11px] text-amber-400 font-medium">
                    {pendingCount} pending
                  </span>
                )}
              </div>
              <div className="py-2 space-y-2">
                {loading && notifications.length === 0 && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  </div>
                )}
                {!loading && notifications.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications</p>
                )}
                {notifications.map((n) => {
                  const Icon = n.type === "warning" ? AlertTriangle : CheckCircle2;
                  const iconColor = n.type === "warning" ? "text-amber-400" : "text-emerald-400";
                  const content = (
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.subtitle}</p>
                      </div>
                    </div>
                  );

                  return n.href ? (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setShowNotifications(false)}
                      className="block p-2.5 rounded-lg bg-navy-850 hover:bg-navy-800 transition-colors"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id} className="p-2.5 rounded-lg bg-navy-850">
                      {content}
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-card-border text-center">
                <Link
                  href="/approvals"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Open Approval Center &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Role Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-card-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-glow">
            MG
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200">Autonomous Operator</span>
            <span className="text-[10px] text-slate-400">Sandbox Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
}

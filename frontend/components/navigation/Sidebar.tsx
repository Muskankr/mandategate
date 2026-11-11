"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  Bot,
  CheckSquare,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Mandates",
    href: "/mandates",
    icon: ShieldCheck,
  },
  {
    name: "New Mandate",
    href: "/mandates/new",
    icon: PlusCircle,
  },
  {
    name: "AI Shopping",
    href: "/shopping",
    icon: Bot,
  },
  {
    name: "Approval Center",
    href: "/approvals",
    icon: CheckSquare,
    hasBadge: true,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(2);

  useEffect(() => {
    async function loadBadge() {
      try {
        const apps = await api.getApprovals();
        const pending = apps.filter((a) => a.status === "PENDING").length;
        setPendingCount(pending);
      } catch {
        // demo fallback
      }
    }
    loadBadge();
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-navy-950/95 border-r border-card-border backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-card-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden group"
            onClick={onCloseMobile}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-glow shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Mandate<span className="text-violet-400">Gate</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  PayPal AI Agent Guard
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-violet-600/15 text-white border border-violet-500/30 shadow-[0_0_15px_-3px_rgba(139,92,246,0.25)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-navy-850"
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive
                      ? "text-violet-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}

                {/* Approvals Pending count badge */}
                {item.hasBadge && pendingCount > 0 && (
                  <span
                    className={cn(
                      "ml-auto text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30",
                      collapsed && "absolute top-2 right-2 px-1.5 py-0.2 text-[10px]"
                    )}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Gateway / Mode info */}
        <div className="p-3 border-t border-card-border space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-navy-850 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
            {!collapsed && <span>Public Landing Page</span>}
          </Link>

          {!collapsed && (
            <div className="p-3 rounded-xl bg-navy-900 border border-card-border/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                PayPal Sandbox Ready
              </div>
              <p className="leading-snug text-slate-400">
                Autonomous agent policy engine verified for hackathon demo.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}


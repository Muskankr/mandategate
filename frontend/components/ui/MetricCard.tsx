import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: "violet" | "blue" | "emerald" | "amber";
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "violet",
  className,
  onClick,
}: MetricCardProps) {
  const accentStyles = {
    violet: {
      border: "hover:border-violet-500/40",
      glow: "group-hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]",
      iconBg: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    },
    blue: {
      border: "hover:border-blue-500/40",
      glow: "group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]",
      iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    emerald: {
      border: "hover:border-emerald-500/40",
      glow: "group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    amber: {
      border: "hover:border-amber-500/40",
      glow: "group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl bg-card p-5 border border-card-border transition-all duration-200",
        accentStyles.border,
        accentStyles.glow,
        onClick && "cursor-pointer hover:bg-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-white">
            {value}
          </div>
        </div>
        <div className={cn("p-2.5 rounded-lg", accentStyles.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


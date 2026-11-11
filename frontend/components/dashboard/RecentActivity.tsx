import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: "evaluation" | "recommendation" | "approval_required" | "blocked" | "executed";
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "executed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "approval_required":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "blocked":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case "recommendation":
        return <Sparkles className="w-4 h-4 text-violet-400" />;
      default:
        return <Bot className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBorder = (type: ActivityItem["type"]) => {
    switch (type) {
      case "executed":
        return "border-emerald-500/20 bg-emerald-500/5";
      case "approval_required":
        return "border-amber-500/20 bg-amber-500/5";
      case "blocked":
        return "border-rose-500/20 bg-rose-500/5";
      default:
        return "border-card-border bg-navy-900/50";
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((act) => (
        <div
          key={act.id}
          className={cn(
            "p-3.5 rounded-xl border flex items-start gap-3 transition-colors",
            getBorder(act.type)
          )}
        >
          <div className="p-1.5 rounded-lg bg-navy-850 shrink-0 mt-0.5">
            {getIcon(act.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {act.action}
              </span>
              <span className="text-[11px] text-slate-500 shrink-0">{act.timestamp}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {act.details}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}


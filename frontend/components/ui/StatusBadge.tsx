import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Zap } from "lucide-react";

export type BadgeVariant =
  | "ALLOWED"
  | "SUCCESS"
  | "COMPLETED"
  | "ACTIVE"
  | "APPROVAL_REQUIRED"
  | "PENDING"
  | "BLOCKED"
  | "FAILED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "REVOKED"
  | "INFO"
  | "AI_PROCESSING";

interface StatusBadgeProps {
  status: BadgeVariant | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  label,
  size = "md",
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const norm = (status || "").toUpperCase().replace(/[\s-]/g, "_");

  let colorClasses = "bg-slate-800 text-slate-300 border-slate-700";
  let icon = <Clock className="w-3.5 h-3.5" />;
  let defaultLabel = status;

  if (["ALLOWED", "SUCCESS", "COMPLETED", "ACTIVE", "APPROVED"].includes(norm)) {
    colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    defaultLabel = norm === "ALLOWED" ? "Allowed" : norm === "ACTIVE" ? "Active" : norm === "APPROVED" ? "Approved" : "Completed";
  } else if (["APPROVAL_REQUIRED", "PENDING"].includes(norm)) {
    colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    defaultLabel = norm === "APPROVAL_REQUIRED" ? "Approval Required" : "Pending";
  } else if (["BLOCKED", "FAILED", "REJECTED"].includes(norm)) {
    colorClasses = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    icon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    defaultLabel = norm === "BLOCKED" ? "Blocked" : norm === "REJECTED" ? "Rejected" : "Failed";
  } else if (["EXPIRED", "REVOKED"].includes(norm)) {
    colorClasses = "bg-slate-500/10 text-slate-400 border-slate-600/30";
    icon = <Clock className="w-3.5 h-3.5 text-slate-400" />;
    defaultLabel = norm === "EXPIRED" ? "Expired" : "Revoked";
  } else if (["INFO", "AI_PROCESSING"].includes(norm)) {
    colorClasses = "bg-violet-500/10 text-violet-400 border-violet-500/30";
    icon = <Zap className="w-3.5 h-3.5 text-violet-400 animate-pulse" />;
    defaultLabel = "AI Processing";
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-medium",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border tracking-wide transition-colors",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      {showIcon && icon}
      <span>{label || defaultLabel}</span>
    </span>
  );
}


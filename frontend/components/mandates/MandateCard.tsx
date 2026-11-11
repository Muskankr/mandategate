"use client";

import React, { useState } from "react";
import { Mandate } from "@/types";
import { StatusBadge } from "@/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShieldAlert,
  Calendar,
  Lock,
  Tag,
  Ban,
  CheckCircle,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/ui/Toast";

interface MandateCardProps {
  mandate: Mandate;
  onRevoked?: (id: string) => void;
}

export function MandateCard({ mandate, onRevoked }: MandateCardProps) {
  const { success, error } = useToast();
  const [revoking, setRevoking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(mandate.status);

  const spentPercent = Math.min(
    100,
    Math.round((mandate.spent_amount / mandate.total_budget) * 100) || 0
  );

  const handleRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke mandate "${mandate.name}"? Agents will be blocked from spending under this policy.`)) {
      return;
    }
    setRevoking(true);
    try {
      await api.revokeMandate(mandate.id);
      setCurrentStatus("REVOKED");
      success("Mandate Revoked", `Policy "${mandate.name}" has been revoked successfully.`);
      if (onRevoked) onRevoked(mandate.id);
    } catch (err: any) {
      error("Revocation Failed", err.message || "Failed to revoke mandate");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="rounded-xl bg-card border border-card-border p-5 hover:border-violet-500/30 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-base text-white tracking-tight group-hover:text-violet-300 transition-colors">
              {mandate.name}
            </h3>
            <span className="text-[11px] font-mono text-slate-500 mt-0.5 inline-block">
              ID: {mandate.id}
            </span>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Natural Language Instruction */}
        <div className="p-3 rounded-lg bg-navy-900/80 border border-card-border mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Agent Policy Directive</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{mandate.instruction}"
          </p>
        </div>

        {/* Budget Progress */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Budget Consumed ({spentPercent}%)</span>
            <span className="text-slate-200 font-medium">
              {formatCurrency(mandate.spent_amount, mandate.currency)} /{" "}
              {formatCurrency(mandate.total_budget, mandate.currency)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-navy-900 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spentPercent > 90
                  ? "bg-rose-500"
                  : spentPercent > 70
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-violet-500 to-indigo-500"
              }`}
              style={{ width: `${spentPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Remaining: {formatCurrency(mandate.remaining_budget, mandate.currency)}</span>
            <span>Limit: {formatCurrency(mandate.total_budget, mandate.currency)}</span>
          </div>
        </div>

        {/* Constraints Info */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="p-2 rounded-lg bg-navy-900/60 border border-card-border">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Approval Cap</span>
            </div>
            <span className="font-semibold text-slate-200">
              {formatCurrency(mandate.approval_threshold, mandate.currency)}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-navy-900/60 border border-card-border">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span>Expiry Date</span>
            </div>
            <span className="font-semibold text-slate-200 truncate block">
              {formatDate(mandate.expiry_date)}
            </span>
          </div>
        </div>

        {/* Allowed Categories */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Permitted Categories
          </span>
          <div className="flex flex-wrap gap-1.5">
            {mandate.allowed_categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-md bg-navy-850 border border-card-border text-[11px] text-slate-300"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Revoke Action */}
      <div className="pt-3 border-t border-card-border flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          Created {formatDate(mandate.created_at)}
        </span>
        {currentStatus === "ACTIVE" && (
          <button
            onClick={handleRevoke}
            disabled={revoking}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors disabled:opacity-50"
          >
            <Ban className="w-3 h-3" />
            <span>{revoking ? "Revoking..." : "Revoke Mandate"}</span>
          </button>
        )}
      </div>
    </div>
  );
}


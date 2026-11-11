"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ApprovalRequest } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/ui/StatusBadge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  Sparkles,
  Shield,
  Layers,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/ui/Toast";

interface ApprovalCardProps {
  request: ApprovalRequest;
  onProcessed?: () => void;
}

export function ApprovalCard({ request, onProcessed }: ApprovalCardProps) {
  const { success, error, info } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paypalCheckoutUrl, setPaypalCheckoutUrl] = useState<string | null>(null);
  const [status, setStatus] = useState(request.status);

  const handleAction = async (action: "approve" | "reject") => {
    setProcessing(true);
    try {
      const res = await api.approveRequest(request.id, action);
      setStatus(action === "approve" ? "APPROVED" : "REJECTED");

      if (action === "approve") {
        success(
          "Request Approved",
          `Human operator authorized $${request.amount.toFixed(2)} purchase for "${request.product.title}".`
        );

        if (res.payment?.approval_url) {
          setPaypalCheckoutUrl(res.payment.approval_url);
          info(
            "PayPal Order Created",
            `Backend returned Order ID ${res.payment.order_id}. Complete payment via PayPal Sandbox.`
          );
        }
      } else {
        info(
          "Request Rejected",
          `Purchase request for "${request.product.title}" was declined.`
        );
      }

      if (onProcessed) onProcessed();
    } catch (err: any) {
      error("Processing Failed", err.message || "Failed to update approval status.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="rounded-xl bg-card border border-card-border p-5 hover:border-violet-500/30 transition-all duration-200 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-card-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">ID: {request.id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              Submitted {formatDate(request.created_at)}
            </span>
          </div>
          <h4 className="text-base font-bold text-white mt-1">
            {request.product.title}
          </h4>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Main product and financial details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Product preview */}
        <div className="flex items-center gap-3 md:col-span-1">
          <Image
            src={request.product.image_url}
            alt={request.product.title}
            width={64}
            height={64}
            className="rounded-lg object-cover border border-card-border shrink-0"
          />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-200">{request.product.merchant}</p>
            <p className="text-slate-400">Category: {request.product.category}</p>
            <p className="text-violet-400 font-bold text-sm">
              {formatCurrency(request.amount, request.currency)}
            </p>
          </div>
        </div>

        {/* Center: Mandate Context */}
        <div className="p-3 rounded-lg bg-navy-900 border border-card-border text-xs space-y-1.5 md:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Shield className="w-3.5 h-3.5 text-violet-400" />
            <span>Associated Mandate</span>
          </div>
          <p className="font-semibold text-slate-200">{request.mandate_name}</p>
          <p className="text-slate-400 text-[11px]">
            Remaining Envelope:{" "}
            <span className="text-emerald-400 font-medium">
              {formatCurrency(request.mandate_remaining_budget, request.currency)}
            </span>
          </p>
        </div>

        {/* Right: Policy Trigger */}
        <div className="p-3 rounded-lg bg-navy-900 border border-card-border text-xs space-y-1.5 md:col-span-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Policy Interception Rule</span>
          </div>
          <p className="text-slate-200 font-mono text-[11px]">
            {request.policy_trigger || "PRICE_EXCEEDS_APPROVAL_THRESHOLD"}
          </p>
          <p className="text-slate-400 text-[11px]">
            Automated spending engine deferred to human oversight.
          </p>
        </div>
      </div>

      {/* AI Recommendation Reasoning */}
      <div className="p-3 rounded-lg bg-navy-900/60 border border-violet-500/20 text-xs text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-violet-300">Agent Recommendation Note:</span>{" "}
          <span className="italic text-slate-300">{request.ai_recommendation}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          * Approving creates a real backend PayPal Sandbox order. Payment is authorized after checkout.
        </div>

        {status === "PENDING" && (
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => handleAction("reject")}
              disabled={processing}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-navy-850 hover:bg-rose-500/10 text-rose-400 border border-card-border hover:border-rose-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Request</span>
            </button>

            <button
              onClick={() => handleAction("approve")}
              disabled={processing}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition-colors disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Approve & Authorize</span>
            </button>
          </div>
        )}

        {status === "APPROVED" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Approved by Operator
            </span>
            {paypalCheckoutUrl && (
              <a
                href={paypalCheckoutUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Launch PayPal Sandbox</span>
              </a>
            )}
          </div>
        )}

        {status === "REJECTED" && (
          <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            Declined by Operator
          </span>
        )}
      </div>
    </div>
  );
}


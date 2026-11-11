"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PurchaseDecision, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Lock,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/ui/Toast";

interface DecisionBannerProps {
  decision: PurchaseDecision;
  product: Product;
  mandateName: string;
  onDismiss: () => void;
}

export function DecisionBanner({
  decision,
  product,
  mandateName,
  onDismiss,
}: DecisionBannerProps) {
  const { success, error } = useToast();
  const [redirectingToPayPal, setRedirectingToPayPal] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{
    orderId?: string;
    approvalUrl?: string;
  } | null>(null);

  const handleProceedToPayPal = async () => {
    setRedirectingToPayPal(true);
    try {
      const order = await api.createPayPalOrder({
        product_id: product.id,
        mandate_id: decision.mandate_id || "",
        amount: product.price,
        currency: product.currency,
        description: `Autonomous agent purchase: ${product.title} under mandate ${mandateName}`,
      });

      setOrderInfo({
        orderId: order.order_id,
        approvalUrl: order.approval_url,
      });

      success("PayPal Order Created", `Order ID: ${order.order_id}. Directing to checkout...`);

      if (order.approval_url) {
        // In real mode or demo mode, open the approval URL in a new window or redirect
        window.open(order.approval_url, "_blank");
      }
    } catch (err: any) {
      error("PayPal Order Error", err.message || "Failed to initialize PayPal order with backend");
    } finally {
      setRedirectingToPayPal(false);
    }
  };

  if (decision.decision === "ALLOWED") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-5 space-y-4 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Decision: ALLOWED
                </span>
                <span className="text-xs text-slate-400">• Verified by Policy Engine</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                Purchase permitted under "{mandateName}"
              </h4>
              <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                {decision.reason}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>

        {/* Order Details & PayPal Action */}
        <div className="p-4 rounded-lg bg-navy-900/90 border border-card-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <div className="text-slate-300 font-medium">
              Item: <span className="text-white font-semibold">{product.title}</span>
            </div>
            <div className="text-slate-400">
              Amount:{" "}
              <span className="text-emerald-400 font-bold text-sm">
                {formatCurrency(decision.amount, product.currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {orderInfo?.approvalUrl ? (
              <a
                href={orderInfo.approvalUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold shadow-lg transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Open PayPal Checkout &rarr;</span>
              </a>
            ) : (
              <button
                onClick={handleProceedToPayPal}
                disabled={redirectingToPayPal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold shadow-lg transition-colors disabled:opacity-50"
              >
                {redirectingToPayPal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Contacting PayPal Backend...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed with PayPal Sandbox Checkout</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {orderInfo && (
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-violet-400" />
            <span>
              Backend created PayPal Order ID: <code className="text-violet-300">{orderInfo.orderId}</code>. Complete authorization in Sandbox checkout window.
            </span>
          </div>
        )}
      </div>
    );
  }

  if (decision.decision === "APPROVAL_REQUIRED") {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-5 space-y-4 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Decision: APPROVAL REQUIRED
                </span>
                <span className="text-xs text-slate-400">• Threshold Policy Intercepted</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                Human confirmation needed before checkout
              </h4>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {decision.reason}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>

        <div className="p-4 rounded-lg bg-navy-900/90 border border-card-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            A request has been logged in the Approval Center for operator sign-off.
          </div>

          <Link
            href="/approvals"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg transition-colors"
          >
            <span>Go to Approval Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // BLOCKED
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-5 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Decision: BLOCKED
              </span>
              <span className="text-xs text-slate-400">• Policy Violation Intercepted</span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">
              Autonomous purchase blocked by MandateGate
            </h4>
            <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
              {decision.reason}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
        >
          Dismiss
        </button>
      </div>

      <div className="p-3 rounded-lg bg-navy-900/90 border border-card-border text-xs text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
        <span>
          Policy engine prevented unpermitted agent expenditure. To allow this product, adjust the mandate's allowed categories or budget limits.
        </span>
      </div>
    </div>
  );
}


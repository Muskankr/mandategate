"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/navigation/AppShell";
import { TransactionGrid } from "@/transactions/TransactionGrid";
import { Transaction } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/ui/Toast";
import { Loader2 } from "lucide-react";

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalReturn = useCallback(async () => {
    const paypalStatus = searchParams.get("paypal");
    const token = searchParams.get("token");

    if (paypalStatus === "success" && token) {
      setCapturing(true);
      try {
        const result = await api.capturePayPalOrder(token);
        if (result.success) {
          success("Payment Captured", `PayPal order ${result.order_id} completed successfully.`);
        } else {
          error("Capture Failed", `PayPal order ${result.order_id} could not be captured.`);
        }
        await loadTransactions();
      } catch (err: any) {
        error("Capture Error", err.message || "Failed to capture PayPal order.");
      } finally {
        setCapturing(false);
      }
      window.history.replaceState({}, "", "/transactions");
    } else if (paypalStatus === "cancel") {
      error("Payment Cancelled", "PayPal checkout was cancelled by the buyer.");
      window.history.replaceState({}, "", "/transactions");
    }
  }, [searchParams]);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    handlePayPalReturn();
  }, [handlePayPalReturn]);

  return (
    <>
      {capturing && (
        <div className="mb-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          <span className="text-sm text-violet-300 font-medium">
            Capturing PayPal payment... Please wait.
          </span>
        </div>
      )}
      <TransactionGrid
        transactions={transactions}
        onRefresh={loadTransactions}
        isLoading={loading}
      />
    </>
  );
}

export default function TransactionsPage() {
  return (
    <AppShell
      title="Audit Ledger & Transactions"
      subtitle="Comprehensive audit trail of autonomous agent purchases, policy evaluations, and PayPal payment states"
    >
      <Suspense fallback={<div className="text-center py-8 text-slate-400 text-sm">Loading...</div>}>
        <TransactionsContent />
      </Suspense>
    </AppShell>
  );
}

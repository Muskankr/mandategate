"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/navigation/AppShell";
import { TransactionGrid } from "@/transactions/TransactionGrid";
import { Transaction } from "@/types";
import { api } from "@/lib/api";
import { Receipt, ShieldCheck } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <AppShell
      title="Audit Ledger & Transactions"
      subtitle="Comprehensive audit trail of autonomous agent purchases, policy evaluations, and PayPal payment states"
    >
      <TransactionGrid
        transactions={transactions}
        onRefresh={loadTransactions}
        isLoading={loading}
      />
    </AppShell>
  );
}


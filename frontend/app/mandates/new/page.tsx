"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/navigation/AppShell";
import { MandateForm } from "@/mandates/MandateForm";
import { ArrowLeft, Shield } from "lucide-react";

export default function NewMandatePage() {
  return (
    <AppShell
      title="Create Spending Mandate"
      subtitle="Define deterministic budget ceilings, allowed categories, and human approval boundaries"
      action={
        <Link
          href="/mandates"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mandates</span>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto">
        <MandateForm />
      </div>
    </AppShell>
  );
}


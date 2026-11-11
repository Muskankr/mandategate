"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Bot,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  ChevronRight,
  DollarSign,
  Cpu,
} from "lucide-react";
import { Footer } from "@/navigation/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="h-20 border-b border-card-border/80 bg-navy-950/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-glow">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
              Mandate<span className="text-violet-400">Gate</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
              Autonomous Agent Guard
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Security Controls
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            PayPal Architecture
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 lg:px-12 border-b border-card-border/60">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-violet-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[250px] bg-blue-600/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide shadow-glow">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>PayPal AI Agent Hackathon Submission</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Give AI the power to purchase,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400">
              not the power to overspend.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            MandateGate allows humans to safely delegate purchasing power to autonomous AI shopping agents with deterministic spending caps, category guardrails, and PayPal checkout enforcement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow transition-all"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-200 border border-card-border font-semibold text-sm transition-colors"
            >
              <span>Explore How It Works</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Interactive Policy Engine Preview Pill */}
          <div className="pt-8 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-card/80 border border-card-border backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Autonomous Policy Rule Engine
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Deterministic checks execute before any transaction touches PayPal
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  ✓ ALLOWED
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                  ⚠ APPROVAL REQ
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                  ✕ BLOCKED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-20 px-6 lg:px-12 bg-navy-950/60 border-b border-card-border/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              The Agentic Commerce Paradox
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Why Autonomous Agents Break Traditional Payments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-rose-500/20 space-y-4">
              <div className="flex items-center gap-3 text-rose-400 font-bold text-lg">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <span>The Unrestricted Agent Risk</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Runaway API costs:</strong> LLM agents loop or hallucinate, placing unintended bulk orders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Credential exposure:</strong> Giving credit cards or raw tokens to autonomous code risks severe leakage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Zero intent boundaries:</strong> No mechanism to restrict what categories an agent is permitted to browse.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <span>The MandateGate Solution</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Hard Spending Mandates:</strong> Deterministic caps and approval thresholds that LLMs cannot bypass.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>PayPal Sandbox Isolation:</strong> Real PayPal authorization sessions; agent never sees card numbers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Human-in-the-Loop Gateway:</strong> Over-threshold items route cleanly to the Approval Center.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 border-b border-card-border/60">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Workflow Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How MandateGate Safeguards Every Dollar
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              From natural-language directive to cryptographically verifiable PayPal settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Define Mandate",
                desc: "User creates a spending policy with total budget, allowed categories, expiry, and human approval threshold.",
                icon: ShieldAlert,
                color: "text-violet-400",
              },
              {
                step: "02",
                title: "Agent Discovery",
                desc: "Autonomous shopping agent searches merchants, compares specs, and surfaces optimal product matches.",
                icon: Bot,
                color: "text-blue-400",
              },
              {
                step: "03",
                title: "Deterministic Check",
                desc: "Backend policy engine checks constraints. Result: ALLOWED, APPROVAL REQUIRED, or BLOCKED.",
                icon: Cpu,
                color: "text-amber-400",
              },
              {
                step: "04",
                title: "PayPal Settlement",
                desc: "Authorized purchases execute through PayPal Sandbox checkout with full transaction audit records.",
                icon: CreditCard,
                color: "text-emerald-400",
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-6 rounded-2xl bg-card border border-card-border space-y-4 hover:border-violet-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-600 group-hover:text-violet-400 transition-colors font-mono">
                      {st.step}
                    </span>
                    <Icon className={`w-6 h-6 ${st.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white">{st.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-navy-950/60 border-b border-card-border/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Enterprise Grade Protection
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Deterministic Security Engineered for Autonomous Commerce
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-card-border space-y-3">
              <div className="p-2.5 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20 w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Zero Credential Exposure</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous agents never touch cardholder data, banking credentials, or PayPal API secrets. All payment tokens are generated and stored strictly on the backend.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-card-border space-y-3">
              <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Strict Category Filtering</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Restrict AI agents to specific work-related categories like Computer Hardware or Cloud SaaS. Attempts to purchase unauthorized categories are rejected instantly.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-card-border space-y-3">
              <div className="p-2.5 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Immutable Audit Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every agent inquiry, policy decision reason, and PayPal order ID is recorded for enterprise reporting and real-time review with AG Grid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to unleash autonomous shopping safely?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Test MandateGate today with realistic AI simulation or connect directly to your PayPal backend.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow transition-all"
            >
              <span>Open Application Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shopping"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-200 border border-card-border font-semibold text-sm transition-colors"
            >
              <span>Test AI Shopping Agent</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


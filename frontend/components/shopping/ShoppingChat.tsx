"use client";

import React, { useState, useEffect } from "react";
import { Mandate, Product, PurchaseDecision } from "@/types";
import { api } from "@/lib/api";
import { ProductCard } from "./ProductCard";
import { DecisionBanner } from "./DecisionBanner";
import { useToast } from "@/ui/Toast";
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Loader2,
  HelpCircle,
  Search,
} from "lucide-react";

const SUGGESTED_QUERIES = [
  "Ergonomic keyboard for developer workstation",
  "Silent wireless mouse under $100",
  "High-speed 8-in-1 USB-C data hub",
  "PlayStation 5 controller for team room",
  "BenQ monitor desk light bar",
];

export function ShoppingChat() {
  const { error } = useToast();
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [selectedMandateId, setSelectedMandateId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [agentAnalysis, setAgentAnalysis] = useState<string>("");

  const [evaluatingProduct, setEvaluatingProduct] = useState<string | null>(null);
  const [activeDecision, setActiveDecision] = useState<{
    decision: PurchaseDecision;
    product: Product;
  } | null>(null);

  useEffect(() => {
    async function loadMandates() {
      try {
        const list = await api.getMandates();
        const activeOnly = list.filter((m) => m.status === "ACTIVE");
        setMandates(activeOnly);
        if (activeOnly.length > 0) {
          setSelectedMandateId(activeOnly[0].id);
        }
      } catch (err: any) {
        error("Mandate Load Error", err.message);
      }
    }
    loadMandates();
  }, []);

  const selectedMandate = mandates.find((m) => m.id === selectedMandateId);

  const handleExecuteSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setActiveDecision(null);
    try {
      const res = await api.executeAgent({
        query: searchQuery,
        mandate_id: selectedMandateId,
      });
      setProducts(res.products);
      setAgentAnalysis(res.analysis);
    } catch (err: any) {
      error("Agent Execution Error", err.message || "Failed to execute agent query");
    } finally {
      setSearching(false);
    }
  };

  const handleEvaluatePurchase = async (product: Product) => {
    if (!selectedMandate) {
      error("Mandate Missing", "Please select an active spending mandate first.");
      return;
    }

    setEvaluatingProduct(product.id);
    setActiveDecision(null);
    try {
      const decision = await api.evaluatePolicy({
        product_id: product.id,
        mandate_id: selectedMandate.id,
        amount: product.price,
        category: product.category,
      });

      setActiveDecision({
        decision,
        product,
      });
    } catch (err: any) {
      error("Policy Evaluation Error", err.message || "Failed to evaluate mandate policy");
    } finally {
      setEvaluatingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mandate selector bar */}
      <div className="p-4 rounded-xl bg-card border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Shopping Mandate
            </span>
            <div className="text-sm font-bold text-white">
              {selectedMandate ? selectedMandate.name : "No active mandate selected"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Select Mandate:</label>
          <select
            value={selectedMandateId}
            onChange={(e) => setSelectedMandateId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-navy-900 border border-card-border text-xs text-white focus:outline-none focus:border-violet-500 max-w-xs"
          >
            {mandates.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (${m.remaining_budget.toFixed(2)} remaining)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Request Bar */}
      <div className="p-5 rounded-xl bg-card border border-card-border space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white">
            Ask Autonomous Shopping Agent
          </h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find developer ergonomic keyboard, USB hub or gaming equipment..."
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-navy-900 border border-card-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-3 text-slate-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Search & Recommend</span>
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-400" />
            Try prompts:
          </span>
          {SUGGESTED_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setQuery(q);
                handleExecuteSearch(q);
              }}
              className="px-2.5 py-1 rounded-full bg-navy-900 hover:bg-navy-850 border border-card-border text-[11px] text-slate-300 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Decision Banner (If evaluation performed) */}
      {activeDecision && (
        <DecisionBanner
          decision={activeDecision.decision}
          product={activeDecision.product}
          mandateName={selectedMandate?.name || "Active Mandate"}
          onDismiss={() => setActiveDecision(null)}
        />
      )}

      {/* Agent Reasoning Output */}
      {agentAnalysis && (
        <div className="p-4 rounded-xl bg-navy-900/90 border border-violet-500/20 text-xs text-slate-300 flex items-start gap-3">
          <Bot className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-violet-300 block mb-0.5">
              Autonomous Agent Search Analysis:
            </span>
            <p className="leading-relaxed text-slate-300">{agentAnalysis}</p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {searching ? (
        <div className="p-12 text-center rounded-xl bg-card border border-card-border">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">
            AI shopping agent scouring merchants & analyzing catalog...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Applying semantic matching against mandate policy constraints.
          </p>
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Surfaced {products.length} recommendation candidates</span>
            <span>Click any item to test deterministic policy engine</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                selectedMandate={selectedMandate}
                onEvaluatePurchase={handleEvaluatePurchase}
                isEvaluating={evaluatingProduct === p.id}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl bg-card border border-card-border text-xs text-slate-400">
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-medium text-slate-300">No products displayed yet.</p>
          <p className="mt-1">
            Type a request above or click a prompt to have the AI agent surface vetted recommendations.
          </p>
        </div>
      )}
    </div>
  );
}


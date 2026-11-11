"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/ui/Toast";
import {
  ShieldCheck,
  Plus,
  X,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

const PRESET_CATEGORIES = [
  "Computer Hardware",
  "Software & SaaS",
  "Office Equipment",
  "Electronics",
  "Cloud Infrastructure",
  "Developer Tools",
  "Office Supplies",
  "Books & Education",
];

export function MandateForm() {
  const router = useRouter();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [instruction, setInstruction] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [approvalThreshold, setApprovalThreshold] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Computer Hardware",
    "Electronics",
  ]);
  const [customCatInput, setCustomCatInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (trimmed && !selectedCategories.includes(trimmed)) {
      setSelectedCategories([...selectedCategories, trimmed]);
      setCustomCatInput("");
    }
  };

  const handleUsePresetExample = (type: "dev" | "saas" | "office") => {
    if (type === "dev") {
      setName("Engineering Workstation Peripherals");
      setInstruction("Procure developer keyboard, ergonomic mouse, and USB accessories for new team members.");
      setTotalBudget("1200");
      setApprovalThreshold("150");
      setSelectedCategories(["Computer Hardware", "Electronics", "Developer Tools"]);
    } else if (type === "saas") {
      setName("DevOps Cloud & SaaS Subscriptions");
      setInstruction("Auto-renew continuous integration runners, log monitoring tiers, and developer tools.");
      setTotalBudget("750");
      setApprovalThreshold("80");
      setSelectedCategories(["Software & SaaS", "Cloud Infrastructure"]);
    } else {
      setName("Quarterly Office Ergonomics Refresh");
      setInstruction("Allow agent to order ergonomic desk lamps, wrist rests, and cables under safety bounds.");
      setTotalBudget("500");
      setApprovalThreshold("100");
      setSelectedCategories(["Office Equipment", "Office Supplies"]);
    }
    // Set expiry 30 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setExpiryDate(d.toISOString().split("T")[0]);
    setValidationErrors({});
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Mandate name is required";
    if (!instruction.trim()) errors.instruction = "Natural-language directive is required";
    if (!totalBudget || Number(totalBudget) <= 0) errors.totalBudget = "Valid positive budget required";
    if (!approvalThreshold || Number(approvalThreshold) <= 0) errors.approvalThreshold = "Valid threshold required";
    if (Number(approvalThreshold) > Number(totalBudget)) {
      errors.approvalThreshold = "Threshold cannot exceed total budget cap";
    }
    if (selectedCategories.length === 0) errors.categories = "Select at least one permitted category";
    if (!expiryDate) errors.expiryDate = "Expiry date is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const created = await api.createMandate({
        name,
        instruction,
        total_budget: parseFloat(totalBudget),
        currency,
        allowed_categories: selectedCategories,
        approval_threshold: parseFloat(approvalThreshold),
        expiry_date: new Date(expiryDate).toISOString(),
      });

      success("Mandate Active", `Spending policy "${created.name}" created and deployed to AI agent guard.`);
      router.push("/mandates");
    } catch (err: any) {
      error("Creation Error", err.message || "Failed to create mandate policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Starter Templates */}
      <div className="p-4 rounded-xl bg-navy-900 border border-card-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Quick Policy Templates</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleUsePresetExample("dev")}
            className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs text-slate-300 hover:text-white transition-colors"
          >
            Engineering Hardware ($1,200)
          </button>
          <button
            type="button"
            onClick={() => handleUsePresetExample("saas")}
            className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs text-slate-300 hover:text-white transition-colors"
          >
            DevOps & Cloud SaaS ($750)
          </button>
          <button
            type="button"
            onClick={() => handleUsePresetExample("office")}
            className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs text-slate-300 hover:text-white transition-colors"
          >
            Office Ergonomics ($500)
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-card-border p-6 space-y-5">
        {/* Mandate Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Mandate Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Developer Workstation Hardware"
            className="w-full px-4 py-2.5 rounded-lg bg-navy-900 border border-card-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {validationErrors.name && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationErrors.name}
            </p>
          )}
        </div>

        {/* Natural Language Instruction */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Natural-Language Directive *
          </label>
          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe what the AI shopping agent is instructed to purchase, specific constraints, and bounds..."
            className="w-full px-4 py-2.5 rounded-lg bg-navy-900 border border-card-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            The AI agent parses this directive to find matching items, while the backend policy engine enforces hard constraints.
          </p>
          {validationErrors.instruction && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationErrors.instruction}
            </p>
          )}
        </div>

        {/* Financial Constraints (Budget, Threshold, Currency) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Total Budget Cap *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="1000.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-navy-900 border border-card-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {validationErrors.totalBudget && (
              <p className="text-xs text-rose-400 mt-1">{validationErrors.totalBudget}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Auto-Approval Threshold *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(e.target.value)}
                placeholder="150.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-navy-900 border border-card-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Purchases exceeding this require human approval.
            </p>
            {validationErrors.approvalThreshold && (
              <p className="text-xs text-rose-400 mt-1">{validationErrors.approvalThreshold}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-card-border text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="USD">USD ($ - United States Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
            </select>
          </div>
        </div>

        {/* Permitted Categories */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Permitted Categories *
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_CATEGORIES.map((cat) => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-violet-600 text-white border border-violet-400 shadow-glow"
                      : "bg-navy-900 text-slate-300 border border-card-border hover:border-slate-600"
                  }`}
                >
                  {active ? `✓ ${cat}` : `+ ${cat}`}
                </button>
              );
            })}
          </div>

          {/* Custom Category Input */}
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={customCatInput}
              onChange={(e) => setCustomCatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomCategory();
                }
              }}
              placeholder="Add custom category..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-navy-900 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={addCustomCategory}
              className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-card-border text-xs text-slate-300 hover:text-white"
            >
              Add
            </button>
          </div>

          {validationErrors.categories && (
            <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationErrors.categories}
            </p>
          )}
        </div>

        {/* Expiry Date */}
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Expiry Date *
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-card-border text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
          {validationErrors.expiryDate && (
            <p className="text-xs text-rose-400 mt-1">{validationErrors.expiryDate}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-navy-850 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow transition-all disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{loading ? "Creating Policy..." : "Create & Deploy Mandate"}</span>
        </button>
      </div>
    </form>
  );
}


"use client";

import React from "react";
import Image from "next/image";
import { Product, Mandate } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  ShieldCheck,
  Star,
  ExternalLink,
  Store,
  Layers,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  selectedMandate?: Mandate;
  onEvaluatePurchase: (product: Product) => void;
  isEvaluating?: boolean;
}

export function ProductCard({
  product,
  selectedMandate,
  onEvaluatePurchase,
  isEvaluating,
}: ProductCardProps) {
  // Check fast heuristic against selected mandate
  const isCategoryAllowed = selectedMandate
    ? selectedMandate.allowed_categories.some(
        (c) => c.toLowerCase() === product.category.toLowerCase()
      )
    : true;

  const exceedsThreshold = selectedMandate
    ? product.price > selectedMandate.approval_threshold
    : false;

  const exceedsRemainingBudget = selectedMandate
    ? product.price > selectedMandate.remaining_budget
    : false;

  return (
    <div className="rounded-xl bg-card border border-card-border overflow-hidden flex flex-col justify-between hover:border-violet-500/40 transition-all duration-200 group">
      <div>
        {/* Product Image & Badges */}
        <div className="relative h-48 w-full bg-navy-900 overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-[11px] font-semibold text-slate-200 border border-card-border">
              {product.category}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-[11px] font-medium text-amber-300 border border-card-border">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Store className="w-3.5 h-3.5 text-violet-400" />
            <span>{product.merchant}</span>
          </div>

          <h4 className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors line-clamp-2">
            {product.title}
          </h4>

          {/* AI Recommendation Reasoning */}
          <div className="p-3 rounded-lg bg-navy-900/90 border border-card-border text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-violet-400">
              <Sparkles className="w-3 h-3" />
              <span>AI Agent Rationale</span>
            </div>
            <p className="italic text-slate-300 text-[11px] leading-relaxed">
              "{product.explanation}"
            </p>
          </div>

          {/* Spec tags */}
          {product.specs && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.specs.slice(0, 3).map((spec, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-navy-850 text-[10px] text-slate-400 border border-card-border"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Policy Evaluation Footer */}
      <div className="p-5 pt-0 border-t border-card-border/60 mt-3 space-y-3">
        <div className="flex items-baseline justify-between pt-3">
          <div>
            <span className="text-xs text-slate-400">Price</span>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatCurrency(product.price, product.currency)}
            </div>
          </div>

          {selectedMandate && (
            <div className="text-right text-[11px]">
              {exceedsRemainingBudget ? (
                <span className="text-rose-400 font-medium">Exceeds Budget</span>
              ) : !isCategoryAllowed ? (
                <span className="text-rose-400 font-medium">Blocked Category</span>
              ) : exceedsThreshold ? (
                <span className="text-amber-400 font-medium">Requires Approval</span>
              ) : (
                <span className="text-emerald-400 font-medium">Within Limit</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onEvaluatePurchase(product)}
          disabled={isEvaluating}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            {isEvaluating ? "Evaluating Mandate Policy..." : "Run Policy Evaluation & Purchase"}
          </span>
        </button>
      </div>
    </div>
  );
}


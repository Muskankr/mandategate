"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryChartProps {
  data: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-card rounded-xl border border-card-border">
        <div className="animate-pulse text-xs text-slate-500">Loading category breakdown...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg bg-navy-900 border border-card-border p-3 shadow-xl text-xs">
          <p className="font-semibold text-slate-200">{item.category}</p>
          <p className="text-violet-400 font-medium mt-1">
            {formatCurrency(item.amount)} ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[280px]">
      <div className="w-full sm:w-1/2 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f1629" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full sm:w-1/2 space-y-2 text-xs">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 truncate font-medium">{item.category}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-400">{formatCurrency(item.amount)}</span>
              <span className="text-slate-500 w-9 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


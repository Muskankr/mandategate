"use client";

import React, { useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Transaction } from "@/types";
import { StatusBadge } from "@/ui/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Search, Download, Filter, RefreshCw } from "lucide-react";

interface TransactionGridProps {
  transactions: Transaction[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function TransactionGrid({
  transactions,
  onRefresh,
  isLoading,
}: TransactionGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredData = useMemo(() => {
    if (statusFilter === "ALL") return transactions;
    return transactions.filter((t) => t.payment_status === statusFilter);
  }, [transactions, statusFilter]);

  const columnDefs = useMemo<ColDef<Transaction>[]>(() => {
    return [
      {
        headerName: "Txn ID",
        field: "id",
        width: 140,
        filter: "agTextColumnFilter",
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span className="font-mono text-xs text-violet-400 font-semibold">
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "Product / Service",
        field: "product_title",
        flex: 2,
        minWidth: 200,
        filter: "agTextColumnFilter",
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span className="font-medium text-slate-100 truncate block">
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "Amount",
        field: "amount",
        width: 130,
        sortable: true,
        filter: "agNumberColumnFilter",
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span className="font-bold text-white text-xs">
              {formatCurrency(params.value, params.data?.currency)}
            </span>
          );
        },
      },
      {
        headerName: "Category",
        field: "category",
        width: 170,
        filter: "agTextColumnFilter",
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span className="px-2 py-0.5 rounded bg-navy-850 text-slate-300 border border-card-border text-xs">
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "Mandate",
        field: "mandate_name",
        flex: 1.5,
        minWidth: 180,
        filter: "agTextColumnFilter",
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span className="text-slate-300 text-xs truncate block" title={params.value}>
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "Payment Status",
        field: "payment_status",
        width: 155,
        filter: "agTextColumnFilter",
        cellRenderer: (params: ICellRendererParams) => {
          return <StatusBadge status={params.value} size="sm" />;
        },
      },
      {
        headerName: "Date & Time",
        field: "date",
        width: 160,
        sort: "desc",
        filter: "agDateColumnFilter",
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span className="text-slate-400 text-xs">
              {formatDateTime(params.value)}
            </span>
          );
        },
      },
      {
        headerName: "Policy Decision Reason",
        field: "decision_reason",
        flex: 2,
        minWidth: 240,
        cellRenderer: (params: ICellRendererParams) => {
          return (
            <span
              className="text-slate-300 text-xs truncate block"
              title={params.value}
            >
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "PayPal Order",
        field: "paypal_order_id",
        width: 160,
        cellRenderer: (params: ICellRendererParams) => {
          return params.value ? (
            <span className="font-mono text-[11px] text-slate-400">
              {params.value}
            </span>
          ) : (
            <span className="text-slate-600 text-xs">—</span>
          );
        },
      },
    ];
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
    };
  }, []);

  const exportCsv = () => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `mandategate_transactions_${new Date().toISOString().split("T")[0]}.csv`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Table Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-card-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            placeholder="Search transactions, products, mandates..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-navy-900 border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-navy-900 border border-card-border rounded-lg p-1 text-xs">
            <span className="text-slate-500 px-1 text-[11px] font-semibold uppercase">Status:</span>
            {["ALL", "COMPLETED", "PENDING", "BLOCKED", "FAILED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-navy-900 hover:bg-navy-850 text-slate-300 hover:text-white border border-card-border transition-colors disabled:opacity-50"
              title="Refresh transactions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          )}

          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-900 hover:bg-navy-850 text-slate-300 hover:text-white border border-card-border text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-violet-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* AG Grid Container */}
      <div className="ag-theme-quartz-dark w-full h-[550px] shadow-2xl">
        <AgGridReact
          ref={gridRef}
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          rowHeight={46}
          headerHeight={44}
          animateRows={true}
        />
      </div>
    </div>
  );
}


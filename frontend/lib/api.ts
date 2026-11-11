import {
  Mandate,
  PurchaseDecision,
  Product,
  ApprovalRequest,
  Transaction,
  PayPalOrderResponse,
  DashboardMetrics,
} from "@/types";
import {
  DEMO_MANDATES,
  DEMO_PRODUCTS,
  DEMO_APPROVALS,
  DEMO_TRANSACTIONS,
  DEMO_METRICS,
} from "./demo-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function isDemoMode(): boolean {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem("MANDATEGATE_DEMO_MODE");
    if (override !== null) {
      return override === "true";
    }
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
}

export function setDemoMode(enabled: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("MANDATEGATE_DEMO_MODE", enabled ? "true" : "false");
    window.dispatchEvent(new Event("demo-mode-changed"));
  }
}

// In-memory demo store so user interactions persist during browser session
let inMemoryMandates: Mandate[] = [...DEMO_MANDATES];
let inMemoryApprovals: ApprovalRequest[] = [...DEMO_APPROVALS];
let inMemoryTransactions: Transaction[] = [...DEMO_TRANSACTIONS];

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      let errBody;
      try {
        errBody = await res.json();
      } catch {
        errBody = { message: res.statusText };
      }
      throw new ApiError(
        errBody?.message || errBody?.detail || `API request failed: ${res.status}`,
        res.status,
        errBody
      );
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Unable to connect to backend service at ${API_BASE_URL}. Ensure the service is running or switch to Demo Mode.`,
      0,
      { originalError: err.message }
    );
  }
}

export const api = {
  // Mandates
  async getMandates(): Promise<Mandate[]> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 150));
      return [...inMemoryMandates];
    }
    return request<Mandate[]>("/api/mandates");
  },

  async createMandate(data: {
    name: string;
    instruction: string;
    total_budget: number;
    currency?: string;
    allowed_categories: string[];
    approval_threshold: number;
    expiry_date: string;
  }): Promise<Mandate> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 250));
      const newMandate: Mandate = {
        id: `mnd_${Math.random().toString(36).substring(2, 7)}`,
        name: data.name,
        instruction: data.instruction,
        total_budget: Number(data.total_budget),
        spent_amount: 0,
        remaining_budget: Number(data.total_budget),
        currency: data.currency || "USD",
        allowed_categories: data.allowed_categories,
        approval_threshold: Number(data.approval_threshold),
        expiry_date: data.expiry_date,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      };
      inMemoryMandates.unshift(newMandate);
      return newMandate;
    }
    return request<Mandate>("/api/mandates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async revokeMandate(id: string): Promise<{ success: boolean; id: string }> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 200));
      inMemoryMandates = inMemoryMandates.map((m) =>
        m.id === id ? { ...m, status: "REVOKED" as const } : m
      );
      return { success: true, id };
    }
    return request<{ success: boolean; id: string }>(
      `/api/mandates/${id}/revoke`,
      { method: "POST" }
    );
  },

  // AI Agent & Policy Engine
  async executeAgent(params: {
    query: string;
    mandate_id?: string;
  }): Promise<{ products: Product[]; analysis: string }> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 400));
      const q = params.query.toLowerCase();
      let matched = DEMO_PRODUCTS;
      if (q.includes("keyboard") || q.includes("keychron")) {
        matched = DEMO_PRODUCTS.filter((p) => p.title.toLowerCase().includes("keyboard"));
      } else if (q.includes("mouse") || q.includes("logitech")) {
        matched = DEMO_PRODUCTS.filter((p) => p.title.toLowerCase().includes("mouse"));
      } else if (q.includes("game") || q.includes("playstation")) {
        matched = DEMO_PRODUCTS.filter((p) => p.category.includes("Gaming"));
      } else if (q.includes("usb") || q.includes("hub") || q.includes("anker")) {
        matched = DEMO_PRODUCTS.filter((p) => p.title.toLowerCase().includes("hub"));
      }
      return {
        products: matched.length > 0 ? matched : DEMO_PRODUCTS,
        analysis: `AI shopping agent parsed requirements for "${params.query}". Evaluated vendor authenticity, merchant reliability, and policy compatibility.`,
      };
    }
    return request<{ products: Product[]; analysis: string }>(
      "/api/agent/execute",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
  },

  async evaluatePolicy(params: {
    product_id: string;
    mandate_id: string;
    amount: number;
    category: string;
  }): Promise<PurchaseDecision> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 300));
      const mandate = inMemoryMandates.find((m) => m.id === params.mandate_id);
      if (!mandate) {
        return {
          decision: "BLOCKED",
          amount: params.amount,
          reason: "Mandate not found or invalid",
          requires_approval: false,
        };
      }

      // Check category
      const categoryAllowed = mandate.allowed_categories.some(
        (c) => c.toLowerCase() === params.category.toLowerCase()
      );
      if (!categoryAllowed) {
        return {
          decision: "BLOCKED",
          amount: params.amount,
          reason: `Category '${params.category}' is not permitted by mandate '${mandate.name}'. Permitted categories: ${mandate.allowed_categories.join(", ")}.`,
          requires_approval: false,
          mandate_id: mandate.id,
          product_id: params.product_id,
        };
      }

      // Check remaining budget
      if (params.amount > mandate.remaining_budget) {
        return {
          decision: "BLOCKED",
          amount: params.amount,
          reason: `Insufficient remaining budget. Purchase amount ($${params.amount.toFixed(2)}) exceeds remaining balance ($${mandate.remaining_budget.toFixed(2)}).`,
          requires_approval: false,
          mandate_id: mandate.id,
          product_id: params.product_id,
        };
      }

      // Check threshold
      if (params.amount > mandate.approval_threshold) {
        return {
          decision: "APPROVAL_REQUIRED",
          amount: params.amount,
          reason: `Purchase amount ($${params.amount.toFixed(2)}) exceeds auto-approval threshold ($${mandate.approval_threshold.toFixed(2)}). Human confirmation required.`,
          requires_approval: true,
          mandate_id: mandate.id,
          product_id: params.product_id,
          suggested_action: "Forward to Approval Center",
        };
      }

      // Fully allowed
      return {
        decision: "ALLOWED",
        amount: params.amount,
        reason: `Complies with mandate bounds. Permitted category and amount ($${params.amount.toFixed(2)}) is below auto-approval limit ($${mandate.approval_threshold.toFixed(2)}).`,
        requires_approval: false,
        mandate_id: mandate.id,
        product_id: params.product_id,
        suggested_action: "Ready for PayPal Checkout",
      };
    }

    return request<PurchaseDecision>("/api/policy/evaluate", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  // Approvals
  async getApprovals(): Promise<ApprovalRequest[]> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 150));
      return [...inMemoryApprovals];
    }
    return request<ApprovalRequest[]>("/api/approvals");
  },

  async approveRequest(
    id: string,
    action: "approve" | "reject" = "approve"
  ): Promise<{ success: boolean; approval_id: string; status: string; payment?: PayPalOrderResponse }> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 350));
      const req = inMemoryApprovals.find((a) => a.id === id);
      if (!req) {
        throw new Error("Approval request not found");
      }
      req.status = action === "approve" ? "APPROVED" : "REJECTED";

      // If approved, create transaction & PayPal order contract
      if (action === "approve") {
        const fakeOrderId = `PAYID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const newTxn: Transaction = {
          id: `txn_${Math.random().toString(36).substring(2, 8)}`,
          product_title: req.product.title,
          amount: req.amount,
          currency: req.currency,
          category: req.product.category,
          mandate_name: req.mandate_name,
          mandate_id: req.mandate_id,
          payment_status: "COMPLETED",
          date: new Date().toISOString(),
          decision_reason: `Human operator approved over-threshold purchase ($${req.amount.toFixed(2)})`,
          paypal_order_id: fakeOrderId,
        };
        inMemoryTransactions.unshift(newTxn);

        // Deduct from mandate
        const targetMandate = inMemoryMandates.find((m) => m.id === req.mandate_id);
        if (targetMandate) {
          targetMandate.spent_amount += req.amount;
          targetMandate.remaining_budget = Math.max(0, targetMandate.total_budget - targetMandate.spent_amount);
        }

        return {
          success: true,
          approval_id: id,
          status: "APPROVED",
          payment: {
            order_id: fakeOrderId,
            status: "CREATED",
            approval_url: `https://www.sandbox.paypal.com/checkoutnow?token=${fakeOrderId}`,
          },
        };
      }

      return {
        success: true,
        approval_id: id,
        status: "REJECTED",
      };
    }

    return request<{ success: boolean; approval_id: string; status: string; payment?: PayPalOrderResponse }>(
      `/api/approvals/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ action }),
      }
    );
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 150));
      return [...inMemoryTransactions];
    }
    return request<Transaction[]>("/api/transactions");
  },

  // PayPal Sandbox checkout
  async createPayPalOrder(params: {
    product_id: string;
    mandate_id: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<PayPalOrderResponse> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 400));
      const orderId = `PAYID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      return {
        order_id: orderId,
        status: "CREATED",
        approval_url: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
        message: "Demo order created. In live mode, PayPal Sandbox redirects the user.",
      };
    }
    return request<PayPalOrderResponse>("/api/paypal/create-order", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async capturePayPalOrder(orderId: string): Promise<{ success: boolean; order_id: string; status: string }> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        success: true,
        order_id: orderId,
        status: "COMPLETED",
      };
    }
    return request<{ success: boolean; order_id: string; status: string }>("/api/paypal/capture-order", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    });
  },

  // Dashboard Aggregates
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 150));
      const activeMandates = inMemoryMandates.filter((m) => m.status === "ACTIVE");
      const totalBudget = inMemoryMandates.reduce((sum, m) => sum + m.total_budget, 0);
      const totalSpent = inMemoryMandates.reduce((sum, m) => sum + m.spent_amount, 0);
      const remainingBudget = totalBudget - totalSpent;
      const pendingApprovals = inMemoryApprovals.filter((a) => a.status === "PENDING").length;

      return {
        ...DEMO_METRICS,
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining_budget: remainingBudget,
        active_mandates: activeMandates.length,
        pending_approvals: pendingApprovals,
        recent_transactions: inMemoryTransactions.slice(0, 5),
      };
    }

    // When backend provides dashboard route, or aggregate from primary endpoints
    try {
      return await request<DashboardMetrics>("/api/dashboard/metrics");
    } catch {
      // Fallback: build from individual live endpoints
      const [mandates, txns, approvals] = await Promise.all([
        request<Mandate[]>("/api/mandates"),
        request<Transaction[]>("/api/transactions"),
        request<ApprovalRequest[]>("/api/approvals"),
      ]);
      const totalBudget = mandates.reduce((s, m) => s + m.total_budget, 0);
      const totalSpent = mandates.reduce((s, m) => s + m.spent_amount, 0);
      return {
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining_budget: totalBudget - totalSpent,
        active_mandates: mandates.filter((m) => m.status === "ACTIVE").length,
        pending_approvals: approvals.filter((a) => a.status === "PENDING").length,
        recent_transactions: txns.slice(0, 5),
        spending_trend: DEMO_METRICS.spending_trend,
        category_breakdown: DEMO_METRICS.category_breakdown,
        ai_activity: DEMO_METRICS.ai_activity,
      };
    }
  },
};


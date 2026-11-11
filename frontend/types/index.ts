export type MandateStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface Mandate {
  id: string;
  name: string;
  instruction: string;
  total_budget: number;
  spent_amount: number;
  remaining_budget: number;
  currency: string;
  allowed_categories: string[];
  approval_threshold: number;
  expiry_date: string;
  status: MandateStatus;
  created_at: string;
}

export type DecisionType = 'ALLOWED' | 'APPROVAL_REQUIRED' | 'BLOCKED';

export interface PurchaseDecision {
  decision: DecisionType;
  amount: number;
  reason: string;
  requires_approval: boolean;
  product_id?: string;
  mandate_id?: string;
  suggested_action?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  merchant: string;
  rating: number;
  reviews_count?: number;
  image_url: string;
  explanation: string;
  specs?: string[];
  in_stock: boolean;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  product: Product;
  amount: number;
  currency: string;
  mandate_id: string;
  mandate_name: string;
  mandate_remaining_budget: number;
  ai_recommendation: string;
  status: ApprovalStatus;
  created_at: string;
  policy_trigger?: string;
}

export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'BLOCKED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  product_title: string;
  amount: number;
  currency: string;
  category: string;
  mandate_name: string;
  mandate_id: string;
  payment_status: PaymentStatus;
  date: string;
  decision_reason: string;
  paypal_order_id?: string;
}

export interface PayPalOrderResponse {
  order_id: string;
  status: string;
  approval_url?: string;
  message?: string;
}

export interface DashboardMetrics {
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  active_mandates: number;
  pending_approvals: number;
  recent_transactions: Transaction[];
  spending_trend: { date: string; amount: number; budget_cap: number }[];
  category_breakdown: { category: string; amount: number; percentage: number; color: string }[];
  ai_activity: {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    type: 'evaluation' | 'recommendation' | 'approval_required' | 'blocked' | 'executed';
  }[];
}


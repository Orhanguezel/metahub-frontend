/* FE tipleri – ObjectId'ler string */
export type Money = number;

export interface IFileAsset {
  url: string;
  name?: string;
  mime?: string;
  size?: number;
  publicId?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalStage = "supervisor" | "finance" | "custom";

export interface IApproval {
  status: ApprovalStatus;
  approverRef?: string;
  note?: string;
  at?: string | Date;
  stage?: ApprovalStage;
}

export interface ITaxBreakdown {
  rate: number;
  base: Money;
  tax: Money;
  total: Money;
}

export interface IExpenseLine {
  // Sınıflandırma
  categoryRef?: string;
  categoryName?: string;
  description?: string;

  // Miktar/fiyat
  qty?: number;
  unitPrice?: Money;
  discount?: Money;
  taxRate?: number;

  // Otomatik hesaplananlar (BE pre-save set ediyor)
  netAmount?: Money;
  taxAmount?: Money;
  totalAmount?: Money;

  // Dağıtım / izleme
  apartmentRef?: string;
  jobRef?: string;
  serviceRef?: string;
  contractRef?: string;
  tags?: string[];
}

export type ExpenseType =
  | "vendor_bill"
  | "purchase"
  | "reimbursement"
  | "subscription"
  | "utility"
  | "other";

export type ExpenseStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "scheduled"
  | "partially_paid"
  | "paid"
  | "rejected"
  | "void";

export type ReimbStatus = "not_required" | "pending" | "submitted" | "approved" | "paid";

export interface IExpense {
  _id: string;

  tenant: string;
  code?: string;
  type: ExpenseType;

  // İlişkiler
  vendorRef?: string;
  employeeRef?: string;
  apartmentRef?: string;
  jobRef?: string;

  // Tarihler
  expenseDate: string | Date;
  dueDate?: string | Date;
  postedAt?: string | Date;

  // Para birimi / FX
  currency: string;
  baseCurrency?: string;
  fxRate?: number;

  // Toplamlar (BE hesaplıyor)
  subTotal?: Money;
  discountTotal?: Money;
  taxTotal?: Money;
  grandTotal?: Money;
  taxBreakdown?: ITaxBreakdown[];

  // Ödemeler
  paymentRefs?: string[];
  paidAmount?: Money;
  balance?: Money;

  // Reimbursement
  reimbursable?: boolean;
  reimbursementStatus?: ReimbStatus;

  // Durum
  status: ExpenseStatus;

  // İçerik
  vendorBillNo?: string;
  lines: IExpenseLine[];
  notes?: string;
  internalNote?: string;
  attachments?: IFileAsset[];
  approvals?: IApproval[];
  tags?: string[];

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* Admin liste filtreleri (BE ile birebir) */
export interface ExpenseListFilters {
  q?: string;
  type?: ExpenseType;
  status?: ExpenseStatus;
  vendorRef?: string;
  employeeRef?: string;
  apartmentRef?: string;
  jobRef?: string;
  dateFrom?: string;         // YYYY-MM-DD
  dateTo?: string;           // YYYY-MM-DD
  reimbursable?: boolean;
  reimbursementStatus?: ReimbStatus;
  limit?: number;            // max 500
}

import type { SupportedLocale } from "@/types/common";

/* FE tarafında ObjectId’ler string. Populate edilmiş dönen alanlar için Ref<T> kullanalım */
export type Ref<T> = string | (T & { _id: string });

export type TranslatedLabel = Partial<Record<SupportedLocale, string>>;

export type JobStatus =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "paused"
  | "completed"
  | "cancelled";

export type JobSource = "manual" | "recurrence" | "contract" | "adhoc";
export type StepType = "task" | "inspection" | "safety" | "handover";
export type JobPriority = "low" | "normal" | "high" | "critical";

/* --- Alt tipler --- */
export interface IJobAssignment {
  employeeRef: string;
  role?: "lead" | "member";
  plannedMinutes?: number;
  actualMinutes?: number;
  timeEntryRefs?: string[];
}

export interface IMaterialUsage {
  itemRef?: string;
  sku?: string;
  name?: TranslatedLabel;
  quantity?: number;
  unit?: string;
  costPerUnit?: number;
  currency?: string;
  totalCost?: number;
  chargeTo?: "expense" | "customer" | "internal";
}

export interface IChecklistResult {
  text?: TranslatedLabel;
  required?: boolean;
  checked?: boolean;
  photoUrls?: string[];
  note?: string;
}

export interface IQualityResult {
  key: string;
  label?: TranslatedLabel;
  type?: "boolean" | "number" | "select";
  value?: any;
  pass?: boolean;
}

export interface IJobStepResult {
  stepCode?: string;
  title?: TranslatedLabel;
  instruction?: TranslatedLabel;
  type?: StepType;
  estimatedMinutes?: number;
  actualMinutes?: number;
  checklist?: IChecklistResult[];
  quality?: IQualityResult[];
  notes?: string;
  photos?: string[];
  completed?: boolean;
}

export interface IDeliverableResult {
  photos?: { before?: string[]; after?: string[] };
  signatures?: {
    customer?: { name?: string; byRef?: string; at?: string | Date; imageUrl?: string };
    supervisor?: { name?: string; byRef?: string; at?: string | Date; imageUrl?: string };
  };
  notes?: string;
  attachments?: { url: string; mime?: string; caption?: string }[];
}

export interface IJobFinance {
  billable?: boolean;
  revenueAmountSnapshot?: number;
  revenueCurrency?: string;
  laborCostSnapshot?: number;
  materialCostSnapshot?: number;
  invoiceRef?: string;
  invoiceLineId?: string;
}

export interface IJobSchedule {
  plannedStart?: string | Date;
  plannedEnd?: string | Date;
  dueAt?: string | Date;
  startedAt?: string | Date;
  pausedAt?: string | Date;
  resumedAt?: string | Date;
  completedAt?: string | Date;
  cancelledAt?: string | Date;
}

/* --- Ana tip --- */
export interface IOperationJob {
  _id: string;

  tenant: string;
  code: string;
  title?: TranslatedLabel;
  description?: TranslatedLabel;

  source: JobSource;
  templateRef?: string;
  serviceRef?: Ref<{ name?: TranslatedLabel; code?: string }>;
  contractRef?: Ref<{ code?: string; status?: string }>;

  apartmentRef: Ref<{ title?: TranslatedLabel; slug?: string; address?: unknown }>;
  categoryRef?: Ref<{ name?: string; slug?: string }>;

  status: JobStatus;

  schedule: IJobSchedule;
  expectedDurationMinutes?: number;
  actualDurationMinutes?: number;
  onTime?: boolean;

  assignments: Array<IJobAssignment & { employeeRef: Ref<{ name?: string; email?: string }> }>;
  steps: IJobStepResult[];
  materials?: IMaterialUsage[];
  deliverables?: IDeliverableResult;

  finance?: IJobFinance;

  priority?: JobPriority;
  tags?: string[];

  isActive: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* --- Liste filtreleri + meta --- */
export interface JobsAdminFilters {
  status?: JobStatus;
  source?: JobSource;
  priority?: JobPriority;
  apartment?: string;
  service?: string;
  contract?: string;
  employee?: string;
  code?: string;
  q?: string;
  plannedFrom?: string; // ISO
  plannedTo?: string;   // ISO
  dueFrom?: string;     // ISO
  dueTo?: string;       // ISO
  isActive?: boolean;
  limit?: number;       // BE: default 50, max 200
  page?: number;        // 1-based
}

export interface JobsListMeta {
  total: number;
  page: number;
  limit: number;
}

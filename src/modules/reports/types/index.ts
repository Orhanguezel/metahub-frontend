// src/modules/reports/types.ts

/* ------- Shared enums / helpers ------- */
export const REPORT_KINDS = [
  "ar_aging","ap_aging","revenue","expense","cashflow",
  "profitability","billing_forecast","invoice_collections",
  "employee_utilization","workload","service_performance",
] as const;
export type ReportKind = typeof REPORT_KINDS[number];

export const EXPORT_FORMATS = ["csv","xlsx","pdf","json"] as const;
export type ExportFormat = typeof EXPORT_FORMATS[number];

export const SCHEDULE_FREQS = ["daily","weekly","monthly","quarterly","yearly","cron"] as const;
export type ScheduleFreq = typeof SCHEDULE_FREQS[number];

export type DatePreset =
  | "today" | "yesterday"
  | "this_week" | "last_week"
  | "this_month" | "last_month"
  | "this_quarter" | "last_quarter"
  | "this_year" | "last_year"
  | "custom";

export interface IFileAsset {
  url: string;
  name?: string;
  mime?: string;
  size?: number;
  publicId?: string;
}

export interface IDateRange {
  preset?: DatePreset;
  from?: string | Date;
  to?: string | Date;
  timezone?: string;
}

export interface IReportFilters {
  date?: IDateRange;
  currency?: string;

  apartmentIds?: string[];
  categoryIds?: string[];
  serviceIds?: string[];
  employeeIds?: string[];
  vendorIds?: string[];
  contractIds?: string[];
  jobIds?: string[];

  status?: string[];
  tags?: string[];
  extra?: Record<string, any>;
}

export interface IReportSchedule {
  isEnabled: boolean;
  frequency: ScheduleFreq;
  timezone?: string;
  timeOfDay?: string;        // "09:00"
  dayOfWeek?: 0|1|2|3|4|5|6;
  dayOfMonth?: number;
  cron?: string;
  lastRunAt?: string | Date;
  nextRunAt?: string | Date;
  recipients?: Array<{
    channel: "email" | "webhook";
    target: string;
    format?: "csv" | "xlsx" | "pdf" | "json";
  }>;
}

/** _id opsiyonel -> form draft'larında da bu tipi kullanabiliriz */
export interface IReportDefinition {
  _id?: string;
  tenant: string;
  code?: string;
  name: string;
  kind: ReportKind;
  description?: string;
  defaultFilters?: IReportFilters;
  view?: {
    type?: "table" | "pivot" | "chart";
    chart?: { type?: "line" | "bar" | "pie"; x?: string; y?: string[] };
    columns?: string[];
    groupBy?: string[];
  };
  exportFormats?: ExportFormat[];
  schedule?: IReportSchedule;
  isActive: boolean;
  tags?: string[];
  createdByRef?: string;
  updatedByRef?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type RunStatus = "queued" | "running" | "success" | "error" | "cancelled";

export interface IReportRun {
  _id?: string;
  tenant: string;
  definitionRef?: string;
  kind: ReportKind;
  code?: string;
  triggeredBy?: "manual" | "schedule" | "api";
  startedAt?: string | Date;
  finishedAt?: string | Date;
  status: RunStatus;
  durationMs?: number;
  filtersUsed?: IReportFilters;
  rowCount?: number;
  bytes?: number;
  files?: IFileAsset[];
  previewSample?: any[];
  error?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* Admin filtreleri */
export interface DefinitionAdminFilters {
  q?: string;
  kind?: ReportKind | "";
  isActive?: boolean;
  tag?: string;
  limit?: number;
}
export interface RunAdminFilters {
  q?: string;
  kind?: ReportKind | "";
  status?: RunStatus | "";
  definitionRef?: string;
  from?: string; // ISO
  to?: string;   // ISO
  limit?: number;
}

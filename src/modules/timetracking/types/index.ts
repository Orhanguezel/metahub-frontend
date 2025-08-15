export type ObjectId = string;

export const toISOIfDate = (v: any) =>
  v instanceof Date ? v.toISOString() : v;


/** GeoJSON Point */
export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface IDeviceInfo {
  kind?: "web" | "mobile" | "kiosk" | "api";
  deviceId?: string;
  platform?: string;
  appVersion?: string;
  userAgent?: string;
}

export interface IBreakEntry {
  start?: string | Date;
  end?: string | Date;
  paid?: boolean;
  reason?: string;
  minutes?: number;
}

export interface IApproval {
  status: "pending" | "approved" | "rejected";
  approverRef?: ObjectId;
  note?: string;
  at?: string | Date;
  stage?: "supervisor" | "payroll" | "custom";
}

export interface IRoundingRule {
  roundToMinutes?: number; // 5, 10, 15...
  strategy?: "nearest" | "up" | "down";
  applyTo?: "total";
}

export interface IPayCode {
  kind: "regular" | "overtime" | "holiday" | "sick" | "vacation" | "other";
  billable?: boolean;
}

export interface ITimeEntry {
  _id: ObjectId;
  tenant: string;
  code?: string;
  employeeRef: ObjectId;
  jobRef?: ObjectId;
  shiftRef?: ObjectId;
  serviceRef?: ObjectId;
  apartmentRef?: ObjectId;

  date: string | Date;
  clockInAt?: string | Date;
  clockOutAt?: string | Date;

  geoIn?: IGeoPoint;
  geoOut?: IGeoPoint;
  deviceIn?: IDeviceInfo;
  deviceOut?: IDeviceInfo;

  breaks?: IBreakEntry[];
  notes?: string;

  payCode?: IPayCode;
  rounding?: IRoundingRule;

  costRateSnapshot?: number;
  billRateSnapshot?: number;

  minutesWorked?: number;
  minutesBreaks?: number;
  minutesPaid?: number;
  overtimeMinutes?: number;

  costAmount?: number;
  billAmount?: number;

  status: "open" | "submitted" | "approved" | "rejected" | "locked" | "exported";
  approvals?: IApproval[];

  exportBatchId?: string;
  source?: "manual" | "mobile" | "kiosk" | "import" | "system";

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* LIST filters + meta */
export interface TimeEntryAdminFilters {
  employeeRef?: ObjectId;
  jobRef?: ObjectId;
  apartmentRef?: ObjectId;
  serviceRef?: ObjectId;
  status?: ITimeEntry["status"];
  dateFrom?: string;
  dateTo?: string;
  exportBatchId?: string;
  page?: number;
  limit?: number;
  sort?: "date" | "createdAt" | "updatedAt" | "clockInAt";
  order?: "asc" | "desc";
}

export interface Paginated<T> {
  items: T[];
  meta?: { page: number; limit: number; total: number };
}

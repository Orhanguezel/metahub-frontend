import type { SupportedLocale } from "@/types/common";

/* -------- i18n -------- */
export type TranslatedLabel = { [K in SupportedLocale]?: string };

/* -------- Sabit listeler (UI'da select için) -------- */
export const EMPLOYEE_STATUS = ["active","inactive","onleave","terminated"] as const;
export type EmployeeStatus = typeof EMPLOYEE_STATUS[number];

export const LANGUAGE_LEVELS = ["basic","conversational","fluent","native"] as const;
export type LanguageLevel = typeof LANGUAGE_LEVELS[number];

export const RATECARD_KINDS = ["standard","overtime","weekend","holiday","service"] as const;
export type RateCardKind = typeof RATECARD_KINDS[number];

export const EMPLOYMENT_TYPES = ["fulltime","parttime","contractor","intern"] as const;
export type EmploymentType = typeof EMPLOYMENT_TYPES[number];

export const WEEKDAYS = [0,1,2,3,4,5,6] as const;

/* -------- Backend’de ObjectId olan alanlar FE’de string -------- */
export interface IGeoPoint { type: "Point"; coordinates: [number, number]; }

export interface IContactInfo {
  phone?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  zip?: string;
  country?: string; // ISO-2
}

export interface IEmergencyContact {
  name: string;
  phone?: string;
  relation?: string;
}

export interface ILanguageSkill {
  code: string;              // "tr","de","en"...
  level: LanguageLevel;
}

export interface ISkill {
  key: string;
  label?: TranslatedLabel;
  level?: 1 | 2 | 3 | 4 | 5;
  serviceRef?: string;
  expiresAt?: string | Date;
  certified?: boolean;
}

export interface ICertification {
  name: string;
  issuer?: string;
  idNumber?: string;
  issuedAt?: string | Date;
  expiresAt?: string | Date;
  attachmentRef?: string;
}

export interface IWeeklyWindow {
  weekday: (typeof WEEKDAYS)[number]; // 0=Sun
  startTime: string;                  // "HH:mm"
  endTime: string;                    // "HH:mm"
}

export interface ISpecialDayWindow {
  date: string | Date;
  windows?: Array<{ startTime: string; endTime: string }>;
  isUnavailable?: boolean;
  reason?: string;
}

export interface ILeaveEntry {
  kind: "vacation" | "sick" | "unpaid" | "other";
  from: string | Date;
  to: string | Date;
  note?: string;
}

export interface ISchedulingConstraints {
  maxDailyMinutes?: number;
  maxWeeklyMinutes?: number;
  maxMonthlyMinutes?: number;
  minRestHoursBetweenShifts?: number;
  maxConsecutiveDays?: number;
  preferredServices?: string[];
  avoidServices?: string[];
}

export interface IRateCard {
  kind: RateCardKind;
  serviceRef?: string;        // kind === "service" ise beklenir
  currency: string;           // "EUR","TRY",...
  payRate?: number;
  billRate?: number;
  validFrom: string | Date;
  validTo?: string | Date;
}

export interface IEmployment {
  type: EmploymentType;
  position?: string;
  startDate: string | Date;
  endDate?: string | Date;
  managerRef?: string;
  teamRefs?: string[];
}

export interface IEmployee {
  _id: string;

  tenant: string;
  code: string;
  userRef: string;

  firstName: string;
  lastName: string;
  fullName?: string;
  displayName?: string;
  photoUrl?: string;

  contact?: IContactInfo;
  emergency?: IEmergencyContact;

  languages?: ILanguageSkill[];
  skills?: ISkill[];
  certifications?: ICertification[];

  employment: IEmployment;

  homeBase?: IGeoPoint;
  timezone?: string; // örn "Europe/Istanbul"

  weeklyAvailability?: IWeeklyWindow[];
  specialDays?: ISpecialDayWindow[];
  leaves?: ILeaveEntry[];
  constraints?: ISchedulingConstraints;

  rateCards?: IRateCard[];
  currentCostPerHour?: number;
  currentBillPerHour?: number;

  status: EmployeeStatus;
  notes?: TranslatedLabel;
  tags?: string[];

  nextAvailableAt?: string | Date;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* -------- Admin liste filtreleri -------- */
export interface EmployeeListFilters {
  q?: string;
  status?: EmployeeStatus;
  language?: string;    // languages.code
  skill?: string;       // skills.key
  serviceRef?: string;  // service ObjectId
  tag?: string;
  limit?: number;
}

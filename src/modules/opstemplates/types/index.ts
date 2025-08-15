// src/modules/operationstemplates/types.ts
import type { SupportedLocale } from "@/types/common";

export type TranslatedLabel = Partial<Record<SupportedLocale, string>>;

export type StepType = "task" | "inspection" | "safety" | "handover";
export type RecurrenceUnit = "day" | "week" | "month";

export interface ICrewRequirement {
  min?: number;
  max?: number;
  recommended?: number;
}

export interface IChecklistItem {
  text: TranslatedLabel;
  required?: boolean;
  photoRequired?: boolean;
  minPhotos?: number;
  geoCheck?: boolean;
}

export interface IQualityCheck {
  key: string;
  label?: TranslatedLabel;
  type?: "boolean" | "number" | "select";
  passIf?: any;
  options?: string[];
  required?: boolean;
}

export interface IMaterialRequirement {
  itemRef?: string; // ObjectId
  sku?: string;
  name?: TranslatedLabel;
  quantity?: number;
  unit?: string;
  chargeTo?: "expense" | "customer" | "internal";
}

export interface IOperationStep {
  code?: string;
  title: TranslatedLabel;
  instruction?: TranslatedLabel;
  type?: StepType;
  estimatedMinutes?: number;
  requiredSkills?: string[];
  requiredEquipment?: string[];
  checklist?: IChecklistItem[];
  quality?: IQualityCheck[];
}

export interface IDeliverableRequirements {
  photos?: { before?: boolean; after?: boolean; minPerStep?: number };
  signatures?: { customer?: boolean; supervisor?: boolean };
  notesRequired?: boolean;
  attachmentsRequired?: boolean;
}

export interface IRecurrenceTemplate {
  enabled?: boolean;
  every?: number;            // >= 1
  unit?: RecurrenceUnit;     // day|week|month
  daysOfWeek?: number[];     // 0..6 (haftalık için)
  dayOfMonth?: number;       // 1..31 (aylık için)
  nthWeekday?: { nth: 1|2|3|4|5; weekday: 0|1|2|3|4|5|6 };
  startDateHint?: string | Date;
}

export interface IApplicability {
  categoryRefs?: string[];   // ObjectId[]
  apartmentRefs?: string[];  // ObjectId[]
  tags?: string[];
}

export interface IOperationTemplate {
  _id: string;
  tenant: string;
  code: string;                         // OPT-YYYY-xxxxxx
  name: TranslatedLabel;
  description?: TranslatedLabel;

  serviceRef?: string;                  // ObjectId (servicecatalog)
  defaultDurationMinutes?: number;
  crew?: ICrewRequirement;

  steps: IOperationStep[];
  materials?: IMaterialRequirement[];
  safetyNotes?: TranslatedLabel[];

  deliverables?: IDeliverableRequirements;

  recurrence?: IRecurrenceTemplate;
  applicability?: IApplicability;

  tags?: string[];
  version?: number;                     // default 1
  isActive: boolean;                    // default true
  deprecatedAt?: string | Date;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TemplatesAdminFilters {
  q?: string;
  isActive?: boolean;    // BE default: true
  serviceRef?: string;
  tag?: string;
  categoryRef?: string;
  apartmentRef?: string;
  version?: number;
  limit?: number;        // default 200 (max 500’e clamp’lanıyor)
}

/** Create/Update DTO’ları (UI rahatlığı için) */
export type CreateOpsTemplateDTO = Omit<
  Partial<IOperationTemplate>,
  "_id" | "tenant" | "createdAt" | "updatedAt"
> & { name: TranslatedLabel; steps?: IOperationStep[] };

export type UpdateOpsTemplateDTO = Partial<Omit<IOperationTemplate, "tenant" | "createdAt" | "updatedAt">>;

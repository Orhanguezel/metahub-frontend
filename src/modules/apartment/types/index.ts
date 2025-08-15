import type { SupportedLocale } from "@/types/common";

/** i18n */
export type TranslatedLabel = { [lang in SupportedLocale]?: string };
export type TranslatedField = TranslatedLabel;

/** Generic ref coming from API (plain id or populated lite object) */
export type Ref<TLite> = string | ({ _id: string } & Partial<TLite>);

/** Lite shapes for populated refs */
export interface INeighborhoodLite { _id: string; name?: TranslatedLabel; slug?: string; }
export interface ICustomerLite { _id: string; companyName: string; contactName: string; email?: string; phone?: string; }
export interface IEmployeeLite { _id: string; fullName?: string; email?: string; phone?: string; role?: string; }
export interface IServiceCatalogLite { _id: string; code?: string; name?: TranslatedLabel; unit?: string; defaultDuration?: number; }
export interface ISchedulePlanLite { _id: string; name?: string; rrule?: string; timezone?: string; }
export interface IOperationTemplateLite { _id: string; name?: string; steps?: any[]; }
export interface IPriceListItemLite { _id: string; name?: string; price?: number; currency?: string; }

/** Images */
export interface IApartmentImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

/** Address & Geo */
export interface IAddress {
  street?: string;
  number?: string;
  district?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;   // ISO-2 (DE/TR/…)
  fullText?: string; // "Hansaring 12, 53111 Bonn, DE"
}

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

/** Place (relations pulled from other modules) */
export interface IPlace {
  neighborhood?: Ref<INeighborhoodLite>;
  cityCode?: string;
  districtCode?: string;
  zip?: string;
}

/** Snapshots (denormalized texts) */
export interface IApartmentSnapshots {
  neighborhoodName?: TranslatedLabel;
  /** yeni (opsiyonel) */
  managerName?: string;
  /** yeni (opsiyonel): hizmet adları */
  serviceNames?: TranslatedLabel[];
  /** yeni (opsiyonel): "€120 / Monthly" vb. */
  lastPriceLabel?: string;
}

/** YÖNETİCİ snapshot’ı (customer’a bağlı) – userRef YOK */
export interface IContactPerson {
  customerRef?: string; // ObjectId as string
  name: string;         // required
  phone?: string;
  email?: string;
  role?: string;
}

/** Ops: binding to services/plans/templates/pricelist */
export interface IServiceBinding {
  service: Ref<IServiceCatalogLite>;
  schedulePlan?: Ref<ISchedulePlanLite>;
  operationTemplate?: Ref<IOperationTemplateLite>;
  priceListItem?: Ref<IPriceListItemLite>;
  isActive?: boolean;
  notes?: string;
}

export interface IApartmentOpsNotifyPrefs {
  managerOnJobCompleted?: boolean;
  managerOnJobAssigned?: boolean;
  employeeOnJobAssigned?: boolean;
}

export interface IApartmentOps {
  employees: Array<Ref<IEmployeeLite>>;
  supervisor?: Ref<IEmployeeLite>;
  services: IServiceBinding[];

  cleaningPlan?: Ref<ISchedulePlanLite>;
  trashPlan?: Ref<ISchedulePlanLite>;

  cashCollectionDay?: number;           // 1..31
  notify?: IApartmentOpsNotifyPrefs;
}

/** Other module links (pure ids, optional) */
export interface IApartmentLinks {
  contracts?: string[];
  billingPlans?: string[];
  invoices?: string[];
  payments?: string[];
  priceLists?: string[];
  operationJobs?: string[];
  operationTemplates?: string[];
  timeEntries?: string[];
  reportDefs?: string[];
  reportRuns?: string[];
  files?: string[];
  contacts?: string[];
}

/** (opsiyonel) finans özeti – admin detayda gelebilir */
export interface IApartmentFinance {
  lastPaymentAt?: string | null;
  nextDueAt?: string | null;
  outstandingAmount?: number | null;
  currency?: string | null;
}

/** Apartment (backend aligned) */
export interface IApartment {
  _id: string;

  // Content
  title?: TranslatedLabel;
  content?: TranslatedLabel;
  images: IApartmentImage[];

  // Multi-tenant & URL
  tenant: string;
  slug: string;

  // Location
  address: IAddress;
  location?: IGeoPoint;

  // Relations & snapshots
  place?: IPlace;
  snapshots?: IApartmentSnapshots;

  // Relations (populated optional)
  customer?: Ref<ICustomerLite>;
  contact: IContactPerson;

  // Ops & Links
  ops?: IApartmentOps;
  links?: IApartmentLinks;

  // (opsiyonel) finans
  finance?: IApartmentFinance;

  // Publish & status
  isPublished: boolean;
  publishedAt?: string; // ISO
  isActive: boolean;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

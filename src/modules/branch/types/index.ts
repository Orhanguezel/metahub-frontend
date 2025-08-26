import type { SupportedLocale } from "@/types/common";

/** i18n */
export type TranslatedLabel = { [key in SupportedLocale]?: string };

export type ServiceType = "delivery" | "pickup" | "dinein";

/** Money */
export interface IMoney {
  amount: number;
  currency: "TRY" | "EUR" | "USD";
}

/** Address & Geo */
export interface IAddress {
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string; // ISO-2 (DE/TR/…)
  fullText?: string;
}

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

/** Opening Hours */
export interface IOpeningHour {
  day: number;   // 0-6 (Sun-Sat)
  open: string;  // "HH:mm"
  close: string; // "HH:mm"
}

/** Delivery Zone */
export interface IDeliveryZone {
  name?: string;
  polygon: {
    type: "Polygon";
    coordinates: number[][][]; // [[[lng,lat], [lng,lat], ...]]
  };
  fee?: IMoney; // default 0 TRY/EUR/USD server side
}

/** Branch (API shape - FE) */
export interface IBranch {
  _id: string;

  tenant: string;
  code: string;
  name: TranslatedLabel;

  address?: IAddress;
  location: IGeoPoint;
  services: ServiceType[];
  openingHours?: IOpeningHour[];
  minPrepMinutes?: number;

  deliveryZones?: IDeliveryZone[];

  isActive: boolean;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** Create/Update payloads (JSON body) */
export type BranchCreatePayload = {
  code: string;
  name: TranslatedLabel;

  address?: IAddress;
  location: IGeoPoint;
  services: ServiceType[];
  openingHours?: IOpeningHour[];
  minPrepMinutes?: number;
  deliveryZones?: IDeliveryZone[];
  isActive?: boolean;
};

export type BranchUpdatePayload = Partial<
  Omit<BranchCreatePayload, "code">
> & {
  code?: string;
  isActive?: boolean;
};

/** Public list query params */
export type BranchPublicListParams = {
  service?: ServiceType;
  nearLng?: number | string;
  nearLat?: number | string;
  nearRadius?: number | string; // meters
  limit?: number | string;
};

/** Admin list query params */
export type BranchAdminListParams = {
  service?: ServiceType;
  isActive?: boolean | string;
  q?: string;
  limit?: number | string;
};

/** Optional: availability response (relaxed typing to be future-proof) */
export interface IBranchAvailability {
  isOpen: boolean;
  now?: string; // ISO
  today?: { open: string; close: string }[];
  nextOpenAt?: string; // ISO
  // server may include more fields; keep index signature flexible
  [k: string]: unknown;
}

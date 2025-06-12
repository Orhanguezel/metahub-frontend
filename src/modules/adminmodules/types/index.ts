// src/modules/adminmodules/types/index.ts

import type { SupportedLocale, TranslatedLabel } from "@/types/common";

export interface RouteMeta {
  method: string;
  path: string;
  auth?: boolean;
  summary?: string;
}

export interface HistoryEntry {
  version: string;
  by: string;
  date: string;
  note: string;
}

export interface UpdatedBy {
  username: string;
  commitHash: string;
}

export interface AdminModule {
  name: string;
  label: TranslatedLabel;
  icon?: string;
  roles: string[];
  enabled: boolean;
  visibleInSidebar?: boolean;
  useAnalytics?: boolean;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  routes?: RouteMeta[];
  history?: HistoryEntry[];
  language?: SupportedLocale;
  order?: number;
  updatedBy?: UpdatedBy;
  statsKey?: string;
  showInDashboard?: boolean;
  stats?: Record<string, { count: number; lastUpdatedAt: string }>;
  [key: string]: any;
}

export interface ModuleAnalyticsItem {
  name: string;
  label: TranslatedLabel;
  icon?: string;
  count: number;
}

export interface EnabledModuleQuery {
  project: string;
}

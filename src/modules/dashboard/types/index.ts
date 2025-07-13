// src/types/analytics.ts

export interface AnalyticsEvent {
  _id?: string;
  userId?: string;
  module: string;
  eventType: string;
  path?: string;
  method?: string;
  ip?: string;
  country?: string;
  city?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  userAgent?: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
  status?: number;
  message?: string;
  meta?: Record<string, any>;
  uploadedFiles?: string[];
  language: string;
  timestamp?: string;
  tenant?: string;
}

export interface AnalyticsState {
  events: AnalyticsEvent[];
  count: number;
  trends: any[];
  loading: boolean;
  error: string | null;
}


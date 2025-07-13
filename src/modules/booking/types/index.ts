// 📌 Booking Status Tipi
// src/modules/booking/types.ts

import type { SupportedLocale } from "@/types/common";

// ✅ Public Booking Form Input
export interface BookingFormInput {
  name: string; // Artık sadece string! (örn: kullanıcının seçili diline göre)
  email: string;
  phone?: string;
  serviceType: string;
  note?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  service: string; // ObjectId (string)
  slotRef?: string;
  durationMinutes?: number;
  language: SupportedLocale;
}


// 📌 Booking (Backend'ten dönen)
export interface Booking {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  name: string; // Sadece string!
  tenant: string;
  email: string;
  phone?: string;
  serviceType: string;
  note?: string;
  date: string;
  time: string;
  service: string | {
    _id: string;
    title: string;
    price?: number;
    duration?: number;
  };
  slotRef?: string;
  durationMinutes: number;
  status: "pending" | "confirmed" | "cancelled";
  language: SupportedLocale;
  confirmedAt?: string;
  confirmedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  isNotified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 📌 Slot Rule (admin weekly ayarları)
export interface IBookingSlotRule {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  breakBetweenAppointments: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appliesToAll?: boolean;
  tenant: string;
}


// 📌 Slot Override (özel gün ayarı)
export interface IBookingSlotOverride {
  _id: string;
  date: string;
  disabledTimes: string[];
  fullDayOff?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";


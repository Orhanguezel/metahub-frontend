// 📌 Booking Status Tipi
export type BookingStatus = "pending" | "confirmed" | "cancelled";

// 📌 Booking Form Input (Kullanıcıdan gelen)
export interface BookingFormInput {
  name: {
    tr: string;
    en: string;
    de: string;
  };
  email: string;
  phone?: string;
  serviceType: string;
  note?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  service: string; // ObjectId
  slotRef?: string;
  durationMinutes?: number;
  language: "tr" | "en" | "de";
}

// 📌 Booking (Backend'ten dönen)
export interface Booking {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  name: {
    tr: string;
    en: string;
    de: string;
  };
  email: string;
  phone?: string;
  serviceType: string;
  note?: string;
  date: string;
  time: string;
  service: {
    _id: string;
    title: string;
    price?: number;
    duration?: number;
  };
  slotRef?: string;
  durationMinutes: number;
  status: BookingStatus;
  language: "tr" | "en" | "de";
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
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "23:00"
  intervalMinutes: number; // örn: 60
  breakBetweenAppointments: number; // örn: 15
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appliesToAll?: boolean;
}

// 📌 Slot Override (özel gün ayarı)
export interface IBookingSlotOverride {
  _id: string;
  date: string; // "2025-06-20"
  disabledTimes: string[]; // örn: ["13:00", "14:00"]
  fullDayOff?: boolean;
  createdAt: string;
  updatedAt: string;
}

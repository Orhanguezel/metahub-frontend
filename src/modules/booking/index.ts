// 📦 Module Index: /src/modules/booking/index.ts

// 🌍 Public Pages
export { default as BookingPublicPage } from "./public/pages/page";

// 🔐 Admin Pages
export { default as AdminBookingPage } from "./admin/pages/page";

// 🔐 Admin Components
export { default as BookingTable } from "./admin/components/BookingTable";
export { default as BookingStatusModal } from "./admin/components/BookingStatusModal";
export { default as SlotManager } from "./admin/components/SlotManager";
export { default as SlotRuleModal } from "./admin/components/SlotRuleModal";

// 🌍 Public Components
export { default as BookingForm } from "./public/components/BookingForm";

// Redux Slice
export { default as bookingReducer } from "./slice/bookingSlice";
export { default as bookingslotReducer } from "./slice/bookingSlotSlice";

// ✅ Types (Artık `@/modules/booking` içinden import edebilirsin)
export * from "./types";

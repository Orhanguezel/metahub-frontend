// 📦 Module Index: /src/modules/dashboard/index.ts

// 🌍 Pages
export { default as AdminDashboardPage } from "./admin/pages/page";

// 🔐 Admin Components
export { default as FeedbacksCard } from "./admin/components/FeedbacksCard";
export { default as RevenueCard } from "./admin/components/RevenueCard";
export { default as StatCard } from "./admin/components/StatCard";
export { default as StatsGrid } from "./admin/components/StatsGrid";
export { default as UsersCard } from "./admin/components/UsersCard";

// 📊 Redux Slices
export { default as dashboardReducer } from "./slice/dashboardSlice";
export { default as reportsReducer } from "./slice/reportsSlice";
export { default as dailyOverviewReducer } from "./slice/dailyOverviewSlice";
export { default as chartDataReducer } from "./slice/chartDataSlice";

// 📝 Types
//export * from "./types";

// 🌐 i18n dosyaları modül içi kullanılır (otomatik yüklenir, elle export gerekmez)

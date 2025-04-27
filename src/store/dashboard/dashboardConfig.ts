// src/store/dashboard/dashboardConfig.ts
import {
  MdPeople,
  MdShoppingBag,
  MdReceipt,
  MdSpa,
  MdEmail,
  MdArticle,
  MdImage,
  MdMarkEmailRead,
  MdFeedback,
  MdNotifications,
  MdSettings,
  MdAttachMoney,
  MdPersonAddAlt,
} from "react-icons/md";

import type { IconType } from "react-icons";
import type { DashboardStats } from "./dashboardSlice";

interface DashboardModule {
  key: string;
  path: string;
  labelKey: string;
  icon: IconType;
  getValue: (stats: DashboardStats | null) => number | string;
  showInSidebar?: boolean; // ← 🔥 burası önemli
}

export const dashboardModules: DashboardModule[] = [
  {
    key: "users",
    path: "/admin/users",
    labelKey: "dashboard.users",
    icon: MdPeople,
    getValue: (stats) => stats?.users ?? "-",
    showInSidebar: true,
  },
  {
    key: "newUsers",
    path: "/admin/users",
    labelKey: "dashboard.newUsers",
    icon: MdPersonAddAlt,
    getValue: (stats) => stats?.dailyOverview?.newUsers ?? "-",
  },
  {
    key: "revenue",
    path: "/admin/orders",
    labelKey: "dashboard.revenue",
    icon: MdAttachMoney,
    getValue: (stats) =>
      stats?.dailyOverview?.revenue != null
        ? `${stats.dailyOverview.revenue.toFixed(2)} €`
        : "-",
  },
  {
    key: "products",
    path: "/admin/products",
    labelKey: "dashboard.products",
    icon: MdShoppingBag,
    getValue: (stats) => stats?.products ?? "-",
    showInSidebar: true,
  },
  {
    key: "orders",
    path: "/admin/orders",
    labelKey: "dashboard.orders",
    icon: MdReceipt,
    getValue: (stats) => stats?.dailyOverview?.orders ?? "-",
    showInSidebar: true,
  },
  {
    key: "services",
    path: "/admin/services",
    labelKey: "dashboard.services",
    icon: MdSpa,
    getValue: (stats) => stats?.services ?? "-",
    showInSidebar: true,
  },
  {
    key: "emails",
    path: "/admin/emails",
    labelKey: "dashboard.emails",
    icon: MdEmail,
    getValue: (stats) => stats?.emails ?? "-",
    showInSidebar: true,
  },
  {
    key: "blogs",
    path: "/admin/blogs",
    labelKey: "dashboard.blogs",
    icon: MdArticle,
    getValue: (stats) => stats?.blogs ?? "-",
    showInSidebar: true,
  },
  {
    key: "gallery",
    path: "/admin/gallery",
    labelKey: "dashboard.gallery",
    icon: MdImage,
    getValue: (stats) => stats?.gallery ?? "-",
    showInSidebar: true,
  },
  {
    key: "contactMessages",
    path: "/admin/messages",
    labelKey: "dashboard.contactMessages",
    icon: MdMarkEmailRead,
    getValue: (stats) => stats?.contactMessages ?? "-",
    showInSidebar: true,
  },
  {
    key: "feedbacks",
    path: "/admin/feedbacks",
    labelKey: "dashboard.feedbacks",
    icon: MdFeedback,
    getValue: (stats) => stats?.dailyOverview?.feedbacks ?? "-",
    showInSidebar: true,
  },
  {
    key: "notifications",
    path: "/admin/notifications",
    labelKey: "dashboard.notifications",
    icon: MdNotifications,
    getValue: (stats) => stats?.notifications ?? "-",
    showInSidebar: true,
  },
  {
    key: "settings",
    path: "/admin/settings",
    labelKey: "dashboard.settings",
    icon: MdSettings,
    getValue: (stats) => stats?.settings ?? "-",
    showInSidebar: true,
  },
];

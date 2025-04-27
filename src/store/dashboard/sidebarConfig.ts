// src/store/dashboard/sidebarModules.ts

import { dashboardModules } from "./dashboardConfig";

export const sidebarModules = dashboardModules.filter((mod) => mod.showInSidebar);

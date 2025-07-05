"use client";
import React from "react";

import { AdminUsersPage } from "@/modules/users";

// /app/admin/users/page.tsx
export interface UserFilterState {
  query: string;
  role: string;
  isActive: string;
}


export default function AdminUserRoutePage() {
  return  <AdminUsersPage />;
}

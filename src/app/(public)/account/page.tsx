// src/app/(public)/account/page.tsx
"use client";
import ProtectedUserPage from "@/shared/ProtectedUserPage";
import { AccountPage } from "@/modules/account";

export default function AccountRoutePage() {
  return (
    <ProtectedUserPage>
      <AccountPage />
    </ProtectedUserPage>
  );
}

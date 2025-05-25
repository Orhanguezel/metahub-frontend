// src/app/(public)/account/page.tsx
"use client";
import {ProtectedUserPage} from "@/shared";
import { AccountPage } from "@/modules/account";

export default function AccountRoutePage() {
  return (
    <ProtectedUserPage>
      <AccountPage />
    </ProtectedUserPage>
  );
}


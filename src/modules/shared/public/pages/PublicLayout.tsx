"use client";

import React from "react";
import { Navbar, FooterSection } from "@/modules/shared";
import { Loading, ErrorMessage } from "@/shared";
import { usePublicLayoutInit } from "@/hooks/usePublicLayoutInit";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settingsLoading, settingsError, companyStatus, companyError } =
    usePublicLayoutInit();

  if (settingsLoading || companyStatus === "loading") {
    return <Loading />;
  }

  if (settingsError || companyError) {
    return (
      <ErrorMessage
        message={settingsError || companyError || "An error occurred."}
      />
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <FooterSection />
    </>
  );
}

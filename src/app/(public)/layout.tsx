// app/(public)/layout.tsx
"use client";

import React, { useEffect } from "react";
import {Navbar,FooterSection} from "@/modules/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSettings } from "@/modules/settings/slice/settingSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";
import {Loading,ErrorMessage} from "@/shared";



export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();


  const {
    loading: settingsLoading,
    error: settingsError,
    fetchedSettings,
  } = useAppSelector((state) => state.setting);

  const {
    company,
    status: companyStatus,
    error: companyError,
  } = useAppSelector((state) => state.company);

  useEffect(() => {
    if (!fetchedSettings) dispatch(fetchSettings());
    if (!company && companyStatus === "idle") dispatch(fetchCompanyInfo());
  }, [dispatch, fetchedSettings, company, companyStatus]);

  if (settingsLoading || companyStatus === "loading") return <Loading />;
  if (settingsError || companyError)
    return <ErrorMessage message={settingsError || companyError || ""} />;



  return (
    <>
      <Navbar />
      <main>{children}</main>
      <FooterSection />
    </>
  );
}


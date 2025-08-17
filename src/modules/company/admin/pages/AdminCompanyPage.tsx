// src/modules/company/pages/AdminCompanyPage.tsx
"use client";

import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createCompanyAdmin, updateCompanyAdmin, clearCompanyMessages } from "@/modules/company/slice/companySlice";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { CompanyForm, CompanyInfoCard } from "@/modules/company";
import type { ICompany, TranslatedLabel } from "@/modules/company/types";
import { SUPPORTED_LOCALES } from "@/types/common";

const fillLabel = (obj: any): TranslatedLabel => {
  const filled: TranslatedLabel = {} as any;
  for (const lng of SUPPORTED_LOCALES) filled[lng] = obj?.[lng] ?? "";
  return filled;
};

export default function AdminCompanyPage() {
  const { t } = useI18nNamespace("company", translations);
  const dispatch = useAppDispatch();

  const company = useAppSelector((s) => s.company.companyAdmin);
  const loading = useAppSelector((s) => s.company.loading);
  const successMessage = useAppSelector((s) => s.company.successMessage);
  const error = useAppSelector((s) => s.company.error);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearCompanyMessages());
  }, [successMessage, error, dispatch]);

  const initialValues: ICompany = useMemo(() => ({
    companyName: fillLabel(company?.companyName),
    companyDesc: fillLabel(company?.companyDesc),
    email: company?.email ?? "",
    phone: company?.phone ?? "",
    taxNumber: company?.taxNumber ?? "",
    handelsregisterNumber: company?.handelsregisterNumber ?? "",
    registerCourt: company?.registerCourt ?? "",
    website: company?.website ?? "",
    tenant: company?.tenant ?? "",
    language: company?.language ?? "en",
    bankDetails: {
      bankName: company?.bankDetails?.bankName ?? "",
      iban: company?.bankDetails?.iban ?? "",
      swiftCode: company?.bankDetails?.swiftCode ?? "",
    },
    managers: company?.managers ?? [],
    socialLinks: {
      facebook: company?.socialLinks?.facebook ?? "",
      instagram: company?.socialLinks?.instagram ?? "",
      twitter: company?.socialLinks?.twitter ?? "",
      linkedin: company?.socialLinks?.linkedin ?? "",
      youtube: company?.socialLinks?.youtube ?? "",
    },
    images: company?.images ?? [],
    addresses: company?.addresses ?? [],
    createdAt: (company?.createdAt as any) ?? new Date().toISOString(),
    updatedAt: (company?.updatedAt as any) ?? new Date().toISOString(),
  }), [company]);

  const handleSubmit = (values: ICompany, newImages: File[], removedImages?: string[]) => {
    const payload: any = { ...values, images: newImages, removedImages: removedImages ?? [] };
    if (company && company._id) dispatch(updateCompanyAdmin({ ...payload, _id: company._id }));
    else dispatch(createCompanyAdmin(payload));
  };

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("title", "Company Information")}</h1>
          <Subtitle>{t("subtitle", "Manage and update your company details")}</Subtitle>
        </TitleBlock>
      </Header>

      <Grid>
        <Card><CompanyInfoCard company={company} /></Card>
        <Card>
          <CompanyForm initialValues={initialValues} onSubmit={handleSubmit} loading={loading} />
        </Card>
      </Grid>
    </PageWrap>
  );
}

/* styled to match activity/portfolio pattern */
const PageWrap = styled.div`
  max-width:${({theme})=>theme.layout.containerWidth};
  margin:0 auto;
  padding:${({theme})=>theme.spacings.xl};
`;
const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.lg};
`;
const TitleBlock = styled.div`display:flex; flex-direction:column; gap:4px; h1{margin:0;}`;
const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Grid = styled.div`
  display:grid; grid-template-columns:1fr 1fr; gap:${({theme})=>theme.spacings.xl};
  ${({theme})=>theme.media.small}{ grid-template-columns:1fr; gap:${({theme})=>theme.spacings.md}; }
`;
const Card = styled.section`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;

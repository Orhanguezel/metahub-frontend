"use client";

import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createCompanyAdmin,
  updateCompanyAdmin,
  clearCompanyMessages,
} from "@/modules/company/slice/companySlice";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { CompanyForm, CompanyInfoCard } from "@/modules/company";
import styled from "styled-components";
import type { ICompany } from "@/modules/company/types";

export default function AdminCompanyPage() {
  const { t } = useI18nNamespace("company", translations);
  const dispatch = useAppDispatch();

  // --- Merkezi company admin slice ---
  const company = useAppSelector((state) => state.company.companyAdmin);
const loading = useAppSelector((state) => state.company.loading);
  const successMessage = useAppSelector((state) => state.company.successMessage);
  const error = useAppSelector((state) => state.company.error);



  // --- Toast feedback ---
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearCompanyMessages());
  }, [successMessage, error, dispatch]);

  // --- Form başlangıç değerleri (memoized) ---
  const initialValues: ICompany = useMemo(() => ({
    companyName: company?.companyName ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
    taxNumber: company?.taxNumber ?? "",
    handelsregisterNumber: company?.handelsregisterNumber ?? "",
    address: {
      street: company?.address?.street ?? "",
      city: company?.address?.city ?? "",
      postalCode: company?.address?.postalCode ?? "",
      country: company?.address?.country ?? "",
    },
    bankDetails: {
      bankName: company?.bankDetails?.bankName ?? "",
      iban: company?.bankDetails?.iban ?? "",
      swiftCode: company?.bankDetails?.swiftCode ?? "",
    },
    socialLinks: {
      facebook: company?.socialLinks?.facebook ?? "",
      instagram: company?.socialLinks?.instagram ?? "",
      twitter: company?.socialLinks?.twitter ?? "",
      linkedin: company?.socialLinks?.linkedin ?? "",
      youtube: company?.socialLinks?.youtube ?? "",
    },
    images: company?.images ?? [],
    tenant: company?.tenant ?? "",
    createdAt: company?.createdAt ?? new Date(),
    updatedAt: company?.updatedAt ?? new Date(),
  }), [company]);

  // --- Form submit handler ---
  const handleSubmit = (
  values: ICompany,
  newImages: File[],
  removedImages?: string[]
) => {
  const payload: any = {
    ...values,
    images: newImages,                 // <-- Sadece images
    removedImages: removedImages ?? [],// <-- Sadece removedImages
  };
  if (company && company._id) {
    dispatch(updateCompanyAdmin({ ...payload, _id: company._id }));
  } else {
    dispatch(createCompanyAdmin(payload));
  }
};

  // --- Render ---
  return (
    <Container>
      <Title>{t("title", "Company Information")}</Title>
      <CompanyInfoCard company={company} />
      <CompanyForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 100vh;
`;

const Title = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
`;

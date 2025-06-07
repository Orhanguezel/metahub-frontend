"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompanyInfo,
  createCompany,
  updateCompanyInfo,
  resetMessages,
} from "@/modules/company/slice/companySlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { CompanyForm, CompanyInfoCard } from "@/modules/company";
import styled from "styled-components";

export default function AdminCompanyPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("company");

  const { company, error, successMessage } = useAppSelector(
    (state) => state.company
  );

  // İlk yüklemede çek
  useEffect(() => {
    if (!company) {
      dispatch(fetchCompanyInfo());
    }
  }, [dispatch, company]);

  // Toast feedback
  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "An error occurred.");
      dispatch(resetMessages());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(resetMessages());
    }
  }, [error, successMessage, dispatch]);

  // Multi-logo uyumlu submit
  const handleSubmit = (
    values: any,
    logos: File[], // birden fazla yeni logo dosyası
    removedLogos?: string[] // silinecek eski url’ler
  ) => {
    // Çoklu logo dosyaları ve silinenler payload’a ekleniyor
    const payload: any = {
      ...values,
      logos,
      removedLogos: removedLogos ?? [],
    };
    if (company && company._id) {
      dispatch(updateCompanyInfo({ ...company, ...payload }));
    } else {
      dispatch(createCompany(payload));
    }
  };

  return (
    <Container>
      <Title>{t("title", "Company Information")}</Title>
      <CompanyInfoCard company={company} />
      <CompanyForm
        initialValues={{
          companyName: company?.companyName || "",
          email: company?.email || "",
          phone: company?.phone || "",
          taxNumber: company?.taxNumber || "",
          handelsregisterNumber: company?.handelsregisterNumber || "",
          address: {
            street: company?.address?.street || "",
            city: company?.address?.city || "",
            postalCode: company?.address?.postalCode || "",
            country: company?.address?.country || "",
          },
          bankDetails: {
            bankName: company?.bankDetails?.bankName || "",
            iban: company?.bankDetails?.iban || "",
            swiftCode: company?.bankDetails?.swiftCode || "",
          },
          socialLinks: {
            facebook: company?.socialLinks?.facebook || "",
            instagram: company?.socialLinks?.instagram || "",
            twitter: company?.socialLinks?.twitter || "",
            linkedin: company?.socialLinks?.linkedin || "",
            youtube: company?.socialLinks?.youtube || "",
          },
          logos: company?.logos || [], // çoklu logo burada!
        }}
        onSubmit={handleSubmit}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 100vh;
`;

const Title = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
`;

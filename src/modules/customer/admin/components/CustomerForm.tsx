"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import type { ICustomer } from "@/modules/customer/types";

interface Props {
  initialValues: ICustomer;
  onSubmit: (values: ICustomer) => void;
  loading?: boolean;
}

export default function CustomerForm({
  initialValues,
  onSubmit,
  loading,
}: Props) {
  const { t } = useI18nNamespace("customer", translations);

  const [companyName, setCompanyName] = useState(initialValues.companyName || "");
  const [contactName, setContactName] = useState(initialValues.contactName || "");
  const [email, setEmail] = useState(initialValues.email || "");
  const [phone, setPhone] = useState(initialValues.phone || "");
  const [isActive, setIsActive] = useState(
    typeof initialValues.isActive === "boolean" ? initialValues.isActive : true
  );
  const [notes, setNotes] = useState(initialValues.notes || "");

  useEffect(() => {
    setCompanyName(initialValues.companyName || "");
    setContactName(initialValues.contactName || "");
    setEmail(initialValues.email || "");
    setPhone(initialValues.phone || "");
    setIsActive(typeof initialValues.isActive === "boolean" ? initialValues.isActive : true);
    setNotes(initialValues.notes || "");
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!companyName || !contactName || !email || !phone) {
    alert(t("customer.validation.requiredFields", "Lütfen tüm zorunlu alanları doldurun."));
    return;
  }
  // companyName fallback:
  onSubmit({
    ...initialValues,
    companyName: companyName || "-",
    contactName,
    email,
    phone,
    isActive,
    notes,
  });
};


  return (
    <FormStyled onSubmit={handleSubmit} autoComplete="off" noValidate>
      <SectionTitle>{t("customerInfo", "Customer Info")}</SectionTitle>
      <Label htmlFor="companyName">{t("companyName", "Company Name")}</Label>
      <Input
        id="companyName"
        value={companyName}
        onChange={e => setCompanyName(e.target.value)}
        disabled={loading}
        required
      />
      <Label htmlFor="contactName">{t("contactName", "Contact Name")}</Label>
      <Input
        id="contactName"
        value={contactName}
        onChange={e => setContactName(e.target.value)}
        disabled={loading}
        required
      />
      <Label htmlFor="email">{t("email", "E-Mail")}</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <Label htmlFor="phone">{t("phone", "Phone")}</Label>
      <Input
        id="phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={loading}
        required
      />
      <Label htmlFor="isActive">{t("isActive", "Active")}</Label>
      <input
        id="isActive"
        type="checkbox"
        checked={isActive}
        onChange={e => setIsActive(e.target.checked)}
        disabled={loading}
        style={{ marginBottom: 8 }}
      />
      <Label htmlFor="notes">{t("notes", "Notes")}</Label>
      <TextArea
        id="notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        disabled={loading}
        rows={2}
      />
      <Button type="submit" aria-label={t("save", "Save Customer")} disabled={loading}>
        {t("save", "Save Customer")}
      </Button>
    </FormStyled>
  );
}

// --- Styled Components ---
const FormStyled = styled.form`
  max-width: 800px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const SectionTitle = styled.h4`
  margin-top: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;
const Button = styled.button.attrs({ type: "submit" })`
  margin-top: ${({ theme }) => theme.spacings.lg};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;
const Input = styled.input`
  padding: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: border ${({ theme }) => theme.transition.fast};
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;
const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: border ${({ theme }) => theme.transition.fast};
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;
const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

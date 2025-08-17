// src/modules/company/components/CompanyForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";
import type { ICompany, ICompanyImage, TranslatedLabel } from "@/modules/company/types";
import { SUPPORTED_LOCALES, LANG_LABELS } from "@/types/common";
import { AddressForm } from "@/modules/users";
import { SocialLinksForm } from "@/modules/company";
import { useAppSelector } from "@/store/hooks";
import type { Address } from "@/modules/users/types/address";

const getUrlArray = (images?: ICompanyImage[]): string[] =>
  Array.isArray(images) ? images.map((img) => img.url) : [];

const fillLabel = (obj?: TranslatedLabel) => {
  const res: TranslatedLabel = {} as any;
  for (const lng of SUPPORTED_LOCALES) res[lng] = obj?.[lng] || "";
  return res;
};

interface Props {
  initialValues: ICompany;
  onSubmit: (values: ICompany, newLogos: File[], removedLogos?: string[]) => void;
  loading?: boolean;
}

export default function CompanyForm({ initialValues, onSubmit, loading }: Props) {
  const { t } = useI18nNamespace("company", translations);
  const company = useAppSelector((s) => s.company.companyAdmin);

  const [companyName, setCompanyName] = useState(fillLabel(initialValues.companyName));
  const [companyDesc, setCompanyDesc] = useState(fillLabel(initialValues.companyDesc));
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);
  const [taxNumber, setTaxNumber] = useState(initialValues.taxNumber);
  const [handelsregisterNumber, setHandelsregisterNumber] = useState(initialValues.handelsregisterNumber || "");
  const [registerCourt, setRegisterCourt] = useState(initialValues.registerCourt || "");
  const [website, setWebsite] = useState(initialValues.website || "");
  const [bankDetails, setBankDetails] = useState(initialValues.bankDetails);
  const [socialLinks, setSocialLinks] = useState(initialValues.socialLinks ?? {});
  const [managers, setManagers] = useState<string[]>(
    Array.isArray(initialValues.managers) && initialValues.managers.length > 0 ? initialValues.managers : [""]
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(getUrlArray(initialValues.images));

  const [addresses, setAddresses] = useState<Address[]>(
    (initialValues.addresses ?? []).filter((a): a is Address => typeof a === "object" && a !== null)
  );

  useEffect(() => {
    setCompanyName(fillLabel(initialValues.companyName));
    setCompanyDesc(fillLabel(initialValues.companyDesc));
    setEmail(initialValues.email);
    setPhone(initialValues.phone);
    setTaxNumber(initialValues.taxNumber);
    setHandelsregisterNumber(initialValues.handelsregisterNumber || "");
    setRegisterCourt(initialValues.registerCourt || "");
    setWebsite(initialValues.website || "");
    setBankDetails(initialValues.bankDetails);
    setSocialLinks(initialValues.socialLinks ?? {});
    setManagers(Array.isArray(initialValues.managers) && initialValues.managers.length > 0 ? initialValues.managers : [""]);
    setExistingImages(getUrlArray(initialValues.images));
    setSelectedFiles([]);
    setRemovedImages([]);
    setAddresses(
      Array.isArray(initialValues.addresses)
        ? initialValues.addresses.filter((a): a is Address => typeof a === "object" && a !== null)
        : []
    );
  }, [
    initialValues.companyName,
    initialValues.companyDesc,
    initialValues.email,
    initialValues.phone,
    initialValues.taxNumber,
    initialValues.handelsregisterNumber,
    initialValues.registerCourt,
    initialValues.website,
    initialValues.bankDetails,
    initialValues.socialLinks,
    initialValues.managers,
    initialValues.images,
    initialValues.addresses,
  ]);

  const handleBankChange = (field: keyof typeof bankDetails, value: string) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value });
  };

  const handleManagerChange = (idx: number, value: string) => {
    setManagers(managers.map((m, i) => (i === idx ? value : m)));
  };
  const addManager = () => setManagers([...managers, ""]);
  const removeManager = (idx: number) =>
    setManagers(managers.length === 1 ? [""] : managers.filter((_, i) => i !== idx));

  const handleLogoChange = useCallback((files: File[], removed: string[], current: string[]) => {
    setSelectedFiles(files);
    setRemovedImages(removed);
    setExistingImages(current);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName["tr"] || !email || !phone || !taxNumber || !bankDetails.bankName || !bankDetails.iban || !bankDetails.swiftCode) {
      alert(t("required", "Please fill all required fields!"));
      return;
    }
    onSubmit(
      {
        ...initialValues,
        companyName,
        companyDesc,
        email,
        phone,
        taxNumber,
        handelsregisterNumber,
        registerCourt,
        website,
        bankDetails,
        managers,
        socialLinks,
        // yalnızca object olan adreslerin _id'leri gönderilir
        addresses: addresses.map((a) => a._id!).filter(Boolean),
      },
      selectedFiles,
      removedImages
    );
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off" noValidate>
      <BlockTitle>{t("companyInfo", "Company Info")}</BlockTitle>

      {SUPPORTED_LOCALES.map((lng) => (
        <div key={"companyName_" + lng}>
          <Label htmlFor={`companyName.${lng}`}>
            {t("companyName", "Company Name")} ({LANG_LABELS[lng]})
          </Label>
          <Input
            id={`companyName.${lng}`}
            value={companyName[lng] || ""}
            onChange={(e) => setCompanyName({ ...companyName, [lng]: e.target.value })}
            $hasError={!companyName[lng]}
            disabled={loading}
          />
        </div>
      ))}

      {SUPPORTED_LOCALES.map((lng) => (
        <div key={"companyDesc_" + lng}>
          <Label htmlFor={`companyDesc.${lng}`}>
            {t("companyDesc", "Short Description")} ({LANG_LABELS[lng]})
          </Label>
          <Input
            id={`companyDesc.${lng}`}
            value={companyDesc[lng] || ""}
            onChange={(e) => setCompanyDesc({ ...companyDesc, [lng]: e.target.value })}
            disabled={loading}
          />
        </div>
      ))}

      <Label htmlFor="email">{t("email", "E-Mail")}</Label>
      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />

      <Label htmlFor="phone">{t("phone", "Phone")}</Label>
      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />

      <Label htmlFor="taxNumber">{t("taxNumber", "Tax Number")}</Label>
      <Input id="taxNumber" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} disabled={loading} />

      <Label htmlFor="handelsregisterNumber">{t("handelsregisterNumber", "Handelsregister Number")}</Label>
      <Input id="handelsregisterNumber" value={handelsregisterNumber} onChange={(e) => setHandelsregisterNumber(e.target.value)} disabled={loading} />

      <Label htmlFor="registerCourt">{t("registerCourt", "Register Court")}</Label>
      <Input id="registerCourt" value={registerCourt} onChange={(e) => setRegisterCourt(e.target.value)} disabled={loading} />

      <Label htmlFor="website">{t("website", "Website")}</Label>
      <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={loading} />

      <BlockTitle>{t("addresses", "Addresses")}</BlockTitle>
      <AddressForm parentType="company" parentId={company?._id} addresses={addresses} setAddresses={setAddresses} renderAsForm={false} />

      <BlockTitle>{t("bankDetails", "Bank Details")}</BlockTitle>
      <Label htmlFor="bankDetails.bankName">{t("bankName", "Bank Name")}</Label>
      <Input id="bankDetails.bankName" value={bankDetails.bankName} onChange={(e) => handleBankChange("bankName", e.target.value)} disabled={loading} />
      <Label htmlFor="bankDetails.iban">{t("iban", "IBAN")}</Label>
      <Input id="bankDetails.iban" value={bankDetails.iban} onChange={(e) => handleBankChange("iban", e.target.value)} disabled={loading} />
      <Label htmlFor="bankDetails.swiftCode">{t("swiftCode", "SWIFT Code")}</Label>
      <Input id="bankDetails.swiftCode" value={bankDetails.swiftCode} onChange={(e) => handleBankChange("swiftCode", e.target.value)} disabled={loading} />

      <BlockTitle>{t("managers", "Managers")}</BlockTitle>
      <FieldArray>
        {managers.map((m, idx) => (
          <Row key={idx}>
            <Input value={m} onChange={(e) => handleManagerChange(idx, e.target.value)} disabled={loading} placeholder={t("manager", "Manager")} />
            <SmallBtn type="button" onClick={() => removeManager(idx)} disabled={managers.length === 1}>
              {t("remove", "Remove")}
            </SmallBtn>
          </Row>
        ))}
        <SmallBtn type="button" onClick={addManager}>+ {t("addManager", "Add Manager")}</SmallBtn>
      </FieldArray>

      <BlockTitle>{t("socialMedia", "Social Media")}</BlockTitle>
      <SocialLinksForm values={socialLinks as any} onChange={handleSocialLinksChange} loading={loading} renderAsForm={false} />

      <BlockTitle>{t("logoUpload", "Upload Logo(s)")}</BlockTitle>
      <ImageUploadWithPreview max={5} defaultImages={existingImages} onChange={handleLogoChange} folder="company" />

      <Actions>
        <Primary type="submit" aria-label={t("save", "Save Company")} disabled={loading}>
          {t("save", "Save Company")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* styled (pattern) */
const Form = styled.form`
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.sm};
`;
const BlockTitle = styled.h4`
  margin:${({theme})=>theme.spacings.md} 0 ${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.primary};
  font-weight:${({theme})=>theme.fontWeights.bold};
  font-size:${({theme})=>theme.fontSizes.md};
`;
const Label = styled.label`
  display:block; margin-top:${({theme})=>theme.spacings.sm};
  margin-bottom:${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.textSecondary};
  font-weight:${({theme})=>theme.fontWeights.medium};
`;
const Input = styled.input<{ $hasError?: boolean }>`
  padding:10px 12px; width:100%;
  border:${({theme})=>theme.borders.thin} ${({theme,$hasError})=>$hasError? theme.colors.danger : theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
  font-size:${({theme})=>theme.fontSizes.sm};
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;
const FieldArray = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs};`;
const Row = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center;`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;
const Actions = styled.div`display:flex; justify-content:flex-end; margin-top:${({theme})=>theme.spacings.md};`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;

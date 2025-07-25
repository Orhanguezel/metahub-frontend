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
import type { Address } from "@/modules/users/types/address";

// Helpers
const getUrlArray = (images?: ICompanyImage[]): string[] =>
  Array.isArray(images) ? images.map((img) => img.url) : [];

const fillLabel = (obj?: TranslatedLabel) => {
  const res: TranslatedLabel = {} as any;
  for (const lng of SUPPORTED_LOCALES) res[lng] = obj?.[lng] || "";
  return res;
};

function getInitialAddresses(arr: any): Address[] {
  if (!arr) return [];
  if (typeof arr[0] === "object") return arr as Address[];
  return [];
}

function extractAddressIds(addresses: Address[]): string[] {
  return addresses.map(addr => (typeof addr._id === "string" ? addr._id : "")).filter(Boolean);
}

interface Props {
  initialValues: ICompany;
  onSubmit: (
    values: ICompany,
    newLogos: File[],
    removedLogos?: string[]
  ) => void;
  loading?: boolean;
}

export default function CompanyForm({ initialValues, onSubmit, loading }: Props) {
  const { t } = useI18nNamespace("company", translations);

  // --- STATES ---
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
    Array.isArray(initialValues.managers) && initialValues.managers.length > 0
      ? initialValues.managers
      : [""]
  );
  const [addresses, setAddresses] = useState<Address[]>(getInitialAddresses(initialValues.addresses));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(getUrlArray(initialValues.images));

  // Images reset logic
  useEffect(() => {
    setExistingImages(getUrlArray(initialValues.images));
    setSelectedFiles([]);
    setRemovedImages([]);
  }, [JSON.stringify(initialValues.images)]);

  // --- MANAGERS LOGIC ---
  const handleManagerChange = (idx: number, value: string) => {
    setManagers(managers.map((m, i) => (i === idx ? value : m)));
  };
  const addManager = () => setManagers([...managers, ""]);
  const removeManager = (idx: number) => setManagers(managers.length === 1 ? [""] : managers.filter((_, i) => i !== idx));

  // --- BANK DETAILS LOGIC ---
  const handleBankChange = (field: keyof typeof bankDetails, value: string) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  // --- SOCIAL LINKS LOGIC ---
  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value });
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basit zorunlu alan kontrolü (isteğe bağlı: burada daha detaylı validation ekleyebilirsin)
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
        addresses: extractAddressIds(addresses),
      },
      selectedFiles,
      removedImages
    );
  };

  // --- LOGO UPLOAD HANDLER ---
  const handleLogoChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  return (
    <FormStyled onSubmit={handleSubmit} autoComplete="off" noValidate>
      <SectionTitle>{t("companyInfo", "Company Info")}</SectionTitle>

      {/* Çoklu dil: Şirket adı */}
      {SUPPORTED_LOCALES.map((lng) => (
        <div key={"companyName_" + lng}>
          <Label htmlFor={`companyName.${lng}`}>
            {t("companyName", "Company Name")} ({LANG_LABELS[lng]})
          </Label>
          <Input
            id={`companyName.${lng}`}
            name={`companyName.${lng}`}
            value={companyName[lng] || ""}
            onChange={e => setCompanyName({ ...companyName, [lng]: e.target.value })}
            $hasError={!companyName[lng]}
            disabled={loading}
          />
        </div>
      ))}

      {/* Çoklu dil: Kısa açıklama (opsiyonel) */}
      {SUPPORTED_LOCALES.map((lng) => (
        <div key={"companyDesc_" + lng}>
          <Label htmlFor={`companyDesc.${lng}`}>
            {t("companyDesc", "Short Description")} ({LANG_LABELS[lng]})
          </Label>
          <Input
            id={`companyDesc.${lng}`}
            name={`companyDesc.${lng}`}
            value={companyDesc[lng] || ""}
            onChange={e => setCompanyDesc({ ...companyDesc, [lng]: e.target.value })}
            $hasError={false}
            disabled={loading}
          />
        </div>
      ))}

      <Label htmlFor="email">{t("email", "E-Mail")}</Label>
      <Input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />

      <Label htmlFor="phone">{t("phone", "Phone")}</Label>
      <Input id="phone" name="phone" value={phone} onChange={e => setPhone(e.target.value)} disabled={loading} />

      <Label htmlFor="taxNumber">{t("taxNumber", "Tax Number")}</Label>
      <Input id="taxNumber" name="taxNumber" value={taxNumber} onChange={e => setTaxNumber(e.target.value)} disabled={loading} />

      <Label htmlFor="handelsregisterNumber">{t("handelsregisterNumber", "Handelsregister Number")}</Label>
      <Input id="handelsregisterNumber" name="handelsregisterNumber" value={handelsregisterNumber} onChange={e => setHandelsregisterNumber(e.target.value)} disabled={loading} />

      <Label htmlFor="registerCourt">{t("registerCourt", "Register Court")}</Label>
      <Input id="registerCourt" name="registerCourt" value={registerCourt} onChange={e => setRegisterCourt(e.target.value)} disabled={loading} />

      <Label htmlFor="website">{t("website", "Website")}</Label>
      <Input id="website" name="website" value={website} onChange={e => setWebsite(e.target.value)} disabled={loading} />

      {/* --- Çoklu Adres Alanı --- */}
      <SectionTitle>{t("addresses", "Addresses")}</SectionTitle>
      <AddressForm
        parentType="company"
        parentId={initialValues._id}
        addresses={addresses}
        setAddresses={setAddresses}
        loading={loading}
      />

      <SectionTitle>{t("bankDetails", "Bank Details")}</SectionTitle>
      <Label htmlFor="bankDetails.bankName">{t("bankName", "Bank Name")}</Label>
      <Input id="bankDetails.bankName" name="bankDetails.bankName" value={bankDetails.bankName} onChange={e => handleBankChange("bankName", e.target.value)} disabled={loading} />
      <Label htmlFor="bankDetails.iban">{t("iban", "IBAN")}</Label>
      <Input id="bankDetails.iban" name="bankDetails.iban" value={bankDetails.iban} onChange={e => handleBankChange("iban", e.target.value)} disabled={loading} />
      <Label htmlFor="bankDetails.swiftCode">{t("swiftCode", "SWIFT Code")}</Label>
      <Input id="bankDetails.swiftCode" name="bankDetails.swiftCode" value={bankDetails.swiftCode} onChange={e => handleBankChange("swiftCode", e.target.value)} disabled={loading} />

      {/* --- Yöneticiler (opsiyonel) --- */}
      <SectionTitle>{t("managers", "Managers")}</SectionTitle>
      <FieldArrayContainer>
        {managers.map((manager, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input
              value={manager}
              onChange={e => handleManagerChange(idx, e.target.value)}
              disabled={loading}
              placeholder={t("manager", "Manager")}
            />
            <Button type="button" onClick={() => removeManager(idx)} disabled={managers.length === 1}>
              {t("remove", "Remove")}
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addManager}>
          + {t("addManager", "Add Manager")}
        </Button>
      </FieldArrayContainer>

      {/* --- Sosyal Medya (Ayrı bileşen) --- */}
      <SocialLinksForm
        values={socialLinks}
        onChange={handleSocialLinksChange}
        loading={loading}
        renderAsForm={false}
      />

      <SectionTitle>{t("logoUpload", "Upload Logo(s)")}</SectionTitle>
      <ImageUploadWithPreview
        max={5}
        defaultImages={existingImages}
        onChange={handleLogoChange}
        folder="company"
      />

      <Button type="submit" aria-label={t("save", "Save Company")} disabled={loading}>
        {t("save", "Save Company")}
      </Button>
    </FormStyled>
  );
}

// --- Styled Components (AYNEN BIRAK, DEĞİŞİKLİK YOK) ---
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

const Input = styled.input<{ $hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: border ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const FieldError = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  min-height: 18px;
`;

const FieldArrayContainer = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;



const Label = styled.label`
  display: block;
  margin-top: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

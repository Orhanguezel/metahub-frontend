"use client";
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useFormik } from "formik";
import * as yup from "yup";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";
import type { ICompany, ICompanyImage } from "@/modules/company/types";

interface Props {
  initialValues: ICompany;
  onSubmit: (
    values: ICompany,
    newLogos: File[],
    removedLogos?: string[]
  ) => void;
  loading?: boolean;
}

const getUrlArray = (images?: ICompanyImage[]): string[] =>
  Array.isArray(images) ? images.map((img) => img.url) : [];

export default function CompanyForm({ initialValues, onSubmit, loading }: Props) {
  const { t } = useI18nNamespace("company", translations);

  // Logo state'leri initialValues değiştikçe resetlenir!
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(getUrlArray(initialValues.images));

  useEffect(() => {
    setExistingImages(getUrlArray(initialValues.images));
    setSelectedFiles([]);
    setRemovedImages([]);
  }, [JSON.stringify(initialValues.images)]);

  // Formik validasyon şeması
  const schema = yup.object().shape({
    companyName: yup.string().required(t("required", "Required")),
    email: yup.string().email(t("invalidEmail", "Invalid email")).required(t("required", "Required")),
    phone: yup.string().required(t("required", "Required")),
    taxNumber: yup.string().required(t("required", "Required")),
    handelsregisterNumber: yup.string(),
    address: yup.object().shape({
      street: yup.string().required(t("required", "Required")),
      city: yup.string().required(t("required", "Required")),
      postalCode: yup.string().required(t("required", "Required")),
      country: yup.string().required(t("required", "Required")),
    }),
    bankDetails: yup.object().shape({
      bankName: yup.string().required(t("required", "Required")),
      iban: yup.string().required(t("required", "Required")),
      swiftCode: yup.string().required(t("required", "Required")),
    }),
    socialLinks: yup.object().shape({
      facebook: yup.string().url(t("invalidUrl", "Invalid URL")).nullable(),
      instagram: yup.string().url(t("invalidUrl", "Invalid URL")).nullable(),
      twitter: yup.string().url(t("invalidUrl", "Invalid URL")).nullable(),
      linkedin: yup.string().url(t("invalidUrl", "Invalid URL")).nullable(),
      youtube: yup.string().url(t("invalidUrl", "Invalid URL")).nullable(),
    }),
  });

  // Formik config
  const formik = useFormik<ICompany>({
    initialValues: {
      ...initialValues,
      socialLinks: {
        facebook: initialValues.socialLinks?.facebook || "",
        instagram: initialValues.socialLinks?.instagram || "",
        twitter: initialValues.socialLinks?.twitter || "",
        linkedin: initialValues.socialLinks?.linkedin || "",
        youtube: initialValues.socialLinks?.youtube || "",
      },
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: (values: ICompany) => {
      onSubmit(values, selectedFiles, removedImages);
    },
  });

  // Resim değişimini formik state dışı yönet
  const handleLogoChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  return (
    <FormStyled onSubmit={formik.handleSubmit} autoComplete="off" noValidate>
      <SectionTitle>{t("companyInfo", "Company Info")}</SectionTitle>

      <Label htmlFor="companyName">{t("companyName", "Company Name")}</Label>
      <Input
        id="companyName"
        name="companyName"
        value={formik.values.companyName}
        onChange={formik.handleChange}
        autoComplete="organization"
        $hasError={!!formik.errors.companyName && !!formik.touched.companyName}
        disabled={loading}
      />
      <FieldError>
        {formik.touched.companyName && formik.errors.companyName}
      </FieldError>

      <Label htmlFor="email">{t("email", "E-Mail")}</Label>
      <Input
        id="email"
        name="email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        autoComplete="email"
        $hasError={!!formik.errors.email && !!formik.touched.email}
        disabled={loading}
      />
      <FieldError>{formik.touched.email && formik.errors.email}</FieldError>

      <Label htmlFor="phone">{t("phone", "Phone")}</Label>
      <Input
        id="phone"
        name="phone"
        value={formik.values.phone}
        onChange={formik.handleChange}
        autoComplete="tel"
        $hasError={!!formik.errors.phone && !!formik.touched.phone}
        disabled={loading}
      />
      <FieldError>{formik.touched.phone && formik.errors.phone}</FieldError>

      <Label htmlFor="taxNumber">{t("taxNumber", "Tax Number")}</Label>
      <Input
        id="taxNumber"
        name="taxNumber"
        value={formik.values.taxNumber}
        onChange={formik.handleChange}
        $hasError={!!formik.errors.taxNumber && !!formik.touched.taxNumber}
        disabled={loading}
      />
      <FieldError>
        {formik.touched.taxNumber && formik.errors.taxNumber}
      </FieldError>

      <Label htmlFor="handelsregisterNumber">
        {t("handelsregisterNumber", "Handelsregister Number")}
      </Label>
      <Input
        id="handelsregisterNumber"
        name="handelsregisterNumber"
        value={formik.values.handelsregisterNumber || ""}
        onChange={formik.handleChange}
        disabled={loading}
      />

      <SectionTitle>{t("address", "Address")}</SectionTitle>
      <Label htmlFor="address.street">{t("street", "Street")}</Label>
      <Input
        id="address.street"
        name="address.street"
        value={formik.values.address.street}
        onChange={formik.handleChange}
        autoComplete="address-line1"
        $hasError={
          !!formik.errors.address?.street && !!formik.touched.address?.street
        }
        disabled={loading}
      />
      <FieldError>
        {formik.touched.address?.street &&
          (formik.errors.address as any)?.street}
      </FieldError>

      <Label htmlFor="address.city">{t("city", "City")}</Label>
      <Input
        id="address.city"
        name="address.city"
        value={formik.values.address.city}
        onChange={formik.handleChange}
        autoComplete="address-level2"
        $hasError={
          !!formik.errors.address?.city && !!formik.touched.address?.city
        }
        disabled={loading}
      />
      <FieldError>
        {formik.touched.address?.city && (formik.errors.address as any)?.city}
      </FieldError>

      <Label htmlFor="address.postalCode">
        {t("postalCode", "Postal Code")}
      </Label>
      <Input
        id="address.postalCode"
        name="address.postalCode"
        value={formik.values.address.postalCode}
        onChange={formik.handleChange}
        autoComplete="postal-code"
        $hasError={
          !!formik.errors.address?.postalCode &&
          !!formik.touched.address?.postalCode
        }
        disabled={loading}
      />
      <FieldError>
        {formik.touched.address?.postalCode &&
          (formik.errors.address as any)?.postalCode}
      </FieldError>

      <Label htmlFor="address.country">{t("country", "Country")}</Label>
      <Input
        id="address.country"
        name="address.country"
        value={formik.values.address.country}
        onChange={formik.handleChange}
        autoComplete="country"
        $hasError={
          !!formik.errors.address?.country && !!formik.touched.address?.country
        }
        disabled={loading}
      />
      <FieldError>
        {formik.touched.address?.country &&
          (formik.errors.address as any)?.country}
      </FieldError>

      <SectionTitle>{t("bankDetails", "Bank Details")}</SectionTitle>
      <Label htmlFor="bankDetails.bankName">{t("bankName", "Bank Name")}</Label>
      <Input
        id="bankDetails.bankName"
        name="bankDetails.bankName"
        value={formik.values.bankDetails.bankName}
        onChange={formik.handleChange}
        $hasError={
          !!formik.errors.bankDetails?.bankName &&
          !!formik.touched.bankDetails?.bankName
        }
        disabled={loading}
      />
      <FieldError>
        {formik.touched.bankDetails?.bankName &&
          (formik.errors.bankDetails as any)?.bankName}
      </FieldError>

      <Label htmlFor="bankDetails.iban">{t("iban", "IBAN")}</Label>
      <Input
        id="bankDetails.iban"
        name="bankDetails.iban"
        value={formik.values.bankDetails.iban}
        onChange={formik.handleChange}
        $hasError={
          !!formik.errors.bankDetails?.iban &&
          !!formik.touched.bankDetails?.iban
        }
        disabled={loading}
      />
      <FieldError>
        {formik.touched.bankDetails?.iban &&
          (formik.errors.bankDetails as any)?.iban}
      </FieldError>

      <Label htmlFor="bankDetails.swiftCode">
        {t("swiftCode", "SWIFT Code")}
      </Label>
      <Input
        id="bankDetails.swiftCode"
        name="bankDetails.swiftCode"
        value={formik.values.bankDetails.swiftCode}
        onChange={formik.handleChange}
        $hasError={
          !!formik.errors.bankDetails?.swiftCode &&
          !!formik.touched.bankDetails?.swiftCode
        }
        disabled={loading}
      />
      <FieldError>
        {formik.touched.bankDetails?.swiftCode &&
          (formik.errors.bankDetails as any)?.swiftCode}
      </FieldError>

      <SectionTitle>{t("socialMedia", "Social Media Accounts")}</SectionTitle>
      <Label htmlFor="socialLinks.facebook">Facebook</Label>
      <Input
        id="socialLinks.facebook"
        name="socialLinks.facebook"
        value={formik.values.socialLinks?.facebook || ""}
        onChange={formik.handleChange}
        disabled={loading}
      />
      <Label htmlFor="socialLinks.instagram">Instagram</Label>
      <Input
        id="socialLinks.instagram"
        name="socialLinks.instagram"
        value={formik.values.socialLinks?.instagram || ""}
        onChange={formik.handleChange}
        disabled={loading}
      />
      <Label htmlFor="socialLinks.twitter">Twitter</Label>
      <Input
        id="socialLinks.twitter"
        name="socialLinks.twitter"
        value={formik.values.socialLinks?.twitter || ""}
        onChange={formik.handleChange}
        disabled={loading}
      />
      <Label htmlFor="socialLinks.linkedin">LinkedIn</Label>
      <Input
        id="socialLinks.linkedin"
        name="socialLinks.linkedin"
        value={formik.values.socialLinks?.linkedin || ""}
        onChange={formik.handleChange}
        disabled={loading}
      />
      <Label htmlFor="socialLinks.youtube">YouTube</Label>
      <Input
        id="socialLinks.youtube"
        name="socialLinks.youtube"
        value={formik.values.socialLinks?.youtube || ""}
        onChange={formik.handleChange}
        disabled={loading}
      />

      <SectionTitle>{t("logoUpload", "Upload Logo(s)")}</SectionTitle>
      <ImageUploadWithPreview
        max={5}
        defaultImages={existingImages}
        onChange={handleLogoChange}
        folder="company"
      />

      <Button
        type="submit"
        aria-label={t("save", "Save Company")}
        disabled={formik.isSubmitting || loading}
      >
        {t("save", "Save Company")}
      </Button>
    </FormStyled>
  );
}

// 🎨 Styled Components
const FormStyled = styled.form`
  max-width: 600px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Label = styled.label`
  display: block;
  margin-top: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
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

const FieldError = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  min-height: 18px;
`;

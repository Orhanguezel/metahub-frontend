"use client";

import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/i18n";
import { ITenant } from "../../types";
import { ImageType } from "@/types/image";

type TranslatedLabel = Record<string, string>;
type SocialLinks = Record<string, string>;

interface EmailSettings {
  smtpHost: string;
  smtpPort: string | number;
  smtpUser: string;
  smtpPass: string;
  senderName: string;
  senderEmail: string;
}

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: ITenant | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

const LANGUAGES = SUPPORTED_LOCALES;

export default function TenantFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: TenantFormModalProps) {
  const { t, i18n } = useTranslation("bike");
  const currentLang = (
    SUPPORTED_LOCALES.includes(i18n.language as SupportedLocale)
      ? i18n.language
      : "en"
  ) as SupportedLocale;

  // Çok dilli boş state
  const emptyLabel: TranslatedLabel = LANGUAGES.reduce(
    (acc, lang) => ({ ...acc, [lang]: "" }),
    {} as TranslatedLabel
  );

  // Ana alanlar
  const [name, setName] = useState<TranslatedLabel>(emptyLabel);
  const [description, setDescription] = useState<TranslatedLabel>(emptyLabel);
  const [metaTitle, setMetaTitle] = useState<TranslatedLabel>(emptyLabel);
  const [metaDescription, setMetaDescription] =
    useState<TranslatedLabel>(emptyLabel);
  const [address, setAddress] = useState<TranslatedLabel>(emptyLabel);

  // Diğer alanlar
  const [slug, setSlug] = useState<string>("");
  const [mongoUri, setMongoUri] = useState<string>("");
  const [domainMain, setDomainMain] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [theme, setTheme] = useState<string>("default");
  const [isActive, setIsActive] = useState<boolean>(true);

  // E-Posta Ayarları
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    senderName: "",
    senderEmail: "",
  });

  // Sosyal medya linkleri
  const [social, setSocial] = useState<SocialLinks>({
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    linkedin: "",
    youtube: "",
  });

  // Görsel yönetimi
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Düzenleme modunda varsayılan değerleri yükle
  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setDescription({ ...emptyLabel, ...editingItem.description });
      setMetaTitle({ ...emptyLabel, ...editingItem.metaTitle });
      setMetaDescription({ ...emptyLabel, ...editingItem.metaDescription });
      setAddress({ ...emptyLabel, ...editingItem.address });

      setSlug(editingItem.slug || "");
      setMongoUri(editingItem.mongoUri || "");
      setDomainMain(editingItem.domain?.main || "");
      setPhone(editingItem.phone || "");
      setTheme(editingItem.theme || "default");
      setIsActive(!!editingItem.isActive);

      setEmailSettings({
        smtpHost: editingItem.emailSettings?.smtpHost || "",
        smtpPort: editingItem.emailSettings?.smtpPort || "",
        smtpUser: editingItem.emailSettings?.smtpUser || "",
        smtpPass: editingItem.emailSettings?.smtpPass || "",
        senderName: editingItem.emailSettings?.senderName || "",
        senderEmail: editingItem.emailSettings?.senderEmail || "",
      });

      setSocial({
        facebook: editingItem.social?.facebook || "",
        instagram: editingItem.social?.instagram || "",
        twitter: editingItem.social?.twitter || "",
        tiktok: editingItem.social?.tiktok || "",
        linkedin: editingItem.social?.linkedin || "",
        youtube: editingItem.social?.youtube || "",
      });

      setExistingImages((editingItem.images || []).map((img) => img.url));
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setName(emptyLabel);
      setDescription(emptyLabel);
      setMetaTitle(emptyLabel);
      setMetaDescription(emptyLabel);
      setAddress(emptyLabel);

      setSlug("");
      setMongoUri("");
      setDomainMain("");
      setPhone("");
      setTheme("default");
      setIsActive(true);

      setEmailSettings({
        smtpHost: "",
        smtpPort: "",
        smtpUser: "",
        smtpPass: "",
        senderName: "",
        senderEmail: "",
      });

      setSocial({
        facebook: "",
        instagram: "",
        twitter: "",
        tiktok: "",
        linkedin: "",
        youtube: "",
      });

      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen, emptyLabel]);

  // Görsel yükleme callback
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // E-Posta ayarlarını güncelle
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Sosyal medya alanlarını güncelle
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocial((prev) => ({ ...prev, [name]: value }));
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Tüm çoklu dil alanları doldur (boş olanlara ilk girilen değer kopyalanır)
    const fillMultilang = (obj: TranslatedLabel) => {
      const filled: TranslatedLabel = { ...obj };
      const first = Object.values(obj).find((v) => v && v.trim());
      if (first)
        LANGUAGES.forEach((lng) => {
          if (!filled[lng]) filled[lng] = first;
        });
      return filled;
    };

    const formData = new FormData();
    formData.append("name", JSON.stringify(fillMultilang(name)));
    formData.append("description", JSON.stringify(fillMultilang(description)));
    formData.append("metaTitle", JSON.stringify(fillMultilang(metaTitle)));
    formData.append(
      "metaDescription",
      JSON.stringify(fillMultilang(metaDescription))
    );
    formData.append("address", JSON.stringify(fillMultilang(address)));
    formData.append("slug", slug.trim());
    formData.append("mongoUri", mongoUri.trim());
    formData.append("theme", theme);
    formData.append("isActive", isActive ? "true" : "false");
    formData.append("domain", JSON.stringify({ main: domainMain.trim() }));
    formData.append("phone", phone.trim());
    formData.append("emailSettings", JSON.stringify(emailSettings));
    formData.append("social", JSON.stringify(social));

    for (const file of selectedFiles) formData.append("images", file);
    if (removedImages.length > 0)
      formData.append("removedImages", JSON.stringify(removedImages));

    await onSubmit(formData, editingItem && (editingItem as any)._id);
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.tenant.edit", "Edit Tenant")
          : t("admin.tenant.create", "Add New Tenant")}
      </h2>
      <form onSubmit={handleSubmit}>
        <Row>
          <Column>
            {/* Çoklu Dil İsim */}
            {LANGUAGES.map((lng) => (
              <div key={lng}>
                <label>
                  {t("admin.tenant.name", "Tenant Name")} ({lng.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={name[lng]}
                  onChange={(e) => setName({ ...name, [lng]: e.target.value })}
                  required={lng === currentLang}
                />
              </div>
            ))}
            {/* Çoklu Dil Açıklama */}
            {LANGUAGES.map((lng) => (
              <div key={lng + "-desc"}>
                <label>
                  {t("admin.tenant.description", "Description")} (
                  {lng.toUpperCase()})
                </label>
                <textarea
                  value={description[lng]}
                  onChange={(e) =>
                    setDescription({ ...description, [lng]: e.target.value })
                  }
                  required={lng === currentLang}
                />
              </div>
            ))}
            {/* Diğer Alanlar */}
            <label>{t("admin.tenant.slug", "Tenant Slug")}</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <label>{t("admin.tenant.mongoUri", "MongoDB URI")}</label>
            <input
              type="text"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              required
            />
            <label>{t("admin.tenant.domainMain", "Main Domain")}</label>
            <input
              type="text"
              value={domainMain}
              onChange={(e) => setDomainMain(e.target.value)}
              required
            />
            <label>{t("admin.tenant.phone", "Phone")}</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label>{t("admin.tenant.theme", "Theme")}</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="default"
            />
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              {t("admin.tenant.isActive", "Active")}
            </label>
          </Column>

          <Column>
            {/* Meta Title/Description */}
            {LANGUAGES.map((lng) => (
              <div key={lng + "-meta-title"}>
                <label>
                  {t("admin.tenant.metaTitle", "Meta Title")} (
                  {lng.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={metaTitle[lng]}
                  onChange={(e) =>
                    setMetaTitle({ ...metaTitle, [lng]: e.target.value })
                  }
                />
              </div>
            ))}
            {LANGUAGES.map((lng) => (
              <div key={lng + "-meta-desc"}>
                <label>
                  {t("admin.tenant.metaDescription", "Meta Description")} (
                  {lng.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={metaDescription[lng]}
                  onChange={(e) =>
                    setMetaDescription({
                      ...metaDescription,
                      [lng]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
            {/* Çoklu Dil Adres */}
            {LANGUAGES.map((lng) => (
              <div key={lng + "-address"}>
                <label>
                  {t("admin.tenant.address", "Address")} ({lng.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={address[lng]}
                  onChange={(e) =>
                    setAddress({ ...address, [lng]: e.target.value })
                  }
                />
              </div>
            ))}
            {/* E-Posta Ayarları */}
            <fieldset>
              <legend>
                {t("admin.tenant.emailSettings", "Email Settings (SMTP)")}
              </legend>
              <label>SMTP Host</label>
              <input
                name="smtpHost"
                value={emailSettings.smtpHost}
                onChange={handleEmailChange}
                required
              />
              <label>SMTP Port</label>
              <input
                name="smtpPort"
                type="number"
                value={emailSettings.smtpPort}
                onChange={handleEmailChange}
                required
              />
              <label>SMTP User</label>
              <input
                name="smtpUser"
                value={emailSettings.smtpUser}
                onChange={handleEmailChange}
                required
              />
              <label>SMTP Pass</label>
              <input
                name="smtpPass"
                value={emailSettings.smtpPass}
                onChange={handleEmailChange}
                required
              />
              <label>Sender Name</label>
              <input
                name="senderName"
                value={emailSettings.senderName}
                onChange={handleEmailChange}
                required
              />
              <label>Sender Email</label>
              <input
                name="senderEmail"
                type="email"
                value={emailSettings.senderEmail}
                onChange={handleEmailChange}
                required
              />
            </fieldset>

            {/* Sosyal Medya */}
            <fieldset>
              <legend>{t("admin.tenant.social", "Social Media Links")}</legend>
              {Object.keys(social).map((k) => (
                <React.Fragment key={k}>
                  <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input
                    name={k}
                    value={social[k]}
                    onChange={handleSocialChange}
                  />
                </React.Fragment>
              ))}
            </fieldset>

            {/* Görsel Yükleme */}
            <label>{t("admin.tenant.images", "Images")}</label>
            <ImageUploadWithPreview
              max={5}
              defaultImages={existingImages}
              onChange={handleImagesChange}
              folder={"tenant" as ImageType}
            />
          </Column>
        </Row>

        <ButtonGroup>
          <button type="submit">
            {editingItem
              ? t("admin.update", "Update")
              : t("admin.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("admin.cancel", "Cancel")}
          </button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
}

// --- Styled Components ---
const FormWrapper = styled.div`
  max-width: 1000px;
  margin: auto;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  h2 {
    margin-bottom: 1rem;
  }
  fieldset {
    margin-top: 1.25rem;
    padding: 0.75rem;
    border-radius: ${({ theme }) => theme.radii.sm};
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    legend {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
  label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
  }
  textarea {
    min-height: 60px;
    resize: vertical;
  }
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const Column = styled.div`
  flex: 1;
  min-width: 320px;
  max-width: 450px;
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  button {
    padding: 0.6rem 1.2rem;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:first-child {
      background: ${({ theme }) => theme.colors.primary};
      color: #fff;
    }
    &:last-child {
      background: ${({ theme }) => theme.colors.danger};
      color: #fff;
    }
    &:hover {
      opacity: 0.92;
    }
  }
`;

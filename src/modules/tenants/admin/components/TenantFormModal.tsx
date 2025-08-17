"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/tenants";
import { ImageUploader } from "@/shared"; // component
import type { UploadImage as UploaderImage } from "@/shared/ImageUploader"; // ⬅️ tip burada
import type { ImageType } from "@/types/image";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/i18n";
import { ITenant, EmailSettings } from "@/modules/tenants/types";

type TranslatedLabel = Record<string, string>;
type SocialLinks = Record<string, string>;

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: ITenant | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

const LANGUAGES = SUPPORTED_LOCALES;

// --- host sanitizer: https://... kaldır, path kırp, lower-case
const sanitizeHost = (v: string): string => {
  const noProto = v.trim().replace(/^https?:\/\//i, "");
  const host = noProto.split("/")[0].trim();
  return host.toLowerCase();
};

export default function TenantFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: TenantFormModalProps) {
  const { i18n, t } = useI18nNamespace("tenant", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const emptyLabel: TranslatedLabel = LANGUAGES.reduce(
    (acc, lng) => ({ ...acc, [lng]: "" }),
    {} as TranslatedLabel
  );

  const [name, setName] = useState<TranslatedLabel>(emptyLabel);
  const [description, setDescription] = useState<TranslatedLabel>(emptyLabel);
  const [metaTitle, setMetaTitle] = useState<TranslatedLabel>(emptyLabel);
  const [metaDescription, setMetaDescription] = useState<TranslatedLabel>(emptyLabel);
  const [address, setAddress] = useState<TranslatedLabel>(emptyLabel);

  const [slug, setSlug] = useState<string>("");
  const [mongoUri, setMongoUri] = useState<string>("");
  const [domainMain, setDomainMain] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [theme, setTheme] = useState<string>("default");
  const [isActive, setIsActive] = useState<boolean>(true);

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    senderName: "",
    senderEmail: "",
  });

  const [social, setSocial] = useState<SocialLinks>({
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    linkedin: "",
    youtube: "",
  });

  // ⬇️ ImageUploader için doğru tipler
  const [existing, setExisting] = useState<UploaderImage[]>([]);
  const [removedExisting, setRemovedExisting] = useState<UploaderImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);

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
      setIsActive(Boolean(editingItem.isActive));

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

      // Mevcut görselleri UploaderImage formatına taşı
      const ex: UploaderImage[] = Array.isArray(editingItem.images)
        ? editingItem.images
            .map((img: any): UploaderImage | null => {
              const url = img?.url;
              if (!url) return null;
              return {
                url,
                thumbnail: img?.thumbnail,
                webp: img?.webp,
                publicId: img?.publicId || img?.public_id,
                type: "tenant" as ImageType,
              };
            })
            .filter(Boolean) as UploaderImage[]
        : [];

      setExisting(ex);
      setRemovedExisting([]);
      setFiles([]);
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

      setExisting([]);
      setRemovedExisting([]);
      setFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingItem, isOpen]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings((prev) => ({ ...prev, [name]: value }));
  };

  // ⛳ handleSocialChange kaldırıldı (inline setSocial kullanıyoruz)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fillMultilang = (obj: TranslatedLabel) => {
      const filled: TranslatedLabel = { ...obj };
      const first = Object.values(obj).find((v) => v && v.trim());
      if (first) LANGUAGES.forEach((lng) => { if (!filled[lng]) filled[lng] = first; });
      return filled;
    };

    const host = sanitizeHost(domainMain);

    const formData = new FormData();
    formData.append("name", JSON.stringify(fillMultilang(name)));
    formData.append("description", JSON.stringify(fillMultilang(description)));
    formData.append("metaTitle", JSON.stringify(fillMultilang(metaTitle)));
    formData.append("metaDescription", JSON.stringify(fillMultilang(metaDescription)));
    formData.append("address", JSON.stringify(fillMultilang(address)));

    formData.append("slug", slug.trim());
    formData.append("mongoUri", mongoUri.trim());
    formData.append("theme", theme.trim());
    formData.append("isActive", isActive ? "true" : "false");

    // 👇 BACKEND uyumluluğu için İKİSİNİ de gönderiyoruz
    formData.append("domainMain", host);                         // düz string
    formData.append("domain", JSON.stringify({ main: host }));   // obje

    formData.append("phone", phone.trim());
    formData.append("emailSettings", JSON.stringify(emailSettings));
    formData.append("social", JSON.stringify(social));

    // Yeni eklenen dosyalar
    for (const file of files) formData.append("images", file);

    // Kaldırılan mevcutlar (url listesi + varsa publicId listesi)
    if (removedExisting.length > 0) {
      const removedUrls = removedExisting.map((x) => x.url).filter(Boolean);
      formData.append("removedImages", JSON.stringify(removedUrls));
      const removedPids = removedExisting.map((x) => x.publicId).filter(Boolean) as string[];
      if (removedPids.length) {
        formData.append("removedPublicIds", JSON.stringify(removedPids));
      }
    }

    const id = editingItem && editingItem._id ? editingItem._id : undefined;
    await onSubmit(formData, id);
  };

  if (!isOpen) return null;

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <h2>{editingItem ? t("admin.tenant.edit", "Edit Tenant") : t("admin.tenant.create", "Add New Tenant")}</h2>

      <Grid>
        <Col>
          {LANGUAGES.map((lng) => (
            <div key={lng}>
              <Label htmlFor={`name-${lng}`}>{t("admin.tenant.name", "Tenant Name")} ({lng.toUpperCase()})</Label>
              <Input id={`name-${lng}`} value={name[lng]} autoFocus={lng === lang}
                     onChange={(e) => setName({ ...name, [lng]: e.target.value })} required={lng === lang} />
            </div>
          ))}

          {LANGUAGES.map((lng) => (
            <div key={lng + "-desc"}>
              <Label htmlFor={`desc-${lng}`}>{t("admin.tenant.description", "Description")} ({lng.toUpperCase()})</Label>
              <TextArea id={`desc-${lng}`} value={description[lng]}
                        onChange={(e) => setDescription({ ...description, [lng]: e.target.value })} required={lng === lang} />
            </div>
          ))}

          <Label htmlFor="slug">{t("admin.tenant.slug", "Tenant Slug")}</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />

          <Label htmlFor="mongoUri">{t("admin.tenant.mongoUri", "MongoDB URI")}</Label>
          <Input id="mongoUri" value={mongoUri} onChange={(e) => setMongoUri(e.target.value)} required />

          <Label htmlFor="domainMain">{t("admin.tenant.domainMain", "Main Domain")}</Label>
          <Input id="domainMain" value={domainMain} onChange={(e) => setDomainMain(e.target.value)} required />

          <Label htmlFor="phone">{t("admin.tenant.phone", "Phone")}</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <Label htmlFor="theme">{t("admin.tenant.theme", "Theme")}</Label>
          <Input id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="default" />

          <Check>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>{t("admin.tenant.isActive", "Active")}</span>
          </Check>
        </Col>

        <Col>
          {LANGUAGES.map((lng) => (
            <div key={lng + "-meta-title"}>
              <Label htmlFor={`meta-title-${lng}`}>{t("admin.tenant.metaTitle", "Meta Title")} ({lng.toUpperCase()})</Label>
              <Input id={`meta-title-${lng}`} value={metaTitle[lng]}
                     onChange={(e) => setMetaTitle({ ...metaTitle, [lng]: e.target.value })} />
            </div>
          ))}

          {LANGUAGES.map((lng) => (
            <div key={lng + "-meta-desc"}>
              <Label htmlFor={`meta-desc-${lng}`}>{t("admin.tenant.metaDescription", "Meta Description")} ({lng.toUpperCase()})</Label>
              <Input id={`meta-desc-${lng}`} value={metaDescription[lng]}
                     onChange={(e) => setMetaDescription({ ...metaDescription, [lng]: e.target.value })} />
            </div>
          ))}

          {LANGUAGES.map((lng) => (
            <div key={lng + "-address"}>
              <Label htmlFor={`address-${lng}`}>{t("admin.tenant.address", "Address")} ({lng.toUpperCase()})</Label>
              <Input id={`address-${lng}`} value={address[lng]}
                     onChange={(e) => setAddress({ ...address, [lng]: e.target.value })} />
            </div>
          ))}

          <Fieldset>
            <Legend>{t("admin.tenant.emailSettings", "Email Settings (SMTP)")}</Legend>
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input id="smtpHost" name="smtpHost" value={emailSettings.smtpHost} onChange={handleEmailChange} required />
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input id="smtpPort" name="smtpPort" type="number" value={emailSettings.smtpPort} onChange={handleEmailChange} required />
            <Label htmlFor="smtpUser">SMTP User</Label>
            <Input id="smtpUser" name="smtpUser" value={emailSettings.smtpUser} onChange={handleEmailChange} required />
            <Label htmlFor="smtpPass">SMTP Pass</Label>
            <Input id="smtpPass" name="smtpPass" value={emailSettings.smtpPass} onChange={handleEmailChange} required />
            <Label htmlFor="senderName">Sender Name</Label>
            <Input id="senderName" name="senderName" value={emailSettings.senderName} onChange={handleEmailChange} required />
            <Label htmlFor="senderEmail">Sender Email</Label>
            <Input id="senderEmail" name="senderEmail" type="email" value={emailSettings.senderEmail} onChange={handleEmailChange} required />
          </Fieldset>

          <Fieldset>
            <Legend>{t("admin.tenant.social", "Social Media Links")}</Legend>
            {Object.keys(social).map((k) => (
              <div key={k}>
                <Label htmlFor={k}>{t(`admin.tenant.social.${k}`, k.charAt(0).toUpperCase() + k.slice(1))}</Label>
                <Input
                  id={k}
                  name={k}
                  value={social[k]}
                  onChange={(e) =>
                    setSocial((p) => ({ ...p, [k]: e.target.value }))
                  }
                />
              </div>
            ))}
          </Fieldset>

          <BlockTitle>{t("admin.tenant.images", "Images")}</BlockTitle>
          <ImageUploader
            existing={existing}
            onExistingChange={setExisting}
            removedExisting={removedExisting}
            onRemovedExistingChange={setRemovedExisting}
            files={files}
            onFilesChange={setFiles}
            maxFiles={5}
            accept="image/*"
            sizeLimitMB={15}
            helpText={t("admin.tenant.imagesHelp", "JPG/PNG/WebP, max 15MB each")}
          />
        </Col>
      </Grid>

      <Buttons>
        <Secondary type="button" onClick={onClose}>{t("admin.cancel", "Cancel")}</Secondary>
        <Primary type="submit">{editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}</Primary>
      </Buttons>
    </Form>
  );
}

/* styled — form pattern */
const Form = styled.form`
  max-width: 1000px; margin:auto; padding:${({theme})=>theme.spacings.lg};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};
  h2{ margin:0; }
`;

const Grid = styled.div`
  display:grid; grid-template-columns:1fr 1fr; gap:${({theme})=>theme.spacings.lg};
  ${({theme})=>theme.media.tablet}{ grid-template-columns:1fr; }
`;

const Col = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.sm};`;

const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  margin-top:${({theme})=>theme.spacings.xs};
`;

const Input = styled.input`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;

const TextArea = styled.textarea`
  min-height:90px; resize:vertical;
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;

const Fieldset = styled.fieldset`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.md};
`;

const Legend = styled.legend`
  padding:0 ${({theme})=>theme.spacings.xs}; color:${({theme})=>theme.colors.textSecondary};
`;

const Check = styled.label`
  display:flex; align-items:center; gap:${({theme})=>theme.spacings.xs};
  margin-top:${({theme})=>theme.spacings.xs};
`;

const BlockTitle = styled.h3`
  font-size:${({theme})=>theme.fontSizes.md};
  margin:${({theme})=>theme.spacings.sm} 0;
  color:${({theme})=>theme.colors.title};
`;

const Buttons = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end; margin-top:${({theme})=>theme.spacings.md};
`;

const BaseBtn = styled.button`
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  border:${({theme})=>theme.borders.thin} transparent; font-weight:${({theme})=>theme.fontWeights.medium};
`;

const Primary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;

const Secondary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;

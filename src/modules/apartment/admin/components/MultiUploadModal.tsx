"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { useAppSelector } from "@/store/hooks";
import { Modal } from "@/shared";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import type { ApartmentCategory } from "@/modules/apartment/types";

interface MultiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    files: File[],
    category: string,
    base: {
      title?: Record<SupportedLocale, string>;
      address: { city: string; country: string; zip?: string; district?: string; street?: string; number?: string };
      contact: { name: string; phone?: string; email?: string; role?: string };
      isPublished?: boolean;
    }
  ) => Promise<void>;
}

export default function MultiUploadModal({ isOpen, onClose, onUpload }: MultiUploadModalProps) {
  const { t, i18n } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const categories = useAppSelector((state) => state.apartmentCategory.categories);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [contactName, setContactName] = useState("");

  const [zip, setZip] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [titleCurrentLang, setTitleCurrentLang] = useState("");

  const getLabel = (item: ApartmentCategory) =>
    item.name?.[lang] || item.name?.en || (Object.values(item.name || {})[0] as string) || "–";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    setError(null);
    if (!selectedCategory) return setError(t("category_required", "Kategori seçmelisiniz!"));
    if (!files.length) return setError(t("apartment.upload.no_files", "Dosya seçmelisiniz!"));
    if (!city.trim() || !country.trim())
      return setError(t("apartment.required_address", "Şehir ve ülke zorunludur."));
    if (!contactName.trim())
      return setError(t("apartment.required_contact", "Sorumlu kişi adı zorunludur."));

    setLoading(true);
    try {
      const titleObj =
        titleCurrentLang.trim()
          ? SUPPORTED_LOCALES.reduce((acc, l) => {
              if (l === lang) acc[l] = titleCurrentLang.trim();
              return acc;
            }, {} as Record<SupportedLocale, string>)
          : undefined;

      await onUpload(files, selectedCategory, {
        title: titleObj,
        address: {
          city: city.trim(),
          country: country.trim(),
          zip: zip.trim() || undefined,
          district: district.trim() || undefined,
          street: street.trim() || undefined,
          number: number.trim() || undefined,
        },
        contact: {
          name: contactName.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          role: role.trim() || undefined,
        },
        isPublished,
      });

      // temizle
      setFiles([]);
      setSelectedCategory("");
      setCity("");
      setCountry("");
      setZip("");
      setDistrict("");
      setStreet("");
      setNumber("");
      setContactName("");
      setPhone("");
      setEmail("");
      setRole("");
      setTitleCurrentLang("");
      setIsPublished(true);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Yükleme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Box>
        <Title>{t("apartment.bulk_upload", "Toplu Firma/Logo Yükle")}</Title>

        <Label>
          {t("apartment.select_category", "Kategori Seçiniz")}
          <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={loading}>
            <option value="">{t("apartment.select_category_placeholder", "Seçiniz...")}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {getLabel(cat)}
              </option>
            ))}
          </Select>
        </Label>

        <Label>
          {t("apartment.title", "Başlık")} ({lang.toUpperCase()}){" "}
          <Hint>{t("apartment.title_hint", "Opsiyonel; slug üretimine yardımcı olur")}</Hint>
          <InputText
            type="text"
            value={titleCurrentLang}
            onChange={(e) => setTitleCurrentLang(e.target.value)}
            placeholder={t("apartment.title_placeholder", "Örn. Hansaring 12")}
            disabled={loading}
          />
        </Label>

        {/* Adres (min: city & country) */}
        <Row>
          <Label $flex>
            {t("city", "Şehir")}*
            <InputText value={city} onChange={(e) => setCity(e.target.value)} disabled={loading} />
          </Label>
          <Label $flex>
            {t("country", "Ülke")}* <Hint>ISO-2</Hint>
            <InputText
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              placeholder="TR / DE / NL ..."
              disabled={loading}
            />
          </Label>
        </Row>

        <Row>
          <Label $flex>
            {t("district", "İlçe/Mahalle")}
            <InputText value={district} onChange={(e) => setDistrict(e.target.value)} disabled={loading} />
          </Label>
          <Label $flex>
            {t("zip", "Posta Kodu")}
            <InputText value={zip} onChange={(e) => setZip(e.target.value)} disabled={loading} />
          </Label>
        </Row>

        <Row>
          <Label $flex>
            {t("street", "Sokak/Cadde")}
            <InputText value={street} onChange={(e) => setStreet(e.target.value)} disabled={loading} />
          </Label>
          <Label $flex>
            {t("number", "No")}
            <InputText value={number} onChange={(e) => setNumber(e.target.value)} disabled={loading} />
          </Label>
        </Row>

        {/* İlgili kişi */}
        <Row>
          <Label $flex>
            {t("contact.name", "Sorumlu Adı")}*
            <InputText value={contactName} onChange={(e) => setContactName(e.target.value)} disabled={loading} />
          </Label>
          <Label $flex>
            {t("role", "Rol")}
            <InputText value={role} onChange={(e) => setRole(e.target.value)} disabled={loading} />
          </Label>
        </Row>

        <Row>
          <Label $flex>
            {t("phone", "Telefon")}
            <InputText value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
          </Label>
          <Label $flex>
            {t("email", "E-posta")}
            <InputText value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </Label>
        </Row>

        <Label>
          {t("apartment.select_files", "Görselleri seçiniz")}
          <Input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={loading} />
        </Label>

        {files.length > 0 && (
          <FileList>
            {files.map((file, idx) => (
              <li key={idx}>
                <span>{file.name}</span>
                <RemoveBtn type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))}>
                  ✕
                </RemoveBtn>
              </li>
            ))}
            <ListFooter>
              <span>{t("apartment.files_count", "{{count}} dosya", { count: files.length as any })}</span>
              <ClearAll type="button" onClick={handleClear}>
                {t("apartment.clear_all", "Tümünü Temizle")}
              </ClearAll>
            </ListFooter>
          </FileList>
        )}

        <PublishRow>
          <label>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            {t("apartment.publish_now", "Yayınla")}
          </label>
        </PublishRow>

        {error && <ErrorBox role="alert">{error}</ErrorBox>}

        <ActionRow>
          <ActionButton type="button" onClick={handleUpload} disabled={loading}>
            {loading ? t("apartment.uploading", "Yükleniyor...") : t("apartment.upload", "Yükle")}
          </ActionButton>
          <CancelButton type="button" onClick={onClose} disabled={loading}>
            {t("apartment.cancel", "İptal")}
          </CancelButton>
        </ActionRow>
      </Box>
    </Modal>
  );
}

/* ---------- styles ---------- */

const Box = styled.div`
  padding: 2rem 1rem;
  min-width: 360px;
  max-width: 520px;
  margin: auto;

  ${({ theme }) => theme.media.small} {
    min-width: 100%;
    max-width: 100%;
    padding: 1rem;
  }
`;

const Title = styled.h2`
  margin-bottom: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const Label = styled.label<{ $flex?: boolean }>`
  display: ${({ $flex }) => ($flex ? "flex" : "block")};
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Hint = styled.small`
  margin-left: 0.35rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  margin-top: 0.35rem;
  display: block;
`;

const InputText = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .8rem;

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
  }
`;

const FileList = styled.ul`
  background: ${({ theme }) => theme.colors.contentBackground || "#f8f8fa"};
  border-radius: 6px;
  margin: .5rem 0 1rem;
  padding: .75rem;
  list-style: none;
  font-size: 0.97rem;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;
  }
`;

const ListFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: .4rem;
  font-size: .92em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RemoveBtn = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  border: none;
  font-size: 1.05em;
  cursor: pointer;
  margin-left: 1rem;
`;

const ClearAll = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  border: none;
  font-size: 0.95em;
  cursor: pointer;
`;

const PublishRow = styled.div`
  margin: .5rem 0 0.5rem;
  label {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
  }
`;

const ErrorBox = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.warningBackground || "#fff2ef"};
  border-radius: 5px;
  padding: 0.5rem 0.7rem;
  margin-bottom: 1rem;
  font-size: 0.98em;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.2rem;

  ${({ theme }) => theme.media.small} {
    flex-direction: column-reverse;
    gap: .6rem;
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  &:disabled { opacity: .7; cursor: not-allowed; }
`;

const CancelButton = styled.button`
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
`;

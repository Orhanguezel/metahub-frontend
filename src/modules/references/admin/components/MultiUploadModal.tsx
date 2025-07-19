"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/references";
import { useAppSelector } from "@/store/hooks";
import { Modal } from "@/shared";
import { SupportedLocale } from "@/types/common";
import type { ReferencesCategory } from "@/modules/references/types";

// Props tipi
interface MultiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], category: string) => Promise<void>;
}

export default function MultiUploadModal({ isOpen, onClose, onUpload }: MultiUploadModalProps) {
  const { t, i18n } = useI18nNamespace("references", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const categories = useAppSelector((state) => state.referencesCategory.categories);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Kategori label’i
  const getLabel = (item: ReferencesCategory) => item.name?.[lang] || item.name?.en || Object.values(item.name)[0] || "–";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleUpload = async () => {
    setError(null);
    if (!selectedCategory) {
      setError(t("category_required", "Kategori seçmelisiniz!"));
      return;
    }
    if (!files.length) {
      setError(t("references.upload.no_files", "Dosya seçmelisiniz!"));
      return;
    }
    setLoading(true);
    try {
      await onUpload(files, selectedCategory);
      setFiles([]);
      setSelectedCategory("");
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
        <Title>{t("references.bulk_upload", "Toplu Firma/Logo Yükle")}</Title>

        {/* Kategori seçici */}
        <Label>
          {t("references.select_category", "Kategori Seçiniz")}
          <Select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">{t("references.select_category_placeholder", "Seçiniz...")}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {getLabel(cat)}
              </option>
            ))}
          </Select>
        </Label>

        {/* Dosya seçici */}
        <Label>
          {t("references.select_files", "Firma logolarını seçiniz")}
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={loading}
          />
        </Label>

        {/* Seçili dosyalar */}
        {files.length > 0 && (
          <FileList>
            {files.map((file, idx) => (
              <li key={idx}>
                <span>{file.name}</span>
                <RemoveBtn type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))}>✕</RemoveBtn>
              </li>
            ))}
            <ClearAll type="button" onClick={handleClear}>
              {t("references.clear_all", "Tümünü Temizle")}
            </ClearAll>
          </FileList>
        )}

        {error && <ErrorBox>{error}</ErrorBox>}

        <ActionRow>
          <ActionButton type="button" onClick={handleUpload} disabled={loading}>
            {loading ? t("references.uploading", "Yükleniyor...") : t("references.upload", "Yükle")}
          </ActionButton>
          <CancelButton type="button" onClick={onClose} disabled={loading}>
            {t("references.cancel", "İptal")}
          </CancelButton>
        </ActionRow>
      </Box>
    </Modal>
  );
}

// --- Styled Components ---
const Box = styled.div`
  padding: 2rem 1rem;
  min-width: 350px;
  max-width: 480px;
  margin: auto;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  margin-top: 0.5rem;
  display: block;
`;

const FileList = styled.ul`
  background: ${({ theme }) => theme.colors.contentBackground || "#f8f8fa"};
  border-radius: 6px;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  list-style: none;
  font-size: 0.97rem;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;
  }
`;

const RemoveBtn = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  border: none;
  font-size: 1.15em;
  cursor: pointer;
  margin-left: 1rem;
`;

const ClearAll = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  border: none;
  font-size: 0.95em;
  margin-top: 0.3rem;
  cursor: pointer;
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
  margin-top: 1.7rem;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: 0.65rem 1.6rem;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.65rem 1.6rem;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
`;


"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createNews } from "@/store/newsSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

type LangCode = "tr" | "en" | "de";
const languageLabels: Record<LangCode, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
};

interface Props {
  onSuccess?: () => void;
}

export default function NewsMultiForm({ onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const [newsMultilang, setNewsMultilang] = useState<
    Record<LangCode, {
      title: string;
      summary: string;
      content: string;
      slug: string;
      category: string;
      tags: string;
    }>
  >({
    en: { title: "", summary: "", content: "", slug: "", category: "", tags: "" },
    tr: { title: "", summary: "", content: "", slug: "", category: "", tags: "" },
    de: { title: "", summary: "", content: "", slug: "", category: "", tags: "" },
  });

  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string>("");

  const isComplete =
    Object.values(newsMultilang).every(
      (v) => v.title && v.summary && v.content && v.slug && v.category
    ) && images.length > 0;

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      for (const lang of ["en", "tr", "de"] as LangCode[]) {
        const current = newsMultilang[lang];
        formData.append(`title_${lang}`, current.title);
        formData.append(`summary_${lang}`, current.summary);
        formData.append(`content_${lang}`, current.content);
        formData.append(`slug_${lang}`, current.slug);
        formData.append(`category_${lang}`, current.category);
        formData.append(`tags_${lang}`, JSON.stringify(current.tags.split(",").map((t) => t.trim())));
      }

      formData.append("isPublished", String(isPublished));
      formData.append("publishedAt", publishedAt || new Date().toISOString());

      images.forEach((img) => formData.append("image", img));

      await dispatch(createNews(formData)).unwrap();
      toast.success(t("news.created"));
      onSuccess?.();

      // Temizleme
      setNewsMultilang({
        en: { title: "", summary: "", content: "", slug: "", category: "", tags: "" },
        tr: { title: "", summary: "", content: "", slug: "", category: "", tags: "" },
        de: { title: "", summary: "", content: "", slug: "", category: "", tags: "" },
      });
      setImages([]);
      setPreview("");
      setIsPublished(false);
      setPublishedAt("");
    } catch (err: any) {
      toast.error(t("news.error") + ": " + err.message);
    }
  };

  return (
    <Container>
      <h3>📰 {t("news.newMulti") || "Yeni Haber (Çok Dilli)"}</h3>

      <SharedFields>
        <Label>Yayın Durumu</Label>
        <ToggleRow>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span>{t("news.publishNow") || "Şimdi Yayınla"}</span>
        </ToggleRow>

        <Label>Yayın Tarihi</Label>
        <Input
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />

        <Label>Görseller (Max 5)</Label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []).slice(0, 5); // Max 5 görsel
            setImages(files);
            if (files[0]) setPreview(URL.createObjectURL(files[0]));
          }}
        />

        {preview && <ImagePreview src={preview} alt="preview" />}
      </SharedFields>

      <CardGrid>
        {(["en", "tr", "de"] as LangCode[]).map((lang) => {
          const item = newsMultilang[lang];
          const complete = item.title && item.summary && item.content && item.slug && item.category;

          return (
            <LangCard key={lang}>
              <LangHeader>
                {languageLabels[lang]} {complete && <CheckMark>✓</CheckMark>}
              </LangHeader>

              <Label>Slug</Label>
              <Input
                value={item.slug}
                onChange={(e) =>
                  setNewsMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], slug: e.target.value },
                  }))
                }
              />

              <Label>Kategori</Label>
              <Input
                value={item.category}
                onChange={(e) =>
                  setNewsMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], category: e.target.value },
                  }))
                }
              />

              <Label>Etiketler (virgülle)</Label>
              <Input
                value={item.tags}
                onChange={(e) =>
                  setNewsMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], tags: e.target.value },
                  }))
                }
              />

              <Label>Başlık</Label>
              <Input
                value={item.title}
                onChange={(e) =>
                  setNewsMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], title: e.target.value },
                  }))
                }
              />

              <Label>Özet</Label>
              <TextArea
                rows={2}
                value={item.summary}
                onChange={(e) =>
                  setNewsMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], summary: e.target.value },
                  }))
                }
              />

              <Label>İçerik</Label>
              <TextArea
                rows={5}
                value={item.content}
                onChange={(e) =>
                  setNewsMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], content: e.target.value },
                  }))
                }
              />
            </LangCard>
          );
        })}
      </CardGrid>

      <Button disabled={!isComplete} onClick={handleSubmit}>
        {t("common.create")}
      </Button>
    </Container>
  );
}

// Styled Components (aynı)
const Container = styled.div`margin-top: 2rem;`;
const SharedFields = styled.div`
  margin-bottom: 2rem;
  input[type="file"] {
    background: ${({ theme }) => theme.inputBackground};
    padding: 8px;
    color: ${({ theme }) => theme.text};
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
    width: 100%;
  }
`;
const CardGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-bottom: 2rem;
`;
const LangCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
`;
const LangHeader = styled.div`font-weight: 600; font-size: 1.1rem; margin-bottom: 0.8rem;`;
const CheckMark = styled.span`color: green; font-size: 1.1rem; margin-left: 6px;`;
const Label = styled.label`font-weight: 600; display: block; margin: 0.6rem 0 0.3rem;`;
const Input = styled.input`
  width: 100%;
  padding: 9px;
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 9px;
  border-radius: 6px;
  resize: vertical;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
`;
const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0.4rem 0;
  input[type="checkbox"] {
    transform: scale(1.2);
    cursor: pointer;
  }
  span {
    font-weight: 500;
  }
`;
const Button = styled.button<{ disabled?: boolean }>`
  padding: 10px 20px;
  background: ${({ disabled, theme }) => (disabled ? "#999" : theme.success)};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  &:hover {
    opacity: ${({ disabled }) => (disabled ? 1 : 0.9)};
  }
`;
const ImagePreview = styled.img`
  max-width: 200px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  margin-top: 0.5rem;
`;

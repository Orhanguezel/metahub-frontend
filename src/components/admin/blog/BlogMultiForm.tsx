"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import { createBlog } from "@/store/blogSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

type LangCode = "en" | "de" | "tr";
const languages: LangCode[] = ["en", "de", "tr"];
const languageLabels: Record<LangCode, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
};

interface Props {
  onSuccess?: () => void;
}

const schema = yup.object({
  en: yup.object().shape({
    title: yup.string().required(),
    summary: yup.string().required(),
    content: yup.string().required(),
    slug: yup.string().required(),
    category: yup.string().required(),
    tags: yup.string().required(),
  }),
  de: yup.object().shape({
    title: yup.string().required(),
    summary: yup.string().required(),
    content: yup.string().required(),
    slug: yup.string().required(),
    category: yup.string().required(),
    tags: yup.string().required(),
  }),
  tr: yup.object().shape({
    title: yup.string().required(),
    summary: yup.string().required(),
    content: yup.string().required(),
    slug: yup.string().required(),
    category: yup.string().required(),
    tags: yup.string().required(),
  }),
});

const BlogMultiForm: React.FC<Props> = ({ onSuccess }) => {
  const { t } = useTranslation("admin");
  const dispatch = useAppDispatch();
  const [previews, setPreviews] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      en: {
        title: "",
        summary: "",
        content: "",
        slug: "",
        category: "",
        tags: "",
      },
      de: {
        title: "",
        summary: "",
        content: "",
        slug: "",
        category: "",
        tags: "",
      },
      tr: {
        title: "",
        summary: "",
        content: "",
        slug: "",
        category: "",
        tags: "",
      },
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.warning("Maksimum 5 görsel seçebilirsiniz.");
    }
    const limited = files.slice(0, 5);
    setImages(limited);
    setPreviews(limited.map((file) => URL.createObjectURL(file)));
  };

  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      toast.error(t("blog.imageRequired") || "At least one image is required");
      return;
    }

    try {
      const formData = new FormData();

      languages.forEach((lang) => {
        const current = data[lang];
        formData.append(`title_${lang}`, current.title);
        formData.append(`summary_${lang}`, current.summary);
        formData.append(`content_${lang}`, current.content);
        formData.append(`slug_${lang}`, current.slug);
        formData.append(`category_${lang}`, current.category);
        formData.append(
          `tags_${lang}`,
          JSON.stringify(
            current.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          )
        );
      });

      images.forEach((img) => formData.append("images", img));
      formData.append("isPublished", String(isPublished));
      formData.append("publishedAt", publishedAt || new Date().toISOString());

      await dispatch(createBlog(formData)).unwrap();
      toast.success(t("blog.created") || "Blog created successfully.");
      reset();
      setImages([]);
      setPreviews([]);
      setPublishedAt("");
      setIsPublished(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(t("blog.error") + ": " + err.message);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    setPreviews(updated.map((file) => URL.createObjectURL(file)));
  };

  return (
    <Container onSubmit={handleSubmit(onSubmit)}>
      <h3>📝 {t("blog.newMulti") || "Yeni Blog (Çok Dilli)"}</h3>

      <SharedFields>
        <label>{t("blog.isPublished")}</label>
        <Toggle>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span>{t("blog.publishNow")}</span>
        </Toggle>

        <label>{t("blog.publishedAt")}</label>
        <input
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />

        <label>{t("blog.imageUpload")}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        <PreviewGrid>
          {previews.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              <RemoveBtn onClick={() => removeImage(i)}>×</RemoveBtn>
              <ImagePreview src={src} alt={`preview-${i}`} />
            </div>
          ))}
        </PreviewGrid>
      </SharedFields>

      <Grid>
        {languages.map((lang) => {
          const langErrs = errors?.[lang];
          return (
            <LangCard key={lang}>
              <LangHeader>{languageLabels[lang]}</LangHeader>

              <label>Slug</label>
              <input {...register(`${lang}.slug`)} />
              {langErrs?.slug && <ErrorMsg>{langErrs.slug.message}</ErrorMsg>}

              <label>Kategori</label>
              <input {...register(`${lang}.category`)} />
              {langErrs?.category && (
                <ErrorMsg>{langErrs.category.message}</ErrorMsg>
              )}

              <label>Etiketler (virgülle)</label>
              <input {...register(`${lang}.tags`)} />

              <label>Başlık</label>
              <input {...register(`${lang}.title`)} />
              {langErrs?.title && <ErrorMsg>{langErrs.title.message}</ErrorMsg>}

              <label>Özet</label>
              <textarea {...register(`${lang}.summary`)} rows={2} />
              {langErrs?.summary && (
                <ErrorMsg>{langErrs.summary.message}</ErrorMsg>
              )}

              <label>İçerik</label>
              <textarea {...register(`${lang}.content`)} rows={5} />
              {langErrs?.content && (
                <ErrorMsg>{langErrs.content.message}</ErrorMsg>
              )}
            </LangCard>
          );
        })}
      </Grid>

      <SubmitButton type="submit" disabled={images.length === 0}>
        {t("common.create")}
      </SubmitButton>
    </Container>
  );
};

export default BlogMultiForm;

const PreviewGrid = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 0.8rem;
  flex-wrap: wrap;
`;

const ImagePreview = styled.img`
  width: 100px;
  height: auto;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const Container = styled.form`
  margin-top: 2rem;
`;

const SharedFields = styled.div`
  margin-bottom: 2rem;
  input[type="file"],
  input[type="datetime-local"] {
    display: block;
    margin-top: 0.4rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.text};
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: 2rem;
`;

const LangCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};

  label {
    display: block;
    font-weight: 600;
    margin: 0.6rem 0 0.3rem;
  }

  input,
  textarea {
    width: 100%;
    padding: 9px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.text};
    margin-bottom: 0.5rem;
  }
`;

const LangHeader = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0.4rem 0;
  input {
    transform: scale(1.2);
  }
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${({ theme, disabled }) => (disabled ? "#aaa" : theme.primary)};
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const ErrorMsg = styled.span`
  color: red;
  font-size: 0.875rem;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { updateBlog } from "@/store/blogSlice";
import { toast } from "react-toastify";
import ImageUploadWithPreview from "@/components/shared/ImageUploadWithPreview";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  blog: any;
}

const schema = yup.object({
  title: yup.string().required(),
  summary: yup.string().required(),
  content: yup.string().required(),
  slug: yup.string().required(),
  category: yup.string().required(),
  tags: yup.string().required(),
});

const BlogEditModal: React.FC<Props> = ({ isOpen, onClose, blog }) => {
  const { t } = useTranslation("admin");
  const dispatch = useAppDispatch();

  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && blog) {
      reset({
        title: blog.title || "",
        summary: blog.summary || "",
        content: blog.content || "",
        slug: blog.slug || "",
        category: blog.category || "",
        tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      });

      setIsPublished(blog.isPublished || false);
      setPublishedAt(
        blog.publishedAt
          ? new Date(blog.publishedAt).toISOString().slice(0, 16)
          : ""
      );
      setNewImages([]);
      setRemovedImages([]);
    }
  }, [isOpen, blog, reset]);

  const handleImageUpdate = (files: File[], removed: string[]) => {
    setNewImages(files);
    setRemovedImages(removed);
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("summary", data.summary);
      formData.append("content", data.content);
      formData.append("slug", data.slug);
      formData.append("category", data.category);
      formData.append(
        "tags",
        JSON.stringify(data.tags.split(",").map((t: string) => t.trim()))
      );
      formData.append("language", blog.language); // mevcut dil
      formData.append("isPublished", String(isPublished));
      formData.append("publishedAt", publishedAt || new Date().toISOString());

      newImages.forEach((file) => formData.append("images", file));
      formData.append("removedImages", JSON.stringify(removedImages));

      await dispatch(updateBlog({ id: blog._id, formData })).unwrap();
      toast.success(t("blog.updated"));
      onClose();
      reset();
    } catch (err: any) {
      toast.error(t("blog.error") + ": " + err.message);
    }
  };

  const watched = watch();

  if (!isOpen || !blog) return null;

  return (
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h3>{t("blog.editBlog")}</h3>

        <ToggleRow>
          <label>{t("blog.publishNow")}</label>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </ToggleRow>

        <label>{t("blog.publishedAt")}</label>
        <input
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGrid>
            <label>Slug</label>
            <input
              {...register("slug")}
              value={watched.slug || ""}
              onChange={(e) => setValue("slug", e.target.value)}
            />

            <label>Kategori</label>
            <input
              {...register("category")}
              value={watched.category || ""}
              onChange={(e) => setValue("category", e.target.value)}
            />

            <label>Etiketler</label>
            <input
              {...register("tags")}
              defaultValue={
                Array.isArray(blog.tags)
                  ? blog.tags.join(", ")
                  : blog.tags || ""
              }
            />

            <label>{t("blog.title")}</label>
            <input
              {...register("title")}
              value={watched.title || ""}
              onChange={(e) => setValue("title", e.target.value)}
            />

            <label>{t("blog.summary")}</label>
            <textarea
              {...register("summary")}
              rows={2}
              value={watched.summary || ""}
              onChange={(e) => setValue("summary", e.target.value)}
            />

            <label>{t("blog.content")}</label>
            <textarea
              {...register("content")}
              rows={6}
              value={watched.content || ""}
              onChange={(e) => setValue("content", e.target.value)}
            />

            <label>{t("blog.imageUpload")} (max 5)</label>
            <ImageUploadWithPreview
              max={5}
              defaultImages={blog.images}
              onChange={handleImageUpdate}
            />
          </FormGrid>

          <SubmitButton type="submit">{t("common.update")}</SubmitButton>
        </form>
      </ModalContainer>
    </Overlay>
  );
};

export default BlogEditModal;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
  position: relative;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  width: 90%;
  max-width: 800px;
  padding: 2rem;
  border-radius: 10px;
  overflow-y: auto;
  max-height: 90vh;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  z-index: 10;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 1rem 0;

  label {
    font-weight: bold;
  }

  input[type="checkbox"] {
    transform: scale(1.2);
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;

  label {
    font-weight: 600;
    margin-bottom: 0.25rem;
    display: block;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 6px;
    background: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    transition: border 0.3s;

    &:focus {
      border-color: ${({ theme }) => theme.primary};
      outline: none;
    }
  }
`;

const SubmitButton = styled.button`
  margin-top: 1.5rem;
  padding: 12px 24px;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

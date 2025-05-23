"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled, { keyframes } from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {ImageUploadWithPreview} from "@/shared";

interface GalleryItem {
  _id: string;
  category: string;
  type: string;
  items: {
    image: string;
    title: { tr: string; en: string; de: string };
    description?: { tr: string; en: string; de: string };
    order?: number;
  }[];
}

interface GalleryEditFormProps {
  item: GalleryItem;
  onClose: () => void;
  categories: string[];
}

const tabs = ["general", "titles", "descriptions", "image"];

const GalleryEditForm: React.FC<GalleryEditFormProps> = ({
  item,
  onClose,
  categories,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("gallery");

  const firstItem = item.items[0] || {
    image: "",
    title: { tr: "", en: "", de: "" },
    description: { tr: "", en: "", de: "" },
    order: 1,
  };

  const [formState, setFormState] = useState({
    category: item.category,
    type: item.type,
    title_tr: firstItem.title.tr,
    title_en: firstItem.title.en,
    title_de: firstItem.title.de,
    desc_tr: firstItem.description?.tr || "",
    desc_en: firstItem.description?.en || "",
    desc_de: firstItem.description?.de || "",
    order: firstItem.order?.toString() || "1",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  const generalSelectRef = useRef<HTMLSelectElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === "general") generalSelectRef.current?.focus();
    else if (activeTab === "titles") titleInputRef.current?.focus();
    else if (activeTab === "descriptions")
      descriptionTextAreaRef.current?.focus();
  }, [activeTab]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.category) newErrors.category = "Category is required";
    if (!formState.title_tr) newErrors.title_tr = "Title TR is required";
    if (!formState.title_en) newErrors.title_en = "Title EN is required";
    if (!formState.title_de) newErrors.title_de = "Title DE is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        data.append(key, value);
      }
    });
    files.forEach((file) => data.append("images", file));

    try {
      setIsLoading(true);
      await dispatch(
        updateGalleryItem({ id: item._id, formData: data })
      ).unwrap();
      setSuccess(true);
      toast.success(t("update.success"));
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      toast.error((err as any)?.message || t("upload.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TabList role="tablist">
        {tabs.map((tab) => (
          <Tab
            key={tab}
            type="button"
            $isActive={activeTab === tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {t(`form.${tab}`)}
          </Tab>
        ))}
      </TabList>

      <TabContent>
        {activeTab === "general" && (
          <Section $animate>
            <Select
              ref={generalSelectRef}
              value={formState.category}
              onChange={(e) =>
                setFormState({ ...formState, category: e.target.value })
              }
            >
              <option value="">{t("form.selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            {errors.category && <ErrorText>{errors.category}</ErrorText>}

            <Select
              value={formState.type}
              onChange={(e) =>
                setFormState({ ...formState, type: e.target.value })
              }
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </Select>

            <StyledInput
              type="number"
              placeholder="Order"
              value={formState.order}
              onChange={(e) =>
                setFormState({ ...formState, order: e.target.value })
              }
            />
          </Section>
        )}

        {activeTab === "titles" && (
          <Section $animate>
            <StyledInput
              ref={titleInputRef}
              type="text"
              placeholder="Title (TR)"
              value={formState.title_tr}
              onChange={(e) =>
                setFormState({ ...formState, title_tr: e.target.value })
              }
            />
            {errors.title_tr && <ErrorText>{errors.title_tr}</ErrorText>}

            <StyledInput
              type="text"
              placeholder="Title (EN)"
              value={formState.title_en}
              onChange={(e) =>
                setFormState({ ...formState, title_en: e.target.value })
              }
            />
            {errors.title_en && <ErrorText>{errors.title_en}</ErrorText>}

            <StyledInput
              type="text"
              placeholder="Title (DE)"
              value={formState.title_de}
              onChange={(e) =>
                setFormState({ ...formState, title_de: e.target.value })
              }
            />
            {errors.title_de && <ErrorText>{errors.title_de}</ErrorText>}
          </Section>
        )}

        {activeTab === "descriptions" && (
          <Section $animate>
            <TextArea
              ref={descriptionTextAreaRef}
              placeholder="Description (TR)"
              value={formState.desc_tr}
              onChange={(e) =>
                setFormState({ ...formState, desc_tr: e.target.value })
              }
            />
            <TextArea
              placeholder="Description (EN)"
              value={formState.desc_en}
              onChange={(e) =>
                setFormState({ ...formState, desc_en: e.target.value })
              }
            />
            <TextArea
              placeholder="Description (DE)"
              value={formState.desc_de}
              onChange={(e) =>
                setFormState({ ...formState, desc_de: e.target.value })
              }
            />
          </Section>
        )}

        {activeTab === "image" && (
          <Section $animate>
            <SectionTitle>Current Image</SectionTitle>
            {firstItem.image ? (
              <ImagePreview src={firstItem.image} alt="Current" />
            ) : (
              <Placeholder>No image</Placeholder>
            )}
            <SectionTitle>Upload New</SectionTitle>
            <ImageUploadWithPreview
              max={5}
              folder="gallery"
              onChange={(selectedFiles) => setFiles(selectedFiles)}
            />
          </Section>
        )}
      </TabContent>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? <Spinner /> : success ? "✓ Saved!" : t("form.save")}
      </SubmitButton>
    </Form>
  );
};

export default GalleryEditForm;

// Styled Components

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TabList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.inputBackground};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.buttonText : theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.buttonText};
  }
`;

const TabContent = styled.div`
  position: relative;
`;

const Section = styled.div<{ $animate?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  animation: ${({ $animate }) => ($animate ? fadeIn : "none")} 0.3s ease-out;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  resize: vertical;
`;

const ErrorText = styled.span`
  color: red;
  font-size: 0.85rem;
`;

const Spinner = styled.div`
  border: 2px solid #fff;
  border-top: 2px solid ${({ theme }) => theme.colors.primaryHover};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.6s linear infinite;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 150px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

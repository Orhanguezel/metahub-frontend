"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createCategory } from "@/store/categorySlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getImageSrc } from "@/utils/getImageSrc";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryFormModal({ onClose, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<"tr" | "en" | "de">("en");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("language", language);
    if (image) formData.append("image", image);

    dispatch(createCategory(formData))
      .unwrap()
      .then(() => {
        toast.success(t("categories.created"));
        onSuccess();
      })
      .catch(() => toast.error(t("categories.error")));
  };

  return (
    <Overlay>
      <Modal>
        <h3>➕ {t("categories.new")}</h3>

        <Label>{t("categories.name")}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />

        <Label>{t("categories.description")}</Label>
        <TextArea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Label>{t("categories.language")}</Label>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "tr" | "en" | "de")}
        >
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
          <option value="de">Deutsch</option>
        </Select>

        <Label>{t("categories.image")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImage(file);
              setPreview(URL.createObjectURL(file));
            }
          }}
        />

        {preview && (
          <ImagePreview src={getImageSrc(preview, "category")} alt="preview" />
        )}

        <ButtonGroup>
          <Button onClick={handleSubmit}>{t("common.create")}</Button>
          <Button danger onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
  max-width: 500px;
  margin: 8vh auto;
  border-radius: 12px;
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin: 1rem 0 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  resize: vertical;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ danger?: boolean }>`
  padding: 10px 18px;
  background: ${({ danger, theme }) => (danger ? theme.danger : theme.success)};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
`;

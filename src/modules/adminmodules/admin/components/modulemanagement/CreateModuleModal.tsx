"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import {
  createModuleMeta,
} from "@/modules/adminmodules/slices/moduleMetaSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/adminmodules";
import { toast } from "react-toastify";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { TranslatedLabel, SupportedLocale } from "@/types/common";

// --- Props tipi
interface CreateModuleModalProps {
  onClose: () => void;
}

// --- State tipleri

interface ModuleFormState {
  name: string;
  icon: string;
  roles: string;
  language: SupportedLocale;
  enabled: boolean;
  order: number;
}

// --- Yardımcı
const getLangLabel = (lang: string) => lang.toUpperCase();

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ onClose }) => {
   const { i18n, t } = useI18nNamespace("adminModules", translations);
    const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();

  // Çoklu dil label alanı
  const [label, setLabel] = useState<TranslatedLabel>(
    SUPPORTED_LOCALES.reduce(
      (acc, l) => ({ ...acc, [l]: "" }),
      {} as TranslatedLabel
    )
  );
  const [form, setForm] = useState<ModuleFormState>({
    name: "",
    icon: "MdSettings",
    roles: "admin",
    language: lang,
    enabled: true,
    order: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Input handlerlar
  const handleLabelChange = (locale: string, value: string) => {
    setLabel((prev) => ({ ...prev, [locale]: value }));
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      newValue = parseInt(value, 10) || 0;
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };
  const getMsg = (msg: any) =>
    !msg ? "" : typeof msg === "string" ? msg : msg?.[lang] || msg?.en || "";

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError(t("errors.nameRequired", "Module name is required."));
      return;
    }
    // En az bir label dolu olmalı
    const atLeastOneLabel = Object.values(label).some(
      (val) => val && val.trim()
    );
    if (!atLeastOneLabel) {
      setError(t("errors.labelRequired", "At least one label is required."));
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        createModuleMeta({
          ...form,
          label: label as TranslatedLabel,
          roles: form.roles
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
        })
      ).unwrap();
      toast.success(t("success.created", "Module created successfully."));
      onClose();
    } catch (err: any) {
      setError(
        getMsg(err?.message) ||
          t("errors.createFailed", "Module creation failed.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <ModalTitle>{t("create", "Add New Module")}</ModalTitle>
          <CloseButton onClick={onClose} aria-label={t("close", "Close")}>
            <XCircle size={20} />
          </CloseButton>
        </Header>
        {error && <ErrorText>{error}</ErrorText>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label>{t("name", "Module Name")} *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              autoFocus
              required
              autoComplete="off"
              disabled={submitting}
            />
          </InputGroup>

          {/* Çoklu dil label alanları */}
          <LabelRow>
            {SUPPORTED_LOCALES.map((l) => (
              <LabelCol key={l}>
                <label htmlFor={`label-${l}`}>{getLangLabel(l)}</label>
                <input
                  id={`label-${l}`}
                  value={label[l]}
                  onChange={(e) => handleLabelChange(l, e.target.value)}
                  placeholder={t("labelPlaceholder", "Label in this language")}
                  autoComplete="off"
                  disabled={submitting}
                />
              </LabelCol>
            ))}
          </LabelRow>

          <InputGroup>
            <label>{t("icon", "Icon")}</label>
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
              autoComplete="off"
              disabled={submitting}
            />
            <small style={{ color: "#888" }}>
              ex: MdSettings, MdBook, MdLock (react-icons/md)
            </small>
          </InputGroup>

          <InputGroup>
            <label>{t("roles", "Roles (comma separated)")}</label>
            <input
              name="roles"
              value={form.roles}
              onChange={handleChange}
              autoComplete="off"
              disabled={submitting}
            />
          </InputGroup>

          <InputGroup>
            <label>{t("language", "Language")}</label>
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              disabled={submitting}
            >
              {SUPPORTED_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {getLangLabel(l)}
                </option>
              ))}
            </select>
          </InputGroup>

          <InputGroup>
            <label>{t("order", "Order")}</label>
            <input
              type="number"
              name="order"
              value={form.order}
              onChange={handleChange}
              min={0}
              autoComplete="off"
              disabled={submitting}
            />
          </InputGroup>

          <CheckboxGroup>
            <label>
              <input
                type="checkbox"
                name="enabled"
                checked={!!form.enabled}
                onChange={handleChange}
                disabled={submitting}
              />
              {t("enabled", "Enabled")}
            </label>
          </CheckboxGroup>

          <SubmitButton type="submit" disabled={submitting}>
            {submitting
              ? t("saving", "Saving...")
              : t("createSubmit", "Create")}
          </SubmitButton>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default CreateModuleModal;

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg};
  max-width: 500px;
  width: 95%;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;
const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ModalTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacings.xs};
  display: flex;
  align-items: center;
  transition: color ${({ theme }) => theme.transition.fast};
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
  input,
  select {
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;
const LabelRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;
const LabelCol = styled.div`
  flex: 1 1 120px;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  label {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  input {
    width: 100%;
  }
`;
const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
  label {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacings.sm};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;
const SubmitButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;
const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`;

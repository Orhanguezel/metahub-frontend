"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { SupportedLocale, SUPPORTED_LOCALES, LANG_LABELS } from "@/types/common";
import { Button } from "@/shared";
import type { ISectionMeta, ISectionSetting, TranslatedLabel } from "@/modules/section/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

// Eksik locale'leri doldurur, her alan string olur
function fillAllLocales<T extends Partial<TranslatedLabel>>(input: T | undefined): TranslatedLabel {
  const result: TranslatedLabel = {} as any;
  for (const lng of SUPPORTED_LOCALES) {
    result[lng] = input?.[lng] ?? "";
  }
  return result;
}

type Props = {
  open: boolean;
  onClose: () => void;
  meta: ISectionMeta;
  setting?: ISectionSetting | null;
  onSave: (data: Partial<ISectionSetting>) => void | Promise<void>;
};

export default function SectionEditModal({
  open, onClose, meta, setting, onSave,
}: Props) {
  const { t } = useI18nNamespace("section", translations);

  const [activeLang, setActiveLang] = useState<SupportedLocale>("tr");
  const [label, setLabel] = useState<TranslatedLabel>(fillAllLocales(setting?.label || meta.label));
  const [description, setDescription] = useState<TranslatedLabel>(fillAllLocales(setting?.description || meta.description));
  const [enabled, setEnabled] = useState<boolean>(setting?.enabled ?? meta.defaultEnabled);
  const [order, setOrder] = useState<number>(setting?.order ?? meta.defaultOrder ?? 1);


  useEffect(() => {
    if (open) {
      setLabel(fillAllLocales(setting?.label || meta.label));
      setDescription(fillAllLocales(setting?.description || meta.description));
      setEnabled(setting?.enabled ?? meta.defaultEnabled);
      setOrder(setting?.order ?? meta.defaultOrder);
      setActiveLang("tr");
    }
  }, [open, setting, meta]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ label, description, enabled, order });
  };

  return (
    <ModalBackdrop>
      <Modal>
        <h2>{t("editSection", "Edit Section")}: {meta.sectionKey}</h2>
        <LangTabs>
          {SUPPORTED_LOCALES.map((lng) => (
            <button
              key={lng}
              className={activeLang === lng ? "active" : ""}
              onClick={() => setActiveLang(lng)}
              type="button"
              title={LANG_LABELS[lng]}
            >
              {LANG_LABELS[lng]}
            </button>
          ))}
        </LangTabs>
        <Field>
          <label>{t("label", "Label")}</label>
          <input
            value={label[activeLang] ?? ""}
            onChange={e => setLabel(l => ({ ...l, [activeLang]: e.target.value }))}
            placeholder={`Label (${LANG_LABELS[activeLang]})`}
          />
        </Field>
        <Field>
          <label>{t("description", "Description")}</label>
          <textarea
            value={description[activeLang] ?? ""}
            onChange={e => setDescription(d => ({ ...d, [activeLang]: e.target.value }))}
            placeholder={`Description (${LANG_LABELS[activeLang]})`}
            rows={3}
          />
        </Field>
        <Field>
          <label>{t("enabled", "Enabled")}</label>
          <input
            type="checkbox"
            checked={!!enabled}
            onChange={e => setEnabled(e.target.checked)}
          />
        </Field>
        <Field>
          <label>{t("order", "Order")}</label>
          <input
            type="number"
            value={order ?? 1}
            onChange={e => setOrder(Number(e.target.value))}
            min={1}
            max={999}
          />
        </Field>
        <Footer>
          <Button onClick={handleSave}>
            {t("save", "Save")}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t("cancel", "Cancel")}
          </Button>
        </Footer>
      </Modal>
    </ModalBackdrop>
  );
}

const ModalBackdrop = styled.div`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.modal};
  top: 0; left: 0; right: 0; bottom: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(1.2px);
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  min-width: 330px;
  max-width: 98vw;
  width: 420px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacings.xl};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.lg};
  font-family: ${({ theme }) => theme.fonts.main};

  ${({ theme }) => theme.media.small} {
    width: 98vw;
    min-width: 0;
    padding: ${({ theme }) => theme.spacings.md};
  }
`;

const LangTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  button {
    padding: 0.3rem 0.85rem;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    transition: background 0.18s, color 0.18s, border 0.18s;
    cursor: pointer;
    &.active {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.buttonText};
      border-color: ${({ theme }) => theme.colors.primary};
      font-weight: ${({ theme }) => theme.fontWeights.bold};
    }
    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: ${({ theme }) => theme.spacings.md};

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 2px;
  }

  input[type="checkbox"] {
    width: 18px; height: 18px;
    accent-color: ${({ theme }) => theme.colors.primary};
    margin-top: 5px;
  }

  input:not([type="checkbox"]), textarea {
    border-radius: ${({ theme }) => theme.radii.sm};
    border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
    padding: ${({ theme }) => theme.spacings.sm};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    transition: border 0.18s;
    &:focus {
      border-color: ${({ theme }) => theme.colors.inputBorderFocus};
      outline: 1.5px solid ${({ theme }) => theme.colors.inputOutline};
    }
  }
  textarea {
    min-height: 60px;
    resize: vertical;
  }
`;

const Footer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.sm};

  button {
    min-width: 100px;
  }

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacings.xs};
    button { width: 100%; }
  }
`;


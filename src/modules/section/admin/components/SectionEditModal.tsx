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
        <h2>{t("editSection", "Edit Section")}: {meta.key}</h2>
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
  position: fixed; z-index: 1111; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32); display: flex; align-items: center; justify-content: center;
`;
const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  min-width: 420px;
  max-width: 96vw;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 2rem;
  position: relative;
`;
const LangTabs = styled.div`
  display: flex; gap: 0.5rem; margin-bottom: 0.8rem;
  button {
    padding: 0.3rem 0.7rem;
    border-radius: 6px;
    background: #faf7f9;
    border: none;
    font-size: 0.97em;
    &.active { background: ${({ theme }) => theme.colors.primary}; color: #fff; }
    cursor: pointer;
  }
`;
const Field = styled.div`
  display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem;
  label { font-size: 0.98em; font-weight: 500; }
  input[type="checkbox"] { width: 18px; height: 18px; }
  input, textarea { border-radius: 7px; border: 1px solid #eee; padding: 0.5rem; }
`;
const Footer = styled.div`
  display: flex; gap: 1rem; justify-content: flex-end;
`;

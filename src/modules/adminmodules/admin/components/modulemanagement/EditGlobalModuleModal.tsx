"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { updateModuleMeta } from "@/modules/adminmodules/slices/moduleMetaSlice";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { IModuleMeta } from "@/modules/adminmodules/types";
import type { TranslatedLabel } from "@/types/common";

// --- Props tipi ---
interface EditGlobalModuleModalProps {
  module: IModuleMeta;
  onClose: () => void;
  onAfterAction?: () => void;
}

interface FormState {
  label: TranslatedLabel;
  icon: string;
  roles: string;
  enabled: boolean;
  order: number;
}

const EditGlobalModuleModal: React.FC<EditGlobalModuleModalProps> = ({
  module,
  onClose,
  onAfterAction,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("adminModules");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // label’ı her dilde başlat (TranslatedLabel garantili)
  const safeLabel: TranslatedLabel = SUPPORTED_LOCALES.reduce(
    (acc, l) => ({ ...acc, [l]: module.label?.[l] ?? "" }),
    {} as TranslatedLabel
  );

  const [form, setForm] = useState<FormState>({
    label: safeLabel,
    icon: module.icon || "box",
    roles: Array.isArray(module.roles) ? module.roles.join(", ") : "",
    enabled: !!module.enabled,
    order: typeof module.order === "number" ? module.order : 0,
  });

  useEffect(() => {
    setForm({
      label: SUPPORTED_LOCALES.reduce(
        (acc, l) => ({ ...acc, [l]: module.label?.[l] ?? "" }),
        {} as TranslatedLabel
      ),
      icon: module.icon || "box",
      roles: Array.isArray(module.roles) ? module.roles.join(", ") : "",
      enabled: !!module.enabled,
      order: typeof module.order === "number" ? module.order : 0,
    });
  }, [module]);

  // Çoklu dil label handler
  const handleLabelChange = (l: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      label: { ...prev.label, [l]: value },
    }));
  };

  // Diğer input handlerlar
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

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // roles string’ini array’e çevir
      const rolesArray = form.roles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      // Sadece güncellenebilir alanlar:
      const metaUpdate: Partial<IModuleMeta> = {
        label: form.label,
        icon: form.icon,
        roles: rolesArray,
        enabled: form.enabled,
        order: form.order,
      };

      await dispatch(
        updateModuleMeta({
          name: module.name,
          updates: metaUpdate,
        })
      ).unwrap();

      onAfterAction?.();
      onClose();
    } catch (err: any) {
      alert(
        t("updateError", "Update failed.") +
          (err?.message ? `: ${err.message}` : "")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>{t("editTitle", "Edit Module")}</Title>
          <CloseButton onClick={onClose} aria-label={t("close", "Close")}>
            <XCircle size={22} />
          </CloseButton>
        </Header>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Çoklu dil label alanı */}
          {SUPPORTED_LOCALES.map((l) => (
            <InputGroup key={l}>
              <label htmlFor={`label-${l}`}>{l.toUpperCase()}</label>
              <input
                id={`label-${l}`}
                value={form.label[l]}
                onChange={(e) => handleLabelChange(l, e.target.value)}
                placeholder={t(
                  `labelPlaceholder.${l}`,
                  "Module name in this language"
                )}
                autoComplete="off"
                required={l === "en" || l === "de"} // ihtiyaca göre zorunlu
              />
            </InputGroup>
          ))}

          <InputGroup>
            <label>{t("icon", "Icon")}</label>
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
              placeholder={t("iconPlaceholder", "Icon")}
              autoComplete="off"
            />
          </InputGroup>

          <InputGroup>
            <label>{t("roles", "Roles (comma separated)")}</label>
            <input
              name="roles"
              value={form.roles}
              onChange={handleChange}
              placeholder="admin, editor"
              autoComplete="off"
            />
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
            />
          </InputGroup>

          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="enabled"
                checked={!!form.enabled}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span>{t("enabled", "Enabled")}</span>
            </CheckboxLabel>
            {!form.enabled && (
              <WarnText>
                {t(
                  "globalDisabledWarn",
                  "Disabling globally will disable this module for all tenants."
                )}
              </WarnText>
            )}
          </CheckboxGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("saving", "Saving...") : t("save", "Save")}
          </SubmitButton>
        </form>
      </Modal>
    </Overlay>
  );
};

export default EditGlobalModuleModal;

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  width: 95%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.danger};
  transition: color ${({ theme }) => theme.transition.fast};
  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
  }
  input,
  select {
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.md};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
  }
`;

const CheckboxGroup = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  input[type="checkbox"] {
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

const WarnText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.8;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.sm};
  margin-top: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import styled from "styled-components";
import { XCircle, AlertTriangle } from "lucide-react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/adminmodules";
import { useAppDispatch } from "@/store/hooks";
import { updateModuleSetting } from "@/modules/adminmodules/slices/moduleSettingSlice";
import type { IModuleSetting } from "@/modules/adminmodules/types";

const SETTING_FIELDS = [
  "enabled",
  "visibleInSidebar",
  "useAnalytics",
  "showInDashboard",
  "roles",
  "order",
];

// --- Props tipi ---
interface EditTenantModuleModalProps {
  module: IModuleSetting & { name?: string };
  onClose: () => void;
  onAfterAction?: () => void;
  globalEnabled?: boolean;
}

interface FormState {
  enabled: boolean;
  visibleInSidebar: boolean;
  useAnalytics: boolean;
  showInDashboard: boolean;
  roles: string;
  order: number;
}

const EditTenantModuleModal: React.FC<EditTenantModuleModalProps> = ({
  module,
  onClose,
  onAfterAction,
  globalEnabled = true,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("adminModules", translations);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    enabled: !!module.enabled,
    visibleInSidebar: !!module.visibleInSidebar,
    useAnalytics: !!module.useAnalytics,
    showInDashboard: !!module.showInDashboard,
    roles: Array.isArray(module.roles) ? module.roles.join(", ") : "",
    order: Number.isFinite(module.order) ? Number(module.order) : 0,
  });

  useEffect(() => {
    setForm({
      enabled: !!module.enabled,
      visibleInSidebar: !!module.visibleInSidebar,
      useAnalytics: !!module.useAnalytics,
      showInDashboard: !!module.showInDashboard,
      roles: Array.isArray(module.roles) ? module.roles.join(", ") : "",
      order: Number.isFinite(module.order) ? Number(module.order) : 0,
    });
  }, [module]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Sadece modelde olan alanları güncelle
      const rolesArray =
        form.roles
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean) || [];

      const updateData: Partial<IModuleSetting> & { module: string } = {
        module: module.module || (module.name as string),
      };
      SETTING_FIELDS.forEach((key) => {
        if (key === "roles") updateData.roles = rolesArray;
        else (updateData as any)[key] = (form as any)[key];
      });

      await dispatch(updateModuleSetting(updateData)).unwrap();

      if (onAfterAction) onAfterAction();
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

  const formDisabled = !globalEnabled;

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>{t("editTitle", "Edit Tenant Setting")}</Title>
          <CloseButton onClick={onClose} aria-label={t("close", "Close")}>
            <XCircle size={22} />
          </CloseButton>
        </Header>
        {!globalEnabled && (
          <WarnBox>
            <AlertTriangle size={17} style={{ marginRight: 6 }} />
            {t(
              "globalDisabledWarn",
              "This module is globally disabled. Tenant settings are ignored."
            )}
          </WarnBox>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          <InputGroup>
            <label>{t("roles", "Roles (comma separated)")}</label>
            <input
              name="roles"
              value={form.roles}
              onChange={handleChange}
              placeholder="admin, editor"
              autoComplete="off"
              disabled={formDisabled}
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
              disabled={formDisabled}
            />
          </InputGroup>
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="enabled"
                checked={!!form.enabled}
                onChange={handleChange}
                disabled={formDisabled}
              />
              <span>{t("enabled", "Enabled")}</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="visibleInSidebar"
                checked={!!form.visibleInSidebar}
                onChange={handleChange}
                disabled={formDisabled}
              />
              <span>{t("visibleInSidebar", "Show in Sidebar")}</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="useAnalytics"
                checked={!!form.useAnalytics}
                onChange={handleChange}
                disabled={formDisabled}
              />
              <span>{t("useAnalytics", "Enable Analytics")}</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                type="checkbox"
                name="showInDashboard"
                checked={!!form.showInDashboard}
                onChange={handleChange}
                disabled={formDisabled}
              />
              <span>{t("showInDashboard", "Show on Dashboard")}</span>
            </CheckboxLabel>
          </CheckboxGroup>
          <SubmitButton type="submit" disabled={isSubmitting || formDisabled}>
            {isSubmitting ? t("saving", "Saving...") : t("save", "Save")}
          </SubmitButton>
        </form>
      </Modal>
    </Overlay>
  );
};

export default EditTenantModuleModal;

// --- Styled Components (değişmedi, kendi kodundakiyle aynı) ---
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

const WarnBox = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.warning};
  color: #fff;
  font-size: 13px;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 7px 11px;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
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

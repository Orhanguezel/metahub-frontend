"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  updateAdminModule,
  fetchAdminModules,
} from "@/modules/adminmodules/slice/adminModuleSlice";
import { AdminModule } from "@/modules/adminmodules/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { SUPPORTED_LOCALES, LANG_LABELS, SupportedLocale } from "@/types/common";
import { getCurrentLocale } from "@/utils/getCurrentLocale";

interface Props {
  module: AdminModule;
  onClose: () => void;
}

type FormState = {
  label: { [key in SupportedLocale]: string };
  icon: string;
  roles: string;
  visibleInSidebar: boolean;
  useAnalytics: boolean;
  enabled: boolean;
  showInDashboard: boolean;
  order: number;
};

const EditModuleModal: React.FC<Props> = ({ module, onClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("adminModules");
  const { selectedProject } = useAppSelector((state) => state.admin);

  // Otomatik locale ve fallback
  const lang: SupportedLocale = getCurrentLocale();

  // Eğer eski modülde bir dil eksikse otomatik tamamla
  const safeLabel = SUPPORTED_LOCALES.reduce(
    (acc, l) => ({ ...acc, [l]: module.label?.[l] ?? "" }),
    {} as { [key in SupportedLocale]: string }
  );

  const [form, setForm] = useState<FormState>({
    label: safeLabel,
    icon: module.icon || "box",
    roles: module.roles?.join(", ") || "",
    visibleInSidebar: module.visibleInSidebar ?? true,
    useAnalytics: module.useAnalytics ?? false,
    enabled: module.enabled ?? true,
    showInDashboard: module.showInDashboard ?? true,
    order: module.order ?? 0,
  });

  // Dinamik değişim
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setForm((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Çoklu dil label input
  const handleLabelChange = (l: SupportedLocale, value: string) => {
    setForm((prev) => ({
      ...prev,
      label: { ...prev.label, [l]: value },
    }));
  };

  // Hata/başarı mesajını locale ile çek
  const getMsg = (msg: any) => {
    if (!msg) return "";
    return typeof msg === "string" ? msg : msg?.[lang] || msg?.en || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        updateAdminModule({
          name: module.name,
          updates: {
            label: form.label,
            icon: form.icon,
            roles: form.roles.split(",").map((r) => r.trim()),
            visibleInSidebar: form.visibleInSidebar,
            useAnalytics: form.useAnalytics,
            enabled: form.enabled,
            showInDashboard: form.showInDashboard,
            order: form.order,
          },
        })
      ).unwrap();

      if (selectedProject) {
        await dispatch(fetchAdminModules(selectedProject));
      }
      toast.success(t("updateSuccess", "Module updated successfully."));
      onClose();
    } catch (err: any) {
      toast.error(getMsg(err?.message) || t("updateError", "Update failed."));
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

        <form onSubmit={handleSubmit}>
          {SUPPORTED_LOCALES.map((l) => (
            <InputGroup key={l}>
              <label htmlFor={`label-${l}`}>
                {LANG_LABELS[l] || l.toUpperCase()}
              </label>
              <input
                id={`label-${l}`}
                value={form.label[l]}
                onChange={(e) => handleLabelChange(l, e.target.value)}
                placeholder={t(`labelPlaceholder.${l}`, "Module name in this language")}
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
            />
          </InputGroup>

          <InputGroup>
            <label>{t("roles", "Roles (comma separated)")}</label>
            <input
              name="roles"
              value={form.roles}
              onChange={handleChange}
              placeholder="admin, editor"
            />
          </InputGroup>

          <InputGroup>
            <label>{t("order", "Order")}</label>
            <input
              type="number"
              name="order"
              value={form.order}
              onChange={handleChange}
            />
          </InputGroup>

          <CheckboxGroup>
            {[
              ["visibleInSidebar", t("visibleInSidebar", "Show in Sidebar")],
              ["useAnalytics", t("useAnalytics", "Enable Analytics")],
              ["enabled", t("enabled", "Enabled")],
              ["showInDashboard", t("showInDashboard", "Show on Dashboard")],
            ].map(([name, label]) => (
              <label key={name}>
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name as keyof FormState] as boolean}
                  onChange={handleChange}
                />
                {label}
              </label>
            ))}
          </CheckboxGroup>

          <SubmitButton type="submit">{t("save", "Save")}</SubmitButton>
        </form>
      </Modal>
    </Overlay>
  );
};

export default EditModuleModal;

// --- Styled Components --- (aynı kalabilir)
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
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  width: 95%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
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
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  input,
  select {
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.md};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
  }
`;

const CheckboxGroup = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
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

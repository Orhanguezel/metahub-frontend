"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createAdminModule,
  fetchAdminModules,
} from "@/modules/adminmodules/slice/adminModuleSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

// --- Types
interface Props {
  onClose: () => void;
}

interface FormState {
  name: string;
  icon: string;
  roles: string[];
  language: "en" | "tr" | "de";
  visibleInSidebar: boolean;
  useAnalytics: boolean;
  enabled: boolean;
  showInDashboard: boolean;
  order: number;
}

// --- Component
const CreateModuleModal: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation("adminModules");
  const dispatch = useAppDispatch();
  const { selectedProject } = useAppSelector((state) => state.admin);

  const [form, setForm] = useState<FormState>({
    name: "",
    icon: "box",
    roles: ["admin"],
    language: "en",
    visibleInSidebar: true,
    useAnalytics: false,
    enabled: true,
    showInDashboard: true,
    order: 0,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError(t("errors.nameRequired", "Module name is required."));
      return;
    }

    try {
      await dispatch(createAdminModule(form)).unwrap();
      await dispatch(fetchAdminModules(selectedProject));
      toast.success(
        t(
          "success.created",
          "Module created successfully. Check your .env file to activate it."
        )
      );
      onClose();
    } catch (err: any) {
      setError(
        err?.message || t("errors.createFailed", "Module creation failed.")
      );
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
              required
            />
          </InputGroup>

          <InputGroup>
            <label>{t("icon", "Icon")}</label>
            <input name="icon" value={form.icon} onChange={handleChange} />
          </InputGroup>

          <InputGroup>
            <label>{t("language", "Language")}</label>
            <select
              name="language"
              value={form.language}
              onChange={handleChange}
            >
              <option value="en">EN</option>
              <option value="tr">TR</option>
              <option value="de">DE</option>
            </select>
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
              {
                name: "visibleInSidebar",
                label: t("visibleInSidebar", "Show in Sidebar"),
              },
              {
                name: "useAnalytics",
                label: t("useAnalytics", "Enable Analytics"),
              },
              { name: "enabled", label: t("enabled", "Enabled") },
              {
                name: "showInDashboard",
                label: t("showInDashboard", "Show on Dashboard"),
              },
            ].map((item) => (
              <label key={item.name}>
                <input
                  type="checkbox"
                  name={item.name}
                  checked={(form as any)[item.name]}
                  onChange={handleChange}
                />
                {item.label}
              </label>
            ))}
          </CheckboxGroup>

          <SubmitButton type="submit">
            {t("createSubmit", "Create")}
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
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 500px;
  width: 95%;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
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
  padding: ${({ theme }) => theme.spacing.xs};
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
  gap: ${({ theme }) => theme.spacing.md};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  input,
  select {
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  label {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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

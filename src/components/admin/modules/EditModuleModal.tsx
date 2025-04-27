"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminModule, updateAdminModule, fetchAdminModules } from "@/store/adminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";


interface Props {
  module: AdminModule;
  onClose: () => void;
}

const EditModuleModal: React.FC<Props> = ({ module, onClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { selectedProject } = useAppSelector((state) => state.admin);

  const [form, setForm] = useState({
    label: { ...module.label },
    icon: module.icon || "box",
    roles: Array.isArray(module.roles) ? module.roles.join(", ") : "",
    visibleInSidebar: module.visibleInSidebar ?? true,
    useAnalytics: module.useAnalytics ?? false,
    enabled: module.enabled ?? true,
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLabelChange = (lang: "tr" | "en" | "de", value: string) => {
    setForm((prev) => ({
      ...prev,
      label: { ...prev.label, [lang]: value },
    }));
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
          },
        })
      ).unwrap();
  
      await dispatch(fetchAdminModules(selectedProject));
      toast.success(t("admin.modules.updateSuccess", "Modül başarıyla güncellendi!")); 
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      toast.error(t("admin.modules.updateError", "Güncelleme sırasında bir hata oluştu.")); 
    }
  };
  

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>{t("admin.modules.editTitle", "Modül Düzenle")}</Title>
          <CloseButton onClick={onClose}>
            <XCircle size={22} />
          </CloseButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <label>Label (TR)</label>
            <input
              value={form.label.tr}
              onChange={(e) => handleLabelChange("tr", e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <label>Label (EN)</label>
            <input
              value={form.label.en}
              onChange={(e) => handleLabelChange("en", e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <label>Label (DE)</label>
            <input
              value={form.label.de}
              onChange={(e) => handleLabelChange("de", e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <label>Icon</label>
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <label>Roles (virgülle ayır)</label>
            <input
              name="roles"
              value={form.roles}
              onChange={handleChange}
            />
          </InputGroup>

          <CheckboxGroup>
            <label>
              <input
                type="checkbox"
                name="visibleInSidebar"
                checked={form.visibleInSidebar}
                onChange={handleChange}
              />
              {t("admin.modules.visibleInSidebar", "Sidebar'da göster")}
            </label>

            <label>
              <input
                type="checkbox"
                name="useAnalytics"
                checked={form.useAnalytics}
                onChange={handleChange}
              />
              {t("admin.modules.useAnalytics", "Analytics aktif")}
            </label>

            <label>
              <input
                type="checkbox"
                name="enabled"
                checked={form.enabled}
                onChange={handleChange}
              />
              {t("admin.modules.enabled", "Modül aktif")}
            </label>
          </CheckboxGroup>

          <SubmitButton type="submit">
            {t("save", "Kaydet")}
          </SubmitButton>
        </form>
      </Modal>
    </Overlay>
  );
};

export default EditModuleModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  border-radius: 10px;
  width: 95%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.danger};
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  input, select {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
  }
`;

const CheckboxGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.7rem;
  margin-top: 1.5rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createAdminModule, fetchAdminModules } from "@/store/adminSlice";
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
  const { t } = useTranslation();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : type === "number"
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError(t("admin.modules.errors.nameRequired", "Modül ismi boş olamaz."));
      return;
    }

    try {
      await dispatch(createAdminModule(form)).unwrap();
      await dispatch(fetchAdminModules(selectedProject));
      toast.success(t("admin.modules.success.created", "Modül başarıyla oluşturuldu. Aktif etmek için .env dosyasını kontrol edin."));
      onClose();
    } catch (err: any) {
      setError(err?.message || t("admin.modules.errors.createFailed", "Modül oluşturulamadı."));
    }
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <CloseButton onClick={onClose}>
            <XCircle size={18} />
            {t("close", "Kapat")}
          </CloseButton>
          <ModalTitle>{t("admin.modules.create", "Yeni Modül Ekle")}</ModalTitle>
        </Header>

        {error && <ErrorText>{error}</ErrorText>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label>{t("admin.modules.name", "Modül İsmi")} *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <label>{t("admin.modules.icon", "İkon")}</label>
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <label>{t("admin.modules.language", "Dil")}</label>
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
            <label>{t("admin.modules.order", "Sıralama (Order)")}</label>
            <input
              type="number"
              name="order"
              value={form.order}
              onChange={handleChange}
            />
          </InputGroup>

          <CheckboxGroup>
            {[
              { name: "visibleInSidebar", label: t("admin.modules.visibleInSidebar", "Sidebar'da Göster") },
              { name: "useAnalytics", label: t("admin.modules.useAnalytics", "Analytics Aktif") },
              { name: "enabled", label: t("admin.modules.enabled", "Aktif") },
              { name: "showInDashboard", label: t("admin.modules.showInDashboard", "Dashboard'da Göster") },
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
            {t("admin.modules.createSubmit", "Oluştur")}
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
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  max-width: 500px;
  width: 95%;
  border-radius: 10px;
`;

const Header = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.danger};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    opacity: 0.9;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  input,
  select {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.7rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorText = styled.p`
  color: red;
  font-size: 0.9rem;
`;


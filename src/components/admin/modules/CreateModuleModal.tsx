"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createAdminModule, fetchAdminModules } from "@/store/adminSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  onClose: () => void;
}

const CreateModuleModal: React.FC<Props> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedProject } = useAppSelector((state) => state.admin);

  const [form, setForm] = useState({
    name: "",
    icon: "box",
    roles: ["admin"],
    language: "en",
    visibleInSidebar: true,
    useAnalytics: false,
    enabled: true,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
          <h3>{t("admin.modules.create", "Yeni Modül Ekle")}</h3>
        </Header>

        {error && <ErrorText>{error}</ErrorText>}

        <form onSubmit={handleSubmit}>
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

          <CheckboxGroup>
            <label>
              <input
                type="checkbox"
                name="visibleInSidebar"
                checked={form.visibleInSidebar}
                onChange={handleChange}
              />
              {t("admin.modules.visibleInSidebar", "Sidebar'da Göster")}
            </label>
            <label>
              <input
                type="checkbox"
                name="useAnalytics"
                checked={form.useAnalytics}
                onChange={handleChange}
              />
              {t("admin.modules.useAnalytics", "Analytics Aktif")}
            </label>
            <label>
              <input
                type="checkbox"
                name="enabled"
                checked={form.enabled}
                onChange={handleChange}
              />
              {t("admin.modules.enabled", "Aktif")}
            </label>
          </CheckboxGroup>

          <SubmitButton type="submit">
            {t("admin.modules.createSubmit", "Oluştur")}
          </SubmitButton>
        </form>
      </Modal>
    </Overlay>
  );
};

export default CreateModuleModal;


// ✅ Stil bileşenleri

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
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
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
  margin-top: 1rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.7rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorText = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

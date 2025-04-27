"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateUser } from "@/store/user/userCrudSlice";
import { toast } from "react-toastify";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { User } from "@/types/user";

interface Props {
  user: User;
  onClose: () => void;
}

export default function UserEditModal({ user, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateUser({ id: user._id, data: form })).unwrap();
      toast.success(t("users.edit.success"));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || t("users.edit.error"));
    }
  };

  return (
    <Overlay>
      <Modal>
        <h3>{t("users.edit.title")}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t("form.name") || "Name"}
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("form.email") || "Email"}
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={t("form.phone") || "Phone"}
          />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">{t("roles.user")}</option>
            <option value="admin">{t("roles.admin")}</option>
            <option value="moderator">{t("roles.moderator")}</option>
            <option value="staff">{t("roles.staff")}</option>
            <option value="customer">{t("roles.customer")}</option>
          </select>
          <div className="actions">
            <button type="submit">{t("actions.save")}</button>
            <button type="button" onClick={onClose} className="cancel">
              {t("actions.cancel")}
            </button>
          </div>
        </form>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.medium};

  h3 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.text};
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input,
  select {
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.text};
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .cancel {
      background: ${({ theme }) => theme.danger};
      color: white;
    }

    button:not(.cancel) {
      background: ${({ theme }) => theme.primary};
      color: white;
    }
  }
`;

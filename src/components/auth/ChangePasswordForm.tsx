"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, clearAuthMessages } from "@/store/user/authSlice";
import { RootState, AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

export default function ChangePasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("changePassword");
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAuthMessages());
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    if (error) {
      toast.error(error);
      dispatch(clearAuthMessages());
    }
  }, [successMessage, error, dispatch]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.currentPassword) errs.currentPassword = t("errors.currentRequired");
    if (!form.newPassword || form.newPassword.length < 8)
      errs.newPassword = t("errors.newLength");
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = t("errors.confirmMismatch");
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        })
      ).unwrap();
    } catch {
      toast.error(t("errors.default"));
    }
  };

  return (
    <Wrapper>
      <h2>{t("title")}</h2>
      <Form onSubmit={handleSubmit}>
        <input
          type="password"
          name="currentPassword"
          placeholder={t("placeholders.current")}
          value={form.currentPassword}
          onChange={handleChange}
        />
        {errors.currentPassword && <Error>{errors.currentPassword}</Error>}

        <input
          type="password"
          name="newPassword"
          placeholder={t("placeholders.new")}
          value={form.newPassword}
          onChange={handleChange}
        />
        {errors.newPassword && <Error>{errors.newPassword}</Error>}

        <input
          type="password"
          name="confirmPassword"
          placeholder={t("placeholders.confirm")}
          value={form.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <Error>{errors.confirmPassword}</Error>}

        <button type="submit" disabled={loading}>
          {loading ? t("loading") : t("submit")}
        </button>
      </Form>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.light};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input {
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
  }

  button {
    padding: 0.75rem;
    background-color: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
      background-color: ${({ theme }) => theme.primaryHover};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const Error = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.danger};
`;


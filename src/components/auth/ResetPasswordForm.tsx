"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "@/store/user/authSlice";
import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { toast } from "react-toastify";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation("resetPassword");
  const { loading } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.newPassword || form.newPassword.length < 8) {
      errs.newPassword = t("errors.passwordLength");
    }
    if (form.newPassword !== form.confirmPassword) {
      errs.confirmPassword = t("errors.passwordMismatch");
    }
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await dispatch(
        resetPassword({ token, newPassword: form.newPassword })
      ).unwrap();

      toast.success(result as any || t("success"));
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.message || t("errors.default"));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>{t("title")}</Title>

      <input
        type="password"
        name="newPassword"
        placeholder={t("placeholders.newPassword")}
        value={form.newPassword}
        onChange={handleChange}
      />
      {errors.newPassword && <Error>{errors.newPassword}</Error>}

      <input
        type="password"
        name="confirmPassword"
        placeholder={t("placeholders.confirmPassword")}
        value={form.confirmPassword}
        onChange={handleChange}
      />
      {errors.confirmPassword && <Error>{errors.confirmPassword}</Error>}

      <button type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </button>
    </Form>
  );
}

// 🎨 Styled
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input {
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.text};
    font-size: 1rem;
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

const Title = styled.h2`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const Error = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.danger};
`;

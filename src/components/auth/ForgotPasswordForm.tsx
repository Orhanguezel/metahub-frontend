"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearAuthMessages } from "@/store/user/authSlice";
import { AppDispatch, RootState } from "@/store";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import styled from "styled-components";

export default function ForgotPasswordForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("forgotPassword");

  const { loading, successMessage, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAuthMessages());
    }

    if (error) {
      toast.error(error);
      dispatch(clearAuthMessages());
    }
  }, [successMessage, error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorText(t("errors.invalidEmail"));
      return;
    }

    try {
      await dispatch(forgotPassword({ email })).unwrap(); // ✅ Burayı düzelttik
    } catch (err: any) {
      toast.error(err?.message || t("errors.default"));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder={t("placeholder")}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrorText("");
        }}
        autoComplete="email"
      />
      {errorText && <Error>{errorText}</Error>}

      <SubmitButton type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </SubmitButton>
    </Form>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.danger};
`;

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
      await dispatch(forgotPassword(email)).unwrap();
    } catch (err: any) {
      toast.error(err?.message || t("errors.default"));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <input
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

      <button type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </button>
    </Form>
  );
}

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
  }

  button {
    padding: 0.75rem;
    background-color: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
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

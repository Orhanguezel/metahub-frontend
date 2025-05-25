"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changePassword,
  clearAuthMessages,
} from "@/modules/users/slice/authSlice";
import { RootState, AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { AuthStep } from "@/modules/users";

interface Props {
  onNext?: (next: AuthStep) => void; // Stepper için
  onSwitch?: (next: AuthStep) => void; // Geriye dönük destek, istersen tek birini kullanabilirsin
  onAuthSuccess?: () => void; // Stepper success veya tekil kullanımda işlevsel
}
export default function ChangePasswordForm({ onNext, onSwitch, onAuthSuccess }: Props) {
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

  // Başarı veya hata durumunda davranışlar:
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAuthMessages());
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Stepper varsa ilerlet!
      if (onNext) onNext({ step: "done" });
      // Geriye dönük destek, onSwitch kullanılıyorsa
      if (onSwitch) onSwitch({ step: "done" });
      // Tekil başarı için
      if (onAuthSuccess) onAuthSuccess();
    }
    if (error) {
      toast.error(error);
      dispatch(clearAuthMessages());
    }
  }, [successMessage, error, dispatch, onNext, onSwitch, onAuthSuccess]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.currentPassword)
      errs.currentPassword = t("errors.currentRequired");
    if (!form.newPassword || form.newPassword.length < 8)
      errs.newPassword = t("errors.newLength");
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = t("errors.confirmMismatch");
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
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
      // Başarı burada değil, yukarıdaki useEffect'te handle ediliyor!
    } catch {
      toast.error(t("errors.default"));
    }
  };

  return (
    <Wrapper>
      <Title>{t("title")}</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="password"
          name="currentPassword"
          placeholder={t("placeholders.current")}
          value={form.currentPassword}
          onChange={handleChange}
        />
        {errors.currentPassword && <Error>{errors.currentPassword}</Error>}

        <Input
          type="password"
          name="newPassword"
          placeholder={t("placeholders.new")}
          value={form.newPassword}
          onChange={handleChange}
        />
        {errors.newPassword && <Error>{errors.newPassword}</Error>}

        <Input
          type="password"
          name="confirmPassword"
          placeholder={t("placeholders.confirm")}
          value={form.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <Error>{errors.confirmPassword}</Error>}

        <Button type="submit" disabled={loading}>
          {loading ? t("loading") : t("submit")}
        </Button>
      </Form>
    </Wrapper>
  );
}

// Styled-components (değişmedi)
const Wrapper = styled.div`
  width: 100%;
  max-width: 420px;
  margin: ${({ theme }) => `${theme.spacing.xl} auto`};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 600px) {
    max-width: 96vw;
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border-color 0.18s;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder || theme.colors.textSecondary};
    opacity: 0.8;
    font-style: italic;
    font-size: 97%;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryHover}
  );
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.18s, transform 0.13s;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.13),
      transparent
    );
    transition: left 0.5s ease;
    z-index: 1;
  }

  &:hover:not(:disabled), &:focus {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primaryHover},
      ${({ theme }) => theme.colors.primary}
    );
    transform: translateY(-2px) scale(1.012);
    &::before { left: 100%; }
  }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Error = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacing.xs};
  text-align: left;
  min-height: 1.2em;
`;

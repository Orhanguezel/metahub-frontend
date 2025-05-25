"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "@/modules/users/slice/authSlice";
import { AppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import zxcvbn from "zxcvbn";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import styled from "styled-components";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { AuthStepType } from "@/modules/users";
import PwStrengthBar from "./PwStrengthBar";
import RegisterInfoTooltip from "./RegisterInfoTooltip";

interface Props {
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function RegisterFormStep({ onNext }: Props) {
  const { t } = useTranslation("register");
  const dispatch = useDispatch<AppDispatch>();
  const recaptcha = useRecaptcha();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // --- Validation ---
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = t("errors.username");
    if (!form.email.trim()) errs.email = t("errors.email");
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t("errors.emailInvalid");
    if (!form.password) errs.password = t("errors.password");
    else if (form.password.length < 8) errs.password = t("errors.passwordLength");
    else if (zxcvbn(form.password).score < 2) errs.password = t("errors.weakPassword");
    if (form.password !== form.confirmPassword) errs.confirmPassword = t("errors.confirmPassword");
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
    setLoading(true);
    try {
      const recaptchaToken = await recaptcha("register");
      if (!recaptchaToken) {
        toast.error(t("errors.recaptchaFailed", "reCAPTCHA doğrulaması başarısız."));
        return;
      }
      await dispatch(
        registerUser({
          name: form.username,
          email: form.email,
          password: form.password,
          recaptchaToken,
        })
      ).unwrap();
      // Success feedback burada gösterilebilir, ama step ilerletmek yeterli
      onNext({ step: "verifyEmail", payload: { email: form.email } });
      setForm({ username: "", email: "", password: "", confirmPassword: "" }); // Optional: formu temizle
    } catch (err: any) {
      toast.error(
        err?.message || err?.response?.data?.message || t("error")
      );
    } finally {
      setLoading(false);
    }
  };

  const pwScore = zxcvbn(form.password).score;

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      {/* Username */}
      <FormGroup>
        <Label htmlFor="username">{t("username")}</Label>
        <RegisterInfoTooltip text={t("info.usernameInfo", "Gerçek adınızı veya takma adınızı giriniz.")} />
        <InputWrapper $hasError={!!errors.username}>
          <InputIcon>
            <FaUser />
          </InputIcon>
          <Input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t("placeholders.username")}
            disabled={loading}
            autoFocus
          />
        </InputWrapper>
        {errors.username && <ErrorText>{errors.username}</ErrorText>}
      </FormGroup>

      {/* Email */}
      <FormGroup>
        <Label htmlFor="email">{t("email")}</Label>
        <RegisterInfoTooltip text={t("info.emailInfo", "Aktif bir e-posta giriniz.")} />
        <InputWrapper $hasError={!!errors.email}>
          <InputIcon>
            <FaEnvelope />
          </InputIcon>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("placeholders.email")}
            disabled={loading}
            autoComplete="email"
          />
        </InputWrapper>
        {errors.email && <ErrorText>{errors.email}</ErrorText>}
      </FormGroup>

      {/* Password */}
      <FormGroup>
        <Label htmlFor="password">{t("password")}</Label>
        <InputWrapper $hasError={!!errors.password}>
          <InputIcon>
            <FaLock />
          </InputIcon>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder={t("placeholders.password")}
            disabled={loading}
            autoComplete="new-password"
          />
          <TogglePassword
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </TogglePassword>
        </InputWrapper>
        <PwStrengthBar score={pwScore} />
        {errors.password && <ErrorText>{errors.password}</ErrorText>}
      </FormGroup>

      {/* Confirm Password */}
      <FormGroup>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <InputWrapper $hasError={!!errors.confirmPassword}>
          <InputIcon>
            <FaLock />
          </InputIcon>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder={t("placeholders.confirmPassword")}
            disabled={loading}
            autoComplete="new-password"
          />
          <TogglePassword
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? t("hidePassword") : t("showPassword")}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </TogglePassword>
        </InputWrapper>
        {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
      </FormGroup>

      {/* Terms */}
      <Terms>
        {t("agree")} <Link href="/terms">{t("terms")}</Link> {t("and")} <Link href="/privacy">{t("privacy")}</Link>.
      </Terms>

      {/* Submit */}
      <SubmitButton type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </SubmitButton>
    </Form>
  );
}

// --- Styled Components ---
const Form = styled.form`
  width: 100%;
  max-width: 440px;
  margin: ${({ theme }) => `${theme.spacing.xl} auto ${theme.spacing.lg} auto`};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 700px) {
    max-width: 96vw;
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const FormGroup = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.01em;
`;

const InputWrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid
    ${({ $hasError, theme }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  background: ${({ theme }) => theme.colors.inputBackground};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

const InputIcon = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.58;
  font-size: 1.1em;
  margin-right: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => `${theme.spacing.sm} 0`};
  font-size: ${({ theme }) => theme.fontSizes.base};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
    opacity: 0.8;
    font-style: italic;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
  &:focus {
    outline: none;
  }
`;

const TogglePassword = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.08em;
  display: flex;
  align-items: center;
  transition: color 0.15s;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const ErrorText = styled.div`
  margin-top: 0.2rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
  letter-spacing: 0.01em;
`;

const Terms = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin: ${({ theme }) => `${theme.spacing.md} 0`};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    &:hover, &:focus {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;

const SubmitButton = styled.button`
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
  font-weight: ${({ theme }) => theme.fontWeights.bold};
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
      rgba(255,255,255,0.18),
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
    transform: translateY(-2px) scale(1.013);
    &::before { left: 100%; }
  }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

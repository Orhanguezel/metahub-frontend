"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser, clearAuthMessages } from "@/modules/users/slice/authSlice";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";
import { AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import styled from "styled-components";
import type { AuthStep } from "@/modules/users";
import { useRouter } from "next/navigation";


interface Props {
  onNext?: (next: AuthStep) => void;
  onAuthSuccess?: () => void;
}

export default function LoginForm({ onNext, onAuthSuccess }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("login");

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // Validation
  const validate = () => {
    const errs: typeof errors = {};
    if (!form.email.trim()) errs.email = t("errors.email");
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t("errors.emailInvalid");
    if (!form.password) errs.password = t("errors.password");
    else if (form.password.length < 8) errs.password = t("errors.passwordLength");
    return errs;
  };

  // Input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const result = await dispatch(
        loginUser({ email: form.email, password: form.password })
      ).unwrap();

      if (result?.needOtp || result?.mfaRequired) {
        onNext?.({ step: "otp", payload: { email: form.email } });
        toast.info(t("otpRequired", "Güvenlik kodunuzu girin"));
        return;
      }

      await dispatch(fetchCurrentUser()).unwrap();
      toast.success(t("success", "Başarıyla giriş yaptınız!"));
      if (onAuthSuccess) onAuthSuccess();
      else onNext?.({ step: "done" });
    } catch (err: any) {
      toast.error(err?.message || t("errors.default"));
    } finally {
      setLoading(false);
      dispatch(clearAuthMessages());
    }
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      {/* Email */}
      <FormGroup>
        <label htmlFor="email">{t("email")}</label>
        <InputWrapper $hasError={!!errors.email}>
          <Icon>
            <FaEnvelope />
          </Icon>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("placeholders.email")}
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading}
          />
        </InputWrapper>
        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
      </FormGroup>

      {/* Password */}
      <FormGroup>
        <label htmlFor="password">{t("password")}</label>
        <InputWrapper $hasError={!!errors.password}>
          <Icon>
            <FaLock />
          </Icon>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("placeholders.password")}
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            disabled={loading}
          />
          <TogglePassword type="button" tabIndex={-1} onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </TogglePassword>
        </InputWrapper>
        {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
      </FormGroup>

      <FormOptions>
        <RememberMe>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={form.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">{t("remember")}</label>
        </RememberMe>
        <ActionLink
    as="button"
    type="button"
    onClick={() => router.push("/forgot-password")}
  >
    {t("forgotPassword")}
  </ActionLink>
      </FormOptions>

      <SubmitButton type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </SubmitButton>

      <AltAction>
        {t("noAccount")}{" "}
        <ActionLink
          as="button"
          type="button"
          onClick={() => onNext?.({ step: "register" })}
        >
          {t("registerNow")}
        </ActionLink>
      </AltAction>
    </Form>
  );
}

// --- Styled Components ---
const Form = styled.form`
  width: 100%;
  max-width: 440px;
  margin: ${({ theme }) => theme.spacing.xxl} auto ${({ theme }) => theme.spacing.lg} auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form};
  transition: background 0.2s, box-shadow 0.2s;
  @media (max-width: 700px) {
    padding: ${({ theme }) => theme.spacing.lg};
    max-width: 96vw;
  }
  @media (max-width: 480px) {
    margin-top: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
    letter-spacing: 0.02em;
  }
`;

const InputWrapper = styled.div<{ $hasError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  border: 1.5px solid
    ${({ $hasError, theme }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus-within {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

const Icon = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.55;
  font-size: 1.15em;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
    font-style: italic;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    opacity: 0.82;
  }
  &:focus {
    outline: none;
  }
`;

const TogglePassword = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.05em;
  display: flex;
  align-items: center;
  padding: 0 0.3em;
  transition: color 0.18s;
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const ErrorMessage = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
  letter-spacing: 0.01em;
`;

const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.xs};
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const RememberMe = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  input[type="checkbox"] {
    width: 1.1em;
    height: 1.1em;
    border: 1.5px solid ${({ theme }) => theme.colors.border};
    border-radius: 3px;
    accent-color: ${({ theme }) => theme.colors.primary};
    margin-right: 0.2em;
    cursor: pointer;
    transition: border-color 0.18s;
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
    }
  }
  label {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const ActionLink = styled.button`
  color: ${({ theme }) => theme.colors.primaryHover};
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  font: inherit;
  padding: 0;
  transition: color 0.18s;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
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

const AltAction = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.01em;
`;

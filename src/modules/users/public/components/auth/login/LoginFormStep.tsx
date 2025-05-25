"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/modules/users/slice/authSlice";
import { AppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import type { AuthStepType } from "@/modules/users";
import { toast } from "react-toastify";

interface Props {
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function LoginFormStep({ onNext }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("login");

  const [form, setForm] = useState({ email: "", password: "" });
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

  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res: any = await dispatch(loginUser(form)).unwrap();
      if (res?.mfaRequired || res?.needOtp) {
        onNext({ step: "otp", payload: { email: form.email } });
      } else {
        onNext({ step: "done" });
      }
    } catch (err: any) {
      toast.error(err?.message || t("errors.default"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      {/* Email */}
      <FormGroup>
        <Label htmlFor="email">{t("email")}</Label>
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
            autoComplete="current-password"
          />
          <TogglePassword
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </TogglePassword>
        </InputWrapper>
        {errors.password && <ErrorText>{errors.password}</ErrorText>}
      </FormGroup>

      {/* Submit */}
      <SubmitButton type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </SubmitButton>
    </Form>
  );
}

// --- Styled Components ---
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: 420px;
  margin: ${({ theme }) => `${theme.spacing.xl} auto ${theme.spacing.lg} auto`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
  transition: background 0.2s, box-shadow 0.2s;

  @media (max-width: 600px) {
    max-width: 96vw;
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.02em;
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
  font-size: 1.16em;
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
  font-size: 1.1em;
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
  transition: background 0.18s, transform 0.13s;
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.button};
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
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
    z-index: 1;
  }
  &:hover:not(:disabled) {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primaryHover},
      ${({ theme }) => theme.colors.primary}
    );
    transform: translateY(-2px) scale(1.015);
    &::before {
      left: 100%;
    }
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

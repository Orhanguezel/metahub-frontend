"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/modules/users/slice/authSlice";
import { AppDispatch } from "@/store";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import type { AuthStepType } from "@/modules/users";
import { toast } from "react-toastify";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Message,
} from "@/modules/users/styles/AccountStyles";
import {
  InputWrapper,
  InputIcon,
  TogglePassword,
} from "@/modules/users/styles/AuthStyles";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { loginTranslations } from "@/modules/users";

interface Props {
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function LoginForm({ onNext }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useI18nNamespace("login", loginTranslations);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // ---- VALIDATION
  const validate = () => {
    const errs: typeof errors = {};
    if (!form.email.trim()) errs.email = t("errors.email", "Please enter your email.");
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = t("errors.emailInvalid", "Invalid email format.");
    if (!form.password) errs.password = t("errors.password", "Please enter your password.");
    else if (form.password.length < 8)
      errs.password = t("errors.passwordLength", "Password must be at least 8 characters.");
    return errs;
  };

  // ---- INPUT CHANGE HANDLER
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  // ---- SUBMIT HANDLER
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
      // Eğer MFA/OTP gerekiyorsa step'i değiştir
      if (res?.mfaRequired || res?.needOtp) {
        onNext({ step: "otp", payload: { email: form.email } });
      } else {
        onNext({ step: "done" });
      }
    } catch (err: any) {
      toast.error(
        typeof err?.message === "string"
          ? err.message
          : t("errors.default", "Login failed!")
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- RENDER
  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      {/* Email */}
      <FormGroup>
        <Label htmlFor="email">{t("email", "Email")}</Label>
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
            placeholder={t("placeholders.email", "Email")}
            disabled={loading}
            autoComplete="email"
          />
        </InputWrapper>
        {errors.email && <Message $error>{errors.email}</Message>}
      </FormGroup>

      {/* Password */}
      <FormGroup>
        <Label htmlFor="password">{t("password", "Password")}</Label>
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
            placeholder={t("placeholders.password", "Password")}
            disabled={loading}
            autoComplete="current-password"
          />
          <TogglePassword
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword", "Hide password") : t("showPassword", "Show password")}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </TogglePassword>
        </InputWrapper>
        {errors.password && <Message $error>{errors.password}</Message>}
      </FormGroup>

      <Button type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? t("loading", "Logging in...") : t("submit", "Login")}
      </Button>
    </Form>
  );
}

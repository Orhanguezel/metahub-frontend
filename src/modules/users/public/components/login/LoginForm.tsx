"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser, clearAuthMessages } from "@/modules/users/slice/authSlice";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";
import { AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import type { AuthStep } from "@/modules/users";
import {
  Form,
  Title,
  InputGroup,
  Input,
  Button,
  Message,
} from "@/modules/users/styles/AccountStyles";
import {
  InputIconWrapper,
  Icon,
  TogglePassword,
  OptionsRow,
  RememberMe,
  ActionLink,
  AltAction,
} from "@/modules/users/styles/AuthStyles";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {loginTranslations} from "@/modules/users";

interface Props {
  onNext?: (next: AuthStep) => void;
  onAuthSuccess?: () => void;
}

export default function LoginForm({ onNext, onAuthSuccess }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useI18nNamespace("login", loginTranslations);

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  // Validation
  const validate = () => {
    const errs: typeof errors = {};
    if (!form.email.trim()) errs.email = t("errors.email");
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = t("errors.emailInvalid");
    if (!form.password) errs.password = t("errors.password");
    else if (form.password.length < 8)
      errs.password = t("errors.passwordLength");
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
        toast.info(t("otpRequired"));
        return;
      }

      await dispatch(fetchCurrentUser()).unwrap();
      toast.success(t("success"));
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
      <Title>{t("form.title", "Giriş Yap")}</Title>

      {/* Email */}
      <InputGroup>
        <label htmlFor="email">{t("email")}</label>
        <InputIconWrapper $hasError={!!errors.email}>
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
            $hasError={!!errors.email}
          />
        </InputIconWrapper>
        {errors.email && <Message $error>{errors.email}</Message>}
      </InputGroup>

      {/* Password */}
      <InputGroup>
        <label htmlFor="password">{t("password")}</label>
        <InputIconWrapper $hasError={!!errors.password}>
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
            $hasError={!!errors.password}
          />
          <TogglePassword
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </TogglePassword>
        </InputIconWrapper>
        {errors.password && <Message $error>{errors.password}</Message>}
      </InputGroup>

      <OptionsRow>
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
      </OptionsRow>

      <Button
        type="submit"
        disabled={loading}
        style={{ width: "100%", marginTop: 16 }}
      >
        {loading ? t("loading") : t("submit")}
      </Button>

      <AltAction>
        {t("noAccount")}{" "}
        <ActionLink
          as="button"
          type="button"
          onClick={() => router.push("/register")} 
        >
          {t("registerNow")}
        </ActionLink>
      </AltAction>
    </Form>
  );
}

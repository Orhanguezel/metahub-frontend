"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthMessages } from "@/modules/users/slice/authSlice";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";
import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import {
  Form,
  FormGroup,
  InputWrapper,
  Input,
  TogglePassword,
  Icon,
  ErrorMessage,
  FormOptions,
  RememberMe,
  ForgotPassword,
  SubmitButton,
  AltAction,
} from "./LoginForm.styled";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation("login");

  const settings = useSelector((state: RootState) => state.setting.settings);

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

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.email.trim()) {
      errs.email = t("errors.email");
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = t("errors.emailInvalid");
    }

    if (!form.password) {
      errs.password = t("errors.password");
    } else if (form.password.length < 8) {
      errs.password = t("errors.passwordLength");
    }

    return errs;
  };

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

    try {
      setLoading(true);
      await dispatch(
        loginUser({ email: form.email, password: form.password })
      ).unwrap();
      const userRes = await dispatch(fetchCurrentUser()).unwrap();

      toast.success(t("success"));

      // ✅ Admin mi ve API Key var mı kontrol et
      const apiKeySetting = settings.find((s) => s.key === "api_key");
      const apiKey = apiKeySetting?.value;
      const isAdmin = userRes?.role === "admin";

      if (isAdmin && apiKey) {
        toast.info(`✅ Admin API key yüklendi: ${apiKey}`);
      }

      router.push("/admin");
    } catch (err: any) {
      toast.error(err?.message || t("errors.default"));
    } finally {
      setLoading(false);
      dispatch(clearAuthMessages());
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
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
          <TogglePassword
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
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
        <ForgotPassword href="/forgot-password">
          {t("forgotPassword")}
        </ForgotPassword>
      </FormOptions>
      <SubmitButton type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </SubmitButton>
      <AltAction>
        {t("noAccount")} <Link href="/register">{t("registerNow")}</Link>
      </AltAction>
    </Form>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  clearAuthMessages,
} from "@/modules/users/slice/authSlice";
import { RootState, AppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import Link from "next/link";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import zxcvbn from "zxcvbn";
import { PwStrengthBar } from "@/modules/users";
import type { AuthStep } from "@/modules/users";

import {
  
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Message as ErrorText,
} from "@/modules/users/styles/AccountStyles";

import {
  InputWrapper,
  InputIcon,
  TogglePassword,
  Terms,
  AltAction,

} from "@/modules/users/styles/AuthStyles";

interface Props {
  onSwitch?: (next: AuthStep) => void;
  onAuthSuccess?: () => void;
}

export default function RegisterForm({ onSwitch, onAuthSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation("register");
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const recaptcha = useRecaptcha();

  // Password strength score (0-4)
  const pwScore = form.password ? zxcvbn(form.password).score : 0;

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAuthMessages());
      if (onSwitch) {
        onSwitch({ step: "verifyEmail", payload: { email: form.email } });
      } else if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        router.push("/login");
      }
    }
  }, [successMessage, dispatch, router, onAuthSuccess, onSwitch, form.email]);

  useEffect(() => {
    if (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : (error as any)?.message ||
            JSON.stringify(error) ||
            t("errors.error");
      toast.error(errorMsg);
      dispatch(clearAuthMessages());
    }
  }, [error, dispatch, t]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = t("errors.username");
    if (!form.email.trim()) errs.email = t("errors.email");
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = t("errors.emailInvalid");
    if (!form.password) errs.password = t("errors.password");
    else if (form.password.length < 8)
      errs.password = t("errors.passwordLength");
    else if (zxcvbn(form.password).score < 2)
      errs.password = t("errors.weakPassword");
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = t("errors.confirmPassword");
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const recaptchaToken = await recaptcha("register");
      if (!recaptchaToken) {
        toast.error(
          t("errors.recaptchaFailed", "reCAPTCHA validation failed.")
        );
        return;
      }
      const payload = {
        name: form.username,
        email: form.email,
        password: form.password,
        recaptchaToken,
      };
      await dispatch(registerUser(payload)).unwrap();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          (typeof err === "string" ? err : JSON.stringify(err)) ||
          t("errors.error")
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      {/* Username */}
      <FormGroup>
        <Label htmlFor="username">{t("username")}</Label>
        <InputWrapper $hasError={!!errors.username}>
          <InputIcon>
            <FaUser />
          </InputIcon>
          <Input
            id="username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t("placeholders.username")}
            autoFocus
            disabled={loading}
          />
        </InputWrapper>
        {errors.username && <ErrorText>{errors.username}</ErrorText>}
      </FormGroup>

      {/* Email */}
      <FormGroup>
        <Label htmlFor="email">{t("email")}</Label>
        <InputWrapper $hasError={!!errors.email}>
          <InputIcon>
            <FaEnvelope />
          </InputIcon>
          <Input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("placeholders.email")}
            autoComplete="email"
            disabled={loading}
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
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("placeholders.password")}
            autoComplete="new-password"
            disabled={loading}
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
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder={t("placeholders.confirmPassword")}
            autoComplete="new-password"
            disabled={loading}
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
        {errors.confirmPassword && (
          <ErrorText>{errors.confirmPassword}</ErrorText>
        )}
      </FormGroup>

      {/* Terms */}
      <Terms>
        {t("agree")} <Link href="/terms">{t("terms")}</Link> {t("and")}{" "}
        <Link href="/privacy">{t("privacy")}</Link>.
      </Terms>

      {/* Submit */}
      <Button type="submit" disabled={loading}>
        {loading ? t("loading") : t("submit")}
      </Button>

      {/* Alt Action */}
      <AltAction>
        <p>
          {t("haveAccount")} <Link href="/login">{t("loginNow")}</Link>
        </p>
      </AltAction>
    </Form>
  );
}

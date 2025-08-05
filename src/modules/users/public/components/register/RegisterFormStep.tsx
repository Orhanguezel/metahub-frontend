"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "@/modules/users/slice/authSlice";
import { AppDispatch } from "@/store";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {registerTranslations} from "@/modules/users";
import { toast } from "react-toastify";
import zxcvbn from "zxcvbn";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import Link from "next/link";
import { AuthStepType } from "@/modules/users";
import PwStrengthBar from "./PwStrengthBar";
import RegisterInfoTooltip from "./RegisterInfoTooltip";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Message as ErrorText,
} from "@/modules/users/styles/AccountStyles";
import {
  InputIconWrapper,
  InputIcon,
  TogglePassword,
  Terms,
} from "@/modules/users/styles/AuthStyles";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

interface Props {
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function RegisterFormStep({ onNext }: Props) {
  const { t } = useI18nNamespace("register", registerTranslations);
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
        toast.error(
          t("errors.recaptchaFailed", "reCAPTCHA doğrulaması başarısız.")
        );
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
      onNext({ step: "verifyEmail", payload: { email: form.email } });
      setForm({ username: "", email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.message || t("error"));
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
        <RegisterInfoTooltip
          text={t(
            "info.usernameInfo"
          )}
        />
        <InputIconWrapper $hasError={!!errors.username}>
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
        </InputIconWrapper>
        {errors.username && <ErrorText $error>{errors.username}</ErrorText>}
      </FormGroup>

      {/* Email */}
      <FormGroup>
        <Label htmlFor="email">{t("email")}</Label>
        <RegisterInfoTooltip
          text={t("info.emailInfo", "Aktif bir e-posta giriniz.")}
        />
        <InputIconWrapper $hasError={!!errors.email}>
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
        </InputIconWrapper>
        {errors.email && <ErrorText $error>{errors.email}</ErrorText>}
      </FormGroup>

      {/* Password */}
      <FormGroup>
        <Label htmlFor="password">{t("password")}</Label>
        <InputIconWrapper $hasError={!!errors.password}>
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
        </InputIconWrapper>
        <PwStrengthBar score={pwScore} />
        {errors.password && <ErrorText $error>{errors.password}</ErrorText>}
      </FormGroup>

      {/* Confirm Password */}
      <FormGroup>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <InputIconWrapper $hasError={!!errors.confirmPassword}>
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
        </InputIconWrapper>
        {errors.confirmPassword && (
          <ErrorText $error>{errors.confirmPassword}</ErrorText>
        )}
      </FormGroup>

      {/* Terms */}
      <Terms>
        {t("agree")} <Link href="/terms">{t("terms")}</Link> {t("and")}{" "}
        <Link href="/privacy-policy">{t("privacy")}</Link>.
      </Terms>

      <Button type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? t("loading") : t("submit")}
      </Button>
    </Form>
  );
}


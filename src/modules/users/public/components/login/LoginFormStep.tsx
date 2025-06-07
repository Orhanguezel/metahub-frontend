"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/modules/users/slice/authSlice";
import { AppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
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
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = t("errors.emailInvalid");
    if (!form.password) errs.password = t("errors.password");
    else if (form.password.length < 8)
      errs.password = t("errors.passwordLength");
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
        {errors.email && <Message $error>{errors.email}</Message>}
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
        {errors.password && <Message $error>{errors.password}</Message>}
      </FormGroup>

      {/* Submit */}
      <Button type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? t("loading") : t("submit")}
      </Button>
    </Form>
  );
}

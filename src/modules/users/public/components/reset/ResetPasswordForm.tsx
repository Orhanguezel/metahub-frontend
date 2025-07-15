"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetPassword,
  clearAuthMessages,
} from "@/modules/users/slice/authSlice";
import { RootState, AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {resetTranslations} from "@/modules/users";
import { AuthStep } from "@/modules/users";
import {
  Wrapper,
  Title,
  Form,
  Input,
  Button,
  Message, 
} from "@/modules/users/styles/AccountStyles";

interface Props {
  token: string;
  onNext: (next: AuthStep) => void;
}

export default function ResetPasswordForm({ token, onNext }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useI18nNamespace("resetPassword", resetTranslations);
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAuthMessages());
      setForm({ newPassword: "", confirmPassword: "" });
      onNext({ step: "done" });
    }
    if (error) {
      toast.error(error);
      dispatch(clearAuthMessages());
    }
  }, [successMessage, error, dispatch, onNext]);

  const validate = () => {
    const errs: Record<string, string> = {};
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
        resetPassword({
          token,
          newPassword: form.newPassword,
        })
      ).unwrap();
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
          name="newPassword"
          placeholder={t("placeholders.new")}
          value={form.newPassword}
          onChange={handleChange}
          $hasError={!!errors.newPassword}
        />
        {errors.newPassword && <Message $error>{errors.newPassword}</Message>}

        <Input
          type="password"
          name="confirmPassword"
          placeholder={t("placeholders.confirm")}
          value={form.confirmPassword}
          onChange={handleChange}
          $hasError={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <Message $error>{errors.confirmPassword}</Message>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? t("loading") : t("submit")}
        </Button>
      </Form>
    </Wrapper>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  clearAuthMessages,
} from "@/modules/users/slice/authSlice";
import { RootState, AppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
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
  onNext: (next: AuthStep) => void;
}

export default function ForgotPasswordForm({ onNext }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("forgotPassword");
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAuthMessages());
      onNext({ step: "done" });
    }
    if (error) {
      toast.error(error);
      dispatch(clearAuthMessages());
    }
  }, [successMessage, error, dispatch, onNext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setFormError(t("errors.email"));
      return;
    }
    setFormError(null);
    dispatch(forgotPassword({ email }));
  };

  return (
    <Wrapper>
      <Title>{t("title", "Şifremi Unuttum")}</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          placeholder={t("placeholders.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          $hasError={!!formError}
        />
        {formError && <Message $error>{formError}</Message>}
        <Button type="submit" disabled={loading}>
          {loading ? t("loading") : t("submit")}
        </Button>
      </Form>
    </Wrapper>
  );
}

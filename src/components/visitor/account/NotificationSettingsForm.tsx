"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import { updateNotificationSettings } from "@/store/user/accountSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { Account } from "@/store/user/accountSlice"; // Profile tipi burada

// Yup şeması
const schema = yup.object({
  emailNotifications: yup.boolean().required(),
  smsNotifications: yup.boolean().required(),
});

type NotificationFormData = yup.InferType<typeof schema>;

interface Props {
  profile: Account | null;
}

const NotificationSettingsForm = ({ profile }: Props) => {
  const { t } = useTranslation("account");
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NotificationFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  useEffect(() => {
    if (profile?.notifications) {
      reset({
        emailNotifications: profile.notifications.emailNotifications ?? true,
        smsNotifications: profile.notifications.smsNotifications ?? false,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: NotificationFormData) => {
    try {
      await dispatch(updateNotificationSettings(data)).unwrap();
      toast.success(t("notifications.success"));
    } catch (err: any) {
      toast.error(err?.message || t("notifications.error"));
    }
  };

  return (
    <Wrapper>
      <Title>{t("notifications.title")}</Title>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Label>
          <Checkbox type="checkbox" {...register("emailNotifications")} />
          {t("notifications.email")}
        </Label>

        <Label>
          <Checkbox type="checkbox" {...register("smsNotifications")} />
          {t("notifications.sms")}
        </Label>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("notifications.saving") : t("notifications.save")}
        </SubmitButton>
      </Form>
    </Wrapper>
  );
};

export default NotificationSettingsForm;

// 🎨 Styled Components

const Wrapper = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: 500px;
  margin-inline: auto;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Checkbox = styled.input`
  transform: scale(1.2);
  accent-color: ${({ theme }) => theme.colors.primary}; // ✅ Renk uyumu için
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

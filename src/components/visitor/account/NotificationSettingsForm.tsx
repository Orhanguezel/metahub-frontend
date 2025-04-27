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
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h3>{t("notifications.title")}</h3>

      <Label>
        <Checkbox type="checkbox" {...register("emailNotifications")} />
        {t("notifications.email")}
      </Label>

      <Label>
        <Checkbox type="checkbox" {...register("smsNotifications")} />
        {t("notifications.sms")}
      </Label>

      <SubmitButton type="submit" disabled={isSubmitting}>
        {t("notifications.save")}
      </SubmitButton>
    </Form>
  );
};

export default NotificationSettingsForm;

const Form = styled.form`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Label = styled.label`
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  transform: scale(1.2);
`;

const SubmitButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
`;

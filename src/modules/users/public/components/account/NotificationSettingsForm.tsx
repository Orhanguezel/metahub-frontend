"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import { updateNotificationSettings,Account } from "@/modules/users/slice/accountSlice";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import {
  Form,
  Label,
  Checkbox,
  Button,
  Message,
} from "@/modules/users/styles/AccountStyles";

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
    formState: { isSubmitting, errors },
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
      <Label>
        <Checkbox type="checkbox" {...register("emailNotifications")} />
        {t("notifications.email")}
      </Label>
      {errors.emailNotifications && (
        <Message $error>{t("notifications.emailRequired")}</Message>
      )}

      <Label>
        <Checkbox type="checkbox" {...register("smsNotifications")} /> 
        {t("notifications.sms")}
      </Label>
      {errors.smsNotifications && (
        <Message $error>{t("notifications.smsRequired")}</Message>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("notifications.saving") : t("notifications.save")}
      </Button>
    </Form>
  );
};

export default NotificationSettingsForm;

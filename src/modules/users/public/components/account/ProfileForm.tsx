"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/hooks";
import { updateMyProfile } from "@/modules/users/slice/accountSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/users/locales/account";
import { toast } from "react-toastify";
import {
  Wrapper,
  Title,
  Form,
  Label,
  Input,
  Button,
  Message, // <-- tek component!
} from "@/modules/users/styles/AccountStyles";

interface Props {
  profile: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export default function ProfileForm({ profile }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("account", translations);

  const profileSchema = z.object({
    name: z.string().min(1, { message: t("form.errors.name") }),
    email: z
      .string()
      .min(1, { message: t("form.errors.email") })
      .email({ message: t("form.errors.emailInvalid") }),
    phone: z.string().optional(),
  });

  type ProfileFormData = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await dispatch(updateMyProfile(data)).unwrap();
      toast.success(t("form.success"));
    } catch (err: any) {
      toast.error(err?.message || t("form.error"));
    }
  };

  return (
    <Wrapper>
      <Title>{t("form.title")}</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Label htmlFor="name">{t("form.name")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <Message $error>{errors.name.message}</Message>}

        <Label htmlFor="email">{t("form.email")}</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <Message $error>{errors.email.message}</Message>}

        <Label htmlFor="phone">{t("form.phone")}</Label>
        <Input id="phone" {...register("phone")} />
        {errors.phone && <Message $error>{errors.phone.message}</Message>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("form.saving") : t("form.save")}
        </Button>
      </Form>
    </Wrapper>
  );
}

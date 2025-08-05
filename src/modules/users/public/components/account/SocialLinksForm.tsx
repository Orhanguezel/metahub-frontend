"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/hooks";
import { updateSocialMediaLinks } from "@/modules/users/slice/accountSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import accountTranslations from "@/modules/users/locales/account";
import { toast } from "react-toastify";
import {
  Form,
  Title,
  InputGroup,
  Label,
  Input,
  Button,
  Message, // ortak error/info/success kutusu!
} from "@/modules/users/styles/AccountStyles";

// ✅ Zod şeması (i18n key ile!)
const socialLinksSchema = z.object({
  instagram: z
    .string()
    .url({ message: "social.errors.instagramInvalid" })
    .nullable()
    .or(z.literal("")),
  facebook: z
    .string()
    .url({ message: "social.errors.facebookInvalid" })
    .nullable()
    .or(z.literal("")),
  twitter: z
    .string()
    .url({ message: "social.errors.twitterInvalid" })
    .nullable()
    .or(z.literal("")),
});

type SocialLinksFormData = z.infer<typeof socialLinksSchema>;

const SocialLinksForm: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useI18nNamespace("account", accountTranslations);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      instagram: "",
      facebook: "",
      twitter: "",
    },
  });

  useEffect(() => {
    if (profile?.socialMedia) {
      reset({
        instagram: profile.socialMedia.instagram ?? "",
        facebook: profile.socialMedia.facebook ?? "",
        twitter: profile.socialMedia.twitter ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: SocialLinksFormData) => {
    if (!profile?._id) return;

    const sanitizedData = {
      instagram: data.instagram || undefined,
      facebook: data.facebook || undefined,
      twitter: data.twitter || undefined,
    };

    try {
      await dispatch(updateSocialMediaLinks(sanitizedData)).unwrap();
      toast.success(t("social.success"));
    } catch (err: any) {
      toast.error(err?.message || t("social.error"));
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Eğer section içinde kullanıyorsan Title'ı kaldırabilirsin */}
      <Title>{t("social.title")}</Title>

      <InputGroup>
        <Label htmlFor="instagram">{t("social.instagram")}</Label>
        <Input
          id="instagram"
          {...register("instagram")}
          placeholder={t("social.instagramPlaceholder")}
          autoComplete="off"
        />
        {errors.instagram && (
          <Message $error>{t(errors.instagram.message as string)}</Message>
        )}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="facebook">{t("social.facebook")}</Label>
        <Input
          id="facebook"
          {...register("facebook")}
          placeholder={t("social.facebookPlaceholder")}
          autoComplete="off"
        />
        {errors.facebook && (
          <Message $error>{t(errors.facebook.message as string)}</Message>
        )}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="twitter">{t("social.twitter")}</Label>
        <Input
          id="twitter"
          {...register("twitter")}
          placeholder={t("social.twitterPlaceholder")}
          autoComplete="off"
        />
        {errors.twitter && <Message $error>{t(errors.twitter.message as string)}</Message>}
      </InputGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("social.saving") : t("social.save")}
      </Button>
    </Form>
  );
};

export default SocialLinksForm;

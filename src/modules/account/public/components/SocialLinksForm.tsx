"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/hooks";
import { updateSocialMediaLinks } from "@/modules/users/slice/accountSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { toast } from "react-toastify";

// ✅ Zod şeması (i18n destekli)
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
  const { t } = useTranslation("account");
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
      <Title>{t("social.title")}</Title>

      <InputGroup>
        <Label htmlFor="instagram">Instagram</Label>
        <Input
          id="instagram"
          {...register("instagram")}
          placeholder="https://instagram.com/yourprofile"
        />
        {errors.instagram && (
          <Error>{t(errors.instagram.message as string)}</Error>
        )}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="facebook">Facebook</Label>
        <Input
          id="facebook"
          {...register("facebook")}
          placeholder="https://facebook.com/yourprofile"
        />
        {errors.facebook && (
          <Error>{t(errors.facebook.message as string)}</Error>
        )}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="twitter">X / Twitter</Label>
        <Input
          id="twitter"
          {...register("twitter")}
          placeholder="https://twitter.com/yourprofile"
        />
        {errors.twitter && <Error>{t(errors.twitter.message as string)}</Error>}
      </InputGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("social.saving") : t("social.save")}
      </Button>
    </Form>
  );
};

export default SocialLinksForm;

// 🎨 Styled Components

const Form = styled.form`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.inputBackground};

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
`;

const Error = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
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

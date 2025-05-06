"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/hooks";
import { updateMyProfile } from "@/store/user/accountSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import styled from "styled-components";

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
  const { t } = useTranslation("account");

  // ✅ Zod şeması i18n ile
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
        <Label>{t("form.name")}</Label>
        <Input {...register("name")} />
        {errors.name && <Error>{errors.name.message}</Error>}

        <Label>{t("form.email")}</Label>
        <Input type="email" {...register("email")} />
        {errors.email && <Error>{errors.email.message}</Error>}

        <Label>{t("form.phone")}</Label>
        <Input {...register("phone")} />
        {errors.phone && <Error>{errors.phone.message}</Error>}

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("form.saving") : t("form.save")}
        </SubmitButton>
      </Form>
    </Wrapper>
  );
}

// 🎨 styled-components

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
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textAlt};
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
`;

const Error = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.85rem;
  margin: 0;
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

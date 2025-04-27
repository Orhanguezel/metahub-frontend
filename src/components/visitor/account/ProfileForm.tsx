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

// ✅ Zod şeması
const profileSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email.").min(1, "Email is required."),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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
    <Form onSubmit={handleSubmit(onSubmit)}>
      <label>{t("form.name")}</label>
      <input {...register("name")} />
      {errors.name && <Error>{errors.name.message}</Error>}

      <label>{t("form.email")}</label>
      <input type="email" {...register("email")} />
      {errors.email && <Error>{errors.email.message}</Error>}

      <label>{t("form.phone")}</label>
      <input {...register("phone")} />
      {errors.phone && <Error>{errors.phone.message}</Error>}

      <button type="submit" disabled={isSubmitting}>
        {t("form.save")}
      </button>
    </Form>
  );
}

// 💅 styled-components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input {
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border || "#ccc"};
  }

  button {
    padding: 0.75rem;
    background-color: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const Error = styled.p`
  color: ${({ theme }) => theme.danger || "red"};
  font-size: 0.85rem;
  margin: 0;
`;

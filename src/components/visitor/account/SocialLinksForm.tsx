"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/hooks";
import { updateSocialMediaLinks } from "@/store/user/accountSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { toast } from "react-toastify";

const socialLinksSchema = z.object({
  instagram: z.string().url("Invalid Instagram URL").nullable().or(z.literal("")),
  facebook: z.string().url("Invalid Facebook URL").nullable().or(z.literal("")),
  twitter: z.string().url("Invalid Twitter URL").nullable().or(z.literal("")),
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
      <h3>{t("social.title")}</h3>

      <InputGroup>
        <Label htmlFor="instagram">Instagram</Label>
        <Input id="instagram" {...register("instagram")} />
        {errors.instagram && <Error>{errors.instagram.message}</Error>}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="facebook">Facebook</Label>
        <Input id="facebook" {...register("facebook")} />
        {errors.facebook && <Error>{errors.facebook.message}</Error>}
      </InputGroup>

      <InputGroup>
        <Label htmlFor="twitter">X / Twitter</Label>
        <Input id="twitter" {...register("twitter")} />
        {errors.twitter && <Error>{errors.twitter.message}</Error>}
      </InputGroup>

      <Button type="submit" disabled={isSubmitting}>
        {t("social.save")}
      </Button>
    </Form>
  );
};

export default SocialLinksForm;



// --- Styled Components ---
const Form = styled.form`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: 0.3rem;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const Error = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.danger || "red"};
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
`;

"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch } from "@/store/hooks";
import { updateAddress } from "@/store/user/accountSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { toast } from "react-toastify";

// Form tipi
type AddressFormData = {
  addresses: {
    street: string;
    houseNumber: string;
    city: string;
    zipCode: string;
  }[];
};

const AddressForm: React.FC<{ profile: any }> = ({ profile }) => {
  const { t } = useTranslation("account");
  const dispatch = useAppDispatch();

  // Yup şeması i18n destekli
  const schema = yup.object({
    addresses: yup
      .array()
      .of(
        yup.object().shape({
          street: yup.string().required(t("address.errors.street")),
          houseNumber: yup.string().required(t("address.errors.houseNumber")),
          city: yup.string().required(t("address.errors.city")),
          zipCode: yup.string().required(t("address.errors.zipCode")),
        })
      )
      .min(1, t("address.errors.min"))
      .required(t("address.errors.required")),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      addresses: profile?.addresses?.length
        ? profile.addresses
        : [{ street: "", houseNumber: "", city: "", zipCode: "" }],
    },
  });

  useEffect(() => {
    if (profile?.addresses) {
      reset({
        addresses: profile.addresses,
      });
    }
  }, [profile, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      await dispatch(updateAddress(data.addresses)).unwrap();
      toast.success(t("address.success"));
    } catch (err: any) {
      toast.error(err?.message || t("address.error"));
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h3>{t("address.title")}</h3>

      {fields.map((field, index) => (
        <AddressGroup key={field.id}>
          <Input
            {...register(`addresses.${index}.street`)}
            placeholder={t("address.street")}
          />
          {errors.addresses?.[index]?.street && (
            <Error>{errors.addresses[index]?.street?.message}</Error>
          )}

          <Input
            {...register(`addresses.${index}.houseNumber`)}
            placeholder={t("address.houseNumber")}
          />
          {errors.addresses?.[index]?.houseNumber && (
            <Error>{errors.addresses[index]?.houseNumber?.message}</Error>
          )}

          <Input
            {...register(`addresses.${index}.city`)}
            placeholder={t("address.city")}
          />
          {errors.addresses?.[index]?.city && (
            <Error>{errors.addresses[index]?.city?.message}</Error>
          )}

          <Input
            {...register(`addresses.${index}.zipCode`)}
            placeholder={t("address.zipCode")}
          />
          {errors.addresses?.[index]?.zipCode && (
            <Error>{errors.addresses[index]?.zipCode?.message}</Error>
          )}

          <ButtonRow>
            <Button
              type="button"
              danger
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              {t("address.remove")}
            </Button>
          </ButtonRow>
        </AddressGroup>
      ))}

      <Button
        type="button"
        onClick={() =>
          append({ street: "", houseNumber: "", city: "", zipCode: "" })
        }
      >
        {t("address.add")}
      </Button>

      <Button type="submit" disabled={isSubmitting}>
        {t("address.save")}
      </Button>
    </Form>
  );
};

export default AddressForm;


const Form = styled.form`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AddressGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.backgroundSecondary || "#f9f9f9"};
  border-radius: 8px;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border || "#ccc"};
  width: 100%;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "danger",
})<{ danger?: boolean }>`
  padding: 0.65rem 1.2rem;
  background: ${({ danger, theme }) => (danger ? "red" : theme.primary)};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Error = styled.p`
  color: ${({ theme }) => theme.danger || "red"};
  font-size: 0.85rem;
  margin: 0;
`;

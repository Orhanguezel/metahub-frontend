"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store/hooks";
import { updatePayment } from "@/store/user/accountSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

interface Props {
  profile: {
    _id: string;
    payment?: {
      cardNumber?: string;
      expiry?: string;
      cvc?: string;
    };
  };
}

const PaymentForm: React.FC<Props> = ({ profile }) => {
  const { t } = useTranslation("account");
  const dispatch = useAppDispatch();

  const schema = yup.object().shape({
    cardNumber: yup
      .string()
      .required(t("payment.errors.cardNumber"))
      .matches(/^\d{16}$/, t("payment.errors.cardNumberFormat")),
    expiry: yup
      .string()
      .required(t("payment.errors.expiry"))
      .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, t("payment.errors.expiryFormat")),
    cvc: yup
      .string()
      .required(t("payment.errors.cvc"))
      .matches(/^\d{3,4}$/, t("payment.errors.cvcFormat")),
  });

  type PaymentFormData = yup.InferType<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PaymentFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      cardNumber: profile?.payment?.cardNumber ?? "",
      expiry: profile?.payment?.expiry ?? "",
      cvc: profile?.payment?.cvc ?? "",
    },
  });

  useEffect(() => {
    if (profile?.payment) {
      reset(profile.payment);
    }
  }, [profile, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await dispatch(updatePayment(data)).unwrap();
      toast.success(t("payment.success"));
    } catch (err: any) {
      toast.error(err?.message || t("payment.error"));
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h3>{t("payment.title")}</h3>

      <Input
        {...register("cardNumber")}
        placeholder={t("payment.cardNumber")}
      />
      {errors.cardNumber && <Error>{errors.cardNumber.message}</Error>}

      <Input {...register("expiry")} placeholder={t("payment.expiry")} />
      {errors.expiry && <Error>{errors.expiry.message}</Error>}

      <Input {...register("cvc")} placeholder={t("payment.cvc")} />
      {errors.cvc && <Error>{errors.cvc.message}</Error>}

      <Button type="submit" disabled={isSubmitting}>
        {t("payment.save")}
      </Button>
    </Form>
  );
};

export default PaymentForm;

const Form = styled.form`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
`;

const Error = styled.p`
  color: ${({ theme }) => theme.danger || "red"};
  font-size: 0.85rem;
  margin: 0;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


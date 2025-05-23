"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/modules/users/slice/addressSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { toast } from "react-toastify";

type AddressFormData = {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
};

const AddressForm: React.FC = () => {
  const { t } = useTranslation("account");
  const dispatch = useAppDispatch();
  const { addresses } = useAppSelector((state) => state.address);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const schema = yup.object({
    street: yup.string().required(t("address.errors.street")),
    houseNumber: yup.string().required(t("address.errors.houseNumber")),
    city: yup.string().required(t("address.errors.city")),
    zipCode: yup.string().required(t("address.errors.zipCode")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      street: "",
      houseNumber: "",
      city: "",
      zipCode: "",
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      await dispatch(createAddress(data)).unwrap();
      toast.success(t("address.success"));
      reset();
    } catch (err: any) {
      toast.error(err?.message || t("address.error"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteAddress(id)).unwrap();
      toast.success(t("address.deleted"));
    } catch (err: any) {
      toast.error(err?.message || t("address.error"));
    }
  };

  return (
    <Wrapper>
      <Title>{t("address.title")}</Title>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input {...register("street")} placeholder={t("address.street")} />
        {errors.street && <Error>{errors.street.message}</Error>}

        <Input
          {...register("houseNumber")}
          placeholder={t("address.houseNumber")}
        />
        {errors.houseNumber && <Error>{errors.houseNumber.message}</Error>}

        <Input {...register("city")} placeholder={t("address.city")} />
        {errors.city && <Error>{errors.city.message}</Error>}

        <Input {...register("zipCode")} placeholder={t("address.zipCode")} />
        {errors.zipCode && <Error>{errors.zipCode.message}</Error>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("address.saving") : t("address.add")}
        </Button>
      </Form>

      <AddressList>
        {addresses.map((address) => (
          <AddressItem key={address._id}>
            <p>
              {address.street}, {address.houseNumber}, {address.city}{" "}
              {address.zipCode}
            </p>
            <ButtonRow>
              <SmallButton
                onClick={() => {
                  reset({
                    street: address.street,
                    houseNumber: address.houseNumber,
                    city: address.city,
                    zipCode: address.zipCode,
                  });
                  dispatch(
                    updateAddress({
                      id: address._id!,
                      data: {
                        street: address.street,
                        houseNumber: address.houseNumber,
                        city: address.city,
                        zipCode: address.zipCode,
                      },
                    })
                  );
                }}
              >
                {t("address.update")}
              </SmallButton>
              <SmallButton $danger onClick={() => handleDelete(address._id!)}>
                {t("address.remove")}
              </SmallButton>
            </ButtonRow>
          </AddressItem>
        ))}
      </AddressList>
    </Wrapper>
  );
};

export default AddressForm;

// 🎨 Styled Components

const Wrapper = styled.div`
  margin-top: 2rem;
`;

const Title = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AddressList = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AddressItem = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Error = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.85rem;
  margin: 0;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const SmallButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => prop !== "$danger",
})<{ $danger?: boolean }>`
  padding: 0.4rem 0.8rem;
  background: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger : theme.colors.primary};
`;

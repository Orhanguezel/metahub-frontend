"use client";

import React, { useEffect, useState } from "react";
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
import {
  Wrapper,
  Title,
  Form,
  Input,
  Button,
  Message,
  AddressList,
  AddressItem,
} from "@/modules/users/styles/AccountStyles";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";


type AddressFormData = {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  country: string;
};

const schema = (t: any) =>
  yup.object({
    street: yup.string().required(t("address.errors.street")),
    houseNumber: yup.string().required(t("address.errors.houseNumber")),
    city: yup.string().required(t("address.errors.city")),
    zipCode: yup.string().required(t("address.errors.zipCode")),
    phone: yup.string().required(t("address.errors.phone")),
    email: yup
      .string()
      .email(t("address.errors.email_format"))
      .required(t("address.errors.email")),
    country: yup.string().required(t("address.errors.country")),
  });

const AddressForm: React.FC = () => {
  const { t } = useTranslation("account");
  const dispatch = useAppDispatch();
  const { addresses } = useAppSelector((state) => state.address);

  // Hangi adres düzenleniyor? (update için)
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: yupResolver(schema(t)),
    defaultValues: {
      street: "",
      houseNumber: "",
      city: "",
      zipCode: "",
      phone: "",
      email: "",
      country: "",
    },
  });

  // Yeni adres ekleme veya güncelleme işlemi
  const onSubmit = async (data: AddressFormData) => {
    try {
      if (editId) {
        await dispatch(updateAddress({ id: editId, data })).unwrap();
        toast.success(t("address.updated"));
      } else {
        await dispatch(createAddress(data)).unwrap();
        toast.success(t("address.success"));
      }
      reset();
      setEditId(null);
    } catch (err: any) {
      toast.error(err?.message || t("address.error"));
    }
  };

  const handleEdit = (address: any) => {
    setEditId(address._id);
    // Formu doldur
    setValue("street", address.street);
    setValue("houseNumber", address.houseNumber);
    setValue("city", address.city);
    setValue("zipCode", address.zipCode);
    setValue("phone", address.phone);
    setValue("email", address.email);
    setValue("country", address.country || "");
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteAddress(id)).unwrap();
      toast.success(t("address.deleted"));
      if (editId === id) {
        reset();
        setEditId(null);
      }
    } catch (err: any) {
      toast.error(err?.message || t("address.error"));
    }
  };

  return (
    <Wrapper>
      <Title>{t("address.title")}</Title>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input {...register("street")} placeholder={t("address.street")} />
        {errors.street && <Message $error>{errors.street.message}</Message>}

        <Input
          {...register("houseNumber")}
          placeholder={t("address.houseNumber")}
        />
        {errors.houseNumber && (
          <Message $error>{errors.houseNumber.message}</Message>
        )}

        <Input {...register("city")} placeholder={t("address.city")} />
        {errors.city && <Message $error>{errors.city.message}</Message>}

        <Input {...register("zipCode")} placeholder={t("address.zipCode")} />
        {errors.zipCode && <Message $error>{errors.zipCode.message}</Message>}

        <Input {...register("phone")} placeholder={t("address.phone")} />
        {errors.phone && <Message $error>{errors.phone.message}</Message>}

        <Input {...register("email")} placeholder={t("address.email")} />
        {errors.email && <Message $error>{errors.email.message}</Message>}

        <Input {...register("country")} placeholder={t("address.country")} />
        {errors.country && <Message $error>{errors.country.message}</Message>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("address.saving")
            : editId
            ? t("address.update")
            : t("address.add")}
        </Button>
        {editId && (
          <Button
            type="button"
            style={{ marginLeft: 8 }}
            onClick={() => {
              setEditId(null);
              reset();
            }}
          >
            {t("address.cancel")}
          </Button>
        )}
      </Form>

      <AddressList>
        {addresses.map((address) => (
          <AddressItem key={address._id}>
            <p>
              {address.street}, {address.houseNumber}, {address.city}{" "}
              {address.zipCode}
              <br />
              {address.phone} • {address.email} • {address.country}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button type="button" onClick={() => handleEdit(address)}>
                {t("address.edit")}
              </Button>
              <Button
                $danger
                type="button"
                onClick={() => handleDelete(address._id!)}
              >
                {t("address.remove")}
              </Button>
            </div>
          </AddressItem>
        ))}
      </AddressList>
    </Wrapper>
  );
};

export default AddressForm;

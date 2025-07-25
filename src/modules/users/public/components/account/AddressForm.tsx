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
  Input,
  Button,
  Message,
  AddressList,
  AddressItem,
} from "@/modules/users/styles/AccountStyles";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { accountTranslations } from "@/modules/users";
import { toast } from "react-toastify";
import styled from "styled-components";


const DivForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// --- Props ekleme ---
type AddressFormData = {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  country: string;
};
type Address = AddressFormData & {
  _id?: string;
  isDefault?: boolean;
  [key: string]: any;
};

interface AddressFormProps {
  // Company veya başka bir context için dışarıdan state ile
  addresses?: Address[];
  setAddresses?: (addresses: Address[]) => void;
  loading?: boolean;
  parentType?: "user" | "company" | string;
  parentId?: string;
}

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

const EMPTY: AddressFormData = {
  street: "",
  houseNumber: "",
  city: "",
  zipCode: "",
  phone: "",
  email: "",
  country: "",
};

const AddressForm: React.FC<AddressFormProps> = ({
  addresses: externalAddresses,
  setAddresses: setExternalAddresses,
  loading: externalLoading,
  parentType = "user",
}) => {
  const { t } = useI18nNamespace("account", accountTranslations);
  const dispatch = useAppDispatch();
  const { addresses: reduxAddresses } = useAppSelector((state) => state.address);
  const reduxLoading = useAppSelector((state) => state.address.loading);

  // State: dışarıdan mı yoksa slice'tan mı?
  const isUser = parentType === "user";
  const [addresses, setAddresses] = useState<Address[]>(externalAddresses ?? []);
  const loading = externalLoading ?? reduxLoading;

  // Slice’tan al (user context)
  useEffect(() => {
    if (isUser) dispatch(fetchAddresses());
  }, [dispatch, isUser]);

  useEffect(() => {
    if (isUser) setAddresses(reduxAddresses);
    else if (externalAddresses) setAddresses(externalAddresses);
  }, [reduxAddresses, externalAddresses, isUser]);

  // Parent'a (company gibi) güncelleme callback'i
  useEffect(() => {
    if (setExternalAddresses) setExternalAddresses(addresses);
  }, [addresses, setExternalAddresses]);

  // --- Edit state
  const [editId, setEditId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: yupResolver(schema(t)),
    defaultValues: EMPTY,
  });

  // Yeni adres ekle veya güncelle
  const onSubmit = async (data: AddressFormData) => {
    try {
      if (editId) {
        if (isUser) {
          await dispatch(updateAddress({ id: editId, data })).unwrap();
        } else {
          setAddresses(addresses.map((a) => (a._id === editId ? { ...a, ...data } : a)));
        }
        toast.success(t("address.updated"));
      } else {
        if (isUser) {
          await dispatch(createAddress(data)).unwrap();
        } else {
          setAddresses([...addresses, { ...data, _id: `${Date.now()}` }]);
        }
        toast.success(t("address.success"));
      }
      reset();
      setEditId(null);
    } catch (err: any) {
      toast.error(err?.message || t("address.error"));
    }
  };

  // Edit butonu
  const handleEdit = (address: Address) => {
    setEditId(address._id ?? null);
    Object.keys(EMPTY).forEach((key) =>
      setValue(key as keyof AddressFormData, address[key] || "")
    );
  };

  // Silme
  const handleDelete = async (id: string) => {
    try {
      if (isUser) {
        await dispatch(deleteAddress(id)).unwrap();
      } else {
        setAddresses(addresses.filter((a) => a._id !== id));
      }
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
    <DivForm>
      <Input {...register("street")} placeholder={t("address.street")} />
      {errors.street && <Message $error>{errors.street.message}</Message>}

      <Input {...register("houseNumber")} placeholder={t("address.houseNumber")} />
      {errors.houseNumber && <Message $error>{errors.houseNumber.message}</Message>}

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

      <Button
        type="button"
        disabled={isSubmitting || loading}
        onClick={handleSubmit(onSubmit)}
      >
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
    </DivForm>

    <AddressList>
      {addresses.map((address) => (
        <AddressItem key={address._id}>
          <p>
            {address.street}, {address.houseNumber}, {address.city} {address.zipCode}
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
}

export default AddressForm;
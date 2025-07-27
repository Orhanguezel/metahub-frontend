import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
  Select,
} from "@/modules/users/styles/AccountStyles";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { accountTranslations } from "@/modules/users";
import { toast } from "react-toastify";
import styled from "styled-components";
import { ADDRESS_TYPE_OPTIONS, Address, AddressType } from "@/modules/users/types/address";

const DivForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export interface AddressFormData {
  addressType: AddressType;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormProps {
  addresses?: Address[];
  setAddresses?: (addresses: Address[]) => void;
  loading?: boolean;
  parentType?: "user" | "company" | string;
  parentId?: string;
}

const schema = (t: any) =>
  yup.object({
    addressType: yup.mixed<AddressType>().oneOf(ADDRESS_TYPE_OPTIONS).required(t("address.errors.addressType")),
    street: yup.string().required(t("address.errors.street")),
    houseNumber: yup.string().required(t("address.errors.houseNumber")),
    city: yup.string().required(t("address.errors.city")),
    zipCode: yup.string().required(t("address.errors.zipCode")),
    phone: yup.string().required(t("address.errors.phone")),
    email: yup.string().email(t("address.errors.email_format")).required(t("address.errors.email")),
    country: yup.string().required(t("address.errors.country")),
    isDefault: yup.boolean().optional().default(false), // <-- BURADA!
  }).required();


const EMPTY: AddressFormData = {
  addressType: "home",
  street: "",
  houseNumber: "",
  city: "",
  zipCode: "",
  phone: "",
  email: "",
  country: "",
  isDefault: false, // <-- EKLE!
};


const AddressForm: React.FC<AddressFormProps> = ({
  addresses: externalAddresses,
  setAddresses: setExternalAddresses,
  loading: externalLoading,
  parentType = "user",
  parentId,
}) => {
  const { t } = useI18nNamespace("account", accountTranslations);
  const dispatch = useAppDispatch();
  const { addresses: reduxAddresses } = useAppSelector((state) => state.address);
  const reduxLoading = useAppSelector((state) => state.address.loading);

  const isUser = parentType === "user";
  const [addresses, setAddresses] = useState<Address[]>(externalAddresses ?? []);
  const loading = externalLoading ?? reduxLoading;
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (isUser) dispatch(fetchAddresses());
  }, [dispatch, isUser]);

  useEffect(() => {
    if (isUser) setAddresses(reduxAddresses);
    else if (externalAddresses) setAddresses(externalAddresses);
  }, [reduxAddresses, externalAddresses, isUser]);

  useEffect(() => {
    if (setExternalAddresses) setExternalAddresses(addresses);
  }, [addresses, setExternalAddresses]);

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

  const onSubmit: SubmitHandler<AddressFormData> = async (data) => {
    const sendData: Omit<Address, "_id" | "createdAt" | "updatedAt"> = {
      ...data,
      postalCode: data.zipCode,
      ...(parentType === "company" && parentId ? { companyId: parentId } : {}),
      ...(parentType === "user" && parentId ? { userId: parentId } : {}),
    };

    try {
      if (editId) {
        if (isUser) {
          await dispatch(updateAddress({ id: editId, data: sendData })).unwrap();
        } else {
          setAddresses(addresses.map((a) => (a._id === editId ? { ...a, ...data } : a)));
        }
        toast.success(t("address.updated"));
      } else {
        if (isUser) {
          await dispatch(createAddress(sendData)).unwrap();
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

  const handleEdit = (address: Address) => {
    setEditId(address._id ?? null);
    (Object.keys(EMPTY) as Array<keyof AddressFormData>).forEach((key) =>
      setValue(key, address[key] ?? "")
    );
  };

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <DivForm>
          <Select {...register("addressType")}>
            {ADDRESS_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {t(`address.type.${type}`)}
              </option>
            ))}
          </Select>
          {errors.addressType && <Message $error>{errors.addressType.message}</Message>}

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
            type="submit"
            disabled={isSubmitting || loading}
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
      </form>

      <AddressList>
        {addresses.map((address) => (
          <AddressItem key={address._id}>
            <p>
              <b>{t(`address.type.${address.addressType}`)}:</b>{" "}
              {address.street}, {address.houseNumber}, {address.city} {address.zipCode || address.postalCode}
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

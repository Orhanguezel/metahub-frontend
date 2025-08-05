import React, { useEffect, useState, useMemo } from "react";
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
  Select,
} from "@/modules/users/styles/AccountStyles";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/users/locales/account";
import { toast } from "react-toastify";
import styled from "styled-components";
import { ADDRESS_TYPE_OPTIONS, Address, AddressType } from "@/modules/users/types/address";
import { ADDRESS_FIELDS_BY_COUNTRY } from "@/utils/addressFieldsByCountry";
import { CountryCode } from "@/types/common";
import CountrySelector from "./CountrySelector";

// Dinamik Field Tipi
type AddressFormData = {
  addressType: AddressType;
  countryCode: CountryCode;
  [key: string]: any;
};

const DivForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface AddressFormProps {
  addresses?: Address[];
  setAddresses?: (addresses: Address[]) => void;
  loading?: boolean;
  parentType?: "user" | "company" | "customer";
  parentId?: string;
  onChanged?: () => void;
  renderAsForm?: boolean; // 🔥 Artık tek prop bu!
}

const getDefaultCountryCode = (): CountryCode => {
  // Browser locale'dan veya kullanıcı tercihinden çekebilirsin
  return "TR";
};

const AddressForm: React.FC<AddressFormProps> = ({
  addresses: propAddresses,
  loading: propLoading,
  parentType = "user",
  parentId,
  onChanged,
  renderAsForm = true, // default: true
}) => {
  const { t } = useI18nNamespace("account", translations);
  const dispatch = useAppDispatch();
  const addressState = useAppSelector((state) => state.address);
  const reduxAddresses = addressState.addresses;
  const reduxLoading = addressState.loading;
  const addresses = propAddresses !== undefined ? propAddresses : reduxAddresses;
  const loading = propLoading !== undefined ? propLoading : reduxLoading;

  // --- Dinamik ülke seçimi ---
  const [countryCode, setCountryCode] = useState<CountryCode>(getDefaultCountryCode());

  // --- Dynamic validation schema (yup)
  const schema = useMemo(() => {
    const fields = ADDRESS_FIELDS_BY_COUNTRY[countryCode];
    const shape: any = {
      addressType: yup
        .mixed<AddressType>()
        .oneOf(ADDRESS_TYPE_OPTIONS)
        .required(t("address.errors.addressType", "Adres tipi seçilmelidir.")),
    };
    fields.forEach((field) => {
      let y = yup.string();
      if (field.required) y = y.required(t(`address.errors.${field.name}`, { defaultMessage: `${field.label} alanı zorunludur.` }));
      shape[field.name] = y;
    });
    return yup.object(shape).required();
  }, [countryCode, t]);

  const EMPTY: AddressFormData = useMemo(() => {
    const base: any = {
      addressType: "home",
      countryCode,
    };
    ADDRESS_FIELDS_BY_COUNTRY[countryCode].forEach((f) => (base[f.name] = ""));
    return base;
  }, [countryCode]);

  // --- React Hook Form ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: EMPTY,
  });

  // --- İlk yüklemede ve parentId değişince fetch ---
  useEffect(() => {
    if (parentType === "company" && parentId) {
      dispatch(fetchAddresses({ companyId: parentId }));
    } else if (parentType === "customer" && parentId) {
      dispatch(fetchAddresses({ customerId: parentId }));
    } else if (parentType === "user" && parentId) {
      dispatch(fetchAddresses({ userId: parentId }));
    } else if (parentType === "user") {
      dispatch(fetchAddresses({}));
    }
  }, [dispatch, parentType, parentId]);

  // --- Ülke değişince formu resetle ---
  useEffect(() => {
    reset(EMPTY);
    // eslint-disable-next-line
  }, [countryCode]);

  const [editId, setEditId] = useState<string | null>(null);

  const triggerOnChanged = () => {
    if (typeof onChanged === "function") onChanged();
  };

  // --- SUBMIT HANDLER ---
  const onSubmit = handleSubmit(async (data) => {
    const sendData: any = {
      ...data,
      country: countryCode,
      postalCode: data.postalCode || data.zipCode, // mapping!
    };
    delete sendData.countryCode;

    // ✅ Dinamik parentType desteği!
    if (parentType === "company" && parentId) sendData.companyId = parentId;
    else if (parentType === "customer" && parentId) sendData.customerId = parentId;
    else if (parentType === "user" && parentId) sendData.userId = parentId;

    try {
      if (editId) {
        await dispatch(updateAddress({ id: editId, data: sendData })).unwrap();
        toast.success(t("address.updated"));
      } else {
        await dispatch(createAddress(sendData)).unwrap();
        toast.success(t("address.success"));
      }
      // Listeyi güncelle
      if (parentType === "company" && parentId) {
        dispatch(fetchAddresses({ companyId: parentId }));
      } else if (parentType === "customer" && parentId) {
        dispatch(fetchAddresses({ customerId: parentId }));
      } else if (parentType === "user" && parentId) {
        dispatch(fetchAddresses({ userId: parentId }));
      } else if (parentType === "user") {
        dispatch(fetchAddresses({}));
      }
      triggerOnChanged();
      reset(EMPTY);
      setEditId(null);
    } catch (err: any) {
      toast.error(err?.message || t("address.error", { defaultMessage: "An error occurred while saving the address." }));
    }
  });

  // --- Edit handler ---
  const handleEdit = (address: Address) => {
    setEditId(address._id ?? null);
    setCountryCode((address.country as CountryCode) || getDefaultCountryCode());
    const data: any = {
      addressType: address.addressType,
      countryCode: (address.country as CountryCode) || getDefaultCountryCode(),
    };
    ADDRESS_FIELDS_BY_COUNTRY[countryCode].forEach((f) => {
      data[f.name] = address[f.name] ?? "";
    });
    reset(data);
  };

  // --- Delete handler ---
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteAddress(id)).unwrap();
      // Listeyi güncelle
      if (parentType === "company" && parentId) {
        dispatch(fetchAddresses({ companyId: parentId }));
      } else if (parentType === "customer" && parentId) {
        dispatch(fetchAddresses({ customerId: parentId }));
      } else if (parentType === "user" && parentId) {
        dispatch(fetchAddresses({ userId: parentId }));
      } else if (parentType === "user") {
        dispatch(fetchAddresses({}));
      }
      triggerOnChanged();
      toast.success(t("address.deleted", { defaultMessage: "Address deleted successfully." }));
      if (editId === id) {
        reset(EMPTY);
        setEditId(null);
      }
    } catch (err: any) {
      toast.error(err?.message || t("address.error", { defaultMessage: "An error occurred while deleting the address." }));
    }
  };

  function getErrorMessage(err: any): string | undefined {
    if (!err) return undefined;
    if (typeof err === "string") return err;
    if (typeof err.message === "string") return err.message;
    return undefined;
  }

  // --- Render ---
  const Content = (
    <DivForm>
      {/* Ülke seçici */}
      <CountrySelector value={countryCode} onChange={setCountryCode} />

      {/* Adres tipi */}
      <Select {...register("addressType")}>
        {ADDRESS_TYPE_OPTIONS.map((type) => (
          <option key={type} value={type}>
            {t(`address.type.${type}`)}
          </option>
        ))}
      </Select>
      {getErrorMessage(errors.addressType) && (
        <Message $error>{getErrorMessage(errors.addressType)}</Message>
      )}

      {/* Dinamik alanlar */}
      {ADDRESS_FIELDS_BY_COUNTRY[countryCode].map((field) => (
        <React.Fragment key={field.name}>
          <Input
            {...register(field.name)}
            placeholder={t(`address.${field.name}`, { defaultMessage: field.label }) || field.label}
            autoComplete="off"
          />
          {errors[field.name] && (
            <Message $error>
              {errors[field.name]?.message?.toString() || ""}
            </Message>
          )}
        </React.Fragment>
      ))}

      <Button
        type={renderAsForm ? "submit" : "button"}
        disabled={isSubmitting || loading}
        onClick={!renderAsForm ? onSubmit : undefined}
      >
        {isSubmitting
          ? t("address.saving", { defaultMessage: "Saving..." })
          : editId
          ? t("address.update", { defaultMessage: "Update Address" })
          : t("address.add", { defaultMessage: "Add Address" })}
      </Button>
      {editId && (
        <Button
          type="button"
          style={{ marginLeft: 8 }}
          onClick={() => {
            setEditId(null);
            reset(EMPTY);
          }}
        >
          {t("address.cancel", { defaultMessage: "Cancel" })}
        </Button>
      )}
    </DivForm>
  );

  return (
    <Wrapper>
      <Title>{t("address.title", { defaultMessage: "Address Management" })}</Title>
      {renderAsForm ? <form onSubmit={onSubmit}>{Content}</form> : Content}

      <AddressList>
        {(addresses ?? []).map((address) => (
          <AddressItem key={address._id}>
            <p>
              <b>{t(`address.type.${address.addressType}`)}:</b>{" "}
              {/* Tüm field'ları sırayla göster */}
              {ADDRESS_FIELDS_BY_COUNTRY[address.country as CountryCode]?.map(f =>
                address[f.name] ? `${address[f.name]}, ` : ""
              )}
              <br />
              {address.phone} • {address.country}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button type="button" onClick={() => handleEdit(address)}>
                {t("address.edit", { defaultMessage: "Edit Address" })}
              </Button>
              <Button
                $danger
                type="button"
                onClick={() => handleDelete(address._id!)}
              >
                {t("address.remove", { defaultMessage: "Remove Address" })}
              </Button>
            </div>
          </AddressItem>
        ))}
      </AddressList>
    </Wrapper>
  );
};

export default AddressForm;

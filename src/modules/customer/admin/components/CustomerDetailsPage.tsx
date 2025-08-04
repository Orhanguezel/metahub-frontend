"use client";
import { useCallback } from "react";
import { AddressForm } from "@/modules/users";
import { ICustomer } from "@/modules/customer/types";
import styled from "styled-components";
import { CustomerInfoCard } from "@/modules/customer";
import { useAppDispatch } from "@/store/hooks";
import { fetchCustomerById } from "@/modules/customer/slice/customerSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

interface Props {
  customer: ICustomer;
  onAddressChanged?: () => void;
}

export default function CustomerDetailsPage({ customer, onAddressChanged }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("customer", translations);

  // Sadece ilgili customer'ı güncelle!
  const handleAddressesChanged = useCallback(async () => {
    if (customer._id) {
      await dispatch(fetchCustomerById(customer._id));
    }
    if (onAddressChanged) onAddressChanged();
  }, [dispatch, customer._id, onAddressChanged]);

  if (!customer?._id)
    return <p>{t("notFound", "Customer record not found.")}</p>;

  return (
    <DetailsContainer>
      <CustomerInfoCard customer={customer} />
      <SectionTitle>{t("addresses.title", "Addresses")}</SectionTitle>
      <AddressForm
        parentType="customer"
        parentId={customer._id}
        addresses={customer.addresses?.filter(a => typeof a === "object" && a !== null)}
        onChanged={handleAddressesChanged}
        renderAsForm={true}
      />
    </DetailsContainer>
  );
}

const DetailsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.lg};
`;
const SectionTitle = styled.h2`
  margin: 24px 0 16px;
  font-size: 1.3em;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: bold;
`;

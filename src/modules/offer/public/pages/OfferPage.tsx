"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCustomerById } from "@/modules/customer/slice/customerSlice";
import { AddressForm } from "@/modules/users"; // Adres formunun doğru import path'i
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales"; // offer modulüne ait
import styled from "styled-components";
import type { ICustomer } from "@/modules/customer/types";

export default function OfferPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, i18n } = useI18nNamespace("offer", translations);

  // Query string'den customerId ve offerId al (offerId ileride kullanılabilir)
  const customerId = params.get("customerId") || "";
  const offerId = params.get("offerId") || "";

  const dispatch = useAppDispatch();
  const customer = useAppSelector((s) => s.customer.selected);

  // Adres başarıyla eklenirse state
  const [addressCreated, setAddressCreated] = useState(false);

  // Customer bilgilerini yükle
  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
    }
  }, [customerId, dispatch]);

  // Eğer müşteri bulunmuyorsa
  if (!customer) {
    return (
      <Wrapper>
        {t("loadingCustomer", "Müşteri bilgileri yükleniyor...")}
      </Wrapper>
    );
  }

  // Eğer adres başarıyla eklendiyse teşekkür mesajı göster
  if (addressCreated) {
    return (
      <Wrapper>
        <Title>{t("address.addedSuccess", "Adres başarıyla eklendi!")}</Title>
        <p>{t("address.thankYou", "Teklif talebiniz alınmıştır. Size en kısa sürede ulaşacağız.")}</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Title>{t("completeAddressTitle", "Teklifi Tamamlamak İçin Adres Bilgisi Girin")}</Title>

      <OfferSummary>
        <SectionTitle>{t("summary.title", "Teklif Özeti")}</SectionTitle>
        <InfoRow>
          <strong>{t("companyName", "Firma Adı")}:</strong>
          <span>
            {typeof customer.companyName === "string"
              ? customer.companyName
              : customer.companyName[i18n.language?.slice(0, 2)] || Object.values(customer.companyName)[0]}
          </span>
        </InfoRow>
        <InfoRow>
          <strong>{t("contactName", "Yetkili")}:</strong>
          <span>{customer.contactName}</span>
        </InfoRow>
        <InfoRow>
          <strong>{t("email", "E-Posta")}:</strong>
          <span>{customer.email}</span>
        </InfoRow>
        <InfoRow>
          <strong>{t("phone", "Telefon")}:</strong>
          <span>{customer.phone}</span>
        </InfoRow>
        {/* İleride teklif detayları/ürün de burada gösterilebilir */}
      </OfferSummary>

      <SectionTitle>{t("addressFormTitle", "Adres Bilgisi")}</SectionTitle>
      <AddressForm
        parentType="customer"
        parentId={customerId}
        addresses={customer.addresses?.filter(a => typeof a === "object" && a !== null)}
        renderAsForm={true}
        onChanged={() => setAddressCreated(true)}
        loading={false}
      />
    </Wrapper>
  );
}

// --- Styled Components ---
const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem 1rem;
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Title = styled.h1`
  font-size: 2.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.7rem;
  text-align: center;
`;
const OfferSummary = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 12px #23233215;
  padding: 1.7em 1.1em;
  margin-bottom: 2.5em;
  width: 100%;
`;
const SectionTitle = styled.h3`
  font-size: 1.17em;
  font-weight: 700;
  margin-bottom: 0.55em;
`;
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.45em;
  font-size: 1.04em;
  strong { font-weight: 600; color: ${({ theme }) => theme.colors.textPrimary}; }
  span { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

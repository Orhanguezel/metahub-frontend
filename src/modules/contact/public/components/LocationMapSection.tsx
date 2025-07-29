"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppSelector } from "@/store/hooks";
import type { Address } from "@/modules/users/types/address";

// TYPE GUARD
function isAddress(addr: any): addr is Address {
  return typeof addr === "object" && addr !== null && "addressLine" in addr;
}

export default function LocationMapSection() {
  const { t } = useI18nNamespace("contact", translations);
  const company = useAppSelector((state) => state.company.company);

  const addresses: Address[] =
    Array.isArray(company?.addresses)
      ? company.addresses.filter(isAddress)
      : [];

  // Helper: Adresin Google Maps arama linki
  const getMapUrl = (addr: Address) => {
    const parts = [
      addr.addressLine,
      addr.street,
      addr.houseNumber,
      addr.district,
      addr.city,
      addr.province,
      addr.postalCode,
      addr.country,
    ]
      .filter(Boolean)
      .join(", ");
    const encoded = encodeURIComponent(parts || "Berlin");
    return `https://maps.google.com/maps?q=${encoded}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  if (!addresses.length) {
    return (
      <MapSection>
        <MapTitle>{t("location.title", "Our Location")}</MapTitle>
        <MapWrapper>
          <iframe
            src="https://maps.google.com/maps?q=Berlin&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="260"
            loading="lazy"
            style={{ border: 0, borderRadius: 8 }}
            title="Default Location Map"
          />
        </MapWrapper>
      </MapSection>
    );
  }

  return (
    <MapSection>
      <MapTitle>{t("location.title", "Our Location")}</MapTitle>
      <AddressList>
        {addresses.map((addr, idx) => (
          <AddressCard key={addr._id || idx}>
            <AddrType>
              {t(`addressType.${addr.addressType}`, addr.addressType)}
            </AddrType>
            <AddrLine>
              {addr.addressLine}
              {addr.city && `, ${addr.city}`}
              {addr.country && `, ${addr.country}`}
            </AddrLine>
            <MapWrapper>
              <iframe
                src={getMapUrl(addr)}
                width="100%"
                height="220"
                loading="lazy"
                style={{ border: 0, borderRadius: 8, minHeight: 180 }}
                title={`Map ${idx + 1}`}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </MapWrapper>
          </AddressCard>
        ))}
      </AddressList>
    </MapSection>
  );
}

// --- Styled Components ---
const MapSection = styled.section`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 24px 14px;
  border-radius: 12px;
  margin-top: 18px;
`;

const MapTitle = styled.h3`
  margin-bottom: 14px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 1.18rem;
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  ${({ theme }) => theme.media.small} {
    gap: 20px;
  }
`;

const AddressCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: 16px 14px 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const AddrType = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2px;
  text-transform: capitalize;
`;

const AddrLine = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const MapWrapper = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  min-height: 180px;
  background: ${({ theme }) => theme.colors.skeletonBackground};
`;

import styled from "styled-components";
import type { ICustomer } from "@/modules/customer/types";
import type { Address } from "@/modules/users/types/address";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { SupportedLocale } from "@/types/common";
import translations from "../../locales";

function getTranslatedLabel(val: any, lang: SupportedLocale, fallback = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object" && typeof val[lang] === "string") return val[lang];
  const first = Object.values(val)[0];
  if (typeof first === "string") return first;
  return fallback;
}

function isAddressObject(addr: string | Address): addr is Address {
  return typeof addr === "object" && addr !== null && "addressLine" in addr;
}

export default function CustomerInfoCard({ customer }: { customer: ICustomer | null }) {
  const { i18n, t } = useI18nNamespace("customer", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;
  if (!customer) return null;

  const populatedAddresses = (customer.addresses ?? []).filter(isAddressObject);
  const addressObj = populatedAddresses.find(a => a.isDefault) || populatedAddresses[0];

  const addressStr = addressObj
    ? [
        addressObj.addressLine,
        addressObj.street,
        addressObj.houseNumber,
        addressObj.city,
        addressObj.province,
        addressObj.district,
        addressObj.postalCode,
        addressObj.country,
      ].filter(Boolean).join(", ")
    : "-";

  return (
    <Card>
      <InfoBlock>
        <CustomerName>
          {getTranslatedLabel(customer.companyName, lang, t("companyName", "Company Name"))}
        </CustomerName>
        <Contact>
          <strong>{t("contactName", "Contact")}:</strong>{" "}
          {getTranslatedLabel(customer.contactName, lang, "-")}
        </Contact>
        <Contact>
          <strong>{t("email", "E-Mail")}:</strong> {customer.email || "-"}
        </Contact>
        <Contact>
          <strong>{t("phone", "Phone")}:</strong> {customer.phone || "-"}
        </Contact>
        <Contact>
          <strong>{t("address", "Address")}:</strong> {addressStr}
        </Contact>
        {addressObj?.phone && (
          <Contact>
            <strong>{t("addressPhone", "Address Phone")}:</strong> {addressObj.phone}
          </Contact>
        )}
        <Contact>
          <strong>{t("isActive", "Status")}:</strong>{" "}
          <Status $active={customer.isActive}>
            {customer.isActive
              ? t("active", "Active")
              : t("inactive", "Inactive")}
          </Status>
        </Contact>
        {customer.notes && (
          <Notes>
            <strong>{t("notes", "Notes")}:</strong> {customer.notes}
          </Notes>
        )}
      </InfoBlock>
    </Card>
  );
}


// --- Styled Components (değişmedi) ---
const Card = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 440px;
  margin: 0 auto;

  ${({ theme }) => theme.media.small} {
    max-width: 100%;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

const InfoBlock = styled.div`
  flex: 1;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.small} {
    text-align: left;
    margin-bottom: 0;
    margin-right: ${({ theme }) => theme.spacings.xl};
  }
`;

const CustomerName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Contact = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacings.xs} 0;
  word-break: break-all;
`;

const Status = styled.span<{ $active?: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? theme.colors.success : theme.colors.danger};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Notes = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.info};
  margin: ${({ theme }) => theme.spacings.sm} 0 0;
  font-style: italic;
`;

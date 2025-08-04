"use client";
import React from "react";
import styled from "styled-components";
import { translations } from "@/modules/offer";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import type { Offer } from "@/modules/offer/types";
import { getMultiLang, type SupportedLocale } from "@/types/common";
import { OfferStatusDropdown } from "@/modules/offer";

// CUSTOMER companyName/contactName gösterimi (string/obj farkı ve fallback'lı)
function getCustomerCompany(val: any, lang: SupportedLocale, fallback = "-") {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val.companyName === "object")
    return getMultiLang(val.companyName, lang) || fallback;
  if (typeof val.companyName === "string") return val.companyName;
  return fallback;
}
function getCustomerContact(val: any, lang: SupportedLocale, fallback = "-") {
  if (!val) return fallback;
  if (typeof val === "string") return fallback;
  if (typeof val.contactName === "object")
    return getMultiLang(val.contactName, lang) || fallback;
  if (typeof val.contactName === "string") return val.contactName;
  return fallback;
}

interface Props {
  offer: Offer | null;
  onClose: () => void;
  onDelete?: () => void;
  onGeneratePdf?: () => void;
  loading?: boolean;
}

const OfferDetailModal: React.FC<Props> = ({
  offer,
  onClose,
  onDelete,
  onGeneratePdf,
  loading,
}) => {
  const { t, i18n } = useI18nNamespace("offer", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  if (!offer) return null;

  // Customer ve Company populate edildiğinde obje, aksi halde string id!
  const customer = typeof offer.customer === "object" && offer.customer ? offer.customer : null;
  //const company = typeof offer.company === "object" && offer.company ? offer.company : null;

  return (
    <ModalOverlay>
      <ModalBox>
        <Header>
          <h2>
            {t("offerNumber", "Offer #")} {offer.offerNumber}
          </h2>
          <CloseBtn onClick={onClose}>&times;</CloseBtn>
        </Header>

        <FlexRow>
          <div>
            <Label>{t("createdAt", "Created At")}</Label>
            <Value>
              {offer.createdAt
                ? new Date(offer.createdAt).toLocaleString(lang)
                : "-"}
            </Value>
            <Label>{t("status", "Status")}</Label>
            <OfferStatusDropdown offer={offer} />
            <Label>{t("pdf", "PDF")}</Label>
            {offer.pdfUrl ? (
              <PdfLink href={offer.pdfUrl} target="_blank" rel="noopener">
                {t("download", "Download")}
              </PdfLink>
            ) : (
              <NoPdf>{t("noPdf", "Not generated")}</NoPdf>
            )}
            <Label>{t("customer", "Customer")}</Label>
            <Value>
              {customer
                ? getCustomerCompany(customer, lang) +
                  (getCustomerContact(customer, lang)
                    ? " - " + getCustomerContact(customer, lang)
                    : "")
                : typeof offer.customer === "string"
                ? offer.customer
                : "-"}
            </Value>
            <Label>{t("company", "Company")}</Label>
            {/*   <Value>
              {company
                ? company.companyName[lang] ||
                  (company.companyName as string) ||
                  "-"
                : typeof offer.company === "string"
                ? offer.company
                : "-"}
            </Value> */}
           
            <Label>{t("validUntil", "Valid Until")}</Label>
            <Value>
              {offer.validUntil
                ? new Date(offer.validUntil).toLocaleDateString(lang)
                : "-"}
            </Value>
          </div>
          <RightCol>
            <Label>{t("paymentTerms", "Payment Terms")}</Label>
            <Value>{getMultiLang(offer.paymentTerms, lang)}</Value>
            {offer.notes && (
              <>
                <Label>{t("notes", "Notes")}</Label>
                <Value>{getMultiLang(offer.notes, lang)}</Value>
              </>
            )}
            <Label>{t("items", "Items")}</Label>
            <ItemsTable>
              <thead>
                <tr>
                  <th>{t("pos", "#")}</th>
                  <th>{t("product", "Product")}</th>
                  <th>{t("qty", "Qty")}</th>
                  <th>{t("unitPrice", "Unit Price")}</th>
                  <th>{t("vat", "VAT")}</th>
                  <th>{t("total", "Total")}</th>
                </tr>
              </thead>
              <tbody>
                {offer.items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      {getMultiLang(item.productName, lang) ||
                        (item.product ?? item.ensotekprod ?? "-")}
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.unitPrice.toLocaleString(lang, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {offer.currency}
                    </td>
                    <td>{item.vat}%</td>
                    <td>
                      {item.total.toLocaleString(lang, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {offer.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ItemsTable>
            <Totals>
              <div>
                <b>{t("subtotal", "Subtotal")}: </b>
                {offer.totalNet.toLocaleString(lang, {
                  minimumFractionDigits: 2,
                })}{" "}
                {offer.currency}
              </div>
              <div>
                <b>{t("vat", "VAT")}: </b>
                {offer.totalVat.toLocaleString(lang, {
                  minimumFractionDigits: 2,
                })}{" "}
                {offer.currency}
              </div>
              {offer.shippingCost ? (
                <div>
                  <b>{t("shipping", "Shipping")}: </b>
                  {offer.shippingCost.toLocaleString(lang, {
                    minimumFractionDigits: 2,
                  })}{" "}
                  {offer.currency}
                </div>
              ) : null}
              {offer.discount ? (
                <div>
                  <b>{t("discount", "Discount")}: </b>
                  -{offer.discount.toLocaleString(lang, {
                    minimumFractionDigits: 2,
                  })}{" "}
                  {offer.currency}
                </div>
              ) : null}
              <div>
                <b>{t("totalGross", "Total")}: </b>
                {offer.totalGross.toLocaleString(lang, {
                  minimumFractionDigits: 2,
                })}{" "}
                {offer.currency}
              </div>
            </Totals>
          </RightCol>
        </FlexRow>

        {offer.revisionHistory && offer.revisionHistory.length > 0 && (
          <>
            <Label>{t("revisionHistory", "Revision History")}</Label>
            <RevisionTable>
              <thead>
                <tr>
                  <th>{t("date", "Date")}</th>
                  <th>{t("user", "By")}</th>
                  <th>{t("note", "Note")}</th>
                  <th>{t("pdf", "PDF")}</th>
                </tr>
              </thead>
              <tbody>
                {offer.revisionHistory.map((rev, i) => (
                  <tr key={i}>
                    <td>
                      {rev.updatedAt
                        ? new Date(rev.updatedAt).toLocaleString(lang)
                        : "-"}
                    </td>
                    <td>{rev.by}</td>
                    <td>{rev.note || "-"}</td>
                    <td>
                      <a
                        href={rev.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("download", "Download")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </RevisionTable>
          </>
        )}

        <ActionBar>
          {onGeneratePdf && (
            <ActionBtn onClick={onGeneratePdf} disabled={loading}>
              {t("generatePdf", "Generate PDF")}
            </ActionBtn>
          )}
          {onDelete && (
            <DeleteBtn onClick={onDelete} disabled={loading}>
              {t("delete", "Delete")}
            </DeleteBtn>
          )}
          <ActionBtn onClick={onClose}>{t("close", "Close")}</ActionBtn>
        </ActionBar>
      </ModalBox>
    </ModalOverlay>
  );
};

export default OfferDetailModal;

// --- Styled Components ---
const ModalOverlay = styled.div`
  position: fixed;
  z-index: 1100;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(28, 36, 51, 0.22);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 54px;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.card || "#fff"};
  min-width: 380px;
  max-width: 880px;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 34px rgba(25, 35, 70, 0.13);
  padding: 36px 36px 18px 36px;
  position: relative;
  animation: fadein 0.13s;
  @media (max-width: 600px) {
    min-width: unset;
    padding: 16px 7px 13px 7px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2vw;
  margin-bottom: 12px;
  h2 {
    font-size: 1.33em;
    font-weight: 700;
    margin: 0;
  }
`;

const CloseBtn = styled.button`
  border: none;
  background: none;
  font-size: 2em;
  color: ${({ theme }) => theme.colors.textSecondary || "#444"};
  font-weight: 600;
  cursor: pointer;
  opacity: 0.84;
  margin-left: 5px;
  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.danger || "#de3d3d"};
  }
`;

const Label = styled.div`
  font-size: 1em;
  color: ${({ theme }) => theme.colors.textMuted || "#9ea6b7"};
  font-weight: 500;
  margin-top: 14px;
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.text || "#242e3b"};
  font-size: 1.07em;
  margin-bottom: 2px;
`;

const PdfLink = styled.a`
  color: ${({ theme }) => theme.colors.primary || "#1a71ec"};
  font-weight: 600;
  font-size: 0.99em;
  margin-right: 2.5em;
  &:hover {
    text-decoration: underline;
  }
`;

const NoPdf = styled.div`
  color: ${({ theme }) => theme.colors.textMuted || "#c3c9d6"};
  font-size: 0.98em;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 3vw;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  @media (max-width: 850px) {
    flex-direction: column;
    gap: 0.5em;
  }
`;

const RightCol = styled.div`
  min-width: 340px;
  flex: 1;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 2px 0;
  th,
  td {
    border-bottom: 1px solid #f1f1f4;
    padding: 0.22em 0.55em;
    text-align: left;
    font-size: 0.98em;
  }
  th {
    color: ${({ theme }) => theme.colors.textMuted || "#788"};
    font-weight: 600;
    background: ${({ theme }) => theme.colors.backgroundSecondary || "#f6f8fa"};
  }
  tr:last-child td {
    border-bottom: none;
  }
`;

const Totals = styled.div`
  font-size: 1.01em;
  margin-top: 8px;
  margin-bottom: 4px;
  > div {
    margin-bottom: 2px;
  }
`;

const RevisionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.25em;
  th,
  td {
    border-bottom: 1px solid #e6eaf4;
    padding: 0.22em 0.55em;
    text-align: left;
    font-size: 0.96em;
  }
  th {
    color: ${({ theme }) => theme.colors.textMuted || "#a6a6b7"};
    font-weight: 600;
    background: ${({ theme }) => theme.colors.backgroundSecondary || "#f7f9fa"};
  }
  tr:last-child td {
    border-bottom: none;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 1.25em;
  margin-bottom: 0.25em;
`;

const ActionBtn = styled.button`
  border: none;
  border-radius: 11px;
  background: ${({ theme }) => theme.colors.primary || "#2b7bfa"};
  color: #fff;
  font-weight: 600;
  padding: 0.55em 1.45em;
  font-size: 0.97em;
  cursor: pointer;
  transition: background 0.13s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || "#215eb7"};
  }
`;

const DeleteBtn = styled(ActionBtn)`
  background: ${({ theme }) => theme.colors.danger || "#d32f2f"};
  &:hover {
    background: #b71c1c;
  }
`;


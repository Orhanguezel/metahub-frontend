"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/offer";
import type { SupportedLocale } from "@/types/common";
import { OfferStatusDropdown } from "@/modules/offer";
import type { Offer } from "@/modules/offer/types";
import { getMultiLang } from "@/types/common";

// Props
interface OfferTableProps {
  offers: Offer[];
  onShowDetail: (offer: Offer) => void;
  onDelete: (offerId: string) => void;
  onEdit: (offer: Offer) => void;
}

const OfferTable: React.FC<OfferTableProps> = ({
  offers = [],
  onShowDetail,
  onDelete,
  onEdit,
}) => {
  const { t, i18n } = useI18nNamespace("offer", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  if (!offers.length)
    return <Empty>{t("admin.noOffers", "No offers found.")}</Empty>;

  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            <th>{t("offerNumber", "Offer #")}</th>
            <th>{t("createdAt", "Date")}</th>
            <th>{t("customer", "Customer")}</th>
            <th>{t("totalGross", "Total")}</th>
            <th>{t("status", "Status")}</th>
            <th>{t("actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            // Müşteri adı: Populate gelirse companyName, yoksa id veya fallback
            let customerName = "-";
            if (typeof offer.customer === "object" && offer.customer) {
              customerName =
                getMultiLang(
                  (offer.customer as any).companyName,
                  lang
                ) ||
                (offer.customer as any).contactName ||
                (offer.customer as any).email ||
                "-";
            } else if (typeof offer.customer === "string") {
              customerName = offer.customer; // (sadece id ise)
            }

            return (
              <tr key={offer._id}>
                <OfferIdTd data-label={t("offerNumber", "Offer #")}>
                  <OfferId>
                    #{(offer.offerNumber || offer._id || "").toString().slice(-6)}
                  </OfferId>
                </OfferIdTd>
                <td data-label={t("createdAt", "Date")}>
                  {offer.createdAt
                    ? new Date(offer.createdAt).toLocaleDateString(lang)
                    : "-"}
                </td>
                <td data-label={t("customer", "Customer")}>{customerName}</td>
                <td data-label={t("totalGross", "Total")}>
                  <Price>
                    {(offer.totalGross ?? 0).toLocaleString(lang, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    <Currency>{offer.currency || "EUR"}</Currency>
                  </Price>
                </td>
                <td data-label={t("status", "Status")}>
                  <OfferStatusDropdown offer={offer} />
                </td>
                <td data-label={t("actions", "Actions")}>
                  <ActionBtn onClick={() => onShowDetail(offer)}>
                    {t("detail", "Detail")}
                  </ActionBtn>
                  <EditBtn onClick={() => onEdit(offer)}>
                    {t("edit", "Edit")}
                  </EditBtn>
                  <DeleteBtn onClick={() => onDelete(offer._id ?? "")}>
                    {t("delete", "Delete")}
                  </DeleteBtn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default OfferTable;

// --- Styled Components ---
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(20, 28, 58, 0.07);
  @media (max-width: 800px) {
    border-radius: 7px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 660px;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.card || "#fff"};
  border-radius: 16px;
  overflow: hidden;

  th,
  td {
    padding: 1.05rem 0.65rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border || "#e0e3e6"};
    font-size: 1.04em;
    white-space: nowrap;
  }

  th {
    background: ${({ theme }) => theme.colors.backgroundSecondary || "#f8fafc"};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary || "#444"};
    border-top: none;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }

  @media (max-width: 650px) {
    min-width: unset;
    border-radius: 8px;
    th {
      display: none;
    }
    tbody,
    tr,
    td {
      display: block;
      width: 100%;
    }
    tr {
      margin-bottom: 1.3rem;
      box-shadow: 0 2px 14px rgba(20, 28, 58, 0.06);
      background: ${({ theme }) => theme.colors.background || "#f7f8fa"};
      border-radius: 12px;
      padding: 0.3em 0.5em 1em 0.5em;
    }
    td {
      border: none;
      position: relative;
      padding: 0.6em 0.8em 0.45em 2em;
      font-size: 0.97em;
      &:before {
        content: attr(data-label);
        position: absolute;
        left: 0.7em;
        top: 0.63em;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.textMuted || "#aaa"};
        font-size: 0.91em;
        letter-spacing: 0.01em;
      }
    }
  }
`;

const OfferIdTd = styled.td`
  font-family: "JetBrains Mono", "Fira Mono", monospace;
  letter-spacing: 1.3px;
  background: transparent;
  @media (max-width: 650px) {
    padding-top: 1.1em;
  }
`;

const OfferId = styled.span`
  background: ${({ theme }) => theme.colors.backgroundSecondary || "#f3f7fc"};
  color: ${({ theme }) => theme.colors.primary || "#1677ff"};
  padding: 2.5px 13px 2.5px 9px;
  font-weight: 600;
  border-radius: 12px;
  font-size: 1em;
`;

const Price = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success || "#3caf74"};
  font-size: 1em;
  letter-spacing: 0.2px;
`;

const Currency = styled.span`
  font-size: 0.93em;
  font-weight: 400;
  margin-left: 2px;
  color: ${({ theme }) => theme.colors.textSecondary || "#888"};
`;

const ActionBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary || "#183153"};
  color: #fff;
  border: none;
  padding: 0.42em 1.13em;
  margin-right: 0.5em;
  border-radius: 14px;
  font-size: 0.97em;
  cursor: pointer;
  transition: background 0.14s;
  font-weight: 500;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover || "#253962"};
  }
  &:active {
    background: ${({ theme }) => theme.colors.primaryDark || "#0f2547"};
  }
`;

const EditBtn = styled(ActionBtn)`
  background: ${({ theme }) => theme.colors.warning || "#ffb300"};
  color: #222;
  margin-right: 0.5em;
  &:hover,
  &:focus {
    background: #ffc947;
    color: #111;
  }
  &:active {
    background: #f8ae20;
    color: #222;
  }
`;

const DeleteBtn = styled(ActionBtn)`
  background: ${({ theme }) => theme.colors.danger || "#d32f2f"};
  &:hover,
  &:focus {
    background: #b71c1c;
  }
`;

const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.grey || "#888"};
  padding: 2.2rem 0 1.7rem 0;
  font-size: 1.12em;
`;

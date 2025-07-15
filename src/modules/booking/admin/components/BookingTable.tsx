"use client";

import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/booking";
import { Booking } from "@/modules/booking";

interface Props {
  bookings?: Booking[];
  loading: boolean;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}

const BookingTable: React.FC<Props> = React.memo(function BookingTable({
  bookings = [],
  loading,
  onEdit,
  onDelete,
}) {
  const { t,i18n } = useI18nNamespace("booking", translations);
  const lang = i18n.language?.slice(0, 2) || "en"; 

  if (loading) {
    return <Paragraph>{t("common.loading", "Loading...")}</Paragraph>;
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return <Paragraph>{t("admin.noBookings", "No bookings found.")}</Paragraph>;
  }

  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            <th>{t("admin.columns.name", "Name")}</th>
            <th>{t("admin.columns.email", "Email")}</th>
            <th>{t("admin.columns.service", "Service")}</th>
            <th>{t("admin.columns.datetime", "Date / Time")}</th>
            <th>{t("admin.columns.status", "Status")}</th>
            <th>{t("admin.columns.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, idx) => (
            <TableRow key={booking._id} $zebra={idx % 2 === 1}>
              <td>{booking.name || "-"}</td>
              <td>{booking.email}</td>
              <td>
                 {/* Çoklu dil desteği */}
                {typeof booking.service === "object" && booking.service?.title
                  ? typeof booking.service.title === "object"
                    ? booking.service.title[lang] ||
                      booking.service.title["en"] ||
                      Object.values(booking.service.title)[0]
                    : booking.service.title
                  : booking.serviceType}
              </td>
              <td>
                <Datetime>
                  {booking.date}
                  <TimePart>{booking.time}</TimePart>
                </Datetime>
              </td>
              <td>
                <StatusTag
                  $status={booking.status}
                  title={t(
                    `admin.statusDescription.${booking.status}`,
                    defaultStatusDescriptions[booking.status]
                  )}
                >
                  {t(`admin.status.${booking.status}`, booking.status)}
                </StatusTag>
              </td>
              <td>
                <ButtonGroup>
                  <EditButton
                    type="button"
                    onClick={() => onEdit(booking)}
                    aria-label={t("common.edit", "Edit")}
                  >
                    {t("common.edit", "Edit")}
                  </EditButton>
                  <DeleteButton
                    type="button"
                    onClick={() => onDelete(booking._id)}
                    aria-label={t("common.delete", "Delete")}
                  >
                    {t("common.delete", "Delete")}
                  </DeleteButton>
                </ButtonGroup>
              </td>
            </TableRow>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
});

export default BookingTable;

// 🏷️ Varsayılan status açıklamaları (i18n fallback için)
const defaultStatusDescriptions: Record<string, string> = {
  pending: "Waiting for admin approval. No email sent to customer yet.",
  confirmed: "Booking confirmed. Customer has received a confirmation email.",
  cancelled: "Booking cancelled. The slot is now available for others.",
};

// 💅 Styled Components

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: ${({ theme }) => theme.spacings.lg};
  padding: ${({ theme }) => theme.spacings.lg};

  @media ${({ theme }) => theme.media.mobile} {
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacings.sm};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  min-width: 650px;

  th,
  td {
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.md};
    border-bottom: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
  }

  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-family: ${({ theme }) => theme.fonts.heading};
    border-bottom: ${({ theme }) => theme.borders.thick}
      ${({ theme }) => theme.colors.borderBright};
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const TableRow = styled.tr<{ $zebra?: boolean }>`
  background: ${({ $zebra, theme }) =>
    $zebra ? theme.colors.backgroundAlt : theme.colors.cardBackground};
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const Datetime = styled.span`
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const TimePart = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const EditButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    outline: none;
  }
`;

const DeleteButton = styled.button`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    outline: none;
  }
`;

const StatusTag = styled.span<{ $status: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ $status, theme }) =>
    $status === "pending"
      ? theme.colors.textOnWarning
      : $status === "confirmed"
      ? theme.colors.textOnSuccess
      : theme.colors.textOnDanger};
  background: ${({ $status, theme }) =>
    $status === "pending"
      ? theme.colors.warning
      : $status === "confirmed"
      ? theme.colors.success
      : theme.colors.danger};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: help;
  user-select: text;
`;

const Paragraph = styled.p`
  margin-top: ${({ theme }) => theme.spacings.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

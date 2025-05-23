"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Booking } from "@/modules/booking";

interface Props {
  bookings?: Booking[];
  loading: boolean;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}

export default function BookingTable({ bookings = [], loading, onEdit, onDelete }: Props) {
  const { t, i18n } = useTranslation("booking");
  const lang = (['tr', 'en', 'de'].includes(i18n.language) ? i18n.language : 'en') as 'tr' | 'en' | 'de';

  if (loading) {
    return <Paragraph>{t("common.loading", "Loading...")}</Paragraph>;
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return <Paragraph>{t("admin.noBookings", "No bookings found.")}</Paragraph>;
  }

  return (
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
        {bookings.map((booking) => (
          <tr key={booking._id}>
            <td>{booking.name?.[lang] || "-"}</td>
            <td>{booking.email}</td>
            <td>{booking.serviceType}</td>
            <td>{`${booking.date} ${booking.time}`}</td>
            <td>{t(`admin.status.${booking.status}`, booking.status)}</td>
            <td>
              <ButtonGroup>
                <EditButton type="button" onClick={() => onEdit(booking)}>
                  {t("common.edit", "Edit")}
                </EditButton>
                <DeleteButton type="button" onClick={() => onDelete(booking._id)}>
                  {t("common.delete", "Delete")}
                </DeleteButton>
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}

const StyledTable = styled.table`
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};

  th, td {
    padding: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Paragraph = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

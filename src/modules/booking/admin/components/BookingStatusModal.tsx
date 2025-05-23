"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { updateBookingStatus } from "@/modules/booking/slice/bookingSlice";
import type { Booking } from "@/modules/booking";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
}

export default function BookingStatusModal({ isOpen, booking, onClose }: Props) {
  const { t } = useTranslation("booking");
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending");

  useEffect(() => {
    if (booking) setStatus(booking.status);
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    try {
      await dispatch(updateBookingStatus({ id: booking._id, status })).unwrap();
      toast.success(t("admin.modal.updated", "Status updated successfully."));
      onClose();
    } catch {
      toast.error(t("admin.modal.updateError", "Failed to update status."));
    }
  };

  return (
    <Overlay>
      <Modal>
        <ModalTitle>{t("admin.modal.title", "Update Booking Status")}</ModalTitle>

        <Label>{t("admin.modal.select", "Select Status")}</Label>
        <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="pending">{t("admin.status.pending", "Pending")}</option>
          <option value="confirmed">{t("admin.status.confirmed", "Confirmed")}</option>
          <option value="cancelled">{t("admin.status.cancelled", "Cancelled")}</option>
        </Select>

        <ButtonGroup>
          <Button onClick={handleSubmit}>{t("common.update", "Update")}</Button>
          <Button $danger onClick={onClose}>{t("common.cancel", "Cancel")}</Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 2rem;
  width: 90%;
  max-width: 480px;
  margin: 10vh auto;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ $danger?: boolean }>`
  padding: 0.6rem 1.2rem;
  background: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger : theme.colors.success};
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

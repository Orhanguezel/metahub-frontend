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

export default function BookingStatusModal({
  isOpen,
  booking,
  onClose,
}: Props) {
  const { t } = useTranslation("booking");
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending");
  const [loading, setLoading] = useState(false);

  // Statüyü booking değiştiğinde ayarla
  useEffect(() => {
    if (booking) setStatus(booking.status);
  }, [booking]);

  // Modal dışında tıklayınca kapat
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Submit işlemi
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await dispatch(updateBookingStatus({ id: booking!._id, status })).unwrap();
      toast.success(t("admin.modal.updated", "Status updated successfully."));
      onClose();
    } catch {
      toast.error(t("admin.modal.updateError", "Failed to update status."));
    } finally {
      setLoading(false);
    }
  };

  // Modal açık ve booking yoksa render etme
  if (!isOpen || !booking) return null;

  return (
    <Overlay onClick={handleOverlayClick} tabIndex={-1}>
      <Modal>
        <ModalTitle>
          {t("admin.modal.title", "Update Booking Status")}
        </ModalTitle>

        <StatusInfo>
          {t(
            "admin.modal.statusInfo",
            "‘Pending’ means your booking is waiting for admin approval. The customer will only receive a confirmation email after you confirm."
          )}
        </StatusInfo>

        <Label htmlFor="status-select">
          {t("admin.modal.select", "Select Status")}
        </Label>
        <Select
          id="status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          disabled={loading}
        >
          <option value="pending">
            {t("admin.status.pending", "Pending")}
          </option>
          <option value="confirmed">
            {t("admin.status.confirmed", "Confirmed")}
          </option>
          <option value="cancelled">
            {t("admin.status.cancelled", "Cancelled")}
          </option>
        </Select>

        <ButtonGroup>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading
              ? t("common.updating", "Updating...")
              : t("common.update", "Update")}
          </Button>
          <Button type="button" $danger onClick={onClose} disabled={loading}>
            {t("common.cancel", "Cancel")}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

// 💅 Styled Components

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayEnd};
  backdrop-filter: blur(2px);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 430px;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin: ${({ theme }) => theme.spacing.lg};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    margin: ${({ theme }) => theme.spacing.sm};
  }
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const StatusInfo = styled.div`
  background: ${({ theme }) => theme.colors.warningBackground || "#fffbe6"};
  color: ${({ theme }) => theme.colors.warning || "#d97706"};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;

const Label = styled.label`
  display: block;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Select = styled.select`
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.inputs.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  transition: border ${({ theme }) => theme.transition.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button<{ $danger?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: ${({ $danger, theme }) =>
    $danger
      ? theme.buttons.danger.background
      : theme.buttons.primary.background};
  color: ${({ $danger, theme }) =>
    $danger
      ? theme.buttons.danger.text
      : theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ $danger, theme }) =>
      $danger
        ? theme.buttons.danger.backgroundHover
        : theme.buttons.primary.backgroundHover};
    color: ${({ $danger, theme }) =>
      $danger
        ? theme.buttons.danger.textHover
        : theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    opacity: ${({ theme }) => theme.opacity.hover};
    outline: none;
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

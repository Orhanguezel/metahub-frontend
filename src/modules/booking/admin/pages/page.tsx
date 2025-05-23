"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBookings,
  deleteBooking,
  clearBookingMessages,
} from "@/modules/booking/slice/bookingSlice";
import { 
  Booking,
  BookingTable,
  BookingStatusModal,
  SlotManager,
 } from "@/modules/booking";
import { toast } from "react-toastify"; // 👈 ekle

export default function AdminBookingPage() {
  const { t, i18n } = useTranslation("booking");
  const dispatch = useAppDispatch();

  const { bookings, loading, error, successMessage } = useAppSelector(
    (state) => state.booking
  );

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const lang = useMemo(
    () => (["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en") as "tr" | "en" | "de",
    [i18n.language]
  );

  useEffect(() => {
    dispatch(fetchBookings({ language: lang }));
  }, [dispatch, lang]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
  }, [successMessage, error]);

  useEffect(() => {
    return () => {
      dispatch(clearBookingMessages());
    };
  }, [dispatch]);

  const handleOpenModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };


  const handleDelete = (id: string) => {
    const confirmMessage = t("admin.confirmDelete", "Are you sure you want to delete this booking?");
    if (confirm(confirmMessage)) {
      dispatch(deleteBooking(id));
    }
  };

  return (
    <Wrapper>
      <Title>{t("admin.title", "Manage Bookings")}</Title>

      <BookingTable
        bookings={bookings}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <BookingStatusModal
        isOpen={modalOpen}
        booking={selectedBooking}
        onClose={() => setModalOpen(false)}
      />

      {/* 🔧 Yeni Eklenen Slot Yönetimi */}
      <SlotManager />
    </Wrapper>
  );
}

// 💅 Styles
const Wrapper = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

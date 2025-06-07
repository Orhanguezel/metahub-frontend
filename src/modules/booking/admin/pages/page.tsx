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
import { toast } from "react-toastify";

// Tablar
const TAB_BOOKINGS = "bookings";
const TAB_SLOTS = "slots";
const TABS = [
  { key: TAB_BOOKINGS, labelKey: "admin.tabs.bookings", fallback: "Bookings" },
  { key: TAB_SLOTS, labelKey: "admin.tabs.slots", fallback: "Slot Manager" },
];

export default function AdminBookingPage() {
  const { t, i18n } = useTranslation("booking");
  const dispatch = useAppDispatch();
  const { bookings, loading, error, successMessage } = useAppSelector(
    (state) => state.booking
  );

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_BOOKINGS);

  const lang = useMemo(
    () =>
      (["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en") as
        | "tr"
        | "en"
        | "de",
    [i18n.language]
  );

  useEffect(() => {
    if (activeTab === TAB_BOOKINGS) {
      dispatch(fetchBookings({ language: lang }));
    }
  }, [dispatch, lang, activeTab]);

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
    const confirmMessage = t(
      "admin.confirmDelete",
      "Are you sure you want to delete this booking?"
    );
    if (confirm(confirmMessage)) {
      dispatch(deleteBooking(id));
    }
  };

  return (
    <Wrapper>
      <Tabs>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {t(tab.labelKey, tab.fallback)}
          </TabButton>
        ))}
      </Tabs>
      <TabPanel>
        {activeTab === TAB_BOOKINGS && (
          <Card>
            <Title>{t("admin.title", "Manage Bookings")}</Title>
            {/* Ana Tablo */}
            <BookingTable
              bookings={bookings}
              loading={loading}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
            {/* Modal */}
            <BookingStatusModal
              isOpen={modalOpen}
              booking={selectedBooking}
              onClose={() => setModalOpen(false)}
            />
          </Card>
        )}
        {activeTab === TAB_SLOTS && (
          <SlotCard>
            <SlotManager />
          </SlotCard>
        )}
      </TabPanel>
    </Wrapper>
  );
}

// 💅 Styles

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.sectionBackground};
  padding: ${({ theme }) => theme.spacing.xxl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxl};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg} 0;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.cardBackground : "transparent"};
  border: none;
  border-bottom: 2px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : "transparent"};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.md} ${({ theme }) => theme.radii.md} 0 0;
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.sm : "none"};
  transition: all ${({ theme }) => theme.transition.normal};
  outline: none;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.cardBackground};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

const TabPanel = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 100%;
  max-width: 1200px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  margin: 0 auto;

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const SlotCard = styled(Card)`
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

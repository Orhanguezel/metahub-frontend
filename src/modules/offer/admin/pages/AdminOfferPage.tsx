"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/offer";
import {
  deleteOffer,
  generateOfferPdf,
  clearOfferMessages,
} from "@/modules/offer/slice/offerSlice";
import styled from "styled-components";
import { Message } from "@/shared";
import type { Offer } from "@/modules/offer/types";
import OfferTable from "@/modules/offer/admin/components/OfferTable";
import OfferDetailModal from "@/modules/offer/admin/components/OfferDetailModal";
import OfferDeleteConfirmModal from "@/modules/offer/admin/components/OfferDeleteConfirmModal";
import OfferToolbar from "@/modules/offer/admin/components/OfferToolbar";

const AdminOfferPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { adminOffers, loading, error, successMessage } = useAppSelector(
    (state) => state.offer
  );
  const { t } = useI18nNamespace("offer", translations);

  // Modal State
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);

  // Mesajlar temizlensin (unmountta)
  useEffect(() => {
    return () => {
      dispatch(clearOfferMessages());
    };
  }, [dispatch]);

  return (
    <PageContainer>
      <HeaderBar>
        <PageTitle>{t("admin.title", "All Offers")}</PageTitle>
        <OfferToolbar />
      </HeaderBar>

      {loading && <Message>{t("loading", "Loading...")}</Message>}
      {error && <Message $error>{error}</Message>}
      {successMessage && <Message $success>{successMessage}</Message>}

      <OfferTable
        offers={adminOffers}
        onShowDetail={setSelectedOffer}
        onDelete={setDeleteOfferId}
      />

      <OfferDetailModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onDelete={() => setDeleteOfferId(selectedOffer?._id ?? null)}
        onGeneratePdf={() =>
          selectedOffer && dispatch(generateOfferPdf(selectedOffer._id!))
        }
        loading={loading}
      />

      <OfferDeleteConfirmModal
        offerId={deleteOfferId}
        onCancel={() => setDeleteOfferId(null)}
        onConfirm={() => {
          if (deleteOfferId) {
            dispatch(deleteOffer(deleteOfferId));
            setDeleteOfferId(null);
          }
        }}
        loading={loading}
      />
    </PageContainer>
  );
};

export default AdminOfferPage;

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 32px 12px 24px 12px;
  max-width: 1320px;
  margin: 0 auto;
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2vw;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`;

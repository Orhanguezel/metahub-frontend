"use client";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchAllSubscribers,
  deleteSubscriber,
  clearNewsletterState,
  verifySubscriber,
  sendBulkNewsletter,
  sendSingleNewsletter,
} from "@/modules/newsletter/slice/newsletterSlice";
import type { INewsletter } from "@/modules/newsletter/types";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { toast } from "react-toastify";

// Alt componentleri import et
import {
  SubscriberList,
  SubscriberModal,
  BulkSendModal,
  SingleSendModal,
  PreviewModal,
} from "@/modules/newsletter";

export default function AdminNewsletterPage() {
  // 1️⃣ Tüm komponentlerde kullanılacak type-safe t fonksiyonu
  const { t: tBase } = useI18nNamespace("newsletter", translations);
  const t = (key: string, defaultValue?: string, vars?: Record<string, any>) =>
    tBase(key, { ...vars, defaultValue });

  const dispatch = useAppDispatch();

  // Redux state
  const subscribers = useAppSelector((state) => state.newsletter.subscribersAdmin);
  const loading = useAppSelector((state) => state.newsletter.loading);
  const error = useAppSelector((state) => state.newsletter.error);
  const successMessage = useAppSelector((state) => state.newsletter.successMessage);
  const bulkStatus = useAppSelector((state) => state.newsletter.bulkStatus);
  const bulkResult = useAppSelector((state) => state.newsletter.bulkResult);
  const singleStatus = useAppSelector((state) => state.newsletter.singleStatus);

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [bulkModal, setBulkModal] = useState(false);
  const [singleModal, setSingleModal] = useState<INewsletter | null>(null);
  const [previewModal, setPreviewModal] = useState<{ subject: string; html: string } | null>(null);

  // Abone verilerini çek
  useEffect(() => {
    dispatch(fetchAllSubscribers());
  }, [dispatch]);

  // Hata & başarı bildirimleri
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearNewsletterState());
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearNewsletterState());
    };
  }, [dispatch]);

  // Aboneyi sil
  const handleDelete = async (id: string) => {
    const confirmMsg = t("admin.confirmDelete", "Bu aboneyi silmek istediğinize emin misiniz?");
    if (window.confirm(confirmMsg)) {
      await dispatch(deleteSubscriber(id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  // Aboneyi manuel onayla
  const handleVerify = async (id: string) => {
    await dispatch(verifySubscriber(id));
    toast.success(t("admin.verified", "Abone onaylandı!"));
  };

  // Tekil gönderim modalı aç
  const handleSingleSend = (sub: INewsletter) => setSingleModal(sub);

  // E-posta ile filtrele
  const filtered = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  // Seçili abone (modal için)
  const selectedSubscriber: INewsletter | undefined = subscribers.find(
    (sub) => sub._id === selectedId
  );

  return (
    <AdminContainer>
      <Title>{t("admin.title", "E-Bülten Aboneleri")}</Title>
      <ActionsRow>
        <Input
          placeholder={t("admin.search", "E-posta ile ara...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t("admin.search", "E-posta ile ara...")}
        />
        <BulkButton onClick={() => setBulkModal(true)}>
          {t("admin.bulkSend", "Toplu Gönderim")}
        </BulkButton>
      </ActionsRow>
      {loading && <InfoMsg>{t("admin.loading", "Yükleniyor...")}</InfoMsg>}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {successMessage && <SuccessMsg>{successMessage}</SuccessMsg>}
      {bulkStatus === "succeeded" && bulkResult && (
        <SuccessMsg>
          {t("admin.bulkSent", "{{sent}} aboneye gönderildi.", {
            sent: bulkResult.sent,
            total: bulkResult.total,
          })}
        </SuccessMsg>
      )}
      <ListWrapper>
        <SubscriberList
          subscribers={filtered}
          onSelect={setSelectedId}
          onDelete={handleDelete}
          onVerify={handleVerify}
          onSingleSend={handleSingleSend}
          selectedId={selectedId}
          t={t}
        />
      </ListWrapper>
      {selectedSubscriber && (
        <SubscriberModal
          subscriber={selectedSubscriber}
          onClose={() => setSelectedId(null)}
          t={t}
        />
      )}
      {singleModal && (
  <SingleSendModal
    subscriber={singleModal}
    onClose={() => setSingleModal(null)}
    onPreview={(subject, html) => setPreviewModal({ subject, html })}
    onSend={async (subject, html) => {
      await dispatch(sendSingleNewsletter({ id: singleModal._id, subject, html }));
      setSingleModal(null);
    }}
    loading={singleStatus === "loading"}
    t={t}
  />
)}
      {bulkModal && (
        <BulkSendModal
          onClose={() => setBulkModal(false)}
          onPreview={(subject, html) => setPreviewModal({ subject, html })}
          onSubmit={async (subject, html) => {
            await dispatch(sendBulkNewsletter({ subject, html }));
            setBulkModal(false);
          }}
          loading={bulkStatus === "loading"}
          t={t}
        />
      )}
      {previewModal && (
        <PreviewModal
          subject={previewModal.subject}
          html={previewModal.html}
          onClose={() => setPreviewModal(null)}
          t={t}
        />
      )}
    </AdminContainer>
  );
}

// --- STYLED COMPONENTS ---

const AdminContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 100vh;
  font-family: ${({ theme }) => theme.fonts.main};
  ${({ theme }) => theme.media.small} {
    max-width: 100%;
    padding: ${({ theme }) => theme.spacings.sm};
  }
`;
const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacings.lg};
  }
`;
const InfoMsg = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
`;
const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
`;
const SuccessMsg = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
`;
const ListWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.sm};
    box-shadow: none;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;
const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1em;
  margin-bottom: 1.4em;
  > * { flex: 1; }
  > button { flex: none; }
`;
const Input = styled.input`
  width: 100%;
  padding: 0.7em 1em;
  border-radius: 6px;
  border: 1.3px solid #dedede;
  font-size: 1em;
  background: #fff;
`;
const BulkButton = styled.button`
  background: #0b933c;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.8em 1.5em;
  font-size: 1.09em;
  box-shadow: 0 3px 16px #008e1c21;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #178f52; }
`;

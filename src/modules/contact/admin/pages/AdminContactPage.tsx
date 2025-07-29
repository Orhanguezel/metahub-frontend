"use client";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { deleteContactMessage, clearContactMessages } from "@/modules/contact/slice/contactSlice";
import { ContactMessageList, ContactMessageModal } from "@/modules/contact";
import { IContactMessage } from "@/modules/contact/types";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { toast } from "react-toastify";

export default function AdminContactMessagesPage() {
  const { t } = useI18nNamespace("contact", translations);
  const dispatch = useAppDispatch();

  const messagesAdmin = useAppSelector((state) => state.contact.messagesAdmin);
  const loading = useAppSelector((state) => state.contact.loading);
  const error = useAppSelector((state) => state.contact.error);
  const successMessage = useAppSelector((state) => state.contact.successMessage);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearContactMessages());
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    return () => { dispatch(clearContactMessages()); };
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "admin.confirmDelete",
      "Bu mesajı silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteContactMessage(id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const selectedMsg: IContactMessage | undefined = messagesAdmin.find(msg => msg._id === selectedId);

  return (
    <AdminContainer>
      <Title>{t("admin.title", "İletişim Mesajları")}</Title>
      {loading && <InfoMsg>{t("admin.loading", "Yükleniyor...")}</InfoMsg>}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {successMessage && <SuccessMsg>{successMessage}</SuccessMsg>}
      <ListWrapper>
        <ContactMessageList
          messages={messagesAdmin}
          onSelect={setSelectedId}
          onDelete={handleDelete}
          selectedId={selectedId}
          search={search}
          setSearch={setSearch}
        />
      </ListWrapper>
      {selectedMsg && (
        <ContactMessageModal
          message={selectedMsg}
          onClose={() => setSelectedId(null)}
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

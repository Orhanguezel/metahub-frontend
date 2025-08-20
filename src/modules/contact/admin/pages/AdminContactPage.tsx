// src/modules/contact/pages/AdminContactMessagesPage.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  deleteContactMessage,
  clearContactMessages,
  fetchAllContactMessages,
} from "@/modules/contact/slice/contactSlice";
import { ContactMessageList, ContactMessageModal } from "@/modules/contact";
import type { IContactMessage } from "@/modules/contact/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/contact/locales";
import { toast } from "react-toastify";

export default function AdminContactMessagesPage() {
  const { t } = useI18nNamespace("contact", translations);
  const dispatch = useAppDispatch();

  const messagesAdmin = useAppSelector((s) => s.contact.messagesAdmin);
  const loading = useAppSelector((s) => s.contact.loading);
  const error = useAppSelector((s) => s.contact.error);
  const successMessage = useAppSelector((s) => s.contact.successMessage);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // fetch on mount
  useEffect(() => {
    dispatch(fetchAllContactMessages());
  }, [dispatch]);

  // toasts
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearContactMessages());
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearContactMessages());
    };
  }, [dispatch]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm(t("admin.confirmDelete", "Bu mesajı silmek istediğinize emin misiniz?"))) {
        await dispatch(deleteContactMessage(id));
        if (selectedId === id) setSelectedId(null);
      }
    },
    [dispatch, selectedId, t]
  );

  const handleReload = useCallback(() => {
    dispatch(fetchAllContactMessages());
  }, [dispatch]);

  const selectedMsg: IContactMessage | undefined = messagesAdmin.find((m) => m._id === selectedId);

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "İletişim Mesajları")}</h1>
          <Subtitle>{t("admin.subtitle", "Gelen tüm mesajları görüntüleyin ve yönetin")}</Subtitle>
        </TitleBlock>
      </Header>

      <Card>
        <ContactMessageList
          messages={messagesAdmin}
          onSelect={setSelectedId}
          onDelete={handleDelete}
          onReload={handleReload}
          selectedId={selectedId}
          search={search}
          setSearch={setSearch}
          loading={loading}
        />
      </Card>

      {selectedMsg && <ContactMessageModal message={selectedMsg} onClose={() => setSelectedId(null)} />}
    </PageWrap>
  );
}

/* styled — activity/portfolio pattern */
const PageWrap = styled.div`
  max-width:${({theme})=>theme.layout.containerWidth};
  margin:0 auto;
  padding:${({theme})=>theme.spacings.xl};
  background:${({theme})=>theme.colors.background};
  @media (max-width: 640px){ padding:${({theme})=>theme.spacings.md}; }
`;
const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.lg};
  @media (max-width: 768px){ flex-direction:column; align-items:flex-start; gap:${({theme})=>theme.spacings.xs}; }
`;
const TitleBlock = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h1{ margin:0; color:${({theme})=>theme.colors.primary}; }
`;
const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Card = styled.section`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;

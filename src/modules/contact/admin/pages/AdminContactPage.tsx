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
      <h1>{t("admin.title", "İletişim Mesajları")}</h1>
      {loading && <p>{t("admin.loading", "Yükleniyor...")}</p>}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {successMessage && <SuccessMsg>{successMessage}</SuccessMsg>}
      <ContactMessageList
        messages={messagesAdmin}
        onSelect={setSelectedId}
        onDelete={handleDelete}
        selectedId={selectedId}
        search={search}
        setSearch={setSearch}
      />
      {selectedMsg && (
        <ContactMessageModal
          message={selectedMsg}
          onClose={() => setSelectedId(null)}
        />
      )}
    </AdminContainer>
  );
}

const AdminContainer = styled.div` max-width: 900px; margin: 0 auto; padding: 32px; `;
const ErrorMsg = styled.div` color: #ff5555; margin-bottom: 12px; `;
const SuccessMsg = styled.div` color: #00a651; margin-bottom: 12px; `;

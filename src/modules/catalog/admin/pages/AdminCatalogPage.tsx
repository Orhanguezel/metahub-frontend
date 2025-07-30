"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchAllCatalogRequests,
  deleteCatalogRequest,
  markCatalogRequestAsRead,
  clearCatalogState,
} from "@/modules/catalog/slice/catalogSlice";
import { ICatalogRequest } from "@/modules/catalog/types";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { toast } from "react-toastify";

export default function AdminCatalogRequestsPage() {
  const { t } = useI18nNamespace("catalog", translations);
  const dispatch = useAppDispatch();

  const {
    messagesAdmin,
    loading,
    error,
    successMessage,
    deleteStatus,
  } = useAppSelector((state) => state.catalog);

  const [selected, setSelected] = useState<ICatalogRequest | null>(null);
  const [search, setSearch] = useState("");

  // Talepler ilk açıldığında yüklenir
  useEffect(() => {
    dispatch(fetchAllCatalogRequests());
    // eslint-disable-next-line
  }, []);

  // Bildirimler (toast)
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearCatalogState());
  }, [successMessage, error, dispatch]);

  // Silme butonu
  const handleDelete = async (id: string) => {
    if (confirm(t("admin.confirmDelete", "Bu talebi silmek istiyor musunuz?"))) {
      await dispatch(deleteCatalogRequest(id));
      if (selected?._id === id) setSelected(null);
    }
  };

  // Okundu işaretle
  const handleMarkAsRead = async (id: string) => {
    await dispatch(markCatalogRequestAsRead(id));
  };

  // Arama filtresi
  const filtered = messagesAdmin.filter((msg) =>
    [msg.name, msg.email, msg.company, msg.subject, msg.message]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Container>
      <PageTitle>{t("admin.catalogTitle", "Katalog Talepleri")}</PageTitle>

      <FlexBar>
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("admin.search", "Arama...")}
        />
        <RefreshBtn
          type="button"
          onClick={() => dispatch(fetchAllCatalogRequests())}
          disabled={loading}
        >
          {t("admin.refresh", "Yenile")}
        </RefreshBtn>
      </FlexBar>

      <Table>
        <thead>
          <tr>
            <th>{t("admin.name", "Ad")}</th>
            <th>{t("admin.email", "E-posta")}</th>
            <th>{t("admin.subject", "Konu")}</th>
            <th>{t("admin.date", "Tarih")}</th>
            <th>{t("admin.status", "Durum")}</th>
            <th>{t("admin.actions", "İşlemler")}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", opacity: 0.6 }}>
                {loading ? t("admin.loading", "Yükleniyor...") : t("admin.noResults", "Talep yok.")}
              </td>
            </tr>
          ) : (
            filtered.map((msg) => (
              <tr key={msg._id}>
                <td>{msg.name}</td>
                <td>{msg.email}</td>
                <td>
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setSelected(msg);
                    }}
                    style={{ color: "#1976d2", textDecoration: "underline" }}
                  >
                    {msg.subject}
                  </a>
                </td>
                <td>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "-"}</td>
                <td>
                  {msg.isRead ? (
                    <StatusOkundu>{t("admin.read", "Okundu")}</StatusOkundu>
                  ) : (
                    <StatusOkunmadi>{t("admin.unread", "Okunmadı")}</StatusOkunmadi>
                  )}
                </td>
                <td>
                  {!msg.isRead && (
                    <ActionBtn onClick={() => handleMarkAsRead(msg._id!)}>{t("admin.markRead", "Okundu Yap")}</ActionBtn>
                  )}
                  <ActionBtn
                    $danger
                    onClick={() => handleDelete(msg._id!)}
                    disabled={deleteStatus === "loading"}
                  >
                    {t("admin.delete", "Sil")}
                  </ActionBtn>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {selected && (
        <ModalOverlay onClick={() => setSelected(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseX onClick={() => setSelected(null)}>×</CloseX>
            <h2 style={{ marginTop: 0 }}>{selected.subject}</h2>
            <p>
              <b>{t("admin.name", "Ad")}:</b> {selected.name}
            </p>
            <p>
              <b>{t("admin.email", "E-posta")}:</b> {selected.email}
            </p>
            {selected.company && (
              <p>
                <b>{t("admin.company", "Firma")}:</b> {selected.company}
              </p>
            )}
            <p>
              <b>{t("admin.phone", "Telefon")}:</b> {selected.phone || "-"}
            </p>
            <p>
              <b>{t("admin.message", "Mesaj")}:</b>
              <br />
              {selected.message}
            </p>
            {selected.sentCatalog?.url && (
              <p>
                <b>{t("admin.catalogFile", "Katalog Dosyası")}:</b>{" "}
                <a href={selected.sentCatalog.url} target="_blank" rel="noopener noreferrer">
                  {selected.sentCatalog.fileName}
                </a>
              </p>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

// --- STYLED COMPONENTS ---
const Container = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: 3.2rem 1.7rem 2rem 1.7rem;
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 100vh;
`;
const PageTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 2.2rem;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;
const FlexBar = styled.div`
  display: flex;
  gap: 1.4rem;
  margin-bottom: 1.3rem;
  justify-content: flex-end;
`;
const SearchInput = styled.input`
  font-size: 1.09em;
  padding: 0.65em 1.2em;
  border: 1.4px solid #dadada;
  border-radius: 8px;
  min-width: 260px;
`;
const RefreshBtn = styled.button`
  padding: 0.65em 1.8em;
  font-size: 1.08em;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 7px;
  font-weight: 500;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 24px 0 #0a317333;
  font-size: 1.05em;
  th, td { padding: 0.7em 1.1em; }
  th { text-align: left; color: #555; background: #f5f7fb; }
  tr { background: #fff; }
`;
const StatusOkunmadi = styled.span`
  background: #ffd966;
  color: #6c4c00;
  border-radius: 10px;
  padding: 0.24em 1em;
  font-weight: 600;
  font-size: 1em;
`;
const StatusOkundu = styled.span`
  background: #b7f8cc;
  color: #15623a;
  border-radius: 10px;
  padding: 0.24em 1em;
  font-weight: 600;
  font-size: 1em;
`;
const ActionBtn = styled.button<{ $danger?: boolean }>`
  background: ${({ $danger, theme }) => $danger ? theme.colors.danger : theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 0.42em 1.18em;
  font-size: 0.99em;
  margin-right: 0.8em;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: ${({ $danger, theme }) => $danger ? "#e95252" : theme.colors.primaryHover};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(25, 38, 51, 0.35);
  z-index: 1400;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;
const ModalContent = styled.div`
  width: 420px;
  background: #fff;
  border-radius: 16px;
  margin: 4.4rem 0 0 0;
  padding: 2.1rem 2.2rem 2.5rem 2.2rem;
  box-shadow: 0 10px 32px #2227;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  font-size: 1.09em;
`;
const CloseX = styled.button`
  position: absolute;
  top: 12px; right: 18px;
  font-size: 2.1em;
  background: none;
  border: none;
  color: #444;
  opacity: 0.63;
  cursor: pointer;
  &:hover { opacity: 1; }
`;

"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchNews, deleteNews } from "@/store/newsSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Link from "next/link";

export default function NewsList() {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation("admin");

  const { news, loading, error, successMessage } = useSelector((state: RootState) => state.news);
  const [selectedLang, setSelectedLang] = useState<"en" | "tr" | "de">(i18n.language as any || "en");

  useEffect(() => {
    dispatch(fetchNews(selectedLang));
  }, [dispatch, selectedLang]);

  useEffect(() => {
    if (error) toast.error(error);
    if (successMessage) toast.success(successMessage);
  }, [error, successMessage]);

  const handleDelete = (id: string) => {
    if (confirm(t("common.confirmDelete") || "Silmek istediğinize emin misiniz?")) {
      dispatch(deleteNews(id));
    }
  };

  return (
    <Container>
      <TopBar>
        <h3>📰 {t("news.allNews")}</h3>
        <Select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value as any)}>
          <option value="en">🇬🇧 English</option>
          <option value="tr">🇹🇷 Türkçe</option>
          <option value="de">🇩🇪 Deutsch</option>
        </Select>
      </TopBar>

      {loading && <p>{t("common.loading")}...</p>}
      {!loading && news.length === 0 && <p>{t("news.noNews")}</p>}

      {!loading && news.length > 0 && (
        <Table>
          <thead>
            <tr>
              <th>{t("news.title")}</th>
              <th>{t("news.language")}</th>
              <th>{t("news.status")}</th>
              <th>{t("news.date")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.language.toUpperCase()}</td>
                <td>{item.isPublished ? "✅ Yayında" : "⏳ Taslak"}</td>
                <td>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "-"}</td>
                <td>
                  <ButtonGroup>
                    <Link href={`/admin/news/edit/${item._id}`} passHref>
                      <EditBtn>{t("common.edit")}</EditBtn>
                    </Link>
                    <DeleteBtn onClick={() => handleDelete(item._id!)}>
                      {t("common.delete")}
                    </DeleteBtn>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}


// Styled Components
const Container = styled.div`
  margin-top: 2rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};

  th, td {
    padding: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.tableHeader};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const DeleteBtn = styled.button`
  background: ${({ theme }) => theme.danger};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const EditBtn = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

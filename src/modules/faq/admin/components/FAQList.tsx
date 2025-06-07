"use client";

import React from "react";
import styled from "styled-components";
import { FAQ } from "@/modules/faq/slice/faqSlice";
import { useTranslation } from "react-i18next";

interface Props {
  faqs: FAQ[];
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function FAQList({ faqs, onEdit, onDelete, loading }: Props) {
  const { t, i18n } = useTranslation("faq");

  const currentLang = (
    ["en", "tr", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "en" | "tr" | "de";

  const langLabel = {
    en: "EN",
    tr: "TR",
    de: "DE",
  }[currentLang];

  if (loading) return <p>{t("common.loading", "Loading")}...</p>;
  if (!faqs.length) return <p>{t("adminFaq.list.empty", "No FAQs found.")}</p>;

  return (
    <StyledTable>
      <thead>
        <tr>
          <th>{t("adminFaq.form.question", `Question (${langLabel})`)}</th>
          <th>{t("adminFaq.form.answer", `Answer (${langLabel})`)}</th>
          <th>{t("adminFaq.actions", "Actions")}</th>
        </tr>
      </thead>
      <tbody>
        {faqs.map((faq) => (
          <tr key={faq._id}>
            <td>{faq.question?.[currentLang] || "–"}</td>
            <td>{faq.answer?.[currentLang] || "–"}</td>
            <td>
              <ButtonGroup>
                <EditButton onClick={() => onEdit(faq)}>
                  {t("common.edit", "Edit")}
                </EditButton>
                <DeleteButton onClick={() => onDelete(faq._id!)}>
                  {t("common.delete", "Delete")}
                </DeleteButton>
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}

// 💅 Styled Components
const StyledTable = styled.table`
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

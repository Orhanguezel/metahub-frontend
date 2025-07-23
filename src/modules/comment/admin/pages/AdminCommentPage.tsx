"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import {
  togglePublishComment,
  deleteComment,
  clearCommentMessages,
  fetchAllCommentsAdmin,
} from "@/modules/comment/slice/commentSlice";
import type { IComment, CommentContentType } from "@/modules/comment/types";
import type { SupportedLocale } from "@/types/common";
import { CommentDetailsModal } from "@/modules/comment";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";

// --- Content Type Seçenekleri ---
const contentTypeOptions: { value: CommentContentType; label: string }[] = [
  { value: "blog", label: "Blog" },
  { value: "product", label: "Product" },
  { value: "bikes", label: "Bikes" },
  { value: "services", label: "Service" },
  { value: "news", label: "News" },
  { value: "articles", label: "Article" },
  { value: "about", label: "About" },
  { value: "references", label: "Reference" },
  { value: "library", label: "Library" },
  { value: "company", label: "Company" },
  { value: "ensotekprod", label: "Ensotekprod" },
  { value: "sparepart", label: "Sparepart" },
];

export default function AdminCommentPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("comment", translations3);
  const lang: SupportedLocale =
    (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  const {
    commentsAdmin = [],
    loading,
    successMessage,
    error,
    pagination = { pages: 1, page: 1 },
  } = useAppSelector((state) => state.comments);

  const [typeFilter, setTypeFilter] = useState<"all" | CommentContentType>("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "unpublished">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState<IComment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllCommentsAdmin(currentPage));
  }, [currentPage, dispatch]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) {
      dispatch(clearCommentMessages());
    }
  }, [successMessage, error, dispatch]);

  const filteredComments = commentsAdmin.filter((c) => {
    const user =
      c.userId && typeof c.userId === "object"
        ? c.userId
        : undefined;
    const name = user?.name || c.name || "";
    const email = user?.email || c.email || "";
    const matchesType = typeFilter === "all" || c.contentType === typeFilter;
    const matchesStatus =
      publishFilter === "all" ||
      (publishFilter === "published" && c.isPublished) ||
      (publishFilter === "unpublished" && !c.isPublished);
    const matchesSearch =
      [name, email, c.label ?? "", c.text].join(" ").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleToggle = (id: string) => dispatch(togglePublishComment(id));
  const handleDelete = (id: string) => {
    if (confirm(t("confirmDelete", "Yorumu silmek istiyor musunuz?"))) {
      dispatch(deleteComment(id));
    }
  };
  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <Wrapper>
      <h1>{t("title", "Yorum Yönetimi")}</h1>
      <FilterBar>
        <label>
          {t("filter.type", "İçerik Türü")}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
            <option value="all">{t("filter.allTypes", "Tüm Türler")}</option>
            {contentTypeOptions.map(opt =>
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )}
          </select>
        </label>
        <label>
          {t("filter.status", "Yayın Durumu")}
          <select value={publishFilter} onChange={e => setPublishFilter(e.target.value as any)}>
            <option value="all">{t("filter.allStatus", "Tüm Durumlar")}</option>
            <option value="published">{t("published", "Yayınlandı")}</option>
            <option value="unpublished">{t("unpublished", "Yayınlanmadı")}</option>
          </select>
        </label>
        <label>
          {t("filter.search", "Ara")}
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t("filter.searchPlaceholder", "İsim, e-posta, başlık veya içerik ile ara...")}
          />
        </label>
      </FilterBar>

      {loading && <LoadingRow>{t("loading", "Yükleniyor...")}</LoadingRow>}
      {error && <Error>{error}</Error>}
      {!loading && filteredComments.length === 0 && <Empty>{t("noComments", "Henüz yorum yok.")}</Empty>}

      {!loading && filteredComments.length > 0 && (
        <>
          <StyledTable>
            <thead>
              <tr>
                <th>{t("contentType", "İçerik Türü")}</th>
                <th>{t("user", "Kullanıcı")}</th>
                <th>{t("email", "E-posta")}</th>
                <th>{t("contentTitle", "İçerik Başlığı")}</th>
                <th>{t("label", "Başlık")}</th>
                <th>{t("comment", "Yorum")}</th>
                <th>{t("date", "Tarih")}</th>
                <th>{t("status", "Durum")}</th>
                <th>{t("actions", "Eylemler")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment) => {
                const user =
                  comment.userId && typeof comment.userId === "object"
                    ? comment.userId
                    : undefined;
                let contentTitle = "-";
                if (
                  comment.contentId &&
                  typeof comment.contentId === "object" &&
                  "title" in comment.contentId &&
                  typeof comment.contentId.title === "string"
                ) {
                  contentTitle = comment.contentId.title || "-";
                }
                const commentLabel = comment.label || "-";
                return (
                  <tr key={comment._id}>
                    <td>{comment.contentType}</td>
                    <td>{user?.name || comment.name || "-"}</td>
                    <td>{user?.email || comment.email || "-"}</td>
                    <td>{contentTitle}</td>
                    <td>{commentLabel}</td>
                    <td
                      onClick={() => setSelectedComment(comment)}
                      style={{ cursor: "pointer" }}
                    >
                      {comment.text}
                    </td>
                    <td>
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      <Status $published={comment.isPublished}>
                        {comment.isPublished ? t("published", "Yayınlandı") : t("unpublished", "Yayınlanmadı")}
                      </Status>
                    </td>
                    <td>
                      <ActionButton onClick={() => handleToggle(comment._id!)}>
                        {t("toggle", "Aç/Kapat")}
                      </ActionButton>
                      <ActionButton danger onClick={() => handleDelete(comment._id!)}>{t("delete", "Sil")}</ActionButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>

          {selectedComment && (
            <CommentDetailsModal
              comment={selectedComment}
              lang={lang}
              onClose={() => setSelectedComment(null)}
            />
          )}

          {pagination.pages > 1 && (
            <PaginationBar>
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  disabled={pagination.page === i + 1}
                >
                  {i + 1}
                </button>
              ))}
            </PaginationBar>
          )}
        </>
      )}
    </Wrapper>
  );
}

// --- Styled Components (Theme Uyumu Maksimum!) ---

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  font-family: ${({ theme }) => theme.fonts.main};
  background: ${({ theme }) => theme.colors.background};
`;

const Error = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacings.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const LoadingRow = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.lg};
  flex-wrap: wrap;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  label {
    display: flex;
    flex-direction: column;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    gap: 0.22rem;
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.text};
  }

  input,
  select {
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
    min-width: 160px;
    background: ${({ theme }) => theme.colors.inputBackground};
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-family: inherit;
    transition: border ${({ theme }) => theme.transition.fast};

    &:focus {
      border-color: ${({ theme }) => theme.colors.inputBorderFocus};
      outline: 1.5px solid ${({ theme }) => theme.colors.inputOutline};
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacings.lg};

  th,
  td {
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.sm};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.base};
    vertical-align: middle;
    background: inherit;
  }

  th {
    background-color: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    border-bottom: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.primary};
    position: sticky;
    top: 0;
    z-index: 2;
    letter-spacing: 0.02em;
  }

  tr:last-child td {
    border-bottom: none;
  }

  td {
    transition: background ${({ theme }) => theme.transition.fast};
    &:hover {
      background: ${({ theme }) => theme.colors.hoverBackground};
    }
    word-break: break-word;
    max-width: 300px;
  }
`;

const Status = styled.span<{ $published: boolean }>`
  display: inline-block;
  padding: 0.3em 0.95em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: ${({ $published, theme }) => $published ? theme.colors.successBg : theme.colors.warningBackground};
  color: ${({ $published, theme }) => $published ? theme.colors.success : theme.colors.warning};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  background: ${({ danger, theme }) =>
    danger
      ? theme.colors.dangerBg
      : theme.colors.buttonBackground};
  color: ${({ danger, theme }) =>
    danger
      ? theme.colors.danger
      : theme.colors.buttonText};
  border: ${({ theme }) => theme.borders.thin} ${({ danger, theme }) =>
    danger ? theme.colors.danger : theme.colors.buttonBorder};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  margin-right: ${({ theme }) => theme.spacings.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  transition: background ${({ theme }) => theme.transition.fast}, color ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ danger, theme }) =>
      danger
        ? theme.colors.danger
        : theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const PaginationBar = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xl};
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: center;

  button {
    padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
    border: none;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.buttonText};
    border-radius: ${({ theme }) => theme.radii.sm};
    cursor: pointer;
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    font-size: ${({ theme }) => theme.fontSizes.base};
    transition: background ${({ theme }) => theme.transition.fast};

    &:disabled {
      background: ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.textSecondary};
      cursor: default;
    }
  }
`;

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
import type { IComment, CommentContentType, CommentType } from "@/modules/comment/types";
import type { SupportedLocale } from "@/types/common";
import { CommentDetailsModal } from "@/modules/comment";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";

const contentTypeOptions: { value: CommentContentType | "all"; label: string }[] = [
  { value: "all", label: "Tüm Türler" },
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
const typeOptions: { value: CommentType | "all"; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "comment", label: "Yorum" },
  { value: "testimonial", label: "Testimonial" },
  { value: "review", label: "Değerlendirme" },
  { value: "question", label: "Soru" },
  { value: "answer", label: "Cevap" },
  { value: "rating", label: "Puan" },
];

export default function AdminCommentPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("testimonial", translations3);
  const lang: SupportedLocale = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const {
    commentsAdmin = [],
    loading,
    successMessage,
    error,
    pagination = { pages: 1, page: 1 },
  } = useAppSelector((state) => state.comments);

  const [typeFilter, setTypeFilter] = useState<"all" | CommentType>("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | CommentContentType>("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "unpublished">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState<IComment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchAllCommentsAdmin({
        page: currentPage,
        commentType: typeFilter !== "all" ? typeFilter : undefined,
      })
    );
  }, [typeFilter, currentPage, dispatch]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearCommentMessages());
  }, [successMessage, error, dispatch]);

  // --- Filtering Logic ---
  const filteredComments = commentsAdmin.filter((c: any) => {
    const user = c.userId && typeof c.userId === "object" ? c.userId : undefined;
    const name = user?.name || c.name || "";
    const email = user?.email || c.email || "";
    const matchesContentType = contentTypeFilter === "all" || c.contentType === contentTypeFilter;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    const matchesStatus =
      publishFilter === "all" ||
      (publishFilter === "published" && c.isPublished) ||
      (publishFilter === "unpublished" && !c.isPublished);
    const matchesSearch =
      [name, email, c.label ?? "", c.text].join(" ").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesContentType && matchesType && matchesStatus && matchesSearch;
  });

  const handleToggle = (id: string) => dispatch(togglePublishComment(id));
  const handleDelete = (id: string) => {
    if (confirm(t("confirmDelete", "Yorumu silmek istiyor musunuz?"))) {
      dispatch(deleteComment(id));
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  // --- Main Render ---
  return (
    <Wrapper>
      <h1>{t("title", "Yorum Yönetimi")}</h1>
      <FilterBar>
        <label>
          {t("filter.typeLabel", "Yorum Tipi")}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
            {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>
          {t("filter.contentType", "İçerik Türü")}
          <select value={contentTypeFilter} onChange={e => setContentTypeFilter(e.target.value as any)}>
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

      {/* --- Masaüstü: Tablo --- */}
      {!loading && filteredComments.length > 0 && (
        <>
          <StyledTable>
            <thead>
              <tr>
                <th>{t("filter.typeLabel", "Tip")}</th>
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
              {filteredComments.map((comment: any) => {
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
                    <td>{comment.type || "-"}</td>
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

          {/* --- Mobil: Kartlar --- */}
          <MobileCards>
            {filteredComments.map((comment: any) => {
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
                <Card key={comment._id}>
                  <Row>
                    <Field>{t("filter.typeLabel", "Tip")}</Field>
                    <Value>{comment.type || "-"}</Value>
                  </Row>
                  <Row>
                    <Field>{t("contentType", "İçerik Türü")}</Field>
                    <Value>{comment.contentType}</Value>
                  </Row>
                  <Row>
                    <Field>{t("user", "Kullanıcı")}</Field>
                    <Value>{user?.name || comment.name || "-"}</Value>
                  </Row>
                  <Row>
                    <Field>{t("email", "E-posta")}</Field>
                    <Value>{user?.email || comment.email || "-"}</Value>
                  </Row>
                  <Row>
                    <Field>{t("contentTitle", "İçerik Başlığı")}</Field>
                    <Value>{contentTitle}</Value>
                  </Row>
                  <Row>
                    <Field>{t("label", "Başlık")}</Field>
                    <Value>{commentLabel}</Value>
                  </Row>
                  <Row>
                    <Field>{t("comment", "Yorum")}</Field>
                    <Value
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedComment(comment)}
                    >
                      {comment.text}
                    </Value>
                  </Row>
                  <Row>
                    <Field>{t("date", "Tarih")}</Field>
                    <Value>
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString()
                        : "-"}
                    </Value>
                  </Row>
                  <Row>
                    <Field>{t("status", "Durum")}</Field>
                    <Value>
                      <Status $published={comment.isPublished}>
                        {comment.isPublished
                          ? t("published", "Yayınlandı")
                          : t("unpublished", "Yayınlanmadı")}
                      </Status>
                    </Value>
                  </Row>
                  <Actions>
                    <ActionButton onClick={() => handleToggle(comment._id!)}>
                      {t("toggle", "Aç/Kapat")}
                    </ActionButton>
                    <ActionButton
                      danger
                      onClick={() => handleDelete(comment._id!)}
                    >
                      {t("delete", "Sil")}
                    </ActionButton>
                  </Actions>
                </Card>
              );
            })}
          </MobileCards>

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

// --- STYLED COMPONENTS ---

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  font-family: ${({ theme }) => theme.fonts.main};
  background: ${({ theme }) => theme.colors.background};
  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.sm};
  }
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
    min-width: 150px;
  }

  input,
  select {
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
    background: ${({ theme }) => theme.colors.inputBackground};
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-family: inherit;
    transition: border ${({ theme }) => theme.transition.fast};

    &:focus {
      border-color: ${({ theme }) => theme.colors.inputBorderFocus};
      outline: 1.5px solid ${({ theme }) => theme.colors.inputOutline};
    }
  }

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.sm};

    label {
      min-width: 0;
      width: 100%;
    }

    input,
    select {
      width: 100%;
    }
  }
`;

// Masaüstü tablosu (sadece geniş ekranda)
const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacings.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};

  th, td {
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.sm};
    text-align: left;
    vertical-align: middle;
    background: inherit;
    word-break: break-word;
    max-width: 240px;
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
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }

  ${({ theme }) => theme.media.small} {
    display: none;
  }
`;

// Mobilde kart görünümü
const MobileCards = styled.div`
  display: none;
  ${({ theme }) => theme.media.small} {
    display: block;
  }
`;
const Card = styled.div`
  display: none;
  ${({ theme }) => theme.media.small} {
    display: block;
    background: ${({ theme }) => theme.colors.cardBackground};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.cards.shadow};
    padding: ${({ theme }) => theme.spacings.md};
    margin-bottom: ${({ theme }) => theme.spacings.md};
  }
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 3px 0;
`;
const Field = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 110px;
  flex: 1 1 40%;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;
const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
  text-align: right;
  max-width: 55%;
  flex: 1 1 60%;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;
const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const Status = styled.span<{ $published: boolean }>`
  display: inline-block;
  padding: 0.3em 1em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: ${({ $published, theme }) =>
    $published ? theme.colors.successBg : theme.colors.warningBackground};
  color: ${({ $published, theme }) =>
    $published ? theme.colors.success : theme.colors.warning};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.borderHighlight};
  letter-spacing: 0.02em;
  min-width: 70px;
  text-align: center;
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    min-width: 56px;
    padding: 0.2em 0.6em;
  }
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'danger',
})<{ danger?: boolean }>`
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
  padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
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
  ${({ theme }) => theme.media.small} {
    margin-right: 0;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  }
`;

const PaginationBar = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xl};
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: center;
  flex-wrap: wrap;
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
    ${({ theme }) => theme.media.small} {
      font-size: ${({ theme }) => theme.fontSizes.xs};
      padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
      min-width: 32px;
    }
  }
`;

const Error = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacings.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.md};
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-top: ${({ theme }) => theme.spacings.sm};
  }
`;

const LoadingRow = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.md};
    padding: ${({ theme }) => theme.spacings.md};
  }
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
  }
`;


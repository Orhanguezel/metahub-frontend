"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
import { DetailsModal } from "@/modules/comment";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";

/* --- helpers --- */
const fmtDateTime = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.valueOf()) ? "-" : d.toLocaleString();
};

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
  { value: "portfolio", label: "Portfolio" },
  { value: "skill", label: "Skill" },
  { value: "team", label: "Team" },
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
  const { t } = useI18nNamespace("testimonial", translations3);

  const { commentsAdmin = [], loading, successMessage, error, pagination } = useAppSelector(
    (s) => s.comments
  );

  const [typeFilter, setTypeFilter] = useState<"all" | CommentType>("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | CommentContentType>("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "unpublished">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<IComment | null>(null);

  // initial fetch
  useEffect(() => {
    dispatch(fetchAllCommentsAdmin({ page: currentPage, commentType: typeFilter !== "all" ? typeFilter : undefined }));
  }, [dispatch, currentPage, typeFilter]);

  // toasts
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearCommentMessages());
  }, [successMessage, error, dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(fetchAllCommentsAdmin({ page: currentPage, commentType: typeFilter !== "all" ? typeFilter : undefined }));
  }, [dispatch, currentPage, typeFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (commentsAdmin || []).filter((c) => {
      const user = c.userId && typeof c.userId === "object" ? c.userId : undefined;
      const name = user?.name || c.name || "";
      const email = user?.email || c.email || "";
      const matchesContentType = contentTypeFilter === "all" || c.contentType === contentTypeFilter;
      const matchesType = typeFilter === "all" || c.type === typeFilter;
      const matchesStatus =
        publishFilter === "all" ||
        (publishFilter === "published" && c.isPublished) ||
        (publishFilter === "unpublished" && !c.isPublished);
      const matchesSearch = [name, email, c.label ?? "", c.text ?? ""].join(" ").toLowerCase().includes(q);
      return matchesContentType && matchesType && matchesStatus && matchesSearch;
    });
  }, [commentsAdmin, contentTypeFilter, typeFilter, publishFilter, search]);

  const handleToggle = useCallback((id: string) => dispatch(togglePublishComment(id)), [dispatch]);
  const handleDelete = useCallback(
    (id: string) => {
      if (confirm(t("confirmDelete", "Yorumu silmek istiyor musunuz?"))) {
        dispatch(deleteComment(id));
      }
    },
    [dispatch, t]
  );

  return (
    <PageWrap>
      {/* Header */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Yorum Yönetimi")}</h1>
          <Subtitle>{t("admin.subtitle", "Site genelindeki yorumları yönetin")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="comment-count">{commentsAdmin.length}</Counter>
          <PrimaryBtn onClick={onRefresh} disabled={loading}>
            {t("admin.refresh", "Yenile")}
          </PrimaryBtn>
        </Right>
      </Header>

      {/* Toolbar (filters + search) */}
      <Toolbar>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value as any)}>
          {contentTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select value={publishFilter} onChange={(e) => setPublishFilter(e.target.value as any)}>
          <option value="all">{t("filter.allStatus", "Tüm Durumlar")}</option>
          <option value="published">{t("published", "Yayınlandı")}</option>
          <option value="unpublished">{t("unpublished", "Yayınlanmadı")}</option>
        </Select>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.search", "Arama...")}
          aria-label={t("admin.search", "Arama...")}
        />
      </Toolbar>

      {/* Desktop Table */}
      <TableWrap aria-busy={!!loading}>
        <Table>
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
              <th aria-label={t("admin.actions", "İşlemler")} />
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <Empty>∅</Empty>
                </td>
              </tr>
            ) : (
              filtered.map((c: any) => {
                const user = c.userId && typeof c.userId === "object" ? c.userId : undefined;
                const contentTitle =
                  c.contentId && typeof c.contentId === "object" && typeof (c.contentId as any).title === "string"
                    ? (c.contentId as any).title
                    : "-";
                return (
                  <tr key={c._id}>
                    <td>{c.type || "-"}</td>
                    <td>{c.contentType}</td>
                    <td>{user?.name || c.name || "-"}</td>
                    <td>{user?.email || c.email || "-"}</td>
                    <td>{contentTitle}</td>
                    <td>{c.label || "-"}</td>
                    <td>
                      <SubjectLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelected(c);
                        }}
                      >
                        {c.text}
                      </SubjectLink>
                    </td>
                    <td>{fmtDateTime(c.createdAt)}</td>
                    <td>{c.isPublished ? <Badge $on>{t("published", "Yayınlandı")}</Badge> : <Badge>{t("unpublished", "Yayınlanmadı")}</Badge>}</td>
                    <td className="actions">
                      <Row>
                        <Secondary onClick={() => handleToggle(c._id!)}>{t("toggle", "Aç/Kapat")}</Secondary>
                        <Danger onClick={() => handleDelete(c._id!)}>{t("delete", "Sil")}</Danger>
                      </Row>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile Cards */}
      <CardsWrap aria-busy={!!loading}>
        {filtered.length === 0 && !loading && <Empty>∅</Empty>}
        {filtered.map((c) => {
          const user = c.userId && typeof c.userId === "object" ? c.userId : undefined;
          const contentTitle =
            c.contentId && typeof c.contentId === "object" && typeof (c.contentId as any).title === "string"
              ? (c.contentId as any).title
              : "-";
          return (
            <Card key={c._id}>
              <CardHeader>
                <HeaderLeft>
                  <NameTitle title={user?.name || c.name || "-"}>{user?.name || c.name || "-"}</NameTitle>
                  <SmallText>{user?.email || c.email || "-"}</SmallText>
                </HeaderLeft>
                <Status $on={!!c.isPublished}>
                  {c.isPublished ? t("published", "Yayınlandı") : t("unpublished", "Yayınlanmadı")}
                </Status>
              </CardHeader>

              <CardBody>
                <SmallText>
                  <b>{t("filter.typeLabel", "Tip")}:</b> {c.type || "-"}
                </SmallText>
                <SmallText>
                  <b>{t("contentType", "İçerik Türü")}:</b> {c.contentType}
                </SmallText>
                <SmallText>
                  <b>{t("contentTitle", "İçerik Başlığı")}:</b> {contentTitle}
                </SmallText>
                <SmallText>
                  <b>{t("label", "Başlık")}:</b> {c.label || "-"}
                </SmallText>
                <SmallText>
                  <b>{t("comment", "Yorum")}:</b> {c.text}
                </SmallText>
                <SmallText>
                  <b>{t("date", "Tarih")}:</b> {fmtDateTime(c.createdAt)}
                </SmallText>
              </CardBody>

              <CardActions>
                <Secondary onClick={() => handleToggle(c._id!)}>{t("toggle", "Aç/Kapat")}</Secondary>
                <Danger onClick={() => handleDelete(c._id!)}>{t("delete", "Sil")}</Danger>
                <Primary onClick={() => setSelected(c)}>{t("admin.view", "Görüntüle")}</Primary>
              </CardActions>
            </Card>
          );
        })}
      </CardsWrap>

      {/* Modal */}
      {selected && <DetailsModal comment={selected} onClose={() => setSelected(null)} />}

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <PaginationBar>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} disabled={pagination.page === i + 1}>
              {i + 1}
            </button>
          ))}
        </PaginationBar>
      )}
    </PageWrap>
  );
}

/* ---------------- styled (classic admin theme) ---------------- */

const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction:column; align-items:flex-start; gap:${({ theme }) => theme.spacings.sm};
  }
`;
const TitleBlock = styled.div`display:flex; flex-direction:column; gap:4px; h1{ margin:0; }`;
const Subtitle = styled.p`
  margin:0; color:${({ theme }) => theme.colors.textSecondary};
  font-size:${({ theme }) => theme.fontSizes.sm};
`;
const Right = styled.div`display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center;`;
const Counter = styled.span`
  padding:6px 10px; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ theme }) => theme.colors.backgroundAlt};
  font-weight:${({ theme }) => theme.fontWeights.medium};
`;

const Toolbar = styled.div`
  display:flex; gap:${({ theme }) => theme.spacings.sm}; justify-content:flex-end; flex-wrap:wrap;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;
const SearchInput = styled.input`
  font-size:${({ theme }) => theme.fontSizes.sm};
  padding:10px 12px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.md};
  min-width:260px;
  background:${({ theme }) => theme.inputs.background};
  color:${({ theme }) => theme.inputs.text};
  &::placeholder{ color:${({ theme }) => theme.inputs.placeholder}; }
`;
const Select = styled.select`
  font-size:${({ theme }) => theme.fontSizes.sm};
  padding:10px 12px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.md};
  background:${({ theme }) => theme.inputs.background};
  color:${({ theme }) => theme.inputs.text};
`;

const PrimaryBtn = styled.button`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} transparent;
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer;
  transition:opacity ${({ theme }) => theme.transition.normal};
  &:hover{ opacity:${({ theme }) => theme.opacity.hover}; background:${({ theme }) => theme.buttons.primary.backgroundHover}; }
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
`;

const TableWrap = styled.div`
  width:100%; overflow-x:auto; border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  background:${({ theme }) => theme.colors.cardBackground};
  ${({ theme }) => theme.media.mobile}{ display:none; }
`;
const Table = styled.table`
  width:100%; border-collapse:collapse;
  thead th{
    background:${({ theme }) => theme.colors.tableHeader};
    color:${({ theme }) => theme.colors.textSecondary};
    font-weight:${({ theme }) => theme.fontWeights.semiBold};
    font-size:${({ theme }) => theme.fontSizes.sm};
    padding:${({ theme }) => theme.spacings.md}; text-align:left; white-space:nowrap;
  }
  td{
    padding:${({ theme }) => theme.spacings.md};
    border-bottom:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size:${({ theme }) => theme.fontSizes.sm}; vertical-align:middle;
  }
  td.actions{ text-align:right; }
  tbody tr:hover td{ background:${({ theme }) => theme.colors.hoverBackground}; }
`;
const SubjectLink = styled.a`
  color:${({ theme }) => theme.colors.link};
  &:hover{ color:${({ theme }) => theme.colors.linkHover}; text-decoration:underline; }
`;

const CardsWrap = styled.div`
  display:none;
  ${({ theme }) => theme.media.mobile} {
    display:grid; grid-template-columns:1fr; gap:${({ theme }) => theme.spacings.md};
  }
`;
const Card = styled.article`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  overflow:hidden;
`;
const CardHeader = styled.header`
  background:${({ theme }) => theme.colors.primaryLight};
  color:${({ theme }) => theme.colors.title};
  padding:${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  display:flex; align-items:center; justify-content:space-between; gap:${({ theme }) => theme.spacings.sm};
  border-bottom:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;
const HeaderLeft = styled.div`display:flex; flex-direction:column; gap:2px; min-width:0;`;
const NameTitle = styled.span`
  font-size:${({ theme }) => theme.fontSizes.sm};
  color:${({ theme }) => theme.colors.textSecondary};
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70vw;
`;
const SmallText = styled.span`font-size:${({ theme }) => theme.fontSizes.xsmall}; color:${({ theme }) => theme.colors.textSecondary};`;
const Status = styled.span<{ $on:boolean }>`
  padding:.2em .6em; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.inputBackgroundLight)};
  color:${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textSecondary)};
  font-size:${({ theme }) => theme.fontSizes.xsmall};
`;
const CardBody = styled.div`padding:${({ theme }) => theme.spacings.md}; display:flex; flex-direction:column; gap:6px;`;
const CardActions = styled.div`
  display:flex; gap:${({ theme }) => theme.spacings.xs}; justify-content:flex-end;
  padding:${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.md};
  border-top:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;

const Row = styled.div`display:flex; gap:${({ theme }) => theme.spacings.xs}; flex-wrap:wrap; justify-content:flex-end;`;

const BaseBtn = styled.button`
  padding:8px 10px; border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} transparent; cursor:pointer;
  font-weight:${({ theme }) => theme.fontWeights.medium};
  box-shadow:${({ theme }) => theme.shadows.button};
  transition:opacity ${({ theme }) => theme.transition.normal};
  &:hover:not(:disabled){ opacity:${({ theme }) => theme.opacity.hover}; }
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
`;
const Secondary = styled(BaseBtn)`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  &:hover:not(:disabled){
    background:${({ theme }) => theme.buttons.secondary.backgroundHover};
    color:${({ theme }) => theme.buttons.secondary.textHover};
  }
`;
const Primary = styled(BaseBtn)`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  &:hover:not(:disabled){ background:${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;
const Danger = styled(BaseBtn)`
  background:${({ theme }) => theme.buttons.danger.background};
  color:${({ theme }) => theme.buttons.danger.text};
  &:hover:not(:disabled){ background:${({ theme }) => theme.buttons.danger.backgroundHover}; }
`;
const Badge = styled.span<{ $on?: boolean }>`
  display:inline-block; padding:.2em .6em; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.warningBackground)};
  color:${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textOnWarning)};
  font-size:${({ theme }) => theme.fontSizes.xsmall};
`;

const Empty = styled.div`
  display:flex; align-items:center; justify-content:center; width:100%; height:100%;
  color:${({ theme }) => theme.colors.textSecondary};
`;

const PaginationBar = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  display:flex; gap:${({ theme }) => theme.spacings.xs}; justify-content:center;
  button{
    padding:${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
    border-radius:${({ theme }) => theme.radii.md};
    border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    background:${({ theme }) => theme.colors.cardBackground};
    cursor:pointer;
    &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
  }
`;

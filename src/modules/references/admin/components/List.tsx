"use client";

import styled from "styled-components";
import { IReferences, ReferencesCategory } from "@/modules/references";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/references";
import { Skeleton } from "@/shared";
import { SupportedLocale } from "@/types/common";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

interface Props {
  references: IReferences[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: IReferences) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ReferencesList({
  references,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useI18nNamespace("references", translations);
  const categories: ReferencesCategory[] = useAppSelector(
    (state) => state.referencesCategory.categories
  );

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);

  const getMultiLang = (obj?: Record<string, string>) => {
    if (!obj) return "";
    return obj[lang] || obj["en"] || Object.values(obj)[0] || "—";
  };

  const safeReferences = useMemo(
    () => (Array.isArray(references) ? references : []),
    [references]
  );

  // group by category
  const grouped = useMemo(() => {
    const result: Record<string, IReferences[]> = {};
    for (const ref of safeReferences) {
      const catId =
        typeof ref.category === "string"
          ? ref.category
          : ref.category?._id || "none";
      if (!result[catId]) result[catId] = [];
      result[catId].push(ref);
    }
    return result;
  }, [safeReferences]);

  const noCategory = grouped["none"] || [];
  const sortedCategories = categories.filter((cat) => grouped[cat._id]?.length);

  const tabs: { key: string; label: string }[] = [
    { key: "all", label: t("references.all_categories", "All Categories") },
    ...sortedCategories.map((cat) => ({
      key: cat._id,
      label: getMultiLang(cat.name),
    })),
    ...(noCategory.length
      ? [{ key: "none", label: t("references.no_category", "No Category") }]
      : []),
  ];

  const filteredRefs = useMemo(() => {
    if (activeTab === "all") return safeReferences;
    return grouped[activeTab] || [];
  }, [activeTab, safeReferences, grouped]);

  // --- derive pagination ---
  const total = filteredRefs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * limit;
  const end = start + limit;
  const pageItems = filteredRefs.slice(start, end);

  // sekme/limit değişince 1. sayfaya dön ve seçimleri temizle
  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [activeTab, limit]);

  // total değişince sayfa sınırını düzelt
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // ...’li sayfa listesi
  const pageList = useMemo(() => {
    const list: (number | string)[] = [];
    const win = 1; // current ±1
    const add = (v: number | string) => list.push(v);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return list;
    }
    add(1);
    if (clampedPage > 2 + win) add("…");
    for (let i = Math.max(2, clampedPage - win); i <= Math.min(totalPages - 1, clampedPage + win); i++) add(i);
    if (clampedPage < totalPages - (1 + win)) add("…");
    add(totalPages);
    return list;
  }, [clampedPage, totalPages]);

  // selection
  const isAllSelected =
    pageItems.length > 0 && pageItems.every((it) => selected.includes(it._id));

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected((prev) =>
        prev.filter((id) => !pageItems.some((it) => it._id === id))
      );
    } else {
      setSelected((prev) => [
        ...prev,
        ...pageItems.map((it) => it._id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleDeleteSelected = () => {
    if (!onDelete || selected.length === 0) return;
    if (
      window.confirm(
        t(
          "references.delete_selected_confirm",
          "Are you sure you want to delete all selected references?"
        )
      )
    ) {
      const toDelete = selected.filter((id) =>
        pageItems.some((it) => it._id === id)
      );
      toDelete.forEach((id) => onDelete(id));
      setSelected((prev) => prev.filter((id) => !toDelete.includes(id)));
    }
  };

  // --- Render guards ---
  if (loading) {
    return (
      <SkeletonWrapper>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }
  if (error) return <ErrorText>❌ {error}</ErrorText>;
  if (!safeReferences.length)
    return <Empty>{t("references.empty", "No references available.")}</Empty>;

  return (
    <div>
      <TabsWrapper>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsWrapper>

      <TopRow>
        <BulkActions>
          <label>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              disabled={pageItems.length === 0}
            />
            {t("references.select_all", "Select All (this page)")}
          </label>
          {selected.length > 0 && (
            <DeleteSelectedButton onClick={handleDeleteSelected}>
              {t("references.delete_selected", "Delete Selected")}
              <span>({selected.length})</span>
            </DeleteSelectedButton>
          )}
        </BulkActions>

        <RightControls>
          <SmallInfo>
            {t("references.total", "{{count}} items", { count: total as any })}
          </SmallInfo>
          <PerPageWrap>
            <label htmlFor="per-page">
              {t("references.per_page", "Per page")}
            </label>
            <select
              id="per-page"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[12, 24, 48, 96].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </PerPageWrap>
        </RightControls>
      </TopRow>

      <Grid>
        {pageItems.map((item) => (
          <Card key={item._id} $selected={selected.includes(item._id)}>
            <CheckboxWrapper>
              <input
                type="checkbox"
                checked={selected.includes(item._id)}
                onChange={() => handleSelect(item._id)}
              />
            </CheckboxWrapper>

            <LogoBox>
              {item.images?.[0]?.url ? (
                <Image
                  src={item.images[0].url}
                  alt={getMultiLang(item.title) || "Logo"}
                  width={90}
                  height={60}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <NoLogo>{t("references.no_images", "No logo")}</NoLogo>
              )}
            </LogoBox>

            <CompanyName>{getMultiLang(item.title) || <>&nbsp;</>}</CompanyName>

            <CardActions>
              {onEdit && (
                <ActionButton
                  onClick={() => onEdit(item)}
                  aria-label={t("edit", "Edit")}
                >
                  {t("edit", "Edit")}
                </ActionButton>
              )}
              {onDelete && (
                <DeleteButton
                  onClick={() => onDelete(item._id)}
                  aria-label={t("delete", "Delete")}
                >
                  {t("delete", "Delete")}
                </DeleteButton>
              )}
              {onTogglePublish && (
                <ToggleButton
                  onClick={() =>
                    onTogglePublish(item._id, item.isPublished)
                  }
                  aria-label={
                    item.isPublished
                      ? t("references.unpublish", "Unpublish")
                      : t("references.publish", "Publish")
                  }
                >
                  {item.isPublished
                    ? t("references.unpublish", "Unpublish")
                    : t("references.publish", "Publish")}
                </ToggleButton>
              )}
            </CardActions>
          </Card>
        ))}
      </Grid>

      {pageItems.length === 0 && (
        <Empty>
          {t("references.empty_in_category", "No references in this category.")}
        </Empty>
      )}

      {totalPages > 1 && (
        <PaginationBar role="navigation" aria-label="Pagination">
          <PageButton
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={clampedPage === 1}
            aria-label={t("pagination.prev", "Previous")}
          >
            ‹
          </PageButton>

          {pageList.map((p, i) =>
            typeof p === "number" ? (
              <PageButton
                key={`${p}-${i}`}
                $active={p === clampedPage}
                onClick={() => setPage(p)}
                aria-current={p === clampedPage ? "page" : undefined}
              >
                {p}
              </PageButton>
            ) : (
              <Ellipsis key={`e-${i}`} aria-hidden>
                …
              </Ellipsis>
            )
          )}

          <PageButton
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={clampedPage === totalPages}
            aria-label={t("pagination.next", "Next")}
          >
            ›
          </PageButton>
        </PaginationBar>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */
const SkeletonWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const TabsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.55rem 1.3rem;
  border: none;
  border-radius: 24px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 2px 12px 0 ${theme.colors.primary}33` : "none"};
  outline: none;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
  }
`;

const TopRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.97em;
  label {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SmallInfo = styled.div`
  font-size: 0.92em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PerPageWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  label {
    font-size: 0.9em;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  select {
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.cardBackground};
  }
`;

const DeleteSelectedButton = styled.button`
  padding: 0.45rem 1.1rem;
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1.1rem 1.5rem;
`;

const Card = styled.div<{ $selected?: boolean }>`
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg || "12px"};
  padding: 1rem 0.5rem 0.7rem 0.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 0 2px #4b9efc33" : "none"};
  transition: border 0.2s, box-shadow 0.2s;
`;

const CheckboxWrapper = styled.div`
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  z-index: 2;
  input[type="checkbox"] {
    width: 1.1em;
    height: 1.1em;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

const LogoBox = styled.div`
  margin-bottom: 0.7rem;
  background: #fff;
  border-radius: 7px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 60px;
  overflow: hidden;
`;

const NoLogo = styled.span`
  font-size: 0.9em;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
`;

const CompanyName = styled.div`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-align: center;
  width: 100%;
  word-break: break-word;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  padding: 0.25rem 0.7rem;
  background: ${({ theme }) => theme.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.96em;
`;

const DeleteButton = styled.button`
  padding: 0.25rem 0.7rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.96em;
`;

const ToggleButton = styled.button`
  padding: 0.25rem 0.7rem;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.96em;
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 2rem 0;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: bold;
  margin: 2rem 0;
`;

const PaginationBar = styled.div`
  display: flex;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
  margin: 1.25rem 0 0.5rem;
  flex-wrap: wrap;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 0.6rem;
  border-radius: 8px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.cardBackground};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: .5; cursor: not-allowed; }
`;

const Ellipsis = styled.span`
  padding: 0 0.35rem;
  user-select: none;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

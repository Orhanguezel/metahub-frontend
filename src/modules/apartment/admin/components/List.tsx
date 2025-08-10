"use client";

import styled from "styled-components";
import { IApartment, ApartmentCategory } from "@/modules/apartment";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { Skeleton } from "@/shared";
import { SupportedLocale } from "@/types/common";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

interface Props {
  apartment: IApartment[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: IApartment) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ApartmentList({
  apartment,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useI18nNamespace("apartment", translations);
  const categories: ApartmentCategory[] = useAppSelector(
    (state) => state.apartmentCategory.categories
  );

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);

  // pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);

  const getMultiLang = (obj?: Record<string, string>) => {
    if (!obj) return "";
    return obj[lang] || obj["en"] || Object.values(obj)[0] || "—";
  };

  const safeApartment = useMemo(
    () => (Array.isArray(apartment) ? apartment : []),
    [apartment]
  );

  // group by category
  const grouped = useMemo(() => {
    const result: Record<string, IApartment[]> = {};
    for (const ref of safeApartment) {
      const catId =
        typeof ref.category === "string"
          ? ref.category
          : ref.category?._id || "none";
      if (!result[catId]) result[catId] = [];
      result[catId].push(ref);
    }
    return result;
  }, [safeApartment]);

  const noCategory = grouped["none"] || [];
  const sortedCategories = categories.filter((cat) => grouped[cat._id]?.length);

  const tabs: { key: string; label: string }[] = [
    { key: "all", label: t("apartment.all_categories", "All Categories") },
    ...sortedCategories.map((cat) => ({
      key: cat._id,
      label: getMultiLang(cat.name),
    })),
    ...(noCategory.length
      ? [{ key: "none", label: t("apartment.no_category", "No Category") }]
      : []),
  ];

  const filteredRefs = useMemo(() => {
    if (activeTab === "all") return safeApartment;
    return grouped[activeTab] || [];
  }, [activeTab, safeApartment, grouped]);

  // derive pagination
  const total = filteredRefs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * limit;
  const end = start + limit;
  const pageItems = filteredRefs.slice(start, end);

  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [activeTab, limit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageList = useMemo(() => {
    const list: (number | string)[] = [];
    const windowSize = 1;
    const add = (v: number | string) => list.push(v);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
      return list;
    }
    add(1);
    if (clampedPage > 2 + windowSize) add("…");
    for (
      let i = Math.max(2, clampedPage - windowSize);
      i <= Math.min(totalPages - 1, clampedPage + windowSize);
      i++
    ) add(i);
    if (clampedPage < totalPages - (1 + windowSize)) add("…");
    add(totalPages);
    return list;
  }, [clampedPage, totalPages]);

  const isAllSelected =
    pageItems.length > 0 &&
    pageItems.every((item) => selected.includes(item._id));

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected((prev) =>
        prev.filter((id) => !pageItems.some((item) => item._id === id))
      );
    } else {
      setSelected((prev) => [
        ...prev,
        ...pageItems.map((item) => item._id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleDeleteSelected = () => {
    if (!onDelete || selected.length === 0) return;
    if (
      window.confirm(
        t(
          "apartment.delete_selected_confirm",
          "Are you sure you want to delete all selected items?"
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

  // guards
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
  if (!safeApartment.length)
    return <Empty>{t("apartment.empty", "No apartment available.")}</Empty>;

  return (
    <div>
      <TabsWrapper>
        {tabs.map((tab) => (
          <Chip
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </Chip>
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
            {t("apartment.select_all", "Select All (this page)")}
          </label>
          {selected.length > 0 && (
            <DeleteSelectedButton onClick={handleDeleteSelected}>
              {t("apartment.delete_selected", "Delete Selected")}
              <span>({selected.length})</span>
            </DeleteSelectedButton>
          )}
        </BulkActions>

        <RightControls>
          <SmallInfo>
            {t("apartment.total", "{{count}} items", {
              count: total as any,
            })}
          </SmallInfo>
          <PerPageWrap>
            <label htmlFor="per-page">
              {t("apartment.per_page", "Per page")}
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
        {pageItems.map((item) => {
          const previewSrc =
            item.images?.[0]?.thumbnail || item.images?.[0]?.url || "";
          const title = getMultiLang(item.title) || "";
          const addressLine =
            (item as any)?.address?.city ||
            (item as any)?.address?.fullText ||
            "";
          return (
            <Card key={item._id} $selected={selected.includes(item._id)}>
              <CheckboxWrapper>
                <input
                  type="checkbox"
                  checked={selected.includes(item._id)}
                  onChange={() => handleSelect(item._id)}
                />
              </CheckboxWrapper>

              <Badges>
                <Badge $type={item.isActive ? "active" : "inactive"}>
                  {item.isActive ? t("active", "Active") : t("inactive", "Inactive")}
                </Badge>
                <Badge $type={item.isPublished ? "published" : "unpublished"}>
                  {item.isPublished ? t("published", "Published") : t("unpublished", "Unpublished")}
                </Badge>
              </Badges>

              <LogoBox>
                {previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt={title || "image"}
                    width={180}
                    height={110}
                    style={{ objectFit: "contain", width: "100%", height: "auto" }}
                  />
                ) : (
                  <NoLogo>{t("apartment.no_images", "No image")}</NoLogo>
                )}
              </LogoBox>

              <CompanyName title={title}>{title || <>&nbsp;</>}</CompanyName>
              {addressLine && <AddressLine>{addressLine}</AddressLine>}

              <CardActions>
                {onEdit && (
                  <ActionButton onClick={() => onEdit(item)} aria-label={t("edit", "Edit")}>
                    {t("edit", "Edit")}
                  </ActionButton>
                )}
                {onDelete && (
                  <DeleteButton onClick={() => onDelete(item._id)} aria-label={t("delete", "Delete")}>
                    {t("delete", "Delete")}
                  </DeleteButton>
                )}
                {onTogglePublish && (
                  <ToggleButton
                    onClick={() => onTogglePublish(item._id, item.isPublished)}
                    aria-label={
                      item.isPublished ? t("apartment.unpublish", "Unpublish") : t("apartment.publish", "Publish")
                    }
                  >
                    {item.isPublished ? t("apartment.unpublish", "Unpublish") : t("apartment.publish", "Publish")}
                  </ToggleButton>
                )}
              </CardActions>
            </Card>
          );
        })}
      </Grid>

      {pageItems.length === 0 && (
        <Empty>{t("apartment.empty_in_category", "No apartment in this category.")}</Empty>
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

/* yatay kaydırılan kategori chip'leri */
const TabsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;

  ${({ theme }) => theme.media.small} {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: .25rem;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    & > * { flex: 0 0 auto; scroll-snap-align: start; }
  }
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1.1rem;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.cardBackground)};
  color: ${({ $active }) => ($active ? "#fff" : "inherit")};
  font-weight: 600;
  white-space: nowrap;
`;

const TopRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.small} {
    align-items: stretch;
    gap: .6rem;
  }
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.97em;
  label { cursor: pointer; display: flex; align-items: center; gap: 0.5em; }
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    justify-content: space-between;
  }
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
    padding: 0.35rem 0.55rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.cardBackground};
  }

  ${({ theme }) => theme.media.small} {
    label { display: none; }      /* mobilde sadeleştir */
  }
`;

const DeleteSelectedButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  gap: 1rem 1.2rem;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr; /* telefonda tek sütun */
  }
`;

const Card = styled.div<{ $selected?: boolean }>`
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1rem 0.75rem 0.9rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  display: flex; flex-direction: column; align-items: center;
  position: relative; transition: border .2s, box-shadow .2s;

  ${({ theme }) => theme.media.small} {
    padding: 1rem;
  }
`;

const CheckboxWrapper = styled.div`
  position: absolute; top: .7rem; left: .7rem; z-index: 2;
  input[type="checkbox"] { width: 1.2em; height: 1.2em; accent-color: ${({ theme }) => theme.colors.primary}; }
`;

const Badges = styled.div`
  position: absolute; top: .6rem; right: .6rem;
  display: flex; gap: .35rem;

  ${({ theme }) => theme.media.small} {
    gap: .25rem;
  }
`;

const Badge = styled.span<{ $type: "active" | "inactive" | "published" | "unpublished" }>`
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.7em;
  font-weight: 700;
  color: #fff;
  background: ${({ $type, theme }) =>
    $type === "active" ? theme.colors.success
    : $type === "published" ? theme.colors.primary
    : $type === "unpublished" ? theme.colors.warning
    : theme.colors.textSecondary};
`;

const LogoBox = styled.div`
  width: 100%;
  height: 110px;
  margin-bottom: .6rem;
  background: #fff;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: grid; place-items: center;
  overflow: hidden;

  ${({ theme }) => theme.media.small} {
    height: 120px;
  }
`;

const NoLogo = styled.span`
  font-size: 0.9em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CompanyName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: .2rem;
  width: 100%;
  word-break: break-word;
`;

const AddressLine = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: .5rem;
`;

const CardActions = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: .5rem;
  margin-top: auto;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    grid-auto-flow: initial;
    grid-template-columns: 1fr 1fr;
  }
`;

const ButtonBase = styled.button`
  border: none;
  border-radius: 10px;
  padding: .55rem .8rem;
  font-weight: 700;
  cursor: pointer;
`;

const ActionButton = styled(ButtonBase)`
  background: ${({ theme }) => theme.buttons.warning.background};
  color: ${({ theme }) => theme.buttons.warning.text};
  &:hover { background: ${({ theme }) => theme.buttons.warning.backgroundHover}; }
`;

const DeleteButton = styled(ButtonBase)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  &:hover { background: ${({ theme }) => theme.buttons.danger.backgroundHover}; }
`;

const ToggleButton = styled(ButtonBase)`
  background: ${({ theme }) => theme.buttons.success.background};
  color: ${({ theme }) => theme.buttons.success.text};
  &:hover { background: ${({ theme }) => theme.buttons.success.backgroundHover}; }

  ${({ theme }) => theme.media.small} {
    grid-column: 1 / -1; /* mobilde altta tam genişlik */
  }
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
  display: flex; gap: .35rem; align-items: center; justify-content: center;
  margin: 1.25rem 0 .5rem; flex-wrap: wrap;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 40px; height: 40px; padding: 0 .6rem; border-radius: 10px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.cardBackground)};
  color: ${({ $active }) => ($active ? "#fff" : "inherit")};
  font-weight: 700; cursor: pointer;
  &:disabled { opacity: .5; cursor: not-allowed; }
`;

const Ellipsis = styled.span`
  padding: 0 .35rem; user-select: none; color: ${({ theme }) => theme.colors.textSecondary};
`;

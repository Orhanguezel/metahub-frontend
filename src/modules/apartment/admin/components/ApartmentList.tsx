"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/apartment/locales";
import type { SupportedLocale } from "@/types/common";
import type { IApartment } from "@/modules/apartment/types";
import { deleteApartment, togglePublishApartment } from "@/modules/apartment/slice/apartmentSlice";

/** Admin filter tipi — parent yönetecek */
export type ApartmentAdminFilters = Partial<{
  language: SupportedLocale;
  neighborhood: string;
  q: string;
  isPublished: boolean;
  isActive: boolean;
  nearLng: number;
  nearLat: number;
  nearRadius: number;

  /** NEW (ops & relations) */
  customer: string;   // manager (customer._id)
  employee: string;   // ops.employees[*]
  supervisor: string; // ops.supervisor
  service: string;    // ops.services.service
  cashDay: number;    // ops.cashCollectionDay (1..31)
}>;

/** Dil öncelikli i18n seçimi */
function firstLocaleValue(obj?: Record<string, string>, preferred?: string) {
  if (!obj) return "-";
  if (preferred && typeof obj[preferred] === "string" && obj[preferred].trim()) return obj[preferred].trim();
  for (const v of Object.values(obj)) if (typeof v === "string" && v.trim()) return v.trim();
  return "-";
}

export default function ApartmentList({
  items,
  loading,
  filters,
  onFilterChange,
  onEdit,
}: {
  items: IApartment[];
  loading?: boolean;
  filters: ApartmentAdminFilters;
  onFilterChange: (next: ApartmentAdminFilters) => void;
  onEdit: (a: IApartment) => void;
}) {
  const { t, i18n } = useI18nNamespace("apartment", translations);
  const dispatch = useAppDispatch();
  const lang = (i18n.language || "en").slice(0, 2) as SupportedLocale;

  // Neighborhood store (parent fetch ediyor)
  const { items: neighborhoodItems = [], loading: neighborhoodsLoading } =
    useAppSelector((s) => (s as any).neighborhood || {});

  // NEW: Diğer modüllerden selector’lar
  const customers = useAppSelector((state) => state.customer.customerAdmin) ?? [];
  const serviceItems = useAppSelector((s) => (s as any)?.servicecatalog?.items) ?? [];
  const {
    employeesAdmin,
    loading: employeesLoading,
  } = useAppSelector((s) => s.employees);

  // local UI state
  const [local, setLocal] = useState<ApartmentAdminFilters>(filters || {});
  const onF = <K extends keyof ApartmentAdminFilters>(k: K, v: ApartmentAdminFilters[K]) =>
    setLocal((s) => ({ ...s, [k]: v }));

  const apply = () => { onFilterChange(local); setPage(1); };
  const reset = () => { setLocal({}); onFilterChange({}); setPage(1); };

  const total = items?.length || 0;
  const hasItems = total > 0;

  // ------- Pagination (client-side) -------
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(24);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pageItems = useMemo(() => (items || []).slice(start, end), [items, start, end]);

  const pageList = useMemo(() => {
    const list: (number | string)[] = [];
    const windowSize = 1; // current ±1
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) list.push(i); return list; }
    list.push(1);
    if (currentPage > 2 + windowSize) list.push("…");
    for (let i = Math.max(2, currentPage - windowSize); i <= Math.min(totalPages - 1, currentPage + windowSize); i++) {
      list.push(i);
    }
    if (currentPage < totalPages - (1 + windowSize)) list.push("…");
    list.push(totalPages);
    return list;
  }, [currentPage, totalPages]);

  // ------- Helpers for labels -------
  const custLabel = (c: any) =>
    c?.companyName?.trim?.() ||
    c?.contactName?.trim?.() ||
    c?.email?.trim?.() ||
    c?._id;

  const empLabel = (e: any) =>
    e?.fullName?.trim?.() ||
    [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim() ||
    e?.email?.trim?.() ||
    e?._id;

  const svcLabel = (s: any) => {
    if (!s) return "";
    const nm = typeof s.name === "string" ? s.name : firstLocaleValue(s.name, lang);
    return nm && nm !== "-" ? nm : (s.code || s._id || "");
  };

  // ------- Actions -------
  const confirmDelete = async (id: string, slug: string) => {
    const ok = window.confirm(t("list.confirmDelete", "Delete {{slug}}?", { slug }));
    if (!ok) return;
    await dispatch(deleteApartment(id) as any).unwrap().catch(() => {});
  };

  const togglePublish = (a: IApartment) =>
    dispatch(togglePublishApartment({ id: a._id, isPublished: !a.isPublished }) as any);

  // birleşik loading (opsiyonel)
  const uiLoading = !!(loading || neighborhoodsLoading || employeesLoading);

  return (
    <Wrap>
      {/* Filters */}
      <Toolbar role="region" aria-label={t("list.filters", "Filters")}>
        <Filters>
          <Input placeholder={t("list.search", "Search text")} value={local.q || ""} onChange={(e)=>onF("q", e.target.value)} />

          <Select
            value={local.neighborhood || ""}
            onChange={(e)=>onF("neighborhood", e.target.value || undefined)}
            disabled={neighborhoodsLoading}
            aria-label={t("list.neighborhood","Neighborhood")}
            title={t("list.neighborhood","Neighborhood")}
          >
            <option value="">{neighborhoodsLoading ? t("common.loading","Loading…") : t("list.neighborhood.any","All neighborhoods")}</option>
            {neighborhoodItems.map((n: any) => (
              <option key={n._id} value={n._id}>
                {firstLocaleValue(n.name, lang) || n.slug || n._id}
              </option>
            ))}
          </Select>

          <Select
            value={local.isPublished === undefined ? "" : String(local.isPublished)}
            onChange={(e)=>onF("isPublished", e.target.value === "" ? undefined : e.target.value === "true")}
          >
            <option value="">{t("list.published.any","Published?")}</option>
            <option value="true">{t("list.published.only","Only Published")}</option>
            <option value="false">{t("list.published.no","Unpublished")}</option>
          </Select>

          <Select
            value={local.isActive === undefined ? "" : String(local.isActive)}
            onChange={(e)=>onF("isActive", e.target.value === "" ? undefined : e.target.value === "true")}
          >
            <option value="">{t("list.active.any","Active?")}</option>
            <option value="true">{t("list.active.only","Only Active")}</option>
            <option value="false">{t("list.active.no","Inactive")}</option>
          </Select>

          {/* NEW: Customer (manager) */}
          <Select
            value={local.customer || ""}
            onChange={(e)=>onF("customer", e.target.value || undefined)}
            aria-label={t("list.customer","Manager")}
            title={t("list.customer","Manager")}
          >
            <option value="">{t("list.customer.any","All managers")}</option>
            {customers.map((c: any) => (
              <option key={c._id} value={c._id}>{custLabel(c)}</option>
            ))}
          </Select>

          {/* NEW: Employee */}
          <Select
            value={local.employee || ""}
            onChange={(e)=>onF("employee", e.target.value || undefined)}
            aria-label={t("list.employee","Employee")}
            title={t("list.employee","Employee")}
            disabled={employeesLoading}
          >
            <option value="">{employeesLoading ? t("common.loading","Loading…") : t("list.employee.any","All employees")}</option>
            {employeesAdmin.map((emp: any) => (
              <option key={emp._id} value={emp._id}>{empLabel(emp)}</option>
            ))}
          </Select>

          {/* NEW: Supervisor */}
          <Select
            value={local.supervisor || ""}
            onChange={(e)=>onF("supervisor", e.target.value || undefined)}
            aria-label={t("list.supervisor","Supervisor")}
            title={t("list.supervisor","Supervisor")}
            disabled={employeesLoading}
          >
            <option value="">{employeesLoading ? t("common.loading","Loading…") : t("list.supervisor.any","All supervisors")}</option>
            {employeesAdmin.map((emp: any) => (
              <option key={emp._id} value={emp._id}>{empLabel(emp)}</option>
            ))}
          </Select>

          {/* NEW: Service */}
          <Select
            value={local.service || ""}
            onChange={(e)=>onF("service", e.target.value || undefined)}
            aria-label={t("list.service","Service")}
            title={t("list.service","Service")}
          >
            <option value="">{t("list.service.any","All services")}</option>
            {serviceItems.map((svc: any) => (
              <option key={svc._id} value={svc._id}>{svcLabel(svc)}</option>
            ))}
          </Select>

          {/* NEW: Cash collection day */}
          <Select
            value={local.cashDay === undefined ? "" : String(local.cashDay)}
            onChange={(e)=>onF("cashDay", e.target.value ? Number(e.target.value) : undefined)}
            aria-label={t("list.cashDay","Cash day")}
            title={t("list.cashDay","Cash day")}
          >
            <option value="">{t("list.cashDay.any","Any cash day")}</option>
            {Array.from({length:31}, (_,i)=>i+1).map((d)=>(
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Filters>

        <Actions>
          <Secondary type="button" onClick={reset} disabled={uiLoading}>{t("list.reset","Reset")}</Secondary>
          <Primary type="button" onClick={apply} disabled={uiLoading}>{uiLoading ? t("common.loading","Loading…") : t("list.apply","Apply")}</Primary>
        </Actions>
      </Toolbar>

      {/* Top row: count + per-page */}
      <TopRow>
        <SmallInfo aria-live="polite">
          {t("list.total","{{count}} items", { count: total as any })}
        </SmallInfo>
        <PerPageWrap>
          <label htmlFor="per-page">{t("list.perPage","Per page")}</label>
          <select
            id="per-page"
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            {[12, 24, 48, 96].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </PerPageWrap>
      </TopRow>

      {!hasItems && !uiLoading && <Empty role="status">{t("list.empty","No items found")}</Empty>}

      {/* Cards (ALL breakpoints) */}
      <Cards aria-label={t("list.cards","Apartments")}>
        {pageItems.map((a) => {
          const title = firstLocaleValue(a.title as any, lang);
          return (
            <Card key={a._id}>
              <Thumb $bg={a.images?.[0]?.thumbnail || a.images?.[0]?.webp || a.images?.[0]?.url} />
              <Body>
                <H3 title={title !== "-" ? title : a.slug}>{title !== "-" ? title : a.slug}</H3>
                <Meta>
                  <span>{a.address?.fullText || `${a.address?.city || ""}`}</span>
                  <Dot>•</Dot>
                  <span>{a.isPublished ? t("list.published","Published") : t("list.unpublished","Draft")}</span>
                  <Dot>•</Dot>
                  <span>{a.isActive ? t("common.active","Active") : t("common.inactive","Inactive")}</span>
                </Meta>
                <TagWrap>
                  {(a.place?.cityCode || a.place?.districtCode || a.place?.zip) && (
                    <>
                      {a.place?.cityCode && <Tag>{a.place.cityCode}</Tag>}
                      {a.place?.districtCode && <Tag>{a.place.districtCode}</Tag>}
                      {a.place?.zip && <Tag>{a.place.zip}</Tag>}
                    </>
                  )}
                </TagWrap>
              </Body>

              <Row>
                <Secondary onClick={() => onEdit(a)}>{t("list.edit","Edit")}</Secondary>
                <Secondary onClick={() => togglePublish(a)}>
                  {a.isPublished ? t("list.unpublish","Unpublish") : t("list.publish","Publish")}
                </Secondary>
                <Danger onClick={() => confirmDelete(a._id, a.slug)}>{t("list.delete","Delete")}</Danger>
              </Row>
            </Card>
          );
        })}
      </Cards>

      {/* Pagination bar */}
      {totalPages > 1 && (
        <PaginationBar role="navigation" aria-label={t("list.pagination","Pagination")}>
          <PageButton
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label={t("pagination.prev","Previous")}
          >
            ‹
          </PageButton>

          {pageList.map((p, i) =>
            typeof p === "number" ? (
              <PageButton
                key={`${p}-${i}`}
                $active={p === currentPage}
                onClick={() => setPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </PageButton>
            ) : (
              <Ellipsis key={`e-${i}`} aria-hidden>…</Ellipsis>
            )
          )}

          <PageButton
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label={t("pagination.next","Next")}
          >
            ›
          </PageButton>
        </PaginationBar>
      )}
    </Wrap>
  );
}

/* ============ styled (classicTheme) ============ */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;

const Toolbar = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
  background:${({theme})=>theme.colors.cardBackground}; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg}; padding:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{ flex-direction:column; align-items:stretch; }
`;

const Filters = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
`;
const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm};`;

const TopRow = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
  flex-wrap:wrap;
`;

const SmallInfo = styled.div`
  font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};
`;

const PerPageWrap = styled.div`
  display:flex; align-items:center; gap:.45rem;
  label{ font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary}; }
  select{
    padding:.35rem .55rem; border-radius:8px; border:1px solid ${({theme})=>theme.colors.border};
    background:${({theme})=>theme.colors.cardBackground};
  }
`;

const Input = styled.input`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  &::placeholder{ color:${({theme})=>theme.colors.placeholder}; }
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; background:${({theme})=>theme.colors.inputBackgroundFocus}; }
`;

const Select = styled.select`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;

const BaseButton = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  border:${({theme})=>theme.borders.thin} transparent; transition:${({theme})=>theme.transition.normal};
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
  &:focus-visible{ outline:none; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;

const Primary = styled(BaseButton)`
  background:${({theme})=>theme.buttons.primary.background}; color:${({theme})=>theme.buttons.primary.text};
  border-color:${({theme})=>theme.buttons.primary.backgroundHover};
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; color:${({theme})=>theme.buttons.primary.textHover}; }
`;

const Secondary = styled(BaseButton)`
  background:${({theme})=>theme.buttons.secondary.background}; color:${({theme})=>theme.buttons.secondary.text};
  border-color:${({theme})=>theme.colors.border};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; color:${({theme})=>theme.buttons.secondary.textHover}; }
`;

const Danger = styled(BaseButton)`
  background:${({theme})=>theme.colors.dangerBg}; color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger}; &:hover{ filter:brightness(0.98); }
`;

/* Tüm kırılımlarda kart ızgarası */
const Cards = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.md};
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;

const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground}; border-radius:${({theme})=>theme.radii.xl};
  overflow:hidden; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  box-shadow:${({theme})=>theme.cards.shadow}; display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.sm};
`;

const Thumb = styled.div<{ $bg?: string }>`
  padding-top:56%; background:${({$bg})=> $bg ? `url(${$bg}) center/cover no-repeat` : "#eee"};
`;

const Body = styled.div`padding:${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.md} 0;`;

const H3 = styled.h3`
  margin:0 0 ${({theme})=>theme.spacings.xs} 0; font-size:${({theme})=>theme.fontSizes.medium}; color:${({theme})=>theme.colors.title};
`;

const Meta = styled.div`
  color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall};
  display:flex; align-items:center; gap:${({theme})=>theme.spacings.xs}; flex-wrap:wrap;
`;

const Dot = styled.span`opacity:.6;`;

const TagWrap = styled.div`
  padding:0 ${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.md};
  display:flex; gap:${({theme})=>theme.spacings.xs}; flex-wrap:wrap;
`;

const Tag = styled.span`
  background:${({theme})=>theme.colors.tagBackground}; color:${({theme})=>theme.colors.textSecondary};
  border-radius:${({theme})=>theme.radii.pill}; padding:2px 8px; font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const Row = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.xs}; justify-content:flex-end;
  padding:${({theme})=>theme.spacings.md}; border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;

const PaginationBar = styled.div`
  display:flex; gap:.35rem; align-items:center; justify-content:center;
  margin: 1.25rem 0 .5rem; flex-wrap:wrap;
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

const Empty = styled.div`
  padding:${({theme})=>theme.spacings.md} 0; color:${({theme})=>theme.colors.textSecondary}; text-align:center;
`;

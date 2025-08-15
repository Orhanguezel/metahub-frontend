"use client";
import styled from "styled-components";
import { useState, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/servicecatalog";
import type { SupportedLocale } from "@/types/common";
import type { CatalogAdminFilters, IServiceCatalog, TranslatedLabel } from "@/modules/servicecatalog/types";
import { deleteCatalog, fetchCatalogs, setSelectedSvc } from "@/modules/servicecatalog/slice/serviceCatalogSlice";

/* FE normalize */
const toUpperSnake = (s: string) =>
  s?.toString().trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "").toUpperCase();

/** Dinamik ve type-safe locale seçimi */
function firstLocaleValue(obj?: TranslatedLabel, preferred?: SupportedLocale) {
  if (!obj) return "-";
  if (preferred) {
    const v = obj[preferred];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  for (const k of Object.keys(obj) as (keyof TranslatedLabel)[]) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "-";
}

export default function CatalogList({
  items,
  loading,
  onEdit,
}: {
  items: IServiceCatalog[];
  loading?: boolean;
  onEdit: (s: IServiceCatalog) => void;
}) {
  const { i18n, t } = useI18nNamespace("servicecatalog", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;
  const dispatch = useAppDispatch();

  const [f, setF] = useState<CatalogAdminFilters>({});
  const onF = (k: keyof CatalogAdminFilters, v: any) => setF((s) => ({ ...s, [k]: v }));
  const canApply = useMemo(() => true, []);

  const applyFilters = () => dispatch(fetchCatalogs(f));
  const resetFilters = () => {
    setF({});
    dispatch(fetchCatalogs());
  };

  const confirmDelete = async (id: string, code: string) => {
    const ok = window.confirm(t("list.confirmDelete", "Delete {{code}}?", { code }));
    if (!ok) return;
    await dispatch(deleteCatalog(id));
  };

  return (
    <Wrap>
      <Toolbar role="region" aria-label={t("list.filters", "Filters")}>
        <Filters>
          <Input
            placeholder={t("list.search", "Search")}
            value={f.q || ""}
            onChange={(e) => onF("q", e.target.value)}
            aria-label={t("list.search", "Search")}
          />

          <Input
            placeholder={t("list.code", "Code")}
            value={f.code || ""}
            onChange={(e) => onF("code", e.target.value)}
            onBlur={(e) => onF("code", toUpperSnake(e.target.value))}
            aria-label={t("list.code", "Code")}
            autoComplete="off"
          />

          <Select
            value={f.isActive === undefined ? "" : String(f.isActive)}
            onChange={(e) => onF("isActive", e.target.value === "" ? undefined : e.target.value === "true")}
            aria-label={t("list.activeFilter", "Active?")}
          >
            <option value="">{t("list.active.any", "Active?")}</option>
            <option value="true">{t("list.active.only", "Only Active")}</option>
            <option value="false">{t("list.active.inactive", "Inactive")}</option>
          </Select>
        </Filters>

        <Actions>
          <Secondary type="button" onClick={resetFilters} disabled={loading}>
            {t("list.reset", "Reset")}
          </Secondary>
          <Primary type="button" onClick={applyFilters} disabled={loading || !canApply} aria-busy={loading}>
            {loading ? t("common.loading", "Loading…") : t("list.apply", "Apply")}
          </Primary>
        </Actions>
      </Toolbar>

      {/* ====== Masaüstü/Tablet: Tablo ====== */}
      <Table role="table" aria-label={t("list.tableLabel", "Service Catalog list")}>
        <thead>
          <tr>
            <th>{t("list.th.code", "Code")}</th>
            <th>{t("list.th.name", "Name")}</th>
            <th>{t("list.th.duration", "Duration")}</th>
            <th>{t("list.th.team", "Team")}</th>
            <th>{t("list.th.price", "Price")}</th>
            <th>{t("list.th.active", "Active")}</th>
            <th>{t("list.th.tags", "Tags")}</th>
            <th aria-label={t("list.th.actions", "Actions")} />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading && (
            <tr>
              <td colSpan={8}>
                <Empty role="status">{t("list.empty", "No items found")}</Empty>
              </td>
            </tr>
          )}

          {items.map((s) => (
            <tr key={s._id}>
              <td className="mono">{s.code}</td>
              <td className="nowrap">{firstLocaleValue(s.name, lang)}</td>
              <td>
                {s.defaultDurationMin} {t("detail.minutes", "min")}
              </td>
              <td>{s.defaultTeamSize}</td>
              <td className="nowrap">{s.suggestedPrice ?? "—"}</td>
              <td>{s.isActive ? "✔" : "—"}</td>
              <td className="small wrap">{(s.tags || []).join(", ")}</td>
              <td className="actions">
                <Row>
                  <Secondary type="button" onClick={() => dispatch(setSelectedSvc(s))}>
                    {t("list.view", "View")}
                  </Secondary>
                  <Secondary type="button" onClick={() => onEdit(s)}>
                    {t("list.edit", "Edit")}
                  </Secondary>
                  <Danger type="button" onClick={() => confirmDelete(s._id, s.code)}>
                    {t("list.delete", "Delete")}
                  </Danger>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ====== Mobil: Kartlar ====== */}
      <CardGrid aria-label={t("list.tableLabel", "Service Catalog list (cards)")}>
        {items.length === 0 && !loading && <Empty>{t("list.empty", "No items found")}</Empty>}

        {items.map((s) => {
          const title = firstLocaleValue(s.name, lang);
          return (
            <Card key={s._id}>
              <CardHeader>
                <Code>{s.code}</Code>
                <Active $on={!!s.isActive}>{s.isActive ? t("common.yes", "Yes") : t("common.no", "No")}</Active>
              </CardHeader>

              <Title>{title}</Title>

              <Meta>
                <MetaItem>
                  <MetaLabel>{t("list.th.duration", "Duration")}</MetaLabel>
                  <MetaValue>{s.defaultDurationMin} {t("detail.minutes", "min")}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>{t("list.th.team", "Team")}</MetaLabel>
                  <MetaValue>{s.defaultTeamSize}</MetaValue>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>{t("list.th.price", "Price")}</MetaLabel>
                  <MetaValue>{s.suggestedPrice ?? "—"}</MetaValue>
                </MetaItem>
              </Meta>

              {(s.tags?.length ?? 0) > 0 && (
                <Tags aria-label="tags">
                  {s.tags!.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Tags>
              )}

              <Buttons>
                <Secondary type="button" onClick={() => dispatch(setSelectedSvc(s))}>
                  {t("list.view", "View")}
                </Secondary>
                <Secondary type="button" onClick={() => onEdit(s)}>
                  {t("list.edit", "Edit")}
                </Secondary>
                <Danger type="button" onClick={() => confirmDelete(s._id, s.code)}>
                  {t("list.delete", "Delete")}
                </Danger>
              </Buttons>
            </Card>
          );
        })}
      </CardGrid>
    </Wrap>
  );
}

/* ===== styled ===== */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Filters = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: ${({ theme }) => theme.transition.normal};
  &::placeholder { color: ${({ theme }) => theme.colors.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: ${({ theme }) => theme.transition.normal};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const BaseButton = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} transparent;
  transition: ${({ theme }) => theme.transition.normal};
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;

const Primary = styled(BaseButton)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.backgroundHover};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
  }
`;

const Secondary = styled(BaseButton)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.colors.border};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;

const Danger = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover { filter: brightness(0.98); }
`;

/* ===== Masaüstü Tablo ===== */
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;

  thead th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }

  td {
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    vertical-align: middle;
  }

  td.mono { font-family: ${({ theme }) => theme.fonts.mono}; }
  td.small { font-size: ${({ theme }) => theme.fontSizes.xsmall}; }
  td.actions { text-align: right; }
  td.nowrap { white-space: nowrap; }
  td.wrap { word-break: break-word; white-space: normal; }

  /* Mobilde tabloyu gizle */
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

/* ===== Mobil Kartlar ===== */
const CardGrid = styled.div`
  display: none;

  /* Mobilde kart görünümü aktif */
  ${({ theme }) => theme.media.mobile} {
    display: grid;
    gap: ${({ theme }) => theme.spacings.md};
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const Code = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.title};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  word-break: break-word;
`;

const Active = styled.span<{ $on: boolean }>`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.inputBackgroundLight)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textSecondary)};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Title = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  word-break: break-word;
`;

const Meta = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const MetaLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;
const MetaValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  word-break: break-word;
  white-space: nowrap;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;
const Tag = styled.span`
  background: ${({ theme }) => theme.colors.tagBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Buttons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

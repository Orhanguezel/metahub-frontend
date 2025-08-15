"use client";
import styled from "styled-components";
import { useCallback, useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/opstemplates";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchAllOpsTemplatesAdmin,
  updateOpsTemplate,
  deleteOpsTemplate,
} from "@/modules/opstemplates/slice/opstemplatesSlice";
import type { IOperationTemplate, TemplatesAdminFilters } from "@/modules/opstemplates/types";
import type { SupportedLocale } from "@/types/common";

/* i18n helpers */
type TL = Partial<Record<SupportedLocale, string>>;
const getTL = (obj?: TL, l?: SupportedLocale) => (l && obj?.[l]) || obj?.en || obj?.tr || "";

/* props */
interface Props {
  items: IOperationTemplate[];
  loading?: boolean;
  onEdit: (tpl: IOperationTemplate) => void;
}

export default function TemplateList({ items, loading, onEdit }: Props) {
  const { t, i18n } = useI18nNamespace("opstemplates", translations);
  const lang = useMemo<SupportedLocale>(() => (i18n.language?.slice(0, 2) || "en") as SupportedLocale, [i18n.language]);
  const dispatch = useAppDispatch();

  const [filters, setFilters] = useState<TemplatesAdminFilters>({ limit: 200, isActive: true });
  const [busyId, setBusyId] = useState<string | null>(null);

  const onChange = (k: keyof TemplatesAdminFilters, v: any) =>
    setFilters((s) => ({ ...s, [k]: v === "" || v === null ? undefined : v }));

  const applied = useMemo(() => filters, [filters]);

  const applyFilters = useCallback(() => {
    dispatch(fetchAllOpsTemplatesAdmin(applied));
  }, [dispatch, applied]);

  const resetFilters = useCallback(() => {
    setFilters({ limit: 200, isActive: true });
    dispatch(fetchAllOpsTemplatesAdmin());
  }, [dispatch]);

  const onKeyDownFilters = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  };

  const handleToggleActive = async (tpl: IOperationTemplate) => {
    try {
      setBusyId(tpl._id);
      await dispatch(updateOpsTemplate({ id: tpl._id, changes: { isActive: !tpl.isActive } })).unwrap();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (tpl: IOperationTemplate) => {
    if (!confirm(t("confirmDelete", "Delete this template?"))) return;
    try {
      setBusyId(tpl._id);
      await dispatch(deleteOpsTemplate(tpl._id)).unwrap();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Wrap>
      <Toolbar onKeyDown={onKeyDownFilters} aria-label={t("filters", "Filters")}>
        <FilterRow>
          <Input placeholder={t("q","Search")} value={filters.q || ""} onChange={(e)=>onChange("q", e.target.value)} />
          <Input placeholder={t("serviceId","Service ID")} value={filters.serviceRef || ""} onChange={(e)=>onChange("serviceRef", e.target.value)} />
          <Input placeholder={t("categoryId","Category ID")} value={filters.categoryRef || ""} onChange={(e)=>onChange("categoryRef", e.target.value)} />
          <Input placeholder={t("apartmentId","Apartment ID")} value={filters.apartmentRef || ""} onChange={(e)=>onChange("apartmentRef", e.target.value)} />
          <Input placeholder={t("tag","Tag")} value={filters.tag || ""} onChange={(e)=>onChange("tag", e.target.value)} />
          <Input type="number" min={1} placeholder={t("version","Version")} value={filters.version ?? ""} onChange={(e)=>onChange("version", e.target.value===""?undefined:Number(e.target.value))} />
          <Select
            value={filters.isActive===undefined?"":String(filters.isActive)}
            onChange={(e)=>onChange("isActive", e.target.value===""? undefined : e.target.value==="true")}
          >
            <option value="">{t("active","Active?")}</option>
            <option value="true">{t("yes","Yes")}</option>
            <option value="false">{t("no","No")}</option>
          </Select>
          <Input type="number" min={1} max={500} value={filters.limit ?? 200} onChange={(e)=>onChange("limit", Number(e.target.value)||200)} />
        </FilterRow>

        <Actions>
          <Btn onClick={applyFilters} disabled={loading} aria-busy={loading}>{t("apply","Apply")}</Btn>
          <Btn onClick={resetFilters} disabled={loading}>{t("reset","Reset")}</Btn>
        </Actions>
      </Toolbar>

      {/* ---- Cards only ---- */}
      <ListGrid role="region" aria-live="polite" aria-busy={loading}>
        {items.length === 0 && !loading && <Empty>∅</Empty>}

        {items.map((tpl) => {
          const rowDisabled = busyId === tpl._id;
          return (
            <Card key={tpl._id} aria-busy={rowDisabled}>
              <CardHeader>
                <HeaderLeft>
                  <Code className="mono">{tpl.code}</Code>
                  <NameTitle title={getTL(tpl.name as unknown as TL, lang) || "-"}>
                    {getTL(tpl.name as unknown as TL, lang) || "-"}
                  </NameTitle>
                </HeaderLeft>
                <Status $on={tpl.isActive}>
                  {tpl.isActive ? t("yes","Yes") : t("no","No")}
                </Status>
              </CardHeader>

              <CardBody>
                <DetailsGrid>
                  <Detail>
                    <Field>{t("service","Service")}</Field>
                    <Value className="mono">{tpl.serviceRef || "-"}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("duration","Duration")}</Field>
                    <Value>{tpl.defaultDurationMinutes ?? "-"}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("steps","Steps")}</Field>
                    <Value>{tpl.steps?.length || 0}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("materials","Materials")}</Field>
                    <Value>{tpl.materials?.length || 0}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("version","Version")}</Field>
                    <Value>{tpl.version ?? "-"}</Value>
                  </Detail>
                </DetailsGrid>
              </CardBody>

              <CardActions>
                <Secondary onClick={()=>onEdit(tpl)} disabled={rowDisabled}>{t("edit","Edit")}</Secondary>
                <Secondary onClick={()=>handleToggleActive(tpl)} disabled={rowDisabled} aria-pressed={tpl.isActive}>
                  {tpl.isActive ? t("deactivate","Deactivate") : t("activate","Activate")}
                </Secondary>
                <Danger onClick={()=>handleDelete(tpl)} disabled={rowDisabled}>{t("delete","Delete")}</Danger>
              </CardActions>
            </Card>
          );
        })}
      </ListGrid>
    </Wrap>
  );
}

/* ---- styled ---- */
const Wrap = styled.div`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;

/* Filters */
const Toolbar = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{flex-direction:column;align-items:stretch;}
`;
const FilterRow = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
  align-items:center;
`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};`;
const Input = styled.input`
  min-width:0;padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;box-shadow:${({theme})=>theme.colors.shadowHighlight};}
`;
const Select = styled.select`
  min-width:0;padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;box-shadow:${({theme})=>theme.colors.shadowHighlight};}
`;
const Btn = styled.button`
  padding:10px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  transition:transform ${({theme})=>theme.transition.fast}, background ${({theme})=>theme.transition.normal};
  &:hover{transform:translateY(-1px);background:${({theme})=>theme.buttons.secondary.backgroundHover};}
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;
const Secondary = styled(Btn)``;
const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{background:${({theme})=>theme.colors.dangerHover};color:${({theme})=>theme.colors.textOnDanger};border-color:${({theme})=>theme.colors.dangerHover};}
`;

/* ---- Cards ---- */
const ListGrid = styled.section`
  display:grid;
  gap:${({theme})=>theme.spacings.md};
  /* auto-fit ile ekrana göre 1–4 sütun */
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: stretch;
`;
const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  overflow:hidden;
  transition:transform ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  will-change: transform;
  &:hover{ transform: translateY(-2px); box-shadow:${({theme})=>theme.shadows.md}; }
`;
const CardHeader = styled.header`
  background:${({theme})=>theme.colors.primaryLight};
  color:${({theme})=>theme.colors.title};
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md};
  display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const HeaderLeft = styled.div`
  display:flex;flex-direction:column;gap:2px;min-width:0;
`;
const Code = styled.span`
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  font-variant-numeric: tabular-nums;
`;
const NameTitle = styled.span`
  font-size:${({theme})=>theme.fontSizes.sm};
  color:${({theme})=>theme.colors.textSecondary};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
`;
const Status = styled.span<{ $on:boolean }>`
  padding:.25em .6em;border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const CardBody = styled.div`
  padding:${({theme})=>theme.spacings.md};
`;

/* Label–Value grid: otomatik sütun sayısı, taşma korumalı */
const DetailsGrid = styled.div`
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap:${({theme})=>theme.spacings.sm};
  align-items:start;

  /* tablet ve üstü: biraz daha geniş kartlar */
  ${({theme})=>theme.media.tablet}{ grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  ${({theme})=>theme.media.desktop}{ grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
`;
const Detail = styled.div`
  display:grid;
  grid-template-columns: 1fr;
  padding:${({theme})=>theme.spacings.xs} 0;
  min-width:0;
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const Field = styled.span`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  margin-bottom:2px;
`;
const Value = styled.span`
  color:${({theme})=>theme.colors.text};
  font-size:${({theme})=>theme.fontSizes.small};
  min-width:0;
  font-variant-numeric: tabular-nums;
  /* mobilde tek satıra sığdır, büyük ekranda sar */
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  ${({theme})=>theme.media.desktop}{ white-space: normal; }
  &.mono{ font-family:${({theme})=>theme.fonts.mono}; }
`;

const CardActions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.md};
  border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;

const Empty = styled.div`
  padding:${({theme})=>theme.spacings.md} 0;color:${({theme})=>theme.colors.textSecondary};text-align:center;
`;

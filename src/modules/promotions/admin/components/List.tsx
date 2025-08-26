"use client";
import styled from "styled-components";
import { useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/promotions/locales";

import type { IPromotion } from "@/modules/promotions/types";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

/* helpers */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : "tr";
};

const nameAt = (m?: Record<string, string>, l?: SupportedLocale) => {
  if (!m || !l) return "";
  const v = (m as any)[l];
  if (typeof v === "string" && v.trim()) return v;
  // fallback ilk dolu dil
  const first = Object.values(m).find((x) => typeof x === "string" && x.trim());
  return (first as string) || "";
};

const fmtDate = (v?: string | null) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

const effectSummary = (p: IPromotion) => {
  const e = p.effect;
  switch (e?.type) {
    case "percentage":
      return e.value ? `%${e.value}` : "percentage";
    case "fixed":
      return e.value != null ? `${e.value} ${e.currency || ""}`.trim() : "fixed";
    case "free_delivery":
      return "free_delivery";
    case "bxgy":
      return e?.bxgy ? `B${e.bxgy.buyQty}G${e.bxgy.getQty}` : "bxgy";
    default:
      return "-";
  }
};

type Props = {
  promotions: IPromotion[];
  lang: SupportedLocale;
  loading?: boolean;
  error?: string | null;
  onEdit: (item: IPromotion) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
};

export default function List({
  promotions,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleActive,
}: Props) {
  const { t, i18n } = useI18nNamespace("promotions", translations);
  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  return (
    <Wrap>
      {error && <ErrorBox role="alert">{error}</ErrorBox>}

      {/* Desktop Table */}
      <TableWrap aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th>{t("titleField", "Title")}</th>
              <th>{t("kind", "Kind")}</th>
              <th>{t("code", "Code")}</th>
              <th>{t("priority", "Priority")}</th>
              <th>{t("window", "Window")}</th>
              <th>{t("effect", "Effect")}</th>
              <th>{t("active", "Active")}</th>
              <th>{t("published", "Published")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {!loading && promotions.length === 0 && (
              <tr>
                <td colSpan={9}><Empty>∅</Empty></td>
              </tr>
            )}
            {promotions.map((p) => {
              const title = nameAt(p.name as any, lang) || nameAt(p.name as any, uiLang) || p.code || p._id;
              const win =
                (p.rules?.startsAt ? fmtDate(p.rules.startsAt) : "—") +
                " → " +
                (p.rules?.endsAt ? fmtDate(p.rules.endsAt) : "—");
              return (
                <tr key={p._id}>
                  <td title={title}>{title}</td>
                  <td>{p.kind}</td>
                  <td className="mono">{p.code || "-"}</td>
                  <td className="mono">{p.priority ?? 0}</td>
                  <td>{win}</td>
                  <td>{effectSummary(p)}</td>
                  <td>
                    <Badge $on={p.isActive}>{p.isActive ? t("yes","Yes") : t("no","No")}</Badge>
                  </td>
                  <td>
                    <Badge $on={p.isPublished}>{p.isPublished ? t("yes","Yes") : t("no","No")}</Badge>
                  </td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(p)}>{t("edit", "Edit")}</Secondary>
                      <Secondary onClick={() => onToggleActive(p._id, p.isActive)}>
                        {p.isActive ? t("deactivate","Deactivate") : t("activate","Activate")}
                      </Secondary>
                      <Secondary onClick={() => onTogglePublish(p._id, p.isPublished)}>
                        {p.isPublished ? t("unpublish","Unpublish") : t("publish","Publish")}
                      </Secondary>
                      <Danger onClick={() => onDelete(p._id)}>{t("delete", "Delete")}</Danger>
                    </Row>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile Cards */}
      <CardsWrap aria-busy={!!loading}>
        {promotions.length === 0 && !loading && <Empty>∅</Empty>}
        {promotions.map((p) => {
          const title = nameAt(p.name as any, lang) || nameAt(p.name as any, uiLang) || p.code || p._id;
          return (
            <Card key={p._id}>
              <CardHeader>
                <HeaderLeft>
                  <NameTitle title={title}>{title}</NameTitle>
                  <SmallText>{p.kind}{p.code ? ` • ${p.code}` : ""}</SmallText>
                </HeaderLeft>
                <Status $on={p.isPublished}>
                  {p.isPublished ? t("published","Published") : t("draft","Draft")}
                </Status>
              </CardHeader>

              <CardBody>
                <SmallText><b>{t("priority","Priority")}:</b> <span className="mono">{p.priority ?? 0}</span></SmallText>
                <SmallText><b>{t("window","Window")}:</b> {fmtDate(p.rules?.startsAt)} → {fmtDate(p.rules?.endsAt)}</SmallText>
                <SmallText><b>{t("effect","Effect")}:</b> {effectSummary(p)}</SmallText>
                <SmallText><b>{t("active","Active")}:</b> {p.isActive ? t("yes","Yes") : t("no","No")}</SmallText>
              </CardBody>

              <CardActions>
                <Secondary onClick={() => onEdit(p)}>{t("edit","Edit")}</Secondary>
                <Secondary onClick={() => onToggleActive(p._id, p.isActive)}>
                  {p.isActive ? t("deactivate","Deactivate") : t("activate","Activate")}
                </Secondary>
                <Secondary onClick={() => onTogglePublish(p._id, p.isPublished)}>
                  {p.isPublished ? t("unpublish","Unpublish") : t("publish","Publish")}
                </Secondary>
                <Danger onClick={() => onDelete(p._id)}>{t("delete","Delete")}</Danger>
              </CardActions>
            </Card>
          );
        })}
      </CardsWrap>
    </Wrap>
  );
}

/* ---- styled ---- */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const ErrorBox = styled.div`padding:${({theme})=>theme.spacings.sm};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};color:${({theme})=>theme.colors.danger};border-radius:${({theme})=>theme.radii.md};`;

const TableWrap = styled.div`
  width:100%;overflow-x:auto;border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};background:${({theme})=>theme.colors.cardBackground};
  ${({theme})=>theme.media.mobile}{display:none;}
`;
const Table = styled.table`
  width:100%;border-collapse:collapse;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};text-align:left;white-space:nowrap;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};vertical-align:middle;
  }
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tbody tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
`;

const CardsWrap = styled.div`
  display:none;
  ${({theme})=>theme.media.mobile}{
    display:grid;grid-template-columns:1fr;gap:${({theme})=>theme.spacings.md};
  }
`;
const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  overflow:hidden;
`;
const CardHeader = styled.header`
  background:${({theme})=>theme.colors.primaryLight};
  color:${({theme})=>theme.colors.title};
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md};
  display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const HeaderLeft = styled.div`display:flex;flex-direction:column;gap:2px;min-width:0;`;
const NameTitle = styled.span`
  font-size:${({theme})=>theme.fontSizes.sm};color:${({theme})=>theme.colors.textSecondary};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw;
`;
const SmallText = styled.span`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Status = styled.span<{ $on:boolean }>`
  padding:.2em .6em;border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
const CardBody = styled.div`padding:${({theme})=>theme.spacings.md};display:flex;flex-direction:column;gap:6px;`;
const CardActions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.md};
  border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;justify-content:flex-end;`;
const Secondary = styled.button`
  padding:8px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{
    background:${({theme})=>theme.colors.dangerHover};
    color:${({theme})=>theme.colors.textOnDanger};
    border-color:${({theme})=>theme.colors.dangerHover};
  }
`;
const Badge = styled.span<{ $on:boolean }>`
  display:inline-block;padding:.2em .6em;border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
`;
const Empty = styled.div`
  display:flex;align-items:center;justify-content:center;width:100%;height:100%;
  color:${({theme})=>theme.colors.textSecondary};
`;

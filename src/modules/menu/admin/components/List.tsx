"use client";
import styled from "styled-components";
import { useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";

import type { IMenu } from "@/modules/menu/types/menu";
import type { SupportedLocale } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";


const nameAt = (obj: Record<string, string> | undefined, lang: SupportedLocale): string => {
  if (!obj) return "";
  const direct = obj[lang];
  if (direct && direct.trim()) return direct.trim();
  // first non-empty fallback
  for (const k of Object.keys(obj)) {
    const v = obj[k as keyof typeof obj];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};

const fmtDate = (iso?: string | Date | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

/* ---------- types ---------- */
type Props = {
  menus: IMenu[];
  lang: SupportedLocale;
  loading?: boolean;
  error?: string | null;
  onEdit: (item: IMenu) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
};

export default function List({
  menus,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleActive,
}: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  return (
    <Wrap>
      {error && <ErrorBox role="alert">{error}</ErrorBox>}

      {/* Desktop */}
      <TableWrap aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th>{t("titleField", "Title")}</th>
              <th>{t("code", "Code")}</th>
              <th>{t("window", "Window")}</th>
              <th>{t("branches", "Branches")}</th>
              <th>{t("categories", "Categories")}</th>
              <th>{t("active", "Active")}</th>
              <th>{t("published", "Published")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {!loading && menus.length === 0 && (
              <tr>
                <td colSpan={8}><Empty>∅</Empty></td>
              </tr>
            )}
            {menus.map((m) => {
              const title =
                nameAt(m.name as any, lang) ||
                nameAt(m.name as any, uiLang) ||
                m.code ||
                String(m._id || "");
              const win = `${fmtDate(m.effectiveFrom)} → ${fmtDate(m.effectiveTo)}`;
              const branchesCount = Array.isArray(m.branches) ? m.branches.length : 0;
              const catsCount = Array.isArray(m.categories) ? m.categories.length : 0;

              return (
                <tr key={String(m._id)}>
                  <td title={title}>{title}</td>
                  <td className="mono">{m.code}</td>
                  <td>{win}</td>
                  <td className="mono">{branchesCount}</td>
                  <td className="mono">{catsCount}</td>
                  <td>
                    <Badge $on={m.isActive}>{m.isActive ? t("yes","Yes") : t("no","No")}</Badge>
                  </td>
                  <td>
                    <Badge $on={m.isPublished}>{m.isPublished ? t("yes","Yes") : t("no","No")}</Badge>
                  </td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(m)}>{t("edit","Edit")}</Secondary>
                      <Secondary onClick={() => onToggleActive(String(m._id), m.isActive)}>
                        {m.isActive ? t("deactivate","Deactivate") : t("activate","Activate")}
                      </Secondary>
                      <Secondary onClick={() => onTogglePublish(String(m._id), m.isPublished)}>
                        {m.isPublished ? t("unpublish","Unpublish") : t("publish","Publish")}
                      </Secondary>
                      <Danger onClick={() => onDelete(String(m._id))}>{t("delete","Delete")}</Danger>
                    </Row>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile */}
      <CardsWrap aria-busy={!!loading}>
        {menus.length === 0 && !loading && <Empty>∅</Empty>}
        {menus.map((m) => {
          const title =
            nameAt(m.name as any, lang) ||
            nameAt(m.name as any, uiLang) ||
            m.code ||
            String(m._id || "");
          return (
            <Card key={String(m._id)}>
              <CardHeader>
                <HeaderLeft>
                  <NameTitle title={title}>{title}</NameTitle>
                  <SmallText>{m.code}</SmallText>
                </HeaderLeft>
                <Status $on={m.isPublished}>
                  {m.isPublished ? t("published","Published") : t("draft","Draft")}
                </Status>
              </CardHeader>

              <CardBody>
                <SmallText><b>{t("window","Window")}:</b> {fmtDate(m.effectiveFrom)} → {fmtDate(m.effectiveTo)}</SmallText>
                <SmallText><b>{t("branches","Branches")}:</b> {Array.isArray(m.branches) ? m.branches.length : 0}</SmallText>
                <SmallText><b>{t("categories","Categories")}:</b> {Array.isArray(m.categories) ? m.categories.length : 0}</SmallText>
                <SmallText><b>{t("active","Active")}:</b> {m.isActive ? t("yes","Yes") : t("no","No")}</SmallText>
              </CardBody>

              <CardActions>
                <Secondary onClick={() => onEdit(m)}>{t("edit","Edit")}</Secondary>
                <Secondary onClick={() => onToggleActive(String(m._id), m.isActive)}>
                  {m.isActive ? t("deactivate","Deactivate") : t("activate","Activate")}
                </Secondary>
                <Secondary onClick={() => onTogglePublish(String(m._id), m.isPublished)}>
                  {m.isPublished ? t("unpublish","Unpublish") : t("publish","Publish")}
                </Secondary>
                <Danger onClick={() => onDelete(String(m._id))}>{t("delete","Delete")}</Danger>
              </CardActions>
            </Card>
          );
        })}
      </CardsWrap>
    </Wrap>
  );
}

/* ---------- styled ---------- */
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
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md}
    ${({ theme }) => theme.spacings.md};
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};

  /* <=480px (theme.media.xsmall) -> 2 sütun grid */
  ${({ theme }) => theme.media.xsmall} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-content: stretch;
    gap: ${({ theme }) => theme.spacings.xs};
  }

  /* <=360px -> tek sütun */
  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }

  /* Butonların hücreyi doldurması için */
  & > button {
    min-width: 0;
  }
  ${({ theme }) => theme.media.xsmall} {
    & > button {
      width: 100%;
      text-align: center;
    }
  }
`;
const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;justify-content:flex-end;`;
const Secondary = styled.button`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  min-width: 0; /* uzun metinlerde taşmayı engeller */
  word-break: keep-all;
`;
const Danger = styled(Secondary)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
    color: ${({ theme }) => theme.colors.textOnDanger};
    border-color: ${({ theme }) => theme.colors.dangerHover};
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

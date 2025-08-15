"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/neighborhood/locales";
import type { SupportedLocale } from "@/types/common";
import type { INeighborhood } from "@/modules/neighborhood/types";

interface Props {
  items: INeighborhood[];
  lang: SupportedLocale;
  onEdit: (item: INeighborhood) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function NeighborhoodList({
  items, lang, onEdit, onToggleActive, onDelete, loading,
}: Props) {
  const { t } = useI18nNamespace("neighborhood", translations);

  return (
    <Wrap>
      {/* Desktop table */}
      <Table>
        <thead>
          <tr>
            <th>{t("list.name","Name")}</th>
            <th>{t("list.slug","Slug")}</th>
            <th>{t("list.location","Location")}</th>
            <th>{t("list.codes","Codes")}</th>
            <th>{t("list.tags","Tags")}</th>
            <th>{t("list.status","Status")}</th>
            <th>{t("list.actions","Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr><td colSpan={7}><Empty>{t("common.empty","Empty")}</Empty></td></tr>
          )}
          {items.map((n) => (
            <tr key={n._id}>
              <td className="mono">{n.name?.[lang] || n.name?.en || "-"}</td>
              <td className="mono">{n.slug}</td>
              <td>{[n.city, n.district].filter(Boolean).join(" / ") || "-"}</td>
              <td className="mono">
                {(n.codes?.cityCode || "-")}/{(n.codes?.districtCode || "-")}
              </td>
              <td>{(n.tags || []).join(", ") || "-"}</td>
              <td>
                <Status $active={!!n.isActive}>
                  {n.isActive ? t("status.active","active") : t("status.inactive","inactive")}
                </Status>
              </td>
              <td className="actions">
                <Row>
                  <SecondaryBtn onClick={() => onEdit(n)}>{t("actions.edit","Edit")}</SecondaryBtn>
                  <PrimaryBtn onClick={() => onToggleActive(n._id, !n.isActive)}>
                    {n.isActive ? t("actions.deactivate","Deactivate") : t("actions.activate","Activate")}
                  </PrimaryBtn>
                  <DangerBtn onClick={() => onDelete(n._id)}>{t("actions.delete","Delete")}</DangerBtn>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile cards */}
      <CardList>
        {items.length === 0 && !loading && <Empty>{t("common.empty","Empty")}</Empty>}
        {items.map((n) => (
          <Card key={n._id}>
            <RowItem><Field>{t("list.name","Name")}</Field><Value className="mono">{n.name?.[lang] || n.name?.en || "-"}</Value></RowItem>
            <RowItem><Field>{t("list.slug","Slug")}</Field><Value className="mono">{n.slug}</Value></RowItem>
            <RowItem><Field>{t("list.location","Location")}</Field><Value>{[n.city, n.district].filter(Boolean).join(" / ") || "-"}</Value></RowItem>
            <RowItem><Field>{t("list.codes","Codes")}</Field><Value className="mono">{(n.codes?.cityCode || "-")}/{(n.codes?.districtCode || "-")}</Value></RowItem>
            <RowItem><Field>{t("list.tags","Tags")}</Field><Value>{(n.tags || []).join(", ") || "-"}</Value></RowItem>
            <RowItem>
              <Field>{t("list.status","Status")}</Field>
              <Value><Status $active={!!n.isActive}>{n.isActive ? t("status.active","active") : t("status.inactive","inactive")}</Status></Value>
            </RowItem>
            <Buttons>
              <SecondaryBtn onClick={() => onEdit(n)}>{t("actions.edit","Edit")}</SecondaryBtn>
              <PrimaryBtn onClick={() => onToggleActive(n._id, !n.isActive)}>
                {n.isActive ? t("actions.deactivate","Deactivate") : t("actions.activate","Activate")}
              </PrimaryBtn>
              <DangerBtn onClick={() => onDelete(n._id)}>{t("actions.delete","Delete")}</DangerBtn>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* ---- styled ---- */
const Wrap = styled.div`width:100%;`;
const Table = styled.table`
  width:100%; border-collapse:collapse; background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg}; box-shadow:${({theme})=>theme.cards.shadow}; overflow:hidden;
  thead th{background:${({theme})=>theme.colors.tableHeader}; color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold}; font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md}; border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border}; text-align:left;}
  td{padding:${({theme})=>theme.spacings.md}; border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm}; vertical-align:middle; color:${({theme})=>theme.colors.text};}
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
  ${({theme})=>theme.media.mobile}{display:none;}
`;
const Empty = styled.div`padding:${({theme})=>theme.spacings.md} 0; color:${({theme})=>theme.colors.textSecondary}; text-align:center;`;
const Status = styled.span<{ $active: boolean }>`
  display:inline-block; padding:.35em .9em; border-radius:${({theme})=>theme.radii.pill};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderHighlight};
  background:${({$active,theme})=>$active?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$active,theme})=>$active?theme.colors.success:theme.colors.textSecondary};
`;
const Row = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; flex-wrap:wrap; justify-content:flex-end;`;
const BaseBtn = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer; border:${({theme})=>theme.borders.thin} transparent;
  box-shadow:${({theme})=>theme.shadows.button}; transition:opacity ${(({theme})=>theme.transition.fast)}, transform ${(({theme})=>theme.transition.fast)};
  font-size:${({theme})=>theme.fontSizes.xsmall}; font-weight:${({theme})=>theme.fontWeights.medium};
  &:hover{opacity:${({theme})=>theme.opacity.hover};} &:disabled{opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed;}
  &:active{transform:translateY(1px);}
`;
const PrimaryBtn = styled(BaseBtn)`background:${({theme})=>theme.buttons.primary.background}; color:${({theme})=>theme.buttons.primary.text}; border-color:${({theme})=>theme.buttons.primary.backgroundHover};`;
const SecondaryBtn = styled(BaseBtn)`background:${({theme})=>theme.buttons.secondary.background}; color:${({theme})=>theme.buttons.secondary.text}; border-color:${({theme})=>theme.colors.border};`;
const DangerBtn = styled(BaseBtn)`background:${({theme})=>theme.colors.dangerBg}; color:${({theme})=>theme.colors.danger}; border-color:${({theme})=>theme.colors.danger};`;

const CardList = styled.div`display:none; ${({theme})=>theme.media.mobile}{display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};}`;
const Card = styled.div`background:${({theme})=>theme.colors.cardBackground}; border-radius:${({theme})=>theme.radii.lg}; box-shadow:${({theme})=>theme.cards.shadow}; padding:${({theme})=>theme.spacings.md};`;
const RowItem = styled.div`display:flex; justify-content:space-between; gap:${({theme})=>theme.spacings.sm}; padding:6px 0;`;
const Field = styled.span`color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall}; min-width:90px;`;
const Value = styled.span`color:${({theme})=>theme.colors.text}; font-size:${({theme})=>theme.fontSizes.xsmall}; text-align:right; &.mono{font-family:${({theme})=>theme.fonts.mono};} word-break:break-word; max-width:60%;`;
const Buttons = styled.div`display:flex; flex-wrap:wrap; gap:${({theme})=>theme.spacings.xs}; justify-content:flex-end; margin-top:${({theme})=>theme.spacings.sm};`;

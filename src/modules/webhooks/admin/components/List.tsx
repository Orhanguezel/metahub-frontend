"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/webhooks/locales";
import type { IWebhookEndpointFE } from "@/modules/webhooks/types";
import type { SupportedLocale } from "@/types/common";

type Props = {
  endpoints: IWebhookEndpointFE[];
  lang: SupportedLocale;
  loading?: boolean;
  error?: string | null;
  onEdit: (item: IWebhookEndpointFE) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
};

export default function List({
  endpoints,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const { t } = useI18nNamespace("webhooks", translations);

  const d = (v?: unknown) => {
    if (!v) return "-";
    const raw =
      typeof v === "string"
        ? v
        : (v as any)?.$date || (v as any)?.date || (v as any)?.value || String(v);
    const dt = new Date(raw);
    return isNaN(dt.getTime()) ? "-" : dt.toLocaleString();
  };

  const eventsText = (e: string[]) => (Array.isArray(e) && e.length ? e.join(", ") : "-");

  return (
    <Wrap>
      {error && <ErrorBox role="alert">{error}</ErrorBox>}

      {/* Desktop */}
      <TableWrap aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th>{t("name", "Name")}</th>
              <th>{t("targetUrl", "Target URL")}</th>
              <th>{t("events", "Events")}</th>
              <th style={{ width: 110 }}>{t("status", "Status")}</th>
              <th style={{ width: 170 }}>{t("lastDelivery", "Last Delivery")}</th>
              <th style={{ width: 170 }}>{t("createdAt", "Created At")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {!loading && endpoints.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <Empty>∅</Empty>
                </td>
              </tr>
            )}
            {endpoints.map((ep) => {
              return (
                <tr key={ep._id}>
                  <td title={ep.name}>{ep.name}</td>
                  <td title={ep.targetUrl} className="mono">{ep.targetUrl}</td>
                  <td title={eventsText(ep.events)} className="mono">{eventsText(ep.events)}</td>
                  <td>
                    <Badge $on={ep.isActive}>
                      {ep.isActive ? t("active", "Active") : t("inactive", "Inactive")}
                    </Badge>
                  </td>
                  <td>
                    {ep.lastStatus ? `${ep.lastStatus}` : "-"}
                    <SmallMuted> {d(ep.lastDeliveredAt)}</SmallMuted>
                  </td>
                  <td>{d(ep.createdAt)}</td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(ep)}>{t("edit", "Edit")}</Secondary>
                      <Secondary onClick={() => onToggleActive(ep._id, ep.isActive)}>
                        {ep.isActive ? t("deactivate", "Deactivate") : t("activate", "Activate")}
                      </Secondary>
                      <Danger onClick={() => onDelete(ep._id)}>{t("delete", "Delete")}</Danger>
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
        {endpoints.length === 0 && !loading && <Empty>∅</Empty>}
        {endpoints.map((ep) => {
          return (
            <Card key={ep._id}>
              <CardHeader>
                <HeaderLeft>
                  <NameTitle title={ep.name}>{ep.name}</NameTitle>
                  <SmallText className="mono" title={ep.targetUrl}>{ep.targetUrl}</SmallText>
                </HeaderLeft>
                <Status $on={ep.isActive}>
                  {ep.isActive ? t("active", "Active") : t("inactive", "Inactive")}
                </Status>
              </CardHeader>

              <CardBody>
                <SmallText>
                  {t("events", "Events")}: {eventsText(ep.events)}
                </SmallText>
                <SmallText>
                  {t("lastDelivery", "Last Delivery")}: {ep.lastStatus ?? "-"} • {d(ep.lastDeliveredAt)}
                </SmallText>
                <SmallText>
                  {t("createdAt", "Created At")}: {d(ep.createdAt)}
                </SmallText>
              </CardBody>

              <CardActions>
                <Secondary onClick={() => onEdit(ep)}>{t("edit", "Edit")}</Secondary>
                <Secondary onClick={() => onToggleActive(ep._id, ep.isActive)}>
                  {ep.isActive ? t("deactivate", "Deactivate") : t("activate", "Activate")}
                </Secondary>
                <Danger onClick={() => onDelete(ep._id)}>{t("delete", "Delete")}</Danger>
              </CardActions>
            </Card>
          );
        })}
      </CardsWrap>
    </Wrap>
  );
}

/* styled */
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
  font-size:${({theme})=>theme.fontSizes.sm};color:${({theme})=>theme.colors.text};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw;
`;
const SmallText = styled.span`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const SmallMuted = styled.span`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
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

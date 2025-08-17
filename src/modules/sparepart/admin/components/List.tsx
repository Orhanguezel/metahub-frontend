"use client";
import styled from "styled-components";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/sparepart";
import type { ISparepart } from "@/modules/sparepart/types";
import type { SupportedLocale } from "@/types/common";
import {  getMultiLang } from "@/types/common";

type Props = {
  sparepart: ISparepart[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: ISparepart) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
};

export default function SparepartList({
  sparepart,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const {t} = useI18nNamespace("sparepart", translations);

  const d = (v?: unknown) => {
    if (!v) return "-";
    const raw =
      typeof v === "string"
        ? v
        : (v as any)?.$date || (v as any)?.date || (v as any)?.value || String(v);
    const dt = new Date(raw);
    return isNaN(dt.getTime()) ? "-" : dt.toLocaleString();
  };

  const getThumb = (p: ISparepart): string | undefined => {
    const img = p?.images?.[0];
    return img?.thumbnail || img?.webp || img?.url || undefined;
  };

  if (!Array.isArray(sparepart)) return null;

  return (
    <Wrap>
      {error && <ErrorBox role="alert">❌ {error}</ErrorBox>}

      {/* Desktop Table */}
      <TableWrap aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 72 }}>{t("image", "Image")}</th>
              <th>{t("name", "Name")}</th>
              <th>{t("brand", "Brand")}</th>
              <th>{t("price", "Price")}</th>
              <th>{t("stock", "Stock")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("createdAt", "Created At")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {!loading && sparepart.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <Empty>∅</Empty>
                </td>
              </tr>
            )}

            {sparepart.map((p) => {
              const name = getMultiLang(p.name as any, lang) || (p as any)?.slug || "—";
              const src = getThumb(p);
              return (
                <tr key={p._id}>
                  <td>
                    <ThumbBox aria-hidden="true">
                      {src ? (
                        <Image
                          src={src}
                          alt={name}
                          fill
                          sizes="72px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Placeholder>—</Placeholder>
                      )}
                    </ThumbBox>
                  </td>
                  <td title={name}>{name}</td>
                  <td>{p.brand || "—"}</td>
                  <td className="mono">€{Number(p.price ?? 0).toLocaleString()}</td>
                  <td className="mono">{p.stock ?? 0}</td>
                  <td>
                    <Badge $on={!!p.isPublished}>
                      {p.isPublished ? t("published", "Published") : t("draft", "Draft")}
                    </Badge>
                  </td>
                  <td>{d((p as any)?.createdAt)}</td>
                  <td className="actions">
                    <Row>
                      {onEdit && (
                        <Secondary onClick={() => onEdit(p)}>
                          {t("admin.edit", "Edit")}
                        </Secondary>
                      )}
                      {onTogglePublish && (
                        <Secondary onClick={() => onTogglePublish(p._id, p.isPublished)}>
                          {p.isPublished
                            ? t("admin.sparepart.unpublish", "Unpublish")
                            : t("admin.sparepart.publish", "Publish")}
                        </Secondary>
                      )}
                      {onDelete && (
                        <Danger onClick={() => onDelete(p._id)}>
                          {t("admin.delete", "Delete")}
                        </Danger>
                      )}
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
        {sparepart.length === 0 && !loading && <Empty>∅</Empty>}
        {sparepart.map((p) => {
          const name = getMultiLang(p.name as any, lang) || (p as any)?.slug || "—";
          const src = getThumb(p);
          return (
            <Card key={p._id}>
              <CardHeader>
                <HeaderLeft>
                  <HeaderTop>
                    <ThumbBox aria-hidden="true">
                      {src ? (
                        <Image
                          src={src}
                          alt={name}
                          fill
                          sizes="72px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Placeholder>—</Placeholder>
                      )}
                    </ThumbBox>
                    <TitleBox>
                      <NameTitle title={name}>{name}</NameTitle>
                      <SmallText>{p.brand || "—"}</SmallText>
                    </TitleBox>
                  </HeaderTop>
                </HeaderLeft>
                <Status $on={!!p.isPublished}>
                  {p.isPublished ? t("published", "Published") : t("draft", "Draft")}
                </Status>
              </CardHeader>

              <CardBody>
                <SmallText>
                  {t("price", "Price")}: <b className="mono">€{Number(p.price ?? 0).toLocaleString()}</b>
                </SmallText>
                <SmallText>
                  {t("stock", "Stock")}: <b className="mono">{p.stock ?? 0}</b>
                </SmallText>
                {(p.tags?.length ?? 0) > 0 && (
                  <SmallText>
                    {t("admin.sparepart.tags", "Tags")}: {p.tags!.join(", ")}
                  </SmallText>
                )}
                <SmallText>
                  {t("createdAt", "Created At")}: {d((p as any)?.createdAt)}
                </SmallText>
              </CardBody>

              {(onEdit || onDelete || onTogglePublish) && (
                <CardActions>
                  {onEdit && (
                    <Secondary onClick={() => onEdit(p)}>{t("admin.edit", "Edit")}</Secondary>
                  )}
                  {onTogglePublish && (
                    <Secondary onClick={() => onTogglePublish(p._id, p.isPublished)}>
                      {p.isPublished
                        ? t("admin.sparepart.unpublish", "Unpublish")
                        : t("admin.sparepart.publish", "Publish")}
                    </Secondary>
                  )}
                  {onDelete && (
                    <Danger onClick={() => onDelete(p._id)}>{t("admin.delete", "Delete")}</Danger>
                  )}
                </CardActions>
              )}
            </Card>
          );
        })}
      </CardsWrap>
    </Wrap>
  );
}

/* ---- styled (Ensotekprod/About list paternine uyumlu) ---- */
const Wrap = styled.div`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;

const ErrorBox = styled.div`
  padding:${({theme})=>theme.spacings.sm};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};
  color:${({theme})=>theme.colors.danger};
  border-radius:${({theme})=>theme.radii.md};
`;

const TableWrap = styled.div`
  width:100%;overflow-x:auto;border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  background:${({theme})=>theme.colors.cardBackground};
  ${({theme})=>theme.media.mobile}{display:none;}
`;

const Table = styled.table`
  width:100%;border-collapse:collapse;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};
    text-align:left;white-space:nowrap;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};
    vertical-align:middle;
  }
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tbody tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
`;

const ThumbBox = styled.div`
  position:relative;width:64px;height:44px;border-radius:${({theme})=>theme.radii.sm};
  overflow:hidden;background:${({theme})=>theme.colors.inputBackgroundLight};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  flex:0 0 auto;
`;

const Placeholder = styled.span`
  display:flex;align-items:center;justify-content:center;width:100%;height:100%;
  color:${({theme})=>theme.colors.textSecondary};
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
const HeaderTop = styled.div`display:flex;align-items:center;gap:${({theme})=>theme.spacings.sm};min-width:0;`;
const TitleBox = styled.div`display:flex;flex-direction:column;min-width:0;`;

const NameTitle = styled.span`
  font-size:${({theme})=>theme.fontSizes.sm};
  color:${({theme})=>theme.colors.textSecondary};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw;
`;

const SmallText = styled.span`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
`;

const Status = styled.span<{ $on:boolean }>`
  padding:.2em .6em;border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const CardBody = styled.div`
  padding:${({theme})=>theme.spacings.md};
  display:flex;flex-direction:column;gap:6px;
`;

const CardActions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.md};
  border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;

const Row = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};
  flex-wrap:wrap;justify-content:flex-end;
`;

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

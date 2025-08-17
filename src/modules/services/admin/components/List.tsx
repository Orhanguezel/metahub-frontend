"use client";

import styled from "styled-components";
import Image from "next/image";
import { useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/services/locales";
import type { IServices, ServicesCategory } from "@/modules/services/types";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";
import { Skeleton } from "@/shared";

type Props = {
  services: IServices[];
  lang: SupportedLocale;
  loading?: boolean;
  error?: string | null;
  onEdit: (item: IServices) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
  categories?: ServicesCategory[];
};

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two) ? (two as SupportedLocale) : "tr";
};

const getMultiLang = (obj: Record<string, string> | undefined, lang: string) =>
  obj?.[lang] || obj?.en || (obj ? Object.values(obj)[0] : "") || "";

export default function ServicesList({
  services,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
  categories,
}: Props) {
  const { t, i18n } = useI18nNamespace("services", translations);
  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const catLabelById = useMemo(() => {
    const m = new Map<string, string>();
    (categories || []).forEach((c) => m.set(c._id, getMultiLang(c.name as any, uiLang) || c.slug || c._id));
    return m;
  }, [categories, uiLang]);

  const getCategoryLabel = (s: IServices) => {
    const c: any = s.category;
    if (!c) return "-";
    if (typeof c === "string") return catLabelById.get(c) || "-";
    if (c?.name) return getMultiLang(c.name as any, uiLang) || "-";
    const id = c?.$oid || c?._id || c?.id;
    return id ? catLabelById.get(String(id)) || "-" : "-";
  };

  const getThumb = (s: IServices) => {
    const img = s.images?.[0];
    return img?.thumbnail || img?.webp || img?.url || undefined;
  };

  if (loading) {
    return (
      <SkeletonWrap>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrap>
    );
  }

  if (error) return <ErrorBox role="alert">{error}</ErrorBox>;
  if (!Array.isArray(services) || services.length === 0)
    return <Empty>{t("services.empty", "No services available.")}</Empty>;

  return (
    <Wrap>
      {/* Desktop Table */}
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 72 }}>{t("image", "Image")}</th>
              <th>{t("titleField", "Title")}</th>
              <th>{t("category", "Category")}</th>
              <th>{t("price", "Price")}</th>
              <th>{t("duration", "Duration (min)")}</th>
              <th>{t("status", "Status")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const title = getMultiLang(s.title as any, lang) || s._id;
              const cat = getCategoryLabel(s);
              const src = getThumb(s);
              return (
                <tr key={s._id}>
                  <td>
                    <Thumb aria-hidden="true">
                      {src ? (
                        <Image src={src} alt={title} fill sizes="72px" style={{ objectFit: "cover" }} />
                      ) : (
                        <Placeholder>—</Placeholder>
                      )}
                    </Thumb>
                  </td>
                  <td title={title}>{title}</td>
                  <td>{cat}</td>
                  <td className="mono">{typeof s.price === "number" ? s.price.toFixed(2) : "-"}</td>
                  <td className="mono">{s.durationMinutes ?? "-"}</td>
                  <td>
                    <Badge $on={!!s.isPublished}>
                      {s.isPublished ? t("published", "Published") : t("draft", "Draft")}
                    </Badge>
                  </td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(s)}>{t("edit", "Edit")}</Secondary>
                      <Secondary onClick={() => onTogglePublish(s._id, !!s.isPublished)}>
                        {s.isPublished ? t("unpublish", "Unpublish") : t("publish", "Publish")}
                      </Secondary>
                      <Danger onClick={() => onDelete(s._id)}>{t("delete", "Delete")}</Danger>
                    </Row>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile Cards */}
      <CardsWrap>
        {services.map((s) => {
          const title = getMultiLang(s.title as any, lang) || s._id;
          const cat = getCategoryLabel(s);
          const src = getThumb(s);
          return (
            <Card key={s._id}>
              <CardHeader>
                <HeaderLeft>
                  <HeaderTop>
                    <Thumb aria-hidden="true">
                      {src ? (
                        <Image src={src} alt={title} fill sizes="72px" style={{ objectFit: "cover" }} />
                      ) : (
                        <Placeholder>—</Placeholder>
                      )}
                    </Thumb>
                    <TitleBox>
                      <Name title={title}>{title}</Name>
                      <SmallText>{cat}</SmallText>
                    </TitleBox>
                  </HeaderTop>
                </HeaderLeft>
                <Status $on={!!s.isPublished}>
                  {s.isPublished ? t("published", "Published") : t("draft", "Draft")}
                </Status>
              </CardHeader>

              <CardBody>
                <SmallText>{t("price", "Price")}: <b className="mono">{typeof s.price === "number" ? s.price.toFixed(2) : "-"}</b></SmallText>
                <SmallText>{t("duration", "Duration (min)")}: <b className="mono">{s.durationMinutes ?? "-"}</b></SmallText>
              </CardBody>

              <CardActions>
                <Secondary onClick={() => onEdit(s)}>{t("edit", "Edit")}</Secondary>
                <Secondary onClick={() => onTogglePublish(s._id, !!s.isPublished)}>
                  {s.isPublished ? t("unpublish", "Unpublish") : t("publish", "Publish")}
                </Secondary>
                <Danger onClick={() => onDelete(s._id)}>{t("delete", "Delete")}</Danger>
              </CardActions>
            </Card>
          );
        })}
      </CardsWrap>
    </Wrap>
  );
}

/* styled — about list patern */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const SkeletonWrap = styled.div`display:flex;flex-direction:column;gap:1rem;`;
const ErrorBox = styled.div`padding:${({theme})=>theme.spacings.sm};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};color:${({theme})=>theme.colors.danger};border-radius:${({theme})=>theme.radii.md};`;
const Empty = styled.div`text-align:center;color:${({theme})=>theme.colors.textSecondary};`;

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
const Thumb = styled.div`
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
const Name = styled.span`
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

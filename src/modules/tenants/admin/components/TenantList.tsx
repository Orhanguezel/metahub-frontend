// TenantList.tsx
"use client";

import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/tenants";
import { Skeleton } from "@/shared";
import { ITenant } from "../../types";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";

interface TenantListProps {
  tenants: ITenant[];
  lang: SupportedLocale;
  loading?: boolean;
  error?: string | null;
  onEdit?: (tenant: ITenant) => void;
  onDelete?: (id: string) => void;
}

export default function TenantList({
  tenants,
  loading,
  error,
  onEdit,
  onDelete,
}: TenantListProps) {
  const { t, i18n } = useI18nNamespace("tenant", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const getLabel = (obj?: Partial<Record<SupportedLocale, string>>) =>
    obj?.[lang] || obj?.en || "—";

  if (loading) {
    return (
      <SkeletonWrap>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrap>
    );
  }

  if (error) return <ErrorText>❌ {t("admin.error", error)}</ErrorText>;
  if (!Array.isArray(tenants)) return null;
  if (tenants.length === 0)
    return <Empty>{t("admin.tenant.empty", "No tenant available.")}</Empty>;

  return (
    <ListWrap>
      {tenants.map((item) => (
        <Card key={item._id ?? item.slug}>
          <CardHead>
            <div>
              <Title>{getLabel(item.name)}</Title>
              <Meta>
                <strong>{t("admin.tenant.domain", "Domain")}:</strong> {item.domain?.main || "—"} •{" "}
                <strong>{t("admin.tenant.email", "Email")}:</strong> {item.emailSettings?.senderEmail || "—"} •{" "}
                <strong>{t("admin.tenant.phone", "Phone")}:</strong> {item.phone || "—"}
              </Meta>
            </div>
            <Status $on={!!item.isActive}>
              {item.isActive ? t("yes", "Yes") : t("no", "No")}
            </Status>
          </CardHead>

          <Desc>{getLabel(item.description)}</Desc>

          {Array.isArray(item.images) && item.images.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <Image
                  key={i}
                  src={img.url}
                  alt={`${getLabel(item.name)} image`}
                  width={120}
                  height={90}
                  style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }}
                />
              ))}
            </ImageGrid>
          ) : (
            <SmallMuted>{t("admin.tenant.no_images", "No images")}</SmallMuted>
          )}

          <Meta>
            <strong>{t("admin.tenant.social", "Social")}:</strong>{" "}
            {Object.entries(item.social || {})
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <a key={k} href={v!} target="_blank" rel="noopener noreferrer">{k}</a>
              ))}
            {Object.values(item.social || {}).filter(Boolean).length === 0 && "—"}
          </Meta>

          {(onEdit || onDelete) && (
            <Actions>
              {onEdit && <Secondary onClick={() => onEdit(item)}>{t("admin.edit", "Edit")}</Secondary>}
              {onDelete && (
                <Danger onClick={() => item._id && onDelete(item._id)}>
                  {t("admin.delete", "Delete")}
                </Danger>
              )}
            </Actions>
          )}
        </Card>
      ))}
    </ListWrap>
  );
}

/* styled */
const ListWrap = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const SkeletonWrap = styled.div`display:flex; flex-direction:column; gap:1rem;`;
const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const CardHead = styled.div`
  display:flex; align-items:flex-start; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
`;
const Title = styled.h3`margin:0; font-size:${({theme})=>theme.fontSizes.md};`;
const Meta = styled.p`
  margin:.25rem 0 0; color:${({theme})=>theme.colors.textSecondary};
  a{ margin-right:.7em; text-decoration:underline; }
`;
const Status = styled.span<{ $on:boolean }>`
  padding:.2em .6em; border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.warningBackground};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.warning};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderHighlight};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  min-width:60px; text-align:center;
`;
const Desc = styled.p`margin:.75rem 0; color:${({theme})=>theme.colors.text};`;
const ImageGrid = styled.div`display:flex; flex-wrap:wrap; gap:${({theme})=>theme.spacings.sm}; margin-top:${({theme})=>theme.spacings.sm};`;
const SmallMuted = styled.small`color:${({theme})=>theme.colors.textSecondary};`;
const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; margin-top:${({theme})=>theme.spacings.sm}; flex-wrap:wrap;`;

const Btn = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  border:${({theme})=>theme.borders.thin} transparent; font-weight:${({theme})=>theme.fontWeights.medium};
`;

const Secondary = styled(Btn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;

const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};
  &:hover{ background:${({theme})=>theme.colors.dangerHover}; color:${({theme})=>theme.colors.textOnDanger}; }
`;

const Empty = styled.p`text-align:center; color:${({theme})=>theme.colors.textSecondary};`;
const ErrorText = styled.p`color:${({theme})=>theme.colors.danger}; font-weight:bold;`;

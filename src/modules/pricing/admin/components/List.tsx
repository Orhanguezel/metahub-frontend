"use client";

import styled from "styled-components";
import type { IPricing } from "@/modules/pricing";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import { Skeleton } from "@/shared";
import type { SupportedLocale } from "@/types/common";

interface Props {
  pricing: IPricing[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: IPricing) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function PricingList({
  pricing,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useI18nNamespace("pricing", translations);

  if (loading) {
    return (
      <SkeletonWrapper>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }

  if (error) return <ErrorText>❌ {error}</ErrorText>;
  if (!Array.isArray(pricing)) return null;
  if (pricing.length === 0) return <Empty>{t("pricing.empty", "No pricing available.")}</Empty>;

  const getMultiLang = (obj?: Record<string, string>) => (obj ? obj[lang] || obj.en || Object.values(obj)[0] || "—" : "");

  return (
    <div>
      {pricing.map((item) => (
        <Card key={item._id}>
          <Header>
            <Title>{getMultiLang(item.title)}</Title>
            <Status $on={!!item.isPublished}>
              {item.isPublished ? t("published", "Published") : t("draft", "Draft")}
            </Status>
          </Header>

          <Body>
            <Row><Label>{t("pricing.description", "Description")}:</Label> <span>{getMultiLang(item.description)}</span></Row>
            <Row><Label>{t("pricing.category", "Category")}:</Label> <span>{item.category || "—"}</span></Row>
            <Row>
              <Label>{t("pricing.price", "Price")}:</Label>
              <span>
                {item.price != null ? item.price : "—"} {item.currency || ""}
                {item.period ? ` / ${t(`pricing.${item.period}`, item.period)}` : ""}
              </span>
            </Row>
            <Row>
              <Label>{t("pricing.popular", "Popular")}:</Label>
              <span>{item.isPopular ? t("yes", "Yes") : t("no", "No")}</span>
            </Row>
            <Row><Label>{t("pricing.order", "Order")}:</Label> <span className="mono">{item.order ?? 0}</span></Row>

            {/* Özellikler */}
            <FeaturesBlock>
              <SmallLabel>{t("pricing.features", "Features")}:</SmallLabel>
              <ul>
                {(item.features?.[lang] || item.features?.en || []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </FeaturesBlock>
          </Body>

          {(onEdit || onDelete || onTogglePublish) && (
            <Actions>
              {onEdit && <Secondary onClick={() => onEdit(item)}>{t("edit", "Edit")}</Secondary>}
              {onTogglePublish && item._id && (
                <Secondary onClick={() => onTogglePublish(item._id as string, item.isPublished)}>
                  {item.isPublished ? t("pricing.unpublish", "Unpublish") : t("pricing.publish", "Publish")}
                </Secondary>
              )}
              {onDelete && item._id && <Danger onClick={() => onDelete(item._id as string)}>{t("delete", "Delete")}</Danger>}
            </Actions>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ---- styled (Portfolio/Services list paternine yakın) ---- */
const SkeletonWrapper = styled.div`
  display:flex; flex-direction:column; gap:1rem;
`;

const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
  margin-bottom:${({theme})=>theme.spacings.md};
`;

const Header = styled.header`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.sm};
`;
const Title = styled.h3`margin:0;`;
const Status = styled.span<{ $on:boolean }>`
  padding:.2em .6em; border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const Body = styled.div`display:flex; flex-direction:column; gap:6px;`;
const Row = styled.div`display:flex; gap:6px; align-items:baseline;`;
const Label = styled.span`font-weight:${({theme})=>theme.fontWeights.medium};`;
const SmallLabel = styled.span`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const FeaturesBlock = styled.div`
  margin-top:${({theme})=>theme.spacings.xs};
  ul{ margin:.25rem 0 0 .9rem; }
`;

const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; justify-content:flex-end; margin-top:${({theme})=>theme.spacings.md};`;
const Secondary = styled.button`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{ background:${({theme})=>theme.colors.dangerHover}; color:${({theme})=>theme.colors.textOnDanger}; border-color:${({theme})=>theme.colors.dangerHover}; }
`;
const Empty = styled.p`text-align:center; color:${({theme})=>theme.colors.textSecondary};`;
const ErrorText = styled.p`color:${({theme})=>theme.colors.danger}; font-weight:bold;`;

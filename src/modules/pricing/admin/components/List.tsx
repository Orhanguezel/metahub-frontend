"use client";

import styled from "styled-components";
import { IPricing } from "@/modules/pricing";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import { Skeleton } from "@/shared";
import { SupportedLocale } from "@/types/common";

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
  if (pricing.length === 0)
    return <Empty>{t("pricing.empty", "No pricing available.")}</Empty>;

  // Çok dilli alanlar için (title/description)
  const getMultiLang = (obj?: Record<string, string>) => {
    if (!obj) return "";
    return obj[lang] || obj["en"] || Object.values(obj)[0] || "—";
  };

  // ... aynı kodun devamı

return (
  <div>
    {pricing.map((item) => (
      <PricingCard key={item._id || item.title?.en || Math.random()}>
        <h2>{getMultiLang(item.title)}</h2>
        <p>
          <strong>{t("pricing.description", "Description")}: </strong>
          {getMultiLang(item.description)}
        </p>

        {/* ... diğer InfoLine alanları aynı ... */}

        {(onEdit || onDelete || onTogglePublish) && (
          <ButtonGroup>
            {onEdit && (
              <ActionButton
                onClick={() => onEdit(item)}
                aria-label={t("edit", "Edit")}
              >
                {t("edit", "Edit")}
              </ActionButton>
            )}
            {onDelete && item._id && (
              <DeleteButton
                onClick={() => onDelete(item._id as string)}
                aria-label={t("delete", "Delete")}
              >
                {t("delete", "Delete")}
              </DeleteButton>
            )}
            {onTogglePublish && item._id && (
              <ToggleButton
                onClick={() =>
                  onTogglePublish(item._id as string, item.isPublished)
                }
                aria-label={
                  item.isPublished
                    ? t("pricing.unpublish", "Unpublish")
                    : t("pricing.publish", "Publish")
                }
              >
                {item.isPublished
                  ? t("pricing.unpublish", "Unpublish")
                  : t("pricing.publish", "Publish")}
              </ToggleButton>
            )}
          </ButtonGroup>
        )}
      </PricingCard>
    ))}
  </div>
);

}

// --- Styles ---
const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PricingCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ToggleButton = styled.button`
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

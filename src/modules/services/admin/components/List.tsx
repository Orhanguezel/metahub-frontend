"use client";

import styled from "styled-components";
import { IServices } from "@/modules/services";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/services/locales";
import { Skeleton } from "@/shared";
import { SupportedLocale } from "@/types/common";
import Image from "next/image";

interface Props {
  services: IServices[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: IServices) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ServicesList({
  services,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useI18nNamespace("services", translations);

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
  if (!Array.isArray(services)) return null;
  if (services.length === 0)
    return <Empty>{t("services.empty", "No services available.")}</Empty>;

  // Fallback fonksiyonu (çok dilli)
  const getMultiLang = (obj?: Record<string, string>) => {
    if (!obj) return "";
    return obj[lang] || obj["en"] || Object.values(obj)[0] || "—";
  };

  return (
    <div>
      {services.map((item) => (
        <ServicesCard key={item._id}>
          <h2>{getMultiLang(item.title)}</h2>
          <p>{getMultiLang(item.summary)}</p>

          {item.images?.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <Image
                  key={i}
                  src={img.url}
                  alt={getMultiLang(item.title) || `services-${i}`}
                  loading="lazy"
                  width={150}
                  height={100}
                />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("services.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("services.author", "Author")}:</strong>{" "}
            {item.author || t("unknown", "Unknown")}
          </InfoLine>
          <InfoLine>
            <strong>{t("services.tags", "Tags")}:</strong>{" "}
            {item.tags?.length ? item.tags.join(", ") : t("none", "None")}
          </InfoLine>
          <InfoLine>
            <strong>{t("services.publish_status", "Published")}:</strong>{" "}
            {item.isPublished ? t("yes", "Yes") : t("no", "No")}
          </InfoLine>

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
              {onDelete && (
                <DeleteButton
                  onClick={() => onDelete(item._id)}
                  aria-label={t("delete", "Delete")}
                >
                  {t("delete", "Delete")}
                </DeleteButton>
              )}
              {onTogglePublish && (
                <ToggleButton
                  onClick={() => onTogglePublish(item._id, item.isPublished)}
                  aria-label={
                    item.isPublished
                      ? t("services.unpublish", "Unpublish")
                      : t("services.publish", "Publish")
                  }
                >
                  {item.isPublished
                    ? t("services.unpublish", "Unpublish")
                    : t("services.publish", "Publish")}
                </ToggleButton>
              )}
            </ButtonGroup>
          )}
        </ServicesCard>
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

const ServicesCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const ImageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;

  img {
    width: 150px;
    border-radius: 4px;
    object-fit: cover;
  }
`;

const InfoLine = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
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

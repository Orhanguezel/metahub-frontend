"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/tenants";
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
  const { t,i18n } = useI18nNamespace("tenant", translations);

const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
const getLabel = (obj?: Partial<Record<SupportedLocale, string>>) =>
  obj?.[lang] || obj?.en || "—";


  if (loading) {
    return (
      <SkeletonWrapper>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }

  if (error) return <ErrorText>❌ {t("admin.error", error)}</ErrorText>;
  if (!Array.isArray(tenants)) return null;
  if (tenants.length === 0)
    return <Empty>{t("admin.tenant.empty", "No tenant available.")}</Empty>;

  return (
    <div>
      {tenants.map((item) => (
        <TenantCard key={item._id ?? item.slug}>
          <h2>{getLabel(item.name)}</h2>
          <SmallLine>
            <strong>{t("admin.tenant.domain", "Domain")}:</strong>{" "}
            {item.domain?.main || "—"}
          </SmallLine>
          <SmallLine>
            <strong>{t("admin.tenant.email", "Email")}:</strong>{" "}
            {item.emailSettings?.senderEmail || "—"}
          </SmallLine>
          <SmallLine>
            <strong>{t("admin.tenant.phone", "Phone")}:</strong>{" "}
            {item.phone || "—"}
          </SmallLine>
          <SmallLine>
            <strong>{t("admin.tenant.active", "Active")}:</strong>{" "}
            <Status $active={!!item.isActive}>
              {item.isActive ? t("yes", "Yes") : t("no", "No")}
            </Status>
          </SmallLine>
          <p>{getLabel(item.description)}</p>

          {/* Görseller */}
          {Array.isArray(item.images) && item.images.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <Image
                  key={i}
                  src={img.url}
                  alt={getLabel(item.name) + " image"}
                  width={120}
                  height={90}
                  style={{
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("admin.tenant.no_images", "No images")}</small>
          )}

          {/* Sosyal Medya */}
          <SmallLine>
            <strong>{t("admin.tenant.social", "Social")}:</strong>{" "}
            {Object.entries(item.social || {})
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <a
                  key={k}
                  href={v!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: "0.7em" }}
                >
                  {k}
                </a>
              ))}
            {Object.values(item.social || {}).filter(Boolean).length === 0 &&
              "—"}
          </SmallLine>

          {(onEdit || onDelete) && (
            <ButtonGroup>
              {onEdit && (
                <ActionButton onClick={() => onEdit(item)}>
                  {t("admin.edit", "Edit")}
                </ActionButton>
              )}
              {onDelete && (
                <DeleteButton onClick={() => item._id && onDelete(item._id)}>
                  {t("admin.delete", "Delete")}
                </DeleteButton>
              )}
            </ButtonGroup>
          )}
        </TenantCard>
      ))}
    </div>
  );
}

// --- Styled Components ---

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TenantCard = styled.div`
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
    width: 120px;
    height: 90px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const SmallLine = styled.p`
  margin: 0.2em 0 0.4em 0;
  font-size: 0.98em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Status = styled.span<{ $active: boolean }>`
  font-weight: 600;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.success : theme.colors.danger};
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

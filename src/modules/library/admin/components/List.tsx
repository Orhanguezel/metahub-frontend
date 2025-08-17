"use client";

import styled from "styled-components";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import type { ILibrary } from "@/modules/library/types";
import type { SupportedLocale } from "@/types/common";
import { Skeleton } from "@/shared";

interface Props {
  library: ILibrary[] | undefined;
  loading: boolean;
  error: string | null;
  onEdit?: (item: ILibrary) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function LibraryList({ library, loading, error, onEdit, onDelete, onTogglePublish }: Props) {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  if (loading) {
    return (
      <SkeletonWrap>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
      </SkeletonWrap>
    );
  }
  if (error) return <ErrorText>❌ {error}</ErrorText>;
  if (!Array.isArray(library)) return null;
  if (library.length === 0) return <Empty>{t("library.empty", "No library available.")}</Empty>;

  return (
    <ListWrap>
      {library.map((item) => {
        const title = item.title?.[lang] || Object.values(item.title || {})[0] || "—";
        const summary = item.summary?.[lang] || Object.values(item.summary || {})[0] || "—";
        return (
          <Card key={item._id}>
            <Head>
              <div>
                <Title>{title}</Title>
                <Subtitle>{summary}</Subtitle>
              </div>
              <Badge $on={item.isPublished}>
                {item.isPublished ? t("yes", "Yes") : t("no", "No")}
              </Badge>
            </Head>

            {/* images */}
            {Array.isArray(item.images) && item.images.length > 0 ? (
              <ImageGrid>
                {item.images.map((img, i) => (
                  <Image
                    key={img._id ?? `${item._id}-${i}`}
                    src={img.url}
                    alt={title || `library-${i}`}
                    loading="lazy"
                    width={150}
                    height={100}
                    sizes="150px"
                    style={{ borderRadius: 6, objectFit: "cover" }}
                  />
                ))}
              </ImageGrid>
            ) : (
              <NoImage>{t("library.no_images", "No images")}</NoImage>
            )}

            {/* files (PDF) */}
            {item.files && item.files.length > 0 && (
              <Files>
                <strong>{t("library.files", "Files")}:</strong>
                <ul>
                  {item.files.map((f, idx) =>
                    f.type === "application/pdf" ? (
                      <li key={f._id ?? idx}>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" download={f.name}>
                          {f.name || t("library.pdf_file", "PDF File")}
                        </a>
                      </li>
                    ) : null
                  )}
                </ul>
              </Files>
            )}

            <Meta>
              <span><b>{t("library.author", "Author")}:</b> {item.author || t("unknown", "Unknown")}</span>
              <span><b>{t("library.tags", "Tags")}:</b> {item.tags?.length ? item.tags.join(", ") : t("none", "None")}</span>
            </Meta>

            {(onEdit || onDelete || onTogglePublish) && (
              <Actions>
                {onEdit && <Secondary onClick={() => onEdit(item)}>{t("edit", "Edit")}</Secondary>}
                {onDelete && <Danger onClick={() => onDelete(item._id)}>{t("delete", "Delete")}</Danger>}
                {onTogglePublish && (
                  <Success onClick={() => onTogglePublish(item._id, item.isPublished)}>
                    {item.isPublished ? t("library.unpublish", "Unpublish") : t("library.publish", "Publish")}
                  </Success>
                )}
              </Actions>
            )}
          </Card>
        );
      })}
    </ListWrap>
  );
}

/* styled */
const SkeletonWrap = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const ListWrap = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const Head = styled.header`
  display:flex; align-items:flex-start; justify-content:space-between;
  gap:${({theme})=>theme.spacings.md}; margin-bottom:${({theme})=>theme.spacings.sm};
`;
const Title = styled.h2`
  margin:0 0 ${({theme})=>theme.spacings.xs} 0;
  color:${({theme})=>theme.colors.title}; font-size:${({theme})=>theme.fontSizes.lg};
`;
const Subtitle = styled.p`margin:0; color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.sm};`;
const Badge = styled.span<{ $on:boolean }>`
  align-self:flex-start; padding:6px 10px; border-radius:${({theme})=>theme.radii.pill};
  font-size:${({theme})=>theme.fontSizes.xs}; font-weight:${({theme})=>theme.fontWeights.semiBold};
  color:${({theme,$on})=>$on? theme.colors.textOnSuccess : theme.colors.textOnDanger};
  background:${({theme,$on})=>$on? theme.colors.successBg : theme.colors.dangerBg};
  border:${({theme})=>theme.borders.thin} ${({theme,$on})=>$on? theme.colors.success : theme.colors.danger};
`;
const ImageGrid = styled.div`display:flex; flex-wrap:wrap; gap:${({theme})=>theme.spacings.sm}; margin-top:${({theme})=>theme.spacings.sm};`;
const NoImage = styled.small`display:inline-block; margin-top:${({theme})=>theme.spacings.xs}; color:${({theme})=>theme.colors.textSecondary};`;
const Files = styled.div`
  margin-top:${({theme})=>theme.spacings.sm}; font-size:0.96rem;
  ul{ margin:.25rem 0 0 .9rem; padding:0; list-style:disc; }
  a{ color:${({theme})=>theme.colors.link}; text-decoration:underline; font-weight:500; }
`;
const Meta = styled.div`
  display:grid; grid-template-columns:1fr; gap:6px;
  margin-top:${({theme})=>theme.spacings.sm}; color:${({theme})=>theme.colors.text};
`;
const Actions = styled.div`
  margin-top:${({theme})=>theme.spacings.md}; display:flex; flex-wrap:wrap; gap:${({theme})=>theme.spacings.xs};
  justify-content:flex-end;
`;
const Secondary = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;
const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{ background:${({theme})=>theme.colors.dangerHover}; color:${({theme})=>theme.colors.textOnDanger}; }
`;
const Success = styled(Secondary)`
  background:${({theme})=>theme.colors.successBg};
  color:${({theme})=>theme.colors.success};
  border-color:${({theme})=>theme.colors.success};
  &:hover{ background:${({theme})=>theme.colors.success}; color:${({theme})=>theme.colors.textOnSuccess}; }
`;
const Empty = styled.p`text-align:center; color:${({theme})=>theme.colors.textSecondary};`;
const ErrorText = styled.p`color:${({theme})=>theme.colors.danger}; font-weight:${({theme})=>theme.fontWeights.semiBold};`;

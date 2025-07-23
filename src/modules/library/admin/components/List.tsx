"use client";

import styled from "styled-components";
import { ILibrary } from "@/modules/library";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import { Skeleton } from "@/shared";
import { SupportedLocale } from "@/types/common";
import Image from "next/image";

interface Props {
  library: ILibrary[] | undefined;
  loading: boolean;
  error: string | null;
  onEdit?: (item: ILibrary) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function LibraryList({
  library,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

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
  if (!Array.isArray(library)) return null;
  if (library.length === 0)
    return <Empty>{t("library.empty", "No library available.")}</Empty>;


  return (
    <div>
      {library.map((item) => (
        <LibraryCard key={item._id}>
          <h2>{item.title?.[lang] || Object.values(item.title || {})[0] || "—"}</h2>
          <p>{item.summary?.[lang] || Object.values(item.summary || {})[0] || "—"}</p>

          {/* IMAGES */}
         {Array.isArray(item.images) && item.images.length > 0 ? (
  <ImageGrid>
    {item.images.map((img, i) => (
      <Image
        key={i}
        src={img.url}
        alt={item.title?.[lang] || Object.values(item.title || {})[0] || `library-${i}`}
        loading="lazy"
        width={150}
        height={100}
      />
    ))}
  </ImageGrid>
) : (
  <small>{t("library.no_images", "No images")}</small>
)}


          {/* PDF ve diğer dosyalar */}
          {item.files && item.files.length > 0 && (
            <FileSection>
              <strong>{t("library.files", "Files")}:</strong>
              <ul>
                {item.files.map((file, idx) =>
                  file.type === "application/pdf" ? (
                    <li key={file.url || idx}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={file.name}
                      >
                        {file.name || t("library.pdf_file", "PDF File")}
                      </a>
                    </li>
                  ) : null
                )}
              </ul>
            </FileSection>
          )}

          <InfoLine>
            <strong>{t("library.author", "Author")}:</strong>{" "}
            {item.author || t("unknown", "Unknown")}
          </InfoLine>
          <InfoLine>
            <strong>{t("library.tags", "Tags")}:</strong>{" "}
            {item.tags?.length ? item.tags.join(", ") : t("none", "None")}
          </InfoLine>
          <InfoLine>
            <strong>{t("library.publish_status", "Published")}:</strong>{" "}
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
                      ? t("library.unpublish", "Unpublish")
                      : t("library.publish", "Publish")
                  }
                >
                  {item.isPublished
                    ? t("library.unpublish", "Unpublish")
                    : t("library.publish", "Publish")}
                </ToggleButton>
              )}
            </ButtonGroup>
          )}
        </LibraryCard>
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

const LibraryCard = styled.div`
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

// Yeni eklenen dosya alanı
const FileSection = styled.div`
  margin-top: 1rem;
  font-size: 0.96rem;
  ul {
    margin: 0.25rem 0 0 0.5rem;
    padding: 0;
    list-style: disc;
  }
  a {
    color: ${({ theme }) => theme.colors.primary || "#007bff"};
    text-decoration: underline;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
      opacity: 0.85;
    }
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

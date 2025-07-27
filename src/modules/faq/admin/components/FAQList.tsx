import styled from "styled-components";
import { IFaq } from "@/modules/faq/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";
import { Skeleton } from "@/shared";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

interface Props {
  faqs: IFaq[];
  loading?: boolean;
  onEdit?: (faq: IFaq) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function FAQList({ faqs, loading, onEdit, onDelete, onTogglePublish }: Props) {
  const { i18n, t } = useI18nNamespace("faq", translations);

  const lang: SupportedLocale = (() => {
    const code = i18n.language?.slice(0, 2);
    return SUPPORTED_LOCALES.includes(code as SupportedLocale)
      ? (code as SupportedLocale)
      : "en";
  })();

  if (loading) {
    return (
      <SkeletonWrapper>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }

  if (!Array.isArray(faqs) || faqs.length === 0) {
    return <Empty>{t("adminFaq.list.empty", "No FAQs found.")}</Empty>;
  }

  return (
    <ListContainer>
      {faqs.map((item) => {
        const question = item.question[lang]?.trim();
        const answer = item.answer[lang]?.trim();

        return (
          <FaqCard key={item._id}>
            <Label>{t("adminFaq.question", "Question")}:</Label>
            <Question>{question || "—"}</Question>

            <Label>{t("adminFaq.answer", "Answer")}:</Label>
            <Answer>{answer || "—"}</Answer>

            <StatusLine>
              <strong>{t("adminFaq.published", "Published")}:</strong>{" "}
              {onTogglePublish ? (
                <PublishButton
                  $active={!!item.isPublished}
                  title={
                     item.isPublished
                      ? t("adminFaq.unpublish", "Unpublish")
                      : t("adminFaq.publish", "Publish")
                  }
                  onClick={() =>
  item._id && onTogglePublish(item._id, !item.isPublished)
}
                >
                  {item.isPublished ? (
                    <>
                      <MdCheckCircle size={20} />
                      {t("common.yes", "Yes")}
                    </>
                  ) : (
                    <>
                      <MdRadioButtonUnchecked size={20} />
                      {t("common.no", "No")}
                    </>
                  )}
                </PublishButton>
              ) : (
                <span>{item.isPublished ? t("common.yes", "Yes") : t("common.no", "No")}</span>
              )}
            </StatusLine>

            {(onEdit || onDelete) && (
              <ButtonGroup>
                {onEdit && (
                  <ActionButton onClick={() => onEdit(item)}>
                    {t("common.edit", "Edit")}
                  </ActionButton>
                )}
                {onDelete && (
                  <DeleteButton
                    onClick={() => {
                      const confirmMsg = t(
                        "confirm.delete",
                        "Are you sure you want to delete this FAQ?"
                      );
                      if (item._id && confirm(confirmMsg)) {
                        onDelete(item._id);
                      }
                    }}
                  >
                    {t("common.delete", "Delete")}
                  </DeleteButton>
                )}
              </ButtonGroup>
            )}
          </FaqCard>
        );
      })}
    </ListContainer>
  );
}

// --- Styles ---
const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FaqCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.5rem 1rem 1.25rem 1rem;
  position: relative;
`;

const Label = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const Question = styled.div`
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
`;

const Answer = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.8rem;
`;

const StatusLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0.2rem 0;
  font-size: 0.96rem;
`;

const PublishButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.success : theme.colors.border};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 3px 12px 3px 7px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  font-size: 1em;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.warning};
  }
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
  display: flex;
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

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

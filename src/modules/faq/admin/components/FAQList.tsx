"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";
import { Skeleton } from "@/shared";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import type { IFaq } from "@/modules/faq/types";

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
      <SkeletonWrap>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrap>
    );
  }

  if (!Array.isArray(faqs) || faqs.length === 0) {
    return <Empty>{t("adminFaq.list.empty", "No FAQs found.")}</Empty>;
  }

  return (
    <Wrap>
      {/* Desktop table */}
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>{t("adminFaq.question", "Question")}</th>
              <th>{t("adminFaq.answer", "Answer")}</th>
              <th>{t("adminFaq.published", "Published")}</th>
              <th aria-label={t("admin.actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {faqs.map((item) => {
              const q = item.question?.[lang]?.trim() || "—";
              const a = item.answer?.[lang]?.trim() || "—";
              return (
                <tr key={item._id}>
                  <td style={{maxWidth:420}}><Ellipsize title={q}>{q}</Ellipsize></td>
                  <td style={{maxWidth:520}}><Ellipsize title={a}>{a}</Ellipsize></td>
                  <td>
                    <Badge $on={!!item.isPublished}>
                      {item.isPublished ? t("common.yes", "Yes") : t("common.no", "No")}
                    </Badge>
                  </td>
                  <td className="actions">
                    <Row>
                      {onTogglePublish && item._id && (
                        <Secondary onClick={() => onTogglePublish(item._id!, !!item.isPublished)}>
                          {item.isPublished ? t("adminFaq.unpublish", "Unpublish") : t("adminFaq.publish", "Publish")}
                        </Secondary>
                      )}
                      {onEdit && <Secondary onClick={() => onEdit(item)}>{t("common.edit", "Edit")}</Secondary>}
                      {onDelete && item._id && (
                        <Danger
                          onClick={() => {
                            const msg = t("confirm.delete", "Are you sure you want to delete this FAQ?");
                            if (confirm(msg)) onDelete(item._id!);
                          }}
                        >
                          {t("common.delete", "Delete")}
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

      {/* Mobile cards */}
      <CardsWrap>
        {faqs.map((item) => {
          const q = item.question?.[lang]?.trim() || "—";
          const a = item.answer?.[lang]?.trim() || "—";
          return (
            <Card key={item._id}>
              <CardBody>
                <Label>{t("adminFaq.question", "Question")}:</Label>
                <TitleText>{q}</TitleText>

                <Label>{t("adminFaq.answer", "Answer")}:</Label>
                <BodyText>{a}</BodyText>

                <Status>
                  {t("adminFaq.published", "Published")}{" "}
                  <Badge $on={!!item.isPublished}>
                    {item.isPublished ? t("common.yes", "Yes") : t("common.no", "No")}
                  </Badge>
                </Status>
              </CardBody>

              <CardActions>
                {onTogglePublish && item._id && (
                  <Secondary onClick={() => onTogglePublish(item._id!, !!item.isPublished)}>
                    {item.isPublished ? t("adminFaq.unpublish", "Unpublish") : t("adminFaq.publish", "Publish")}
                  </Secondary>
                )}
                {onEdit && <Secondary onClick={() => onEdit(item)}>{t("common.edit", "Edit")}</Secondary>}
                {onDelete && item._id && (
                  <Danger
                    onClick={() => {
                      const msg = t("confirm.delete", "Are you sure you want to delete this FAQ?");
                      if (confirm(msg)) onDelete(item._id!);
                    }}
                  >
                    {t("common.delete", "Delete")}
                  </Danger>
                )}
              </CardActions>
            </Card>
          );
        })}
      </CardsWrap>
    </Wrap>
  );
}

/* ---- styled (list/table pattern) ---- */
const SkeletonWrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.sm};`;
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;

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
    font-size:${({theme})=>theme.fontSizes.sm};vertical-align:top;
  }
  td.actions{text-align:right;}
  tbody tr:hover td{ background:${({theme})=>theme.colors.hoverBackground}; }
`;

const Ellipsize = styled.div`
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
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

const CardBody = styled.div`padding:${({theme})=>theme.spacings.md};display:flex;flex-direction:column;gap:6px;`;
const Label = styled.span`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const TitleText = styled.div`font-weight:${({theme})=>theme.fontWeights.medium};`;
const BodyText = styled.div`color:${({theme})=>theme.colors.text}; opacity:.9;`;

const Status = styled.div`
  margin-top:${({theme})=>theme.spacings.xs};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
`;

const CardActions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.md};
  border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;

const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;justify-content:flex-end;`;

const BaseBtn = styled.button`
  padding:8px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const Secondary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
`;

const Danger = styled(BaseBtn)`
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
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

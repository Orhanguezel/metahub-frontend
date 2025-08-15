"use client";
import styled from "styled-components";
import type { INotification } from "@/modules/notification/types"; // v2 type
import type { SupportedLocale } from "@/types/common";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/notification/locales";
import NotificationRow from "./NotificationRow";

interface Props {
  notifications: INotification[];
  lang: SupportedLocale;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

type UserRef =
  | string
  | { _id: string; name?: string; email?: string }
  | null
  | undefined;

const isUserObj = (
  u: UserRef
): u is { _id: string; name?: string; email?: string } =>
  typeof u === "object" && u !== null && "_id" in u;

const getUserEmail = (u: UserRef) =>
  isUserObj(u) ? u.email || "-" : "-";

const pickLocalized = (
  obj: Partial<Record<SupportedLocale, string>> | undefined,
  lang: SupportedLocale
): string => {
  if (!obj) return "-";
  return (
    obj[lang] ??
    obj.en ??
    (Object.values(obj).find(
      (v): v is string => typeof v === "string" && v.length > 0
    ) ?? "-")
  );
};

const fmtDate = (d: string | Date, lang: SupportedLocale) =>
  new Date(d).toLocaleString(lang);

// --- Notification Table ---
export function NotificationTable({
  notifications,
  lang,
  onMarkRead,
  onDelete,
}: Props) {
  const { t } = useI18nNamespace("notification", translations);

  return (
    <TableWrapper>
      {/* Desktop table */}
      <StyledTable>
        <thead>
          <tr>
            <th>{t("type", "Tip")}</th>
            <th>{t("userOrScope", "Kullanıcı/Alan")}</th>
            <th>{t("email", "E-posta")}</th>
            <th>{t("title", "Başlık")}</th>
            <th>{t("message", "Mesaj")}</th>
            <th>{t("date", "Tarih")}</th>
            <th>{t("read", "Okundu")}</th>
            <th>{t("actions", "Eylemler")}</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <NotificationRow
              key={String(n._id)}
              notification={n}
              lang={lang}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </StyledTable>

      {/* Mobile cards */}
      <CardList>
        {notifications.map((n) => {
          const scope = isUserObj(n.user)
            ? n.user.name || n.user._id
            : typeof n.user === "string"
            ? n.user
            : n.target?.roles?.length
            ? `roles: ${n.target.roles.join(", ")}`
            : n.target?.allTenant
            ? "allTenant"
            : "-";

          return (
            <Card key={String(n._id)}>
              <Row>
                <Field>{t("type", "Tip")}</Field>
                <Value>{t(`type_${n.type}`, n.type)}</Value>
              </Row>
              <Row>
                <Field>{t("userOrScope", "Kullanıcı/Alan")}</Field>
                <Value>{scope}</Value>
              </Row>
              <Row>
                <Field>{t("email", "E-posta")}</Field>
                <Value>{getUserEmail(n.user)}</Value>
              </Row>
              <Row>
                <Field>{t("title", "Başlık")}</Field>
                <Value>{pickLocalized(n.title, lang)}</Value>
              </Row>
              <Row>
                <Field>{t("message", "Mesaj")}</Field>
                <Value>{pickLocalized(n.message, lang)}</Value>
              </Row>
              <Row>
                <Field>{t("date", "Tarih")}</Field>
                <Value>{fmtDate(n.createdAt as any, lang)}</Value>
              </Row>
              <Row>
                <Field>{t("read", "Okundu")}</Field>
                <Value>
                  <Status $read={n.isRead}>
                    {n.isRead ? t("read", "Okundu") : t("unread", "Okunmadı")}
                  </Status>
                </Value>
              </Row>
              <Row>
                <Field>{t("actions", "Eylemler")}</Field>
                <Value>
                  {!n.isRead && (
                    <ActionButton onClick={() => onMarkRead(String(n._id))}>
                      {t("markRead", "Okundu Yap")}
                    </ActionButton>
                  )}
                  <ActionButton danger onClick={() => onDelete(String(n._id))}>
                    {t("delete", "Sil")}
                  </ActionButton>
                </Value>
              </Row>
            </Card>
          );
        })}
      </CardList>
    </TableWrapper>
  );
}

// --- Styles ---
const TableWrapper = styled.div`
  width: 100%;
`;

const StyledTable = styled.table`
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  font-size: ${({ theme }) => theme.fontSizes.base};

  th,
  td {
    padding: ${({ theme }) => theme.spacings.md} ${({ theme }) =>
        theme.spacings.sm};
    text-align: left;
    background: inherit;
    max-width: 240px;
    word-break: break-word;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  th {
    background-color: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  }

  tr:last-child td {
    border-bottom: none;
  }

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const CardList = styled.div`
  display: none;
  ${({ theme }) => theme.media.mobile} {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacings.lg};
    margin-top: ${({ theme }) => theme.spacings.md};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const Field = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 100px;
  flex: 1 1 40%;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
  text-align: right;
  max-width: 55%;
  flex: 1 1 60%;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Status = styled.span<{ $read?: boolean }>`
  display: inline-block;
  padding: 0.3em 1em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: ${({ $read, theme }) =>
    $read ? theme.colors.successBg : theme.colors.warningBackground};
  color: ${({ $read, theme }) =>
    $read ? theme.colors.success : theme.colors.warning};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.borderHighlight};
  min-width: 70px;
  text-align: center;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "danger",
})<{ danger?: boolean }>`
  background: ${({ danger, theme }) =>
    danger ? theme.colors.dangerBg : theme.colors.buttonBackground};
  color: ${({ danger, theme }) =>
    danger ? theme.colors.danger : theme.colors.buttonText};
  border: ${({ theme }) => theme.borders.thin}
    ${({ danger, theme }) =>
      danger ? theme.colors.danger : theme.colors.buttonBorder};
  padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  margin-right: ${({ theme }) => theme.spacings.xs};
  margin-bottom: 3px;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${({ danger, theme }) =>
      danger ? theme.colors.danger : theme.colors.primaryHover};
    color: #fff;
  }
`;

export default NotificationTable;

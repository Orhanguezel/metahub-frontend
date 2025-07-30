import styled from "styled-components";
import type { INotification } from "../../types";
import type { SupportedLocale } from "@/types/common";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/notification/locales";

interface Props {
  notifications: INotification[];
  lang: SupportedLocale;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

// --- Notification Table ---
export function NotificationTable({
  notifications,
  lang,
  onMarkRead,
  onDelete,
}: Props) {
  // Bildirimler için i18n hook (namespace notification)
  const { t } = useI18nNamespace("notification", translations);

  return (
    <TableWrapper>
      {/* Masaüstü Tablo */}
      <StyledTable>
        <thead>
          <tr>
            <th>{t("type", "Tip")}</th>
            <th>{t("user", "Kullanıcı")}</th>
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
            <tr key={n._id}>
              <td>{t(`type_${n.type}`, n.type)}</td>
              <td>{n.user?.name || "-"}</td>
              <td>{n.user?.email || "-"}</td>
              <td>{n.title?.[lang] || "-"}</td>
              <td>{n.message?.[lang] || "-"}</td>
              <td>{new Date(n.createdAt).toLocaleString(lang)}</td>
              <td>
                <Status $read={n.isRead}>
                  {n.isRead ? t("read", "Okundu") : t("unread", "Okunmadı")}
                </Status>
              </td>
              <td>
                {!n.isRead && (
                  <ActionButton onClick={() => onMarkRead(n._id)}>
                    {t("markRead", "Okundu Yap")}
                  </ActionButton>
                )}
                <ActionButton danger={true} onClick={() => onDelete(n._id)}>
                  {t("delete", "Sil")}
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>

      {/* Mobil Card List */}
      <CardList>
        {notifications.map((n) => (
          <NotificationCard
            key={n._id}
            notification={n}
            lang={lang}
            t={(key, def) => t(key, { defaultValue: def })}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </CardList>
    </TableWrapper>
  );
}

// --- Mobil Card ---
function NotificationCard({
  notification,
  lang,
  t,
  onMarkRead,
  onDelete,
}: {
  notification: INotification;
  lang: SupportedLocale;
  t: (key: string, defaultText?: string) => string;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <Row>
        <Field>{t("type", "Tip")}</Field>
        <Value>{t(`type_${notification.type}`, notification.type)}</Value>
      </Row>
      <Row>
        <Field>{t("user", "Kullanıcı")}</Field>
        <Value>{notification.user?.name || "-"}</Value>
      </Row>
      <Row>
        <Field>{t("email", "E-posta")}</Field>
        <Value>{notification.user?.email || "-"}</Value>
      </Row>
      <Row>
        <Field>{t("title", "Başlık")}</Field>
        <Value>{notification.title?.[lang] || "-"}</Value>
      </Row>
      <Row>
        <Field>{t("message", "Mesaj")}</Field>
        <Value>{notification.message?.[lang] || "-"}</Value>
      </Row>
      <Row>
        <Field>{t("date", "Tarih")}</Field>
        <Value>{new Date(notification.createdAt).toLocaleString(lang)}</Value>
      </Row>
      <Row>
        <Field>{t("read", "Okundu")}</Field>
        <Value>
          <Status $read={notification.isRead}>
            {notification.isRead ? t("read", "Okundu") : t("unread", "Okunmadı")}
          </Status>
        </Value>
      </Row>
      <Row>
        <Field>{t("actions", "Eylemler")}</Field>
        <Value>
          {!notification.isRead && (
            <ActionButton onClick={() => onMarkRead(notification._id)}>
              {t("markRead", "Okundu Yap")}
            </ActionButton>
          )}
          <ActionButton danger onClick={() => onDelete(notification._id)}>
            {t("delete", "Sil")}
          </ActionButton>
        </Value>
      </Row>
    </Card>
  );
}

// --- Styled aynı kalabilir ---

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
  th, td {
    padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.sm};
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
  tr:last-child td { border-bottom: none; }
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

// styled-components v5+ için (en güncel)
const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "danger"
})<{ danger?: boolean }>`
  background: ${({ danger, theme }) =>
    danger ? theme.colors.dangerBg : theme.colors.buttonBackground};
  color: ${({ danger, theme }) =>
    danger ? theme.colors.danger : theme.colors.buttonText};
  border: ${({ theme }) => theme.borders.thin}
    ${({ danger, theme }) => (danger ? theme.colors.danger : theme.colors.buttonBorder)};
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

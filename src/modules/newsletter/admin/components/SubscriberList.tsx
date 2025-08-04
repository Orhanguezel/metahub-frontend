"use client";
import styled from "styled-components";
import type { INewsletter } from "@/modules/newsletter/types";

interface Props {
  subscribers: INewsletter[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onVerify: (id: string) => void;
  onSingleSend: (subscriber: INewsletter) => void;
  selectedId: string | null;
  t: (key: string, defaultValue?: string, vars?: Record<string, any>) => string;
}

export default function SubscriberList({
  subscribers,
  onSelect,
  onDelete,
  onVerify,
  onSingleSend,
  selectedId,
  t,
}: Props) {
  if (!subscribers.length)
    return (
      <ListEmpty>
        {t("admin.noSubscribers", "Hiç abone yok.")}
      </ListEmpty>
    );

  return (
    <ResponsiveTableWrapper>
      {/* Masaüstü/tablo */}
      <StyledTable>
        <thead>
          <tr>
            <th>{t("admin.email", "E-posta")}</th>
            <th>{t("admin.status", "Durum")}</th>
            <th>{t("admin.date", "Tarih")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr
              key={sub._id}
              className={selectedId === sub._id ? "active" : ""}
            >
              <td
                onClick={() => onSelect(sub._id)}
                style={{ cursor: "pointer", fontWeight: 500, wordBreak: "break-all" }}
                title={t("admin.selectTooltip", "Detayları göster")}
              >
                {sub.email}
              </td>
              <td>
                {sub.verified ? (
                  <Verified>{t("admin.verified", "Onaylı")}</Verified>
                ) : (
                  <VerifyBtn onClick={() => onVerify(sub._id)}>
                    {t("admin.verify", "Onayla")}
                  </VerifyBtn>
                )}
              </td>
              <td>
                {sub.subscribeDate
                  ? new Date(sub.subscribeDate).toLocaleDateString()
                  : "-"}
              </td>
              <td>
                <TableActionBtn
                  color="#156edc"
                  onClick={() => onSingleSend(sub)}
                  aria-label={t("admin.sendSingle", "Tekil Gönder")}
                  title={t("admin.sendSingle", "Aboneye e-posta gönder")}
                >
                  {t("admin.sendSingle", "Tekil Gönder")}
                </TableActionBtn>
                <TableActionBtn
                  color="#b90d0d"
                  onClick={() => onDelete(sub._id)}
                  aria-label={t("admin.delete", "Sil")}
                  title={t("admin.delete", "Aboneyi sil")}
                >
                  {t("admin.delete", "Sil")}
                </TableActionBtn>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>

      {/* Mobilde kart görünümü */}
      <CardGrid>
        {subscribers.map((sub) => (
          <SubscriberCard key={sub._id} $active={selectedId === sub._id}>
            <div>
              <CardLabel>{t("admin.email", "E-posta")}</CardLabel>
              <CardValue
                as="button"
                onClick={() => onSelect(sub._id)}
                title={t("admin.selectTooltip", "Detayları göster")}
              >
                {sub.email}
              </CardValue>
            </div>
            <div>
              <CardLabel>{t("admin.status", "Durum")}</CardLabel>
              <CardValue>
                {sub.verified ? (
                  <Verified>{t("admin.verified", "Onaylı")}</Verified>
                ) : (
                  <VerifyBtn onClick={() => onVerify(sub._id)}>
                    {t("admin.verify", "Onayla")}
                  </VerifyBtn>
                )}
              </CardValue>
            </div>
            <div>
              <CardLabel>{t("admin.date", "Tarih")}</CardLabel>
              <CardValue>
                {sub.subscribeDate
                  ? new Date(sub.subscribeDate).toLocaleDateString()
                  : "-"}
              </CardValue>
            </div>
            <CardActions>
              <TableActionBtn
                color="#156edc"
                onClick={() => onSingleSend(sub)}
                aria-label={t("admin.sendSingle", "Tekil Gönder")}
              >
                {t("admin.sendSingle", "Tekil Gönder")}
              </TableActionBtn>
              <TableActionBtn
                color="#b90d0d"
                onClick={() => onDelete(sub._id)}
                aria-label={t("admin.delete", "Sil")}
              >
                {t("admin.delete", "Sil")}
              </TableActionBtn>
            </CardActions>
          </SubscriberCard>
        ))}
      </CardGrid>
    </ResponsiveTableWrapper>
  );
}

// --- STYLED COMPONENTS ---
const ResponsiveTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  @media (max-width: 750px) {
    table {
      display: none !important;
    }
    .card-grid {
      display: flex !important;
    }
  }
  @media (min-width: 751px) {
    .card-grid {
      display: none !important;
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.cards.shadow};
  font-size: 1em;
  th, td {
    padding: 0.95em 1em;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
    background: none;
  }
  th {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    font-size: 1.01em;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr.active td {
    background: ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

const CardGrid = styled.div.attrs({ className: "card-grid" })`
  display: none;
  flex-direction: column;
  gap: 18px;
  margin-top: 1.1em;
`;

const SubscriberCard = styled.div<{ $active?: boolean }>`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border: 1.5px solid ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.borderLight};
  padding: 1.25em 1.1em 1em 1.1em;
  display: flex;
  flex-direction: column;
  gap: 0.6em 0;
  font-size: 1em;
  position: relative;
  transition: border-color 0.2s;
  &:hover,
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const CardLabel = styled.div`
  font-size: 0.98em;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 2px;
`;

const CardValue = styled.div`
  font-size: 1.1em;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: none;
  border: none;
  padding: 0;
  margin: 0 0 0.2em 0;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 1.2em;
  margin-top: 0.7em;
`;

const Verified = styled.span`
  color: #0b933c;
  font-weight: 600;
`;

const VerifyBtn = styled.button`
  font-size: 1em;
  color: #F59E42;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
`;

const TableActionBtn = styled.button<{ color?: string }>`
  color: ${({ color }) => color || "#555"};
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
  font-size: 1em;
  &:hover {
    opacity: 0.84;
    text-decoration: underline;
  }
  &:last-child {
    margin-right: 0;
  }
`;

const ListEmpty = styled.div`
  text-align: center;
  opacity: 0.8;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1.1em;
  padding: 1.2em 0 0.6em 0;
`;

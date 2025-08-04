import styled from "styled-components";
import type { INewsletter } from "@/modules/newsletter/types";

interface Props {
  subscriber: INewsletter;
  onClose: () => void;
  t: (key: string, defaultValue?: string, vars?: Record<string, any>) => string

}

export default function SubscriberModal({ subscriber, onClose, t }: Props) {
  return (
    <Overlay onClick={onClose}>
      <Box onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose} aria-label={t("admin.close", "Kapat")}>×</CloseBtn>
        <Title>{t("admin.details", "Abone Detayları")}</Title>
        <Info>
          <b>{t("admin.email", "E-posta")}:</b> {subscriber.email}
        </Info>
        <Info>
          <b>{t("admin.status", "Durum")}:</b>{" "}
          {subscriber.verified
            ? <span style={{ color: "#0b933c", fontWeight: 600 }}>{t("admin.verified", "Onaylı")}</span>
            : <span style={{ color: "#fa9416", fontWeight: 600 }}>{t("admin.unverified", "Onaysız")}</span>
          }
        </Info>
        <Info>
          <b>{t("admin.subscribedAt", "Abone Tarihi")}:</b>{" "}
          {subscriber.subscribeDate && new Date(subscriber.subscribeDate).toLocaleString()}
        </Info>
        {subscriber.unsubscribeDate && (
          <Info>
            <b>{t("admin.unsubscribedAt", "Çıkış Tarihi")}:</b>{" "}
            {new Date(subscriber.unsubscribeDate).toLocaleString()}
          </Info>
        )}
      </Box>
    </Overlay>
  );
}

// --- THEME SUPPORTED STYLES ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30,38,51,0.19);
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Box = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 13px;
  padding: 2.2em 2.4em 1.5em 2.4em;
  min-width: 340px;
  max-width: 96vw;
  position: relative;
  box-shadow: 0 6px 32px #2223;
  ${({ theme }) => theme.media.small} {
    padding: 1.2em 0.8em 1.3em 1.2em;
    min-width: 90vw;
  }
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 2em;
  background: none;
  border: none;
  color: #888;
  opacity: 0.7;
  cursor: pointer;
  &:hover { opacity: 1; }
`;
const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.32em;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;
const Info = styled.div`
  margin-bottom: 11px;
  font-size: 1em;
  b { font-weight: 500; }
`;


"use client";
import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { markContactMessageAsRead } from "@/modules/contact/slice/contactSlice";
import { IContactMessage } from "@/modules/contact/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { keyframes } from "styled-components";

interface Props {
  message: IContactMessage;
  onClose: () => void;
}

export default function ContactMessageModal({ message, onClose }: Props) {
  const { t } = useI18nNamespace("contact", translations);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (message && !message.isRead) {
      dispatch(markContactMessageAsRead(message._id));
    }
    // eslint-disable-next-line
  }, [message?._id]);

  return (
    <ModalOverlay>
      <ModalBox>
        <Header>
          <Subject>{message.subject}</Subject>
          <CloseBtn onClick={onClose}>{t("admin.close", "Kapat")}</CloseBtn>
        </Header>
        <InfoRow>
          <b>{t("admin.from", "Gönderen")}:</b>
          <span>
            {message.name} ({message.email})
          </span>
        </InfoRow>
        <InfoRow>
          <b>{t("admin.date", "Tarih")}:</b>
          <span>{new Date(message.createdAt).toLocaleString()}</span>
        </InfoRow>
        <MsgBody>
          <b>{t("admin.message", "Mesaj")}:</b>
          <MessageText>{message.message}</MessageText>
        </MsgBody>
      </ModalBox>
    </ModalOverlay>
  );
}

// --- Styled Components ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(35, 64, 91, 0.38); // ensotek secondary + opaklık
  backdrop-filter: blur(5px);
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(24px);}
  to   { opacity: 1; transform: scale(1) translateY(0);}
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 12px 42px 0 rgba(35, 64, 91, 0.17), ${({ theme }) => theme.cards.shadow};
  width: 100%;
  max-width: 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacings.xl};
  animation: ${fadeIn} 0.23s cubic-bezier(0.56,0.08,0.34,1.09);
  border: 1.5px solid ${({ theme }) => theme.colors.borderBright};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.md};
    max-width: 96vw;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacings.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderBright};
`;

const Subject = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  flex: 1;
  word-break: break-word;
`;

const CloseBtn = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 0.4em 1.2em;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-left: ${({ theme }) => theme.spacings.sm};
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.dangerBg};
    color: ${({ theme }) => theme.colors.dangerHover};
  }
`;

const InfoRow = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  display: flex;
  align-items: center;
  gap: 6px;
  b {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }
`;

const MsgBody = styled.div`
  background: ${({ theme }) => theme.colors.inputBackgroundSofter};
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 2px 14px rgba(40,117,194,0.05);
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const MessageText = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
  white-space: pre-line;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;
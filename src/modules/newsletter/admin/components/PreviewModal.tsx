import styled from "styled-components";

interface Props {
  subject: string;
  html: string;
  onClose: () => void;
  t: (key: string, defaultValue?: string, vars?: Record<string, any>) => string;
}

export default function PreviewModal({ subject, html, onClose, t }: Props) {

  return (
    <Overlay onClick={onClose}>
      <Box onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <CloseBtn onClick={onClose} aria-label={t("admin.close", "Kapat")}>×</CloseBtn>
        <Title>{t("admin.previewModalTitle", "E-Posta Önizleme")}</Title>
        <SubjectRow>
          <b>{t("admin.subject", "Konu")}:</b> <span>{subject}</span>
        </SubjectRow>
        <Divider />
        <MailContent dangerouslySetInnerHTML={{ __html: html }} />
      </Box>
    </Overlay>
  );
}

// --- THEME + I18N STYLES ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30,38,51,0.25);
  z-index: 2050;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Box = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 2em 2.5em 1.6em 2.5em;
  border-radius: 14px;
  min-width: 340px;
  max-width: 640px;
  width: 96vw;
  position: relative;
  box-shadow: 0 7px 40px #0002;
  ${({ theme }) => theme.media.small} {
    min-width: 90vw;
    max-width: 98vw;
    padding: 1em 0.7em 1em 1.1em;
  }
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 20px;
  font-size: 2em;
  background: none;
  border: none;
  color: #888;
  opacity: 0.75;
  cursor: pointer;
  &:hover { opacity: 1; }
`;
const Title = styled.h3`
  margin: 0 0 16px 0;
  color: #1581ce;
  font-size: 1.18em;
  font-weight: 700;
  letter-spacing: 0.01em;
`;
const SubjectRow = styled.div`
  font-size: 1em;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.7em;
  span {
    color: #444;
    font-weight: 500;
  }
`;
const Divider = styled.hr`
  margin: 14px 0;
  border: none;
  border-top: 1.1px solid #e4e6ef;
`;
const MailContent = styled.div`
  font-size: 1em;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.7;
  max-height: 65vh;
  overflow-y: auto;
  word-break: break-word;
  background: ${({ theme }) => theme.colors.inputBackground || "#fff"};
  padding: 0.2em 0.3em;
  border-radius: 6px;
`;


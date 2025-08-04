import { useState } from "react";
import styled from "styled-components";
import type { INewsletter } from "@/modules/newsletter/types";

interface Props {
  subscriber: INewsletter;
  onClose: () => void;
  onPreview: (subject: string, html: string) => void;
  onSend: (subject: string, html: string) => void;
  loading: boolean;
  t: (key: string, defaultValue?: string, vars?: Record<string, any>) => string;
  
}

export default function SingleSendModal({
  subscriber,
  onClose,
  onPreview,
  onSend,
  loading,
  t,
}: Props) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");

  return (
    <Overlay onClick={onClose}>
      <Box onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <CloseBtn onClick={onClose} aria-label={t("admin.close", "Kapat")}>×</CloseBtn>
        <Title>
          {t("admin.singleSendTitle", "{{email}} için E-Posta Gönder", { email: subscriber.email })}
        </Title>
        <Form
          onSubmit={e => {
            e.preventDefault();
            onSend(subject, html);
          }}
        >
          <label>
            {t("admin.subject", "Konu")}:
            <Input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              placeholder={t("admin.subjectPlaceholder", "E-posta konusu")}
            />
          </label>
          <label>
            {t("admin.htmlContent", "İçerik (HTML destekli)")}:
            <Textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              required
              rows={7}
              placeholder={t("admin.htmlPlaceholder", "E-posta içeriği (HTML destekli)...")}
            />
          </label>
          <ButtonRow>
            <Button
              type="button"
              onClick={() => onPreview(subject, html)}
              disabled={!subject || !html}
              style={{ background: "#64748b" }}
            >
              {t("admin.preview", "Önizle")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("admin.sending", "Gönderiliyor...") : t("admin.send", "Gönder")}
            </Button>
          </ButtonRow>
        </Form>
      </Box>
    </Overlay>
  );
}

// --- THEME + I18N STYLES ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30,38,51,0.28);
  z-index: 2050;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Box = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 2em 2.5em 1.6em 2.5em;
  border-radius: 14px;
  min-width: 420px;
  max-width: 96vw;
  position: relative;
  box-shadow: 0 7px 40px #0002;
  ${({ theme }) => theme.media.small} {
    min-width: 94vw;
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
  margin-top: 0;
  margin-bottom: 18px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.18em;
  font-weight: 700;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.65em 1em;
  border-radius: 7px;
  border: 1.3px solid #ddd;
  margin-top: 5px;
  margin-bottom: 4px;
  font-size: 1em;
  background: ${({ theme }) => theme.colors.inputBackground};
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.7em 1em;
  border-radius: 7px;
  border: 1.3px solid #ddd;
  font-size: 1em;
  background: ${({ theme }) => theme.colors.inputBackground};
  font-family: inherit;
  margin-top: 5px;
`;
const ButtonRow = styled.div`
  display: flex;
  gap: 0.7em;
  justify-content: flex-end;
  margin-top: 0.7em;
`;
const Button = styled.button`
  background: #0b933c;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.72em 1.5em;
  font-size: 1.06em;
  box-shadow: 0 3px 16px #008e1c18;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:enabled { background: #178f52; }
  &:disabled {
    opacity: 0.66;
    cursor: not-allowed;
  }
`;

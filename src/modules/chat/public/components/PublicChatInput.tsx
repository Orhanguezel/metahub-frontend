"use client";

import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

type Props = {
  onSend: (message: string) => void;
  /** Eğer geçmezsen i18n'den dinamik gelir */
  placeholder?: string;
  /** Eğer geçmezsen i18n'den dinamik gelir */
  sendLabel?: string;
  /** UI dili (opsiyonel). Geçmezsen i18n'den alınır. */
  lang?: string;
  disabled?: boolean;
};

export default function PublicChatInput(props: Props) {
  const { t, i18n } = useI18nNamespace("chat", translations);

  const {
    onSend,
    placeholder,
    sendLabel,
    lang,
    disabled,
  } = props;

  // i18n fallback’leri
  const effectivePlaceholder =
    placeholder ?? t("support.input_placeholder", "Sorunuzu yazın…");

  const effectiveSendLabel =
    sendLabel ?? t("support.send", "Gönder");

  const hintText = t(
    "support.hint_enter",
    "Enter ile gönder, Shift+Enter ile satır atla"
  );

  const ariaInput = t("support.input_aria", "Mesaj alanı");

  // <textarea> için lang attribute (tahmini)
  const langAttr = (lang || i18n?.language || "tr").slice(0, 2);

  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const send = useCallback(() => {
    const msg = text.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setText("");
    taRef.current?.focus();
  }, [text, disabled, onSend]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Composer>
      <Area
        ref={taRef}
        value={text}
        onChange={(e)=>setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        rows={2}
        aria-label={ariaInput}
        lang={langAttr}
        enterKeyHint="send"
      />
      <Actions>
        <Hint>{hintText}</Hint>
        <SendBtn
          onClick={send}
          disabled={disabled || !text.trim()}
          aria-label={effectiveSendLabel}
        >
          {effectiveSendLabel}
        </SendBtn>
      </Actions>
    </Composer>
  );
}

/* styled */
const Composer = styled.div`
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs};
`;

const Area = styled.textarea`
  flex:1; resize:vertical; min-height:56px;
  font-size:${({theme})=>theme.fontSizes.sm};
  line-height:${({theme})=>theme.lineHeights.normal};
  background:${({theme})=>theme.colors.inputBackground};
  color:${({theme})=>theme.colors.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.sm};
  &:focus{
    outline:none;
    border-color:${({theme})=>theme.colors.inputBorderFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight};
    background:${({theme})=>theme.colors.inputBackgroundFocus};
  }
  &::placeholder{ color:${({theme})=>theme.colors.placeholder}; }
`;

const Actions = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  gap:${({theme})=>theme.spacings.sm};
`;

const Hint = styled.span`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const SendBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:10px 14px; border-radius:${({theme})=>theme.radii.md};
  cursor:pointer;
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;

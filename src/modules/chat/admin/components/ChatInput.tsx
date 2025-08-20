"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

type Props = {
  onSend: (message: string) => void;
  placeholder?: string;
  sendLabel?: string;
  lang?: string;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
  placeholder,
  sendLabel,
  lang,
  disabled,
}: Props) {
  const { t, i18n } = useI18nNamespace("chat", translations);

  const uiLang = (lang || i18n?.language || "tr").toLowerCase();
  const isRTL = /^(ar|he|fa|ur)/.test(uiLang);

  const ph =
    placeholder ??
    t("admin.input_placeholder", "Bir mesaj yazın...");
  const btnText =
    sendLabel ?? t("admin.send", "Gönder");
  const hintText = t(
    "admin.hint_enter",
    "Enter: gönder • Shift+Enter: satır"
  );

  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const hintId = useId();

  const autoGrow = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, []);

  useEffect(() => {
    autoGrow();
  }, [text, autoGrow]);

  const send = useCallback(() => {
    const msg = text.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setText("");
    requestAnimationFrame(() => taRef.current?.focus());
  }, [text, disabled, onSend]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      aria-labelledby={hintId}
    >
      <Area
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={ph}
        disabled={disabled}
        rows={2}
        dir={isRTL ? "rtl" : "ltr"}
        aria-label={ph}
        aria-describedby={hintId}
      />

      <Right>
        <Hint id={hintId} aria-live="polite">
          {hintText}
        </Hint>
        <SendBtn type="submit" disabled={disabled || text.trim().length === 0}>
          {btnText}
        </SendBtn>
      </Right>
    </Form>
  );
}

/* ================= styled ================= */

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: end;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Area = styled.textarea`
  flex: 1;
  resize: none;
  min-height: 56px;
  max-height: 240px;
  overflow-y: auto;

  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm};

  transition: ${({ theme }) => theme.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Hint = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  user-select: none;

  ${({ theme }) => theme.media.mobile} {
    order: 2;
    text-align: center;
  }
`;

const SendBtn = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
    box-shadow: none;
  }

  ${({ theme }) => theme.media.mobile} {
    width: 100%;
  }
`;

"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import {
  adminSendManualMessage,
  adminMarkMessagesRead,
  fetchRoomMessages,
  selectCurrentRoomId,
  selectChatState,
  clearChatError,
} from "@/modules/chat/slice/chatSlice";

const ManualMessageForm = () => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("chat", translations);

  const selectedRoom = useAppSelector(selectCurrentRoomId);
  const { loading, error, successMessage } = useAppSelector(selectChatState);

  const [message, setMessage] = useState("");
  const [closeSession, setCloseSession] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !selectedRoom) return;

    try {
      await dispatch(
        adminSendManualMessage({ roomId: selectedRoom, message, close: closeSession })
      ).unwrap();

      setMessage("");
      setCloseSession(false);

      // Son mesajları tazele + okundu işaretle
      dispatch(fetchRoomMessages({ roomId: selectedRoom, page: 1, limit: 20, sort: "asc" }));
      dispatch(adminMarkMessagesRead({ roomId: selectedRoom }));
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
    }
  };

  // Başarı/hata mesajlarını kısa süre sonra temizle
  useEffect(() => {
    if (successMessage || error) {
      const tm = setTimeout(() => {
        dispatch(clearChatError());
      }, 2500);
      return () => clearTimeout(tm);
    }
  }, [successMessage, error, dispatch]);

  const labelId = "manual-message-label";
  const textareaId = "manual-message-textarea";
  const checkboxId = "closeSession";

  return (
    <Wrapper role="form" aria-labelledby={labelId}>
      <Label id={labelId}>
        {t("admin.manual_message_title", "📤 Manuel Mesaj Gönder")}
      </Label>

      <Textarea
        id={textareaId}
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("admin.input_placeholder", "Mesaj içeriği...")}
        aria-label={t("admin.input_placeholder", "Mesaj içeriği...")}
        lang={i18n.language}
      />

      <Row>
        <CheckboxWrapper htmlFor={checkboxId}>
          <input
            type="checkbox"
            id={checkboxId}
            checked={closeSession}
            onChange={(e) => setCloseSession(e.target.checked)}
          />
          <span>{t("admin.close_session", "Oturumu kapat")}</span>
        </CheckboxWrapper>

        <Button
          aria-label={t("admin.send", "Gönder")}
          disabled={!message.trim() || loading || !selectedRoom}
          onClick={handleSend}
        >
          {loading ? t("admin.sending", "Gönderiliyor...") : t("admin.send", "Gönder")}
        </Button>
      </Row>

      <Live aria-live="polite" aria-atomic="true">
        {successMessage ? t("admin.success", "Mesaj gönderildi ✅") : ""}
        {error ? String(error) : ""}
      </Live>

      {successMessage && <SuccessText>{t("admin.success", "Mesaj gönderildi ✅")}</SuccessText>}
      {error && <ErrorText>{String(error)}</ErrorText>}
    </Wrapper>
  );
};

export default ManualMessageForm;

/* 💅 Styles (classicTheme) */
const Wrapper = styled.div`
  border: ${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius: ${({theme})=>theme.radii.md};
  padding: ${({theme})=>theme.spacings.md};
  margin-top: ${({theme})=>theme.spacings.lg};
  background:${({theme})=>theme.colors.cardBackground};
  box-shadow:${({theme})=>theme.cards.shadow};
`;

const Label = styled.p`
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  margin:0 0 ${({theme})=>theme.spacings.sm} 0;
  color:${({theme})=>theme.colors.title};
`;

const Textarea = styled.textarea`
  width:100%;
  padding:${({theme})=>theme.spacings.sm};
  border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  resize:vertical;
  min-height: 84px;
  font-size:${({theme})=>theme.fontSizes.sm};
  background:${({theme})=>theme.colors.inputBackground};
  color:${({theme})=>theme.colors.text};
  &:focus{
    outline:none;
    border-color:${({theme})=>theme.colors.inputBorderFocus};
    background:${({theme})=>theme.colors.inputBackgroundFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight};
  }
`;

const Row = styled.div`
  margin-top:${({theme})=>theme.spacings.sm};
  display:flex; gap:${({theme})=>theme.spacings.md}; align-items:center; flex-wrap:wrap;
`;

const CheckboxWrapper = styled.label`
  display:flex; align-items:center; gap:${({theme})=>theme.spacings.xs};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  input{ accent-color:${({theme})=>theme.colors.primary}; }
`;

const Button = styled.button`
  padding: 10px 14px;
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  border-radius:${({theme})=>theme.radii.md};
  font-weight:${({theme})=>theme.fontWeights.medium};
  cursor:pointer;
  transition:${({theme})=>theme.transition.fast};

  &:disabled { opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
  &:hover:enabled { background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;

const SuccessText = styled.p`
  margin-top:${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.success};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  font-weight:${({theme})=>theme.fontWeights.medium};
`;

const ErrorText = styled.p`
  margin-top:${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.danger};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  font-weight:${({theme})=>theme.fontWeights.medium};
`;

const Live = styled.div`
  position:absolute;
  width:1px;height:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);
`;

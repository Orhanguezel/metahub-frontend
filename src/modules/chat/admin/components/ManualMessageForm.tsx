"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import {
  sendManualMessage,
  clearManualMessageState,
  markMessagesAsRead,
  fetchMessagesByRoom,
  selectChatRoomId,
  selectManualMessageState,
} from "@/modules/chat/slice/chatSlice";

const ManualMessageForm = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("chat", translations);

  // Slice state
  const selectedRoom = useAppSelector(selectChatRoomId);
  const manualMessage = useAppSelector(selectManualMessageState);
  const { loading, success, error } = manualMessage;

  // Local form state
  const [message, setMessage] = useState("");
  const [closeSession, setCloseSession] = useState(false);

  // Mesaj gönderimi
  const handleSend = async () => {
    if (!message.trim() || !selectedRoom) return;

    try {
      await dispatch(
        sendManualMessage({
          roomId: selectedRoom,
          message,
          // lang slice tarafında veya backendde otomatik belirleniyorsa göndermek zorunda değilsin!
          close: closeSession,
        })
      ).unwrap();

      setMessage("");
      setCloseSession(false);

      // Son mesajları tekrar yükle
      dispatch(fetchMessagesByRoom(selectedRoom));
      dispatch(markMessagesAsRead(selectedRoom));
    } catch (err) {
      console.error("Mesaj gönderilirken hata oluştu:", err);
    }
  };

  // Otomatik başarı/hata temizliği
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearManualMessageState());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  return (
    <Wrapper>
      <Label>{t("admin.manual_message_title", "📤 Manuel Mesaj Gönder")}</Label>
      <Textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("admin.input_placeholder", "Mesaj içeriği...")}
      />

      <Row>
        <CheckboxWrapper>
          <input
            type="checkbox"
            id="closeSession"
            checked={closeSession}
            onChange={(e) => setCloseSession(e.target.checked)}
          />
          <label htmlFor="closeSession">
            {t("admin.close_session", "Oturumu kapat")}
          </label>
        </CheckboxWrapper>

        <Button disabled={!message.trim() || loading} onClick={handleSend}>
          {loading
            ? t("admin.sending", "Gönderiliyor...")
            : t("admin.send", "Gönder")}
        </Button>
      </Row>

      {success && <SuccessText>{t("admin.success", "Mesaj gönderildi ✅")}</SuccessText>}
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
};

export default ManualMessageForm;

// 💅 Styles
const Wrapper = styled.div`
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 2rem;
`;

const Label = styled.p`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.6rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: none;
  font-size: 0.95rem;
`;

const Row = styled.div`
  margin-top: 0.8rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease-in-out;

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }

  &:hover:enabled {
    background-color: #005bbb;
  }
`;

const SuccessText = styled.p`
  margin-top: 0.6rem;
  color: green;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ErrorText = styled.p`
  margin-top: 0.6rem;
  color: red;
  font-size: 0.85rem;
  font-weight: 500;
`;

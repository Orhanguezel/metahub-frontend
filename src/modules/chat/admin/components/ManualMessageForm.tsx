"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";

import {
  sendManualMessage,
  clearManualMessageState,
  markMessagesAsRead,
  fetchMessagesByRoom,
} from "@/modules/chat/slice/chatSlice";

const ManualMessageForm = () => {
  const dispatch = useAppDispatch();
  // --- SADECE BURADAN!
  const { chat } = useAdminModuleState();

  const selectedRoom = chat.selectedRoom;
  const { loading, success, error } = chat.manualMessage;

  const [message, setMessage] = useState("");
  const [lang] = useState<"tr" | "en" | "de">("de");
  const [closeSession, setCloseSession] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !selectedRoom) return;

    try {
      await dispatch(
        sendManualMessage({
          roomId: selectedRoom,
          message,
          lang,
          close: closeSession,
        })
      ).unwrap();

      setMessage("");
      setCloseSession(false);

      // Son mesajları tekrar yükle (gerekirse)
      dispatch(fetchMessagesByRoom(selectedRoom));
      dispatch(markMessagesAsRead(selectedRoom));
    } catch (err) {
      // Hata otomatik merkezi state'e düşer
      // (isteğe bağlı burada toast veya log eklenebilir)
    }
  };

  // ✅ Başarı ve hata mesajını 3 saniye sonra temizle
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
      <Label>📤 Manuel Mesaj Gönder</Label>
      <Textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mesaj içeriği..."
      />

      <Row>
        <CheckboxWrapper>
          <input
            type="checkbox"
            id="closeSession"
            checked={closeSession}
            onChange={(e) => setCloseSession(e.target.checked)}
          />
          <label htmlFor="closeSession">Oturumu kapat</label>
        </CheckboxWrapper>

        <Button disabled={!message.trim() || loading} onClick={handleSend}>
          {loading ? "Gönderiliyor..." : "Gönder"}
        </Button>
      </Row>

      {success && <SuccessText>Mesaj gönderildi ✅</SuccessText>}
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
};

export default ManualMessageForm;

// 💅 Styles (değişmedi)
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

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { getSocket } from "@/lib/socket";
import type { ChatMessage } from "@/modules/chat/types";
import {
  fetchRoomMessages,
  markRoomMessagesRead,
  messageReceived,
  sendUserMessage,
} from "@/modules/chat/slice/chatSlice";
import {PublicMessageList,PublicChatInput} from "@/modules/chat";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

type Props = {
  userId: string;               // <<< zorunlu
  roomId?: string;
  lang: string;
  loading?: boolean;
  error?: string;
  messages: ChatMessage[];
  onRoomResolved?: (roomId: string) => void;
  brandTitle?: string;          // <<< dışarıdan gelirse kullan
};

const makeUserRoomId = (uid: string) => `user:${uid}`;

export default function ChatBox({
  userId,
  roomId,
  lang,
  loading,
  error,
  messages,
  onRoomResolved,
  brandTitle,
}: Props) {
  const { t } = useI18nNamespace("chat", translations);

  const dispatch = useAppDispatch();
  const [localRoom, setLocalRoom] = useState<string | undefined>(roomId || makeUserRoomId(userId));
  const [online, setOnline] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const socket = getSocket();

  // Varsayılan başlık (eğer parent vermezse)
  const resolvedBrandTitle =
    brandTitle ?? t("support.brand_title", "{{brand}} Canlı Destek", { brand: "Metahub" });

  // Dışarıdan gelen roomId değişirse senkronla; yoksa user odası
  useEffect(() => {
    const rid = roomId || makeUserRoomId(userId);
    if (rid !== localRoom) setLocalRoom(rid);
  }, [roomId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Socket lifecycle
  useEffect(() => {
    if (!socket) return;
    socket.connect();

    const onConn = () => setOnline(true);
    const onDisc = () => setOnline(false);
    socket.on("connect", onConn);
    socket.on("disconnect", onDisc);

    const onInbound = (msg: ChatMessage) => {
      if (msg.roomId !== localRoom) return;
      dispatch(messageReceived(msg));
      listRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
    };
    socket.on("chat-message", onInbound);
    socket.on("admin-message", onInbound);

    return () => {
      socket.off("connect", onConn);
      socket.off("disconnect", onDisc);
      socket.off("chat-message", onInbound);
      socket.off("admin-message", onInbound);
      socket.disconnect();
    };
  }, [dispatch, socket, localRoom]);

  // Odaya gir/çık
  useEffect(() => {
    if (!socket || !localRoom) return;
    socket.emit("join-room", { roomId: localRoom });
    dispatch(fetchRoomMessages({ roomId: localRoom, page: 1, limit: 20, sort: "asc" }));
    dispatch(markRoomMessagesRead({ roomId: localRoom }));
    return () => { socket.emit("leave-room", { roomId: localRoom }); };
  }, [socket, localRoom, dispatch]);

  // Mesaj gönder
  const handleSend = useCallback(async (text: string) => {
    const rid = localRoom || makeUserRoomId(userId);
    if (!localRoom) {
      setLocalRoom(rid);
      onRoomResolved?.(rid);
    }
    try {
      await dispatch(sendUserMessage({ roomId: rid, message: text })).unwrap();
      listRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
    } catch {/* slice hata tutuyor */}
  }, [dispatch, localRoom, userId, onRoomResolved]);

  const emptyText = useMemo(
    () => (!localRoom ? t("support.type_to_start", "Sohbete başlamak için aşağıya yazın.") : t("support.no_messages", "Henüz mesaj yok.")),
    [localRoom, t]
  );

  const shortId = localRoom ? localRoom.replace(/^user:/, "").slice(0, 8) : "";

  return (
    <Box aria-label="Canlı destek sohbet kutusu">
      <HeaderBar>
        <Left>
          <Status $on={online} aria-hidden />
          <Title>{resolvedBrandTitle}</Title>
          <Subtitle>— {t("support.tagline", "Anlık yardım hattı")}</Subtitle>
        </Left>
        {localRoom && (
          <Right title={`${t("support.session_id", "Konuşma Kimliği")}: ${localRoom}`}>
            <SessionTag>{t("support.session_tag", "Destek")} #{shortId}</SessionTag>
          </Right>
        )}
      </HeaderBar>

      <ListWrap ref={listRef}>
        <PublicMessageList messages={messages} error={error} emptyText={emptyText} />
      </ListWrap>

      <InputWrap>
        <PublicChatInput
          lang={lang}
          placeholder={t("support.input_placeholder", "Sorunuzu yazın…")}
          sendLabel={t("support.send", "Gönder")}
          disabled={!!loading}
          onSend={handleSend}
        />
        <Note>
          {t("support.notice", "Bu sohbet hizmet kalitesi için kaydedilebilir. Kişisel verileriniz KVKK kapsamında korunur.")}
        </Note>
      </InputWrap>
    </Box>
  );
}

/* styled */
const Box = styled.div`
  display:flex; flex-direction:column; gap:${({ theme }) => theme.spacings.md};
  height: 100%;
`;
const HeaderBar = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding:${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius:${({ theme }) => theme.radii.lg};
  background:${({ theme }) => theme.colors.backgroundAlt};
`;
const Left = styled.div`display:flex; align-items:center; gap:${({ theme }) => theme.spacings.sm}; min-width:0;`;
const Right = styled.div`display:flex; align-items:center; gap:${({ theme }) => theme.spacings.sm};`;
const Status = styled.span<{ $on: boolean }>`
  width:10px; height:10px; border-radius:${({ theme }) => theme.radii.circle};
  background:${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.muted)};
  box-shadow: 0 0 0 2px rgba(0,0,0,.04) inset;
`;
const Title = styled.h3`
  margin:0; font-size:${({ theme }) => theme.fontSizes.md};
  color:${({ theme }) => theme.colors.title};
`;
const Subtitle = styled.span`
  color:${({ theme }) => theme.colors.textSecondary};
  font-size:${({ theme }) => theme.fontSizes.sm};
`;
const SessionTag = styled.span`
  font-size:${({ theme }) => theme.fontSizes.xsmall};
  color:${({ theme }) => theme.colors.textSecondary};
  background:${({ theme }) => theme.colors.inputBackgroundLight};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  padding:2px 8px; border-radius:${({ theme }) => theme.radii.pill};
`;
const ListWrap = styled.div`
  flex:1 1 auto;
  max-height: 52vh;
  overflow:auto;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius:${({ theme }) => theme.radii.lg};
  background:${({ theme }) => theme.colors.cardBackground};
`;
const InputWrap = styled.div`display:flex; flex-direction:column; gap:${({ theme }) => theme.spacings.xs};`;
const Note = styled.p`
  margin:0;
  color:${({ theme }) => theme.colors.textSecondary};
  font-size:${({ theme }) => theme.fontSizes.xsmall};
  text-align:left;
`;

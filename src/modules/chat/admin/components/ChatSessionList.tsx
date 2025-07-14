"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setRoomId } from "@/modules/chat/slice/chatSlice";
import { UserDetailsModal } from "@/modules/chat";
import { Socket } from "socket.io-client";
import { ChatMessage, ChatSession } from "@/modules/chat/types";
import { selectAllChatSessionsAdmin, selectChatMessagesAdmin, selectChatRoomId } from "@/modules/chat/slice/chatSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import { SupportedLocale } from "@/types/common";

interface Props {
  socket: Socket;
  lang?: SupportedLocale;
}

const ChatSessionList: React.FC<Props> = ({ socket, lang }) => {
  const { i18n, t } = useI18nNamespace("chat", translations);
  const dispatch = useAppDispatch();

  // Eğer prop'tan gelmediyse aktif i18n'den al
  const currentLang: SupportedLocale = lang || (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  // State'ten veri çek
  const sessions = useAppSelector(selectAllChatSessionsAdmin) as ChatSession[];
  const selectedRoomId = useAppSelector(selectChatRoomId);
  const messages = useAppSelector(selectChatMessagesAdmin) as ChatMessage[];

  // Kullanıcı detayı modalı için state
  const [selectedUser, setSelectedUser] = useState<{
    roomId: string;
    user?: { _id: string; name: string; email: string };
  } | null>(null);

  // Oda seçildiğinde işlemler
  const handleSelectRoom = (roomId: string) => {
    if (!roomId || selectedRoomId === roomId) return;
    dispatch(setRoomId(roomId));
    socket.emit("join-room", roomId);
  };

  // Kullanıcı detayı modalı aç
  const handleUserDetails = (
    session: {
      roomId: string;
      user?: { _id: string; name: string; email: string };
    },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedUser(session);
  };

  // Oda için okunmamış mesaj sayısı
  const getUnreadCount = (roomId: string) => {
    return messages.filter(
      (m: ChatMessage) => m.roomId === roomId && !m.isRead && !m.isFromAdmin
    ).length;
  };

  if (!sessions?.length) return null;

  return (
    <>
      <List>
        <h4>{t("admin.active_sessions", "📂 Aktif Oturumlar")}</h4>
        {sessions.map((session: ChatSession) => {
          const isActive = selectedRoomId === session.roomId;
          const unread = getUnreadCount(session.roomId);

          return (
            <Item
              key={session.roomId}
              $active={isActive}
              onClick={() => handleSelectRoom(session.roomId)}
              aria-label={t("admin.select_session", "Oturumu seç:") + ` ${session.user?.name || t("admin.visitor", "Ziyaretçi")}`}
            >
              <div>
                <strong>{session.user?.name || t("admin.visitor", "Ziyaretçi")}</strong>
                <DetailsButton
                  type="button"
                  onClick={(e) =>
                    handleUserDetails(
                      {
                        roomId: session.roomId,
                        user: session.user,
                      },
                      e
                    )
                  }
                  aria-label={t("admin.show_user_details", "Kullanıcı detaylarını göster")}
                >
                  👁 {t("admin.detail", "Detay")}
                </DetailsButton>
                <br />
                <small>{session.user?.email || t("admin.no_email", "E-posta yok")}</small>
              </div>
              {unread > 0 && <Badge>{unread}</Badge>}
            </Item>
          );
        })}
      </List>

      {selectedUser && (
        <UserDetailsModal
          session={{
            room: selectedUser.roomId,
            user: selectedUser.user || {
              _id: "",
              name: t("admin.visitor", "Ziyaretçi"),
              email: "-",
            },
            message: "",
            lang: currentLang,
            createdAt: "",
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
};

export default ChatSessionList;

// 💅 Styles (güncel, sade ve responsive)
const List = styled.div`
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
`;

const Item = styled.div<{ $active: boolean }>`
  cursor: pointer;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px dashed #ccc;
  border-radius: 4px;
  background-color: ${({ $active }) => ($active ? "#e6f7ff" : "transparent")};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f9ff;
    color: #0070f3;
  }

  small {
    color: #888;
    font-size: 0.75rem;
  }
`;

const Badge = styled.span`
  background-color: #ff4d4f;
  color: white;
  border-radius: 12px;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: bold;
  align-self: center;
`;

const DetailsButton = styled.button`
  margin-left: 0.5rem;
  background: none;
  border: none;
  color: #0070f3;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

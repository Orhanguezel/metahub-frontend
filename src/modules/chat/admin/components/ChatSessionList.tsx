"use client";

import React, { useEffect, useState, MouseEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActiveChatSessions,
  selectActiveChatSessions,
  fetchMessagesByRoom,
  setRoom,
  selectSelectedRoom,
  selectChatMessages,
} from "@/modules/chat/slice/chatSlice";
import styled from "styled-components";
import { Socket } from "socket.io-client";
import {UserDetailsModal} from "@/modules/chat";
import { ChatMessage } from "@/modules/chat/types/chat";

// Oturum tipi (gerekirse type dosyasından import edebilirsin)
interface ChatSession {
  roomId: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Props {
  socket: Socket;
}

const ChatSessionList: React.FC<Props> = ({ socket }) => {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectActiveChatSessions) as ChatSession[];
  const selectedRoom = useAppSelector(selectSelectedRoom);
  const messages = useAppSelector(selectChatMessages) as ChatMessage[];

  const [selectedUser, setSelectedUser] = useState<{
    roomId: string;
    user?: { _id: string; name: string; email: string };
  } | null>(null);

  // 🚀 Oturumları yükle
  useEffect(() => {
    dispatch(fetchActiveChatSessions());
  }, [dispatch]);

  const handleSelectRoom = (roomId: string) => {
    if (!roomId || selectedRoom === roomId) return;

    dispatch(setRoom(roomId));
    dispatch(fetchMessagesByRoom(roomId));
    socket.emit("join-room", roomId);
  };

  const handleUserDetails = (
    session: {
      roomId: string;
      user?: { _id: string; name: string; email: string };
    },
    e: MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedUser(session);
  };

  const getUnreadCount = (roomId: string) => {
    return messages.filter(
      (m: ChatMessage) => m.room === roomId && !m.isRead && !m.isFromAdmin
    ).length;
  };

  if (!sessions.length) return null;

  return (
    <>
      <List>
        <h4>📂 Aktif Oturumlar</h4>
        {sessions.map((session: ChatSession) => {
          const isActive = selectedRoom === session.roomId;
          const unread = getUnreadCount(session.roomId);

          return (
            <Item
              key={session.roomId}
              $active={isActive}
              onClick={() => handleSelectRoom(session.roomId)}
              aria-label={`Oturumu seç: ${session.user?.name || "Ziyaretçi"}`}
            >
              <div>
                <strong>{session.user?.name || "Ziyaretçi"}</strong>
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
                  aria-label="Kullanıcı detaylarını göster"
                >
                  👁 Detay
                </DetailsButton>
                <br />
                <small>{session.user?.email || "E-posta yok"}</small>
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
              name: "Ziyaretçi",
              email: "-",
            },
            message: "", // detayda gerekirse daha sonra getirebiliriz
            lang: "de",
            createdAt: "",
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
};

export default ChatSessionList;

// 💅 Styles
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

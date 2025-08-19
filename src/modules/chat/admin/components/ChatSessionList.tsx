"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminGetActiveSessions,
  selectAdmin,
  setCurrentRoom,
  // ⬇️ oda açılınca mesaj çek + okundu işaretle
  fetchRoomMessages,
  adminMarkMessagesRead,
} from "@/modules/chat/slice/chatSlice";
import type { ChatSession } from "@/modules/chat/types";
import { Badge, Empty, Table, TableWrap, Wrap, Header, Primary, Secondary } from "./ListStyles";

type Props = {
  onSelectRoom?: (roomId: string) => void;
  selectedRoomId?: string;
};

export default function ChatSessionList({ onSelectRoom, selectedRoomId }: Props) {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectAdmin);
  const sessions = admin.activeSessions;

  useEffect(() => {
    dispatch(adminGetActiveSessions());
  }, [dispatch]);

  const open = (s: ChatSession) => {
    onSelectRoom?.(s.roomId);
    dispatch(setCurrentRoom(s.roomId));
    // 🔧 Oda açılır açılmaz mesajları getir + okundu işaretle
    dispatch(fetchRoomMessages({ roomId: s.roomId, page: 1, limit: 20, sort: "asc" }));
    dispatch(adminMarkMessagesRead({ roomId: s.roomId }));
  };

  return (
    <Wrap>
      <Header>
        <h4 style={{margin:0}}>Active Sessions</h4>
        <span>{sessions.length}</span>
      </Header>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th style={{width: 180}}>Room</th>
              <th>User</th>
              <th style={{width: 170}}>Created</th>
              <th style={{width: 120}}>Selected</th>
              <th style={{width: 120}}></th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan={5}><Empty>No active sessions.</Empty></td></tr>
            )}
            {sessions.map((s) => (
              <tr key={s._id}>
                <td className="mono">{s.roomId}</td>
                <td>{s.user ? `${s.user.name} <${s.user.email}>` : "—"}</td>
                <td>{formatDT(s.createdAt)}</td>
                <td><Badge $on={selectedRoomId === s.roomId}>{selectedRoomId === s.roomId ? "Yes" : "No"}</Badge></td>
                <td className="actions">
                  <Primary onClick={()=>open(s)}>Open</Primary>{" "}
                  <Secondary onClick={()=>navigator.clipboard?.writeText(s.roomId)}>Copy ID</Secondary>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Wrap>
  );
}

function formatDT(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(d);
  } catch { return iso; }
}

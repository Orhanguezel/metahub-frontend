"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminGetArchivedSessions, selectAdmin, setCurrentRoom } from "@/modules/chat/slice/chatSlice";
import type { ArchivedSession } from "@/modules/chat/types";
import { Empty, Table, TableWrap, Wrap, Header, Primary, Secondary } from "./ListStyles";

type Props = {
  lang?: string;
  onOpenRoom?: (roomId: string) => void;
};

export default function ArchivedSessions({ onOpenRoom }: Props) {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectAdmin);
  const archived = admin.archivedSessions;

  useEffect(() => {
    dispatch(adminGetArchivedSessions());
  }, [dispatch]);

  const open = (row: ArchivedSession) => {
    onOpenRoom?.(row.room);
    dispatch(setCurrentRoom(row.room));
  };

  return (
    <Wrap>
      <Header>
        <h4 style={{margin:0}}>Archived</h4>
        <span>{archived.length}</span>
      </Header>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th style={{width: 180}}>Room</th>
              <th>User</th>
              <th>Last Message</th>
              <th style={{width: 170}}>Closed</th>
              <th style={{width: 120}}></th>
            </tr>
          </thead>
          <tbody>
            {archived.length === 0 && (
              <tr><td colSpan={5}><Empty>No archived sessions.</Empty></td></tr>
            )}
            {archived.map((a, idx) => (
              <tr key={`${a.room}-${idx}`}>
                <td className="mono">{a.room}</td>
                <td>{a.user ? `${a.user.name} <${a.user.email}>` : "—"}</td>
                <td title={a.lastMessage}>
                  {a.lastMessage.length > 80 ? a.lastMessage.slice(0, 77)+"…" : a.lastMessage}
                </td>
                <td>{formatDT(a.closedAt)}</td>
                <td className="actions">
                  <Primary onClick={()=>open(a)}>Open</Primary>{" "}
                  <Secondary onClick={()=>navigator.clipboard?.writeText(a.room)}>Copy ID</Secondary>
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

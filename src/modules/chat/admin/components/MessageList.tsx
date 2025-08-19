"use client";

import React from "react";
import styled from "styled-components";
import type { ChatMessage } from "@/modules/chat/types";
import { Empty, ErrorBox, Table, TableWrap, Wrap, Header } from "./ListStyles";

type Props = {
  chatMessages: ChatMessage[];
  loading?: boolean;
  error?: string;
  searchTerm?: string;
  lang?: string;
  emptyText?: string;
};

export default function MessageList({
  chatMessages = [],
  loading,
  error,
  emptyText = "No messages.",
}: Props) {
  return (
    <Wrap>
      <Header>
        <h4 style={{ margin: 0 }}>Messages</h4>
        {loading ? <SmallMuted>Loading…</SmallMuted> : null}
      </Header>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {/* İç kart efekti YOK: BareTableWrap kullan */}
      <BareTableWrap>
        <Table>
          <thead>
            <tr>
              <th style={{width: 160}}>Time</th>
              <th style={{width: 180}}>Sender</th>
              <th>Message</th>
              <th style={{width: 120}}>Flags</th>
            </tr>
          </thead>
          <tbody>
            {chatMessages.length === 0 && (
              <tr><td colSpan={4}><Empty>{emptyText}</Empty></td></tr>
            )}
            {chatMessages.map((m) => {
              const dt = formatDT(m.createdAt);
              const sender = m.sender ? `${m.sender.name || ""} <${m.sender.email || ""}>` : "—";
              return (
                <tr key={m._id}>
                  <td className="mono">{dt}</td>
                  <td>{sender}</td>
                  <td>{m.message}</td>
                  <td>
                    <Flag $on={!!m.isFromAdmin}>Admin</Flag>{" "}
                    <Flag $on={!!m.isFromBot}>Bot</Flag>{" "}
                    <Flag $on={!!m.isRead}>Read</Flag>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </BareTableWrap>
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

const SmallMuted = styled.span`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const Flag = styled.span<{ $on:boolean }>`
  display:inline-block; padding:.2em .6em; border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
`;

/* kart efektsiz tablo sarmalayıcı */
const BareTableWrap = styled(TableWrap)`
  box-shadow: none;
  background: transparent;
  border-radius: 0;
  overflow: visible;
  padding: 0;
  border: none;
`;

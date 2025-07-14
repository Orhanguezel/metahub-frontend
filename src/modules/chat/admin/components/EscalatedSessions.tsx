"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectEscalatedRooms } from "@/modules/chat/slice/chatSlice";
import styled from "styled-components";
import { SupportedLocale } from "@/types/common";

// EscalatedRoom tipi merkezi bir yerde tanımlıysa oradan import et!
import type { EscalatedRoom } from "@/modules/chat/types";

interface Props {
  lang?: SupportedLocale;
  title?: string;
  emptyText?: string;
}

const EscalatedSessions: React.FC<Props> = ({
  title = "⚠️ Canlı Destek Bekleyenler",
  emptyText = "Şu anda bekleyen bir destek talebi yok."
}) => {
  // rooms dizisinin tipini EscalatedRoom[] olarak belirt
  const rooms = useAppSelector(selectEscalatedRooms) as EscalatedRoom[];

  if (!rooms?.length) {
    return (
      <Wrapper>
        <h4>{title}</h4>
        <Empty>{emptyText}</Empty>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h4>{title}</h4>
      <List>
        {rooms.map((r: EscalatedRoom) => (
          <Item key={r.room}>
            <strong>{r.user.name}</strong>{" "}
            <Email>({r.user.email})</Email> —{" "}
            <Message>{r.message}</Message>
          </Item>
        ))}
      </List>
    </Wrapper>
  );
};

export default EscalatedSessions;

// 💅 Styles
const Wrapper = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
`;

const Empty = styled.div`
  color: #666;
  font-size: 0.96rem;
  padding: 0.7rem 0;
  font-style: italic;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Item = styled.p`
  margin: 0;
  font-size: 0.95rem;
`;

const Email = styled.span`
  color: #555;
  font-size: 0.8rem;
`;

const Message = styled.span`
  font-style: italic;
  color: #333;
`;

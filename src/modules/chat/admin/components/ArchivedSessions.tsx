"use client";

import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { selectArchivedSessionsAdmin } from "@/modules/chat/slice/chatSlice";
import { SupportedLocale } from "@/types/common";
import type { ArchivedSession } from "@/modules/chat/types";

interface Props {
  lang?: SupportedLocale;
  title?: string;
  emptyText?: string;
}

const ArchivedSessions: React.FC<Props> = ({
  lang = "tr",
  title = "🗄️ Arşivlenmiş Sohbetler",
  emptyText = "Şu anda arşivlenmiş sohbet yok."
}) => {
  const archivedSessions = useAppSelector(selectArchivedSessionsAdmin) as ArchivedSession[];

  if (!archivedSessions || archivedSessions.length === 0) {
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
        {archivedSessions.map((session) => (
          <Item key={session.room}>
            <strong>{session.user?.name || "Ziyaretçi"}</strong>
            <span>
              {" "}
              ({session.user?.email || "E-posta yok"})
            </span>
            <Msg>
              — {session.lastMessage}
            </Msg>
            <Time>
              {session.closedAt &&
                new Date(session.closedAt).toLocaleString(lang, {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
            </Time>
          </Item>
        ))}
      </List>
    </Wrapper>
  );
};

export default ArchivedSessions;

// 💅 Styles
const Wrapper = styled.div`
  background: #f7f7f7;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const Item = styled.div`
  font-size: 0.98rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: #fff;
  border-radius: 5px;
  padding: 0.7rem 0.8rem;
  border: 1px solid #e4e4e4;
`;

const Msg = styled.div`
  color: #222;
  font-size: 0.95em;
  margin-left: 1.1em;
`;

const Time = styled.div`
  color: #888;
  font-size: 0.82em;
  margin-left: 1.1em;
`;

const Empty = styled.div`
  color: #999;
  font-style: italic;
  padding: 0.5rem 0 0.5rem 0.1rem;
`;


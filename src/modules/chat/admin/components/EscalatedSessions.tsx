"use client";

import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { selectEscalatedRooms } from "@/modules/chat/slice/chatSlice";
import type { SupportedLocale } from "@/types/common";
import type { EscalatedRoom } from "@/modules/chat/types";

interface Props {
  lang?: SupportedLocale;
  title?: string;
  emptyText?: string;
}

const EscalatedSessions: React.FC<Props> = ({
  title = "⚠️ Canlı Destek Bekleyenler",
  emptyText = "Şu anda bekleyen bir destek talebi yok.",
}) => {
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
        {rooms.map((r) => (
          <Item key={r.room}>
            <strong>{r.user?.name ?? "—"}</strong>{" "}
            <Email>({r.user?.email ?? "—"})</Email> —{" "}
            <Message title={r.message}>{r.message}</Message>
          </Item>
        ))}
      </List>
    </Wrapper>
  );
};

export default EscalatedSessions;

/* 💅 Styles (classicTheme) */
const Wrapper = styled.div`
  background-color: ${({theme})=>theme.colors.warningBackground};
  border: ${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.warning};
  padding: ${({theme})=>theme.spacings.md};
  margin-bottom: ${({theme})=>theme.spacings.lg};
  border-radius: ${({theme})=>theme.radii.md};
`;

const Empty = styled.div`
  color: ${({theme})=>theme.colors.textSecondary};
  font-size: ${({theme})=>theme.fontSizes.sm};
  padding: ${({theme})=>theme.spacings.sm} 0;
  font-style: italic;
`;

const List = styled.div`
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs};
`;

const Item = styled.p`
  margin:0; font-size:${({theme})=>theme.fontSizes.sm};
`;

const Email = styled.span`
  color:${({theme})=>theme.colors.textMuted};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const Message = styled.span`
  font-style: italic;
  color:${({theme})=>theme.colors.textAlt};
`;

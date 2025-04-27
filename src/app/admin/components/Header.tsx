"use client";

import styled from "styled-components";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const HeaderWrapper = styled.header`
  width: 100%;
  height: 60px;
  background: ${({ theme }) => theme.backgroundSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.border || "#eee"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  color: ${({ theme }) => theme.text};
`;

const Welcome = styled.div`
  font-size: 1rem;
  font-weight: 500;
`;

export default function Header() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <HeaderWrapper>
      <Welcome>
        👋 Hoş geldiniz, <strong>{user?.name || "Admin"}</strong>
      </Welcome>
      {/* Buraya istenirse tarih, bildirim ya da tema butonu vs. eklenebilir */}
    </HeaderWrapper>
  );
}

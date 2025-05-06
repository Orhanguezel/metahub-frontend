"use client";

import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "./components/Header";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
      <Wrapper>
        <Sidebar />
        <Content>
          <Header />
          {children}
        </Content>
      </Wrapper>
  );
}

// app/admin/layout.tsx
"use client";

import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "./components/Header";
import styled from "styled-components";
import ToastProvider from "@/providers/ToastProvider";

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.background};
`;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Wrapper>
        <Sidebar />
        <Content>
          <Header />
          {children}
        </Content>
      </Wrapper>
      <ToastProvider />
    </>
  );
}

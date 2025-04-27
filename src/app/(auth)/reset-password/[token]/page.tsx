"use client";

import { useParams } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import styled from "styled-components";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();

  return (
    <Wrapper>
      <ResetPasswordForm token={token} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 480px;
  margin: 4rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.light};
`;

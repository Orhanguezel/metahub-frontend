"use client";

import { useParams } from "next/navigation";
import {ResetPasswordForm} from "@/modules/users";
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
  margin: ${({ theme }) => theme.spacing.xl} auto;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
`;

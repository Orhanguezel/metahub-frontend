"use client";

import styled from "styled-components";
import React from "react";

// Prop türü
interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  $success?: boolean;
  $error?: boolean;
  $warning?: boolean;
  className?: string;
}

const Message = styled.div<{
  $success?: boolean;
  $error?: boolean;
  $warning?: boolean;
}>`
  margin: ${({ theme }) => theme.spacing.xs} 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  letter-spacing: 0.01em;
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $success, $error, $warning }) =>
    $success
      ? theme.colors.success + "15"
      : $error
      ? theme.colors.danger + "15"
      : $warning
      ? theme.colors.warning + "15"
      : theme.colors.backgroundAlt};
  color: ${({ theme, $success, $error, $warning }) =>
    $success
      ? theme.colors.success
      : $error
      ? theme.colors.danger
      : $warning
      ? theme.colors.warning
      : theme.colors.textSecondary};
  box-shadow: ${({ theme, $error }) =>
    $error ? theme.shadows.md : theme.shadows.sm};
  border: ${({ theme, $success, $error, $warning }) =>
    $success
      ? `${theme.borders.thin} ${theme.colors.success}`
      : $error
      ? `${theme.borders.thin} ${theme.colors.danger}`
      : $warning
      ? `${theme.borders.thin} ${theme.colors.warning}`
      : "none"};
  transition: all ${({ theme }) => theme.transition.normal};
`;


const MessageBox: React.FC<MessageProps> = ({
  children,
  $success,
  $error,
  $warning,
  className,
  ...rest
}) => {
  return (
    <Message
      $success={$success}
      $error={$error}
      $warning={$warning}
      className={className}
      {...rest}
    >
      {children}
    </Message>
  );
};

export default MessageBox;

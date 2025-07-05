"use client";
import React from "react";
import styled from "styled-components";

interface StatCardProps {
  label: string; // Parent bileşen i18n ile çevirip göndermeli!
  value: number | string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  highlight,
}) => (
  <Card $highlight={!!highlight} tabIndex={0} aria-label={label}>
    {icon && <IconWrapper>{icon}</IconWrapper>}
    <Label>{label}</Label>
    <Value $highlight={!!highlight}>{value}</Value>
  </Card>
);

export default StatCard;

// --- Styled Components ---
const Card = styled.div<{ $highlight: boolean }>`
  background: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.primary + "18" : theme.colors.background};
  border-radius: 1.2rem;
  padding: 1.5rem 1.2rem;
  text-align: center;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.07);
  border: ${({ $highlight, theme }) =>
    $highlight ? `2px solid ${theme.colors.primary}` : "none"};
  transition: background 0.22s, border 0.22s;
  outline: none;
  &:focus {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary + "33"};
  }
`;

const IconWrapper = styled.div`
  font-size: 2.1rem;
  margin-bottom: 0.6rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.3rem;
  font-weight: 500;
`;

const Value = styled.div<{ $highlight: boolean }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme, $highlight }) =>
    $highlight ? theme.colors.primary : theme.colors.textPrimary};
  letter-spacings: 0.5px;
  transition: color 0.15s;
`;

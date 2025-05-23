"use client";
import React from "react";
import styled from "styled-components";

// Tek bir istatistik kartı
interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, highlight }) => (
  <Card $highlight={!!highlight}>
    {icon && <IconWrapper>{icon}</IconWrapper>}
    <Label>{label}</Label>
    <Value>{value}</Value>
  </Card>
);

export default StatCard;

const Card = styled.div<{ $highlight: boolean }>`
  background: ${({ theme, $highlight }) =>
    $highlight
      ? theme.colors.primary + "22"
      : theme.colors.background || "#fff"};
  border-radius: 1.2rem;
  padding: 1.5rem 1.2rem;
  text-align: center;
  box-shadow: 0 3px 16px rgba(0,0,0,0.07);
  border: ${({ $highlight, theme }) =>
    $highlight ? `2px solid ${theme.colors.primary}` : "none"};
  transition: background 0.22s, border 0.22s;
`;

const IconWrapper = styled.div`
  font-size: 2.1rem;
  margin-bottom: 0.6rem;
  color: ${({ theme }) => theme.colors.primary || "#357"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary || "#888"};
  margin-bottom: 0.3rem;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary || "#357"};
`;

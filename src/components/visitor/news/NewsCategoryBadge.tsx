import React from "react";
import styled from "styled-components";

interface Props {
  category?: string;
}

export default function NewsCategoryBadge({ category }: Props) {
  if (!category) return null;

  return <Badge>📁 {category}</Badge>;
}

const Badge = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.info};
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

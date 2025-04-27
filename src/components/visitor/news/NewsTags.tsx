import React from "react";
import styled from "styled-components";

interface Props {
  tags: string[];
}

export default function NewsTags({ tags }: Props) {
  if (!tags || tags.length === 0) return null;

  return (
    <TagWrapper>
      {tags.map((tag, index) => (
        <Tag key={index}>#{tag}</Tag>
      ))}
    </TagWrapper>
  );
}

const TagWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.primary};
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
`;

"use client";
import styled from "styled-components";
import { FaInfoCircle } from "react-icons/fa";

interface Props {
  text: string;
}

export default function RegisterInfoTooltip({ text }: Props) {
  return (
    <TooltipWrap aria-label={text}>
      <FaInfoCircle size={16} />
      <span>{text}</span>
    </TooltipWrap>
  );
}


const TooltipWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.45em;
  color: ${({ theme }) => theme.colors.info || theme.colors.primary};
  background: ${({ theme }) => theme.colors.primaryTransparent};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.38em 0.75em;
  margin-bottom: 0.5em;
  min-height: 2em;
  width: 100%;
  box-sizing: border-box;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-top: 2px;
    flex-shrink: 0;
    font-size: 1.02em;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.55;
    font-size: inherit;
    font-weight: 500;
    word-break: break-word;
    flex: 1;
  }
`;


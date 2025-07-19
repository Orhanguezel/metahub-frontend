// /shared/IconCircleButton.tsx
import styled from "styled-components";

export const IconCircleButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.13em;
  transition: color 0.17s, background 0.16s, box-shadow 0.16s;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryTransparent};
    color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 1px 6px 0 ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }

  svg {
    font-size: 1.19em;
    min-width: 18px;
    min-height: 18px;
    display: block;
  }

  @media (max-width: 900px) {
    width: 26px;
    height: 26px;
    min-width: 26px;
    min-height: 26px;
    font-size: 1em;
  }
  @media (max-width: 600px) {
    width: 22px;
    height: 22px;
    min-width: 22px;
    min-height: 22px;
    font-size: 0.92em;
  }
`;

// components/SectionSnackbar.tsx
import styled from "styled-components";
import { useEffect } from "react";

export default function SectionSnackbar({ message, type, open, onClose }: {
  message: string;
  type: "success" | "error" | "info";
  open: boolean;
  onClose: () => void;
}) {
useEffect(() => {
  if (open) {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }
}, [open, onClose]);

  if (!open) return null;
  return (
    <Snackbar $type={type} onClick={onClose}>
      {message}
    </Snackbar>
  );
}
const Snackbar = styled.div<{ $type: "success" | "error" | "info" }>`
  position: fixed;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  max-width: 94vw;
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ $type, theme }) =>
    $type === "success"
      ? theme.colors.textOnSuccess
      : $type === "error"
      ? theme.colors.textOnDanger
      : theme.colors.text};
  background: ${({ $type, theme }) =>
    $type === "success"
      ? theme.colors.success
      : $type === "error"
      ? theme.colors.danger
      : theme.colors.info};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ theme }) => theme.zIndex.modal + 10};
  cursor: pointer;
  text-align: center;
  transition: background 0.2s, color 0.2s;

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    bottom: 1rem;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

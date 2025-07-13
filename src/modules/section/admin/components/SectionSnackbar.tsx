// components/SectionSnackbar.tsx
import styled from "styled-components";

export default function SectionSnackbar({ message, type, open, onClose }: {
  message: string;
  type: "success" | "error" | "info";
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Snackbar $type={type} onClick={onClose}>
      {message}
    </Snackbar>
  );
}

const Snackbar = styled.div<{ $type: "success" | "error" | "info" }>`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 500;
  color: ${({ $type, theme }) =>
    $type === "success" ? theme.colors.textOnSuccess :
    $type === "error" ? theme.colors.textOnDanger :
    theme.colors.text};
  background: ${({ $type, theme }) =>
    $type === "success" ? theme.colors.success :
    $type === "error" ? theme.colors.danger :
    theme.colors.info};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ theme }) => theme.zIndex.modal + 10};
  cursor: pointer;
`;

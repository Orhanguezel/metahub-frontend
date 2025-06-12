"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteModalProps {
  moduleName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  moduleName,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation("adminModules");
  //const lang: SupportedLocale = getCurrentLocale();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>{t("deleteTitle", "Delete Module")}</Title>
          <CloseButton onClick={onCancel} aria-label={t("close", "Close")}>
            <XCircle size={22} />
          </CloseButton>
        </Header>

        <Content>
          <WarningText>
            {t(
              "deleteWarning",
              "Are you sure you want to permanently delete this module?"
            )}
          </WarningText>
          {moduleName && <ModuleName>{moduleName}</ModuleName>}
        </Content>

        <ButtonGroup>
          <CancelButton type="button" onClick={onCancel}>
            {t("cancel", "Cancel")}
          </CancelButton>
          <ConfirmButton type="button" onClick={onConfirm}>
            {t("confirmDelete", "Delete Permanently")}
          </ConfirmButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default ConfirmDeleteModal;

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 420px;
  width: 95%;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  transition: color ${({ theme }) => theme.transition.fast};
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const Content = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const WarningText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ModuleName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
`;

const ButtonGroup = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CancelButton = styled.button`
  background: ${({ theme }) => theme.colors.muted};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ConfirmButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.whiteColor};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};

  &:hover {
    opacity: 0.9;
  }
`;

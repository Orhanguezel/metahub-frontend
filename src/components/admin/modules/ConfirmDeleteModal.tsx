"use client";

import React from "react";
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
  const { t } = useTranslation();

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>{t("admin.modules.deleteTitle", "Modülü Sil")}</Title>
          <CloseButton onClick={onCancel} title={t("close", "Kapat")}>
            <XCircle size={22} />
          </CloseButton>
        </Header>

        <Content>
          <WarningText>
            {t(
              "admin.modules.deleteWarning",
              "Bu modülü kalıcı olarak silmek istediğinize emin misiniz?"
            )}
          </WarningText>
          <ModuleName>{moduleName}</ModuleName>
        </Content>

        <ButtonGroup>
          <CancelButton onClick={onCancel}>
            {t("cancel", "İptal")}
          </CancelButton>
          <ConfirmButton onClick={onConfirm}>
            {t("delete", "Kalıcı Sil")}
          </ConfirmButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default ConfirmDeleteModal;

//
// ✅ Styled Components
//

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  border-radius: 12px;
  width: 95%;
  max-width: 420px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.3rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const Content = styled.div`
  margin-top: 1.5rem;
`;

const WarningText = styled.p`
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

const ModuleName = styled.div`
  font-weight: bold;
  font-size: 1.3rem;
  text-align: center;
  color: ${({ theme }) => theme.primary};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  background: ${({ theme }) => theme.gray};
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    opacity: 0.9;
  }
`;

const ConfirmButton = styled.button`
  background: ${({ theme }) => theme.danger};
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    opacity: 0.9;
  }
`;

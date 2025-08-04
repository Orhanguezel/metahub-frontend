"use client";
import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/offer";

interface Props {
  offerId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const OfferDeleteConfirmModal: React.FC<Props> = ({
  offerId,
  onCancel,
  onConfirm,
  loading,
}) => {
  const { t } = useI18nNamespace("offer", translations);

  if (!offerId) return null;

  return (
    <Overlay>
      <Modal>
        <Title>{t("admin.deleteTitle", "Delete Offer?")}</Title>
        <Content>
          {t(
            "admin.deleteConfirmMsg",
            "Are you sure you want to delete this offer? This action cannot be undone."
          )}
        </Content>
        <ButtonBar>
          <CancelBtn onClick={onCancel} disabled={loading}>
            {t("cancel", "Cancel")}
          </CancelBtn>
          <DeleteBtn onClick={onConfirm} disabled={loading}>
            {loading ? t("deleting", "Deleting...") : t("delete", "Delete")}
          </DeleteBtn>
        </ButtonBar>
      </Modal>
    </Overlay>
  );
};

export default OfferDeleteConfirmModal;

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  z-index: 1200;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(28, 36, 51, 0.21);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.card || "#fff"};
  min-width: 330px;
  max-width: 96vw;
  border-radius: 14px;
  box-shadow: 0 6px 34px rgba(22, 32, 60, 0.18);
  padding: 32px 26px 22px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadein 0.15s;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.danger || "#de3d3d"};
  font-weight: 700;
  font-size: 1.17em;
`;

const Content = styled.div`
  color: ${({ theme }) => theme.colors.text || "#232b36"};
  margin-bottom: 22px;
  font-size: 1.03em;
  text-align: center;
`;

const ButtonBar = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 10px;
`;

const CancelBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.backgroundSecondary || "#f3f7fa"};
  color: ${({ theme }) => theme.colors.text || "#233"};
  font-weight: 500;
  font-size: 1em;
  padding: 0.57em 1.25em;
  border-radius: 11px;
  cursor: pointer;
  transition: background 0.14s;
  &:hover {
    background: #e0e2e6;
  }
`;

const DeleteBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.danger || "#d32f2f"};
  color: #fff;
  font-weight: 600;
  font-size: 1em;
  padding: 0.57em 1.25em;
  border-radius: 11px;
  cursor: pointer;
  transition: background 0.14s;
  &:hover {
    background: #b71c1c;
  }
`;

export {};

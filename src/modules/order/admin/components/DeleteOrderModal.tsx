"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteOrderAdmin } from "@/modules/order/slice/ordersSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";

interface DeleteOrderModalProps {
  id: string;
  onClose: () => void;
}

const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({ id, onClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("order", translations);
  const { loading } = useAppSelector((state) => state.orders);
  const [submitted, setSubmitted] = useState(false);

  const handleDelete = async () => {
    setSubmitted(true);
    await dispatch(deleteOrderAdmin(id));
    onClose();
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <Title>{t("admin.deleteTitle", "Delete Order")}</Title>
        <Text>{t("admin.deleteConfirm", "Are you sure you want to delete this order?")}</Text>
        <ButtonRow>
          <Secondary onClick={onClose} type="button">
            {t("cancel", "Cancel")}
          </Secondary>
          <Danger
            onClick={handleDelete}
            disabled={loading || submitted}
            type="button"
          >
            {loading || submitted ? t("deleting", "Deleting...") : t("delete", "Delete")}
          </Danger>
        </ButtonRow>
      </Modal>
    </Backdrop>
  );
};

export default DeleteOrderModal;

/* styled (modal patern) */
const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 1001;
  background: rgba(24, 24, 38, 0.15);
  display: flex; align-items: center; justify-content: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  min-width: 320px; max-width: 96vw;
  padding: ${({ theme }) => theme.spacings.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Title = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacings.sm} 0;
  color: ${({ theme }) => theme.colors.title};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Text = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonRow = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end;`;

const BaseBtn = styled.button`
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  border:${({theme})=>theme.borders.thin} transparent; font-weight:${({theme})=>theme.fontWeights.medium};
`;

const Secondary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;

const Danger = styled(BaseBtn)`
  background:${({ theme }) => theme.colors.dangerBg};
  color:${({ theme }) => theme.colors.danger};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.danger};
  &:hover:enabled{
    background:${({ theme }) => theme.colors.dangerHover};
    color:${({ theme }) => theme.colors.textOnDanger};
  }
  &:disabled{ opacity:.6; cursor: wait; }
`;

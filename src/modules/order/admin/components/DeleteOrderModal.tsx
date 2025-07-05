"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteOrder } from "@/modules/order/slice/ordersSlice";
import { useTranslation } from "react-i18next";

interface DeleteOrderModalProps {
  id: string;
  onClose: () => void;
}

const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({ id, onClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("order");
  const { loading } = useAppSelector((state) => state.orders);
  const [submitted, setSubmitted] = useState(false);

  const handleDelete = async () => {
    setSubmitted(true);
    await dispatch(deleteOrder(id));
    onClose();
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <Title>{t("admin.deleteTitle", "Delete Order")}</Title>
        <Text>
          {t(
            "admin.deleteConfirm",
            "Are you sure you want to delete this order?"
          )}
        </Text>
        <ButtonRow>
          <CancelBtn onClick={onClose} type="button">
            {t("cancel", "Cancel")}
          </CancelBtn>
          <DeleteBtn
            onClick={handleDelete}
            disabled={loading || submitted}
            type="button"
          >
            {loading || submitted
              ? t("deleting", "Deleting...")
              : t("delete", "Delete")}
          </DeleteBtn>
        </ButtonRow>
      </Modal>
    </Backdrop>
  );
};

export default DeleteOrderModal;

// --- Styled Components ---
const Backdrop = styled.div`
  position: fixed;
  z-index: 1001;
  inset: 0;
  background: rgba(24, 24, 38, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background || "#fff"};
  border-radius: 18px;
  min-width: 320px;
  max-width: 98vw;
  width: 100%;
  box-shadow: 0 8px 38px #1b1c2b22;
  padding: 2.3rem 2rem 2rem 2rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  @media (max-width: 540px) {
    padding: 1.6rem 0.7rem 1.2rem 0.7rem;
    min-width: 0;
  }
`;

const Title = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.danger || "#c60f0f"};
  letter-spacing: 0.01em;
  margin-bottom: 1.1rem;
`;

const Text = styled.div`
  font-size: 1.09rem;
  color: ${({ theme }) => theme.colors.text || "#333"};
  margin-bottom: 2rem;
  text-align: left;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1em;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const CancelBtn = styled.button`
  background: ${({ theme }) => theme.colors.lightGrey || "#e3e3e3"};
  color: ${({ theme }) => theme.colors.text || "#444"};
  border: none;
  padding: 0.59em 2em;
  border-radius: 13px;
  font-size: 1.03rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.14s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.grey || "#dadada"};
  }
`;

const DeleteBtn = styled(CancelBtn)`
  background: ${({ theme }) => theme.colors.danger || "#df3d3d"};
  color: #fff;
  font-weight: 600;
  &:hover:enabled,
  &:focus:enabled {
    background: #b71c1c;
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

"use client";

import styled from "styled-components";
import { useState } from "react";
import { Order } from "@/store/ordersSlice";

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: white;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 1.5rem;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button<{ color?: string }>`
  padding: 8px 16px;
  border-radius: 6px;
  background: ${({ color }) => color || "#3498db"};
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;

  &:hover {
    opacity: 0.9;
  }
`;

interface Props {
  order: Order;
  onClose: () => void;
  onConfirm: (id: string, status: string) => void;
}

export default function OrderStatusModal({ order, onClose, onConfirm }: Props) {
  const [status, setStatus] = useState(order.status || "");

  const handleSubmit = () => {
    if (status && status !== order.status) {
      onConfirm(order._id!, status);
      onClose();
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <h3>📦 Sipariş Durumu Güncelle</h3>
        <Label>Yeni Durum</Label>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">-- Seçiniz --</option>
          <option value="pending">Bekliyor</option>
          <option value="preparing">Hazırlanıyor</option>
          <option value="shipped">Kargolandı</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal Edildi</option>
        </Select>

        <ButtonGroup>
          <Button onClick={handleSubmit}>Güncelle</Button>
          <Button color="#e74c3c" onClick={onClose}>İptal</Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

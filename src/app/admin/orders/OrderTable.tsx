"use client";

import styled from "styled-components";
import { Order } from "@/store/ordersSlice";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.backgroundSecondary || "#fff"};
`;

const Th = styled.th`
  background: ${({ theme }) => theme.backgroundAlt || "#f0f0f0"};
  padding: 12px;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border || "#ddd"};
  vertical-align: middle;
`;

const Button = styled.button<{ color?: string }>`
  padding: 6px 12px;
  margin-right: 6px;
  background: ${({ color }) => color || "#3498db"};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`;

interface Props {
  orders: Order[];
  loading: boolean;
  onDeliver: (id: string) => void;
  onOpenStatusModal: (order: Order) => void;
}



export default function OrderTable({
  orders,
  loading,
  onDeliver,
  onOpenStatusModal,
}: Props) {
  if (loading) return <p>Yükleniyor...</p>;

  return (
    <Table>
      <thead>
        <tr>
          <Th>Sipariş No</Th>
          <Th>Kullanıcı</Th>
          <Th>Toplam (€)</Th>
          <Th>Durum</Th>
          <Th>Teslimat</Th>
          <Th>İşlemler</Th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const user =
            typeof order.user === "object" && order.user !== null
              ? order.user
              : null;

          return (
            <tr key={order._id}>
              <Td>{order._id?.substring(0, 8)}...</Td>
              <Td>
                {user?.name ?? "-"}
                <br />
                <small style={{ fontSize: "0.8rem", color: "#888" }}>
                  {user?.email ?? "-"}
                </small>
              </Td>
              <Td>€ {order.totalPrice.toFixed(2)}</Td>
              <Td>
                {(() => {
                  switch (order.status) {
                    case "pending":
                      return "⏳ Bekliyor";
                    case "preparing":
                      return "🍵 Hazırlanıyor";
                    case "shipped":
                      return "📦 Kargoda";
                    case "completed":
                      return "✅ Tamamlandı";
                    case "cancelled":
                      return "❌ İptal Edildi";
                    default:
                      return "–"; 
                  }
                })()}
              </Td>

              <Td>{order.isDelivered ? "✅ Teslim Edildi" : "❌ Bekliyor"}</Td>
              <Td>
                {!order.isDelivered && (
                  <Button color="#2ecc71" onClick={() => onDeliver(order._id!)}>
                    Teslim Et
                  </Button>
                )}
                <Button
                  color="#f39c12"
                  onClick={() => onOpenStatusModal(order)}
                >
                  Durum
                </Button>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

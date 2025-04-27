"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  getAllOrders,
  markOrderAsDelivered,
  updateOrderStatus,
  Order,
} from "@/store/ordersSlice";
import styled from "styled-components";
import OrderTable from "./OrderTable";
import OrderStatusModal from "./OrderStatusModal";
import { toast } from "react-toastify";

const PageWrapper = styled.div`padding: 2rem;`;
const Title = styled.h2`font-size: 1.6rem; font-weight: bold; margin-bottom: 1.5rem;`;

export default function AdminOrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const refresh = () => dispatch(getAllOrders());

  const handleMarkDelivered = async (id: string) => {
    try {
      await dispatch(markOrderAsDelivered(id)).unwrap();
      toast.success("Teslim edildi olarak işaretlendi");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Hata oluştu");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await dispatch(updateOrderStatus({ id, data: { status: newStatus } })).unwrap();
      toast.success("Durum güncellendi");
      refresh();
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.message || "Güncelleme başarısız");
    }
  };

  return (
    <PageWrapper>
      <Title>📦 Siparişler</Title>
      <OrderTable
        orders={orders}
        loading={loading}
        onDeliver={handleMarkDelivered}
        onOpenStatusModal={(order) => setSelectedOrder(order)}
      />

      {selectedOrder && (
        <OrderStatusModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirm={handleStatusUpdate}
        />
      )}
    </PageWrapper>
  );
}

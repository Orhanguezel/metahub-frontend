"use client";
import React from "react";
import { useAppSelector } from "@/store/hooks";
import { OrderDetail } from "@/modules/order";

export default function OrderDetailPage() {
  const order = useAppSelector((state) => state.orders.order);
  if (!order) return null; // veya basit bir mesaj
  return <OrderDetail order={order} />;
}

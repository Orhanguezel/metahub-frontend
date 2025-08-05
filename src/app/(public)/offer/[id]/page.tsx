"use client";
import React from "react";
import { useAppSelector } from "@/store/hooks";
import { OrderDetail } from "@/modules/order";

export default function OrderDetailPage() {
  const order = useAppSelector((state) => state.orders.selected); // DÜZELTİLDİ
  if (!order) return null; // veya user-friendly bir mesaj
  return <OrderDetail order={order} />;
}

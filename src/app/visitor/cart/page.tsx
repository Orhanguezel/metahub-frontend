"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from "@/store/cartSlice";
import { useState } from "react";
import axios from "@/lib/api";
import styled from "styled-components";

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
`;

const Table = styled.table`
  width: 100%;
  margin-bottom: 2rem;
  border-collapse: collapse;

  th, td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  input {
    width: 60px;
    padding: 4px;
  }
`;

const Input = styled.input`
  padding: 8px;
  margin-bottom: 1rem;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const QtyButton = styled.button`
  background: #3498db;
  color: #fff;
  border: none;
  padding: 5px 10px;
  margin: 0 5px;
  border-radius: 4px;
  cursor: pointer;
`;

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>(); // Tip düzeltildi
  const { cart } = useSelector((state: RootState) => state.cart);
  const items = cart?.items || [];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const total = items.reduce(
    (acc, i) => acc + i.priceAtAddition * (i.quantity || 1),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/orders", {
        items: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity || 1,
        })),
        shippingAddress: form,
        totalPrice: total,
      });
      alert("✅ Sipariş başarıyla oluşturuldu!");
      await dispatch(clearCart()); // await ile çağırmak gerekebilir
    } catch (err) {
      alert("❌ Sipariş gönderilemedi.");
    }
  };

  return (
    <Container>
      <h1>🛒 Sepetiniz</h1>
      {items.length === 0 ? (
        <p>Sepet boş.</p>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Fiyat</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.product._id}>
                  <td>{i.product.name}</td>
                  <td>
                    <QtyButton onClick={() => dispatch(decreaseQuantity(i.product._id))}>-</QtyButton>
                    {i.quantity}
                    <QtyButton onClick={() => dispatch(increaseQuantity(i.product._id))}>+</QtyButton>
                  </td>
                  <td>{(i.priceAtAddition * (i.quantity || 1)).toFixed(2)} €</td>
                  <td>
                    <button onClick={() => dispatch(removeFromCart(i.product._id))}>
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h3>Toplam: {total.toFixed(2)} €</h3>

          <form onSubmit={handleSubmit}>
            {Object.entries(form).map(([key, value]) => (
              <Input
                key={key}
                name={key}
                placeholder={key}
                required
                value={value}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            ))}
            <Button type="submit">🚚 Siparişi Gönder (Kapıda Ödeme)</Button>
          </form>
        </>
      )}
    </Container>
  );
}

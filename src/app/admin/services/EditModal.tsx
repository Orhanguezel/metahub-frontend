"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateService } from "@/store/servicesSlice";
import { IService } from "@/store/servicesSlice";
import { IoClose } from "react-icons/io5";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input, textarea, select {
    padding: 0.6rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  textarea {
    resize: vertical;
    min-height: 60px;
  }

  button {
    background-color: ${({ theme }) => theme.primary};
    color: #fff;
    border: none;
    padding: 0.6rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }
`;

interface EditModalProps {
  service: IService;
  onClose: () => void;
}

export default function EditModal({ service, onClose }: EditModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({
    title: service.title,
    shortDescription: service.shortDescription || "",
    detailedDescription: service.detailedDescription || "",
    price: service.price.toString(),
    durationMinutes: service.durationMinutes.toString(),
    isActive: service.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("shortDescription", form.shortDescription);
    formData.append("detailedDescription", form.detailedDescription);
    formData.append("price", form.price);
    formData.append("durationMinutes", form.durationMinutes);
    formData.append("isActive", form.isActive.toString());

    dispatch(updateService({ id: service._id!, formData }));
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}><IoClose /></CloseBtn>
        <h3>Hizmeti Düzenle</h3>
        <Form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Kısa Açıklama"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          />
          <textarea
            placeholder="Detaylı Açıklama"
            value={form.detailedDescription}
            onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
          />
          <input
            type="number"
            placeholder="Fiyat"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Süre (dk)"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            required
          />
          <select
            value={form.isActive ? "true" : "false"}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
          >
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
          <button type="submit">Güncelle</button>
        </Form>
      </Modal>
    </Overlay>
  );
}

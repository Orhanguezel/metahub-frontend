"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { createService, clearServiceMessages } from "@/store/servicesSlice";

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  input,
  textarea,
  button {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 1rem;
    width: 100%;
  }

  button {
    background-color: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Success = styled.div`
  color: green;
  font-size: 0.9rem;
`;

const Error = styled.div`
  color: red;
  font-size: 0.9rem;
`;

export default function ServiceForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((state: RootState) => state.services);

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    detailedDescription: "",
    price: "",
    durationMinutes: "",
  });

  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("shortDescription", form.shortDescription);
    formData.append("detailedDescription", form.detailedDescription);
    formData.append("price", form.price);
    formData.append("durationMinutes", form.durationMinutes);
    images.forEach((img) => formData.append("images", img));

    dispatch(createService(formData));
    setForm({
      title: "",
      shortDescription: "",
      detailedDescription: "",
      price: "",
      durationMinutes: "",
    });
    setImages([]);
  };

  useEffect(() => {
    return () => {
      dispatch(clearServiceMessages());
    };
  }, [dispatch]);

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <Label>Başlık</Label>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />

      <Label>Kısa Açıklama</Label>
      <input
        type="text"
        value={form.shortDescription}
        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
        required
      />

      <Label>Detaylı Açıklama</Label>
      <textarea
        rows={4}
        value={form.detailedDescription}
        onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
        required
      />

      <Label>Fiyat (€)</Label>
      <input
        type="number"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />

      <Label>Süre (dakika)</Label>
      <input
        type="number"
        value={form.durationMinutes}
        onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
        required
      />

      <Label>Görseller</Label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) {
            setImages(Array.from(e.target.files));
          }
        }}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Hizmeti Ekle"}
      </button>

      {successMessage && <Success>{successMessage}</Success>}
      {error && <Error>{error}</Error>}
    </FormWrapper>
  );
}

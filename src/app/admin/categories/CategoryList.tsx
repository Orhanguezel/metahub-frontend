"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/api";
import styled from "styled-components";
import { toast } from "react-toastify";

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CategoryItem = styled.div`
  padding: 0.8rem 1rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border || "#ccc"};
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border || "#ccc"};
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.inputBackground || "#fff"};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button<{ danger?: boolean }>`
  background: ${({ danger, theme }) => (danger ? "#e74c3c" : theme.primary)};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(
        "/categories",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Kategori eklendi");
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("❌ Kategori eklenemedi");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await axios.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Kategori silindi");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("❌ Silme işlemi başarısız");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Container>
      <Title>📁 Kategori Yönetimi</Title>

      <Input
        placeholder="Yeni kategori adı"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
      <Button onClick={addCategory}>➕ Ekle</Button>

      <hr style={{ margin: "2rem 0" }} />

      {categories.map((cat: any) => (
        <CategoryItem key={cat._id}>
          {cat.name}
          <div>
            <Button danger onClick={() => deleteCategory(cat._id)}>
              Sil
            </Button>
          </div>
        </CategoryItem>
      ))}
    </Container>
  );
}

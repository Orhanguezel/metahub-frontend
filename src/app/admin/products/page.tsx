"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchProducts, deleteProduct } from "@/store/productsSlice";
import { fetchCategories } from "@/store/categorySlice";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import ProductFilters from "@/components/admin/products/ProductFilters";
import ProductCardList from "@/components/admin/products/ProductCardList";
import ProductFormModal from "@/components/admin/products/ProductFormModal";
import CategoryFormModal from "@/components/admin/categories/CategoryFormModal";

import { IProduct } from "@/types/product";

export default function AdminProductPage() {
  const { t } = useTranslation("admin");
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "all" ||
          (typeof p.category === "object" && p.category?._id === category))
    );
  }, [products, search, category]);

  const handleDelete = (id: string) => {
    if (!confirm(t("products.confirmDelete"))) return;

    dispatch(deleteProduct(id))
      .unwrap()
      .then(() => {
        toast.success(t("products.deleted"));
        refresh();
      })
      .catch(() => toast.error(t("errors.deleteFailed")));
  };

  return (
    <Wrapper>
      <TopBar>
        <ProductFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
        />

        <AddButton onClick={() => setShowCategoryModal(true)}>
          📂 {t("products.newCategory")}
        </AddButton>

        <AddButton
          onClick={() => {
            setSelectedProduct(null);
            setShowModal(true);
          }}
        >
          ➕ {t("products.new")}
        </AddButton>
      </TopBar>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <ProductCardList
          products={filtered}
          onEdit={(product) => {
            setSelectedProduct(product);
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <ProductFormModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            refresh();
          }}
        />
      )}

{showCategoryModal && (
  <CategoryFormModal
    onClose={() => setShowCategoryModal(false)}
    onSuccess={() => {
      dispatch(fetchCategories()); // Kategori güncelle
      setShowCategoryModal(false);
      toast.success("Kategori başarıyla eklendi");
    }}
  />
)}

    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 2rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.buttonText};
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

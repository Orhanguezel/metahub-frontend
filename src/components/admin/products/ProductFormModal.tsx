"use client";

import React, { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { createProduct, updateProduct } from "@/store/productsSlice";
import { IProduct } from "@/types/product";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ProductImagesUploader from "./ProductImagesUploader";
import { fetchCategories } from "@/store/categorySlice";

interface Props {
  product?: IProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({
  product,
  onClose,
  onSuccess,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { t } = useTranslation("admin");

  const { categories } = useSelector((state: RootState) => state.category);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [stockThreshold, setStockThreshold] = useState<number>(0);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [language, setLanguage] = useState<"tr" | "en" | "de">("en");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setStock(product.stock || 0);
      setStockThreshold(product.stockThreshold || 0);
      setCategory(
        typeof product.category === "string"
          ? product.category
          : product.category?._id || ""
      );
      setDescription(product.description || "");
      setTags(product.tags || []);
      setLanguage((product.language as "de" | "en" | "tr") || "en");
    }
  }, [product]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(t("errors.nameRequired") || "Name is required");
      return;
    }

    if (!category) {
      toast.error(t("errors.categoryRequired") || "Category is required");
      return;
    }

    if (price <= 0 || stock < 0 || stockThreshold < 0) {
      toast.error(
        t("errors.invalidNumbers") || "Price and stock must be valid"
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price.toString());
    formData.append("stock", stock.toString());
    formData.append("stockThreshold", stockThreshold.toString());
    formData.append("category", category);
    formData.append("description", description);
    formData.append("language", language || "en");
    tags.forEach((tag) => formData.append("tags[]", tag));
    if (image) formData.append("image", image);

    const action = product
      ? updateProduct({ id: product._id, formData })
      : createProduct(formData);

    dispatch(action as any)
      .unwrap()
      .then(() => {
        toast.success(product ? t("products.updated") : t("products.created"));
        onSuccess();
      })
      .catch((err: any) => {
        const message = err?.message || t("errors.unknown");
        toast.error(message);
      });
  };

  return (
    <Overlay>
      <Modal>
        <h3>
          {product ? `📝 ${t("products.edit")}` : `➕ ${t("products.new")}`}
        </h3>

        <Label>{t("products.name")}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />

        <Label>{t("products.price")} (€)</Label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        <Label>{t("products.stock")}</Label>
        <Input
          type="number"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />

        <Label>{t("products.stockThreshold")}</Label>
        <Input
          type="number"
          value={stockThreshold}
          onChange={(e) => setStockThreshold(Number(e.target.value))}
        />

        <Label>{t("products.category")}</Label>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">
            {t("products.selectCategory") || "Select a category"}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <Label>{t("products.description")}</Label>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Label>{t("products.tags")}</Label>
        <Input
          value={tags.join(", ")}
          onChange={(e) =>
            setTags(e.target.value.split(",").map((t) => t.trim()))
          }
          placeholder="z.B. natur, vegan, bio"
        />

        <Label>{t("products.language")}</Label>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "tr" | "en" | "de")}
        >
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
          <option value="de">Deutsch</option>
        </Select>

        <ProductImagesUploader
          onImageSelect={setImage}
          initialUrl={product?.image}
        />

        <ButtonGroup>
          <Button onClick={handleSubmit}>
            {product ? t("common.save") : t("common.create")}
          </Button>
          <Button color={theme.danger} onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
  max-width: 600px;
  margin: 8vh auto;
  border-radius: 12px;
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin: 1rem 0 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ color?: string }>`
  padding: 10px 18px;
  background: ${({ color, theme }) => color || theme.success};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;

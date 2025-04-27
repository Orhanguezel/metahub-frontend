"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchCategories } from "@/store/categorySlice";

interface ProductFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
}

export default function ProductFilters({
  search,
  setSearch,
  category,
  setCategory,
}: ProductFiltersProps) {
  const { t } = useTranslation("admin");
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <FilterContainer>
      <Input
        type="text"
        placeholder={t("products.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">{t("products.allCategories")}</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </Select>
    </FilterContainer>
  );
}

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  flex: 1;
  min-width: 200px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  min-width: 180px;
`;

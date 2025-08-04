"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/offer";
import { useAppDispatch } from "@/store/hooks";
import { fetchAdminOffers } from "@/modules/offer/slice/offerSlice";
import { Offer } from "@/modules/offer/types";

interface Props {
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onCreateNew?: () => void;
  statusFilter?: Offer["status"];
  onStatusFilterChange?: (status: Offer["status"] | "") => void;
}

const STATUS_OPTIONS: { value: Offer["status"] | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "draft", label: "Taslak" },
  { value: "preparing", label: "Hazırlanıyor" },
  { value: "sent", label: "Gönderildi" },
  { value: "pending", label: "Cevap Bekliyor" },
  { value: "approved", label: "Onaylandı" },
  { value: "rejected", label: "Reddedildi" },
];

const OfferToolbar: React.FC<Props> = ({
  onRefresh,
  onSearch,
  onCreateNew,
  statusFilter,
  onStatusFilterChange,
}) => {
  const { t } = useI18nNamespace("offer", translations);
  const [search, setSearch] = useState("");

  const dispatch = useAppDispatch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(search.trim());
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else dispatch(fetchAdminOffers());
  };

  return (
    <Bar>
      <FilterRow>
        <form onSubmit={handleSearch}>
          <SearchInput
            placeholder={t("admin.searchPlaceholder", "Search offer # or customer")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus={false}
          />
          <SearchBtn type="submit">{t("search", "Search")}</SearchBtn>
        </form>

        <Select
          value={statusFilter ?? ""}
          onChange={e => onStatusFilterChange?.(e.target.value as Offer["status"])}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {t(`status.${opt.value}` as any, opt.label)}
            </option>
          ))}
        </Select>
      </FilterRow>
      <ActionRow>
        {onCreateNew && (
          <NewBtn type="button" onClick={onCreateNew}>
            {t("admin.createNew", "New Offer")}
          </NewBtn>
        )}
        <RefreshBtn type="button" onClick={handleRefresh}>
          {t("refresh", "Refresh")}
        </RefreshBtn>
      </ActionRow>
    </Bar>
  );
};

export default OfferToolbar;

// --- Styled ---
const Bar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.3em;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1em;
  align-items: flex-end;
  flex-wrap: wrap;
  > form {
    display: flex;
    gap: 0.4em;
  }
`;

const SearchInput = styled.input`
  font-size: 1em;
  padding: 0.56em 0.82em;
  border-radius: 8px;
  border: 1.2px solid #e6e6ea;
  background:  "#f5f7fa"};
  color: ${({ theme }) => theme.colors.text || "#182037"};
  outline: none;
  width: 190px;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary || "#1a71ec"};
    background: #f9fcff;
  }
`;

const SearchBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary || "#2b7bfa"};
  color: #fff;
  font-weight: 500;
  font-size: 1em;
  padding: 0.53em 1.13em;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.13s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || "#215eb7"};
  }
`;

const Select = styled.select`
  font-size: 1em;
  padding: 0.48em 0.9em;
  border-radius: 8px;
  border: 1.1px solid #e6e6ea;
  color: ${({ theme }) => theme.colors.text || "#1c2237"};
  background: "#f5f7fa";
  outline: none;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.7em;
`;

const RefreshBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.secondary || "#e8ecf3"};
  color: ${({ theme }) => theme.colors.text || "#19364a"};
  font-weight: 500;
  font-size: 1em;
  padding: 0.49em 1.16em;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.primary || "#d1e3ff"};
  }
`;

const NewBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary || "#2b7bfa"};
  color: #fff;
  font-weight: 500;
  font-size: 1em;
  padding: 0.49em 1.28em;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || "#215eb7"};
  }
`;

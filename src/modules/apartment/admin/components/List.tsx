"use client";

import styled from "styled-components";
import { IApartment, ApartmentCategory } from "@/modules/apartment";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { Skeleton } from "@/shared";
import { SupportedLocale } from "@/types/common";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";

interface Props {
  apartment: IApartment[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: IApartment) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ApartmentList({
  apartment,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useI18nNamespace("apartment", translations);
  const categories: ApartmentCategory[] = useAppSelector(
    (state) => state.apartmentCategory.categories
  );

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);

  const getMultiLang = (obj?: Record<string, string>) => {
    if (!obj) return "";
    return obj[lang] || obj["en"] || Object.values(obj)[0] || "—";
  };

  const safeApartment = useMemo(
    () => (Array.isArray(apartment) ? apartment : []),
    [apartment]
  );

  // Kategoriye göre grupla
  const grouped = useMemo(() => {
    const result: Record<string, IApartment[]> = {};
    for (const ref of safeApartment) {
      const catId =
        typeof ref.category === "string"
          ? ref.category
          : ref.category?._id || "none";
      if (!result[catId]) result[catId] = [];
      result[catId].push(ref);
    }
    return result;
  }, [safeApartment]);

  const noCategory = grouped["none"] || [];
  const sortedCategories = categories.filter((cat) => grouped[cat._id]?.length);

  const tabs: { key: string; label: string }[] = [
    { key: "all", label: t("apartment.all_categories", "All Categories") },
    ...sortedCategories.map((cat) => ({
      key: cat._id,
      label: getMultiLang(cat.name),
    })),
    ...(noCategory.length
      ? [{ key: "none", label: t("apartment.no_category", "No Category") }]
      : []),
  ];

  const filteredRefs = useMemo(() => {
    if (activeTab === "all") return safeApartment;
    return grouped[activeTab] || [];
  }, [activeTab, safeApartment, grouped]);

  const isAllSelected =
    filteredRefs.length > 0 &&
    filteredRefs.every((item) => selected.includes(item._id));

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected((prev) =>
        prev.filter((id) => !filteredRefs.some((item) => item._id === id))
      );
    } else {
      setSelected((prev) => [
        ...prev,
        ...filteredRefs
          .map((item) => item._id)
          .filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleDeleteSelected = () => {
    if (!onDelete || selected.length === 0) return;
    if (
      window.confirm(
        t(
          "apartment.delete_selected_confirm",
          "Are you sure you want to delete all selected items?"
        )
      )
    ) {
      selected.forEach((id) => onDelete(id));
      setSelected((prev) =>
        prev.filter((id) => !filteredRefs.some((item) => item._id === id))
      );
    }
  };

  // --- Render guards ---
  if (loading) {
    return (
      <SkeletonWrapper>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }

  if (error) return <ErrorText>❌ {error}</ErrorText>;
  if (!safeApartment.length)
    return <Empty>{t("apartment.empty", "No apartment available.")}</Empty>;

  return (
    <div>
      <TabsWrapper>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsWrapper>

      <BulkActions>
        <label>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            disabled={filteredRefs.length === 0}
          />
          {t("apartment.select_all", "Select All")}
        </label>
        {selected.length > 0 && (
          <DeleteSelectedButton onClick={handleDeleteSelected}>
            {t("apartment.delete_selected", "Delete Selected")}
            <span>({selected.length})</span>
          </DeleteSelectedButton>
        )}
      </BulkActions>

      <Grid>
        {filteredRefs.map((item) => {
          const previewSrc =
            item.images?.[0]?.thumbnail || item.images?.[0]?.url || "";
          const title = getMultiLang(item.title) || "";
          const addressLine =
            (item as any)?.address?.city ||
            (item as any)?.address?.fullText ||
            "";
          return (
            <Card key={item._id} $selected={selected.includes(item._id)}>
              <CheckboxWrapper>
                <input
                  type="checkbox"
                  checked={selected.includes(item._id)}
                  onChange={() => handleSelect(item._id)}
                />
              </CheckboxWrapper>

              <Badges>
                <Badge $type={item.isActive ? "active" : "inactive"}>
                  {item.isActive
                    ? t("active", "Active")
                    : t("inactive", "Inactive")}
                </Badge>
                <Badge $type={item.isPublished ? "published" : "unpublished"}>
                  {item.isPublished
                    ? t("published", "Published")
                    : t("unpublished", "Unpublished")}
                </Badge>
              </Badges>

              <LogoBox>
                {previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt={title || "image"}
                    width={90}
                    height={60}
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <NoLogo>{t("apartment.no_images", "No image")}</NoLogo>
                )}
              </LogoBox>

              <CompanyName title={title}>{title || <>&nbsp;</>}</CompanyName>

              {addressLine && <AddressLine>{addressLine}</AddressLine>}

              <CardActions>
                {onEdit && (
                  <ActionButton
                    onClick={() => onEdit(item)}
                    aria-label={t("edit", "Edit")}
                  >
                    {t("edit", "Edit")}
                  </ActionButton>
                )}
                {onDelete && (
                  <DeleteButton
                    onClick={() => onDelete(item._id)}
                    aria-label={t("delete", "Delete")}
                  >
                    {t("delete", "Delete")}
                  </DeleteButton>
                )}
                {onTogglePublish && (
                  <ToggleButton
                    onClick={() =>
                      onTogglePublish(item._id, item.isPublished)
                    }
                    aria-label={
                      item.isPublished
                        ? t("apartment.unpublish", "Unpublish")
                        : t("apartment.publish", "Publish")
                    }
                  >
                    {item.isPublished
                      ? t("apartment.unpublish", "Unpublish")
                      : t("apartment.publish", "Publish")}
                  </ToggleButton>
                )}
              </CardActions>
            </Card>
          );
        })}
      </Grid>

      {filteredRefs.length === 0 && (
        <Empty>
          {t("apartment.empty_in_category", "No apartment in this category.")}
        </Empty>
      )}
    </div>
  );
}

// --- Styles ---
const SkeletonWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const TabsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.55rem 1.3rem;
  border: none;
  border-radius: 24px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.text};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 2px 12px 0 ${theme.colors.primary}33` : "none"};
  outline: none;
  border: 1px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.border};
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
  }
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.97em;

  label {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
`;

const DeleteSelectedButton = styled.button`
  padding: 0.45rem 1.1rem;
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1.1rem 1.5rem;
`;

const Card = styled.div<{ $selected?: boolean }>`
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg || "12px"};
  padding: 1rem 0.5rem 0.7rem 0.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  min-height: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 0 2px #4b9efc33" : "none"};
  transition: border 0.2s, box-shadow 0.2s;
`;

const CheckboxWrapper = styled.div`
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  z-index: 2;
  input[type="checkbox"] {
    width: 1.1em;
    height: 1.1em;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

const Badges = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  display: flex;
  gap: 0.35rem;
`;

const Badge = styled.span<{ $type: "active" | "inactive" | "published" | "unpublished" }>`
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.72em;
  font-weight: 700;
  color: #fff;
  background: ${({ $type, theme }) =>
    $type === "active"
      ? theme.colors.success
      : $type === "published"
      ? theme.colors.primary
      : $type === "unpublished"
      ? theme.colors.warning
      : theme.colors.textSecondary};
`;

const LogoBox = styled.div`
  margin-bottom: 0.7rem;
  background: #fff;
  border-radius: 7px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 60px;
  overflow: hidden;
`;

const NoLogo = styled.span`
  font-size: 0.9em;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
`;

const CompanyName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.15rem;
  text-align: center;
  width: 100%;
  word-break: break-word;
`;

const AddressLine = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 0.4rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  padding: 0.25rem 0.7rem;
  background: ${({ theme }) => theme.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.96em;
`;

const DeleteButton = styled.button`
  padding: 0.25rem 0.7rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.96em;
`;

const ToggleButton = styled.button`
  padding: 0.25rem 0.7rem;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.96em;
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 2rem 0;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: bold;
  margin: 2rem 0;
`;

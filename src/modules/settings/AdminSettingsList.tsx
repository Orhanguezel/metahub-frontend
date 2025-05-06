"use client";

import React from "react";
import styled from "styled-components";
import { Setting, deleteSetting, upsertSetting } from "@/store/settingSlice";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getImageSrc } from "@/utils/getImageSrc";

interface AdminSettingsListProps {
  settings: Setting[];
  onEdit: (setting: Setting) => void;
}

export default function AdminSettingsList({
  settings,
  onEdit,
}: AdminSettingsListProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("adminSettings");

  const availableThemes = React.useMemo(() => {
    const themeSetting = settings.find((s) => s.key === "available_themes");
    if (Array.isArray(themeSetting?.value)) return themeSetting.value;
    if (typeof themeSetting?.value === "string")
      return themeSetting.value.split(",").map((v) => v.trim());
    return [];
  }, [settings]);

  const handleDelete = async (key: string) => {
    if (confirm(t("confirmDelete"))) {
      try {
        await dispatch(deleteSetting(key)).unwrap();
        toast.success(t("settingDeleted"));
      } catch (error: any) {
        toast.error(error?.message || t("deleteError"));
      }
    }
  };

  const handleThemeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    try {
      await dispatch(
        upsertSetting({ key: "site_template", value: newTheme })
      ).unwrap();
      toast.success(t("themeChanged"));
    } catch (error: any) {
      toast.error(error?.message || t("updateError"));
    }
  };

  const isLogoKey = (key: string) => {
    return ["footer_logo", "navbar_logo"].includes(key);
  };

  const renderValue = (setting: Setting) => {
    const val = setting.value;

    if (setting.key === "site_template" && typeof val === "string") {
      return (
        <Select value={val} onChange={handleThemeChange}>
          {availableThemes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </Select>
      );
    }

    if (isLogoKey(setting.key) && typeof val === "string") {
      return (
        <LogoPreview>
          <img
            src={getImageSrc(val, "setting")}
            alt={`${setting.key} preview`}
          />
        </LogoPreview>
      );
    }

    if (typeof val === "string") {
      return <SingleValue>{val}</SingleValue>;
    }

    if (Array.isArray(val)) {
      return <SingleValue>{val.join(", ")}</SingleValue>;
    }

    if (typeof val === "object" && val !== null) {
      // Multi-lang object: { tr, en, de }
      if ("tr" in val || "en" in val || "de" in val) {
        return (
          <>
            {val.tr && <LangValue>TR: {val.tr}</LangValue>}
            {val.en && <LangValue>EN: {val.en}</LangValue>}
            {val.de && <LangValue>DE: {val.de}</LangValue>}
          </>
        );
      }

      // Nested object (like footer_about_links)
      const entries = Object.entries(val);
      if (entries.length > 0) {
        return (
          <NestedList>
            {entries.map(([fieldKey, fieldVal]) => {
              if (
                typeof fieldVal === "object" &&
                fieldVal !== null &&
                "label" in fieldVal &&
                "url" in fieldVal
              ) {
                const label = (fieldVal as any).label;
                const url = (fieldVal as any).url;
                return (
                  <NestedItem key={fieldKey}>
                    <strong>{fieldKey}:</strong>{" "}
                    {`[TR: ${label.tr || "-"}, EN: ${label.en || "-"}, DE: ${
                      label.de || "-"
                    }]`}{" "}
                    | URL: {url}
                  </NestedItem>
                );
              }
              return (
                <NestedItem key={fieldKey}>
                  <strong>{fieldKey}:</strong> {JSON.stringify(fieldVal)}
                </NestedItem>
              );
            })}
          </NestedList>
        );
      }
    }

    return <SingleValue>-</SingleValue>;
  };

  if (settings.length === 0) {
    return <EmptyMessage>{t("noSettings")}</EmptyMessage>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>{t("key")}</TableHeader>
          <TableHeader>{t("value")}</TableHeader>
          <TableHeader>{t("actions")}</TableHeader>
        </tr>
      </thead>
      <tbody>
        {settings.map((setting) => (
          <tr key={setting._id || setting.key}>
            <TableCell>{setting.key}</TableCell>
            <TableCell>{renderValue(setting)}</TableCell>
            <TableCell>
              <ActionButton type="button" onClick={() => onEdit(setting)}>
                {t("edit")}
              </ActionButton>
              <ActionButtonDelete
                type="button"
                onClick={() => handleDelete(setting.key)}
              >
                {t("delete")}
              </ActionButtonDelete>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// 🎨 Styled Components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TableHeader = styled.th`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  vertical-align: top;
`;

const LangValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SingleValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Select = styled.select`
  padding: 0.4rem 0.8rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const ActionButton = styled.button`
  margin-right: ${({ theme }) => theme.spacing.xs};
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
  }
`;

const ActionButtonDelete = styled(ActionButton)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};

  &:hover {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.warning};
  padding: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const NestedList = styled.ul`
  list-style: disc;
  padding-left: ${({ theme }) => theme.spacing.md};
`;

const NestedItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const LogoPreview = styled.div`
  img {
    max-width: 100px;
    height: auto;
    display: block;
    border-radius: ${({ theme }) => theme.radii.sm};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

"use client";

import React from "react";
import styled from "styled-components";
import { Setting, deleteSetting, upsertSetting } from "@/store/settingSlice";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface AdminSettingsListProps {
  settings: Setting[];
  onEdit: (setting: Setting) => void;
}

export default function AdminSettingsList({ settings, onEdit }: AdminSettingsListProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("admin-settings");

  const availableThemes = React.useMemo(() => {
    const themeSetting = settings.find((s) => s.key === "available_themes");
    if (Array.isArray(themeSetting?.value)) return themeSetting.value;
    if (typeof themeSetting?.value === "string") return themeSetting.value.split(",").map((v) => v.trim());
    return [];
  }, [settings]);

  const handleDelete = async (key: string) => {
    if (confirm(t("confirmDelete", "Are you sure you want to delete this setting?"))) {
      try {
        await dispatch(deleteSetting(key)).unwrap();
        toast.success(t("settingDeleted", "Setting deleted successfully."));
      } catch (error: any) {
        toast.error(error?.message || t("deleteError", "Failed to delete setting."));
      }
    }
  };

  const handleThemeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    try {
      await dispatch(upsertSetting({ key: "site_template", value: newTheme })).unwrap();
      toast.success(t("themeChanged", "Theme updated successfully."));
    } catch (error: any) {
      toast.error(error?.message || t("updateError", "Failed to update theme."));
    }
  };

  const renderValue = (setting: Setting) => {
    if (setting.key === "site_template") {
      return (
        <Select value={setting.value as string} onChange={handleThemeChange}>
          {availableThemes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </Select>
      );
    }

    if (typeof setting.value === "string") {
      return <SingleValue>{setting.value}</SingleValue>;
    }

    if (typeof setting.value === "object" && !Array.isArray(setting.value)) {
      return (
        <>
          <LangValue>TR: {setting.value.tr}</LangValue>
          <LangValue>EN: {setting.value.en}</LangValue>
          <LangValue>DE: {setting.value.de}</LangValue>
        </>
      );
    }

    return <SingleValue>-</SingleValue>;
  };

  if (settings.length === 0) {
    return <EmptyMessage>{t("noSettings", "No settings found.")}</EmptyMessage>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>{t("key", "Key")}</TableHeader>
          <TableHeader>{t("value", "Value")}</TableHeader>
          <TableHeader>{t("actions", "Actions")}</TableHeader>
        </tr>
      </thead>
      <tbody>
        {settings.map((setting) => (
          <tr key={setting.key}>
            <TableCell>{setting.key}</TableCell>
            <TableCell>{renderValue(setting)}</TableCell>
            <TableCell>
              <ActionButton type="button" onClick={() => onEdit(setting)}>
                {t("edit", "Edit")}
              </ActionButton>
              <ActionButtonDelete type="button" onClick={() => handleDelete(setting.key)}>
                {t("delete", "Delete")}
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
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
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

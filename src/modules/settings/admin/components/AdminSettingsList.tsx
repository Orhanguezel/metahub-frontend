"use client";

import React from "react";
import styled from "styled-components";
import {
  Setting,
  deleteSetting,
  upsertSetting,
} from "@/modules/settings/slice/settingSlice";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getImageSrc } from "@/shared/getImageSrc";
import { MultiLangValue, NestedLinkItem } from "@/modules/settings";

interface AdminSettingsListProps {
  settings: Setting[];
  onEdit: (setting: Setting) => void;
}

export default function AdminSettingsList({
  settings,
  onEdit,
}: AdminSettingsListProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("settings");

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

  const isLogoKey = (key: string) =>
    ["navbar_logos", "footer_logos"].includes(key);

  // --- GÜNCEL: LOGO DEĞERİNİ CLOUDINARY DESTEKLİ OKU ---
  const renderLogo = (val: any) => {
    // Eğer obje ve içinde light/dark varsa
    const lightLogoUrl =
      val?.light?.url ||
      (typeof val?.light === "string" && getImageSrc(val.light, "setting"));
    const darkLogoUrl =
      val?.dark?.url ||
      (typeof val?.dark === "string" && getImageSrc(val.dark, "setting"));

    return (
      <LogoGroup>
        {lightLogoUrl && (
          <LogoPreview>
            <span>Light</span>
            <img src={lightLogoUrl} alt="Light Logo" />
          </LogoPreview>
        )}
        {darkLogoUrl && (
          <LogoPreview>
            <span>Dark</span>
            <img src={darkLogoUrl} alt="Dark Logo" />
          </LogoPreview>
        )}
      </LogoGroup>
    );
  };

  const renderValue = (setting: Setting) => {
    const val = setting.value;

    // Tema seçici
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

    // LOGO key
    if (isLogoKey(setting.key) && typeof val === "object" && val !== null) {
      return renderLogo(val);
    }

    // String
    if (typeof val === "string") return <SingleValue>{val}</SingleValue>;
    // Array
    if (Array.isArray(val)) return <SingleValue>{val.join(", ")}</SingleValue>;

    // MultiLang veya nested object
    if (typeof val === "object" && val !== null) {
      // Çoklu dil
      if ("tr" in val || "en" in val || "de" in val) {
        const langVal = val as MultiLangValue;
        return (
          <div>
            {`${langVal.tr || "-"} / ${langVal.en || "-"} / ${
              langVal.de || "-"
            }`}
          </div>
        );
      }

      // NestedLinkItem
      if ("label" in val && "url" in val) {
        const nestedVal = val as NestedLinkItem;
        return (
          <div>
            {`${nestedVal.label.tr || "-"} / ${nestedVal.label.en || "-"} / ${
              nestedVal.label.de || "-"
            }`}{" "}
            → {nestedVal.url}
          </div>
        );
      }

      // Herhangi başka bir object
      return (
        <NestedList>
          {Object.entries(val).map(([fieldKey, fieldVal]) => (
            <NestedItem key={fieldKey}>
              <strong>{fieldKey}:</strong>{" "}
              {typeof fieldVal === "object"
                ? JSON.stringify(fieldVal)
                : String(fieldVal)}
            </NestedItem>
          ))}
        </NestedList>
      );
    }

    return <SingleValue>-</SingleValue>;
  };

  if (settings.length === 0) {
    return <EmptyMessage>{t("noSettings")}</EmptyMessage>;
  }

  return (
    <TableWrapper>
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
    </TableWrapper>
  );
}

// 🎨 Styled Components

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TableHeader = styled.th`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.md};
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

const LogoGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  align-items: center;
`;

const LogoPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    max-width: 80px;
    height: auto;
    border-radius: ${({ theme }) => theme.radii.sm};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    margin-top: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

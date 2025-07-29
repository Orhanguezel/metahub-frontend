"use client";
import React, { useMemo, ChangeEvent } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppDispatch } from "@/store/hooks";
import {
  deleteSettings,
  upsertSettings,
} from "@/modules/settings/slice/settingsSlice";
import { toast } from "react-toastify";
import type { ISetting } from "@/modules/settings/types";
import { SUPPORTED_LOCALES } from "@/i18n";
import Image from "next/image";

// --- Props tipi
interface AdminSettingsListProps {
  settings: ISetting[];
  onEdit: (setting: ISetting) => void;
  supportedLocales: readonly string[];
}

const LOGO_KEYS = ["navbar_images", "footer_images", "logo_images", "images"];

const AdminSettingsList: React.FC<AdminSettingsListProps> = ({
  settings,
  onEdit,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("settings", translations);

  // Temaları bul
  const availableThemes = useMemo<string[]>(() => {
    const themeSetting = settings.find((s) => s.key === "available_themes");
    if (Array.isArray(themeSetting?.value))
      return themeSetting.value as string[];
    if (typeof themeSetting?.value === "string")
      return themeSetting.value.split(",").map((v) => v.trim());
    return [];
  }, [settings]);

  // Silme işlemi
  const handleDelete = async (key: string) => {
    if (window.confirm(t("confirmDelete", "Are you sure?"))) {
      try {
        await dispatch(deleteSettings(key)).unwrap();
        toast.success(t("settingDeleted", "Setting deleted"));
      } catch (error: any) {
        toast.error(error?.message || t("deleteError", "Delete failed"));
      }
    }
  };

  // Tema değiştir
  const handleThemeChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    try {
      await dispatch(
        upsertSettings({ key: "site_template", value: newTheme, isActive: true })
      ).unwrap();
      toast.success(t("themeChanged", "Theme changed"));
    } catch (error: any) {
      toast.error(error?.message || t("updateError", "Update failed"));
    }
  };

  // Görsel key mi
  const isImageKey = (key: string) => LOGO_KEYS.includes(key);

  // Çoklu image array render
  const renderImages = (images: any[] = []) => (
    <LogoGroup>
      {images.map((img, idx) =>
        img?.url ? (
          <LogoPreview key={img.url + idx}>
            <Image
              src={img.url}
              alt={img.publicId || `image-${idx}`}
              width={80}
              height={40}
              style={{ height: "auto" }}
            />
            {img.publicId && (
              <span style={{ opacity: 0.7, fontSize: "10px" }}>{img.publicId}</span>
            )}
          </LogoPreview>
        ) : null
      )}
    </LogoGroup>
  );

  // Çoklu dil label gösterimi
  const renderTranslatedLabel = (label: Record<string, string | undefined>) => (
    <div>
      {SUPPORTED_LOCALES.map(
        (lng) =>
          label[lng] && (
            <span key={lng} style={{ marginRight: 8 }}>
              <b>{lng}:</b> {label[lng]}
            </span>
          )
      )}
    </div>
  );

  // Main value render logic
  const renderValue = (setting: ISetting) => {
    const val = setting.value;

    // Tema dropdown
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

    // Images array (çoklu görsel)
    if (isImageKey(setting.key) && Array.isArray(setting.images) && setting.images.length > 0) {
      return renderImages(setting.images);
    }

    // TranslatedLabel
    if (
      val &&
      typeof val === "object" &&
      SUPPORTED_LOCALES.some((lng) => lng in val)
    ) {
      return renderTranslatedLabel(val as Record<string, string>);
    }

    // Labeled link record
    if (
      val &&
      typeof val === "object" &&
      Object.values(val).some(
        (v: any) => v && typeof v === "object" && "label" in v && "url" in v
      )
    ) {
      // Record<string, ILabeledLink>
      return (
        <NestedList>
          {Object.entries(val).map(([k, v]: any) =>
            v && typeof v === "object" && "label" in v && "url" in v ? (
              <NestedItem key={k}>
                <b>{k}:</b> {renderTranslatedLabel(v.label)} → <span>{v.url}</span>
              </NestedItem>
            ) : null
          )}
        </NestedList>
      );
    }

    // Custom object (ör: {title, slogan})
    if (
      val &&
      typeof val === "object" &&
      ("title" in val || "slogan" in val)
    ) {
      return (
        <div>
          {"title" in val && (
            <>
              <b>{t("title", "Title")}:</b> {renderTranslatedLabel(val.title)}
              <br />
            </>
          )}
          {"slogan" in val && (
            <>
              <b>{t("slogan", "Slogan")}:</b> {renderTranslatedLabel(val.slogan)}
            </>
          )}
        </div>
      );
    }

    // Düz string
    if (typeof val === "string") return <SingleValue>{val}</SingleValue>;

    // Array (string[])
    if (Array.isArray(val)) return <SingleValue>{val.join(", ")}</SingleValue>;

    // Diğer nesne/dictionary
    if (val && typeof val === "object") {
      return (
        <NestedList>
          {Object.entries(val).map(([key, fieldVal]) => (
            <NestedItem key={key}>
              <strong>{key}:</strong>{" "}
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

  if (!settings.length) {
    return <EmptyMessage>{t("noSettings", "No settings found.")}</EmptyMessage>;
  }

  return (
    <TableWrapper>
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
            <tr key={(setting as any)._id || setting.key}>
              <TableCell>{setting.key}</TableCell>
              <TableCell>{renderValue(setting)}</TableCell>
              <TableCell>
                <ActionButton type="button" onClick={() => onEdit(setting)}>
                  {t("edit", "Edit")}
                </ActionButton>
                <ActionButtonDelete
                  type="button"
                  onClick={() => handleDelete(setting.key)}
                >
                  {t("delete", "Delete")}
                </ActionButtonDelete>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

export default AdminSettingsList;

// --- Styled Components ---
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};

  ${({ theme }) => theme.media.small} {
    padding-bottom: ${({ theme }) => theme.spacings.xs};
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  overflow: hidden;

  ${({ theme }) => theme.media.medium} {
    min-width: 480px;
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
  ${({ theme }) => theme.media.small} {
    min-width: 360px;
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

const TableHeader = styled.th`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.md};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  white-space: nowrap;

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.sm};
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacings.md};
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  vertical-align: top;
  word-break: break-word;

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.sm};
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

const SingleValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

const Select = styled.select`
  padding: 0.3rem 0.7rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  min-width: 90px;

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    padding: 0.2rem 0.5rem;
    min-width: 72px;
  }
`;

const ActionButton = styled.button`
  margin-right: ${({ theme }) => theme.spacings.xs};
  padding: 0.32rem 0.72rem;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: background ${({ theme }) => theme.transition.fast};
  box-shadow: ${({ theme }) => theme.shadows.xs};

  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
  }
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    padding: 0.24rem 0.4rem;
    margin-right: ${({ theme }) => theme.spacings.xs};
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
  padding: ${({ theme }) => theme.spacings.xl};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  margin: ${({ theme }) => theme.spacings.md} 0;

  ${({ theme }) => theme.media.medium} {
    font-size: ${({ theme }) => theme.fontSizes.md};
    padding: ${({ theme }) => theme.spacings.lg};
    border-radius: ${({ theme }) => theme.radii.md};
  }
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.sm};
    margin: ${({ theme }) => theme.spacings.sm} 0;
  }
`;

const NestedList = styled.ul`
  list-style: disc;
  padding-left: ${({ theme }) => theme.spacings.md};
  margin: ${({ theme }) => theme.spacings.xs} 0;
  ${({ theme }) => theme.media.small} {
    padding-left: ${({ theme }) => theme.spacings.sm};
  }
`;

const NestedItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

const LogoGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
  align-items: center;

  ${({ theme }) => theme.media.small} {
    gap: ${({ theme }) => theme.spacings.xs};
  }
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
    margin-top: ${({ theme }) => theme.spacings.xs};
    object-fit: contain;
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    margin-top: ${({ theme }) => theme.spacings.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.8;
  }
  ${({ theme }) => theme.media.small} {
    img {
      max-width: 56px;
    }
    span {
      font-size: ${({ theme }) => theme.fontSizes.xsmall};
    }
  }
`;

"use client";

import React, { useMemo, ChangeEvent } from "react";
import styled from "styled-components";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/settings/locales";
import { useAppDispatch } from "@/store/hooks";
import { deleteSettings, upsertSettings } from "@/modules/settings/slice/settingsSlice";
import { toast } from "react-toastify";
import type { ISetting } from "@/modules/settings/types";
import { SUPPORTED_LOCALES } from "@/i18n";

interface AdminSettingsListProps {
  settings: ISetting[];
  onEdit: (setting: ISetting) => void;
  supportedLocales: readonly string[];
}

const LOGO_KEYS = ["navbar_images", "footer_images", "logo_images", "images"];

const AdminSettingsList: React.FC<AdminSettingsListProps> = ({ settings, onEdit }) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("settings", translations);

  const availableThemes = useMemo<string[]>(() => {
    const s = settings.find((x) => x.key === "available_themes");
    if (Array.isArray(s?.value)) return s.value as string[];
    if (typeof s?.value === "string") return s.value.split(",").map((v) => v.trim()).filter(Boolean);
    return [];
  }, [settings]);

  const handleDelete = async (key: string) => {
    if (!window.confirm(t("confirmDelete", "Are you sure?"))) return;
    try {
      await dispatch(deleteSettings(key)).unwrap();
      toast.success(t("settingDeleted", "Setting deleted"));
    } catch (err: any) {
      toast.error(err?.message || t("deleteError", "Delete failed"));
    }
  };

  const handleThemeChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    try {
      await dispatch(upsertSettings({ key: "site_template", value: newTheme, isActive: true })).unwrap();
      toast.success(t("themeChanged", "Theme changed"));
    } catch (err: any) {
      toast.error(err?.message || t("updateError", "Update failed"));
    }
  };

  const isImageKey = (k: string) => LOGO_KEYS.includes(k);

  // ✅ Mobilde taşma yok: grid + akışkan küçük görseller
  const renderImages = (images: any[] = []) => (
    <LogoGroup>
      {images.map((img, idx) =>
        img?.url ? (
          <LogoPreview key={img.url + idx}>
            <Thumb>
              <Image
                src={img.url}
                alt={img.publicId || `image-${idx}`}
                fill
                sizes="(max-width: 768px) 22vw, 80px"
                style={{ objectFit: "contain" }}
              />
            </Thumb>
            {img.publicId && <span>{img.publicId}</span>}
          </LogoPreview>
        ) : null
      )}
    </LogoGroup>
  );

  const renderTranslatedLabel = (label: Record<string, string | undefined>) => (
    <LangWrap>
      {SUPPORTED_LOCALES.map(
        (lng) =>
          label[lng] && (
            <span key={lng}>
              <b>{lng}:</b> {label[lng]}
            </span>
          )
      )}
    </LangWrap>
  );

  const renderValue = (setting: ISetting) => {
    const val = setting.value;

    if (setting.key === "site_template" && typeof val === "string") {
      return (
        <Select value={val} onChange={handleThemeChange}>
          {availableThemes.map((th) => (
            <option key={th} value={th}>{th}</option>
          ))}
        </Select>
      );
    }

    if (isImageKey(setting.key) && Array.isArray(setting.images) && setting.images.length > 0) {
      return renderImages(setting.images);
    }

    if (val && typeof val === "object" && SUPPORTED_LOCALES.some((lng) => lng in val)) {
      return renderTranslatedLabel(val as Record<string, string>);
    }

    if (
      val &&
      typeof val === "object" &&
      Object.values(val).some((v: any) => v && typeof v === "object" && "label" in v && "url" in v)
    ) {
      return (
        <NestedList>
          {Object.entries(val).map(([k, v]: any) =>
            v && typeof v === "object" && "label" in v && "url" in v ? (
              <li key={k}>
                <b>{k}:</b> {renderTranslatedLabel(v.label)} → <span>{v.url}</span>
              </li>
            ) : null
          )}
        </NestedList>
      );
    }

    if (val && typeof val === "object" && ("title" in val || "slogan" in val)) {
      return (
        <div>
          {"title" in val && (
            <>
              <b>{t("title", "Title")}:</b> {renderTranslatedLabel((val as any).title)}
              <br />
            </>
          )}
          {"slogan" in val && (
            <>
              <b>{t("slogan", "Slogan")}:</b> {renderTranslatedLabel((val as any).slogan)}
            </>
          )}
        </div>
      );
    }

    if (typeof val === "string") return <SingleValue>{val}</SingleValue>;
    if (Array.isArray(val)) return <SingleValue>{val.join(", ")}</SingleValue>;
    if (val && typeof val === "object") {
      return (
        <NestedList>
          {Object.entries(val).map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </li>
          ))}
        </NestedList>
      );
    }
    return <SingleValue>-</SingleValue>;
  };

  if (!settings.length) {
    return <Empty>{t("noSettings", "No settings found.")}</Empty>;
  }

  return (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <th style={{ width: 240 }}>{t("key", "Key")}</th>
            <th>{t("value", "Value")}</th>
            <th style={{ width: 220 }}>{t("actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((s) => (
            <tr key={(s as any)._id || s.key}>
              <td className="mono">{s.key}</td>
              <td>{renderValue(s)}</td>
              <td className="actions">
                <Row>
                  <Secondary type="button" onClick={() => onEdit(s)}>{t("edit", "Edit")}</Secondary>
                  <Danger type="button" onClick={() => handleDelete(s.key)}>{t("delete", "Delete")}</Danger>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
};

export default AdminSettingsList;

/* =============== styles (classicTheme ile uyumlu) =============== */

const TableWrap = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead th{
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
    white-space: nowrap;
  }

  td{
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    vertical-align: top;
    /* uzun içerikler mobilde satır içine sığsın */
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  td.actions { text-align: right; }
  td.mono { font-family: ${({ theme }) => theme.fonts.mono}; }
  tbody tr:hover td { background: ${({ theme }) => theme.colors.hoverBackground}; }

  ${({ theme }) => theme.media.mobile} {
    thead th, td { padding: ${({ theme }) => theme.spacings.sm}; }
  }
`;

const Row = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Secondary = styled.button`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: ${({ theme }) => theme.transition.fast};
  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; }
`;

const Danger = styled(Secondary)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover{
    background: ${({ theme }) => theme.colors.dangerHover};
    color: ${({ theme }) => theme.colors.textOnDanger};
    border-color: ${({ theme }) => theme.colors.dangerHover};
  }
`;

const Select = styled.select`
  padding: 0.45rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  min-width: 110px;
`;

const SingleValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NestedList = styled.ul`
  list-style: disc;
  padding-left: ${({ theme }) => theme.spacings.md};
  margin: 0;
`;

const LangWrap = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
`;

/* ---- LOGO/GÖRSEL KÜMESİ ----
   Grid → otomatik sarma, mobilde 2–4 sütun arası; masaüstünde daha fazla */
const LogoGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(56px, 22vw, 80px), 1fr));
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: start;
  width: 100%;
  max-width: 100%;

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacings.xs};
  }
`;

const LogoPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0; /* grid item içinde taşmayı önler */
  max-width: 100%;

  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    margin-top: ${({ theme }) => theme.spacings.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.8;
    text-align: center;
    word-break: break-word;
  }
`;

/* Görseli saran oranlı çerçeve (2:1) — akışkan genişlik */
const Thumb = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderBright};
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

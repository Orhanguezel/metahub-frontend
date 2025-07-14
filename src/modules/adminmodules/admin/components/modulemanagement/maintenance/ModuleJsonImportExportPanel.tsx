"use client";
import React, { useRef } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  importModuleMetas,
} from "@/modules/adminmodules/slices/moduleMetaSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/adminmodules";
import { toast } from "react-toastify";
// import type { IModuleMeta } from "@/modules/adminmodules/types"; // Varsa tip dosyanı ekleyebilirsin

const ModuleJsonImportExportPanel: React.FC = () => {
   const { t } = useI18nNamespace("adminModules", translations);
  const dispatch = useAppDispatch();
  const { modules = [] } = useAppSelector((s) => s.moduleMeta);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export as JSON
  const handleExport = () => {
    const json = JSON.stringify(modules, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "module-metas.json";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(t("exported", "Exported successfully!"));
  };

  // Import from JSON
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let importedModules: any[];
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Invalid format");
      importedModules = parsed;
    } catch {
      toast.error(t("importInvalid", "Invalid JSON file."));
      return;
    }
    await dispatch(importModuleMetas(importedModules));
    toast.success(t("imported", "Imported successfully!"));
  };

  return (
    <Card>
      <Title>{t("jsonExportImport", "JSON Export / Import")}</Title>
      <Actions>
        <ExportButton type="button" onClick={handleExport}>
          {t("exportJson", "Export as JSON")}
        </ExportButton>
        <ImportButton as="label">
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImport}
          />
          <span onClick={() => fileInputRef.current?.click()}>
            {t("importJson", "Import from JSON")}
          </span>
        </ImportButton>
      </Actions>
      <Helper>
        {t(
          "jsonExportImportHint",
          "Export all module definitions as a backup or import a full set from JSON."
        )}
      </Helper>
    </Card>
  );
};

export default ModuleJsonImportExportPanel;

// --- Styled Components ---
const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
  padding: 22px 18px 18px 18px;
  min-width: 270px;
  flex: 1 1 270px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.05em;
  margin-bottom: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const Actions = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 9px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
  }
`;

const ExportButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 18px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.13s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover || "#1890ff"};
  }
`;

const ImportButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.primary};
  border: 1.2px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  padding: 7px 18px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.13s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.background};
  }
  span {
    text-decoration: underline;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Helper = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: 8px;
`;

"use client";
import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";

// Eğer tipi ayrı dosyada ise import { ModuleTenantMatrix } from "@/modules/adminmodules/types";
// Yoksa burada tekrar tanımlayabilirsin:
type ModuleTenantMatrix = Record<string, Record<string, boolean>>;

const ModuleTenantMatrixTable: React.FC = () => {
   const { t } = useI18nNamespace("adminModules", translations);
  // State tipi import ettiğin RootState ise tipini ver (tercihen):
  // const { moduleTenantMatrix = {} } = useAppSelector((s: RootState) => s.moduleMaintenance);
  // Yoksa aşağıdaki gibi kalabilir:
  const { moduleTenantMatrix = {} } = useAppSelector(
    (s: any): { moduleTenantMatrix: ModuleTenantMatrix } => s.moduleMaintenance
  );

 const modules = Object.keys(moduleTenantMatrix || {});
const tenants =
  modules.length > 0 ? Object.keys(moduleTenantMatrix[modules[0]] || {}) : [];

if (!modules.length || !tenants.length) {
  return (
    <InfoText>
      {t("tenantMatrix.empty", "No module-tenant mapping data available.")}
    </InfoText>
  );
}

return (
  <TableContainer>
    <MatrixTable>
      <thead>
        <tr>
          <th>{t("matrix.module", "Module")}</th>
          {tenants.map((tenant) => (
            <th key={tenant}>{tenant}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {modules.map((mod) => (
          <tr key={mod}>
            <td>{mod}</td>
            {tenants.map((tenant) => (
              <td key={tenant}>
                {moduleTenantMatrix[mod][tenant] ? (
                  <ActiveDot title="Assigned" />
                ) : (
                  <InactiveDot title="Not assigned" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </MatrixTable>
  </TableContainer>
);

};

export default ModuleTenantMatrixTable;

// --- Styled Components ---
const TableContainer = styled.div`
  margin-top: 18px;
  overflow-x: auto;
`;

const MatrixTable = styled.table`
  border-collapse: collapse;
  width: 100%;
  th,
  td {
    border: 1px solid #ddd;
    padding: 7px 11px;
    font-size: 14px;
    text-align: center;
  }
  th {
    background: #f4f5fb;
    font-weight: bold;
    color: #333;
  }
`;

const ActiveDot = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  background: ${({ theme }) => theme.colors.success};
  border-radius: 50%;
`;

const InactiveDot = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  background: #eee;
  border-radius: 50%;
  border: 1.5px solid #ccc;
`;

const InfoText = styled.div`
  margin: 20px 0;
  color: #888;
  text-align: center;
  font-size: 16px;
`;

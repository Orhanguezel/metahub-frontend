"use client";
import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";

const MaintenanceLogBox: React.FC = () => {
   const { t } = useI18nNamespace("adminModules", translations);
  const { maintenanceLogs, repaired, deletedCount } = useAppSelector(
    (state) => state.moduleMaintenance
  );

  if (
    (!maintenanceLogs || maintenanceLogs.length === 0) &&
    (!repaired || repaired.length === 0) &&
    !deletedCount
  )
    return null;

  return (
    <Box>
      {maintenanceLogs && maintenanceLogs.length > 0 && (
        <div>
          <b>{t("logs", "Logs / Results")}:</b>
          <pre>{JSON.stringify(maintenanceLogs, null, 2)}</pre>
        </div>
      )}
      {repaired && repaired.length > 0 && (
        <div>
          <b>{t("repaired", "Repaired Settings")}:</b>
          <pre>{JSON.stringify(repaired, null, 2)}</pre>
        </div>
      )}
      {deletedCount > 0 && (
        <div>
          <b>
            {t("deletedCount", "Deleted Records")}: {deletedCount}
          </b>
        </div>
      )}
    </Box>
  );
};

export default MaintenanceLogBox;

const Box = styled.div`
  background: #fafbfc;
  border-radius: 7px;
  padding: 16px;
  margin-top: 18px;
  font-size: 15px;
  color: #333;
  overflow-x: auto;
  border: 1px solid #eee;
`;

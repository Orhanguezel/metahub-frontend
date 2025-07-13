"use client";
import styled from "styled-components";
import { Button } from "@/shared";
import type { ISectionMeta, ISectionSetting } from "@/modules/section/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import type { SupportedLocale } from "@/types/common";

type Props = {
  metasAdmin: ISectionMeta[];
  settings: ISectionSetting[];
  onEdit: (meta: ISectionMeta, setting?: ISectionSetting) => void;
  onSelect: (key: string) => void;
  selectedKeys: string[];
};

export default function SectionTable({
  metasAdmin,
  settings,
  onEdit,
  onSelect,
  selectedKeys,
}: Props) {
  // ---- STANDART DİL MODELİ ----
  const { i18n, t } = useI18nNamespace("section", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Select all handler
  const allSelected = metasAdmin.length > 0 && selectedKeys.length === metasAdmin.length;
  function handleSelectAll() {
    if (allSelected) {
      metasAdmin.forEach((m) => {
        if (selectedKeys.includes(m.key)) onSelect(m.key);
      });
    } else {
      metasAdmin.forEach((m: ISectionMeta) => {
        if (!selectedKeys.includes(m.key)) onSelect(m.key);
      });
    }
  }

  return (
    <StyledTable>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              aria-label="Select all"
            />
          </th>
          <th>{t("section.key", "Key")}</th>
          <th>{t("section.label", "Label")}</th>
          <th>{t("section.enabled", "Enabled")}</th>
          <th>{t("section.order", "Order")}</th>
          <th>{t("section.actions", "Actions")}</th>
        </tr>
      </thead>
      <tbody>
        {metasAdmin.map((metaAdmin) => {
          const setting = settings.find((s) => s.sectionKey === metaAdmin.key);
          return (
            <tr key={metaAdmin.key}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(metaAdmin.key)}
                  onChange={() => onSelect(metaAdmin.key)}
                  aria-label={`Select ${metaAdmin.key}`}
                />
              </td>
              <td>{metaAdmin.key}</td>
              <td>
                {metaAdmin.label?.[lang] ||
                  metaAdmin.label?.en ||
                  Object.values(metaAdmin.label || {})[0] ||
                  "-"}
              </td>
              <td>
                <EnabledDot $enabled={setting?.enabled ?? metaAdmin.defaultEnabled} />
              </td>
              <td>
                {setting?.order !== undefined
                  ? setting.order
                  : metaAdmin.defaultOrder}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(metaAdmin, setting)}
                >
                  {t("edit", "Edit")}
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
}

// Styled Components
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  th, td { padding: 0.7rem 1rem; text-align: left; }
  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  }
  td { border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight}; color: ${({ theme }) => theme.colors.text}; }
  tr:last-child td { border-bottom: none; }
`;

const EnabledDot = styled.span<{ $enabled: boolean }>`
  display: inline-block;
  width: 18px; height: 18px; border-radius: 50%;
  background: ${({ $enabled, theme }) => $enabled ? theme.colors.success : theme.colors.danger};
  border: 2px solid #fff; box-shadow: 0 0 0 1.5px ${({ $enabled, theme }) => $enabled ? theme.colors.success : theme.colors.danger};
`;


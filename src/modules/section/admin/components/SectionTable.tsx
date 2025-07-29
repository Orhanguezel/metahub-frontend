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
  onDelete: (meta: ISectionMeta, setting?: ISectionSetting) => void;
  onSelect: (sectionKey: string) => void;
  selectedKeys: string[];
};

export default function SectionTable({
  metasAdmin,
  settings,
  onEdit,
  onDelete,
  onSelect,
  selectedKeys,
}: Props) {
  const { i18n, t } = useI18nNamespace("section", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const allSelected = metasAdmin.length > 0 && selectedKeys.length === metasAdmin.length;
  function handleSelectAll() {
    if (allSelected) {
      metasAdmin.forEach((m) => {
        if (selectedKeys.includes(m.sectionKey)) onSelect(m.sectionKey);
      });
    } else {
      metasAdmin.forEach((m) => {
        if (!selectedKeys.includes(m.sectionKey)) onSelect(m.sectionKey);
      });
    }
  }

  return (
    <ResponsiveTableWrapper>
      {/* Desktop Table */}
      <DesktopTable>
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
            <th>{t("section.sectionKey", "Key")}</th>
            <th>{t("section.label", "Label")}</th>
            <th>{t("section.enabled", "Enabled")}</th>
            <th>{t("section.order", "Order")}</th>
            <th>{t("section.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {metasAdmin.map((metaAdmin) => {
            const setting = settings.find((s) => s.sectionKey === metaAdmin.sectionKey);
            return (
              <tr key={metaAdmin.sectionKey}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(metaAdmin.sectionKey)}
                    onChange={() => onSelect(metaAdmin.sectionKey)}
                    aria-label={`Select ${metaAdmin.sectionKey}`}
                  />
                </td>
                <td>{metaAdmin.sectionKey}</td>
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
                  <Button
                    size="sm"
                    variant="danger"
                    style={{ marginLeft: 8 }}
                    onClick={() => onDelete(metaAdmin, setting)}
                    disabled={!setting}
                  >
                    {t("delete", "Delete")}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </DesktopTable>

      {/* Mobile Cards */}
      <MobileCards>
        {metasAdmin.map((metaAdmin) => {
          const setting = settings.find((s) => s.sectionKey === metaAdmin.sectionKey);
          return (
            <Card key={metaAdmin.sectionKey} $selected={selectedKeys.includes(metaAdmin.sectionKey)}>
              <CardHeader>
                <Checkbox
                  type="checkbox"
                  checked={selectedKeys.includes(metaAdmin.sectionKey)}
                  onChange={() => onSelect(metaAdmin.sectionKey)}
                  aria-label={`Select ${metaAdmin.sectionKey}`}
                />
                <CardKey>{metaAdmin.sectionKey}</CardKey>
                <EnabledDot $enabled={setting?.enabled ?? metaAdmin.defaultEnabled} />
              </CardHeader>
              <CardRow>
                <CardLabel>{t("section.label", "Label")}:</CardLabel>
                <span>
                  {metaAdmin.label?.[lang] ||
                    metaAdmin.label?.en ||
                    Object.values(metaAdmin.label || {})[0] ||
                    "-"}
                </span>
              </CardRow>
              <CardRow>
                <CardLabel>{t("section.order", "Order")}:</CardLabel>
                <span>
                  {setting?.order !== undefined
                    ? setting.order
                    : metaAdmin.defaultOrder}
                </span>
              </CardRow>
              <CardActions>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(metaAdmin, setting)}
                >
                  {t("edit", "Edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(metaAdmin, setting)}
                  disabled={!setting}
                >
                  {t("delete", "Delete")}
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </MobileCards>
    </ResponsiveTableWrapper>
  );
}

// --- Styled Components ---

const ResponsiveTableWrapper = styled.div`
  width: 100%;
`;

const DesktopTable = styled.table`
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

  /* --- Gizle mobile'da --- */
  ${({ theme }) => theme.media.small} {
    display: none;
  }
`;

const MobileCards = styled.div`
  display: none;

  ${({ theme }) => theme.media.small} {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacings.md};
    margin-top: ${({ theme }) => theme.spacings.lg};
  }
`;

const Card = styled.div<{ $selected: boolean }>`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: ${({ theme }) => theme.spacings.md};
  transition: border 0.22s;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Checkbox = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  width: 22px; height: 22px;
`;

const CardKey = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  flex: 1;
`;

const CardLabel = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 70px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const CardRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 2px;
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const EnabledDot = styled.span<{ $enabled: boolean }>`
  display: inline-block;
  width: 18px; height: 18px; border-radius: 50%;
  background: ${({ $enabled, theme }) => $enabled ? theme.colors.success : theme.colors.danger};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1.5px ${({ $enabled, theme }) => $enabled ? theme.colors.success : theme.colors.danger};
`;


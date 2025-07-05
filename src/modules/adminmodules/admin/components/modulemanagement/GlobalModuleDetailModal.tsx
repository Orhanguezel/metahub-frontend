"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EditGlobalModuleModal } from "@/modules/adminmodules";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { IModuleMeta } from "@/modules/adminmodules/types";

// --- Props tipi ---
interface GlobalModuleDetailModalProps {
  module: IModuleMeta;
  onClose: () => void;
  onAfterAction?: () => void;
}

export default function GlobalModuleDetailModal({
  module,
  onClose,
  onAfterAction,
}: GlobalModuleDetailModalProps) {
  const { t } = useTranslation("adminModules");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const lang = getCurrentLocale();

  // Çoklu dilde label (gösterim için)
  const moduleLabel =
    module?.label?.[lang]?.trim() ||
    module?.label?.en?.trim() ||
    module?.name ||
    "";

  // Versiyon geçmişi
  const shownHistory = Array.isArray(module?.history)
    ? module.history.slice(-5)
    : [];
  const hasMoreHistory =
    Array.isArray(module?.history) && module.history.length > 5;

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    if (onAfterAction) onAfterAction();
  };

  return (
    <>
      <Overlay>
        <Modal>
          <Header>
            <Title>
              {moduleLabel}
              <ModuleName>({module?.name})</ModuleName>
            </Title>
            <ButtonGroup>
              <EditButton
                type="button"
                onClick={() => setEditModalOpen(true)}
                aria-label={t("edit", "Edit")}
              >
                <Pencil size={18} />
              </EditButton>
              <CloseButton
                type="button"
                onClick={onClose}
                aria-label={t("close", "Close")}
              >
                <XCircle size={18} />
              </CloseButton>
            </ButtonGroup>
          </Header>

          <Content>
            {/* Çoklu dilde label gösterimi */}
            <SectionTitle>{t("labels", "Module Labels")}</SectionTitle>
            <LabelTable>
              <tbody>
                {SUPPORTED_LOCALES.map((l) => (
                  <tr key={l}>
                    <th>{l.toUpperCase()}</th>
                    <td>{module.label?.[l] || <em>-</em>}</td>
                  </tr>
                ))}
              </tbody>
            </LabelTable>

            <DetailItem>
              <strong>{t("enabled", "Enabled")}:</strong>{" "}
              <BoolDot $active={!!module.enabled} />
              <span>{module.enabled ? t("yes", "Yes") : t("no", "No")}</span>
            </DetailItem>

            {/* Versiyon geçmişi */}
            {shownHistory.length > 0 && (
              <>
                <SectionTitle>{t("history", "Version History")}</SectionTitle>
                <HistoryList>
                  {shownHistory.map((h, i) => (
                    <HistoryItem key={i}>
                      <VersionLine>
                        <Version>
                          <strong>{h.version}</strong>
                        </Version>
                        <Author>{h.by || "-"}</Author>
                        <HistoryDate>
                          (
                          {h.date
                            ? new Date(h.date).toLocaleDateString(lang)
                            : "-"}
                          )
                        </HistoryDate>
                      </VersionLine>
                      {h.note && <NoteText>{h.note}</NoteText>}
                    </HistoryItem>
                  ))}

                  {hasMoreHistory && (
                    <HistoryItem>
                      <em style={{ opacity: 0.7 }}>
                        ...{t("andMore", "and more")}
                      </em>
                    </HistoryItem>
                  )}
                </HistoryList>
              </>
            )}
          </Content>
        </Modal>
      </Overlay>

      {/* Düzenleme Modalı */}
      {isEditModalOpen && (
        <EditGlobalModuleModal
          module={module}
          onClose={() => setEditModalOpen(false)}
          onAfterAction={handleEditSuccess}
        />
      )}
    </>
  );
}

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg};
  max-width: 600px;
  width: 95%;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacings.md};
  }
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0;
`;

const ModuleName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: 7px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const EditButton = styled.button`
  background: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const SectionTitle = styled.h4`
  margin-top: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-bottom: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacings.xs};
`;

const LabelTable = styled.table`
  border-collapse: collapse;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  th,
  td {
    padding: 6px 8px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  th {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    text-align: left;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textSecondary};
    width: 80px;
  }
  td {
    background: ${({ theme }) => theme.cards.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DetailItem = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const BoolDot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: 6px;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.success : theme.colors.danger};
  border: 1.5px solid #ddd;
  vertical-align: middle;
`;

const HistoryList = styled.ul`
  padding-left: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const HistoryItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const VersionLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Version = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Author = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const NoteText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.85;
  padding-left: ${({ theme }) => theme.spacings.md};
  border-left: ${({ theme }) => theme.borders.thick}
    ${({ theme }) => theme.colors.primary};
`;

const HistoryDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  opacity: 0.7;
`;

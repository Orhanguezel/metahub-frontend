"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminModule } from "@/store/adminSlice";
import EditModuleModal from "@/components/admin/modules/EditModuleModal";
import { toast } from "react-toastify";

interface Props {
  module: AdminModule;
  onClose: () => void;
}

const ModuleDetailModal: React.FC<Props> = ({ module, onClose }) => {
  const { t, i18n } = useTranslation();
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const currentLang = (i18n.language || "en") as keyof AdminModule["label"];
  const moduleLabel = module.label?.[currentLang] || module.name;

  const handleEditSuccess = () => {
    toast.success(
      t("admin.modules.updateSuccess", "Modül başarıyla güncellendi!")
    );
    setEditModalOpen(false);
    onClose();
  };

  return (
    <>
      <Overlay>
        <Modal>
          <Header>
            <Title>
              {moduleLabel} <ModuleName>({module.name})</ModuleName>
            </Title>
            <ButtonGroup>
              <EditButton onClick={() => setEditModalOpen(true)}>
                <Pencil size={18} />
              </EditButton>
              <CloseButton onClick={onClose}>
                <XCircle size={18} />
              </CloseButton>
            </ButtonGroup>
          </Header>

          <Content>
            <DetailItem>
              <strong>{t("createdAt", "Oluşturuldu")}:</strong>{" "}
              {module?.createdAt && typeof module.createdAt === "string"
                ? new window.Date(module.createdAt).toLocaleString()
                : "-"}
            </DetailItem>

            <DetailItem>
              <strong>{t("updatedAt", "Güncellendi")}:</strong>{" "}
              {module?.updatedAt && typeof module.updatedAt === "string"
                ? new window.Date(module.updatedAt).toLocaleString()
                : "-"}
            </DetailItem>

            {module.history && module.history.length > 0 && (
              <>
                <SectionTitle>{t("history", "Versiyon Geçmişi")}</SectionTitle>
                <HistoryList>
                  {module.history.map((h, i) => (
                    <HistoryItem key={i}>
                      <VersionLine>
                        <Version>
                          <strong>{h.version}</strong>
                        </Version>
                        <Author>{h.by}</Author>
                        <HistoryDate>
                          (
                          {h.date
                            ? new window.Date(h.date).toLocaleDateString()
                            : "-"}
                          )
                        </HistoryDate>
                      </VersionLine>
                      {h.note && <NoteText>{h.note}</NoteText>}
                    </HistoryItem>
                  ))}
                </HistoryList>
              </>
            )}
          </Content>
        </Modal>
      </Overlay>

      {isEditModalOpen && (
        <EditModuleModal module={module} onClose={handleEditSuccess} />
      )}
    </>
  );
};

export default ModuleDetailModal;

// --- Styled Components ---

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  max-width: 600px;
  width: 95%;
  border-radius: 10px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin: 0;
`;

const ModuleName = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  background: ${({ theme }) => theme.warning};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.danger};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const DetailItem = styled.p`
  margin: 0;
`;

const SectionTitle = styled.h4`
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 0.3rem;
`;

const HistoryList = styled.ul`
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const VersionLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
`;

const Version = styled.span`
  font-weight: bold;
`;

const Author = styled.span`
  color: ${({ theme }) => theme.primary};
`;

const NoteText = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  padding-left: 1.2rem;
  border-left: 2px solid ${({ theme }) => theme.primary};
`;

const HistoryDate = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
`;

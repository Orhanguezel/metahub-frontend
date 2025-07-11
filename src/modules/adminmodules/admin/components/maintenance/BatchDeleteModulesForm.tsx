"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import {
  deleteModuleMeta,
  fetchModuleMetas,
} from "@/modules/adminmodules/slices/moduleMetaSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const BatchDeleteModulesForm: React.FC = () => {
  const { t } = useTranslation("adminModules");
  const dispatch = useAppDispatch();
  const [names, setNames] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleBatchDelete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const modules = names
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (!modules.length) return;
    setLoading(true);
    try {
      await Promise.all(
        modules.map((m) => dispatch(deleteModuleMeta(m)).unwrap())
      );
      await dispatch(fetchModuleMetas());
      setNames("");
      toast.success(t("batchDeleteSuccess", "Modules deleted successfully!"));
    } catch (err: any) {
      toast.error(
        t("batchDeleteError", "Batch delete failed!") +
          (err?.message ? `: ${err.message}` : "")
      );
    }
    setLoading(false);
  };

  return (
    <PanelCard>
      <Title>{t("batchDelete", "Batch Delete Modules")}</Title>
      <StyledForm onSubmit={handleBatchDelete}>
        <TextArea
          rows={4}
          value={names}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setNames(e.target.value)
          }
          placeholder={t(
            "moduleNames",
            "Module names (comma or line separated)"
          )}
          disabled={loading}
          aria-label={t("moduleNames", "Module names")}
        />
        <DeleteButton type="submit" disabled={loading || !names.trim()}>
          {loading ? t("deleting", "Deleting...") : t("delete", "Delete")}
        </DeleteButton>
      </StyledForm>
      <HelperText>
        {t(
          "batchDeleteHint",
          "You can enter multiple module names, separated by comma or newline."
        )}
      </HelperText>
    </PanelCard>
  );
};

export default BatchDeleteModulesForm;

// --- STYLED COMPONENTS ---
const PanelCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 22px 22px 16px 22px;
  min-width: 270px;
  flex: 1 1 270px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.08em;
  margin-bottom: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 66px;
  padding: 9px 12px;
  border: 1.3px solid #bbb;
  border-radius: 7px;
  font-size: 15px;
  font-family: inherit;
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  resize: vertical;
`;

const DeleteButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 0;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.14s;
  margin-top: 5px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.dangerHover || "#e57373"};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HelperText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: 7px;
`;

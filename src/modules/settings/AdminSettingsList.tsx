"use client";

import React from "react";
import styled from "styled-components";
import { Setting, deleteSetting } from "@/store/settingSlice";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "react-toastify";

interface AdminSettingsListProps {
  settings: Setting[];
  onEdit: (setting: Setting) => void;
}

export default function AdminSettingsList({ settings, onEdit }: AdminSettingsListProps) {
  const dispatch = useAppDispatch();

  const handleDelete = (key: string) => {
    if (confirm("Are you sure you want to delete this setting?")) {
      dispatch(deleteSetting(key))
        .unwrap()
        .then(() => {
          toast.success("Setting deleted successfully.");
        })
        .catch((error) => {
          toast.error(error || "Failed to delete setting.");
        });
    }
  };

  const renderValue = (value: Setting["value"]) => {
    if (typeof value === "string") {
      return value;
    }
    return (
      <>
        <LangValue>TR: {value.tr || "-"}</LangValue>
        <LangValue>EN: {value.en || "-"}</LangValue>
        <LangValue>DE: {value.de || "-"}</LangValue>
      </>
    );
  };

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>Key</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody>
        {settings.map((setting) => (
          <tr key={setting.key}>
            <TableCell>{setting.key}</TableCell>
            <TableCell>{renderValue(setting.value)}</TableCell>
            <TableCell>
              <ActionButton onClick={() => onEdit(setting)}>Edit</ActionButton>
              <ActionButtonDelete onClick={() => handleDelete(setting.key)}>
                Delete
              </ActionButtonDelete>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// 🎨 Styled Components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TableHeader = styled.th`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  vertical-align: top;
`;

const LangValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionButton = styled.button`
  margin-right: ${({ theme }) => theme.spacing.xs};
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
  }
`;

const ActionButtonDelete = styled(ActionButton)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};

  &:hover {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
  }
`;

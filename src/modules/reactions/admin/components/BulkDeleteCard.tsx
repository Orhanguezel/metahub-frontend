"use client";
import styled from "styled-components";
import { useState } from "react";
import type { ReactionTargetType } from "@/modules/reactions/types";

type Option = { value: string; label: string };

type Props = {
  onBulkDelete: (p: { targetType: ReactionTargetType; targetId: string }) => void;
  loading?: boolean;
  t: (k: string, d?: string) => string;

  /** yeni: dropdown verileri (opsiyonel) */
  targetTypeOptions?: { value: ReactionTargetType; label: string }[];
  targetOptions?: Option[];
};

export default function BulkDeleteCard({ onBulkDelete, loading, t, targetTypeOptions = [], targetOptions = [] }: Props) {
  const [targetType, setTargetType] = useState<ReactionTargetType | "">("");
  const [targetId, setTargetId] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetType || !targetId) return;
    onBulkDelete({ targetType: targetType as ReactionTargetType, targetId });
  };

  return (
    <Wrap as="form" onSubmit={submit}>
      <h3>{t("admin.bulkDelete.title", "Delete by Target")}</h3>
      <Row>
        <Field>
          <label>{t("admin.filters.targetType", "Target Type")}</label>
          {targetTypeOptions.length ? (
            <select
              value={targetType}
              onChange={(e)=>{ setTargetType(e.target.value as ReactionTargetType | ""); setTargetId(""); }}
            >
              <option value="">{t("all", "All")}</option>
              {targetTypeOptions.map((o)=>(
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              value={targetType}
              onChange={(e)=>{ setTargetType(e.target.value as any); setTargetId(""); }}
              placeholder="menuitem / product / about ..."
            />
          )}
        </Field>
        <Field>
          <label>{t("admin.filters.targetId", "Target ID")}</label>
          {targetOptions.length ? (
            <select
              value={targetId}
              onChange={(e)=>setTargetId(e.target.value)}
              disabled={!targetType}
            >
              <option value="">{t("all", "All")}</option>
              {targetOptions.map((o)=>(
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              value={targetId}
              onChange={(e)=>setTargetId(e.target.value)}
              placeholder="5f0c9d... (ObjectId)"
            />
          )}
        </Field>
      </Row>
      <Actions>
        <DangerBtn type="submit" disabled={loading || !targetType || !targetId}>
          {t("admin.bulkDelete.submit", "Delete All Reactions for Target")}
        </DangerBtn>
      </Actions>
      <Hint>
        {t(
          "admin.bulkDelete.hint",
          "This will delete all reactions for the given target (all kinds and emojis)."
        )}
      </Hint>
    </Wrap>
  );
}

const Wrap = styled.div`
  border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  background:${({theme})=>theme.colors.backgroundSecondary};
  padding:${({theme})=>theme.spacings.lg};
`;
const Row = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.sm};
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;
const Field = styled.label`
  display:flex; flex-direction:column; gap:6px; font-size:${({theme})=>theme.fontSizes.sm};
  input, select { padding:8px 10px; border-radius:${({theme})=>theme.radii.md};
    border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
    background:${({theme})=>theme.colors.inputBackgroundLight};
  }
`;
const Actions = styled.div` margin-top:${({theme})=>theme.spacings.md}; `;
const DangerBtn = styled.button`
  background:${({theme})=>theme.colors.error};
  color:${({theme})=>theme.colors.error || "#fff"};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.error};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Hint = styled.p` margin-top:${({theme})=>theme.spacings.sm}; opacity:.8; `;

"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/opstemplates/locales";
import {
  clearOpsTemplateMsgs,
} from "@/modules/opstemplates/slice/opstemplatesSlice";
import type { IOperationTemplate } from "@/modules/opstemplates/types";
import { TemplateList, TemplateForm } from "@/modules/opstemplates";

export default function AdminOpsTemplatesPage() {
  const { t } = useI18nNamespace("opstemplates", translations);
  const dispatch = useAppDispatch();
  const { items, loading, error, success } = useAppSelector((s) => s.opstemplates);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IOperationTemplate | null>(null);

  useEffect(() => {
    if (success) toast.success(t(success));
    if (error) toast.error(error);
    if (success || error) dispatch(clearOpsTemplateMsgs());
  }, [success, error, dispatch, t]);

  const count = useMemo(() => items?.length ?? 0, [items]);

  return (
    <PageWrap>
      <Header>
        <h1>{t("title")}</h1>
        <Right>
          <Counter aria-label="templates-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => { setEditing(null); setShowForm(true); }}
            aria-label="new-template"
          >
            + {t("new")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card>
          <TemplateForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("list")}</h2>
          <SmallBtn disabled={loading}>
            {t("refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <TemplateList
            items={items || []}
            loading={loading}
            onEdit={(tpl) => { setEditing(tpl); setShowForm(true); }}
          />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const Right = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;`;
const Counter = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Section = styled.section`margin-top:${({theme})=>theme.spacings.xl};`;
const SectionHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.sm};
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;

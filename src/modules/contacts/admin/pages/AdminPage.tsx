"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/contacts/locales";
import {
  fetchAllContactsAdmin,
  clearContactMessages,
} from "@/modules/contacts/slice/contactsSlice";
import type { IContact } from "@/modules/contacts/types";
import { ContactList, ContactForm } from "@/modules/contacts";

export default function AdminContactsPage() {
  const { t } = useI18nNamespace("contacts", translations);
  const dispatch = useAppDispatch();
  const { contactsAdmin, loading, error, successMessage } = useAppSelector((s) => s.contacts);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IContact | null>(null);

  useEffect(() => { dispatch(fetchAllContactsAdmin()); }, [dispatch]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearContactMessages());
  }, [successMessage, error, dispatch]);

  const count = useMemo(() => contactsAdmin.length, [contactsAdmin]);

  return (
    <PageWrap>
      <Header>
        <h1>{t("title", "Contacts Admin")}</h1>
        <Right>
          <Counter aria-label={t("aria.totalCount","Total count")}>{count}</Counter>
          <PrimaryBtn
            type="button"
            onClick={() => { setEditing(null); setShowForm(true); }}
          >
            + {t("actions.new", "New Contact")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card>
          <ContactForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); dispatch(fetchAllContactsAdmin()); }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("sections.contacts", "Contacts")}</h2>
          <SmallBtn type="button" onClick={() => dispatch(fetchAllContactsAdmin())} disabled={loading}>
            {t("actions.refresh", "Refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <ContactList
            items={contactsAdmin}
            loading={loading}
            onEdit={(c) => { setEditing(c); setShowForm(true); }}
          />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (theme) ---- */
const PageWrap = styled.div`
  max-width:${({ theme }) => theme.layout.containerWidth};
  margin:0 auto;
  padding:${({ theme }) => theme.spacings.xl};
  ${({ theme }) => theme.media.mobile}{padding:${({ theme }) => theme.spacings.lg};}
`;
const Header = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile}{flex-direction:column;align-items:flex-start;gap:${({ theme }) => theme.spacings.sm};}
`;
const Right = styled.div`display:flex;gap:${({ theme }) => theme.spacings.sm};align-items:center;`;
const Counter = styled.span`
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};
  background:${({ theme }) => theme.colors.backgroundAlt};
  font-weight:${({ theme }) => theme.fontWeights.medium};
`;
const Section = styled.section`margin-top:${({ theme }) => theme.spacings.xl};`;
const SectionHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;
const Card = styled.div`
  background:${({ theme }) => theme.colors.cardBackground};
  border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  padding:${({ theme }) => theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding:8px 12px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
`;
const SmallBtn = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
`;

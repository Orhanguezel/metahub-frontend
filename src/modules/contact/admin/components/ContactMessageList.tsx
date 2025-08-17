// src/modules/contact/components/ContactMessageList.tsx
"use client";

import styled from "styled-components";
import type { IContactMessage } from "@/modules/contact/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

interface Props {
  messages: IContactMessage[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReload?: () => void;
  selectedId: string | null;
  search: string;
  setSearch: (val: string) => void;
  loading?: boolean;
}

export default function ContactMessageList({
  messages,
  onSelect,
  onDelete,
  onReload,
  selectedId,
  search,
  setSearch,
  loading,
}: Props) {
  const { t } = useI18nNamespace("contact", translations);

  const filtered = messages.filter((msg) => {
    const q = search.toLowerCase();
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.subject.toLowerCase().includes(q)
    );
  });

  return (
    <Wrap aria-busy={!!loading}>
      <TopBar>
        <SearchInput
          type="text"
          placeholder={t("admin.searchPlaceholder", "Ara (isim, e-posta, konu)")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Secondary onClick={onReload} disabled={loading}>
          {t("admin.reload", "Yenile")}
        </Secondary>
      </TopBar>

      <Table>
        <thead>
          <tr>
            <th>{t("admin.name", "Ad Soyad")}</th>
            <th>{t("admin.email", "E-Posta")}</th>
            <th>{t("admin.subject", "Konu")}</th>
            <th>{t("admin.isRead", "Okundu")}</th>
            <th>{t("admin.date", "Tarih")}</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <Empty>∅</Empty>
              </td>
            </tr>
          ) : (
            filtered.map((msg) => (
              <tr key={msg._id} className={msg._id === selectedId ? "selected" : ""}>
                <td data-label={t("admin.name", "Ad Soyad")}>{msg.name}</td>
                <td data-label={t("admin.email", "E-Posta")}>{msg.email}</td>
                <td data-label={t("admin.subject", "Konu")}>
                  <SubjectLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelect(msg._id);
                    }}
                    $selected={msg._id === selectedId}
                  >
                    {msg.subject}
                  </SubjectLink>
                </td>
                <td data-label={t("admin.isRead", "Okundu")}>
                  <Badge $on={msg.isRead}>{msg.isRead ? t("admin.yes", "Evet") : t("admin.no", "Hayır")}</Badge>
                </td>
                <td data-label={t("admin.date", "Tarih")}>{new Date(msg.createdAt).toLocaleString()}</td>
                <td className="actions">
                  <Danger onClick={() => onDelete(msg._id)}>{t("admin.delete", "Sil")}</Danger>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Wrap>
  );
}

/* styled — same pattern */
const Wrap = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const TopBar = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; align-items:center; flex-wrap:wrap;
  justify-content:flex-end;
`;
const SearchInput = styled.input`
  flex:1 1 260px;
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;
const Table = styled.table`
  width:100%; border-collapse:collapse;
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  overflow:hidden;

  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    padding:${({theme})=>theme.spacings.md}; text-align:left; white-space:nowrap;
    font-size:${({theme})=>theme.fontSizes.sm};
  }
  tbody td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};
    vertical-align:middle;
  }
  tbody tr.selected td{ background:${({theme})=>theme.colors.primaryLight}; }
  tbody tr:hover td{ background:${({theme})=>theme.colors.hoverBackground}; }
  td.actions{ text-align:right; }
`;
const SubjectLink = styled.a<{ $selected?: boolean }>`
  color:${({theme,$selected})=>$selected? theme.colors.primary : theme.colors.link};
  text-decoration:underline; cursor:pointer;
  font-weight:${({theme,$selected})=>$selected? theme.fontWeights.semiBold : theme.fontWeights.medium};
  &:hover{ color:${({theme})=>theme.colors.primaryHover}; }
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;
const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{
    background:${({theme})=>theme.colors.dangerHover};
    color:${({theme})=>theme.colors.textOnDanger};
    border-color:${({theme})=>theme.colors.dangerHover};
  }
`;
const Badge = styled.span<{ $on:boolean }>`
  display:inline-block; padding:.2em .6em; border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
const Empty = styled.div`
  display:flex; align-items:center; justify-content:center; width:100%; height:56px;
  color:${({theme})=>theme.colors.textSecondary};
`;

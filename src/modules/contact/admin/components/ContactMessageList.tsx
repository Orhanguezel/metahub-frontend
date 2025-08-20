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

  const T = {
    name: t("admin.name", "Ad Soyad"),
    email: t("admin.email", "E-Posta"),
    subject: t("admin.subject", "Konu"),
    isRead: t("admin.isRead", "Okundu"),
    date: t("admin.date", "Tarih"),
    actions: t("admin.actions", "İşlemler"),
    delete: t("admin.delete", "Sil"),
    yes: t("admin.yes", "Evet"),
    no: t("admin.no", "Hayır"),
    searchPh: t("admin.searchPlaceholder", "Ara (isim, e-posta, konu)"),
    reload: t("admin.reload", "Yenile"),
    empty: t("admin.empty", "Kayıt yok.")
  };

  return (
    <Wrap aria-busy={!!loading}>
      <TopBar>
        <SearchInput
          type="text"
          placeholder={T.searchPh}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={T.searchPh}
        />
        <Secondary onClick={onReload} disabled={loading}>
          {T.reload}
        </Secondary>
      </TopBar>

      {/* ======= DESKTOP (≥1441px): TABLE ======= */}
      <DesktopTableWrap role="region" aria-label="table-wrapper">
        <Table>
          <thead>
            <tr>
              <th>{T.name}</th>
              <th>{T.email}</th>
              <th>{T.subject}</th>
              <th>{T.isRead}</th>
              <th>{T.date}</th>
              <th aria-label={T.actions} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <Empty>∅ {T.empty}</Empty>
                </td>
              </tr>
            ) : (
              filtered.map((msg) => (
                <tr key={msg._id} className={msg._id === selectedId ? "selected" : ""}>
                  <td className="ellipsis" title={msg.name}>{msg.name}</td>
                  <td className="ellipsis" title={msg.email}>{msg.email}</td>
                  <td className="wrap">
                    <SubjectLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); onSelect(msg._id); }}
                      $selected={msg._id === selectedId}
                      title={msg.subject}
                    >
                      {msg.subject}
                    </SubjectLink>
                  </td>
                  <td>
                    <Badge $on={msg.isRead}>{msg.isRead ? T.yes : T.no}</Badge>
                  </td>
                  <td className="nowrap" title={new Date(msg.createdAt).toLocaleString()}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </td>
                  <td className="actions">
                    <Danger onClick={() => onDelete(msg._id)}>{T.delete}</Danger>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </DesktopTableWrap>

      {/* ======= MOBILE/TABLET/SMALL DESKTOP (≤1440px): CARDS ======= */}
      <CardList role="list" aria-label="cards">
        {filtered.length === 0 && <Empty>∅ {T.empty}</Empty>}

        {filtered.map((msg) => (
          <Card key={msg._id} role="listitem" $selected={msg._id === selectedId}>
            <CardRow>
              <Label>{T.name}</Label>
              <Value className="ellipsis" title={msg.name}>{msg.name}</Value>
            </CardRow>

            <CardRow>
              <Label>{T.email}</Label>
              <Value className="ellipsis" title={msg.email}>{msg.email}</Value>
            </CardRow>

            <CardRow>
              <Label>{T.subject}</Label>
              <Value className="wrap">
                <SubjectBtn
                  type="button"
                  onClick={() => onSelect(msg._id)}
                  aria-label={T.subject}
                >
                  {msg.subject}
                </SubjectBtn>
              </Value>
            </CardRow>

            <CardRow>
              <Label>{T.isRead}</Label>
              <Value><Badge $on={msg.isRead}>{msg.isRead ? T.yes : T.no}</Badge></Value>
            </CardRow>

            <CardRow>
              <Label>{T.date}</Label>
              <Value className="nowrap" title={new Date(msg.createdAt).toLocaleString()}>
                {new Date(msg.createdAt).toLocaleString()}
              </Value>
            </CardRow>

            <Actions>
              <Secondary type="button" onClick={() => onSelect(msg._id)}>{T.subject}</Secondary>
              <Danger type="button" onClick={() => onDelete(msg._id)}>{T.delete}</Danger>
            </Actions>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* ===== styled ===== */
const Wrap = styled.div`
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};
`;

/* Topbar */
const TopBar = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; align-items:center; flex-wrap:wrap;
  justify-content:flex-end;
`;
const SearchInput = styled.input`
  flex:1 1 260px;
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  &::placeholder{ color:${({theme})=>theme.colors.placeholder}; }
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;

/* Desktop table only ≥1441px */
const DesktopTableWrap = styled.div`
  display:block;
  @media (max-width:1440px){ display:none; }
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
  td.actions{ text-align:right; white-space:nowrap; }
  .ellipsis{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 420px; }
  .nowrap{ white-space:nowrap; }
  .wrap{ white-space:pre-wrap; word-break:break-word; overflow-wrap:anywhere; }
  tbody tr.selected td{ background:${({theme})=>theme.colors.primaryLight}; }
  tbody tr:hover td{ background:${({theme})=>theme.colors.hoverBackground}; }
`;

/* Cards only ≤1440px */
const CardList = styled.div`
  display:none;
  @media (max-width:1440px){
    display:grid;
    gap:${({theme})=>theme.spacings.sm};
  }
`;
const Card = styled.div<{ $selected?: boolean }>`
  background:${({theme})=>theme.colors.sectionBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.md};
  box-shadow:${({theme})=>theme.shadows.xs};
  outline:${({$selected,theme})=>$selected? `${theme.borders.thin} ${theme.colors.primary}` : "none"};
`;
const CardRow = styled.div`
  display:grid;
  grid-template-columns: clamp(100px, 32%, 180px) 1fr;
  gap:${({theme})=>theme.spacings.sm};
  padding:6px 0;
  &:not(:last-child){
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  }
`;
const Label = styled.span`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
const Value = styled.span`
  font-size:${({theme})=>theme.fontSizes.sm};
  &.ellipsis{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  &.nowrap{ white-space:nowrap; }
  &.wrap{ white-space:pre-wrap; word-break:break-word; overflow-wrap:anywhere; }
`;
const Actions = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.xs};
  margin-top:${({theme})=>theme.spacings.sm};
  flex-wrap:wrap;
  & > * { flex: 1 1 auto; }
`;

/* Buttons & badges */
const SubjectLink = styled.a<{ $selected?: boolean }>`
  color:${({theme,$selected})=>$selected? theme.colors.primary : theme.colors.link};
  text-decoration:underline; cursor:pointer;
  font-weight:${({theme,$selected})=>$selected? theme.fontWeights.semiBold : theme.fontWeights.medium};
  &:hover{ color:${({theme})=>theme.colors.primaryHover}; }
`;
const SubjectBtn = styled.button`
  background:none; border:none; padding:0; margin:0; cursor:pointer;
  color:${({theme})=>theme.colors.link};
  text-decoration:underline;
  &:hover{ color:${({theme})=>theme.colors.primaryHover}; }
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
  &:disabled{ opacity:.6; cursor:not-allowed; }
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

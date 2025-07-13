"use client";
import styled from "styled-components";
import { IContactMessage } from "@/modules/contact/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

interface Props {
  messages: IContactMessage[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
  search: string;
  setSearch: (val: string) => void;
}

export default function ContactMessageList({ messages, onSelect, onDelete, selectedId, search, setSearch }: Props) {
  const { t } = useI18nNamespace("contact", translations);

  const filtered = messages.filter(msg =>
    msg.name.toLowerCase().includes(search.toLowerCase()) ||
    msg.email.toLowerCase().includes(search.toLowerCase()) ||
    msg.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar>
        <SearchInput
          type="text"
          placeholder={t("admin.searchPlaceholder", "Ara (isim, e-posta, konu)")}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <ReloadBtn onClick={() => window.location.reload()}>
          {t("admin.reload", "Yenile")}
        </ReloadBtn>
      </TopBar>
      <Table>
        <thead>
          <tr>
            <th>{t("admin.name", "Ad Soyad")}</th>
            <th>{t("admin.email", "E-Posta")}</th>
            <th>{t("admin.subject", "Konu")}</th>
            <th>{t("admin.isRead", "Okundu")}</th>
            <th>{t("admin.date", "Tarih")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((msg) => (
            <tr key={msg._id} style={{ background: msg._id === selectedId ? "#f5f6fa" : "inherit" }}>
              <td>{msg.name}</td>
              <td>{msg.email}</td>
              <td>
                <a href="#" onClick={e => {e.preventDefault(); onSelect(msg._id);}}>
                  {msg.subject}
                </a>
              </td>
              <td>{msg.isRead ? t("admin.yes", "Evet") : t("admin.no", "Hayır")}</td>
              <td>{new Date(msg.createdAt).toLocaleString()}</td>
              <td>
                <DeleteBtn onClick={() => onDelete(msg._id)}>
                  {t("admin.delete", "Sil")}
                </DeleteBtn>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {filtered.length === 0 && <NoResult>{t("admin.noResults", "Sonuç bulunamadı.")}</NoResult>}
    </div>
  );
}

// Styled components aynı kalabilir.
const TopBar = styled.div`
  display: flex; gap: 10px; margin-bottom: 12px; align-items: center;
`;
const SearchInput = styled.input`
  padding: 7px 12px; font-size: 1rem; border-radius: 6px; border: 1px solid #ddd;
`;
const ReloadBtn = styled.button`
  background: #e9e9e9; border-radius: 6px; border: none; padding: 8px 16px; font-size: 1rem; cursor: pointer;
`;
const Table = styled.table`
  width: 100%; border-collapse: collapse; th, td { padding: 8px; border-bottom: 1px solid #eee; }
  a { color: #5c6bc0; cursor: pointer; }
`;
const DeleteBtn = styled.button`
  color: #fff; background: #ff5555; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;
`;
const NoResult = styled.div`
  padding: 30px 0; text-align: center; color: #bbb; font-style: italic;
`;

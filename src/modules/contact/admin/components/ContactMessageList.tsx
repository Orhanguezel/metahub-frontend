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

export default function ContactMessageList({
  messages,
  onSelect,
  onDelete,
  selectedId,
  search,
  setSearch,
}: Props) {
  const { t } = useI18nNamespace("contact", translations);

  const filtered = messages.filter((msg) =>
    msg.name.toLowerCase().includes(search.toLowerCase()) ||
    msg.email.toLowerCase().includes(search.toLowerCase()) ||
    msg.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ListWrapper>
      <TopBar>
        <SearchInput
          type="text"
          placeholder={t("admin.searchPlaceholder", "Ara (isim, e-posta, konu)")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ReloadBtn onClick={() => window.location.reload()}>
          {t("admin.reload", "Yenile")}
        </ReloadBtn>
      </TopBar>

      {/* Responsive: Table on desktop, Cards on mobile */}
      <ResponsiveTable>
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
                {msg.isRead ? t("admin.yes", "Evet") : t("admin.no", "Hayır")}
              </td>
              <td data-label={t("admin.date", "Tarih")}>
                {new Date(msg.createdAt).toLocaleString()}
              </td>
              <td>
                <DeleteBtn onClick={() => onDelete(msg._id)}>
                  {t("admin.delete", "Sil")}
                </DeleteBtn>
              </td>
            </tr>
          ))}
        </tbody>
      </ResponsiveTable>
      {filtered.length === 0 && <NoResult>{t("admin.noResults", "Sonuç bulunamadı.")}</NoResult>}
    </ListWrapper>
  );
}

// --- Styled Components ---

const ListWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: none;
    background: transparent;
  }
`;

const TopBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  align-items: center;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.xs};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  transition: border ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    outline: none;
  }
`;

const ReloadBtn = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: background ${({ theme }) => theme.transition.fast};
  box-shadow: ${({ theme }) => theme.shadows.xs};

  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
  }
`;

const ResponsiveTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.base};

  th, td {
    padding: ${({ theme }) => theme.spacings.sm};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    text-align: left;
    vertical-align: middle;
    background: inherit;
    word-break: break-word;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacing: 0.01em;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr.selected {
    background: ${({ theme }) => theme.colors.primaryTransparent};
  }

  /* RESPONSIVE */
  ${({ theme }) => theme.media.small} {
    display: block;
    width: 100%;
    th {
      display: none;
    }
    tr {
      display: block;
      margin-bottom: ${({ theme }) => theme.spacings.md};
      background: ${({ theme }) => theme.colors.cardBackground};
      border-radius: ${({ theme }) => theme.radii.sm};
      box-shadow: ${({ theme }) => theme.shadows.xs};
    }
    td {
      display: flex;
      align-items: center;
      width: 100%;
      border: none;
      padding: ${({ theme }) => theme.spacings.sm} 0;
      font-size: ${({ theme }) => theme.fontSizes.xsmall};
      border-bottom: none;

      &:before {
        content: attr(data-label) ": ";
        font-weight: ${({ theme }) => theme.fontWeights.semiBold};
        min-width: 110px;
        color: ${({ theme }) => theme.colors.textMuted};
        flex-shrink: 0;
        margin-right: ${({ theme }) => theme.spacings.xs};
        font-size: ${({ theme }) => theme.fontSizes.xs};
      }
    }
    td:last-child {
      justify-content: flex-end;
    }
  }
`;

const SubjectLink = styled.a<{ $selected?: boolean }>`
  color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.link};
  text-decoration: underline;
  font-weight: ${({ $selected, theme }) => $selected ? theme.fontWeights.bold : theme.fontWeights.medium};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const DeleteBtn = styled.button`
  color: ${({ theme }) => theme.colors.buttonText};
  background: ${({ theme }) => theme.colors.danger};
  border: none;
  padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
  }
`;

const NoResult = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-style: italic;

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
  }
`;

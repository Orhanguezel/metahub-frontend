"use client";

import { useEffect, useMemo, useState, } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createLibrary,
  updateLibrary,
  deleteLibrary,
  togglePublishLibrary,
  clearLibraryMessages,
} from "@/modules/library/slice/librarySlice";
import {
  createLibraryCategory,
  updateLibraryCategory,
  clearLibraryCategoryMessages,
} from "@/modules/library/slice/libraryCategorySlice";
import { FormModal, CategoryForm, CategoryListPage } from "@/modules/library";
import { Modal } from "@/shared";
import type { ILibrary, LibraryCategory } from "@/modules/library/types";
import type { SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

/* --- helpers --- */
const fmtDateTime = (v?: string | Date) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.valueOf()) ? "-" : d.toLocaleString();
};

const titleOf = (item: ILibrary, lang: SupportedLocale) => {
  const tl = item.title || {};
  return (tl as any)[lang] || Object.values(tl)[0] || "—";
};
const categoryOf = (item: ILibrary, lang: SupportedLocale) =>
  typeof item.category === "string"
    ? item.category
    : item.category?.name?.[lang] ||
      item.category?.name?.en ||
      Object.values(item.category?.name || {})[0] ||
      "—";

export default function AdminLibraryPage() {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  const dispatch = useAppDispatch();

  const library = useAppSelector((s) => s.library.libraryAdmin);
  const loading = useAppSelector((s) => s.library.loading);
  const error = useAppSelector((s) => s.library.error);
  const successMessage = useAppSelector((s) => s.library.successMessage);

  const catSuccess = useAppSelector((s) => s.libraryCategory.successMessage);
  const catError = useAppSelector((s) => s.libraryCategory.error);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ILibrary | null>(null); // önizleme modalı
  const [editingItem, setEditingItem] = useState<ILibrary | null>(null); // form modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LibraryCategory | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

  // toasts
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearLibraryMessages());
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    if (catSuccess) toast.success(catSuccess);
    if (catError) toast.error(catError);
    if (catSuccess || catError) dispatch(clearLibraryCategoryMessages());
  }, [catSuccess, catError, dispatch]);


  const openCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };
  const openEdit = (item: ILibrary) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) await dispatch(updateLibrary({ id, formData }));
    else await dispatch(createLibrary(formData));
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete_library", "Bu makaleyi silmek istiyor musunuz?");
    if (confirm(confirmMsg)) {
      await dispatch(deleteLibrary(id));
      setSelected((curr) => (curr?._id === id ? null : curr));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishLibrary({ id, isPublished: !isPublished }));
  };

  const handleCategorySubmit = async (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => {
    if (id) await dispatch(updateLibraryCategory({ id, data }));
    else await dispatch(createLibraryCategory(data));
    setEditingCategory(null);
    setCategoryFormOpen(false);
  };

  // filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (library || []).filter((item) => {
      const ttl = titleOf(item, lang).toLowerCase();
      const cat = categoryOf(item, lang).toLowerCase();
      const auth = (item.author || "").toLowerCase();
      const tagStr = (item.tags || []).join(" ").toLowerCase();
      return [ttl, cat, auth, tagStr].some((f) => f.includes(q));
    });
  }, [library, search, lang]);

  return (
    <PageWrap>
      {/* Header */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Kütüphane İçerikleri")}</h1>
          <Subtitle>{t("admin.subtitle", "İçerikleri listeleyin, düzenleyin ve yönetin")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="library-count">{library.length ?? 0}</Counter>
          <Secondary onClick={() => setCategoryModalOpen(true)}>
            {t("admin.categories", "Kategoriler")}
          </Secondary>
          <PrimaryBtn onClick={openCreate}>{t("admin.new", "Yeni İçerik")}</PrimaryBtn>
          <PrimaryBtn disabled={loading}>
            {t("admin.refresh", "Yenile")}
          </PrimaryBtn>
        </Right>
      </Header>

      {/* Search bar */}
      <Toolbar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.search", "Arama (başlık, kategori, yazar, etiket)...")}
          aria-label={t("admin.search", "Arama...")}
        />
      </Toolbar>

      {/* Desktop Table */}
      <TableWrap aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th>{t("admin.titleCol", "Başlık")}</th>
              <th>{t("admin.category", "Kategori")}</th>
              <th>{t("admin.author", "Yazar")}</th>
              <th>{t("admin.published", "Yayın")}</th>
              <th>{t("admin.updated", "Güncellendi")}</th>
              <th aria-label={t("admin.actions", "İşlemler")} />
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <Empty>∅</Empty>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id}>
                  <td>
                    <SubjectLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelected(item);
                      }}
                    >
                      {titleOf(item, lang)}
                    </SubjectLink>
                  </td>
                  <td>{categoryOf(item, lang)}</td>
                  <td>{item.author || "—"}</td>
                  <td>
                    {item.isPublished ? (
                      <Badge $on>{t("yes", "Evet")}</Badge>
                    ) : (
                      <Badge>{t("no", "Hayır")}</Badge>
                    )}
                  </td>
                  <td>{fmtDateTime(item.updatedAt || item.createdAt)}</td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => handleTogglePublish(item._id, item.isPublished)}>
                        {item.isPublished ? t("library.unpublish", "Yayından Kaldır") : t("library.publish", "Yayınla")}
                      </Secondary>
                      <Primary onClick={() => openEdit(item)}>{t("edit", "Düzenle")}</Primary>
                      <Danger onClick={() => handleDelete(item._id)}>{t("delete", "Sil")}</Danger>
                    </Row>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile Cards */}
      <CardsWrap aria-busy={!!loading}>
        {filtered.length === 0 && !loading && <Empty>∅</Empty>}
        {filtered.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <HeaderLeft>
                <NameTitle title={titleOf(item, lang)}>{titleOf(item, lang)}</NameTitle>
                <SmallText>{categoryOf(item, lang)}</SmallText>
              </HeaderLeft>
              <Status $on={item.isPublished}>
                {item.isPublished ? t("yes", "Evet") : t("no", "Hayır")}
              </Status>
            </CardHeader>

            <CardBody>
              <SmallText>
                <b>{t("admin.author", "Yazar")}:</b> {item.author || "—"}
              </SmallText>
              <SmallText>
                <b>{t("admin.updated", "Güncellendi")}:</b> {fmtDateTime(item.updatedAt || item.createdAt)}
              </SmallText>
              {item.tags?.length ? (
                <SmallText>
                  <b>{t("admin.tags", "Etiketler")}:</b> {item.tags.join(", ")}
                </SmallText>
              ) : null}
            </CardBody>

            <CardActions>
              <Secondary onClick={() => handleTogglePublish(item._id, item.isPublished)}>
                {item.isPublished ? t("library.unpublish", "Kaldır") : t("library.publish", "Yayınla")}
              </Secondary>
              <Primary onClick={() => openEdit(item)}>{t("edit", "Düzenle")}</Primary>
              <Danger onClick={() => handleDelete(item._id)}>{t("delete", "Sil")}</Danger>
              <Primary onClick={() => setSelected(item)}>{t("admin.view", "Görüntüle")}</Primary>
            </CardActions>
          </Card>
        ))}
      </CardsWrap>

      {/* Preview Modal */}
      {selected && (
        <ModalOverlay onClick={() => setSelected(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseX onClick={() => setSelected(null)}>×</CloseX>
            <h2 style={{ marginTop: 0 }}>{titleOf(selected, lang)}</h2>
            <p>
              <b>{t("admin.category", "Kategori")}:</b> {categoryOf(selected, lang)}
            </p>
            <p>
              <b>{t("admin.author", "Yazar")}:</b> {selected.author || "—"}
            </p>
            {selected.summary && (
              <p>
                <b>{t("admin.summary", "Özet")}:</b>{" "}
                {(selected.summary as any)[lang] || Object.values(selected.summary || {})[0] || "—"}
              </p>
            )}
            {Array.isArray(selected.files) && selected.files.length > 0 && (
              <p>
                <b>PDF:</b>{" "}
                <a href={selected.files[0].url} target="_blank" rel="noopener noreferrer">
                  {selected.files[0].name || "PDF"}
                </a>
              </p>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Form Modal (Create / Edit) */}
      {isFormOpen && (
        <FormModal
          isOpen
          onClose={() => setIsFormOpen(false)}
          editingItem={editingItem}
          onSubmit={handleSubmit}
        />
      )}

      {/* Categories Modal + inner form */}
      {categoryModalOpen && (
        <Modal isOpen onClose={() => setCategoryModalOpen(false)}>
          <CategoryListPage
            onAdd={() => {
              setEditingCategory(null);
              setCategoryFormOpen(true);
            }}
            onEdit={(cat) => {
              setEditingCategory(cat);
              setCategoryFormOpen(true);
            }}
          />
          <Modal isOpen={categoryFormOpen} onClose={() => setCategoryFormOpen(false)}>
            <CategoryForm
              isOpen={categoryFormOpen}
              onClose={() => setCategoryFormOpen(false)}
              editingItem={editingCategory}
              onSubmit={handleCategorySubmit}
            />
          </Modal>
        </Modal>
      )}
    </PageWrap>
  );
}

/* ---------------- styled (classicTheme) ---------------- */

const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction:column; align-items:flex-start; gap:${({ theme }) => theme.spacings.sm};
  }
`;
const TitleBlock = styled.div`display:flex; flex-direction:column; gap:4px; h1{ margin:0; }`;
const Subtitle = styled.p`
  margin:0; color:${({ theme }) => theme.colors.textSecondary};
  font-size:${({ theme }) => theme.fontSizes.sm};
`;
const Right = styled.div`display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center; flex-wrap:wrap;`;
const Counter = styled.span`
  padding:6px 10px; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ theme }) => theme.colors.backgroundAlt};
  font-weight:${({ theme }) => theme.fontWeights.medium};
`;

const Toolbar = styled.div`
  display:flex; gap:${({ theme }) => theme.spacings.sm}; justify-content:flex-end;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;

const SearchInput = styled.input`
  font-size:${({ theme }) => theme.fontSizes.sm};
  padding:10px 12px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.md};
  min-width:260px;
  background:${({ theme }) => theme.inputs.background};
  color:${({ theme }) => theme.inputs.text};
  &::placeholder{ color:${({ theme }) => theme.inputs.placeholder}; }
`;

const PrimaryBtn = styled.button`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} transparent;
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer;
  transition:opacity ${({ theme }) => theme.transition.normal};
  &:hover{ opacity:${({ theme }) => theme.opacity.hover}; background:${({ theme }) => theme.buttons.primary.backgroundHover}; }
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
`;

const TableWrap = styled.div`
  width:100%; overflow-x:auto; border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  background:${({ theme }) => theme.colors.cardBackground};
  ${({ theme }) => theme.media.mobile}{ display:none; }
`;
const Table = styled.table`
  width:100%; border-collapse:collapse;
  thead th{
    background:${({ theme }) => theme.colors.tableHeader};
    color:${({ theme }) => theme.colors.textSecondary};
    font-weight:${({ theme }) => theme.fontWeights.semiBold};
    font-size:${({ theme }) => theme.fontSizes.sm};
    padding:${({ theme }) => theme.spacings.md}; text-align:left; white-space:nowrap;
  }
  td{
    padding:${({ theme }) => theme.spacings.md};
    border-bottom:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size:${({ theme }) => theme.fontSizes.sm}; vertical-align:middle;
  }
  td.actions{ text-align:right; }
  tbody tr:hover td{ background:${({ theme }) => theme.colors.hoverBackground}; }
`;
const SubjectLink = styled.a`
  color:${({ theme }) => theme.colors.link};
  &:hover{ color:${({ theme }) => theme.colors.linkHover}; text-decoration:underline; }
`;

const CardsWrap = styled.div`
  display:none;
  ${({ theme }) => theme.media.mobile} {
    display:grid; grid-template-columns:1fr; gap:${({ theme }) => theme.spacings.md};
  }
`;
const Card = styled.article`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  overflow:hidden;
`;
const CardHeader = styled.header`
  background:${({ theme }) => theme.colors.primaryLight};
  color:${({ theme }) => theme.colors.title};
  padding:${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  display:flex; align-items:center; justify-content:space-between; gap:${({ theme }) => theme.spacings.sm};
  border-bottom:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;
const HeaderLeft = styled.div`display:flex; flex-direction:column; gap:2px; min-width:0;`;
const NameTitle = styled.span`
  font-size:${({ theme }) => theme.fontSizes.sm};
  color:${({ theme }) => theme.colors.textSecondary};
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70vw;
`;
const SmallText = styled.span`font-size:${({ theme }) => theme.fontSizes.xsmall}; color:${({ theme }) => theme.colors.textSecondary};`;
const Status = styled.span<{ $on:boolean }>`
  padding:.2em .6em; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.inputBackgroundLight)};
  color:${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textSecondary)};
  font-size:${({ theme }) => theme.fontSizes.xsmall};
`;
const CardBody = styled.div`padding:${({ theme }) => theme.spacings.md}; display:flex; flex-direction:column; gap:6px;`;
const CardActions = styled.div`
  display:flex; gap:${({ theme }) => theme.spacings.xs}; justify-content:flex-end;
  padding:${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.md};
  border-top:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;

const Row = styled.div`display:flex; gap:${({ theme }) => theme.spacings.xs}; flex-wrap:wrap; justify-content:flex-end;`;

const BaseBtn = styled.button`
  padding:8px 10px; border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} transparent; cursor:pointer;
  font-weight:${({ theme }) => theme.fontWeights.medium};
  box-shadow:${({ theme }) => theme.shadows.button};
  transition:opacity ${({ theme }) => theme.transition.normal};
  &:hover:not(:disabled){ opacity:${({ theme }) => theme.opacity.hover}; }
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
`;
const Secondary = styled(BaseBtn)`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  &:hover:not(:disabled){
    background:${({ theme }) => theme.buttons.secondary.backgroundHover};
    color:${({ theme }) => theme.buttons.secondary.textHover};
  }
`;
const Primary = styled(BaseBtn)`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  &:hover:not(:disabled){ background:${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;
const Danger = styled(BaseBtn)`
  background:${({ theme }) => theme.buttons.danger.background};
  color:${({ theme }) => theme.buttons.danger.text};
  &:hover:not(:disabled){ background:${({ theme }) => theme.buttons.danger.backgroundHover}; }
`;
const Badge = styled.span<{ $on?: boolean }>`
  display:inline-block; padding:.2em .6em; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.warningBackground)};
  color:${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textOnWarning)};
  font-size:${({ theme }) => theme.fontSizes.xsmall};
`;

const Empty = styled.div`
  display:flex; align-items:center; justify-content:center; width:100%; height:100%;
  color:${({ theme }) => theme.colors.textSecondary};
`;

/* Modal */
const ModalOverlay = styled.div`
  position:fixed; inset:0; background:${({ theme }) => theme.colors.overlayBackground};
  z-index:${({ theme }) => theme.zIndex.modal}; display:flex; justify-content:center; align-items:flex-start;
`;
const ModalContent = styled.div`
  width:520px; background:${({ theme }) => theme.colors.cardBackground};
  border-radius:${({ theme }) => theme.radii.xl}; margin:${({ theme }) => theme.spacings.xl} 0 0 0;
  padding:${({ theme }) => theme.spacings.lg}; box-shadow:${({ theme }) => theme.shadows.lg};
  position:relative; display:flex; flex-direction:column; min-height:320px; font-size:${({ theme }) => theme.fontSizes.md};
  ${({ theme }) => theme.media.mobile}{ width:90vw; }
`;
const CloseX = styled.button`
  position:absolute; top:12px; right:18px; font-size:${({ theme }) => theme.fontSizes.large};
  background:none; border:none; color:${({ theme }) => theme.colors.textSecondary};
  cursor:pointer; &:hover{ color:${({ theme }) => theme.colors.darkGrey}; }
`;

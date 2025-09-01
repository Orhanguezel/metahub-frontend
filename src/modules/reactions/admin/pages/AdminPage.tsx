"use client";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/reactions/locales";
import {
  adminListReactions,
  adminDeleteReaction,
  adminDeleteReactionsByFilter,
  clearReactionsMessages,
} from "@/modules/reactions/slice";
import type { ReactionTargetType } from "@/modules/reactions/types";
import { ReactionsFilters, ReactionsTable, BulkDeleteCard } from "@/modules/reactions";

/** Admin sayfası – About admin şablonuna uyumlu */
export default function AdminReactionsPage() {
  const { t } = useI18nNamespace("reactions", translations);
  const dispatch = useAppDispatch();

  const list = useAppSelector((s) => s.reactions.adminList);
  const loading = useAppSelector((s) => s.reactions.loading);
  const error = useAppSelector((s) => s.reactions.error);
  const success = useAppSelector((s) => s.reactions.successMessage);

  /** i18n wrapper: alt bileşenlerin beklediği `(k, d?) => string` imzası */
  const tl = useMemo(() => {
    return (k: string, d?: string) => t(k, { defaultValue: d });
  }, [t]);

  /** Filtre state — başlangıçta boş alan göndermeyelim */
  const [activeTab, setActiveTab] = useState<"list" | "bulkDelete">("list");
  const [filters, setFilters] = useState<{
    user?: string;
    targetType?: ReactionTargetType;
    targetId?: string;
    kind?: "LIKE" | "FAVORITE" | "BOOKMARK" | "EMOJI" | "RATING" | "";
    emoji?: string;
    value?: number | "";
    isActive?: boolean | "";
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 50,
  });

  const count = useMemo(() => list?.length ?? 0, [list]);

  /** Boş/undefined alanları uçur */
  const cleanParams = (obj: typeof filters) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v != null));

  /** İlk yükleme */
  useEffect(() => {
    dispatch(adminListReactions(cleanParams(filters) as any));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => dispatch(adminListReactions(cleanParams(filters) as any));
  const resetMessages = () => dispatch(clearReactionsMessages());

  const onDelete = async (id: string) => {
    const ok = confirm(t("admin.confirm_delete", { defaultValue: "Bu tepki kaydını silmek istiyor musunuz?" }));
    if (!ok) return;
    await dispatch(adminDeleteReaction(id) as any);
    refresh();
  };

  const onSearch = async (f: typeof filters) => {
    setFilters(f);
    await dispatch(adminListReactions(cleanParams(f) as any));
  };

  const onBulkDelete = async (p: { targetType: ReactionTargetType; targetId: string }) => {
    const ok = confirm(t("admin.confirm_bulk_delete", { defaultValue: "Bu hedef için tüm tepkileri silmek istiyor musunuz?" }));
    if (!ok) return;
    await dispatch(adminDeleteReactionsByFilter(p) as any);
    refresh();
  };

  /* ---------- Dropdown seçenekleri ---------- */

  // Hedef tipi sabitleri (union’dan alınanlar)
  const TARGET_TYPES = useMemo(
    () =>
      ([
        "menuitem",
        "product",
        "about",
        "post",
        "comment",
        "category",
      ] as ReactionTargetType[]),
    []
  );

  // Kullanıcı seçenekleri (listeden benzersiz çıkarılıyor)
  const userOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of list || []) {
      // r.user string ya da { _id, name?, email? } olabilir
      let id = "";
      let label = "";
      if (r && r.user && typeof r.user === "object") {
        const u = r.user as any;
        id = String(u._id || "");
        label = String(u.name || u.fullName || u.email || u.username || u._id || "");
      } else if (r?.user) {
        id = String(r.user);
        label = id;
      }
      if (id && !map.has(id)) map.set(id, label || id);
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [list]);

  // Seçilen targetType'a göre hedef seçenekleri
  const targetOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of list || []) {
      if (filters.targetType && r.targetType !== filters.targetType) continue;
      const tid = String(r.targetId);
      const label =
        // varsa extra içinden ad/title tercih et
        (r as any).targetName ||
        (r.extra && (r.extra as any).title) ||
        (r.extra && (r.extra as any).name) ||
        tid;
      if (tid && !map.has(tid)) map.set(tid, String(label));
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [list, filters.targetType]);

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", { defaultValue: "Reactions" })}</h1>
          <Subtitle>{t("admin.subtitle", { defaultValue: "List, search and clean up user reactions" })}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="reactions-count">{count}</Counter>
          <PrimaryBtn onClick={refresh} disabled={loading}>
            {t("refresh", { defaultValue: "Refresh" })}
          </PrimaryBtn>
        </Right>
      </Header>

      <Tabs>
        <Tab $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("list", { defaultValue: "List" })}
        </Tab>
        <Tab $active={activeTab === "bulkDelete"} onClick={() => setActiveTab("bulkDelete")}>
          {t("admin.bulkDeleteTab", { defaultValue: "Bulk Delete" })}
        </Tab>
      </Tabs>

      <Section>
        <SectionHead>
          <h2>
            {activeTab === "list" && t("list", { defaultValue: "List" })}
            {activeTab === "bulkDelete" && t("admin.bulkDeleteTab", { defaultValue: "Bulk Delete" })}
          </h2>
          <SmallBtn onClick={resetMessages} disabled={loading}>
            {t("clearMessages", { defaultValue: "Clear messages" })}
          </SmallBtn>
        </SectionHead>

        {success && <Notice role="status">{success}</Notice>}
        {error && <Error role="alert">{error}</Error>}

        <Card>
          {activeTab === "list" && (
            <>
              <ReactionsFilters
                initial={filters}
                onSearch={onSearch}
                t={tl}
                loading={loading}
                // yeni: dropdown verileri
                userOptions={userOptions}
                targetTypeOptions={[{ value: "", label: tl("all", "Tümü") }, ...TARGET_TYPES.map((v) => ({ value: v, label: v }))]}
                targetOptions={[{ value: "", label: tl("all", "Tümü") }, ...targetOptions]}
              />
              <Spacer />
              <ReactionsTable
                items={list}
                loading={loading}
                t={tl}
                onDelete={onDelete}
              />
            </>
          )}

          {activeTab === "bulkDelete" && (
            <BulkDeleteCard
              t={tl}
              onBulkDelete={onBulkDelete}
              loading={loading}
              // yeni: bulk delete de dropdown kullanır
              targetTypeOptions={[...TARGET_TYPES.map((v) => ({ value: v, label: v }))]}
              targetOptions={targetOptions}
            />
          )}
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (About admin ile uyumlu) ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const TitleBlock = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h1{ margin:0; }
`;
const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Right = styled.div`display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center;`;
const Counter = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Tabs = styled.div`display:flex; gap:${({ theme }) => theme.spacings.xs}; margin-bottom:${({ theme }) => theme.spacings.md};`;
const Tab = styled.button<{ $active?: boolean }>`
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color:${({ theme }) => theme.colors.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor:pointer;
`;
const Section = styled.section`margin-top: ${({ theme }) => theme.spacings.sm};`;
const SectionHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
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
const Notice = styled.div`
  margin-bottom:${({theme})=>theme.spacings.sm};
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.backgroundSecondary};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const Error = styled(Notice)` background:${({theme})=>theme.colors.error}; border-color:${({theme})=>theme.colors.error}; `;
const Spacer = styled.div` height:${({theme})=>theme.spacings.md}; `;

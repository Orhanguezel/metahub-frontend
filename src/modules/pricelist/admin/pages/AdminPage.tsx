// src/modules/pricelist/ui/pages/AdminPriceListsPage.tsx
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import styled, { css } from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearPriceListMsgs, setSelectedPriceList } from "@/modules/pricelist/slice/pricelistSlice";
import type { IPriceList, TranslatedLabel } from "@/modules/pricelist/types";
import { PriceListList, PriceListForm, PriceListDetail } from "@/modules/pricelist";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/pricelist";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

export default function AdminPriceListsPage() {
  const dispatch = useAppDispatch();
  const { items, selected, loading, error, success } = useAppSelector(s => s.pricelists);
  const { t, i18n } = useI18nNamespace("pricelist", translations);

  // UI dili → SupportedLocale olarak daralt
  const getUiLocale = useCallback((): SupportedLocale => {
    const raw = i18n.language || "en";
    return (SUPPORTED_LOCALES.find(l => raw.startsWith(l)) ?? "en") as SupportedLocale;
  }, [i18n.language]);

  // t çıktısını daima string’e çevir (objeyse locale map → aktif dile indirger)
  const T = useCallback((key: string, fallback: string, params?: any) => {
    const v = t(key, fallback as any, params);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const lang = getUiLocale();
      const tl = v as TranslatedLabel;
      return tl[lang] ?? tl.en ?? tl.tr ?? fallback;
    }
    return String(v ?? fallback);
  }, [t, getUiLocale]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IPriceList | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (success) toast.success(success);      // slice düz string gönderiyor
    if (error) toast.error(error);
    if (success || error) dispatch(clearPriceListMsgs());
  }, [success, error, dispatch]);

  useEffect(() => { setShowDetail(!!selected?._id); }, [selected]);

  const nf = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language]);
  const count = useMemo(() => items?.length ?? 0, [items]);

  return (
    <PageWrap>
      <Header>
        <Title>{T("page.title", "Price Lists")}</Title>
        <Right>
          <Counter aria-label={T("page.countAria", "Total price lists")}>
            {T("page.countLabel", "Count")}: {nf.format(count)}
          </Counter>
          <PrimaryBtn
            onClick={() => { setEditing(null); setShowForm(true); }}
            aria-label={T("actions.newList", "New Price List")}
            disabled={loading}
          >
            + {T("actions.newList", "New Price List")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card role="region" aria-label={T("form.regionLabel", "Create or edit price list")}>
          <PriceListForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{T("sections.allLists", "All Lists")}</h2>
          {/* Parent toplu fetch ediyor; burada tetik yok */}
          <SmallBtn disabled aria-label={T("actions.refresh", "Refresh")}>
            {loading ? T("common.loading", "Loading...") : T("actions.refresh", "Refresh")}
          </SmallBtn>
        </SectionHead>

        <Card>
          <PriceListList
            items={items || []}
            loading={loading}
            onEdit={(pl) => { setEditing(pl); setShowForm(true); }}
          />
        </Card>
      </Section>

      {showDetail && selected && (
        <Section>
          <SectionHead>
            <h2>{T("sections.itemsOf", "Items of {{code}}", { code: selected.code })}</h2>
            <SmallBtn
              onClick={() => dispatch(setSelectedPriceList(null))}
              aria-label={T("actions.hide", "Hide")}
            >
              {T("actions.hide", "Hide")}
            </SmallBtn>
          </SectionHead>

          <PriceListDetail
            listId={selected._id}
            onClose={() => dispatch(setSelectedPriceList(null))}
          />
        </Section>
      )}
    </PageWrap>
  );
}

/* styled (değişmedi) */
const Title = styled.h1`margin:0;`;
const PageWrap = styled.div`
  max-width:${({theme})=>theme.layout.containerWidth};
  margin:0 auto;
  padding:${({theme})=>theme.spacings.xl};
`;
const Header = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.lg};
  ${({theme})=>theme.media.mobile}{flex-direction:column;align-items:flex-start;gap:${({theme})=>theme.spacings.sm};}
`;
const Right = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;flex-wrap:wrap;`;
const Counter = styled.span`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.backgroundAlt};
  font-weight:${({theme})=>theme.fontWeights.medium};
`;
const Section = styled.section`
  margin-top:${({theme})=>theme.spacings.xl};
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;
const SectionHead = styled.div`display:flex;align-items:center;justify-content:space-between;`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const focusable = css`
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  ${focusable}
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  ${focusable}
`;

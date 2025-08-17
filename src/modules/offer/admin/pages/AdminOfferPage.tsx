"use client";
import styled from "styled-components";
import { useMemo, useRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/offer/locales";

import type { IOffer, OfferAdminFilters } from "@/modules/offer/types";
import { OfferForm, OfferDetail, OfferList } from "@/modules/offer";
import OfferActionsSection from "@/modules/offer/admin/components/OfferActionsSection";

import {
  clearOfferMessages,
  setSelectedOffer,
  deleteOffer,
} from "@/modules/offer/slice/offerSlice";

export default function OfferAdminPage() {
  const { t } = useI18nNamespace("offer", translations);
  const dispatch = useDispatch<AppDispatch>();

  const { adminOffers, loading, error, successMessage, selected } = useAppSelector(
    (s) => s.offer
  );

  const [filters, setFilters] = useState<OfferAdminFilters>({});
  const [editItem, setEditItem] = useState<IOffer | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);

  const dismissBanner = () => dispatch(clearOfferMessages());

  const handleFilterChange = (next: OfferAdminFilters) => setFilters(next);
  const openCreate = () => { setEditItem(undefined); setShowForm(true); };
  const openEdit = (o: IOffer) => { setEditItem(o); setShowForm(true); };
  const closeForm = () => setShowForm(false);
  const onSaved = () => setShowForm(false);
  const closeDetail = () => dispatch(setSelectedOffer(null));

  const toText = (v: any) => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
      const first = Object.values(v).find((x) => typeof x === "string") as string | undefined;
      return first ?? "";
    }
    return String(v);
  };

  const matchesQ = (o: IOffer, q?: string) => {
    const needle = (q || "").trim().toLowerCase();
    if (!needle) return true;
    if (o.offerNumber?.toLowerCase().includes(needle)) return true;
    if (toText((o.customer as any)?.companyName || (o.customer as any)?.contactName).toLowerCase().includes(needle)) return true;
    if (toText((o.company as any)?.companyName).toLowerCase().includes(needle)) return true;
    return false;
  };

  const visibleItems = useMemo(() => {
    const list = adminOffers || [];
    if (!list.length) return list;

    return list.filter((o: IOffer) => {
      if (filters.q && !matchesQ(o, filters.q)) return false;
      if (filters.status && o.status !== filters.status) return false;
      if (filters.customer) {
        const cid = typeof o.customer === "string" ? o.customer : (o.customer as any)?._id;
        if (String(cid || "") !== String(filters.customer)) return false;
      }
      if (filters.company) {
        const cid = typeof o.company === "string" ? o.company : (o.company as any)?._id;
        if (String(cid || "") !== String(filters.company)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOffers, filters]);

  const extractId = (o: IOffer): string => {
    if (typeof (o as any)?._id === "string") return (o as any)._id;
    const fromOid = (o as any)?._id?.$oid;
    if (typeof fromOid === "string") return fromOid;
    const fallback = (o as any)?.id ?? (o as any)?._id;
    return typeof fallback === "string" ? fallback : String(fallback || "");
  };

  const handleDelete = async (o: IOffer) => {
    const id = extractId(o);
    if (!id) return;
    const ok = window.confirm(t("list.confirmDelete", "Delete this offer? This cannot be undone."));
    if (!ok) return;
    try {
      const res: any = await (dispatch as any)(deleteOffer(id));
      if (typeof res?.unwrap === "function") await res.unwrap();
    } catch (e) {
      console.error("Delete failed:", e);
      alert(t("common.error", "Something went wrong."));
    }
  };

  const showPanel = showForm || !!selected;
  useEffect(() => {
    if (showPanel) {
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  }, [showPanel]);

  const current = (showForm ? editItem : selected) as IOffer | undefined;

  return (
    <PageWrap>
      <PageHead>
        <div>
          <H1>{t("admin.title", "Offers")}</H1>
          <Subtle>{t("admin.subtitle", "Create, edit and manage offers.")}</Subtle>
        </div>
        <Actions>
          <Primary onClick={openCreate} disabled={!!loading}>
            {t("admin.new", "New Offer")}
          </Primary>
        </Actions>
      </PageHead>

      {(error || successMessage) && (
        <Banner $type={error ? "error" : "success"} role="status">
          <span>{toText(error) || toText(successMessage)}</span>
          <CloseBtn onClick={dismissBanner} aria-label={t("common.close", "Close")}>×</CloseBtn>
        </Banner>
      )}

      <Column>
        <OfferList
          items={visibleItems}
          loading={!!loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        {showPanel && (
          <div ref={panelRef}>
            <Panel>
              <PanelHead>
                <h3>
                  {showForm
                    ? (editItem ? t("form.editTitle", "Edit Offer") : t("form.createTitle", "Create Offer"))
                    : t("detail.title", "Offer Details")}
                </h3>
              </PanelHead>

              {/* Ayrı aksiyon bölümü */}
              {current && (
                <OfferActionsSection
                  offer={current}
                  onClose={showForm ? closeForm : closeDetail}
                />
              )}

              <PanelBody>
                {showForm ? (
                  <OfferForm initial={editItem} onClose={closeForm} onSaved={onSaved} />
                ) : (
                  selected && <OfferDetail item={selected} onClose={closeDetail} />
                )}
              </PanelBody>
            </Panel>
          </div>
        )}
      </Column>
    </PageWrap>
  );
}

/* ================= styled ================= */
const PageWrap = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const PageHead = styled.header`
  display:flex; align-items:flex-end; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.mobile}{ align-items:stretch; flex-direction:column; }
`;
const H1 = styled.h1`
  margin:0; font-size:${({theme})=>theme.fontSizes.large}; color:${({theme})=>theme.colors.title};
  font-family:${({theme})=>theme.fonts.heading};
`;
const Subtle = styled.p`margin:.25rem 0 0; color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm};`;
const Primary = styled.button`
  padding:10px 16px; border-radius:${({theme})=>theme.radii.xl};
  border:1px solid ${({theme})=>theme.buttons.primary.backgroundHover};
  color:${({theme})=>theme.buttons.primary.text};
  background:linear-gradient(180deg, ${({theme})=>theme.buttons.primary.background}, ${({theme})=>theme.buttons.primary.backgroundHover});
  box-shadow:${({theme})=>theme.shadows.button};
  cursor:pointer; transition:transform .08s ease, box-shadow .15s ease, opacity .15s ease;
  &:hover:enabled{ transform:translateY(-1px); box-shadow:${({theme})=>theme.shadows.lg}; }
  &:active:enabled{ transform:translateY(0); box-shadow:${({theme})=>theme.shadows.sm}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
  &:focus-visible{ outline:none; box-shadow:0 0 0 3px ${({theme})=>theme.colors.shadowHighlight}; }
`;
const Banner = styled.div<{ $type: "success" | "error" }>`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
  border:${({theme})=>theme.borders.thin} ${({theme,$type})=>$type==="success"? theme.colors.success : theme.colors.danger};
  background:${({theme,$type})=>$type==="success"? theme.colors.successBg : theme.colors.dangerBg};
  color:${({theme,$type})=>$type==="success"? theme.colors.textOnSuccess : theme.colors.textOnDanger};
  border-radius:${({theme})=>theme.radii.lg}; padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md};
`;
const CloseBtn = styled.button`border:none; background:transparent; color:inherit; font-size:20px; cursor:pointer; line-height:1;`;
const Column = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const Panel = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.xl};
  box-shadow:${({theme})=>theme.cards.shadow};
  overflow:hidden;
`;
const PanelHead = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
  padding:${({theme})=>theme.spacings.md};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  h3{ margin:0; font-size:${({theme})=>theme.fontSizes.medium}; color:${({theme})=>theme.colors.title}; }
`;
const PanelBody = styled.div`padding:${({theme})=>theme.spacings.md};`;

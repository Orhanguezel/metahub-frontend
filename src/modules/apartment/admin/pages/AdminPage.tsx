"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/apartment/locales";

import ApartmentList, { type ApartmentAdminFilters } from "@/modules/apartment/admin/components/ApartmentList";
import ApartmentForm from "@/modules/apartment/admin/components/ApartmentForm";
import ApartmentDetail from "@/modules/apartment/admin/components/ApartmentDetail";

import {
  clearApartmentMessages,
  setSelectedApartment,
} from "@/modules/apartment/slice/apartmentSlice";
import type { IApartment, TranslatedLabel } from "@/modules/apartment/types";

/* 🔧 Base filtre tipini yerel olarak genişletiyoruz */
type ExtendedAdminFilters = ApartmentAdminFilters & {
  customer?: string;   // manager (customer._id)
  employee?: string;   // ops.employees
  supervisor?: string; // ops.supervisor
  service?: string;    // ops.services.service
  cashDay?: number;    // ops.cashCollectionDay
};

export default function ApartmentAdminPage() {
  const { t } = useI18nNamespace("apartment", translations);
  const dispatch = useDispatch<AppDispatch>();

  const {
    apartmentAdmin,
    loading: aptLoading,
    error: aptError,
    successMessage: aptSuccessMessage,
    selected,
  } = useAppSelector((s) => s.apartment);

  // Ek modüller parent’ta GEREK YOK — List & Form store’dan kendileri okuyor
  const {
    loading: empLoading,
    error: empError,
    successMessage: empSuccessMessage,
  } = useAppSelector((s) => s.employees);

  const uiLoading = !!(aptLoading || empLoading);
  const uiError = aptError || empError;
  const uiSuccessMessage = aptSuccessMessage || empSuccessMessage;

  const [filters, setFilters] = useState<ExtendedAdminFilters>({});

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<IApartment | undefined>(undefined);

  const dismissBanner = () => dispatch(clearApartmentMessages());

  // 🔸 ApartmentList onFilterChange beklentisi: (next: ApartmentAdminFilters)
  const handleFilterChange = (next: ApartmentAdminFilters) => {
    setFilters(next as ExtendedAdminFilters);
  };

  const openCreate = () => { setEditItem(undefined); setShowForm(true); };
  const openEdit = (a: IApartment) => { setEditItem(a); setShowForm(true); };
  const closeForm = () => setShowForm(false);
  const onSaved = () => setShowForm(false);
  const closeDetail = () => dispatch(setSelectedApartment(null));

  /* ================= Client-side filter helpers ================= */
  const getId = (v: any): string | undefined =>
    typeof v === "string" ? v : v && typeof v === "object" ? String(v._id || "") : undefined;

  const anyText = (obj?: TranslatedLabel) =>
    obj ? Object.values(obj).filter(Boolean).join(" ").toLowerCase() : "";

  const matchesQ = (apt: IApartment, q: string) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    if (apt.slug?.toLowerCase().includes(needle)) return true;
    if (apt.address?.fullText?.toLowerCase().includes(needle)) return true;
    if (anyText(apt.title).includes(needle)) return true;
    if (anyText(apt.snapshots?.neighborhoodName).includes(needle)) return true;
    return false;
  };

  const asText = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    if (typeof v === "object") {
      const first = Object.values(v).find((x) => typeof x === "string") as string | undefined;
      return first ?? JSON.stringify(v);
    }
    return String(v);
  };

  const visibleItems = useMemo(() => {
    const list = apartmentAdmin || [];
    if (!list.length) return list;

    return list.filter((apt) => {
      if (filters.q && !matchesQ(apt, filters.q)) return false;

      if (typeof filters.isPublished === "boolean" && apt.isPublished !== filters.isPublished) return false;
      if (typeof filters.isActive === "boolean" && apt.isActive !== filters.isActive) return false;

      if (filters.neighborhood) {
        const nId = getId(apt.place?.neighborhood);
        if (nId !== filters.neighborhood) return false;
      }

      if (filters.customer) {
        const cId = getId(apt.customer);
        if (cId !== filters.customer) return false;
      }

      if (filters.employee) {
        const empIds = (apt.ops?.employees || []).map(getId).filter(Boolean);
        if (!empIds.includes(filters.employee)) return false;
      }
      if (filters.supervisor) {
        const sId = getId(apt.ops?.supervisor);
        if (sId !== filters.supervisor) return false;
      }
      if (filters.service) {
        const svcIds = (apt.ops?.services || []).map((b: any) => getId(b.service)).filter(Boolean);
        if (!svcIds.includes(filters.service)) return false;
      }
      if (typeof filters.cashDay === "number") {
        if ((apt.ops?.cashCollectionDay || null) !== filters.cashDay) return false;
      }

      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apartmentAdmin, filters]);

  return (
    <PageWrap>
      <PageHead>
        <div>
          <H1>{t("admin.title", "Apartments")}</H1>
          <Subtle>{t("admin.subtitle", "Create, edit and manage apartments.")}</Subtle>
        </div>
        <Actions>
          <Primary onClick={openCreate} disabled={uiLoading}>
            {t("admin.new", "New Apartment")}
          </Primary>
        </Actions>
      </PageHead>

      {(uiError || uiSuccessMessage) && (
        <Banner $type={uiError ? "error" : "success"} role="status">
          <span>{asText(uiError) || asText(uiSuccessMessage)}</span>
          <CloseBtn onClick={dismissBanner} aria-label={t("common.close", "Close")}>×</CloseBtn>
        </Banner>
      )}

      {/* ✅ EK props YOK */}
      <ApartmentList
        items={visibleItems}
        loading={uiLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onEdit={openEdit}
      />

      {showForm && (
        <Modal role="dialog" aria-modal="true" aria-label={t("form.modalTitle", "Apartment Form")}>
          <ModalCard>
            <ModalHead>
              <h3>{editItem ? t("form.editTitle", "Edit Apartment") : t("form.createTitle", "Create Apartment")}</h3>
              <IconBtn onClick={closeForm} aria-label={t("common.close", "Close")}>×</IconBtn>
            </ModalHead>
            <ModalBody>
              {/* ✅ EK props YOK */}
              <ApartmentForm initial={editItem} onClose={closeForm} onSaved={onSaved} />
            </ModalBody>
          </ModalCard>
          <Backdrop onClick={closeForm} />
        </Modal>
      )}

      {selected && (
        <Drawer aria-label={t("detail.title", "Apartment Details")} role="dialog" aria-modal="true">
          <DrawerCard>
            <DrawerHead>
              <h3>{t("detail.title", "Apartment Details")}</h3>
              <IconBtn onClick={closeDetail} aria-label={t("common.close", "Close")}>×</IconBtn>
            </DrawerHead>
            <DrawerBody>
              <ApartmentDetail item={selected} onClose={closeDetail} />
            </DrawerBody>
          </DrawerCard>
          <Backdrop onClick={closeDetail} />
        </Drawer>
      )}
    </PageWrap>
  );
}

/* ================= styled ================= */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const PageHead = styled.header`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const H1 = styled.h1` 
display:flex; flex-direction:column; gap:4px;
  h1{ margin:0; }
`;
const Subtle = styled.p` 
margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
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
const Modal = styled.div`position:fixed; inset:0; z-index:${({theme})=>theme.zIndex.modal}; display:flex; align-items:center; justify-content:center;`;
const Drawer = styled.div`position:fixed; inset:0; z-index:${({theme})=>theme.zIndex.modal}; display:flex; align-items:stretch; justify-content:flex-end;`;
const ModalCard = styled.div`
  position:relative; z-index:2; width:min(980px, 96vw); max-height:92vh; overflow:auto;
  background:${({theme})=>theme.colors.cardBackground}; border-radius:${({theme})=>theme.radii.xl}; box-shadow:${({theme})=>theme.shadows.xl};
`;
const DrawerCard = styled(ModalCard)`width:min(720px, 96vw);`;
const ModalHead = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
  padding:${({theme})=>theme.spacings.md};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  h3{ margin:0; font-size:${({theme})=>theme.fontSizes.medium}; color:${({theme})=>theme.colors.title}; }
`;
const DrawerHead = styled(ModalHead)``;
const ModalBody = styled.div`padding:${({theme})=>theme.spacings.md};`;
const DrawerBody = styled(ModalBody)``;
const IconBtn = styled.button`
  border:none; background:transparent; cursor:pointer; font-size:22px; color:${({theme})=>theme.colors.textSecondary};
  &:hover{ opacity:${({theme})=>theme.opacity.hover}; }
`;
const Backdrop = styled.div`position:absolute; inset:0; z-index:1; background:linear-gradient(${({theme})=>theme.colors.overlayStart}, ${({theme})=>theme.colors.overlayEnd});`;

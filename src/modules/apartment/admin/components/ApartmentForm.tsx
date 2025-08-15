"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/apartment/locales";
import type { SupportedLocale } from "@/types/common";
import type { IApartment, IApartmentImage, IAddress, TranslatedLabel } from "@/modules/apartment/types";
import { createApartment, updateApartment } from "@/modules/apartment/slice/apartmentSlice";

import {
  Actions, Primary, Secondary,
  Form, Row, RowGrid, Label,
  Input,
  Segmented, SegBtn,
} from "./ApartmentForm/FormUI";

import { Opt, SvcBind } from "./ApartmentForm/formTypes";
import TitleContentSection from "./ApartmentForm/sections/TitleContentSection";
import AddressSection from "./ApartmentForm/sections/AddressSection";
import ManagerContactSection from "./ApartmentForm/sections/ManagerContactSection";
import OperationsSection from "./ApartmentForm/sections/OperationsSection";
import ServicesSection from "./ApartmentForm/sections/ServicesSection";
import PublishSection from "./ApartmentForm/sections/PublishSection";
import MediaSection from "./ApartmentForm/sections/MediaSection";
import JsonModeSection from "./ApartmentForm/sections/JsonModeSection";

/* =============== utils =============== */
const toSlug = (s: string) =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

const toText = (v: any, lang?: SupportedLocale): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    const lbl = v as TranslatedLabel;
    if (lang && typeof lbl?.[lang] === "string") return lbl[lang] as string;
    const first = Object.values(lbl).find((x) => typeof x === "string") as string | undefined;
    return first ?? "";
  }
  return String(v);
};

const tLabel = (obj?: TranslatedLabel, lang?: SupportedLocale) => toText(obj, lang);
const toId = (v: any) => (typeof v === "string" ? v : v?._id);

function pickArray(source: any, keys: string[] = []): any[] {
  if (Array.isArray(source)) return source;
  for (const k of keys) {
    const v = source?.[k];
    if (Array.isArray(v)) return v;
  }
  if (source && typeof source === "object") {
    for (const v of Object.values(source)) if (Array.isArray(v)) return v;
  }
  return [];
}

type SimpleT = (k: string, d?: string) => string;

/* =============== main =============== */
type Props = { initial?: IApartment; onClose: () => void; onSaved?: () => void };

export default function ApartmentForm({ initial, onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language || "en").slice(0, 2) as SupportedLocale;
  const isEdit = !!initial?._id;

  // i18next t -> basit imza
  const tr: SimpleT = useCallback((k, d) => t(k, { defaultValue: d }) as string, [t]);

  // slices
  const neighborhoods = useAppSelector((s) => (s as any).neighborhood?.items ?? []);
  const customers = useAppSelector((s) => (s as any).customer?.customerAdmin ?? []);
  const { employeesAdmin = [] } = useAppSelector((s) => (s as any).employees ?? {});
  const serviceItems = useAppSelector(
    (s) => (s as any).servicecatalog?.items ?? (s as any).services?.items ?? []
  );
  const schedulingSlice = useAppSelector((s) => (s as any).scheduling);
  const opsTemplatesSlice = useAppSelector((s) => (s as any).opstemplates);
  const priceListsSlice = useAppSelector((s) => (s as any).pricelists);

  const schedulePlanItems = useMemo(() => pickArray(schedulingSlice, ["plans", "items", "list", "data"]), [schedulingSlice]);
  const operationTemplateItems = useMemo(() => pickArray(opsTemplatesSlice, ["items", "templates", "list", "data"]), [opsTemplatesSlice]);
  const priceListItems = useMemo(() => pickArray(priceListsSlice, ["items", "list", "data", "entries"]), [priceListsSlice]);

  /* =============== mode =============== */
  const [mode, setMode] = useState<"simple" | "json">("simple");

  /* =============== simple state =============== */
  const [titleSingle, setTitleSingle] = useState<string>(tLabel(initial?.title, lang));
  const [contentSingle, setContentSingle] = useState<string>(tLabel(initial?.content, lang));

  // Address & place (TR)
  const initialNeighborhoodId =
    typeof initial?.place?.neighborhood === "string"
      ? (initial.place!.neighborhood as string)
      : (initial?.place as any)?.neighborhood?._id;
  const [neighborhoodId, setNeighborhoodId] = useState<string>(initialNeighborhoodId || "");
  const [address, setAddress] = useState<IAddress>(initial?.address || { city: "", country: "TR" });
  const [cityCode, setCityCode] = useState<string>((initial?.place as any)?.cityCode || "");
  const [districtCode, setDistrictCode] = useState<string>((initial?.place as any)?.districtCode || "");
  const [placeZip, setPlaceZip] = useState<string>((initial?.place as any)?.zip || "");

  // Geo
  const coords = Array.isArray(initial?.location?.coordinates)
    ? (initial!.location!.coordinates as [number, number])
    : undefined;
  const [lng, setLng] = useState<string>(coords ? String(coords[0]) : "");
  const [lat, setLat] = useState<string>(coords ? String(coords[1]) : "");

  // Customer & contact
  const initialCustomerId =
    typeof initial?.customer === "string" ? (initial.customer as string) : (initial?.customer as any)?._id;
  const [customerId, setCustomerId] = useState<string>(initialCustomerId || "");
  const initContact = (initial?.contact as any) || ({ name: "" });
  const [contactName, setContactName] = useState<string>(toText(initContact.name, lang));
  const [contactPhone, setContactPhone] = useState<string>(toText(initContact.phone));
  const [contactEmail, setContactEmail] = useState<string>(toText(initContact.email));
  const [contactRole, setContactRole] = useState<string>(toText(initContact.role));
  const [linkContactToCustomer, setLinkContactToCustomer] = useState<boolean>(
    !!(initContact.customerRef || initialCustomerId)
  );

  // Ops
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    (initial?.ops?.employees || []).map(toId).filter(Boolean)
  );
  const [supervisorId, setSupervisorId] = useState<string>(toId(initial?.ops?.supervisor) || "");
  const [cleaningPlanId, setCleaningPlanId] = useState<string>(toId((initial as any)?.ops?.cleaningPlan) || "");
  const [trashPlanId, setTrashPlanId] = useState<string>(toId((initial as any)?.ops?.trashPlan) || "");
  const [cashDay, setCashDay] = useState<number | undefined>(initial?.ops?.cashCollectionDay || undefined);
  const [notifyJobCompleted, setNotifyJobCompleted] = useState<boolean>(
    initial?.ops?.notify?.managerOnJobCompleted ?? true
  );
  const [notifyManagerOnAssigned, setNotifyManagerOnAssigned] = useState<boolean>(
    initial?.ops?.notify?.managerOnJobAssigned ?? false
  );
  const [notifyEmployeeOnAssigned, setNotifyEmployeeOnAssigned] = useState<boolean>(
    initial?.ops?.notify?.employeeOnJobAssigned ?? true
  );

  // Services
  const initialBindings: SvcBind[] = (initial?.ops?.services || []).map((b: any) => ({
    service: toId(b?.service),
    schedulePlan: toId(b?.schedulePlan),
    operationTemplate: toId(b?.operationTemplate),
    priceListItem: toId(b?.priceListItem),
    isActive: !!b?.isActive,
    notes: toText(b?.notes),
  }));
  const [serviceBindings, setServiceBindings] = useState<SvcBind[]>(initialBindings);

  // Publish
  const [slug, setSlug] = useState<string>(toText(initial?.slug));
  const [isPublished, setIsPublished] = useState<boolean>(!!initial?.isPublished);

  // Images
  const [existingImages, setExistingImages] = useState<IApartmentImage[]>(initial?.images || []);
  const [removedExisting, setRemovedExisting] = useState<IApartmentImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  /* =============== JSON payload =============== */
  const [fullJson, setFullJson] = useState<any>(() => {
    if (!initial) {
      return {
        title: { [lang]: "" } as TranslatedLabel,
        content: { [lang]: "" } as TranslatedLabel,
        address: { city: "", country: "TR" },
        contact: { name: "" },
        place: {},
        isPublished: false,
        slug: "",
        ops: {
          employees: [],
          services: [],
          cleaningPlan: undefined,
          trashPlan: undefined,
          notify: { managerOnJobCompleted: true, managerOnJobAssigned: false, employeeOnJobAssigned: true },
        },
      };
    }
    const flat = {
      title: initial.title || {},
      content: initial.content || {},
      address: initial.address || { city: "", country: "TR" },
      location: initial.location || undefined,
      place:
        typeof initial.place?.neighborhood === "string"
          ? initial.place
          : { ...(initial.place || {}), neighborhood: (initial.place as any)?.neighborhood?._id },
      snapshots: initial.snapshots || undefined,
      customer: typeof initial.customer === "string" ? initial.customer : (initial.customer as any)?._id,
      contact: {
        ...(initial.contact || { name: "" }),
        customerRef:
          typeof (initial as any)?.contact?.customerRef === "string"
            ? (initial as any).contact.customerRef
            : (initial as any)?.contact?.customerRef?._id,
      },
      ops: initial.ops || undefined,
      links: initial.links || undefined,
      isPublished: initial.isPublished || false,
      slug: initial.slug || "",
    };
    return flat;
  });

  /* =============== options =============== */
  const employeeOpts: Opt[] = useMemo(
    () =>
      (employeesAdmin || []).map((e: any) => ({
        id: String(e._id),
        label:
          toText(e.fullName) ||
          [toText(e.firstName), toText(e.lastName)].filter(Boolean).join(" ") ||
          toText(e.email) ||
          String(e._id),
        sub: [toText(e.email), toText(e.phone)].filter(Boolean).join(" • "),
      })),
    [employeesAdmin]
  );
  const serviceOpts: Opt[] = useMemo(
    () =>
      (serviceItems || []).map((s: any) => ({
        id: String(s._id),
        label: (typeof s.name === "string" ? s.name : tLabel(s.name, lang)) || toText(s.code) || String(s._id),
        sub: toText(s.code),
      })),
    [serviceItems, lang]
  );
  const planOpts: Opt[] = useMemo(
    () =>
      (schedulePlanItems || []).map((p: any) => ({
        id: String(p._id),
        label: toText(p.name) || toText(p.title) || String(p._id),
      })),
    [schedulePlanItems]
  );
  const templateOpts: Opt[] = useMemo(
    () =>
      (operationTemplateItems || []).map((o: any) => ({
        id: String(o._id),
        label: toText(o.name) || toText(o.title) || String(o._id),
      })),
    [operationTemplateItems]
  );
  const priceListOpts: Opt[] = useMemo(
    () =>
      (priceListItems || []).map((x: any) => ({
        id: String(x._id),
        label: toText(x.name) || toText(x.code) || String(x._id),
        sub: typeof x.price === "number" ? `${x.price} ${toText(x.currency)}` : undefined,
      })),
    [priceListItems]
  );
  const customerOptions: Opt[] = useMemo(
    () =>
      (customers || []).map((c: any) => {
        const label =
          toText(c.companyName, lang) ||
          toText(c.contactName, lang) ||
          toText(c.email) ||
          toText(c.phone) ||
          String(c._id);
        const sub = [toText(c.email), toText(c.phone)].filter(Boolean).join(" • ");
        return { id: String(c._id), label, sub };
      }),
    [customers, lang]
  );

  /* =============== autofill =============== */
  const autofillFromCustomer = useCallback(
    (id: string) => {
      const c = customers.find((x: any) => String(x._id) === String(id));
      if (!c) return;

      const nm = toText(c.contactName, lang) || toText(c.companyName, lang);
      const em = toText(c.email);
      const ph = toText(c.phone);

      setContactName((prev) => (prev?.trim() ? prev : nm));
      setContactEmail((prev) => (prev?.trim() ? prev : em));
      setContactPhone((prev) => (prev?.trim() ? prev : ph));

      setFullJson((prev: any) => {
        if (mode !== "json") return prev;
        const next = { ...(prev || {}) };
        next.customer = id;
        const pc = { ...(next.contact || {}) };
        if (!toText(pc.name).trim()) pc.name = nm;
        if (!toText(pc.email).trim()) pc.email = em;
        if (!toText(pc.phone).trim()) pc.phone = ph;
        if (linkContactToCustomer && id) pc.customerRef = id;
        else delete pc.customerRef;
        next.contact = pc;
        return next;
      });
    },
    [customers, lang, mode, linkContactToCustomer]
  );

  const onSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setCustomerId(id);
    if (id) autofillFromCustomer(id);
    else setFullJson((p: any) => (mode === "json" ? { ...(p || {}), customer: undefined } : p));
  };

  useEffect(() => {
    if (mode !== "json") return;
    setFullJson((prev: any) => {
      const next = { ...(prev || {}) };
      const pc = { ...(next.contact || {}) };
      if (linkContactToCustomer && customerId) pc.customerRef = customerId;
      else delete pc.customerRef;
      next.contact = pc;
      return next;
    });
  }, [linkContactToCustomer, customerId, mode]);

  /* =============== validation =============== */
  const canSubmitSimple =
    (address.country || "").trim() &&
    (address.state || "").trim() &&
    (address.city || "").trim() &&
    (contactName || "").trim().length > 0 &&
    (isEdit || newFiles.length > 0);

  const canSubmitJson = useMemo(() => {
    const j = fullJson || {};
    const addr = j.address || {};
    const contact = j.contact || {};
    const hasAnyTitle =
      !j.title ? true : Object.values(j.title as Record<string, string>).some((v) => String(v || "").trim());
    return hasAnyTitle && addr.city && addr.country && contact.name && (isEdit || newFiles.length > 0);
  }, [fullJson, isEdit, newFiles.length]);

  const canSubmit = mode === "json" ? canSubmitJson : canSubmitSimple;

  /* =============== submit =============== */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();

    if (mode === "json") {
      const j = fullJson || {};
      if (j.title) fd.append("title", JSON.stringify(j.title));
      if (j.content) fd.append("content", JSON.stringify(j.content));
      if (j.address) fd.append("address", JSON.stringify(j.address));
      if (j.location) fd.append("location", JSON.stringify(j.location));
      if (j.place && Object.keys(j.place).length) fd.append("place", JSON.stringify(j.place));
      if (j.snapshots) fd.append("snapshots", JSON.stringify(j.snapshots));
      if (j.customer) fd.append("customer", String(j.customer));
      if (j.contact) fd.append("contact", JSON.stringify(j.contact));
      if (j.ops) fd.append("ops", JSON.stringify(j.ops));
      if (j.links) fd.append("links", JSON.stringify(j.links));
      if (j.slug) fd.append("slug", toSlug(String(j.slug)));
      if (typeof j.isPublished === "boolean") fd.append("isPublished", String(!!j.isPublished));
    } else {
      const titlePayload: TranslatedLabel = (titleSingle || "").trim() ? { [lang]: titleSingle.trim() } : {};
      const contentPayload: TranslatedLabel = (contentSingle || "").trim() ? { [lang]: contentSingle.trim() } : {};

      const placePayload: Record<string, any> = {};
      if (neighborhoodId) placePayload.neighborhood = neighborhoodId;
      if (cityCode.trim()) placePayload.cityCode = cityCode.trim();
      if (districtCode.trim()) placePayload.districtCode = districtCode.trim();
      if (placeZip.trim()) placePayload.zip = placeZip.trim();

      const contactPayload: any = {
        name: (contactName || "").trim(),
        ...(contactPhone.trim() ? { phone: contactPhone.trim() } : {}),
        ...(contactEmail.trim() ? { email: contactEmail.trim() } : {}),
        ...(contactRole.trim() ? { role: contactRole.trim() } : {}),
        ...(linkContactToCustomer && customerId ? { customerRef: customerId } : {}),
      };

      const loc =
        lng.trim() && lat.trim()
          ? { type: "Point", coordinates: [Number(lng), Number(lat)] as [number, number] }
          : undefined;

      const opsPayload: any = {};
      if (selectedEmployees.length) opsPayload.employees = selectedEmployees;
      if (supervisorId) opsPayload.supervisor = supervisorId;
      if (cleaningPlanId) opsPayload.cleaningPlan = cleaningPlanId;
      if (trashPlanId) opsPayload.trashPlan = trashPlanId;
      if (serviceBindings.length)
        opsPayload.services = serviceBindings.map((b) => ({
          service: b.service,
          ...(b.schedulePlan ? { schedulePlan: b.schedulePlan } : {}),
          ...(b.operationTemplate ? { operationTemplate: b.operationTemplate } : {}),
          ...(b.priceListItem ? { priceListItem: b.priceListItem } : {}),
          ...(typeof b.isActive === "boolean" ? { isActive: b.isActive } : {}),
          ...(b.notes ? { notes: b.notes } : {}),
        }));
      if (typeof cashDay === "number") opsPayload.cashCollectionDay = cashDay;
      opsPayload.notify = {
        managerOnJobCompleted: !!notifyJobCompleted,
        managerOnJobAssigned: !!notifyManagerOnAssigned,
        employeeOnJobAssigned: !!notifyEmployeeOnAssigned,
      };

      if (Object.keys(titlePayload).length) fd.append("title", JSON.stringify(titlePayload));
      if (Object.keys(contentPayload).length) fd.append("content", JSON.stringify(contentPayload));
      fd.append("address", JSON.stringify(address));
      if (loc) fd.append("location", JSON.stringify(loc));
      if (Object.keys(placePayload).length) fd.append("place", JSON.stringify(placePayload));
      fd.append("contact", JSON.stringify(contactPayload));
      if (customerId) fd.append("customer", customerId);
      if (Object.keys(opsPayload).length) fd.append("ops", JSON.stringify(opsPayload));
      if (slug.trim()) fd.append("slug", toSlug(slug));
      fd.append("isPublished", String(isPublished));
    }

    newFiles.forEach((f) => fd.append("images", f));
    if (removedExisting.length) {
      fd.append("removedImages", JSON.stringify(removedExisting.map((x) => x.url)));
    }

    try {
      if (isEdit && initial?._id) {
        await (dispatch(updateApartment({ id: initial._id, formData: fd }) as any).unwrap());
      } else {
        await (dispatch(createApartment(fd) as any).unwrap());
      }
      onSaved?.();
    } catch {}
  };

  const titlePreview = mode === "json" ? tLabel((fullJson?.title as any) || {}, lang) : titleSingle;

  return (
    <Form onSubmit={onSubmit}>
      {/* Mode */}
      <Row>
        <Label>{tr("form.mode", "Input Mode")}</Label>
        <Segmented>
          <SegBtn type="button" data-active={mode === "simple"} onClick={() => setMode("simple")}>
            {tr("form.simpleMode", "Simple")}
          </SegBtn>
          <SegBtn type="button" data-active={mode === "json"} onClick={() => setMode("json")}>
            {tr("form.jsonMode", "JSON (single object)")}
          </SegBtn>
        </Segmented>
      </Row>

      {/* JSON MODE */}
      {mode === "json" && (
        <JsonModeSection
          t={tr}
          lang={lang}
          fullJson={fullJson}
          setFullJson={setFullJson}
          titlePreview={titlePreview}
        />
      )}

      {/* SIMPLE MODE */}
      {mode === "simple" && (
        <>
          <TitleContentSection
            t={tr}
            lang={lang}
            titleSingle={titleSingle}
            setTitleSingle={setTitleSingle}
            contentSingle={contentSingle}
            setContentSingle={setContentSingle}
            titlePreview={titlePreview}
          />

          <AddressSection
            t={tr}
            neighborhoods={neighborhoods}
            neighborhoodId={neighborhoodId}
            setNeighborhoodId={setNeighborhoodId}
            address={address}
            setAddress={setAddress}
            cityCode={cityCode}
            setCityCode={setCityCode}
            districtCode={districtCode}
            setDistrictCode={setDistrictCode}
            placeZip={placeZip}
            setPlaceZip={setPlaceZip}
          />

          <RowGrid>
            <div><Label>{tr("form.lng","Longitude")}</Label><Input type="number" inputMode="decimal" value={lng} onChange={(e)=>setLng(e.target.value)} placeholder="29.0" /></div>
            <div><Label>{tr("form.lat","Latitude")}</Label><Input type="number" inputMode="decimal" value={lat} onChange={(e)=>setLat(e.target.value)} placeholder="40.7" /></div>
          </RowGrid>

          <ManagerContactSection
            t={tr}
            customerOptions={customerOptions}
            customerId={customerId}
            onSelectCustomer={onSelectCustomer}
            linkContactToCustomer={linkContactToCustomer}
            setLinkContactToCustomer={setLinkContactToCustomer}
            contactName={contactName}
            setContactName={setContactName}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactRole={contactRole}
            setContactRole={setContactRole}
            onAutofill={() => customerId && autofillFromCustomer(customerId)}
          />

          <OperationsSection
            t={tr}
            employeeOpts={employeeOpts}
            planOpts={planOpts}
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            supervisorId={supervisorId}
            setSupervisorId={setSupervisorId}
            cleaningPlanId={cleaningPlanId}
            setCleaningPlanId={setCleaningPlanId}
            trashPlanId={trashPlanId}
            setTrashPlanId={setTrashPlanId}
            cashDay={cashDay}
            setCashDay={setCashDay}
            notifyJobCompleted={notifyJobCompleted}
            setNotifyJobCompleted={setNotifyJobCompleted}
            notifyManagerOnAssigned={notifyManagerOnAssigned}
            setNotifyManagerOnAssigned={setNotifyManagerOnAssigned}
            notifyEmployeeOnAssigned={notifyEmployeeOnAssigned}
            setNotifyEmployeeOnAssigned={setNotifyEmployeeOnAssigned}
          />

          <ServicesSection
            t={tr}
            serviceBindings={serviceBindings}
            setServiceBindings={setServiceBindings}
            serviceOpts={serviceOpts}
            planOpts={planOpts}
            templateOpts={templateOpts}
            priceListOpts={priceListOpts}
          />

          <PublishSection
            t={tr}
            slug={slug}
            setSlug={setSlug}
            isPublished={isPublished}
            setIsPublished={setIsPublished}
          />
        </>
      )}

      <MediaSection
        t={tr}
        isEdit={isEdit}
        existingImages={existingImages}
        setExistingImages={setExistingImages}
        removedExisting={removedExisting}
        setRemovedExisting={setRemovedExisting}
        newFiles={newFiles}
        setNewFiles={setNewFiles}
      />

      <Actions>
        <Secondary type="button" onClick={onClose}>{tr("common.cancel", "Cancel")}</Secondary>
        <Primary type="submit" disabled={!canSubmit} aria-disabled={!canSubmit}>
          {isEdit ? tr("form.save", "Save") : tr("form.create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

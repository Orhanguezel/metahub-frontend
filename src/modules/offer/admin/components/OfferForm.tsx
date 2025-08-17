"use client";
import styled, { css } from "styled-components";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/offer/locales";
import type {
  IOffer,
  IOfferItemInput,
  OfferItemProductType,
  TranslatedLabel,
} from "@/modules/offer/types";
import { createOffer, updateOffer } from "@/modules/offer/slice/offerSlice";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getMultiLang,
} from "@/types/common";
import { JSONEditor } from "@/shared";
import { ItemsSection, CostsSection, TotalsSection } from "@/modules/offer";
import { toAttachment } from "@/utils/cloudinary";

/* ============ utils ============ */
type Props = { initial?: IOffer; onClose: () => void; onSaved?: () => void };
type Opt = { id: string; label: string; sub?: string };

const toArray = (v: any): any[] => {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    if (Array.isArray((v as any).data))  return (v as any).data;
    if (Array.isArray((v as any).items)) return (v as any).items;
    if (Array.isArray((v as any).list))  return (v as any).list;
    const firstArr = Object.values(v).find((x) => Array.isArray(x));
    if (firstArr) return firstArr as any[];
  }
  return [];
};

const looksLikeObjectId = (s: string) => /^[0-9a-f]{24}$/i.test(s);
const looksLikeUUID     = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const looksLikeNumeric  = (s: string) => /^\d{1,20}$/.test(s);

const getId = (obj: any): string => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj.$oid === "string") return obj.$oid;
  if (typeof obj?._id?.$oid === "string") return obj._id.$oid;
  if (typeof obj._id === "string") return obj._id;
  if (typeof obj.uuid === "string") return obj.uuid;
  if (typeof obj.id === "string" && (looksLikeObjectId(obj.id) || looksLikeUUID(obj.id) || looksLikeNumeric(obj.id)))
    return obj.id;
  return "";
};

const indexById = (arr: any[]): Record<string, any> => {
  const map: Record<string, any> = {};
  for (const p of arr || []) {
    const id = getId(p) || getId(p?._id);
    if (id) map[String(id)] = p;
  }
  return map;
};

const pickLocale = (l?: string): SupportedLocale => {
  const two = String(l || "en").slice(0, 2).toLowerCase() as SupportedLocale;
  return (SUPPORTED_LOCALES as readonly SupportedLocale[]).includes(two) ? two : "en";
};
const ensureSelectedIn = (opts: Opt[], selId?: string, selLabel?: string): Opt[] => {
  if (!selId) return opts;
  const has = opts.some((o) => String(o.id) === String(selId));
  return has ? opts : [{ id: String(selId), label: selLabel || String(selId), sub: "current" }, ...opts];
};
const normalizeCompanyList = (src: any): any[] => {
  if (Array.isArray(src)) return src;
  if (src && typeof src === "object" && (getId(src) || getId(src?._id))) return [src];
  return [];
};

/* satır tipi */
type Line = {
  productType: OfferItemProductType;
  ensotekprod?: string;
  sparepart?: string;
  quantity: number;
  unitPrice?: number;
  customPrice?: number;
  vat?: number;
};

/* -------- URL helpers (önizleme YOK, sadece open/download) -------- */
const isCloudinary = (u?: string) => {
  if (!u) return false;
  try { return new URL(u).hostname.endsWith("res.cloudinary.com"); }
  catch { return false; }
};
/** OPEN: Cloudinary'de fl_attachment varsa sök; diğerlerinde inline header ekle */
const makeOpenUrl = (u?: string, v = 0) => {
  if (!u) return u;
  try {
    const url = new URL(u);
    if (isCloudinary(u)) {
      url.pathname = url.pathname.replace(/\/upload\/fl_attachment[^/]*\//, "/upload/");
    } else {
      url.searchParams.set("response-content-disposition", "inline");
    }
    url.searchParams.set("cbv", String(v));
    return url.toString();
  } catch {
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}cbv=${v}`;
  }
};
/** DOWNLOAD: Cloudinary için fl_attachment; diğerleri için attachment header */
const makeDownloadUrl = (u?: string, v = 0) => {
  const base = toAttachment(u);
  if (!base) return base;
  try {
    const url = new URL(base);
    url.searchParams.set("cbv", String(v));
    return url.toString();
  } catch {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}cbv=${v}`;
  }
};

/* ============ main ============ */
export default function OfferForm({ initial, onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("offer", translations);
  const isEdit = !!initial;
  const tStr = useCallback((k: string, d?: string) => t(k, { defaultValue: d }), [t]);

  /* store */
  const companyAdminObj = useAppSelector((s: any) => s?.company?.companyAdmin);
  const companies       = useMemo(() => normalizeCompanyList(companyAdminObj), [companyAdminObj]);

  const customersRaw    = useAppSelector((s: any) => s?.customer?.customerAdmin ?? []);
  const ensotekRaw      = useAppSelector((s: any) => s?.ensotekprod?.ensotekprodAdmin ?? []);
  const sparepartsRaw   = useAppSelector((s: any) => s?.sparepart?.sparepartAdmin  ?? []);

  const customers      = toArray(customersRaw);
  const ensotekItems   = toArray(ensotekRaw);
  const sparepartItems = toArray(sparepartsRaw);

  const companiesById  = useMemo(() => indexById(companies), [companies]);
  const customersById  = useMemo(() => indexById(customers), [customers]);

  /* i18n helpers */
  const ml = useCallback(
    (v: any): string =>
      typeof v === "string" ? v : getMultiLang(v as Partial<TranslatedLabel>, pickLocale(i18n.language)) || "",
    [i18n.language]
  );
  const withCurrentLocale = useCallback(
    (text: string) => ({ [pickLocale(i18n.language)]: text } as Partial<TranslatedLabel>),
    [i18n.language]
  );

  /* UI mode */
  const [mode, setMode] = useState<"form" | "json">("form");

  /* form state */
  const initCompanyId  = typeof initial?.company  === "string" ? initial?.company  : getId(initial?.company);
  const initCustomerId = typeof initial?.customer === "string" ? initial?.customer : getId(initial?.customer);

  const [company, setCompany] = useState<string>(initCompanyId || "");
  const [customer, setCustomer] = useState<string>(initCustomerId || "");
  const [contactPerson, setContactPerson] = useState<string>(initial?.contactPerson || "");
  const [currency, setCurrency] = useState<string>(initial?.currency || "EUR");
  const [validUntil, setValidUntil] = useState<string>(() =>
    initial?.validUntil ? String(initial.validUntil).slice(0, 10) : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [shippingCost, setShippingCost] = useState<number>(initial?.shippingCost ?? 0);
  const [additionalFees, setAdditionalFees] = useState<number>(initial?.additionalFees ?? 0);
  const [discount, setDiscount] = useState<number>(initial?.discount ?? 0);
  const [notes, setNotes] = useState<string>(ml(initial?.notes) || "");
  const [paymentTerms, setPaymentTerms] = useState<string>(ml(initial?.paymentTerms) || "");

  const singleCompany = companies.length === 1 ? companies[0] : undefined;
  const singleCompanyId = singleCompany ? (getId(singleCompany) || getId(singleCompany?._id)) : "";

  useEffect(() => {
    if (!isEdit && !company && singleCompanyId) setCompany(String(singleCompanyId));
  }, [isEdit, company, singleCompanyId]);

  useEffect(() => {
    const cid  = typeof initial?.company === "string" ? initial?.company : getId(initial?.company);
    const cust = typeof initial?.customer === "string" ? initial?.customer : getId(initial?.customer);

    setCompany(cid || (!isEdit && singleCompanyId ? singleCompanyId : ""));
    setCustomer(cust || "");
    setContactPerson(initial?.contactPerson || "");
    setCurrency(initial?.currency || "EUR");
    setValidUntil(initial?.validUntil ? String(initial.validUntil).slice(0, 10) : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    setShippingCost(initial?.shippingCost ?? 0);
    setAdditionalFees(initial?.additionalFees ?? 0);
    setDiscount(initial?.discount ?? 0);
    setNotes(ml(initial?.notes) || "");
    setPaymentTerms(ml(initial?.paymentTerms) || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  /* lines */
  const [lines, setLines] = useState<Line[]>(
    initial?.items
      ? (initial.items as any[]).map((it: any) => ({
          productType: it.productType,
          ensotekprod: typeof it.ensotekprod === "string" ? it.ensotekprod : getId(it.ensotekprod),
          sparepart:   typeof it.sparepart   === "string" ? it.sparepart   : getId(it.sparepart),
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice,
          customPrice: it.customPrice,
          vat: it.vat ?? 19,
        }))
      : [{ productType: "ensotekprod", quantity: 1, vat: 19 }]
  );

  const addLine    = () => setLines((l) => [...l, { productType: "ensotekprod", quantity: 1, vat: 19 }]);
  const removeLine = (idx: number) => setLines((l) => l.filter((_, i) => i !== idx));
  const patchLine  = (idx: number, patch: Partial<Line>) =>
    setLines((l) =>
      l.map((x, i) => {
        if (i !== idx) return x;
        const cleared = patch.productType ? { ensotekprod: undefined, sparepart: undefined } : {};
        return { ...x, ...cleared, ...patch };
      })
    );

  const ensotekById = useMemo<Record<string, any>>(() => indexById(ensotekItems), [ensotekItems]);
  const spareById   = useMemo<Record<string, any>>(() => indexById(sparepartItems), [sparepartItems]);

  /* json mode */
  const [jsonPayload, setJsonPayload] = useState<any>(() => {
    if (!initial) return {};
    const cid  = typeof initial.company === "string" ? initial.company : getId(initial.company);
    const cust = typeof initial.customer === "string" ? initial.customer : getId(initial.customer);
    const items = (initial.items || []).map((it: any) => ({
      productType: it.productType,
      ensotekprod: typeof it.ensotekprod === "string" ? it.ensotekprod : getId(it.ensotekprod),
      sparepart:   typeof it.sparepart   === "string" ? it.sparepart   : getId(it.sparepart),
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      customPrice: it.customPrice,
      vat: it.vat,
    }));
    return {
      company: cid,
      customer: cust,
      items,
      shippingCost: initial.shippingCost,
      additionalFees: initial.additionalFees,
      discount: initial.discount,
      currency: initial.currency,
      validUntil: initial.validUntil,
      notes: initial.notes,
      paymentTerms: initial.paymentTerms,
      contactPerson: initial.contactPerson,
    };
  });

  useEffect(() => {
    setLines(
      initial?.items
        ? (initial.items as any[]).map((it: any) => ({
            productType: it.productType,
            ensotekprod: typeof it.ensotekprod === "string" ? it.ensotekprod : getId(it.ensotekprod),
            sparepart:   typeof it.sparepart   === "string" ? it.sparepart   : getId(it.sparepart),
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice,
            customPrice: it.customPrice,
            vat: it.vat ?? 19,
          }))
        : [{ productType: "ensotekprod", quantity: 1, vat: 19 }]
    );
  }, [initial]);

  /* submit */
  const collectFormPayload = () => ({
    company,
    customer,
    items: lines.map<IOfferItemInput>((l) => ({
      productType: l.productType,
      ...(l.ensotekprod ? { ensotekprod: l.ensotekprod } : {}),
      ...(l.sparepart ? { sparepart: l.sparepart } : {}),
      quantity: Number(l.quantity) || 1,
      ...(l.unitPrice != null ? { unitPrice: Number(l.unitPrice) } : {}),
      ...(l.customPrice != null ? { customPrice: Number(l.customPrice) } : {}),
      ...(l.vat != null ? { vat: Number(l.vat) } : {}),
    })),
    shippingCost: Number(shippingCost) || 0,
    additionalFees: Number(additionalFees) || 0,
    discount: Number(discount) || 0,
    currency,
    validUntil: new Date(validUntil).toISOString(),
    notes: notes.trim() ? withCurrentLocale(notes.trim()) : undefined,
    paymentTerms: paymentTerms.trim() ? withCurrentLocale(paymentTerms.trim()) : undefined,
    contactPerson: contactPerson || undefined,
  });

  const canSubmit =
    mode === "json" ||
    (!!company &&
      !!customer &&
      lines.length > 0 &&
      lines.every((l) => l.productType && (l.ensotekprod || l.sparepart) && l.quantity > 0));

  const [lastOffer, setLastOffer] = useState<any>(null);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const payload = mode === "json" ? jsonPayload : collectFormPayload();
    try {
      const saved = initial?._id
        ? await (dispatch(updateOffer({ id: (initial as any)._id, data: payload }) as any).unwrap())
        : await (dispatch(createOffer(payload) as any).unwrap());
      const returned = (saved?.data || saved) as any;
      setLastOffer(returned);
      onSaved?.();
    } catch {}
  };

  /* seçenekler */
  const fmtPrice = (n?: number) => (typeof n === "number" ? `• ${n}` : "");
  const optOf = useCallback(
    (arr: any[], labelKey = "name"): Opt[] =>
      toArray(arr)
        .map((x: any) => {
          const id = getId(x) || getId(x?._id);
          if (!id) return null;
          return {
            id: String(id),
            label: [ml(x?.[labelKey]), x?.brand].filter(Boolean).join(" — ") || String(id),
            sub: [fmtPrice(x?.price), x?.stock != null ? `stk:${x.stock}` : ""].filter(Boolean).join(" "),
          };
        })
        .filter(Boolean) as Opt[],
    [ml]
  );
  const ensotekOpts = useMemo<Opt[]>(() => optOf(ensotekItems, "name"), [ensotekItems, optOf]);
  const spareOpts   = useMemo<Opt[]>(() => optOf(sparepartItems, "name"), [sparepartItems, optOf]);

  const rawCompanyOpts: Opt[] = useMemo<Opt[]>(
    () =>
      normalizeCompanyList(companyAdminObj)
        .map((c: any) => {
          const id = getId(c) || getId(c?._id);
          if (!id) return null;
          const label = ml(c?.companyName || c?.name) || String(id);
          return { id: String(id), label };
        })
        .filter(Boolean) as Opt[],
    [companyAdminObj, ml]
  );
  const rawCustomerOpts: Opt[] = useMemo<Opt[]>(
    () =>
      customers
        .map((c: any) => {
          const id = getId(c) || getId(c?._id);
          if (!id) return null;
          const label = ml(c?.companyName || c?.contactName || c?.name) || String(id);
          return { id: String(id), label };
        })
        .filter(Boolean) as Opt[],
    [customers, ml]
  );

  const selectedCompanyObj = useMemo(() => {
    if (company && companiesById[company]) return companiesById[company];
    if (typeof initial?.company !== "string" && initial?.company) return initial?.company as any;
    if (!isEdit && singleCompany) return singleCompany;
    return null;
  }, [company, companiesById, initial, isEdit, singleCompany]);

  const selectedCompanyLabel =
    (selectedCompanyObj && (ml((selectedCompanyObj as any).companyName || (selectedCompanyObj as any).name))) ||
    (company ? String(company) : "—");

  const selectedCustomerLabel =
    (typeof initial?.customer !== "string" && initial?.customer
      ? ml((initial?.customer as any)?.companyName || (initial?.customer as any)?.contactName || (initial?.customer as any)?.name)
      : "") ||
    ml(customersById[customer]?.companyName || customersById[customer]?.contactName || customersById[customer]?.name) ||
    (customer ? String(customer) : "—");

  const companyOpts  = ensureSelectedIn(rawCompanyOpts, company, selectedCompanyLabel);
  const customerOpts = ensureSelectedIn(rawCustomerOpts, customer, selectedCustomerLabel);

  /* PDF linkleri (sadece link) */
  const currentPdfUrl =
    (lastOffer && (lastOffer as any).pdfUrl) || ((initial as any)?.pdfUrl as string | undefined);
  const currentOfferNo =
    (lastOffer && (lastOffer as any).offerNumber) || ((initial as any)?.offerNumber as string | undefined);
  const [cbv, setCbv] = useState(0);

  const openHref = makeOpenUrl(currentPdfUrl, cbv);
  const downloadHref = makeDownloadUrl(currentPdfUrl, cbv);

  /* totals */
  const totals = useMemo(() => {
    const lineCalc = lines.map((l) => {
      const unit = Number(l.customPrice ?? l.unitPrice ?? 0);
      const qty  = Number(l.quantity || 0);
      const vatP = Number(l.vat ?? 0);
      const net  = unit * qty;
      const vat  = net * (vatP / 100);
      const gross = net + vat;
      return { net, vat, gross };
    });
    const totalNet  = lineCalc.reduce((s, x) => s + x.net, 0);
    const totalVat  = lineCalc.reduce((s, x) => s + x.vat, 0);
    const totalGrossLines = lineCalc.reduce((s, x) => s + x.gross, 0);
    const grand = Math.max(0, totalGrossLines + Number(shippingCost || 0) + Number(additionalFees || 0) - Number(discount || 0));
    return { totalNet, totalVat, totalGross: totalGrossLines, grand };
  }, [lines, shippingCost, additionalFees, discount]);

  const fmtMoney = (n?: number) => {
    try { return new Intl.NumberFormat(undefined, { style:"currency", currency }).format(Number(n)||0); }
    catch { const x = Number(n)||0; return `${x.toFixed(2)} ${currency}`.trim(); }
  };

  /* ============ render ============ */
  return (
    <PageWrap>
      <PageHead>
        <div>
          <H1>{isEdit ? t("form.editTitle", "Edit Offer") : t("form.createTitle", "Create Offer")}</H1>
        </div>

        <ModeSwitch role="tablist" aria-label={t("form.mode", "Input Mode")}>
          <SegBtn type="button" data-active={mode === "form"} onClick={() => setMode("form")}>{t("form.simpleMode", "Form")}</SegBtn>
          <SegBtn type="button" data-active={mode === "json"} onClick={() => { setJsonPayload(collectFormPayload()); setMode("json"); }}>
            {t("form.jsonMode", "JSON")}
          </SegBtn>
        </ModeSwitch>
      </PageHead>

      {lastOffer && (
        <Card role="status" aria-live="polite">
          <strong>{t("form.lastOffer", "Last Offer")}:</strong>{" "}
          <Mono>{(lastOffer as any).offerNumber}</Mono>{" "}
          {(lastOffer as any).pdfUrl
            ? <SmallMuted>PDF linki hazır.</SmallMuted>
            : <SmallMuted>{t("form.pdfPending", "PDF is being generated…")}</SmallMuted>}
        </Card>
      )}

      {/* Sadece link – önizleme yok */}
      {currentPdfUrl && (
        <Card>
          <PdfBar>
            <span><strong>PDF</strong>{currentOfferNo ? ` (${currentOfferNo})` : ""}</span>
            <PdfActions>
              <Ghost as="button" type="button" onClick={() => setCbv((s) => s + 1)}>Refresh</Ghost>
              <Ghost as="a" href={openHref || "#"} target="_blank" rel="noreferrer">Open</Ghost>
              {/* cross-origin'de download attr. yok sayılır */}
              <Ghost as="a" href={downloadHref || "#"} rel="noreferrer">Download</Ghost>
            </PdfActions>
          </PdfBar>
        </Card>
      )}

      {mode === "json" && (
        <Card>
          <JSONEditor
            label={t("form.jsonPayload", "Offer payload (Create/Update)")}
            value={jsonPayload}
            onChange={setJsonPayload}
            placeholder='{\n  "company": "<id>",\n  "customer": "<id>",\n  "items": [ ... ]\n}'
          />
        </Card>
      )}

      {mode === "form" && (
        <Form onSubmit={onSubmit}>
          <Card>
            <Grid>
              <Field>
                <Label>{t("form.company", "Company")}</Label>
                {!isEdit && singleCompanyId ? (
                  <>
                    <ReadonlyInput value={selectedCompanyLabel} readOnly aria-readonly="true" />
                    <HelpLine>{t("form.selectedCompany", "Selected")}: {selectedCompanyLabel}</HelpLine>
                  </>
                ) : (
                  <Select value={company} onChange={(e) => setCompany(e.target.value)} required>
                    <option value="">{t("form.selectCompany", "Select…")}</option>
                    {companyOpts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </Select>
                )}
              </Field>

              <Field>
                <Label>{t("form.customer", "Customer")}</Label>
                <Select value={customer} onChange={(e) => setCustomer(e.target.value)} required>
                  <option value="">{t("form.selectCustomer", "Select…")}</option>
                  {customerOpts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </Select>
              </Field>
            </Grid>

            <Grid>
              <Field>
                <Label>{t("form.contactPerson", "Contact person")}</Label>
                <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="—" />
              </Field>
              <Field>
                <Label>{t("form.validUntil", "Valid until")}</Label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </Field>
              <Field>
                <Label>{t("form.currency", "Currency")}</Label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {["EUR","USD","TRY"].map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </Grid>
          </Card>

          <SectionTitle>{t("form.items", "Items")}</SectionTitle>
          <ItemsSection
            t={tStr}
            lines={lines}
            ensotekOpts={ensotekOpts}
            spareOpts={spareOpts}
            ensotekById={ensotekById}
            spareById={spareById}
            ml={ml}
            addLine={addLine}
            removeLine={removeLine}
            patchLine={patchLine}
          />

          <SectionTitle>{t("form.costs", "Costs / Discounts")}</SectionTitle>
          <CostsSection
            t={tStr}
            shippingCost={shippingCost}
            setShippingCost={setShippingCost}
            additionalFees={additionalFees}
            setAdditionalFees={setAdditionalFees}
            discount={discount}
            setDiscount={setDiscount}
            paymentTerms={paymentTerms}
            setPaymentTerms={setPaymentTerms}
            notes={notes}
            setNotes={setNotes}
          />

          <TotalsSection
            t={tStr}
            totals={totals}
            currency={currency}
            fmtMoney={fmtMoney}
            shippingCost={shippingCost}
            additionalFees={additionalFees}
            discount={discount}
          />

          <Actions>
            <Secondary type="button" onClick={onClose}>{t("common.cancel","Cancel")}</Secondary>
            <Primary type="submit" disabled={!canSubmit} aria-disabled={!canSubmit}>
              {isEdit ? t("form.save","Save") : t("form.create","Create")}
            </Primary>
          </Actions>
        </Form>
      )}
    </PageWrap>
  );
}

/* ============ styled ============ */
const PageWrap = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md}; width:100%;`;
const PageHead = styled.header`display:flex; align-items:flex-end; justify-content:space-between; gap:${({theme})=>theme.spacings.sm}; ${({theme})=>theme.media.mobile}{ flex-direction:column; align-items:stretch; }`;
const ModeSwitch = styled.div`display:flex; gap:6px;`;
const SegBtn = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  &[data-active="true"]{
    border-color:${({theme})=>theme.buttons.primary.backgroundHover};
    background:${({theme})=>theme.buttons.primary.background};
    color:${({theme})=>theme.buttons.primary.text};
  }
`;
const H1 = styled.h1`margin:0; font-size:${({theme})=>theme.fontSizes.large}; color:${({theme})=>theme.colors.title};`;
const Card = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.xl};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const HelpLine = styled.div`margin-top:4px; font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
const Form = styled.form`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
const Field = styled.div`min-width:0;`;
const Grid = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.md};
  grid-template-columns: repeat(3, minmax(0,1fr));
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;
const Label = styled.label`display:block; margin-bottom:6px; color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const inputBase = css`
  width:100%; padding:12px 14px;
  border-radius:${({theme})=>theme.radii.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.colors.inputBackground};
  color:${({theme})=>theme.inputs.text}; min-width:0;
  transition:border-color ${({theme})=>theme.transition.fast},
             background ${({theme})=>theme.transition.fast},
             box-shadow ${({theme})=>theme.transition.fast};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus};
           box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;
const Input = styled.input`${inputBase}`;
const ReadonlyInput = styled(Input).attrs({ readOnly: true })`opacity:.8; cursor:default;`;
const Select = styled.select`
  ${inputBase}; appearance:none;
  background-image: linear-gradient(45deg, transparent 50%, ${({theme})=>theme.colors.textSecondary} 50%),
                    linear-gradient(135deg, ${({theme})=>theme.colors.textSecondary} 50%, transparent 50%),
                    linear-gradient(to right, transparent, transparent);
  background-position: calc(100% - 18px) 55%, calc(100% - 12px) 55%, calc(100% - 2.2rem) 0.4rem;
  background-size: 6px 6px, 6px 6px, 1px 2.2rem;
  background-repeat: no-repeat; padding-right: 2.4rem;
`;
const Mono = styled.code`font-family:${({theme})=>theme.fonts.mono}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const SmallMuted = styled.span`color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const SectionTitle = styled.h4`margin:0; font-size:${({theme})=>theme.fontSizes.md}; color:${({theme})=>theme.colors.title};`;
const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end; flex-wrap:wrap;`;
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
`;
const Secondary = styled.button`
  padding:10px 16px; border-radius:${({theme})=>theme.radii.xl};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;

/* küçük pdf barı */
const PdfBar = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.sm};
`;
const PdfActions = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs};`;
const Ghost = styled.a`text-decoration:underline; cursor:pointer;`;

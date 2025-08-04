"use client";
import React from "react";
import styled from "styled-components";
import { translations } from "@/modules/offer";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import type { Offer, OfferItem } from "@/modules/offer/types";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES, LANG_LABELS } from "@/types/common";

interface OfferEditModalProps {
  offer: Offer | null;
  onClose: () => void;
  onSubmit: (update: Partial<Offer>) => void;
  loading?: boolean;
}

const CURRENCY_OPTIONS = ["EUR", "USD", "TRY"];

const OfferEditModal: React.FC<OfferEditModalProps> = ({
  offer,
  onClose,
  onSubmit,
  loading,
}) => {
  const { t, i18n } = useI18nNamespace("offer", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  // ValidUntil ISO formatını (yyyy-MM-dd) input date için dönüştür
  function getDateInputValue(dt?: string | Date) {
    if (!dt) return "";
    if (typeof dt === "string" && dt.includes("T")) return dt.slice(0, 10);
    if (typeof dt === "string") return dt;
    try { return (dt as Date).toISOString().slice(0, 10); } catch { return ""; }
  }

  const emptyNotes = React.useMemo(
    () => SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: offer?.notes?.[l] || "" }), {} as Record<SupportedLocale, string>),
    [offer]
  );
  const emptyPaymentTerms = React.useMemo(
    () => SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: offer?.paymentTerms?.[l] || "" }), {} as Record<SupportedLocale, string>),
    [offer]
  );

  // State
  const [notes, setNotes] = React.useState<Record<SupportedLocale, string>>(emptyNotes);
  const [paymentTerms, setPaymentTerms] = React.useState<Record<SupportedLocale, string>>(emptyPaymentTerms);
  const [shippingCost, setShippingCost] = React.useState<number>(offer?.shippingCost || 0);
  const [additionalFees, setAdditionalFees] = React.useState<number>(offer?.additionalFees || 0);
  const [discount, setDiscount] = React.useState<number>(offer?.discount || 0);
  const [currency, setCurrency] = React.useState<string>(offer?.currency || "EUR");
  const [validUntil, setValidUntil] = React.useState<string>(getDateInputValue(offer?.validUntil));
  const [items, setItems] = React.useState<OfferItem[]>(offer?.items ? offer.items.map(i => ({ ...i })) : []);

  React.useEffect(() => {
    if (!offer) return;
    setNotes(SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: offer?.notes?.[l] || "" }), {} as Record<SupportedLocale, string>));
    setPaymentTerms(SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: offer?.paymentTerms?.[l] || "" }), {} as Record<SupportedLocale, string>));
    setShippingCost(offer.shippingCost || 0);
    setAdditionalFees(offer.additionalFees || 0);
    setDiscount(offer.discount || 0);
    setCurrency(offer.currency || "EUR");
    setValidUntil(getDateInputValue(offer.validUntil));
    setItems(offer.items.map(i => ({ ...i })));
  }, [offer]);

  // Item update
  const handleItemChange = (idx: number, field: keyof OfferItem, value: any) => {
    setItems(items =>
      items.map((item, i) =>
        i !== idx
          ? item
          : {
              ...item,
              [field]: value,
              total:
                Number(field === "customPrice" ? value : item.customPrice ?? item.unitPrice) *
                Number(field === "quantity" ? value : item.quantity),
            }
      )
    );
  };

  // Toplamlar
  const calcTotalNet = items.reduce(
    (sum, i) => sum + Number(i.customPrice ?? i.unitPrice) * Number(i.quantity), 0
  );
  const calcTotalVat = items.reduce(
    (sum, i) =>
      sum +
      ((Number(i.customPrice ?? i.unitPrice) * Number(i.quantity) * Number(i.vat || 0)) / 100), 0
  );
  const calcGross =
    calcTotalNet +
    calcTotalVat +
    Number(shippingCost) +
    Number(additionalFees) -
    Number(discount);

  // PATCH/PUT öncesi sanitizasyon ve zorunlu alanlar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // company/customer tip kontrolü (_id vs string)
    const companyId = typeof offer?.company === "object" ? offer?.company?._id : offer?.company;
    const customerId = typeof offer?.customer === "object" ? offer?.customer?._id : offer?.customer;

    // item.product ve item.ensotekprod string olsun
    const sanitizedItems = items.map(item => ({
      ...item,
      product: typeof item.product === "object" && item.product?._id ? item.product._id : typeof item.product === "string" ? item.product : undefined,
      ensotekprod: typeof item.ensotekprod === "object" && item.ensotekprod?._id ? item.ensotekprod._id : typeof item.ensotekprod === "string" ? item.ensotekprod : undefined,
      total: Number(item.total) || 0,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      customPrice: item.customPrice !== undefined ? Number(item.customPrice) : undefined,
      vat: Number(item.vat) || 0,
    }));

    onSubmit({
      company: companyId,                 // ObjectId (string)
      customer: customerId,               // ObjectId (string)
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined, // ISO date
      currency,
      notes,
      paymentTerms,
      shippingCost: Number(shippingCost) || 0,
      additionalFees: Number(additionalFees) || 0,
      discount: Number(discount) || 0,
      items: sanitizedItems,
      totalNet: calcTotalNet,
      totalVat: calcTotalVat,
      totalGross: calcGross,
    });
  };

  if (!offer) return null;

  return (
    <Overlay>
      <ModalBox>
        <Header>
          <EditTitle>
            <span>{t("admin.editOffer", "Edit Offer")}: </span>
            <OfferNum> {offer.offerNumber} </OfferNum>
          </EditTitle>
          <CloseBtn type="button" onClick={onClose} aria-label={t("close", "Close")}>
            &times;
          </CloseBtn>
        </Header>
        <FormInner onSubmit={handleSubmit} autoComplete="off">
          {/* Tarih ve Para birimi alanları */}
          <SectionTitle style={{ marginBottom: 8 }}>
            {t("validUntil", "Valid Until & Currency")}
          </SectionTitle>
          <FlexRow>
            <div>
              <Label>{t("validUntil", "Valid Until")}</Label>
              <StyledInput
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                disabled={loading}
                required
                style={{ minWidth: 140 }}
              />
            </div>
            <div>
              <Label>{t("currency", "Currency")}</Label>
              <StyledSelect
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                disabled={loading}
                style={{ minWidth: 90 }}
              >
                {CURRENCY_OPTIONS.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </StyledSelect>
            </div>
          </FlexRow>

          {/* Notlar ve ödeme şartları */}
          <SectionTitle>{t("notes", "Notes")}</SectionTitle>
          <LangCards>
            {SUPPORTED_LOCALES.map(lng => (
              <LangCard key={lng}>
                <Label>{LANG_LABELS[lng]}</Label>
                <StyledTextArea
                  value={notes[lng] || ""}
                  onChange={e => setNotes(n => ({ ...n, [lng]: e.target.value }))}
                  rows={2}
                  placeholder={t("notesPlaceholder", "Enter notes...", { lng })}
                  disabled={loading}
                  autoFocus={lng === lang}
                />
              </LangCard>
            ))}
          </LangCards>
          <SectionTitle style={{ marginTop: 24 }}>{t("paymentTerms", "Payment Terms")}</SectionTitle>
          <LangCards>
            {SUPPORTED_LOCALES.map(lng => (
              <LangCard key={lng}>
                <Label>{LANG_LABELS[lng]}</Label>
                <StyledInput
                  value={paymentTerms[lng] || ""}
                  onChange={e => setPaymentTerms(pt => ({ ...pt, [lng]: e.target.value }))}
                  placeholder={t("paymentTermsPlaceholder", "Enter payment terms...", { lng })}
                  disabled={loading}
                />
              </LangCard>
            ))}
          </LangCards>

          {/* Kalemler */}
          <SectionTitle style={{ marginTop: 28 }}>{t("admin.offerItems", "Offer Items")}</SectionTitle>
          <ItemsTable>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("product", "Product")}</th>
                <th>{t("quantity", "Qty")}</th>
                <th>{t("unitPrice", "Unit Price")}</th>
                <th>{t("customPrice", "Custom Price")}</th>
                <th>{t("vat", "VAT")}</th>
                <th>{t("total", "Total")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>
                      {item.productName?.[lang] ?? "-"}
                    </span>
                  </td>
                  <td>
                    <StyledInput
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, "quantity", Math.max(1, Number(e.target.value)))}
                      disabled={loading}
                      style={{ width: 54 }}
                    />
                  </td>
                  <td>
                    <StyledInput
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={e => handleItemChange(idx, "unitPrice", Math.max(0, Number(e.target.value)))}
                      disabled={loading}
                      style={{ width: 72 }}
                    />
                  </td>
                  <td>
                    <StyledInput
                      type="number"
                      min={0}
                      value={item.customPrice ?? ""}
                      onChange={e => handleItemChange(idx, "customPrice", Math.max(0, Number(e.target.value)))}
                      disabled={loading}
                      style={{ width: 72 }}
                    />
                  </td>
                  <td>
                    <StyledInput
                      type="number"
                      min={0}
                      value={item.vat}
                      onChange={e => handleItemChange(idx, "vat", Math.max(0, Number(e.target.value)))}
                      disabled={loading}
                      style={{ width: 45 }}
                    />
                    %
                  </td>
                  <td>
                    <b>
                      {(Number(item.customPrice ?? item.unitPrice) * Number(item.quantity)).toLocaleString(lang, {
                        minimumFractionDigits: 2,
                      })}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </ItemsTable>

          {/* Fiyat Ayarlamaları */}
          <SectionTitle style={{ marginTop: 18 }}>{t("admin.priceAdjustments", "Price Adjustments")}</SectionTitle>
          <PriceGrid>
            <div>
              <Label>{t("shippingCost", "Shipping Cost")}</Label>
              <StyledInput
                type="number"
                min={0}
                value={shippingCost}
                onChange={e => setShippingCost(Math.max(0, Number(e.target.value)))}
                disabled={loading}
              />
            </div>
            <div>
              <Label>{t("additionalFees", "Additional Fees")}</Label>
              <StyledInput
                type="number"
                min={0}
                value={additionalFees}
                onChange={e => setAdditionalFees(Math.max(0, Number(e.target.value)))}
                disabled={loading}
              />
            </div>
            <div>
              <Label>{t("discount", "Discount")}</Label>
              <StyledInput
                type="number"
                min={0}
                value={discount}
                onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                disabled={loading}
              />
            </div>
          </PriceGrid>
          {/* Totals */}
          <Totals>
            <div>
              <b>{t("subtotal", "Subtotal")}: </b>
              {calcTotalNet.toLocaleString(lang, { minimumFractionDigits: 2 })} {currency}
            </div>
            <div>
              <b>{t("vat", "VAT")}: </b>
              {calcTotalVat.toLocaleString(lang, { minimumFractionDigits: 2 })} {currency}
            </div>
            <div>
              <b>{t("shipping", "Shipping")}: </b>
              {Number(shippingCost).toLocaleString(lang, { minimumFractionDigits: 2 })} {currency}
            </div>
            <div>
              <b>{t("discount", "Discount")}: </b>
              -{Number(discount).toLocaleString(lang, { minimumFractionDigits: 2 })} {currency}
            </div>
            <div style={{ fontSize: "1.13em", marginTop: 2, fontWeight: 700 }}>
              <b>{t("totalGross", "Total")}: </b>
              {calcGross.toLocaleString(lang, { minimumFractionDigits: 2 })} {currency}
            </div>
          </Totals>
          <ActionBar>
            <ActionBtn type="submit" disabled={loading}>
              {t("save", "Save")}
            </ActionBtn>
            <CancelBtn type="button" onClick={onClose} disabled={loading}>
              {t("cancel", "Cancel")}
            </CancelBtn>
          </ActionBar>
        </FormInner>
      </ModalBox>
    </Overlay>
  );
};

export default OfferEditModal;

// --- Styled aynı, Sadece 2 alan eklendi: FlexRow ve StyledSelect ---
const Overlay = styled.div`
  z-index: 9999;
  position: fixed;
  inset: 0;
  background: rgba(30,40,50,0.24);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 46px;
  overflow-y: auto;
`;

const ModalBox = styled.div`
  background: #fff;
  padding: 34px 30px 18px 30px;
  border-radius: 18px;
  min-width: 400px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 8px 30px rgba(15,20,45,0.11);
  position: relative;
  @media (max-width: 900px) { min-width: unset; }
`;

const FormInner = styled.form`
  max-height: 74vh;
  overflow-y: auto;
  padding-bottom: 10px;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
`;

const EditTitle = styled.div`
  font-size: 1.27em;
  font-weight: 700;
  color: #2255b7;
  letter-spacing: 0.01em;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OfferNum = styled.span`
  font-family: "JetBrains Mono", monospace;
  color: #293657;
  font-weight: 600;
  font-size: 0.93em;
`;

const CloseBtn = styled.button`
  border: none; background: none; font-size: 2em; color: #aaa; cursor: pointer;
  line-height: 1; margin-left: 8px;
  &:hover { color: #d32f2f; }
`;

const SectionTitle = styled.div`
  font-size: 1.12em;
  font-weight: 600;
  color: #355;
  margin: 18px 0 7px 0;
  letter-spacing: 0.01em;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 32px;
  align-items: flex-end;
  margin-bottom: 14px;
  @media (max-width: 750px) { flex-direction: column; gap: 8px; }
`;

const LangCards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  @media (max-width: 900px) { gap: 6px; }
`;

const LangCard = styled.div`
  background: #f6f8fa;
  border-radius: 13px;
  box-shadow: 0 2px 10px rgba(22,35,80,0.04);
  flex: 1 0 180px;
  min-width: 180px;
  max-width: 270px;
  padding: 13px 15px 9px 15px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.div`
  font-weight: 600; font-size: 0.99em; margin-bottom: 4px; color: #344;
`;

const StyledTextArea = styled.textarea`
  background: #fff;
  border: 1.5px solid #d2dbf0;
  border-radius: 7px;
  min-height: 46px;
  font-size: 1.04em;
  font-family: inherit;
  padding: 8px 12px;
  resize: vertical;
  &:focus { border-color: #7aa9fc; outline: none; }
`;

const StyledInput = styled.input`
  background: #fff;
  border: 1.5px solid #d2dbf0;
  border-radius: 7px;
  font-size: 1.03em;
  font-family: inherit;
  padding: 6px 10px;
  margin-bottom: 2px;
  &:focus { border-color: #7aa9fc; outline: none; }
`;

const StyledSelect = styled.select`
  background: #fff;
  border: 1.5px solid #d2dbf0;
  border-radius: 7px;
  font-size: 1.03em;
  font-family: inherit;
  padding: 6px 10px;
  margin-bottom: 2px;
  &:focus { border-color: #7aa9fc; outline: none; }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 13px 0 10px 0;
  th, td {
    border-bottom: 1px solid #e7e8ea;
    padding: 0.35em 0.49em;
    font-size: 1em;
    text-align: left;
    vertical-align: middle;
  }
  th {
    color: #476;
    background: #f7fafd;
    font-weight: 600;
  }
  tr:last-child td {
    border-bottom: none;
  }
  td input {
    font-size: 0.99em;
  }
`;

const PriceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 13px 18px;
  margin-bottom: 13px;
  @media (max-width: 750px) { grid-template-columns: 1fr; }
`;

const Totals = styled.div`
  margin: 10px 0 18px 0;
  font-size: 1.07em;
  background: #f8fafc;
  border-radius: 11px;
  padding: 10px 18px;
  line-height: 2;
  border: 1.5px solid #e1e7ef;
`;

const ActionBar = styled.div`
  display: flex; gap: 13px; margin-top: 16px; justify-content: flex-end;
  padding-bottom: 4px;
`;

const ActionBtn = styled.button`
  background: #2d72fd; color: #fff; border: none; padding: 9px 33px;
  border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1.07em;
  box-shadow: 0 1px 6px rgba(40,85,220,0.04);
  &:disabled { opacity: 0.65; }
`;
const CancelBtn = styled(ActionBtn)`
  background: #d2dae9; color: #293657;
  &:hover { background: #b3bad3; }
`;

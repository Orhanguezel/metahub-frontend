"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/contacts/locales";
import { createContact, updateContact } from "@/modules/contacts/slice/contactsSlice";
import type {
  IContact, ContactKind, IEmail, IPhone, IAddress, IBillingInfo
} from "@/modules/contacts/types";

interface Props {
  initial?: IContact;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ContactForm({ initial, onClose, onSaved }: Props) {
  const { t } = useI18nNamespace("contacts", translations);
  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?._id);

  /* ---- state ---- */
  const [kind, setKind] = useState<ContactKind>(initial?.kind || "person");
  const [firstName, setFirstName] = useState(initial?.firstName || "");
  const [lastName, setLastName] = useState(initial?.lastName || "");
  const [legalName, setLegalName] = useState(initial?.legalName || "");
  const [tradeName, setTradeName] = useState(initial?.tradeName || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [notes, setNotes] = useState(initial?.notes || "");

  const [emails, setEmails] = useState<IEmail[]>(
    initial?.emails?.length ? initial.emails : [{ value: "", primary: true }]
  );
  const [phones, setPhones] = useState<IPhone[]>(
    initial?.phones?.length ? initial.phones : [{ value: "", primary: true }]
  );
  const [addresses, setAddresses] = useState<IAddress[]>(
    initial?.addresses?.length ? initial.addresses : [{}]
  );
  const [billing, setBilling] = useState<IBillingInfo>(initial?.billing || {});

  /* ---- helpers ---- */
  const hid = (k: string) => `contacts_form_${k}`;

  const addRow = <T,>(setFn: (v: T[]) => void, list: T[], blank: T) =>
    setFn([ ...list, blank ]);

  const removeRow = <T,>(setFn: (v: T[]) => void, list: T[], idx: number) =>
    setFn(list.filter((_, i) => i !== idx));

  const ensureSinglePrimary = <T extends { primary?: boolean }>(arr: T[], idx: number) =>
    arr.map((x, i) => ({ ...x, primary: i === idx }));

  const canSubmit = useMemo(() => {
    return kind === "person"
      ? Boolean(firstName.trim() || lastName.trim())
      : Boolean(legalName.trim() || tradeName.trim());
  }, [kind, firstName, lastName, legalName, tradeName]);

  /* ---- submit ---- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmails = (emails || [])
      .filter(e => e?.value && e.value.trim())
      .map(e => ({
        label: e.label?.trim() || undefined,
        value: e.value.trim().toLowerCase(),
        primary: !!e.primary,
      }));

    const cleanPhones = (phones || [])
      .filter(p => p?.value && p.value.trim())
      .map(p => ({
        label: p.label?.trim() || undefined,
        value: p.value.trim(),
        primary: !!p.primary,
      }));

    const cleanAddresses = (addresses || [])
      .map(a => ({
        label: a.label?.trim() || undefined,
        street: a.street?.trim() || undefined,
        number: a.number?.trim() || undefined,
        district: a.district?.trim() || undefined,
        city: a.city?.trim() || undefined,
        state: a.state?.trim() || undefined,
        zip: a.zip?.trim() || undefined,
        country: a.country?.trim() || undefined,
      }))
      .filter(a => Object.values(a).some(Boolean));

    const cleanBilling: IBillingInfo | undefined = (() => {
      const b: IBillingInfo = {
        iban: billing.iban?.trim() || undefined,
        bankName: billing.bankName?.trim() || undefined,
        taxNumber: billing.taxNumber?.trim() || undefined,
        currency: billing.currency?.trim() || undefined,
        defaultDueDayOfMonth: typeof billing.defaultDueDayOfMonth === "number"
          ? Math.max(1, Math.min(28, billing.defaultDueDayOfMonth))
          : undefined,
      };
      return Object.values(b).some(Boolean) ? b : undefined;
    })();

    const payload: Partial<IContact> = {
      kind,
      firstName: kind === "person" ? (firstName.trim() || undefined) : undefined,
      lastName:  kind === "person" ? (lastName.trim()  || undefined) : undefined,
      legalName: kind === "organization" ? (legalName.trim() || undefined) : undefined,
      tradeName: kind === "organization" ? (tradeName.trim() || undefined) : undefined,
      slug: slug.trim() || undefined, // boşsa BE slugify
      emails: cleanEmails,
      phones: cleanPhones,
      addresses: cleanAddresses,
      billing: cleanBilling,
      notes: notes.trim() || undefined,
      isActive,
    };

    if (isEdit && initial) {
      await dispatch(updateContact({ id: initial._id, changes: payload })).unwrap().catch(()=>{});
    } else {
      await dispatch(createContact(payload)).unwrap().catch(()=>{});
    }
    onSaved?.();
  };

  /* ---- render ---- */
  return (
    <Form onSubmit={onSubmit} aria-label={t("form.title","Contact Form")}>
      {/* Identity */}
      <Fieldset>
        <Legend>{t("legend.identity","Identity")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={hid("kind")}>{t("filters.kind","Kind")}</Label>
            <Select id={hid("kind")} value={kind} onChange={(e)=>setKind(e.target.value as ContactKind)}>
              <option value="person">{t("kinds.person","Person")}</option>
              <option value="organization">{t("kinds.organization","Organization")}</option>
            </Select>
          </Col>

          {kind === "person" ? (
            <>
              <Col>
                <Label htmlFor={hid("firstName")}>{t("labels.firstName","First Name")}</Label>
                <Input id={hid("firstName")} value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
              </Col>
              <Col>
                <Label htmlFor={hid("lastName")}>{t("labels.lastName","Last Name")}</Label>
                <Input id={hid("lastName")} value={lastName} onChange={(e)=>setLastName(e.target.value)} />
              </Col>
            </>
          ) : (
            <>
              <Col>
                <Label htmlFor={hid("legalName")}>{t("labels.legalName","Legal Name")}</Label>
                <Input id={hid("legalName")} value={legalName} onChange={(e)=>setLegalName(e.target.value)} />
              </Col>
              <Col>
                <Label htmlFor={hid("tradeName")}>{t("labels.tradeName","Trade Name")}</Label>
                <Input id={hid("tradeName")} value={tradeName} onChange={(e)=>setTradeName(e.target.value)} />
              </Col>
            </>
          )}

          <Col>
            <Label htmlFor={hid("slug")}>{t("labels.slug","Slug")}</Label>
            <Input
              id={hid("slug")}
              value={slug}
              onChange={(e)=>setSlug(e.target.value)}
              placeholder={t("ph.slugAuto","auto if empty")}
              aria-describedby={hid("slug_help")}
            />
            <Hint id={hid("slug_help")}>{t("help.slug","If empty, it will be generated automatically.")}</Hint>
          </Col>
        </Row>
      </Fieldset>

      {/* Emails */}
      <Fieldset>
        <Legend>{t("labels.emails","Emails")}</Legend>
        {emails.map((e, idx)=>(
          <Row key={`em-${idx}`}>
            <Col>
              <Label htmlFor={hid(`email_label_${idx}`)}>{t("labels.label","Label")}</Label>
              <Input id={hid(`email_label_${idx}`)} value={e.label || ""} onChange={(ev)=>setEmails(emails.map((x,i)=> i===idx ? { ...x, label: ev.target.value } : x))} />
            </Col>
            <Col>
              <Label htmlFor={hid(`email_value_${idx}`)}>{t("labels.email","Email")}</Label>
              <Input id={hid(`email_value_${idx}`)} value={e.value} onChange={(ev)=>setEmails(emails.map((x,i)=> i===idx ? { ...x, value: ev.target.value } : x))} />
            </Col>
            <Col>
              <Label>{t("labels.primary","Primary")}</Label>
              <CheckRow htmlFor={hid(`email_primary_${idx}`)}>
                <input id={hid(`email_primary_${idx}`)} type="checkbox" checked={!!e.primary} onChange={()=>setEmails(ensureSinglePrimary(emails, idx))} />
                <span>{e.primary ? t("common.yes","Yes") : t("common.no","No")}</span>
              </CheckRow>
            </Col>
            <BtnRow>
              <Small type="button" onClick={(ev)=>{ev.preventDefault(); addRow(setEmails, emails, { value: "" });}}>
                {t("actions.add","Add")}
              </Small>
              {emails.length > 1 && (
                <Small type="button" onClick={(ev)=>{ev.preventDefault(); removeRow(setEmails, emails, idx);}}>
                  {t("actions.remove","Remove")}
                </Small>
              )}
            </BtnRow>
          </Row>
        ))}
      </Fieldset>

      {/* Phones */}
      <Fieldset>
        <Legend>{t("labels.phones","Phones")}</Legend>
        {phones.map((p, idx)=>(
          <Row key={`ph-${idx}`}>
            <Col>
              <Label htmlFor={hid(`phone_label_${idx}`)}>{t("labels.label","Label")}</Label>
              <Input id={hid(`phone_label_${idx}`)} value={p.label || ""} onChange={(ev)=>setPhones(phones.map((x,i)=> i===idx ? { ...x, label: ev.target.value } : x))} />
            </Col>
            <Col>
              <Label htmlFor={hid(`phone_value_${idx}`)}>{t("labels.phone","Phone")}</Label>
              <Input id={hid(`phone_value_${idx}`)} value={p.value} onChange={(ev)=>setPhones(phones.map((x,i)=> i===idx ? { ...x, value: ev.target.value } : x))} />
            </Col>
            <Col>
              <Label>{t("labels.primary","Primary")}</Label>
              <CheckRow htmlFor={hid(`phone_primary_${idx}`)}>
                <input id={hid(`phone_primary_${idx}`)} type="checkbox" checked={!!p.primary} onChange={()=>setPhones(ensureSinglePrimary(phones, idx))} />
                <span>{p.primary ? t("common.yes","Yes") : t("common.no","No")}</span>
              </CheckRow>
            </Col>
            <BtnRow>
              <Small type="button" onClick={(ev)=>{ev.preventDefault(); addRow(setPhones, phones, { value: "" });}}>
                {t("actions.add","Add")}
              </Small>
              {phones.length > 1 && (
                <Small type="button" onClick={(ev)=>{ev.preventDefault(); removeRow(setPhones, phones, idx);}}>
                  {t("actions.remove","Remove")}
                </Small>
              )}
            </BtnRow>
          </Row>
        ))}
      </Fieldset>

      {/* Addresses */}
      <Fieldset>
        <Legend>{t("labels.addresses","Addresses")}</Legend>
        {addresses.map((a, idx)=>(
          <Row key={`ad-${idx}`}>
            <Col><Label htmlFor={hid(`addr_label_${idx}`)}>{t("labels.label","Label")}</Label>
              <Input id={hid(`addr_label_${idx}`)} value={a.label || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, label: ev.target.value } : x))} />
            </Col>
            <Col><Label htmlFor={hid(`addr_street_${idx}`)}>{t("labels.street","Street")}</Label>
              <Input id={hid(`addr_street_${idx}`)} value={a.street || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, street: ev.target.value } : x))} />
            </Col>
            <Col><Label htmlFor={hid(`addr_no_${idx}`)}>{t("labels.number","No")}</Label>
              <Input id={hid(`addr_no_${idx}`)} value={a.number || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, number: ev.target.value } : x))} />
            </Col>
            <Col><Label htmlFor={hid(`addr_district_${idx}`)}>{t("labels.district","District")}</Label>
              <Input id={hid(`addr_district_${idx}`)} value={a.district || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, district: ev.target.value } : x))} />
            </Col>
            <Col><Label htmlFor={hid(`addr_city_${idx}`)}>{t("labels.city","City")}</Label>
              <Input id={hid(`addr_city_${idx}`)} value={a.city || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, city: ev.target.value } : x))} />
            </Col>
            <Col><Label htmlFor={hid(`addr_state_${idx}`)}>{t("labels.state","State")}</Label>
              <Input id={hid(`addr_state_${idx}`)} value={a.state || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, state: ev.target.value } : x))} />
            </Col>
            <Col><Label htmlFor={hid(`addr_zip_${idx}`)}>{t("labels.zip","ZIP")}</Label>
              <Input id={hid(`addr_zip_${idx}`)} value={a.zip || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, zip: ev.target.value } : x))} />
            </Col>
            <Col><Label htmlFor={hid(`addr_country_${idx}`)}>{t("labels.country","Country")}</Label>
              <Input id={hid(`addr_country_${idx}`)} value={a.country || ""} onChange={(ev)=>setAddresses(addresses.map((x,i)=> i===idx ? { ...x, country: ev.target.value } : x))} />
            </Col>

            <BtnRow>
              <Small type="button" onClick={(ev)=>{ev.preventDefault(); addRow(setAddresses, addresses, {});}}>
                {t("actions.add","Add")}
              </Small>
              {addresses.length > 1 && (
                <Small type="button" onClick={(ev)=>{ev.preventDefault(); removeRow(setAddresses, addresses, idx);}}>
                  {t("actions.remove","Remove")}
                </Small>
              )}
            </BtnRow>
          </Row>
        ))}
      </Fieldset>

      {/* Billing */}
      <Fieldset>
        <Legend>{t("labels.billing","Billing")}</Legend>
        <Row>
          <Col>
            <Label htmlFor={hid("iban")}>IBAN</Label>
            <Input id={hid("iban")} value={billing.iban || ""} onChange={(e)=>setBilling({ ...billing, iban: e.target.value })} />
          </Col>
          <Col>
            <Label htmlFor={hid("bankName")}>{t("labels.bankName","Bank Name")}</Label>
            <Input id={hid("bankName")} value={billing.bankName || ""} onChange={(e)=>setBilling({ ...billing, bankName: e.target.value })} />
          </Col>
          <Col>
            <Label htmlFor={hid("taxNumber")}>{t("labels.taxNumber","Tax Number")}</Label>
            <Input id={hid("taxNumber")} value={billing.taxNumber || ""} onChange={(e)=>setBilling({ ...billing, taxNumber: e.target.value })} />
          </Col>
          <Col>
            <Label htmlFor={hid("currency")}>{t("labels.currency","Currency")}</Label>
            <Input id={hid("currency")} value={billing.currency || ""} onChange={(e)=>setBilling({ ...billing, currency: e.target.value })} />
          </Col>
          <Col>
            <Label htmlFor={hid("dueDay")}>{t("labels.defaultDueDayOfMonth","Due Day")}</Label>
            <Input
              id={hid("dueDay")}
              type="number" min={1} max={28}
              value={billing.defaultDueDayOfMonth ?? ""}
              onChange={(e)=>setBilling({ ...billing, defaultDueDayOfMonth: Number(e.target.value) || undefined })}
            />
          </Col>
        </Row>
      </Fieldset>

      {/* Notes & Active */}
      <Fieldset>
        <Legend>{t("legend.other","Other")}</Legend>
        <Row>
          <Col style={{ gridColumn: "1 / span 3" }}>
            <Label htmlFor={hid("notes")}>{t("labels.notes","Notes")}</Label>
            <TextArea id={hid("notes")} rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} />
          </Col>
          <Col>
            <Label htmlFor={hid("active")}>{t("labels.active","Active")}</Label>
            <CheckRow htmlFor={hid("active")}>
              <input id={hid("active")} type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
              <span>{isActive ? t("common.yes","Yes") : t("common.no","No")}</span>
            </CheckRow>
          </Col>
        </Row>
      </Fieldset>

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("actions.cancel","Cancel")}</Secondary>
        <Primary type="submit" disabled={!canSubmit}>
          {isEdit ? t("actions.update","Update") : t("actions.create","Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled (theme) ---- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;

const Fieldset = styled.fieldset`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md};
`;
const Legend = styled.legend`
  padding:0 ${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.textPrimary};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
`;

const Hint = styled.div`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  opacity:.8;
`;

const Row = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.md};
  grid-template-columns:repeat(4,1fr);
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;

const Col = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;

const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
  &::placeholder{color:${({theme})=>theme.colors.placeholder};}
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
`;

const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const BtnRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:flex-end;`;

const Small = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};
  cursor:pointer;
`;

const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;

const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};
  cursor:pointer;
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;

const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};
  cursor:pointer;
`;

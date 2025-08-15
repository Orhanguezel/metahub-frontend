"use client";
import styled from "styled-components";
import { Card, Sub, Label, Select, SmallRow, Input } from "../FormUI";
import { Opt } from "../formTypes";

type T = (k: string, d?: string) => string;

export default function ManagerContactSection({
  t, customerOptions, customerId, onSelectCustomer,
  linkContactToCustomer, setLinkContactToCustomer,
  contactName, setContactName, contactPhone, setContactPhone,
  contactEmail, setContactEmail, contactRole, setContactRole,
  onAutofill,
}: {
  t: T;
  customerOptions: Opt[];
  customerId: string;
  onSelectCustomer: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  linkContactToCustomer: boolean;
  setLinkContactToCustomer: (b: boolean) => void;
  contactName: string; setContactName: (v: string) => void;
  contactPhone: string; setContactPhone: (v: string) => void;
  contactEmail: string; setContactEmail: (v: string) => void;
  contactRole: string; setContactRole: (v: string) => void;
  onAutofill: () => void;
}) {
  return (
    <Card>
      <Sub>{t("form.managerBlock","Manager & Contact")}</Sub>

      <ManagerGrid>
        {/* Manager (full row) */}
        <div className="full">
          <Label>{t("form.manager","Manager (Customer)")}</Label>
          <Select value={customerId} onChange={onSelectCustomer}>
            <option value="">{t("form.managerAny","Select manager")}</option>
            {customerOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}{c.sub ? ` — ${c.sub}` : ""}
              </option>
            ))}
          </Select>

          <SmallRow className="helper">
            <input
              id="link-ctm"
              type="checkbox"
              checked={linkContactToCustomer}
              onChange={(e)=>setLinkContactToCustomer(e.target.checked)}
            />
            <label htmlFor="link-ctm">
              {t("form.linkContact","Link contact to this customer")}
            </label>
          </SmallRow>

          <SmallRow className="helper">
            <button type="button" onClick={onAutofill}>
              {t("form.fillFromCustomer","Fill contact from customer")}
            </button>
          </SmallRow>
        </div>

        {/* Three-up row (wraps responsively) */}
        <div>
          <Label>
            {t("form.contactName","Contact Name")}{" "}
            <span style={{color:"var(--danger, #f33)"}}>*</span>
          </Label>
          <Input value={contactName} onChange={(e)=>setContactName(e.target.value)} required />
        </div>

        <div>
          <Label>{t("form.phone","Phone")}</Label>
          <Input value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} />
        </div>

        <div>
          <Label>{t("form.email","Email")}</Label>
          <Input value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} />
        </div>

        {/* Role (full row) */}
        <div className="full">
          <Label>{t("form.role","Role")}</Label>
          <Input value={contactRole} onChange={(e)=>setContactRole(e.target.value)} />
        </div>
      </ManagerGrid>
    </Card>
  );
}

/* ---------- layout ---------- */
const ManagerGrid = styled.div`
  display: grid;
  gap: ${({theme}) => theme?.spacings?.sm || "12px"};
  /* Varsayılan: responsive otomatik kolonlar,
     hiçbir input 220px’den daralmaz */
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: end;

  /* Label üstte, alanlar tam genişlik */
  label { display:block; margin-bottom: .25rem; }
  select, input { width: 100%; }

  /* Yardımcı satırlar (checkbox & buton) daha kompakt ve taşıyabilir */
  .helper { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }

  /* Tam satır kaplayan bloklar */
  .full { grid-column: 1 / -1; }

  /* Büyük ekranlarda düzeni sabitle (manager tam satır,
     sonra 3 kolon; role yine tam satır) */
  @media (min-width: 1100px) {
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
  }
`;

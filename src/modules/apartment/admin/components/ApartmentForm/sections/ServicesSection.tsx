"use client";
import styled from "styled-components";
import type { Dispatch, SetStateAction } from "react";
import { Card, Sub, Bindings, BindingsHead, Empty, Select, Check, Input, Label } from "../FormUI";
import { Opt, SvcBind } from "../formTypes";

type T = (k: string, d?: string) => string;

type Props = {
  t: T;
  serviceBindings: SvcBind[];
  setServiceBindings: Dispatch<SetStateAction<SvcBind[]>>;
  serviceOpts: Opt[];
  planOpts: Opt[];
  templateOpts: Opt[];
  priceListOpts: Opt[];
};

export default function ServicesSection({
  t, serviceBindings, setServiceBindings, serviceOpts, planOpts, templateOpts, priceListOpts,
}: Props) {
  const addBinding = () =>
    setServiceBindings((prev) => [...prev, { service: "", isActive: true }]);

  const updateBinding = (idx: number, patch: Partial<SvcBind>) =>
    setServiceBindings((list) =>
      list.map((b, i) => (i === idx ? { ...b, ...patch } : b))
    );

  const removeBinding = (idx: number) =>
    setServiceBindings((list) => list.filter((_, i) => i !== idx));

  return (
    <Card>
      <Sub>{t("form.services","Services")}</Sub>

      <Bindings>
        <BindingsHead>
          <span>{t("form.services","Services")}</span>
          <AddBtn type="button" onClick={addBinding}>+ {t("form.add","Add")}</AddBtn>
        </BindingsHead>

        {serviceBindings.length === 0 && (
          <Empty>{t("form.noServices","No services added")}</Empty>
        )}

        {serviceBindings.map((b, idx) => (
          <Row key={idx}>
            <div>
              <Label>{t("form.selectService","Select service")}</Label>
              <Select
                value={b.service}
                onChange={(e) => updateBinding(idx, { service: e.target.value })}
              >
                <option value="">{t("form.selectService","Select service")}</option>
                {serviceOpts.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>{t("form.planOptional","Plan (optional)")}</Label>
              <Select
                value={b.schedulePlan || ""}
                onChange={(e) => updateBinding(idx, { schedulePlan: e.target.value || undefined })}
              >
                <option value="">{t("form.planOptional","Plan (optional)")}</option>
                {planOpts.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>{t("form.templateOptional","Template (optional)")}</Label>
              <Select
                value={b.operationTemplate || ""}
                onChange={(e) => updateBinding(idx, { operationTemplate: e.target.value || undefined })}
              >
                <option value="">{t("form.templateOptional","Template (optional)")}</option>
                {templateOpts.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>{t("form.priceItemOptional","Price item (optional)")}</Label>
              <Select
                value={b.priceListItem || ""}
                onChange={(e) => updateBinding(idx, { priceListItem: e.target.value || undefined })}
              >
                <option value="">{t("form.priceItemOptional","Price item (optional)")}</option>
                {priceListOpts.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}{o.sub ? ` — ${o.sub}` : ""}
                  </option>
                ))}
              </Select>
            </div>

            <Check style={{ alignSelf: "center" }}>
              <input
                id={`svc-active-${idx}`}
                type="checkbox"
                checked={!!b.isActive}
                onChange={(e) => updateBinding(idx, { isActive: e.target.checked })}
              />
              <label htmlFor={`svc-active-${idx}`}>{t("form.active","Active")}</label>
            </Check>

            <div className="notes">
              <Label>{t("form.notes","Notes")}</Label>
              <Input
                placeholder={t("form.notes","Notes")}
                value={b.notes || ""}
                onChange={(e) => updateBinding(idx, { notes: e.target.value })}
              />
            </div>

            <RemoveBtn
              type="button"
              title={t("form.remove","Remove")}
              aria-label={t("form.remove","Remove")}
              onClick={() => {
                if (serviceBindings.length <= 1 || confirm(t("form.remove","Remove") + "?")) {
                  removeBinding(idx);
                }
              }}
            >
              <span className="icon" aria-hidden>×</span>
              <span className="label">{t("form.remove","Remove")}</span>
            </RemoveBtn>
          </Row>
        ))}
      </Bindings>
    </Card>
  );
}
/* ---------- styles (overflow fix) ---------- */
const Row = styled.div`
  display: grid;
  gap: ${({theme}) => theme?.spacings?.xs || "10px"};

  /* Kolonlar 0'a kadar daralabilir; taşma yapmasın */
  grid-template-columns:
    minmax(0, 1.6fr)   /* Service */
    minmax(0, 1.2fr)   /* Plan */
    minmax(0, 1.2fr)   /* Template */
    minmax(0, 1.4fr)   /* Price item */
    max-content        /* Active */
    minmax(0, 1fr)     /* Notes */
    max-content;       /* Remove */

  align-items: end;

  /* GRİD ÇOCUKLARI: taşmayı engelle */
  & > * { min-width: 0; }
  /* İçteki input/select mutlaka konteyneri doldursun */
  & select, & input { width: 100%; max-width: 100%; }

  .notes { display: flex; flex-direction: column; gap: 6px; }

  /* Daha dar viewportlarda 2 kolon */
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    & > button { justify-self: end; }
  }
  /* Mobil: tek kolon */
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    & > button { justify-self: end; }
  }
`;

const AddBtn = styled.button`
  padding: 6px 10px;
  border-radius: ${({theme}) => theme?.radii?.md || "10px"};
  border: 1px solid ${({theme}) => theme?.colors?.border || "#e5e7eb"};
  background: ${({theme}) => theme?.colors?.cardBackground || "#fff"};
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: ${({theme}) => theme?.colors?.hoverBackground || "#f7f7f7"}; }
`;

const RemoveBtn = styled.button`
  align-self: center;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${({theme}) => theme?.colors?.danger || "#ef4444"};
  background: ${({theme}) => theme?.colors?.dangerBg || "rgba(239,68,68,.08)"};
  color: ${({theme}) => theme?.colors?.danger || "#ef4444"};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform .06s ease, background .15s ease, color .15s ease, border-color .15s ease;

  .icon { font-size: 18px; line-height: 1; }
  .label { font-size: 14px; }

  &:hover {
    background: ${({theme}) => theme?.colors?.danger || "#ef4444"};
    color: #fff;
    border-color: ${({theme}) => theme?.colors?.danger || "#ef4444"};
  }
  &:active { transform: scale(0.97); }

  /* Dar alanda sadece ikon kalsın (masaüstü konteyneri dar olduğunda da işe yarar) */
  @media (max-width: 1400px) {
    .label { display: none; }
  }
`;

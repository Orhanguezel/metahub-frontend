// src/modules/scheduling/ui/components/AnchorEditor.tsx
"use client";
import { useMemo, useCallback } from "react";
import styled, { css } from "styled-components";
import { IScheduleAnchor, TranslatedLabel } from "@/modules/scheduling/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

type Opt = { value: string; label: string; apartmentRef?: string; serviceRef?: string };

export default function AnchorEditor({
  value,
  onChange,
  apartmentOptions,
  categoryOptions,
  serviceOptions,
  templateOptions,
  contractOptions,
}: {
  value?: IScheduleAnchor;
  onChange: (v: IScheduleAnchor) => void;
  apartmentOptions?: Opt[];
  categoryOptions?: Opt[];
  serviceOptions?: Opt[];
  templateOptions?: Opt[];
  contractOptions?: Opt[];
}) {
  const { t, i18n } = useI18nNamespace("scheduling", translations);

  // t çıktısını her zaman string'e çevir — stable
  const T = useCallback((key: string, fallback: string) => {
    const v = t(key, fallback as any);
    if (v && typeof v === "object") {
      const lang = i18n.language?.split("-")[0] || "en";
      const tl = v as TranslatedLabel;
      return tl[lang] ?? tl.en ?? tl.tr ?? fallback;
    }
    return String(v ?? fallback);
  }, [t, i18n.language]);

  // Option label'ını güvenle string'e çevir (yanlışlıkla obje gelirse)
  const L = useCallback((label: any) => {
    if (typeof label === "string") return label;
    if (label && typeof label === "object") {
      const lang = i18n.language?.split("-")[0] || "en";
      const tl = label as TranslatedLabel;
      return tl[lang] ?? tl.en ?? tl.tr ?? "";
    }
    return String(label ?? "");
  }, [i18n.language]);

  const v: IScheduleAnchor = value ?? { apartmentRef: "" };
  const emit = (patch: Partial<IScheduleAnchor>) => onChange({ ...v, ...patch });

  // Şablonları seçili apartment + (ops) service’e göre daralt
  const filteredTemplates = useMemo(() => {
    const list = templateOptions ?? [];
    if (!v.apartmentRef) return [];
    return list.filter((opt) => {
      const okApt = !opt.apartmentRef || opt.apartmentRef === v.apartmentRef;
      const okSrv = !v.serviceRef || !opt.serviceRef || opt.serviceRef === v.serviceRef;
      return okApt && okSrv;
    });
  }, [templateOptions, v.apartmentRef, v.serviceRef]);

  // Contract opsiyonları
  const filteredContracts = useMemo(() => contractOptions ?? [], [contractOptions]);

  const hasAptOpts = !!(apartmentOptions && apartmentOptions.length);
  const hasCatOpts = !!(categoryOptions && categoryOptions.length);
  const hasSvcOpts = !!(serviceOptions && serviceOptions.length);
  const hasTplOpts = !!(filteredTemplates && filteredTemplates.length);
  const hasCtrOpts = !!(filteredContracts && filteredContracts.length);

  return (
    <Wrap role="group" aria-label={T("anchor.title", "Anchor / Context")}>
      {/* Apartment (required) */}
      <Field>
        <Label htmlFor="anc-apartment">
          {T("form.apartmentRef", "Apartment Ref")} <Req>*</Req>
        </Label>

        {hasAptOpts ? (
          <Select
            id="anc-apartment"
            value={v.apartmentRef || ""}
            onChange={(e) => emit({ apartmentRef: e.target.value, templateRef: undefined, contractRef: undefined })}
            required
            aria-required="true"
          >
            <option value="">{T("form.select", "Select")}</option>
            {apartmentOptions!.map((o) => (
              <option key={o.value} value={o.value}>{L((o as any).label)}</option>
            ))}
          </Select>
        ) : (
          <Input
            id="anc-apartment"
            value={v.apartmentRef || ""}
            onChange={(e) => emit({ apartmentRef: e.target.value })}
            required
            placeholder={T("form.required", "Required")}
            aria-required="true"
            inputMode="text"
          />
        )}
      </Field>

      {/* Category (neighborhood) */}
      <Field>
        <Label htmlFor="anc-category">{T("form.categoryRef", "Category Ref")}</Label>
        {hasCatOpts ? (
          <Select
            id="anc-category"
            value={v.categoryRef || ""}
            onChange={(e) => emit({ categoryRef: e.target.value || undefined })}
          >
            <option value="">{T("form.any", "Any")}</option>
            {categoryOptions!.map((o) => (
              <option key={o.value} value={o.value}>{L((o as any).label)}</option>
            ))}
          </Select>
        ) : (
          <Input
            id="anc-category"
            value={v.categoryRef || ""}
            onChange={(e) => emit({ categoryRef: e.target.value || undefined })}
            placeholder="ObjectId"
          />
        )}
      </Field>

      {/* Service */}
      <Field>
        <Label htmlFor="anc-service">{T("form.serviceRef", "Service Ref")}</Label>
        {hasSvcOpts ? (
          <Select
            id="anc-service"
            value={v.serviceRef || ""}
            onChange={(e) => {
              const serviceRef = e.target.value || undefined;
              const stillValid = !v.templateRef || filteredTemplates.some((opt) => opt.value === v.templateRef);
              emit({ serviceRef, templateRef: stillValid ? v.templateRef : undefined });
            }}
          >
            <option value="">{T("form.any", "Any")}</option>
            {serviceOptions!.map((o) => (
              <option key={o.value} value={o.value}>{L((o as any).label)}</option>
            ))}
          </Select>
        ) : (
          <Input
            id="anc-service"
            value={v.serviceRef || ""}
            onChange={(e) => emit({ serviceRef: e.target.value || undefined })}
            placeholder="ObjectId"
          />
        )}
      </Field>

      {/* Template */}
      <Field>
        <Label htmlFor="anc-template">{T("form.templateRef", "Template Ref")}</Label>
        {hasTplOpts ? (
          <Select
            id="anc-template"
            value={v.templateRef || ""}
            onChange={(e) => emit({ templateRef: e.target.value || undefined })}
            disabled={!v.apartmentRef}
            title={!v.apartmentRef ? T("form.apartmentFirst", "Select apartment first") : undefined}
          >
            <option value="">{T("form.any", "Any")}</option>
            {filteredTemplates.map((o) => (
              <option key={o.value} value={o.value}>{L((o as any).label)}</option>
            ))}
          </Select>
        ) : (
          <Input
            id="anc-template"
            value={v.templateRef || ""}
            onChange={(e) => emit({ templateRef: e.target.value || undefined })}
            placeholder="ObjectId"
          />
        )}
      </Field>

      {/* Contract */}
      <Field>
        <Label htmlFor="anc-contract">{T("form.contractRef", "Contract Ref")}</Label>
        {hasCtrOpts ? (
          <Select
            id="anc-contract"
            value={v.contractRef || ""}
            onChange={(e) => emit({ contractRef: e.target.value || undefined })}
            disabled={!v.apartmentRef}
            title={!v.apartmentRef ? T("form.apartmentFirst", "Select apartment first") : undefined}
          >
            <option value="">{T("form.any", "Any")}</option>
            {filteredContracts.map((o) => (
              <option key={o.value} value={o.value}>{L((o as any).label)}</option>
            ))}
          </Select>
        ) : (
          <Input
            id="anc-contract"
            value={v.contractRef || ""}
            onChange={(e) => emit({ contractRef: e.target.value || undefined })}
            placeholder="ObjectId"
          />
        )}
      </Field>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display:grid; gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(2,1fr);
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;
const Field = styled.div`display:flex;flex-direction:column;gap:6px;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Req = styled.span`color:${({theme})=>theme.colors.danger};`;

const focusable = css`
  transition:border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus{outline:none;border-color:${({theme})=>theme.colors.inputBorderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};}
`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;

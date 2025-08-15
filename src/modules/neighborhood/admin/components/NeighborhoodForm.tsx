"use client";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/neighborhood/locales";
import type { SupportedLocale } from "@/types/common";
import { useAppDispatch } from "@/store/hooks";
import { createNeighborhood, updateNeighborhood } from "@/modules/neighborhood/slice/neighborhoodSlice";
import type { INeighborhood } from "@/modules/neighborhood/types";
import { JSONEditor } from "@/modules/scheduling";

/* --- helpers --- */
const firstLocaleValue = (
  obj?: Partial<Record<SupportedLocale, string>>,
  preferred?: SupportedLocale
) => {
  if (!obj) return "";
  if (preferred && obj[preferred]?.trim()) return String(obj[preferred]).trim();
  const any = Object.values(obj).find((v) => typeof v === "string" && v.trim());
  return (any as string) || "";
};

/** JSONEditor bazen obje döndürebilir -> daima string’e çevir. */
const toText = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v ?? "", null, 2));

/** create/update için anlamlı alanlardan bir şablon üret */
function pickForCreate(n: Partial<INeighborhood> = {}) {
  return {
    name: n.name || { tr: "", en: "" },
    slug: n.slug || "",
    city: n.city || "",
    district: n.district || "",
    zip: n.zip || "",
    codes: n.codes
      ? {
          cityCode: n.codes.cityCode || "",
          districtCode: n.codes.districtCode || "",
          external: n.codes.external || undefined,
        }
      : undefined,
    geo: n.geo ? { lat: n.geo.lat, lng: n.geo.lng } : undefined,
    aliases: Array.isArray(n.aliases) ? n.aliases : [],
    tags: Array.isArray(n.tags) ? n.tags : [],
    sortOrder: typeof n.sortOrder === "number" ? n.sortOrder : 0,
    isActive: typeof n.isActive === "boolean" ? n.isActive : true,
  };
}

interface Props {
  initial?: INeighborhood;
  onClose: () => void;
  onSaved?: () => void;
}

export default function NeighborhoodForm({ initial, onClose, onSaved }: Props) {
  const { t, i18n } = useI18nNamespace("neighborhood", translations);
  const dispatch = useAppDispatch();

  const isEdit = Boolean(initial?._id);
  const lang = (i18n.language || "en").slice(0, 2) as SupportedLocale;

  /* ---- mode: "simple" | "json" ---- */
  const [mode, setMode] = useState<"simple" | "json">("simple");

  /* ===== JSON MODE ===== */
  const [rawJson, setRawJson] = useState<string>(() =>
    JSON.stringify(
      pickForCreate(
        initial || {
          name: { [lang]: "" } as any,
          isActive: true,
          sortOrder: 0,
        }
      ),
      null,
      2
    )
  );
  const onJsonChange = (next: any) => setRawJson(toText(next));

  const parsedJson = useMemo(() => {
    try {
      const txt = toText(rawJson);
      const obj = txt.trim() ? JSON.parse(txt) : {};
      return { ok: true as const, data: obj, error: "" };
    } catch (e: any) {
      return { ok: false as const, data: null, error: e?.message || "Invalid JSON" };
    }
  }, [rawJson]);

  /* ===== SIMPLE MODE ===== */
  const [nameSingle, setNameSingle] = useState<string>(firstLocaleValue(initial?.name as any, lang));
  const [slug, setSlug] = useState(initial?.slug || "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState<number>(Number(initial?.sortOrder ?? 0));

  const [city, setCity] = useState(initial?.city || "");
  const [district, setDistrict] = useState(initial?.district || "");
  const [zip, setZip] = useState(initial?.zip || "");

  const [cityCode, setCityCode] = useState(initial?.codes?.cityCode || "");
  const [districtCode, setDistrictCode] = useState(initial?.codes?.districtCode || "");

  const [lat, setLat] = useState<number | "">(initial?.geo?.lat ?? "");
  const [lng, setLng] = useState<number | "">(initial?.geo?.lng ?? "");

  const [aliases, setAliases] = useState<string>((initial?.aliases || []).join(", "));
  const [tags, setTags] = useState<string>((initial?.tags || []).join(", "));

  const simplePayload = useMemo(() => {
    const nameObj = (nameSingle || "").trim() ? ({ [lang]: nameSingle.trim() } as any) : {};
    const out: Partial<INeighborhood> = {
      name: nameObj,
      slug: slug || undefined,
      isActive,
      sortOrder: Number.isFinite(sortOrder) ? Number(sortOrder) : 0,
      city: city || undefined,
      district: district || undefined,
      zip: zip || undefined,
      codes: { cityCode: cityCode || undefined, districtCode: districtCode || undefined },
      geo: {
        lat: typeof lat === "number" ? lat : lat === "" ? undefined : Number(lat),
        lng: typeof lng === "number" ? lng : lng === "" ? undefined : Number(lng),
      },
      aliases: aliases.split(",").map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
    };
    return out;
  }, [nameSingle, lang, slug, isActive, sortOrder, city, district, zip, cityCode, districtCode, lat, lng, aliases, tags]);

  /* ---- guards ---- */
  const jsonHasName = useMemo(() => {
    if (!parsedJson.ok || !parsedJson.data) return false;
    const n = (parsedJson.data as any).name;
    return !!(n && typeof n === "object" && Object.values(n).some((v) => String(v || "").trim()));
  }, [parsedJson]);

  const canSubmit = useMemo(() => {
    if (mode === "json") return parsedJson.ok && jsonHasName;
    const hasName =
      simplePayload.name &&
      Object.values(simplePayload.name as Record<string, string>).some((v) => String(v || "").trim());
    return Boolean(hasName);
  }, [mode, parsedJson.ok, jsonHasName, simplePayload]);

  /* ---- submit ---- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "json") {
        if (!parsedJson.ok || !jsonHasName) return;
        const changes = parsedJson.data as Partial<INeighborhood>;
        if (isEdit && initial) {
          await dispatch(updateNeighborhood({ id: initial._id, changes })).unwrap();
        } else {
          await dispatch(createNeighborhood(changes)).unwrap();
        }
      } else {
        if (isEdit && initial) {
          await dispatch(updateNeighborhood({ id: initial._id, changes: simplePayload })).unwrap();
        } else {
          await dispatch(createNeighborhood(simplePayload)).unwrap();
        }
      }
      onSaved?.();
    } catch {
      /* slice toast/banner gösterecek */
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* Mode switch */}
      <Row>
        <Col $span={3}>
          <Label>{t("form.i18nMode", "Input Mode")}</Label>
          <Segmented>
            <SegBtn type="button" data-active={mode === "simple"} onClick={() => setMode("simple")}>
              {t("form.simple", "Simple")}
            </SegBtn>
            <SegBtn type="button" data-active={mode === "json"} onClick={() => setMode("json")}>
              {t("form.json", "JSON (full payload)")}
            </SegBtn>
          </Segmented>
        </Col>
      </Row>

      {/* JSON MODE */}
      {mode === "json" && (
        <>
          <Row>
            <Col $span={3}>
              <Label>{t("form.fullJson", "Neighborhood JSON")}</Label>
              <JSONEditor
                label={t("form.fullJson", "Neighborhood JSON")}
                value={rawJson}
                onChange={onJsonChange}
                placeholder='{"name":{"tr":"Merkez","en":"Center"},"slug":"merkez","city":"İstanbul","district":"Fatih","zip":"34000","codes":{"cityCode":"34","districtCode":"FAT"},"geo":{"lat":41.01,"lng":28.95},"aliases":["Merkez Mah."],"tags":["central"],"sortOrder":100,"isActive":true}'
              />
              {!parsedJson.ok && <ErrorText>⚠ {parsedJson.error}</ErrorText>}
              {!jsonHasName && <ErrorText>⚠ {t("errors.nameRequired","`name` içinde en az bir dil zorunludur.")}</ErrorText>}
              <Help>
                {t(
                  "form.allowedKeys",
                  "Allowed keys: name, slug, city, district, zip, codes(cityCode, districtCode, external), geo(lat, lng), aliases[], tags[], sortOrder, isActive"
                )}
              </Help>
            </Col>
          </Row>

          <Actions>
            <SecondaryBtn type="button" onClick={onClose}>{t("actions.cancel", "Cancel")}</SecondaryBtn>
            <PrimaryBtn type="submit" disabled={!canSubmit} aria-disabled={!canSubmit}>
              {isEdit ? t("actions.update", "Update") : t("actions.create", "Create")}
            </PrimaryBtn>
          </Actions>
        </>
      )}

      {/* SIMPLE MODE */}
      {mode === "simple" && (
        <>
          <Row>
            <Col $span={3}>
              <Label>
                {t("form.name", "Name")} ({lang.toUpperCase()}) <Req>*</Req>
              </Label>
              <Input
                value={nameSingle}
                onChange={(e) => setNameSingle(e.target.value)}
                placeholder={`${t("form.name", "Name")} — ${lang.toUpperCase()}`}
                required
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("form.slug", "Slug")}</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={t("form.slugPlaceholder","(auto if empty)")} />
            </Col>
            <Col>
              <Label>{t("form.sortOrder", "Sort Order")}</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </Col>
            <Col>
              <Label>{t("form.isActive", "Is Active?")}</Label>
              <CheckboxWrap>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              </CheckboxWrap>
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("form.city", "City")}</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Col>
            <Col>
              <Label>{t("form.district", "District")}</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
            </Col>
            <Col>
              <Label>{t("form.zip", "ZIP")}</Label>
              <Input value={zip} onChange={(e) => setZip(e.target.value)} />
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("form.cityCode", "City Code")}</Label>
              <Input value={cityCode} onChange={(e) => setCityCode(e.target.value)} />
            </Col>
            <Col>
              <Label>{t("form.districtCode", "District Code")}</Label>
              <Input value={districtCode} onChange={(e) => setDistrictCode(e.target.value)} />
            </Col>
            <Col>
              <Label>{t("form.lat", "Latitude")}</Label>
              <Input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Col>
            <Col>
              <Label>{t("form.lng", "Longitude")}</Label>
              <Input
                type="number"
                step="0.000001"
                value={lng}
                onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>{t("form.aliases", "Aliases")}</Label>
              <Input value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="alias-1, alias-2" />
            </Col>
            <Col $span={2}>
              <Label>{t("form.tags", "Tags")}</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag-1, tag-2" />
            </Col>
          </Row>

          <Actions>
            <SecondaryBtn type="button" onClick={onClose}>{t("actions.cancel", "Cancel")}</SecondaryBtn>
            <PrimaryBtn type="submit" disabled={!canSubmit} aria-disabled={!canSubmit}>
              {isEdit ? t("actions.update", "Update") : t("actions.create", "Create")}
            </PrimaryBtn>
          </Actions>
        </>
      )}
    </Form>
  );
}

/* ---- styled ---- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Row = styled.div`
  display:grid; grid-template-columns:repeat(3,1fr); gap:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;
const Col = styled.div<{ $span?: number }>`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};
  grid-column: span ${({$span})=>$span||1};
`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
const Req = styled.span`color:${({theme})=>theme.colors.danger}; margin-left:.15rem;`;
const Help = styled.div`margin-top:.35rem; font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
const ErrorText = styled.div`margin-top:.35rem; color:${({theme})=>theme.colors.danger}; font-size:${({theme})=>theme.fontSizes.xsmall};`;
const Input = styled.input`
  width:100%; padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.inputs.border};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  font-size:${({theme})=>theme.fontSizes.sm};
  transition:border-color ${(({theme})=>theme.transition.fast)}, box-shadow ${(({theme})=>theme.transition.fast)};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
  &::placeholder{color:${({theme})=>theme.inputs.placeholder};}
`;
const CheckboxWrap = styled.div`height:40px; display:flex; align-items:center; input{ width:18px; height:18px; }`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const BaseBtn = styled.button`
  padding:10px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  border:${({theme})=>theme.borders.thin} transparent;box-shadow:${({theme})=>theme.shadows.button};
  transition:opacity ${(({theme})=>theme.transition.fast)}, transform ${(({theme})=>theme.transition.fast)};
  font-weight:${({theme})=>theme.fontWeights.medium};
  &:hover{opacity:${({theme})=>theme.opacity.hover};}
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
  &:active{transform:translateY(1px);}
`;
const PrimaryBtn = styled(BaseBtn)`background:${({theme})=>theme.buttons.primary.background};color:${({theme})=>theme.buttons.primary.text};`;
const SecondaryBtn = styled(BaseBtn)`background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};border-color:${({theme})=>theme.colors.border};`;
const Segmented = styled.div`display:inline-flex; padding:2px; background:${({theme})=>theme.colors.backgroundAlt}; border:1px solid ${({theme})=>theme.colors.border}; border-radius:${({theme})=>theme.radii.xl}; gap:2px;`;
const SegBtn = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.xl};
  border:none; cursor:pointer; background:transparent; color:${({theme})=>theme.colors.textSecondary};
  transition: background .15s ease, color .15s ease, transform .08s ease;
  &[data-active="true"]{ background:${({theme})=>theme.colors.cardBackground}; color:${({theme})=>theme.colors.text}; box-shadow:${({theme})=>theme.shadows.sm}; }
  &:hover{ background:${({theme})=>theme.colors.hoverBackground}; }
`;

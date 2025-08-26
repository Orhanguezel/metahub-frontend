"use client";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/branch/locales";
import type { IBranch, BranchCreatePayload, BranchUpdatePayload } from "@/modules/branch/types";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";
import { JSONEditor } from "@/shared";
import { getUILang } from "@/i18n/getUILang";

/* alt formlar */
import { OpeningHoursForm, DeliveryZonesForm } from "@/modules/branch";

/* Redux */
import { useDispatch, useSelector } from "react-redux";
import { selectBranchSelected, setSelectedBranch, fetchBranchAdminById } from "@/modules/branch/slice";

/* ---- helpers ---- */
type TL = Partial<Record<SupportedLocale, string>>;
const SERVICES = ["delivery", "pickup", "dinein"] as const;
type ServiceType = (typeof SERVICES)[number];

const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");
const toTL = (v: any, lang: SupportedLocale): TL =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as TL) : v ? ({ [lang]: String(v) } as TL) : {};

type Props = {
  initial?: IBranch | null;
  onSubmit: (data: BranchCreatePayload | BranchUpdatePayload | FormData, id?: string) => Promise<void> | void;
  onCancel: () => void;
};

export default function BranchForm({ initial, onCancel, onSubmit }: Props) {
  const { t, i18n } = useI18nNamespace("branch", translations);
  // ESLint uyarısı olmaması için useMemo yerine direkt hesapla (ucuz işlem)
  const lang = getUILang((i18n as any)?.languages?.[0] || i18n?.language) as SupportedLocale;
  const isEdit = Boolean(initial?._id);

  const dispatch = useDispatch<any>();
  const selected = useSelector(selectBranchSelected);

  // Mount’ta store’a seçili branch’i koy + id ile tazele
  const initialId = initial?._id ? String(initial._id) : undefined;
  useEffect(() => {
    if (!isEdit || !initialId) return;
    // Henüz seçili yoksa hızlı seed
    if (!selected?._id || String(selected._id) !== initialId) {
      dispatch(setSelectedBranch(initial as IBranch));
    }
    // Sunucudan güncelini çek (özellikle openingHours/deliveryZones için)
    dispatch(fetchBranchAdminById(initialId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isEdit, initialId]); // selected’ı özellikle eklemiyoruz

  // Alt formlar için sağlam id
  const idForChildren = (selected?._id || initial?._id) ? String(selected?._id || initial?._id) : undefined;

  /* ---- state: base ---- */
  const [code, setCode] = useState<string>(initial?.code || "");
  const [name, setName] = useState<TL>((initial?.name as TL) || {});

  // address
  const [street, setStreet]       = useState<string>(initial?.address?.street  || "");
  const [number, setNumber]       = useState<string>(initial?.address?.number  || "");
  const [district, setDistrict]   = useState<string>(initial?.address?.district|| "");
  const [city, setCity]           = useState<string>(initial?.address?.city    || "");
  const [state, setState]         = useState<string>(initial?.address?.state   || "");
  const [zip, setZip]             = useState<string>(initial?.address?.zip     || "");
  const [country, setCountry]     = useState<string>(initial?.address?.country || "");
  const [fullText, setFullText]   = useState<string>(initial?.address?.fullText|| "");

  // location
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  // services
  const [services, setServices] = useState<ServiceType[]>(
    (initial?.services as ServiceType[]) || []
  );

  const [minPrepMinutes, setMinPrepMinutes] = useState<number>(Number(initial?.minPrepMinutes ?? 15));
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  // başlangıç location koordinatlarını doldur
  useEffect(() => {
    const coords = initial?.location?.coordinates;
    if (coords && Array.isArray(coords) && coords.length === 2) {
      const [lng0, lat0] = coords;
      setLng(String(lng0 ?? ""));
      setLat(String(lat0 ?? ""));
    }
  }, [initial]);

  /* ---- edit mode ---- */
  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  /* ---- JSON Mode: FULL JSON ---- */
  const fullJSONValue = useMemo(() => {
    const latNum = lat === "" ? undefined : Number(lat);
    const lngNum = lng === "" ? undefined : Number(lng);
    const loc =
      Number.isFinite(latNum) && Number.isFinite(lngNum)
        ? { type: "Point" as const, coordinates: [Number(lng), Number(lat)] as [number, number] }
        : initial?.location || undefined;

    const addr =
      street || number || district || city || state || zip || country || fullText
        ? {
            street: street || undefined,
            number: number || undefined,
            district: district || undefined,
            city: city || undefined,
            state: state || undefined,
            zip: zip || undefined,
            country: country || undefined,
            fullText: fullText || undefined,
          }
        : undefined;

    const base: any = {
      ...(isEdit ? {} : { code: code || "" }),
      name: name || {},
      address: addr,
      location: loc,
      services: services,
      minPrepMinutes: minPrepMinutes,
      isActive: isActive,
    };
    return base;
  }, [
    isEdit, code, name,
    street, number, district, city, state, zip, country, fullText,
    lat, lng, services, minPrepMinutes, isActive, initial?.location
  ]);

  const jsonPlaceholder = useMemo(() => {
    const langs = SUPPORTED_LOCALES as SupportedLocale[];
    const emptyTL = Object.fromEntries(langs.map((l) => [l, ""])) as TL;
    const base: any = {
      code: "bh-001",
      name: emptyTL,
      address: { street: "", number: "", district: "", city: "", state: "", zip: "", country: "TR", fullText: "" },
      location: { type: "Point", coordinates: [29.0, 41.0] },
      services: ["delivery"],
      minPrepMinutes: 15,
      isActive: true
    };
    if (isEdit) delete base.code;
    return JSON.stringify(base, null, 2);
  }, [isEdit]);

  const onFullJSONChange = (v: any) => {
    if (!v || typeof v !== "object") return;

    if (!isEdit && "code" in v) setCode(String(v.code ?? ""));
    if ("name" in v) setName(toTL(v.name, lang));

    if ("address" in v && v.address && typeof v.address === "object") {
      setStreet(String(v.address.street ?? ""));
      setNumber(String(v.address.number ?? ""));
      setDistrict(String(v.address.district ?? ""));
      setCity(String(v.address.city ?? ""));
      setState(String(v.address.state ?? ""));
      setZip(String(v.address.zip ?? ""));
      setCountry(String(v.address.country ?? ""));
      setFullText(String(v.address.fullText ?? ""));
    }

    if ("location" in v && v.location && typeof v.location === "object") {
      const coords = v.location.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        setLng(String(coords[0] ?? ""));
        setLat(String(coords[1] ?? ""));
      }
    }

    if (Array.isArray(v.services)) {
      const normalized = v.services
        .map((x: any) => String(x))
        .filter((x: string) => (SERVICES as readonly string[]).includes(x)) as ServiceType[];
      setServices(normalized);
    }

    if ("minPrepMinutes" in v) setMinPrepMinutes(Number(v.minPrepMinutes) || 0);
    if ("isActive" in v) setIsActive(Boolean(v.isActive));
  };

  const toggleService = (s: ServiceType) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const hasValidLoc = Number.isFinite(latNum) && Number.isFinite(lngNum);

    const addr =
      street || number || district || city || state || zip || country || fullText
        ? {
            street: street || undefined,
            number: number || undefined,
            district: district || undefined,
            city: city || undefined,
            state: state || undefined,
            zip: zip || undefined,
            country: country || undefined,
            fullText: fullText || undefined,
          }
        : undefined;

    if (!isEdit) {
      if (!hasValidLoc) {
        alert(t("errors.location_required", "Lütfen geçerli bir konum girin."));
        return;
      }
      if (!services.length) {
        alert(t("errors.services_required", "En az bir servis seçin."));
        return;
      }
    }

    const payloadBase: Omit<BranchCreatePayload, "code"> = {
      name: name || {},
      address: addr,
      location: hasValidLoc ? { type: "Point", coordinates: [lngNum, latNum] } : (initial?.location as any),
      services: services || [],
      minPrepMinutes: Number.isFinite(Number(minPrepMinutes)) ? Number(minPrepMinutes) : undefined,
      isActive,
    };

    let payload: BranchCreatePayload | BranchUpdatePayload;
    if (isEdit) {
      payload = payloadBase as BranchUpdatePayload;
    } else {
      payload = { code: (code || "").trim(), ...payloadBase } as BranchCreatePayload;
    }

    await onSubmit(payload, initial?._id);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModeRow role="radiogroup" aria-label={t("editMode","Edit Mode")}>
        <ModeBtn type="button" aria-pressed={editMode === "simple"} $active={editMode === "simple"} onClick={() => setEditMode("simple")}>
          {t("simpleMode", "Basit")}
        </ModeBtn>
        <ModeBtn type="button" aria-pressed={editMode === "json"} $active={editMode === "json"} onClick={() => setEditMode("json")}>
          {t("jsonMode", "JSON Editor")}
        </ModeBtn>
      </ModeRow>

      {editMode === "simple" && (
        <>
          {/* Üst Alanlar */}
          <Row>
            {!isEdit && (
              <Col>
                <Label>{t("code", "Code")}</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="bh-001" required />
              </Col>
            )}

            <Col>
              <Label>{t("name", "Name")} ({lang})</Label>
              <Input
                value={getTLStrict(name, lang)}
                onChange={(e) => setName(setTL(name, lang, e.target.value))}
                placeholder={t("name_ph","Şube adı")}
              />
            </Col>

            <Col>
              <Label>{t("isActive", "Active?")}</Label>
              <CheckRow>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span>{isActive ? t("yes", "Yes") : t("no", "No")}</span>
              </CheckRow>
            </Col>

            <Col>
              <Label>{t("minPrepMinutes", "Min prep (min)")}</Label>
              <Input type="number" min={0} max={240} value={minPrepMinutes}
                     onChange={(e) => setMinPrepMinutes(Number(e.target.value) || 0)} />
            </Col>
          </Row>

          {/* Adres */}
          <BlockTitle>{t("address", "Address")}</BlockTitle>
          <Row>
            <Col><Label>{t("street", "Street")}</Label><Input value={street} onChange={(e)=>setStreet(e.target.value)} /></Col>
            <Col><Label>{t("number", "No")}</Label><Input value={number} onChange={(e)=>setNumber(e.target.value)} /></Col>
            <Col><Label>{t("district", "District")}</Label><Input value={district} onChange={(e)=>setDistrict(e.target.value)} /></Col>
            <Col><Label>{t("city", "City")}</Label><Input value={city} onChange={(e)=>setCity(e.target.value)} /></Col>
          </Row>
          <Row>
            <Col><Label>{t("state", "State")}</Label><Input value={state} onChange={(e)=>setState(e.target.value)} /></Col>
            <Col><Label>{t("zip", "ZIP")}</Label><Input value={zip} onChange={(e)=>setZip(e.target.value)} /></Col>
            <Col><Label>{t("country", "Country (ISO-2)")}</Label><Input value={country} onChange={(e)=>setCountry(e.target.value)} placeholder="TR" /></Col>
            <Col><Label>{t("fullText", "Full text")}</Label><Input value={fullText} onChange={(e)=>setFullText(e.target.value)} /></Col>
          </Row>

          {/* Konum + Servisler */}
          <BlockTitle>{t("location", "Location")}</BlockTitle>
          <Row>
            <Col>
              <Label>{t("latitude", "Latitude")}</Label>
              <Input value={lat} onChange={(e)=>setLat(e.target.value)} placeholder="41.0" />
            </Col>
            <Col>
              <Label>{t("longitude", "Longitude")}</Label>
              <Input value={lng} onChange={(e)=>setLng(e.target.value)} placeholder="29.0" />
            </Col>
            <Col style={{ gridColumn: "span 2" }}>
              <Label>{t("services", "Services")}</Label>
              <ServiceRow>
                {SERVICES.map((s) => (
                  <label key={s} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="checkbox" checked={services.includes(s)} onChange={() => toggleService(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </ServiceRow>
            </Col>
          </Row>

          {/* Opening Hours & Delivery Zones — inline */}
          {isEdit ? (
            <>
              <Divider />
              <SectionTitle>{t("openingHours", "Opening Hours")}</SectionTitle>
              <OpeningHoursForm
                isOpen={true}
                tenant={initial?.tenant}
                value={selected?.openingHours || initial?.openingHours}
                branchId={idForChildren}             // <-- önemli
                onClose={() => {}}
                onSave={() => {}}
              />

              <Divider />
              <SectionTitle>{t("deliveryZones", "Delivery Zones")}</SectionTitle>
              <DeliveryZonesForm
                isOpen={true}
                tenant={initial?.tenant}
                value={selected?.deliveryZones || initial?.deliveryZones}
                branchId={idForChildren}             // <-- DeliveryZonesForm da aynı mantığı kullanmalı
                onClose={() => {}}
                onSave={() => {}}
              />
            </>
          ) : (
            <Info>
              {t("info.create_first", "Bu şube kaydedildikten sonra Açılış Saatleri ve Teslimat Bölgeleri burada yönetilecektir.")}
            </Info>
          )}
        </>
      )}

      {/* JSON MODE */}
      {editMode === "json" && (
        <Row>
          <Col style={{ gridColumn: "span 4" }}>
            <JSONEditor
              label={t("advanced_json", "Full JSON (advanced)")}
              value={fullJSONValue}
              onChange={onFullJSONChange}
              placeholder={jsonPlaceholder}
            />
            <Hint>
              {t("json_hint_oh_dz", "Opening Hours ve Delivery Zones bu JSON’dan düzenlenmez; yukarıdaki form bölümünü kullanın.")}
            </Hint>
          </Col>
        </Row>
      )}

      {/* Actions */}
      <Actions>
        <Secondary type="button" onClick={onCancel}>{t("cancel", "Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("update", "Update") : t("create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled ---- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};min-width:0;`;
const SectionTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.md};margin:${({theme})=>theme.spacings.xs} 0;`;
const Divider = styled.hr`
  border: 0;
  border-top: ${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  margin: ${({theme})=>theme.spacings.md} 0;
`;
const BlockTitle = styled.h4`font-size:${({theme})=>theme.fontSizes.sm};margin:${({theme})=>theme.spacings.sm} 0 ${(({theme})=>theme.spacings.xs)};`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const ModeRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;margin-top:-6px;`;
const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text};
  cursor:pointer;
`;
const ServiceRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.md};flex-wrap:wrap;`;
const Info = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: ${({theme})=>theme.radii.md};
  border: ${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  background: ${({theme})=>theme.colors.backgroundAlt};
  color: ${({theme})=>theme.colors.textSecondary};
`;
const Hint = styled.p`
  margin-top: 8px;
  color: ${({theme})=>theme.colors.textSecondary};
  font-size: ${({theme})=>theme.fontSizes.xsmall};
`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;

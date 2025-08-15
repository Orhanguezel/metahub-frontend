// src/modules/apartment/ui/TRAddressFields.tsx
"use client";
import styled from "styled-components";
import { useMemo } from "react";
import type { IAddress, IPlace, INeighborhoodLite } from "@/modules/apartment/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/apartment/locales";

/** Basit TR veri seti — ister büyüt, ister API’den doldur.
 *  Kodlar örnek: Bursa=16, Gemlik=1607. (Kendi kod şemanı kullanıyorsan eşle)
 */
type TRDistrict = { code: string; name: string; zips?: string[] };
type TRProvince = { code: string; name: string; districts: TRDistrict[] };

const TR_PROVINCES: TRProvince[] = [
  {
    code: "16",
    name: "Bursa",
    districts: [
      { code: "1601", name: "Osmangazi" },
      { code: "1602", name: "Yıldırım" },
      { code: "1603", name: "Nilüfer" },
      { code: "1607", name: "Gemlik", zips: ["16600"] },
    ],
  },
  // İstersen diğer illeri burada genişlet
];

export default function TRAddressFields({
  address,
  onAddressChange,
  place,
  onPlaceChange,
  neighborhoodId,
  onNeighborhoodChange,
  neighborhoods = [],
  defaultCountry = "TR",
}: {
  address: IAddress;
  onAddressChange: (next: IAddress) => void;
  place: Partial<IPlace>;
  onPlaceChange: (next: Partial<IPlace>) => void;
  neighborhoodId?: string;
  onNeighborhoodChange: (id: string) => void;
  neighborhoods?: INeighborhoodLite[];   // store’dan geliyor (lite)
  defaultCountry?: string;
}) {
  const { t } = useI18nNamespace("apartment", translations);

  // İl seçimi: address.state
  const selectedProvince = useMemo(
    () => TR_PROVINCES.find((p) => p.code === (place.cityCode || "")) || TR_PROVINCES.find(p => p.name === address.state),
    [place.cityCode, address.state]
  );
  // İlçe: address.city
  const selectedDistrict = useMemo(() => {
    const list = selectedProvince?.districts || [];
    return list.find(
      d => d.code === (place.districtCode || "") || d.name === address.city
    );
  }, [selectedProvince, place.districtCode, address.city]);

  // Mahalleleri filtrele (elindeki şemaya göre düzenleyebilirsin)
  const filteredNeighborhoods = useMemo(() => {
    // Eğer neighborhood objelerinde ilçe kodu/ismi saklıyorsan ona göre filtreden geçir.
    // Basit yaklaşım: ilçe seçilmişse tüm mahalleleri göster (gerçekte burada districtCode’a göre filtre önerilir).
    return neighborhoods;
  }, [neighborhoods]);

  const onCountry = (v: string) => onAddressChange({ ...address, country: v.toUpperCase() });
  const onProvinceCode = (code: string) => {
    const p = TR_PROVINCES.find(pr => pr.code === code);
    onPlaceChange({ ...place, cityCode: code, districtCode: undefined, zip: place.zip });
    onAddressChange({ ...address, state: p?.name || "", city: "" });
    onNeighborhoodChange("");
  };
  const onDistrictCode = (code: string) => {
    const d = selectedProvince?.districts.find(dd => dd.code === code);
    onPlaceChange({ ...place, districtCode: code });
    onAddressChange({ ...address, city: d?.name || "" });
    onNeighborhoodChange("");
    // District’e özel tek zip varsa ön doldur
    if (d?.zips?.[0]) {
      onAddressChange({ ...address, city: d?.name || "", zip: d.zips[0], state: selectedProvince?.name || address.state, country: address.country || defaultCountry });
      onPlaceChange({ ...place, districtCode: code, zip: d.zips[0] });
    }
  };

  return (
    <Grid>
      {/* Ülke */}
      <Col>
        <Label>{t("form.country","Ülke (ISO-2)")}</Label>
        <Input
          value={address.country || defaultCountry}
          onChange={e=>onCountry(e.target.value)}
          placeholder="TR"
        />
      </Col>

      {/* İl (Province) */}
      <Col>
        <Label>{t("form.stateTR","İl")}</Label>
        <Select
          value={place.cityCode || ""}
          onChange={(e)=>onProvinceCode(e.target.value)}
        >
          <option value="">{t("form.selectProvince","İl seçin")}</option>
          {TR_PROVINCES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </Select>
      </Col>

      {/* İlçe (District) */}
      <Col>
        <Label>{t("form.districtTR","İlçe")}</Label>
        <Select
          value={place.districtCode || ""}
          onChange={(e)=>onDistrictCode(e.target.value)}
          disabled={!selectedProvince}
        >
          <option value="">{t("form.selectDistrict","İlçe seçin")}</option>
          {(selectedProvince?.districts || []).map(d =>
            <option key={d.code} value={d.code}>{d.name}</option>
          )}
        </Select>
      </Col>

      {/* Mahalle */}
      <Col>
        <Label>{t("form.neighborhoodTR","Mahalle")}</Label>
        <Select
          value={neighborhoodId || ""}
          onChange={(e)=>onNeighborhoodChange(e.target.value)}
          disabled={!selectedDistrict}
        >
          <option value="">{t("form.selectNeighborhood","Mahalle seçin")}</option>
          {filteredNeighborhoods.map(n =>
            <option key={n._id} value={n._id}>{firstLabel(n.name) || n.slug || n._id}</option>
          )}
        </Select>
      </Col>

      {/* Posta Kodu */}
      <Col>
        <Label>{t("form.zip","Posta Kodu")}</Label>
        <Input
          value={address.zip || ""}
          onChange={(e)=>{
            const v = e.target.value;
            onAddressChange({ ...address, zip: v });
            onPlaceChange({ ...place, zip: v });
          }}
          inputMode="numeric"
          placeholder="16600"
        />
      </Col>

      {/* Cadde/Sokak + No */}
      <Col className="span2">
        <Label>{t("form.street","Cadde/Sokak")}</Label>
        <Input
          value={address.street || ""}
          onChange={(e)=>onAddressChange({ ...address, street: e.target.value })}
          placeholder="Cumhuriyet Cd."
        />
      </Col>
      <Col>
        <Label>{t("form.number","No")}</Label>
        <Input
          value={address.number || ""}
          onChange={(e)=>onAddressChange({ ...address, number: e.target.value })}
          placeholder="12"
        />
      </Col>
    </Grid>
  );
}

/* helpers */
function firstLabel(obj?: Record<string,string>) {
  if (!obj) return "";
  return obj.tr || obj.en || Object.values(obj)[0] || "";
}

/* styled */
const Grid = styled.div`
  display:grid;
  gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(3,1fr);
  ${({theme})=>theme.media.tablet}{ grid-template-columns:repeat(2,1fr); }
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
  .span2{ grid-column: span 2; }
`;
const Col = styled.div`display:flex;flex-direction:column;gap:6px;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;

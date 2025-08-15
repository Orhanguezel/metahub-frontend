"use client";
import TRAddressFields from "@/modules/apartment/admin/components/TRAddressFields";
import { Card, Sub } from "../FormUI";
import type { IAddress } from "@/modules/apartment/types";

export default function AddressSection({
  t, neighborhoods, neighborhoodId, setNeighborhoodId,
  address, setAddress, cityCode, setCityCode, districtCode, setDistrictCode, placeZip, setPlaceZip,
}: {
  t: (k: string, d?: string) => string;
  neighborhoods: any[];
  neighborhoodId: string;
  setNeighborhoodId: (id: string) => void;
  address: IAddress;
  setAddress: (a: IAddress) => void;
  cityCode: string; setCityCode: (v: string) => void;
  districtCode: string; setDistrictCode: (v: string) => void;
  placeZip: string; setPlaceZip: (v: string) => void;
}) {
  return (
    <Card>
      <Sub>{t("form.addressTR","Adres (Türkiye standardı)")}</Sub>
      <TRAddressFields
        address={address}
        onAddressChange={setAddress}
        place={{ cityCode, districtCode, zip: placeZip, neighborhood: neighborhoodId as any }}
        onPlaceChange={(next)=>{
          setCityCode(next.cityCode || "");
          setDistrictCode(next.districtCode || "");
          setPlaceZip(next.zip || "");
        }}
        neighborhoodId={neighborhoodId}
        onNeighborhoodChange={setNeighborhoodId}
        neighborhoods={neighborhoods as any}
        defaultCountry="TR"
      />
    </Card>
  );
}

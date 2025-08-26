"use client";
import type { SupportedLocale } from "@/types/common";
import { CategoriesSection, VariantsSection, ModifierGroupsSection,AllergensAdditivesSection,DietaryOpsSection } from "@/modules/menu";
import type { MenuCategory, StructuredObj, TFunc, TLGetter } from "./types";

type Props = {
  lang: SupportedLocale;
  structured: StructuredObj;
  setStructured: (updater: (p: StructuredObj) => StructuredObj) => void;

  allCats: MenuCategory[];
  catLabel: (c?: MenuCategory) => string;

  getTLStrict: TLGetter;
  t: TFunc;
};

export default function ItemStructured({
  lang, structured, setStructured, allCats, catLabel, getTLStrict, t
}: Props) {
  return (
    <>
      <CategoriesSection
        structured={structured}
        setStructured={setStructured}
        allCats={allCats}
        catLabel={catLabel}
        t={t}
      />

      <VariantsSection
        lang={lang}
        structured={structured}
        setStructured={setStructured}
        getTLStrict={getTLStrict}
        t={t}
      />

      <ModifierGroupsSection
        lang={lang}
        structured={structured}
        setStructured={setStructured}
        getTLStrict={getTLStrict}
        t={t}
      />

      <AllergensAdditivesSection
        lang={lang}
        structured={structured}
        setStructured={setStructured}
        getTLStrict={getTLStrict}
        t={t}
      />

      <DietaryOpsSection
        structured={structured}
        setStructured={setStructured}
        t={t}
      />
    </>
  );
}

export type { StructuredObj } from "./types";

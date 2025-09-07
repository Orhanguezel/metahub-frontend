// frontend/modules/recipes/utils/buildDietChips.ts
export type TFn = (k: string, d?: string) => string;

export type DietChip = { key: string; label: string; icon: string };

export type IMenuItemDietaryLike = {
  vegetarian?: boolean;
  vegan?: boolean;
  pescatarian?: boolean;
  halal?: boolean;
  kosher?: boolean;
  glutenFree?: boolean;
  lactoseFree?: boolean;
  nutFree?: boolean;
  eggFree?: boolean;
  porkFree?: boolean;
  spicyLevel?: number;           // 0..3
  containsAlcohol?: boolean;
  caffeineMgPerServing?: number;
  caloriesKcal?: number;
};

/** Beslenme etiketlerini (ikon + çeviri) üretir. */
export function buildDietChips(
  dietary: IMenuItemDietaryLike | undefined,
  t: TFn
): DietChip[] {
  const td = (k: string, d?: string) => t(`dietaryLabels.${k}`, d);

  const d = dietary || {};
  const chips: DietChip[] = [];

  if (d.vegetarian) chips.push({ key: "vegetarian", label: td("vegetarian", "Vejetaryen"), icon: "🥦" });
  if (d.vegan)      chips.push({ key: "vegan",       label: td("vegan", "Vegan"),                icon: "🌱" });
  if (d.pescatarian)chips.push({ key: "pescatarian", label: td("pescatarian", "Pesketaryen"),    icon: "🐟" });
  if (d.halal)      chips.push({ key: "halal",       label: td("halal", "Helal"),                icon: "🕌" });
  if (d.kosher)     chips.push({ key: "kosher",      label: td("kosher", "Kaşer"),               icon: "✡️" });
  if (d.glutenFree) chips.push({ key: "glutenFree",  label: td("glutenFree", "Glutensiz"),       icon: "🚫🌾" });
  if (d.lactoseFree)chips.push({ key: "lactoseFree", label: td("lactoseFree", "Laktozsuz"),      icon: "🚫🥛" });
  if (d.nutFree)    chips.push({ key: "nutFree",     label: td("nutFree", "Kuruyemiş içermez"),  icon: "🚫🥜" });
  if (d.eggFree)    chips.push({ key: "eggFree",     label: td("eggFree", "Yumurtasız"),         icon: "🚫🥚" });
  if (d.porkFree)   chips.push({ key: "porkFree",    label: td("porkFree", "Domuz ürünü içermez"), icon: "🚫🐷" });

  if (typeof d.spicyLevel === "number" && d.spicyLevel > 0) {
    chips.push({
      key: "spicy",
      label: `${td("spicy", "Acılık")} ${Math.min(3, d.spicyLevel)}/3`,
      icon: "🌶️".repeat(Math.min(3, d.spicyLevel)),
    });
  }
  if (d.containsAlcohol) {
    chips.push({ key: "alcohol", label: td("containsAlcohol", "Alkol içerir"), icon: "🍷" });
  }
  if (typeof d.caffeineMgPerServing === "number" && d.caffeineMgPerServing > 0) {
    chips.push({ key: "caffeine", label: t("caffeine", "Kafein mg/servis") + `: ${d.caffeineMgPerServing}`, icon: "☕" });
  }
  if (typeof d.caloriesKcal === "number" && d.caloriesKcal > 0) {
    chips.push({ key: "cal", label: t("calories", "Kalori") + `: ${d.caloriesKcal} kcal`, icon: "🔥" });
  }

  return chips;
}

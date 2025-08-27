import type { ItemPrice, Money } from "@/modules/menu/types/menuitem";

/** 'base' tipindeki en düşük fiyatı (variants + modifier options) tarar. */
export function findMinBasePrice(item: any): Money | null {
  const nums: Money[] = [];

  const take = (arr?: ItemPrice[]) => {
    (arr || []).forEach((p) => {
      if (p?.kind === "base" && p?.value?.amount != null && isFinite(p.value.amount)) {
        nums.push(p.value);
      }
    });
  };

  (item?.variants || []).forEach((v: any) => take(v?.prices));
  (item?.modifierGroups || []).forEach((g: any) =>
    (g?.options || []).forEach((o: any) => take(o?.prices))
  );

  if (!nums.length) return null;

  // Basit strateji: amount’a göre min (currency farklı olabilir; ileride currency önceliği eklenebilir)
  nums.sort((a, b) => a.amount - b.amount);
  return nums[0];
}

// utils/pricing.ts
import type {
  IMenuItem,
  IMenuItemVariant,
  IMenuItemModifierOption,
  PriceChannel,
  Money,
  ItemPrice,
  PriceKind,
} from "@/modules/menu/types/menuitem";

/** İsteğe bağlı bağlam (şube ve zaman) */
type Ctx = { outlet?: string | null; when?: Date };

/* ---------- ortak filtre yardımcıları ---------- */
const inRange = (p: ItemPrice, when: Date) =>
  (!p.activeFrom || new Date(p.activeFrom) <= when) &&
  (!p.activeTo || new Date(p.activeTo) >= when);

const channelOk = (p: ItemPrice, ch?: PriceChannel) =>
  !p.channels || p.channels.length === 0 || (ch ? p.channels.includes(ch) : true);

const outletOk = (p: ItemPrice, outlet?: string | null) =>
  !p.outlet || (outlet ? p.outlet === outlet : true);

/** Daha spesifik (outlet + channel) olanı öne çıkar */
const score = (p: ItemPrice) =>
  (p.outlet ? 2 : 0) + ((p.channels && p.channels.length) ? 1 : 0);

/** İstenen tür(ler)den, aktif/kanal/şube uygun en iyi Money’i seç */
function pickBestPrice(
  prices: ItemPrice[] | undefined,
  kinds: PriceKind[],
  channel: PriceChannel,
  ctx?: Ctx
): Money | null {
  if (!Array.isArray(prices) || prices.length === 0) return null;
  const when = ctx?.when ?? new Date();

  const filtered = prices.filter(
    (p) =>
      kinds.includes(p.kind) &&
      p.value?.amount != null &&
      inRange(p, when) &&
      channelOk(p, channel) &&
      outletOk(p, ctx?.outlet ?? null)
  );

  if (!filtered.length) return null;
  filtered.sort((a, b) => score(b) - score(a)); // en spesifik
  const best = filtered[0].value;
  return best ? { ...best } : null;
}

/** Varyanttaki base fiyat (kanal/şube/tarih filtreli) */
export function getVariantBasePrice(
  v: IMenuItemVariant,
  channel: PriceChannel,
  ctx?: Ctx
): Money | null {
  return pickBestPrice(v.prices, ["base"], channel, ctx);
}

/** Opsiyondaki fiyat: önce surcharge, yoksa base (kanal/şube/tarih filtreli) */
export function getOptionBasePrice(
  o: IMenuItemModifierOption,
  channel: PriceChannel,
  ctx?: Ctx
): Money | null {
  return (
    pickBestPrice(o.prices, ["surcharge"], channel, ctx) ||
    pickBestPrice(o.prices, ["base"], channel, ctx)
  );
}

/** Listede en düşük base fiyat (kanal/şube/tarih filtreli) */
export function findMinBasePrice(
  item: IMenuItem,
  channel: PriceChannel = "delivery",
  ctx?: Ctx
): Money | null {
  let best: Money | null = null;
  for (const v of item.variants || []) {
    const p = getVariantBasePrice(v, channel, ctx);
    if (p && (best === null || p.amount < best.amount)) best = p;
  }
  return best;
}

export function formatMoney(m: Money, locale: string): string {
  return new Intl.NumberFormat(locale as any, {
    style: "currency",
    currency: m.currency || "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(m.amount);
}

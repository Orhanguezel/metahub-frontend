"use client";

import Link from "next/link";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/home";
import type { SupportedLocale } from "@/types/common";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import type { IGallery, IGalleryImage, GalleryCategory } from "@/modules/gallery/types";

/* --- search için (yalnızca yönlendirme ve store) --- */
import { useRouter, useSearchParams } from "next/navigation";
import { getMultiLang } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";
import type { IMenu } from "@/modules/menu/types/menu";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";
import type { IMenuItem } from "@/modules/menu/types/menuitem";
import { selectMenuItemsPublic } from "@/modules/menu/slice/menuitemSlice";
/* ------------------- */

const HERO_CATEGORY_SLUG = "carousel";

/* utils */
const asId = (v: any): string =>
  typeof v === "string" ? v : v?.$oid || v?._id || v?.id || String(v || "");

/* küçük bir media hook'u */
const useIsMobile = (bp = 900) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(`(max-width:${bp}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    handler(m);
    m.addEventListener?.("change", handler as any);
    return () => m.removeEventListener?.("change", handler as any);
  }, [bp]);
  return isMobile;
};

type Slide = {
  id: string;
  image: Pick<IGalleryImage, "url" | "thumbnail" | "webp"> | null;
  title: IGallery["title"];
  summary: IGallery["summary"];
  order: number;
  categoryId: string;
};

const HeroRestaurant = () => {
  // Tek i18n: 'home' namespace (anahtarlar hero.* ve hero1.* altında)
  const { i18n, t } = useI18nNamespace("home", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const uiLang = useMemo(() => getUILang(i18n?.language), [i18n?.language]);
  const isMobile = useIsMobile(900);

  /* ===== Gallery (hero görselleri) ===== */
  const { gallery } = useAppSelector((s) => s.gallery);
  const galleryCategories = useAppSelector((s) => s.galleryCategory.categories) as GalleryCategory[];

  const selectedCategoryId = useMemo(() => {
    const cat = galleryCategories?.find((c) => c.slug === HERO_CATEGORY_SLUG);
    return cat?._id || "";
  }, [galleryCategories]);

  const slides = useMemo<Slide[]>(() => {
    if (!selectedCategoryId || !Array.isArray(gallery)) return [];
    const filtered = gallery.filter((g: IGallery) =>
      typeof g.category === "string" ? g.category === selectedCategoryId : g.category?._id === selectedCategoryId
    );
    return filtered
      .map((g) => {
        const first = g.images?.[0];
        return {
          id: g._id,
          image: first ? { url: first.url, thumbnail: first.thumbnail, webp: first.webp } : null,
          title: g.title,
          summary: g.summary,
          order: Number.isFinite(g.order) ? g.order : 0,
          categoryId: typeof g.category === "string" ? g.category : g.category?._id || "",
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [gallery, selectedCategoryId]);

  const main = slides[0];
  const allSprites = slides.slice(1);
  const sprites = useMemo(
    () => (isMobile ? allSprites.slice(0, 6) : allSprites),
    [allSprites, isMobile]
  );

  const title =
    main?.title?.[lang]?.trim() ||
    main?.title?.en?.trim() ||
    t("hero1.heroTitle", "Pizza Taste Better Than Skinny Feels.");

  const description =
    main?.summary?.[lang]?.trim() ||
    main?.summary?.en?.trim() ||
    t("hero1.heroSubtitle", "Lezzetli pizzalar, hızlı teslimat.");

  const toCdn = (src?: string, w = 900, h = 900) => {
    if (!src) return "/placeholder.jpg";
    if (src.startsWith("https://res.cloudinary.com/")) {
      return `${src}?w=${w}&h=${h}&c_fill,q_auto,f_auto`;
    }
    return src;
  };
  const mainSrc =
    toCdn(main?.image?.webp || main?.image?.url || main?.image?.thumbnail, 1100, 1100) || "/placeholder.jpg";

  /* ====== MODAL ====== */
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  useEffect(() => { setModalOpen(false); }, [lang, slides.length]);

  /* ====== SPRITE yerleşimi ====== */
  type SpriteLayout = { leftPct: number; topPct: number; size: number; delay: number; dur: number; rot: number };
  const layouts = useMemo<SpriteLayout[]>(() => {
    const seed = (main?.id?.length || 7) * 3.14159;
    const fract = (x: number) => x - Math.floor(x);

    return sprites.map((_, idx) => {
      const r1 = fract(Math.sin((idx + 1) * 12.9898 + seed) * 43758.5453123);
      const r2 = fract(Math.sin((idx + 1) * 78.233 + seed) * 24634.63453);
      const r3 = fract(Math.sin((idx + 1) * 3.77 + seed) * 1553.115);

      let leftPct: number;
      if (isMobile) {
        const leftSide = idx % 2 === 0;
        leftPct = leftSide ? 4 + r1 * 24 : 72 + r1 * 24; // 4..28 veya 72..96
      } else {
        const raw = 2 + r1 * 94;
        leftPct = raw > 60 ? 60 - (raw - 60) * 0.9 : raw;
        leftPct = Math.max(2, Math.min(58, leftPct));
      }

      const topPct = isMobile ? 10 + r2 * 70 : 6 + r2 * 84;
      const sizeBase = isMobile ? 48 + r3 * 56 : 72 + r3 * 78;
      const size = Math.round(sizeBase * (isMobile && leftPct < 32 ? 0.95 : 1));
      const delay = fract(Math.sin((idx + 1) * 1.31 + seed) * 10) * 0.7;
      const dur = 3.6 + fract(Math.sin((idx + 1) * 2.17 + seed) * 10) * 1.6;
      const rot = idx % 2 === 0 ? -6 : 6;
      return { leftPct, topPct, size, delay, dur, rot };
    });
  }, [sprites, main?.id, isMobile]);

  /* =====================  ARAMA (store'dan)  ===================== */
  const menus = useAppSelector((s) => s.menu?.publicList ?? []) as IMenu[];
  const categories = useAppSelector((s) => s.menucategory?.publicList ?? []) as IMenuCategory[];
  const items = useAppSelector(selectMenuItemsPublic) as IMenuItem[];

  const searchParams = useSearchParams();
  const branchId = searchParams?.get("branch") || "";
  const router = useRouter();

  const menusActive = useMemo(
    () => (menus || []).filter((m) => m?.isPublished !== false && m?.isActive !== false),
    [menus]
  );

  const dropdownCats = useMemo(() => {
    const set = new Set<string>();
    const links: string[] = [];
    for (const m of menusActive) {
      for (const lnk of m?.categories || []) {
        const id = asId(lnk.category);
        if (!set.has(id)) { set.add(id); links.push(id); }
      }
    }
    return links
      .map((id) => {
        const c = categories.find((x) => asId(x._id) === id);
        const label = c ? (getMultiLang(c.name as any, uiLang) || c.slug || c.code || id) : id;
        return { id, label };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [menusActive, categories, uiLang]);

  const filterByBranch = useCallback((it: IMenuItem) => {
    if (!branchId) return true;
    const matchInPrices = (arr?: any[]) => {
      const list = Array.isArray(arr) ? arr : [];
      if (!list.length) return true;
      const anyHasOutlet = list.some((p) => p && "outlet" in p);
      if (!anyHasOutlet) return true;
      return list.some((p) => !p?.outlet || String(p.outlet) === String(branchId));
    };
    const variantOk = (it?.variants || []).some((v) => matchInPrices(v?.prices));
    const optionsOk = (it?.modifierGroups || []).some((g) =>
      (g?.options || []).some((o) => matchInPrices(o?.prices))
    );
    const noPriceStruct =
      !(it?.variants || []).some((v) => Array.isArray(v?.prices) && v.prices.length) &&
      !(it?.modifierGroups || []).some((g) =>
        (g?.options || []).some((o) => Array.isArray(o?.prices) && o.prices.length)
      );
    return noPriceStruct || variantOk || optionsOk;
  }, [branchId]);

  const [catId, setCatId] = useState<string>("__all__");
  const [q, setQ] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    let targetCat = catId !== "__all__" ? catId : "";
    if (!targetCat) {
      const normalizedQ = q.trim().toLowerCase();
      if (normalizedQ.length) {
        const relevant = (items || []).filter(
          (it) => it?.isActive !== false && it?.isPublished !== false && filterByBranch(it)
        );
        const score = new Map<string, number>();
        for (const it of relevant) {
          const name = getMultiLang(it.name as any, uiLang) || it.slug || "";
          const desc = getMultiLang((it.description as any) || {}, uiLang) || "";
          const hit =
            name.toLowerCase().includes(normalizedQ) ||
            desc.toLowerCase().includes(normalizedQ);
          if (!hit) continue;
          const itCats = (it?.categories || []).map((c) => asId(c?.category ?? c));
          for (const cid of itCats) score.set(cid, (score.get(cid) || 0) + 1);
        }
        let best: { id: string; cnt: number } | null = null;
        for (const { id } of dropdownCats) {
          const cnt = score.get(id) || 0;
          if (!best || cnt > best.cnt) best = { id, cnt };
        }
        if (best && best.cnt > 0) targetCat = best.id;
      }
    }
    const params = new URLSearchParams();
    if (targetCat) params.set("cat", targetCat);
    if (q.trim()) params.set("q", q.trim());
    if (branchId) params.set("branch", branchId);
    router.push(params.toString() ? `/menu?${params.toString()}` : "/menu");
  };

  if (!slides.length) {
    return (
      <Hero>
        <SliderGrid>
          <TextCol>
            <Badge>{t("hero.badge", "KAÇIRMA!")}</Badge>
            <H1>{t("noItemsFound", "Hiçbir ürün bulunamadı.")}</H1>
          </TextCol>
        </SliderGrid>
      </Hero>
    );
  }

  return (
    <Hero>
      <Glow />

      {/* Sprites katmanı (arka) */}
      <SpriteLayer>
        {sprites.map((s, idx) => {
          const src = toCdn(s.image?.webp || s.image?.url || s.image?.thumbnail, 360, 360);
          const L = layouts[idx];
          if (!L) return null;
          return (
            <Sprite
              key={s.id}
              style={{ left: `${L.leftPct}%`, top: `${L.topPct}%` }}
              as={motion.div}
              animate={{ y: [-10, 10, -10], rotate: [L.rot, -L.rot, L.rot] }}
              transition={{ duration: L.dur, repeat: Infinity, ease: "easeInOut", delay: L.delay }}
            >
              <SpriteImage
                src={src}
                alt={s.title?.[lang] || s.title?.en || "sprite"}
                width={L.size}
                height={L.size}
                style={{ objectFit: "contain" }}
              />
            </Sprite>
          );
        })}
      </SpriteLayer>

      <SliderGrid>
        {/* SOL: metinler + arama */}
        <TextCol>
          <Badge>{t("hero.badge", "KAÇIRMA!")}</Badge>
          <H1>{title}</H1>
          <Lead>{description}</Lead>

          {/* ---- SEARCH BAR (hero.* anahtarları) ---- */}
          <SearchForm onSubmit={handleSubmit} role="search" aria-label={t("hero.search", "Menü arama")}>
            <SelectWrap>
              <Select
                value={catId}
                onChange={(e) => setCatId(e.target.value)}
                aria-label={t("menu.category", "Kategori")}
              >
                <option value="__all__">{t("menu.allCategories", "Tüm Kategoriler")}</option>
                {dropdownCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
              <SelectChevron>▾</SelectChevron>
            </SelectWrap>

            <SearchInput
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("menu.searchPlaceholder", "Burada ara...")}
              aria-label={t("menu.searchPlaceholder", "Arama")}
            />

            <SearchButton type="submit">{t("menu.check", "Ara")}</SearchButton>
          </SearchForm>

          <Actions>
            <PrimaryCTA href="/menu">{t("hero.orderNow", "Şimdi Sipariş Ver")}</PrimaryCTA>
            <SecondaryCTA href="/menu">{t("hero.viewMenu", "Menüyü Gör")}</SecondaryCTA>
          </Actions>
        </TextCol>

        {/* SAĞ: ana görsel (mobilde tam ortalı) */}
        <Stage>
          <MainWrap>
            <MainArea
              as={motion.div}
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.02 }}
              onClick={openModal}
              role="button"
              aria-label={title}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openModal()}
            >
              <MainImage
                src={mainSrc}
                alt={title || "Hero image"}
                fill
                priority
                sizes="(max-width: 1100px) 88vw, 640px"
                style={{ objectFit: "contain" }}
              />
            </MainArea>
          </MainWrap>
        </Stage>
      </SliderGrid>

      
    </Hero>
  );
};

export default HeroRestaurant;

/* ---------------- STYLED ---------------- */

const Hero = styled.section`
  position: relative;
  width: 100%;
  overflow: hidden;
  min-height: 560px;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) =>
    theme.colors.primaryDark} 100%);
  ${({ theme }) => theme.media.small} { min-height: 620px; }
`;

const Glow = styled.div`
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(45% 60% at 75% 55%, rgba(255,193,7,0.35) 0%, rgba(255,193,7,0) 65%);
`;

const SpriteLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`;

const Sprite = styled.div`
  position: absolute;
`;

const SpriteImage = styled(Image)`
  width: auto; height: auto;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.25));
`;

const SliderGrid = styled.div`
  position: relative; z-index: 2;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: ${({ theme }) => theme.spacings.lg};
  align-items: center;
  padding: 64px min(6vw, 72px);
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    padding: 32px 18px 44px;
  }
`;

const TextCol = styled.div`
  color: ${({ theme }) => theme.colors.whiteColor};
  display: flex; flex-direction: column; gap: 16px;
  ${({ theme }) => theme.media.small} { align-items: center; text-align: center; }
`;

const Badge = styled.span`
  align-self: flex-start;
  background: ${({ theme }) => theme.buttons.warning.background};
  color: ${({ theme }) => theme.buttons.warning.text};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 8px 14px;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacing: .04em;
  ${({ theme }) => theme.media.small} { align-self: center; }
`;

const H1 = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  font-size: clamp(2rem, 4.2vw, 3.6rem);
  line-height: 1.12;
  color: ${({ theme }) => theme.colors.whiteColor};
  text-shadow: 0 10px 30px rgba(0,0,0,0.25);
`;

const Lead = styled.p`
  margin: 0 0 10px 0;
  color: rgba(255,255,255,0.92);
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.6;
  max-width: 640px;
  ${({ theme }) => theme.media.small} { max-width: 92vw; font-size: ${({ theme }) => theme.fontSizes.md}; }
`;

const SearchForm = styled.form`
  display: grid;
  grid-template-columns: 260px 1fr 120px;
  gap: 10px;
  margin-top: 4px;
  width: 100%;
  max-width: 720px;

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    max-width: 96vw;
  }
`;

const SelectWrap = styled.div`
  position: relative;
`;
const Select = styled.select`
  width: 100%;
  appearance: none;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px 38px 12px 14px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.inputBorderFocus}; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;
const SelectChevron = styled.span`
  pointer-events: none;
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  font-size: 18px; color: ${({ theme }) => theme.colors.textSecondary};
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px 14px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  outline: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  &::placeholder { color: ${({ theme }) => theme.colors.placeholder}; }
  &:focus { border-color: ${({ theme }) => theme.colors.inputBorderFocus}; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;

const SearchButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: 12px 16px;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: transform .15s ease, opacity .2s ease, background .2s ease;
  &:hover { transform: translateY(-1px); opacity: .95; background: ${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;

const Actions = styled.div`
  display: flex; gap: 12px; margin-top: 10px;
  ${({ theme }) => theme.media.small} { justify-content: center; flex-wrap: wrap; }
`;

const PrimaryCTA = styled(Link)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 12px 26px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(0,0,0,0.25);
  transition: transform .15s ease, opacity .2s ease, background .2s ease;
  &:hover { transform: translateY(-1px); opacity: .95; background: ${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;

const SecondaryCTA = styled(Link)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 10px 24px;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-decoration: none;
  transition: background .2s ease, color .2s ease;
  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; color: #fff; }
`;

const Stage = styled.div`
  position: relative;
  width: 100%;
  height: 540px;
  ${({ theme }) => theme.media.small} { height: 460px; }
`;

const MainWrap = styled.div`
  position: absolute;
  right: 0; bottom: 0;
  width: min(620px, 92%);
  height: 100%;
  filter: drop-shadow(0 14px 40px rgba(0,0,0,0.25));
  z-index: 3;

  ${({ theme }) => theme.media.small} {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    width: 88%;
  }
`;

const MainArea = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const MainImage = styled(Image)`
  position: absolute !important;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
`;
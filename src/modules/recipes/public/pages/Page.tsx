"use client";

import styled from "styled-components";
import { useEffect, useMemo, useState, useCallback, useDeferredValue, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import { Skeleton, ErrorMessage } from "@/shared";

import type { IRecipe, AiGenInput } from "@/modules/recipes/types";
import { fetchRecipesPublic, generateRecipePublic } from "@/modules/recipes/slice/recipeSlice";
import { getMultiLang, type SupportedLocale } from "@/types/recipes/common";
import { getUILang } from "@/i18n/recipes/getUILang";
import { useRecipeReactions } from "@/hooks/useRecipeReactions";
import { useRecaptcha } from "@/hooks/useRecaptcha"; // ⬅️ reCAPTCHA hook

/* ---------- tiny toast system (local) ---------- */
type Toast = { id: number; type?: "info"|"success"|"error"; msg: string };
function useToasts() {
  const [items, setItems] = useState<Toast[]>([]);
  const add = useCallback((msg: string, type: Toast["type"]="info") => {
    const id = Date.now() + Math.random();
    setItems((a)=>[...a, { id, type, msg }]);
    setTimeout(()=> setItems((a)=>a.filter(t=>t.id!==id)), 2400);
  },[]);
  const remove = useCallback((id:number)=>setItems((a)=>a.filter(t=>t.id!==id)),[]);
  return { items, add, remove };
}
function Toasts({items, onRemove}:{items:Toast[]; onRemove:(id:number)=>void}) {
  return (
    <ToastWrap>
      {items.map(t=>(
        <ToastItem key={t.id} data-type={t.type}>
          <span>{t.msg}</span>
          <button onClick={()=>onRemove(t.id)} aria-label="close">×</button>
        </ToastItem>
      ))}
    </ToastWrap>
  );
}

/* ---- helpers ---- */
const toSlug = (item: IRecipe, lang: SupportedLocale) =>
  (item.slug && (item.slug as any)[lang]) ||
  (item.slug && (item.slug as any).tr) ||
  (item.slug && (item.slug as any).en) ||
  item.slugCanonical ||
  "";

/* ---- AI Panel ---- */
function AIPanel({
  lang,
  onCreated,
  t,
  toast,
}: {
  lang: SupportedLocale;
  onCreated: (r: IRecipe) => void;
  t: (k: string, d?: string) => string;
  toast: (m: string, tp?: "info"|"success"|"error") => void;
}) {
  const dispatch = useAppDispatch();
  const executeRecaptcha = useRecaptcha(); // ⬅️ reCAPTCHA
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [servings, setServings] = useState<number | undefined>(undefined);
  const [maxMinutes, setMaxMinutes] = useState<number | undefined>(undefined);

  const PH = t(
    "ai.prompt_ph_full",
    "Örn: 4 kişilik, 25 dk, fırın yok; domates-biber öne çıksın; vegan; adımlar kısa ve numaralı; sonunda kalori ver."
  );

  const PRESETS = [
    t("ai.no_spicy","acı olmasın"),
    t("ai.few_ingredients","az malzemeli"),
    t("ai.ready_15","15 dakikada hazır"),
    t("ai.pan","tavada"),
    t("ai.pot","tencerede"),
    t("ai.kid_friendly","çocuk dostu"),
    t("ai.no_oven","fırınsız"),
  ];
  const addPreset = (p: string) =>
    setPrompt((s) => s ? `${s.trim()} • ${p}` : p);

  const run = async () => {
    setErr(null); setLoading(true);
    try {
      // 1) reCAPTCHA token al
      const token = await executeRecaptcha("recipes_ai_generate");
      if (!token) {
        const m = t("ai.recaptcha_failed","reCAPTCHA doğrulanamadı. Lütfen tekrar deneyin.");
        setErr(m); toast(m, "error"); setLoading(false); return;
      }

      // 2) payload + token
      const payload: AiGenInput<SupportedLocale> = { lang, prompt: prompt || undefined, servings, maxMinutes } as any;
      const withCaptcha = { ...payload, recaptchaToken: token } as any;

      // 3) API call
      const { data, message } = await (dispatch as any)(generateRecipePublic(withCaptcha)).unwrap();
      toast(message || t("ai.generated_ok","Tarif üretildi"), "success");
      onCreated(data);
    } catch (e: any) {
      const m = typeof e === "string" ? e : (e?.message || t("ai.generate_error","Üretim sırasında hata oluştu."));
      setErr(m);
      toast(m, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIWrap>
      <h3>🤖 {t("ai.create_with_ai", "AI ile oluştur")}</h3>

      <QuickChips role="list" aria-label={t("ai.quick_prompts","Hızlı istekler")}>
        {PRESETS.map((p)=>(
          <ChipBtn role="listitem" key={p} onClick={()=>addPreset(p)}>{p}</ChipBtn>
        ))}
      </QuickChips>

      <Row>
        <label>
          <span>{t("ai.servings", "Servis (kişi)")}</span>
          <input type="number" min={1} inputMode="numeric" value={servings ?? ""} onChange={(e) => setServings(e.target.value ? Number(e.target.value) : undefined)} placeholder="4" />
        </label>
        <label>
          <span>{t("ai.max_minutes", "Maks. Süre (dk)")}</span>
          <input type="number" min={1} inputMode="numeric" value={maxMinutes ?? ""} onChange={(e) => setMaxMinutes(e.target.value ? Number(e.target.value) : undefined)} placeholder="20" />
        </label>
      </Row>

      <label>
        <span>{t("ai.extra_prompt", "Prompt (tüm kriterlerin)")}</span>
        <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={PH} />
      </label>

      <AIButtons>
        <button onClick={() => setPrompt("Türk mutfağında, 4 kişilik, 25 dk; acısız; tencerede; gram/adet ölçüleri; sonunda kalori ver.")}>
          ⚙ {t("ai.example", "Örnek")}
        </button>
        <button className="primary" onClick={run} disabled={loading}>
          {loading ? t("ai.generating", "Oluşturuluyor…") : t("ai.generate", "Oluştur")}
        </button>
      </AIButtons>

      {err && <Note className="err">❌ {err}</Note>}
    </AIWrap>
  );
}

/* ---- Page ---- */
export default function RecipesPage() {
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector((s) => s.recipe);

  const router = useRouter();
  const { items:toasts, add:addToast, remove:removeToast } = useToasts();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "top" | "quick">("newest");
  const [tab, setTab] = useState<"explore" | "ai">("explore");

  // t wrapper (prop tipine uyum)
  const tt = useMemo(() => ((k: string, d?: string) => t(k, { defaultValue: d })), [t]);

  // i18n bundle güvence
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "recipes")) {
      i18n.addResourceBundle(lng, "recipes", resources, true, true);
    }
  });

  // debounce + concurrent UI
  const deferredQ = useDeferredValue(q);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    startTransition(() => {
      (dispatch as any)(fetchRecipesPublic({ q: deferredQ, sort } as any));
    });
  }, [dispatch, deferredQ, sort]);

  // local fallback filter
  const filtered = useMemo(() => {
    let arr = [...(list || [])];
    if (sort === "quick") arr = arr.filter((r) => (r.totalMinutes ?? 9999) <= 25);
    if (deferredQ.trim()) {
      const qq = deferredQ.trim().toLowerCase();
      arr = arr.filter((r) => {
        const hay = [
          getMultiLang(r.title as any, lang),
          getMultiLang(r.description as any, lang),
          ...(Array.isArray(r.cuisines) ? r.cuisines : []),
          ...(Array.isArray(r.tags) ? r.tags.map((tg: any) => getMultiLang(tg, lang)) : []),
          ...(Array.isArray(r.ingredients) ? r.ingredients.map((i) => getMultiLang((i as any).name, lang)) : []),
          ...(Array.isArray(r.steps) ? r.steps.map((s) => getMultiLang((s as any).text, lang)) : []),
        ].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(qq);
      });
    }
    return arr;
  }, [list, deferredQ, sort, lang]);

  const onCreated = useCallback((r: IRecipe) => {
    const slug = toSlug(r, lang);
    router.push(`/recipes/${slug}`);
  }, [router, lang]);

  return (
    <PageWrapper>
      <PageHead>
        <PageTitle>{t("page.allRecipes", "Tüm Tarifler")}</PageTitle>

        <ControlsBar>
          <SearchBox>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("page.searchPh", "Tarif, malzeme, adım…")}
              aria-label={t("page.search", "Ara")}
            />
            {q && <button onClick={() => setQ("")} aria-label={t("clear", "Temizle")}>×</button>}
          </SearchBox>

          <SortBox>
            <label>{t("sort", "Sırala:")}</label>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="newest">{t("sort.newest", "En Yeni")}</option>
              <option value="top">{t("sort.top", "En Çok Reaksiyon")}</option>
              <option value="quick">{t("sort.quick", "Hızlı (≤25 dk)")}</option>
            </select>
          </SortBox>

          <RightActions>
            <button onClick={() => setTab(tab === "explore" ? "ai" : "explore")}>
              {tab === "ai" ? t("backToList", "Listeye Dön") : `🤖 ${t("ai.create_with_ai", "AI ile oluştur")}`}
            </button>
          </RightActions>
        </ControlsBar>
      </PageHead>

      {tab === "ai" ? (
        <AIPanel lang={lang} onCreated={onCreated} t={tt} toast={addToast} />
      ) : loading && !list?.length ? (
        <RecipesGrid>{[...Array(6)].map((_, i) => <Skeleton key={i} />)}</RecipesGrid>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filtered.length === 0 ? (
        <EmptyMsg>{t("page.noRecipes", "Herhangi bir içerik bulunamadı.")}</EmptyMsg>
      ) : (
        <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity .2s" }}>
          <RecipesGrid>
            {filtered.map((item) => {
              const slug = toSlug(item, lang);
              const detailHref = `/recipes/${slug}`;
              const title = getMultiLang(item.title, lang);
              const cover = item.images?.[0]?.url;

              return (
                <RecipesCard
                  key={item._id}
                  as={motion.div}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => router.prefetch(detailHref)}
                >
                  <Link href={detailHref} tabIndex={-1} style={{ display: "block" }}>
                    <ImageWrapper>
                      {cover ? (
                        <StyledImage src={cover} alt={title} width={440} height={210} loading="lazy" sizes="(max-width:800px) 100vw, 33vw" />
                      ) : (
                        <ImgPlaceholder />
                      )}
                    </ImageWrapper>
                  </Link>

                  <CardContent>
                    <CardTitle as={Link} href={detailHref}>{title}</CardTitle>
                    <Tags>
                      {item.totalMinutes != null && <Tag>{t("time", "Süre")}: {item.totalMinutes}′</Tag>}
                      {item.servings != null && <Tag>{t("servings", "Porsiyon")}: {item.servings}</Tag>}
                      {item.calories != null && <Tag>{t("calories", "Kalori")}: {item.calories}</Tag>}
                      {(item.tags || []).slice(0, 3).map((tg, i) => (
                        <Tag key={i}>{getMultiLang(tg as any, lang)}</Tag>
                      ))}
                    </Tags>

                    {/* Mini optimistic reactions + toast */}
                    <RecipeReactionMini id={String(item._id)} t={tt} toast={addToast} />

                    <ReadMore href={detailHref}>{t("page.readMore", "Detayları Gör →")}</ReadMore>
                  </CardContent>
                </RecipesCard>
              );
            })}
          </RecipesGrid>
        </div>
      )}

      {/* toasts */}
      <Toasts items={toasts} onRemove={removeToast} />
    </PageWrapper>
  );
}

/* --- mini reactions --- */
function RecipeReactionMini({
  id,
  t,
  toast,
}: {
  id: string;
  t: (k: string, d?: string) => string;
  toast: (m: string, tp?: "info"|"success"|"error") => void;
}) {
  const { summary, mine, toggle, toggleEmoji, rate } = useRecipeReactions(id);
  const EMOJIS = ["👍", "🔥", "😍", "😋"];

  const onToggle = async (kind: "LIKE"|"FAVORITE"|"BOOKMARK") => {
    await toggle(kind);
    toast(t("saved","Kaydedildi"), "success");
  };
  const onEmoji = async (e: string) => {
    await toggleEmoji(e);
    toast(`${t("saved","Kaydedildi")} ${e}`, "success");
  };
  const onRate = async (v: 1|2|3|4|5) => {
    const ok = await rate(v);
    toast(ok ? t("saved","Kaydedildi") : t("error","Hata"), ok ? "success" : "error");
  };

  return (
    <MiniRx>
      <div className="em">
        {EMOJIS.map((e) => (
          <button key={e} aria-pressed={mine.emojis.has(e)} onClick={() => onEmoji(e)} title={`${e} ${summary.emojis[e] || 0}`}>
            <span>{e}</span><small>{summary.emojis[e] || 0}</small>
          </button>
        ))}
      </div>
      <div className="stars" title={t("rate", "Puan ver")}>
        {[1,2,3,4,5].map((v:any)=>(
          <span key={v} onClick={()=>onRate(v)}>
            {(mine.rating ?? Math.round(summary.ratingAvg || 0)) >= v ? "★" : "☆"}
          </span>
        ))}
      </div>
      <div className="toggles">
        <button aria-pressed={mine.like} onClick={() => onToggle("LIKE")}>{mine.like ? "👍" : "👍🏻"}</button>
        <button aria-pressed={mine.favorite} onClick={() => onToggle("FAVORITE")}>{mine.favorite ? "❤️" : "🤍"}</button>
        <button aria-pressed={mine.bookmark} onClick={() => onToggle("BOOKMARK")}>{mine.bookmark ? "🔖" : "📑"}</button>
      </div>
    </MiniRx>
  );
}

/* ----- styles ----- */
const PageWrapper = styled.div`
  max-width: 1260px; margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
  @media (max-width: 600px) { padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs}; }
`;
const ToastWrap = styled.div`
  position: fixed; z-index: 9999; right: 16px; bottom: 16px;
  display: grid; gap: 8px;
`;
const ToastItem = styled.div`
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  box-shadow:${({theme})=>theme.shadows.md};
  &[data-type="success"] { border-color: #20b26b55; }
  &[data-type="error"] { border-color: #e0565655; }
  button{border:0;background:transparent;cursor:pointer;font-size:16px;opacity:.75;}
`;
const PageHead = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.sm};`;
const ControlsBar = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; align-items:center; flex-wrap:wrap; justify-content:space-between;
`;
const SearchBox = styled.div`
  display:flex; align-items:center; gap:6px; background:${({theme})=>theme.colors.inputBackgroundLight};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder}; border-radius:${({theme})=>theme.radii.lg};
  padding:6px 10px;
  input{border:0;background:transparent;outline:none;min-width:260px;}
  button{border:0;background:transparent;cursor:pointer;font-size:18px;}
`;
const SortBox = styled.div`
  display:flex; align-items:center; gap:8px;
  select{padding:6px 10px;border-radius:${({theme})=>theme.radii.md};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};}
`;
const RightActions = styled.div`
  margin-inline-start:auto;display:flex;gap:8px;
  button{padding:8px 12px;border-radius:${({theme})=>theme.radii.md};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};background:${({theme})=>theme.colors.cardBackground};cursor:pointer;}
`;
const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  text-align: center; font-weight: ${({ theme }) => theme.fontWeights.bold}; letter-spacing: 0.01em;
`;
const RecipesGrid = styled.div`
  display: grid; gap: 2.1rem 2rem;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  align-items: stretch; margin: 0 auto;
  @media (max-width: 800px) { gap: 1.3rem; }
`;
const RecipesCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1.4px solid ${({ theme }) => theme.colors.borderLight};
  overflow: hidden; display: flex; flex-direction: column;
  transition: box-shadow .17s, border .17s, transform .16s;
  cursor: pointer; min-height: 355px;
  &:hover,&:focus-visible{box-shadow:${({theme})=>theme.shadows.lg};border-color:${({theme})=>theme.colors.primary};transform:translateY(-8px) scale(1.035);z-index:1;}
`;
const ImageWrapper = styled.div`
  width: 100%; height: 180px; overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display:flex; align-items:center; justify-content:center; line-height:0;
`;
const StyledImage = styled(Image)`width:100%;height:180px;object-fit:cover;display:block;`;
const ImgPlaceholder = styled.div`width:100%;height:180px;background:${({theme})=>theme.colors.skeleton};opacity:.38;`;
const CardContent = styled.div`padding:${({theme})=>theme.spacings.lg};flex:1;display:flex;flex-direction:column;gap:.7rem;`;
const CardTitle = styled.h2`
  font-size:${({theme})=>theme.fontSizes.large};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  color:${({theme})=>theme.colors.title};
  margin-bottom:.13em; cursor:pointer; transition:color .17s;
  &:hover,&:focus{ color:${({theme})=>theme.colors.primary}; text-decoration:underline;}
`;
const Tags = styled.div`display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.3em;`;
const Tag = styled.span`
  background:${({theme})=>theme.colors.accent}22;
  color:${({theme})=>theme.colors.primary};
  padding:.21em 1.07em; font-size:.96em; border-radius:${({theme})=>theme.radii.pill};
  font-weight:500; letter-spacing:.01em; display:inline-block;
`;
const EmptyMsg = styled.div`color:${({theme})=>theme.colors.textSecondary};text-align:center;font-size:1.18em;margin:2.4em 0 1.7em 0;`;
const ReadMore = styled(Link)`
  margin-top:auto; font-size:${({theme})=>theme.fontSizes.sm};
  font-weight:${({theme})=>theme.fontWeights.semiBold}; color:${({theme})=>theme.colors.primary}; text-decoration:none;
  border-radius:${({theme})=>theme.radii.md}; padding:.17em .9em;
  background:${({theme})=>theme.colors.backgroundSecondary}; box-shadow:${({theme})=>theme.shadows.xs};
  transition:background .19s, color .16s;
  &:hover,&:focus-visible{background:${({theme})=>theme.colors.primary}; color:#fff; text-decoration:none;}
`;
const MiniRx = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;
  .em{display:flex;gap:8px;flex-wrap:wrap;}
  .em button{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;border:1px solid var(--border,#e1e1e1);background:var(--bg,#fafafa);cursor:pointer;}
  .stars span{cursor:pointer;font-size:16px;margin-inline:2px;}
  .toggles button{border:0;background:transparent;cursor:pointer;font-size:18px;}
`;
const AIWrap = styled.section`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.colors.cardBackground};
  box-shadow:${({theme})=>theme.shadows.md};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.lg};
  display:flex; flex-direction:column; gap:10px;
  h3{margin:0 0 6px;}
  label{display:flex;flex-direction:column;gap:6px;}
  input,textarea{padding:10px 12px;border-radius:${({theme})=>theme.radii.md};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};background:${({theme})=>theme.colors.inputBackgroundLight};}
`;
const QuickChips = styled.div`display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;`;
const ChipBtn = styled.button`
  padding:6px 10px;border-radius:999px;cursor:pointer;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.colors.inputBackgroundLight};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Row = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;`;
const AIButtons = styled.div`display:flex;gap:8px;justify-content:flex-end; button{padding:8px 12px;border-radius:${({theme})=>theme.radii.md};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};background:${({theme})=>theme.colors.cardBackground};cursor:pointer;} .primary{background:${({theme})=>theme.colors.primary};color:#fff;border-color:${({theme})=>theme.colors.primary};}`;
const Note = styled.div`font-size:.95em; &.err{color:${({theme})=>theme.colors.danger};}`;

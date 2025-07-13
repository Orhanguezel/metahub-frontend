import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useActiveTenant } from "@/hooks/useActiveTenant";

// Section slice'lar (public endpointler)
import { fetchSectionMetas } from "@/modules/section/slices/sectionMetaSlice";
import { fetchSectionSettingsByTenant } from "@/modules/section/slices/sectionSettingSlice";
import { fetchSettings } from "@/modules/settings/slice/settingsSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";
import { fetchCart } from "@/modules/cart/slice/cartSlice";
import { fetchServices } from "@/modules/services/slice/servicesSlice";
import { fetchPublishedGalleryItems } from "@/modules/gallery/slice/gallerySlice";
import { fetchGalleryCategories } from "@/modules/gallery/slice/galleryCategorySlice";
import { fetchAbout } from "@/modules/about/slice/aboutSlice";
import { fetchNews } from "@/modules/news/slice/newsSlice";
import { fetchBlog } from "@/modules/blog/slice/blogSlice";
import { fetchArticles } from "@/modules/articles/slice/articlesSlice";
import { fetchActivity } from "@/modules/activity/slice/activitySlice";
import { fetchReferences } from "@/modules/references/slice/referencesSlice";
import { fetchBikes } from "@/modules/bikes/slice/bikesSlice";

export const usePublicLayoutInit = () => {
  const dispatch = useAppDispatch();
  const tenant = useActiveTenant();

  // --- SECTION ---
  const {
    metas: sectionMetas,
    loading: sectionMetasLoading,
    error: sectionMetasError,
    status: sectionMetasStatus,
  } = useAppSelector((s) => s.sectionMeta);

  const {
    settings: sectionSettings,
    loading: sectionSettingsLoading,
    error: sectionSettingsError,
    status: sectionSettingsStatus,
  } = useAppSelector((s) => s.sectionSetting);

  const sectionLoading = sectionMetasLoading || sectionSettingsLoading;

  // --- SETTINGS ---
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    fetchedSettings,
    status: settingsStatus,
  } = useAppSelector((s) => s.settings);

  // --- COMPANY ---
  const {
    company,
    status: companyStatus,
    error: companyError,
  } = useAppSelector((s) => s.company);

  // --- CART ---
  const {
    cart,
    status: cartStatus,
    error: cartError,
  } = useAppSelector((s) => s.cart);

  // --- SERVICES ---
  const {
    services,
    status: servicesStatus,
    error: servicesError,
  } = useAppSelector((s) => s.services);

  // --- GALLERY ---
  const publicImages = useAppSelector((s) => s.gallery.publicImages);
  const galleryCategories = useAppSelector((s) => s.galleryCategory.categories);

  // --- ABOUT ---
  const {
    about,
    status: aboutStatus,
    error: aboutError,
  } = useAppSelector((s) => s.about);

  // --- NEWS ---
  const {
    news,
    status: newsStatus,
    error: newsError,
  } = useAppSelector((s) => s.news);

  // --- BLOG ---
  const {
    blog,
    status: blogStatus,
    error: blogError,
  } = useAppSelector((s) => s.blog);

  // --- ARTICLES ---
  const {
    articles,
    status: articlesStatus,
    error: articlesError,
  } = useAppSelector((s) => s.articles);

  // --- ACTIVITY ---
  const {
    activity,
    status: activityStatus,
    error: activityError,
  } = useAppSelector((s) => s.activity);

  // --- REFERENCES ---
  const {
    references,
    status: referencesStatus,
    error: referencesError,
  } = useAppSelector((s) => s.references);

  // --- BIKES ---
  const {
    bikes,
    status: bikesStatus,
    error: bikesError,
  } = useAppSelector((s) => s.bikes);

  // --- INIT FLAG ---
  const didInit = useRef<string>("");

  useEffect(() => {
    if (!tenant) return;
    if (didInit.current === tenant) return;
    didInit.current = tenant;

    // Section
    if ((!Array.isArray(sectionMetas) || sectionMetas.length === 0) && !sectionMetasLoading) {
      dispatch(fetchSectionMetas());
    }
    if ((!Array.isArray(sectionSettings) || sectionSettings.length === 0) && !sectionSettingsLoading) {
      dispatch(fetchSectionSettingsByTenant());
    }

    // Diğer modüller (hepsi array kontrolü ve status:idle)
    if (!fetchedSettings) dispatch(fetchSettings());
    if (services.length === 0 && servicesStatus === "idle") dispatch(fetchServices());
    if (about.length === 0 && aboutStatus === "idle") dispatch(fetchAbout());
    if (news.length === 0 && newsStatus === "idle") dispatch(fetchNews());
    if (blog.length === 0 && blogStatus === "idle") dispatch(fetchBlog());
    if (articles.length === 0 && articlesStatus === "idle") dispatch(fetchArticles());
    if (activity.length === 0 && activityStatus === "idle") dispatch(fetchActivity());
    if (references.length === 0 && referencesStatus === "idle") dispatch(fetchReferences());
    if (bikes.length === 0 && bikesStatus === "idle") dispatch(fetchBikes());
    if (!company && companyStatus === "idle") dispatch(fetchCompanyInfo());

    if (!cart && cartStatus === "idle") dispatch(fetchCart());
    dispatch(fetchPublishedGalleryItems());
    dispatch(fetchGalleryCategories());
  }, [
    dispatch,
    tenant,
    fetchedSettings,
    company,
    companyStatus,
    cart,
    cartStatus,
    services,
    servicesStatus,
    about,
    aboutStatus,
    news,
    newsStatus,
    blog,
    blogStatus,
    articles,
    articlesStatus,
    activity,
    activityStatus,
    references,
    referencesStatus,
    bikes,
    bikesStatus,
    sectionMetas,
    sectionMetasLoading,
    sectionSettings,
    sectionSettingsLoading,
  ]);

  return {
    sectionMetas, sectionMetasStatus, sectionMetasError,
    sectionSettings, sectionSettingsStatus, sectionSettingsError,
    sectionLoading,

    settings, settingsStatus, settingsLoading, settingsError, fetchedSettings,
    company, companyStatus, companyError,
    cart, cartStatus, cartError,
    services, servicesStatus, servicesError,
    publicImages, galleryCategories,

    about, aboutStatus, aboutError,
    news, newsStatus, newsError,
    blog, blogStatus, blogError,
    articles, articlesStatus, articlesError,
    activity, activityStatus, activityError,
    references, referencesStatus, referencesError,
    bikes, bikesStatus, bikesError,
  };
};

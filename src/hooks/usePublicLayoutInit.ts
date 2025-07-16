import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useActiveTenant } from "@/hooks/useActiveTenant";

// Public endpoint thunks
import { fetchSectionMetas } from "@/modules/section/slices/sectionMetaSlice";
import { fetchSectionSettingsByTenant } from "@/modules/section/slices/sectionSettingSlice";
import { fetchSettings } from "@/modules/settings/slice/settingsSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";
//import { fetchCart } from "@/modules/cart/slice/cartSlice";
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
import { fetchCoupons } from "@/modules/coupon/slice/couponSlice";
import {
  fetchAllChatSessions,
  fetchActiveChatSessions,
  fetchArchivedSessions,
} from "@/modules/chat/slice/chatSlice";
import { 
  fetchBookings 
} from "@/modules/booking/slice/bookingSlice";
export const usePublicLayoutInit = () => {
  const dispatch = useAppDispatch();
  const { tenant, loading: tenantLoading } = useActiveTenant();

  // Sadece array/selectors için ayrı alınması daha okunaklı
  const sectionMeta = useAppSelector((s) => s.sectionMeta);
  const sectionSetting = useAppSelector((s) => s.sectionSetting);
  const settingsSlice = useAppSelector((s) => s.settings);
  const companySlice = useAppSelector((s) => s.company);
  const cartSlice = useAppSelector((s) => s.cart);
  const servicesSlice = useAppSelector((s) => s.services);
  const gallery = useAppSelector((s) => s.gallery);
  const galleryCategory = useAppSelector((s) => s.galleryCategory);
  const aboutSlice = useAppSelector((s) => s.about);
  const newsSlice = useAppSelector((s) => s.news);
  const blogSlice = useAppSelector((s) => s.blog);
  const articlesSlice = useAppSelector((s) => s.articles);
  const activitySlice = useAppSelector((s) => s.activity);
  const referencesSlice = useAppSelector((s) => s.references);
  const bikesSlice = useAppSelector((s) => s.bikes);
  const couponSlice = useAppSelector((s) => s.coupon);
  const chat = useAppSelector((s) => s.chat);
  const profile = useAppSelector((s) => s.account.profile);
  const bookings = useAppSelector((s) => s.booking);


  const didInit = useRef<string | undefined>(undefined);


  useEffect(() => {
    if (tenantLoading || !tenant) return; // Tenant yüklenmeden hiçbir fetch atılmaz
    if (didInit.current === tenant._id) return; // Objeyle kontrol (slug da olabilir)
    didInit.current = tenant._id;

    // Public fetchler
    if (
      (!Array.isArray(sectionMeta.metas) || sectionMeta.metas.length === 0) &&
      !sectionMeta.loading
    ) dispatch(fetchSectionMetas());

    if (
      (!Array.isArray(sectionSetting.settings) || sectionSetting.settings.length === 0) &&
      !sectionSetting.loading
    ) dispatch(fetchSectionSettingsByTenant());

    if (!settingsSlice.fetchedSettings) dispatch(fetchSettings());
    if (servicesSlice.services.length === 0 && servicesSlice.status === "idle") dispatch(fetchServices());
    if (aboutSlice.about.length === 0 && aboutSlice.status === "idle") dispatch(fetchAbout());
    if (newsSlice.news.length === 0 && newsSlice.status === "idle") dispatch(fetchNews());
    if (blogSlice.blog.length === 0 && blogSlice.status === "idle") dispatch(fetchBlog());
    if (articlesSlice.articles.length === 0 && articlesSlice.status === "idle") dispatch(fetchArticles());
    if (activitySlice.activity.length === 0 && activitySlice.status === "idle") dispatch(fetchActivity());
    if (referencesSlice.references.length === 0 && referencesSlice.status === "idle") dispatch(fetchReferences());
    if (bikesSlice.bikes.length === 0 && bikesSlice.status === "idle") dispatch(fetchBikes());
    if (!companySlice.company && companySlice.status === "idle") dispatch(fetchCompanyInfo());
    if (!couponSlice.coupons || couponSlice.coupons.length === 0) dispatch(fetchCoupons());

    if (
  profile?.email && // kullanıcı yüklendi
  bookings.bookings.length === 0 &&
  bookings.status === "idle"
) {
  dispatch(fetchBookings());
}


    // --- SADECE LOGIN OLAN KULLANICIYA CHAT SESSION FETCH ---
    if (profile) {
      if (chat.sessions.length === 0) dispatch(fetchAllChatSessions());
      if (chat.activeSessions.length === 0) dispatch(fetchActiveChatSessions());
      if (chat.archivedSessions.length === 0) dispatch(fetchArchivedSessions());
    }

    dispatch(fetchPublishedGalleryItems());
    dispatch(fetchGalleryCategories());
  }, [
    dispatch,
    tenant,
    tenantLoading,
    profile,
    // state'lerin tekil array veya nesne referansını ekle (tekrarlı render önlenir)
    sectionMeta.metas, sectionMeta.loading, sectionSetting.settings, sectionSetting.loading,
    settingsSlice.fetchedSettings,
    servicesSlice.services, servicesSlice.status,
    aboutSlice.about, aboutSlice.status,
    newsSlice.news, newsSlice.status,
    blogSlice.blog, blogSlice.status,
    articlesSlice.articles, articlesSlice.status,
    activitySlice.activity, activitySlice.status,
    referencesSlice.references, referencesSlice.status,
    bikesSlice.bikes, bikesSlice.status,
    companySlice.company, companySlice.status,
    couponSlice.coupons, couponSlice.status,
    chat.sessions.length, chat.activeSessions.length, chat.archivedSessions.length,
    gallery.publicImages, galleryCategory.categories,
    bookings.bookings.length, bookings.status
  ]);

  return {
    sectionMetas: sectionMeta.metas,
    sectionMetasStatus: sectionMeta.status,
    sectionMetasError: sectionMeta.error,
    sectionSettings: sectionSetting.settings,
    sectionSettingsStatus: sectionSetting.status,
    sectionSettingsError: sectionSetting.error,
    sectionLoading: sectionMeta.loading || sectionSetting.loading,
    settings: settingsSlice.settings,
    settingsStatus: settingsSlice.status,
    settingsLoading: settingsSlice.loading,
    settingsError: settingsSlice.error,
    fetchedSettings: settingsSlice.fetchedSettings,
    company: companySlice.company,
    companyStatus: companySlice.status,
    companyError: companySlice.error,
    cart: cartSlice.cart,
    cartStatus: cartSlice.status,
    cartError: cartSlice.error,
    services: servicesSlice.services,
    servicesStatus: servicesSlice.status,
    servicesError: servicesSlice.error,
    publicImages: gallery.publicImages,
    galleryCategories: galleryCategory.categories,
    coupons: couponSlice.coupons,
    couponsStatus: couponSlice.status,
    couponsError: couponSlice.error,
    chatSessions: chat.sessions,
    activeChatSessions: chat.activeSessions,
    archivedChatSessions: chat.archivedSessions,
    chatMessages: chat.chatMessages,
    about: aboutSlice.about,
    aboutStatus: aboutSlice.status,
    aboutError: aboutSlice.error,
    news: newsSlice.news,
    newsStatus: newsSlice.status,
    newsError: newsSlice.error,
    blog: blogSlice.blog,
    blogStatus: blogSlice.status,
    blogError: blogSlice.error,
    articles: articlesSlice.articles,
    articlesStatus: articlesSlice.status,
    articlesError: articlesSlice.error,
    activity: activitySlice.activity,
    activityStatus: activitySlice.status,
    activityError: activitySlice.error,
    references: referencesSlice.references,
    referencesStatus: referencesSlice.status,
    referencesError: referencesSlice.error,
    bikes: bikesSlice.bikes,
    bikesStatus: bikesSlice.status,
    bikesError: bikesSlice.error,

  };
};

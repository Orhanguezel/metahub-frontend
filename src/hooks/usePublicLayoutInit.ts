import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useActiveTenant } from "@/hooks/useActiveTenant";

import { fetchSectionMetas } from "@/modules/section/slices/sectionMetaSlice";
import { fetchSectionSettingsByTenant } from "@/modules/section/slices/sectionSettingSlice";
import { fetchSettings } from "@/modules/settings/slice/settingsSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";
import { fetchServices } from "@/modules/services/slice/servicesSlice";
import { fetchMassage } from "@/modules/massage/slice/massageSlice";
import { fetchPublishedGalleryItems } from "@/modules/gallery/slice/gallerySlice";
import { fetchGalleryCategories } from "@/modules/gallery/slice/galleryCategorySlice";
import { fetchAbout } from "@/modules/about/slice/aboutSlice";
import { fetchNews } from "@/modules/news/slice/newsSlice";
import { fetchBlog } from "@/modules/blog/slice/blogSlice";
import { fetchArticles } from "@/modules/articles/slice/articlesSlice";
import { fetchActivity } from "@/modules/activity/slice/activitySlice";
import { fetchReferences } from "@/modules/references/slice/referencesSlice";
import { fetchBikes } from "@/modules/bikes/slice/bikesSlice";
import { fetchEnsotekprod } from "@/modules/ensotekprod/slice/ensotekprodSlice";
import { fetchSparepart } from "@/modules/sparepart/slice/sparepartSlice";
import { fetchCoupons } from "@/modules/coupon/slice/couponSlice";
import {
  fetchAllChatSessions,
  fetchActiveChatSessions,
  fetchArchivedSessions,
} from "@/modules/chat/slice/chatSlice";
import { fetchLibrary } from "@/modules/library/slice/librarySlice";
import { fetchLibraryCategories } from "@/modules/library/slice/libraryCategorySlice";
import { fetchTeam } from "@/modules/team/slice/teamSlice";
import { fetchFAQs } from "@/modules/faq/slice/faqSlice";
import { fetchPortfolio } from "@/modules/portfolio/slice/portfolioSlice";
import { fetchSkill } from "@/modules/skill/slice/skillSlice";

export const usePublicLayoutInit = () => {
  const dispatch = useAppDispatch();
  const { tenant, loading: tenantLoading } = useActiveTenant();

  // Tüm slice'ları çek
  const sectionMeta = useAppSelector((s) => s.sectionMeta);
  const sectionSetting = useAppSelector((s) => s.sectionSetting);
  const settingsSlice = useAppSelector((s) => s.settings);
  const companySlice = useAppSelector((s) => s.company);
  const servicesSlice = useAppSelector((s) => s.services);
  const massageSlice = useAppSelector((s) => s.massage);
  const gallery = useAppSelector((s) => s.gallery);
  const galleryCategory = useAppSelector((s) => s.galleryCategory);
  const aboutSlice = useAppSelector((s) => s.about);
  const newsSlice = useAppSelector((s) => s.news);
  const blogSlice = useAppSelector((s) => s.blog);
  const articlesSlice = useAppSelector((s) => s.articles);
  const activitySlice = useAppSelector((s) => s.activity);
  const referencesSlice = useAppSelector((s) => s.references);
  const bikesSlice = useAppSelector((s) => s.bikes);
  const ensotekprodSlice = useAppSelector((s) => s.ensotekprod);
  const sparepartSlice = useAppSelector((s) => s.sparepart);
  const couponSlice = useAppSelector((s) => s.coupon);
  const chat = useAppSelector((s) => s.chat);
  const profile = useAppSelector((s) => s.account.profile);
  const librarySlice = useAppSelector((s) => s.library);
  const libraryCategorySlice = useAppSelector((s) => s.libraryCategory);
  const teamSlice = useAppSelector((s) => s.team);
  const faqSlice = useAppSelector((s) => s.faq);
  const skillSlice = useAppSelector((s) => s.skill);
  const portfolioSlice = useAppSelector((s) => s.portfolio);

const didInit = useRef<{ [key: string]: boolean }>({});

useEffect(() => {
  if (tenantLoading || !tenant) return;

  // _id yoksa, slug kullan
  const key = tenant._id || tenant.slug;

  if (didInit.current[key]) return;
  didInit.current[key] = true;

    // --- Her slice için sadece boş ve idle ise fetch at ---
    if ((!sectionMeta.metas || sectionMeta.metas.length === 0) && sectionMeta.status === "idle") {
      dispatch(fetchSectionMetas());
    }
    if ((!sectionSetting.settings || sectionSetting.settings.length === 0) && sectionSetting.status === "idle") {
      dispatch(fetchSectionSettingsByTenant());
    }
    if ((!settingsSlice.settings || settingsSlice.settings.length === 0) && settingsSlice.status === "idle") {
      dispatch(fetchSettings());
    }
    if ((!companySlice.company) && companySlice.status === "idle") {
      dispatch(fetchCompanyInfo());
    }
    if ((servicesSlice.services.length === 0) && servicesSlice.status === "idle") {
      dispatch(fetchServices());
    }
    if ((massageSlice.massage.length === 0) && massageSlice.status === "idle") {
      dispatch(fetchMassage());
    }
    if ((aboutSlice.about.length === 0) && aboutSlice.status === "idle") {
      dispatch(fetchAbout());
    }
    if ((newsSlice.news.length === 0) && newsSlice.status === "idle") {
      dispatch(fetchNews());
    }
    if ((blogSlice.blog.length === 0) && blogSlice.status === "idle") {
      dispatch(fetchBlog());
    }
    if ((articlesSlice.articles.length === 0) && articlesSlice.status === "idle") {
      dispatch(fetchArticles());
    }
    if ((activitySlice.activity.length === 0) && activitySlice.status === "idle") {
      dispatch(fetchActivity());
    }
    if ((referencesSlice.references.length === 0) && referencesSlice.status === "idle") {
      dispatch(fetchReferences());
    }
    if ((bikesSlice.bikes.length === 0) && bikesSlice.status === "idle") {
      dispatch(fetchBikes());
    }
    if ((ensotekprodSlice.ensotekprod.length === 0) && ensotekprodSlice.status === "idle") {
      dispatch(fetchEnsotekprod());
    }
    if ((sparepartSlice.sparepart.length === 0) && sparepartSlice.status === "idle") {
      dispatch(fetchSparepart());
    }
    if ((!couponSlice.coupons || couponSlice.coupons.length === 0) && couponSlice.status === "idle") {
      dispatch(fetchCoupons());
    }
    if ((gallery.publicImages.length === 0) && gallery.status === "idle") {
      dispatch(fetchPublishedGalleryItems());
    }
    if ((!galleryCategory.categories || galleryCategory.categories.length === 0) && galleryCategory.status === "idle") {
      dispatch(fetchGalleryCategories());
    }
    if ((!librarySlice.library || librarySlice.library.length === 0) && librarySlice.status === "idle") {
      dispatch(fetchLibrary());
    }
    if ((!libraryCategorySlice.categories || libraryCategorySlice.categories.length === 0) && libraryCategorySlice.status === "idle") {
      dispatch(fetchLibraryCategories());
    }
    if ((!teamSlice.team || teamSlice.team.length === 0) && teamSlice.status === "idle") {
      dispatch(fetchTeam());
    }
    if ((!faqSlice.faqs || faqSlice.faqs.length === 0) && faqSlice.status === "idle") {
      dispatch(fetchFAQs());
    }

    if ((!skillSlice.skill || skillSlice.skill.length === 0) && skillSlice.status === "idle") {
      dispatch(fetchSkill());
    }

    if ((!portfolioSlice.portfolio || portfolioSlice.portfolio.length === 0) && portfolioSlice.status === "idle") {
      dispatch(fetchPortfolio());
    }



    // --- Chat sadece login olan için ---
    if (profile) {
      if (chat.sessions.length === 0) dispatch(fetchAllChatSessions());
      if (chat.activeSessions.length === 0) dispatch(fetchActiveChatSessions());
      if (chat.archivedSessions.length === 0) dispatch(fetchArchivedSessions());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?._id, tenantLoading, tenant, dispatch, profile]); // Sadece tenant değişince veya ilk mount'ta çalışır

  // Return kısmı aynı kalabilir
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
    services: servicesSlice.services,
    servicesStatus: servicesSlice.status,
    servicesError: servicesSlice.error,
    massage: massageSlice.massage,
    massageStatus: massageSlice.status,
    massageError: massageSlice.error,
    gallery: {
      publicImages: gallery.publicImages,
      status: gallery.status,
    },
    galleryCategories: galleryCategory.categories,
    galleryCategoriesStatus: galleryCategory.status,
    galleryCategoriesError: galleryCategory.error,
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
    ensotekprod: ensotekprodSlice.ensotekprod,
    ensotekprodStatus: ensotekprodSlice.status,
    ensotekprodError: ensotekprodSlice.error,
    sparepart: sparepartSlice.sparepart,
    sparepartStatus: sparepartSlice.status,
    sparepartError: sparepartSlice.error,
    library: librarySlice.library,
    libraryStatus: librarySlice.status,
    libraryError: librarySlice.error,
    libraryCategories: libraryCategorySlice.categories,
    libraryCategoriesError: libraryCategorySlice.error,
    team: teamSlice.team,
    teamStatus: teamSlice.status,
    teamError: teamSlice.error,
    faqs: faqSlice.faqs,
    faqsLoading: faqSlice.loading,
    faqsStatus: faqSlice.status,
    faqsError: faqSlice.error,
    skill:skillSlice,
    skillLoading: skillSlice.loading,
    skillStatus: skillSlice.status,
    skillError: skillSlice.error,
    portfolio:portfolioSlice,
    portfolioLoading: portfolioSlice.loading,
    portfolioStatus: portfolioSlice.status,
    portfolioError: portfolioSlice.error,

  };
};

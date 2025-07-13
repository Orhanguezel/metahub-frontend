"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSettingsAdmin,
  clearSettingsMessages,
} from "@/modules/settings/slice/settingsSlice";
import {
  fetchCompanyAdmin,
  clearCompanyMessages,
} from "@/modules/company/slice/companySlice";
import { setApiKey } from "@/lib/api";
import {
  fetchModuleMetas,
  clearModuleMetaMessages,
} from "@/modules/adminmodules/slices/moduleMetaSlice";
import {
  fetchTenantModuleSettings,
  clearModuleSettingMessages,
} from "@/modules/adminmodules/slices/moduleSettingSlice";
import {
  fetchModuleTenantMatrix,
  clearModuleMaintenanceMessages,
} from "@/modules/adminmodules/slices/moduleMaintenanceSlice";
import {
  fetchTenants,
  clearTenantMessages,
} from "@/modules/tenants/slice/tenantSlice";
import {
  fetchAllAboutAdmin,
  clearAboutMessages,
} from "@/modules/about/slice/aboutSlice";
import {
  fetchAboutCategories,
  clearAboutCategoryMessages,
} from "@/modules/about/slice/aboutCategorySlice";
import {
  fetchAllActivityAdmin,
  clearActivityMessages,
} from "@/modules/activity/slice/activitySlice";
import {
  fetchActivityCategories,
  clearActivityCategoryMessages,
} from "@/modules/activity/slice/activityCategorySlice";
import {
  fetchAllArticlesAdmin,
  clearArticlesMessages,
} from "@/modules/articles/slice/articlesSlice";
import {
  fetchArticlesCategories,
  clearArticlesCategoryMessages,
} from "@/modules/articles/slice/articlesCategorySlice";
import {
  fetchAllBlogAdmin,
  clearBlogMessages,
} from "@/modules/blog/slice/blogSlice";
import {
  fetchBookingsAdmin,
  clearBookingMessages,
} from "@/modules/booking/slice/bookingSlice";
import {
  fetchSlotRulesAdmin,
  fetchSlotOverridesAdmin,
} from "@/modules/booking/slice/bookingSlotSlice";
import {
  fetchBlogCategories,
  clearBlogCategoryMessages,
} from "@/modules/blog/slice/blogCategorySlice";
import {
  fetchCoupons,
  clearCouponMessages,
} from "@/modules/coupon/slice/couponSlice";
import {
  fetchAllChatSessionsAdmin,
  fetchActiveChatSessionsAdmin,
  fetchArchivedSessionsAdmin,
  fetchMessagesByRoomAdmin,
  clearChatMessagesAdmin,
} from "@/modules/chat/slice/chatSlice";
import {
  fetchAllReferencesAdmin,
  clearReferencesMessages,
} from "@/modules/references/slice/referencesSlice";
import {
  fetchReferencesCategories,
  clearReferencesCategoryMessages,
} from "@/modules/references/slice/referencesCategorySlice";
import {
  fetchAllServicesAdmin,
  clearServicesMessages,
} from "@/modules/services/slice/servicesSlice";
import {
  fetchServicesCategories,
  clearServicesCategoryMessages,
} from "@/modules/services/slice/servicesCategorySlice";
import {
  fetchBikesAdmin,
  clearBikesMessages,
} from "@/modules/bikes/slice/bikesSlice";
import {
  fetchBikesCategories,
  clearBikesCategoryMessages,
} from "@/modules/bikes/slice/bikesCategorySlice";
import {
  fetchGallery,
  clearGalleryMessages,
} from "@/modules/gallery/slice/gallerySlice";
import {
  fetchGalleryCategories,
  clearGalleryCategoryMessages,
} from "@/modules/gallery/slice/galleryCategorySlice";
import {
  fetchAllNewsAdmin,
  clearNewsMessages,
} from "@/modules/news/slice/newsSlice";
import {
  fetchNewsCategories,
  clearNewsCategoryMessages,
} from "@/modules/news/slice/newsCategorySlice";
import { clearCommentMessages } from "@/modules/comment/slice/commentSlice";
import {
  fetchAllContactMessages,
  clearContactMessages,
} from "@/modules/contact/slice/contactSlice";
import {
  fetchSectionMetasAdmin,
  clearSectionMetaMessages,
} from "@/modules/section/slices/sectionMetaSlice";
import {
  fetchSectionSettingsAdmin,
  clearSectionSettingMessages,
} from "@/modules/section/slices/sectionSettingSlice";

// -- Cleanup aksiyonları merkezi:
const cleanupActions = [
  clearSettingsMessages,
  clearCompanyMessages,
  clearModuleMetaMessages,
  clearModuleSettingMessages,
  clearModuleMaintenanceMessages,
  clearTenantMessages,
  clearAboutMessages,
  clearAboutCategoryMessages,
  clearActivityMessages,
  clearActivityCategoryMessages,
  clearArticlesMessages,
  clearArticlesCategoryMessages,
  clearBlogMessages,
  clearBlogCategoryMessages,
  clearBookingMessages,
  clearBikesMessages,
  clearBikesCategoryMessages,
  clearChatMessagesAdmin,
  clearCouponMessages,
  clearNewsMessages,
  clearNewsCategoryMessages,
  clearGalleryMessages,
  clearGalleryCategoryMessages,
  clearReferencesMessages,
  clearReferencesCategoryMessages,
  clearServicesMessages,
  clearServicesCategoryMessages,
  clearCommentMessages,
  clearContactMessages,
  clearSectionMetaMessages,
  clearSectionSettingMessages,
];

// --- useLayoutInit ---
export const useLayoutInit = () => {
  const dispatch = useAppDispatch();
  const [tenant, setTenant] = useState<string | undefined>(undefined);

  // Tenant'ı ilk renderda asenkron oku
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tnt =
        localStorage.getItem("tenant") ||
        process.env.NEXT_PUBLIC_APP_ENV ||
        process.env.NEXT_PUBLIC_TENANT_NAME ||
        process.env.TENANT_NAME;
      setTenant(tnt);
    } else {
      const tnt =
        process.env.NEXT_PUBLIC_APP_ENV ||
        process.env.NEXT_PUBLIC_TENANT_NAME ||
        process.env.TENANT_NAME;
      setTenant(tnt);
    }
  }, []);

  // Slice stateleri
  const settingsAdmin = useAppSelector((state) => state.settings);
  const companyAdmin = useAppSelector((state) => state.company);
  const moduleMeta = useAppSelector((state) => state.moduleMeta);
  const moduleSetting = useAppSelector((state) => state.moduleSetting);
  const moduleMaintenance = useAppSelector((state) => state.moduleMaintenance);
  const tenants = useAppSelector((state) => state.tenants);
  const accountProfile = useAppSelector((state) => state.account);
  const dashboard = useAppSelector((state) => state.dashboard);
  const aboutList = useAppSelector((state) => state.about);
  const aboutCategories = useAppSelector((state) => state.aboutCategory);
  const activityList = useAppSelector((state) => state.activity);
  const activityCategories = useAppSelector((state) => state.activityCategory);
  const articlesList = useAppSelector((state) => state.articles);
  const articlesCategories = useAppSelector((state) => state.articlesCategory);
  const blogList = useAppSelector((state) => state.blog);
  const blogCategories = useAppSelector((state) => state.blogCategory);
  const bookingsList = useAppSelector((state) => state.booking);
  const bookingSlot = useAppSelector((state) => state.bookingSlot);
  const bikesList = useAppSelector((state) => state.bikes);
  const bikesCategories = useAppSelector((state) => state.bikesCategory);
  const chat = useAppSelector((state) => state.chat);
  const comments = useAppSelector((state) => state.comments);
  const coupons = useAppSelector((state) => state.coupon);
  const newsList = useAppSelector((state) => state.news);
  const newsCategories = useAppSelector((state) => state.newsCategory);
  const galleryList = useAppSelector((state) => state.gallery);
  const galleryCategories = useAppSelector((state) => state.galleryCategory);
  const referencesList = useAppSelector((state) => state.references);
  const referencesCategories = useAppSelector(
    (state) => state.referencesCategory
  );
  const servicesList = useAppSelector((state) => state.services);
  const servicesCategories = useAppSelector((state) => state.servicesCategory);
  const contactMessagesAdmin = useAppSelector((state) => state.contact);
  const sectionMetasAdmin = useAppSelector((s) => s.sectionMeta.metasAdmin);
  const sectionSettingsAdmin = useAppSelector(
    (s) => s.sectionSetting.settingsAdmin
  );

  // Optimize edilmiş useEffect (sadece primitive ve tenant’a bağlı)
  useEffect(() => {
    if (!tenant) return;
    // Fetchler
    if (!settingsAdmin.settingsAdmin.length && !settingsAdmin.loading)
      dispatch(fetchSettingsAdmin());
    if (!companyAdmin.company && !companyAdmin.loading)
      dispatch(fetchCompanyAdmin());
    if (!moduleMeta.modules.length && !moduleMeta.loading)
      dispatch(fetchModuleMetas());
    if (!moduleSetting.tenantModules.length && !moduleSetting.loading)
      dispatch(fetchTenantModuleSettings());
    if (
      (!moduleMaintenance.moduleTenantMatrix ||
        Object.keys(moduleMaintenance.moduleTenantMatrix).length === 0) &&
      !moduleMaintenance.maintenanceLoading
    ) {
      dispatch(fetchModuleTenantMatrix());
    }

    if (!tenants.tenants?.length && !tenants.loading) dispatch(fetchTenants());
    if (!aboutList.aboutAdmin.length && !aboutList.loading)
      dispatch(fetchAllAboutAdmin());
    if (!aboutCategories.categories.length && !aboutCategories.loading)
      dispatch(fetchAboutCategories());
    if (!activityList.activityAdmin.length && !activityList.loading)
      dispatch(fetchAllActivityAdmin());
    if (!activityCategories.categories.length && !activityCategories.loading)
      dispatch(fetchActivityCategories());
    if (!articlesList.articlesAdmin.length && !articlesList.loading)
      dispatch(fetchAllArticlesAdmin());
    if (!articlesCategories.categories.length && !articlesCategories.loading)
      dispatch(fetchArticlesCategories());
    if (!blogList.blogAdmin.length && !blogList.loading)
      dispatch(fetchAllBlogAdmin());
    if (!blogCategories.categories.length && !blogCategories.loading)
      dispatch(fetchBlogCategories());
    if (!bookingsList.bookingsAdmin.length && !bookingsList.loading)
      dispatch(fetchBookingsAdmin());
    if (!bookingSlot.rulesAdmin.length && !bookingSlot.loading)
      dispatch(fetchSlotRulesAdmin());
    if (!bookingSlot.overridesAdmin.length && !bookingSlot.loading)
      dispatch(fetchSlotOverridesAdmin());
    if (!bikesList.bikesAdmin.length && !bikesList.loading)
      dispatch(fetchBikesAdmin());
    if (!bikesCategories.categories.length && !bikesCategories.loading)
      dispatch(fetchBikesCategories());

    // CHAT admin fetchleri (sadece tenant + primitive state ile tetiklenir)
    if (chat.selectedRoom && !chat.loading && !chat.chatMessagesAdmin.length) {
      dispatch(fetchMessagesByRoomAdmin(chat.selectedRoom));
    }
    if (!chat.sessionsAdmin.length && !chat.loading)
      dispatch(fetchAllChatSessionsAdmin());
    if (!chat.activeSessionsAdmin.length && !chat.loading)
      dispatch(fetchActiveChatSessionsAdmin());
    if (!chat.archivedSessionsAdmin.length && !chat.loading)
      dispatch(fetchArchivedSessionsAdmin());

    if (!coupons.couponsAdmin.length && !coupons.loading)
      dispatch(fetchCoupons());
    if (!newsList.newsAdmin.length && !newsList.loading)
      dispatch(fetchAllNewsAdmin());
    if (!newsCategories.categories.length && !newsCategories.loading)
      dispatch(fetchNewsCategories());
    if (!galleryList.adminImages.length && !galleryList.loading)
      dispatch(fetchGallery());
    if (!galleryCategories.categories.length && !galleryCategories.loading)
      dispatch(fetchGalleryCategories());
    if (!referencesList.referencesAdmin.length && !referencesList.loading)
      dispatch(fetchAllReferencesAdmin());
    if (!referencesCategories.categories.length && !referencesCategories.loading)
      dispatch(fetchReferencesCategories());
    if (!servicesList.servicesAdmin.length && !servicesList.loading)
      dispatch(fetchAllServicesAdmin());
    if (!servicesCategories.categories.length && !servicesCategories.loading)
      dispatch(fetchServicesCategories());

    if (!comments.commentsAdmin.length && !comments.loading)
      dispatch(clearCommentMessages());
    if (
      !contactMessagesAdmin.messagesAdmin.length &&
      !contactMessagesAdmin.loading
    )
      dispatch(fetchAllContactMessages());
    if (!Array.isArray(sectionMetasAdmin) || sectionMetasAdmin.length === 0) {
      dispatch(fetchSectionMetasAdmin());
    }
    if (
      !Array.isArray(sectionSettingsAdmin) ||
      sectionSettingsAdmin.length === 0
    ) {
      dispatch(fetchSectionSettingsAdmin());
    }
    // Burada sadece tenant ve ilgili loading primitive’lerini kullanıyoruz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant, dispatch]);

  // Unmount'ta temizlik (opsiyonel)
  useEffect(() => {
    return () => {
      cleanupActions.forEach((action) => dispatch(action()));
    };
  }, [dispatch]);

  // API KEY gibi bir ayar varsa, init et (opsiyonel)
  useEffect(() => {
    if (settingsAdmin.settings?.length) {
      const apiKeySetting = settingsAdmin.settings.find(
        (s: any) => s.key === "api_key"
      );
      if (apiKeySetting?.value && typeof apiKeySetting.value === "string") {
        setApiKey(apiKeySetting.value);
      }
    }
  }, [settingsAdmin.settings]);

  // Return ile tüm state’leri döndür
  return {
    settingsAdmin,
    companyAdmin,
    moduleMeta,
    moduleSetting,
    moduleMaintenance,
    tenants,
    accountProfile,
    dashboard,
    aboutList,
    aboutCategories,
    activityList,
    activityCategories,
    articlesList,
    articlesCategories,
    blogList,
    blogCategories,
    bookingsList,
    bookingSlot,
    bikesList,
    bikesCategories,
    chat,
    coupons,
    newsList,
    newsCategories,
    galleryList,
    galleryCategories,
    referencesList,
    referencesCategories,
    servicesList,
    servicesCategories,
    comments,
    contactMessagesAdmin,
    sectionMetasAdmin,
    sectionSettingsAdmin,
    // gerekirse analyticsTrends vs ekleyebilirsin
  };
};

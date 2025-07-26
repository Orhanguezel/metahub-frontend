"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useActiveTenant } from "@/hooks/useActiveTenant";
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
  fetchEnsotekprodAdmin,
  clearEnsotekprodMessages,
} from "@/modules/ensotekprod/slice/ensotekprodSlice";
import {
  fetchEnsotekCategories,
  clearEnsotekCategoryMessages,
} from "@/modules/ensotekprod/slice/ensotekCategorySlice";
import {
  fetchSparepartAdmin,
  clearSparepartMessages,
} from "@/modules/sparepart/slice/sparepartSlice";
import {
  fetchSparepartCategories,
  clearSparepartCategoryMessages,
} from "@/modules/sparepart/slice/sparepartCategorySlice";

import {
  fetchGallery,
  clearGalleryMessages,
} from "@/modules/gallery/slice/gallerySlice";
import {
  fetchAdminGalleryCategories,
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
// Dosyanın en üstüne ekle:
import {
  fetchAllOrdersAdmin,
  clearOrderMessages,
} from "@/modules/order/slice/ordersSlice";

import {
  fetchAllChatSessionsAdmin,
  fetchActiveChatSessionsAdmin,
  fetchArchivedSessionsAdmin,
  fetchMessagesByRoomAdmin,
  clearChatMessages,
} from "@/modules/chat/slice/chatSlice";
import {
  fetchAllLibraryAdmin,
  clearLibraryMessages,
} from "@/modules/library/slice/librarySlice";
import {
  fetchLibraryCategories,
  clearLibraryCategoryMessages,
} from "@/modules/library/slice/libraryCategorySlice";

import {
  fetchAllTeamAdmin,
  clearTeamMessages,
} from "@/modules/team/slice/teamSlice";
import {
  fetchTeamCategories,
  clearTeamCategoryMessages,
} from "@/modules/team/slice/teamCategorySlice";



// -- Cleanup aksiyonları merkezi:
const cleanupActions = [
  clearSettingsMessages,
  clearCompanyMessages,
  clearModuleMetaMessages,
  clearModuleSettingMessages,
  clearModuleMaintenanceMessages,
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
  clearEnsotekprodMessages,
  clearEnsotekCategoryMessages,
  clearCouponMessages,
  clearNewsMessages,
  clearNewsCategoryMessages,
  clearGalleryMessages,
  clearGalleryCategoryMessages,
  clearReferencesMessages,
  clearReferencesCategoryMessages,
  clearServicesMessages,
  clearServicesCategoryMessages,
  clearContactMessages,
  clearSectionMetaMessages,
  clearSectionSettingMessages,
  clearOrderMessages,
  clearChatMessages,
  clearLibraryMessages,
  clearLibraryCategoryMessages,
  clearSparepartMessages,
  clearSparepartCategoryMessages,
  clearTeamMessages,
  clearTeamCategoryMessages
];

// --- useLayoutInit ---
export const useLayoutInit = () => {
  const dispatch = useAppDispatch();
  const { tenant, loading: tenantLoading } = useActiveTenant(); // ✅
  const tenantLoaded = !!tenant && !tenantLoading;

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
  const ensotekprodList = useAppSelector((state) => state.ensotekprod);
  const ensotekCategories = useAppSelector((state) => state.ensotekCategory);
  const sparepartList = useAppSelector((state) => state.sparepart);
  const sparepartCategories = useAppSelector((state) => state.sparepartCategory);
  const chat = useAppSelector((state) => state.chat);
  const coupons = useAppSelector((state) => state.coupon);
  const newsList = useAppSelector((state) => state.news);
  const newsCategories = useAppSelector((state) => state.newsCategory);
  const galleryList = useAppSelector((state) => state.gallery);
  const galleryCategory = useAppSelector((state) => state.galleryCategory);
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
  const ordersAdmin = useAppSelector((state) => state.orders);
  const libraryList = useAppSelector((state) => state.library);
const libraryCategory = useAppSelector((state) => state.libraryCategory);
const teamList = useAppSelector((state) => state.team);
const teamCategory = useAppSelector((state) => state.teamCategory);

  // Optimize edilmiş useEffect (sadece primitive ve tenant’a bağlı)
  useEffect(() => {
    if (!tenantLoaded || !tenant?._id) return;
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
    if (!ensotekprodList.ensotekprod.length && !ensotekprodList.loading)
      dispatch(fetchEnsotekprodAdmin());
    if (!ensotekCategories.categories.length && !ensotekCategories.loading)
      dispatch(fetchEnsotekCategories());
    if (!sparepartList.sparepart.length && !sparepartList.loading)
      dispatch(fetchSparepartAdmin());
    if (!sparepartCategories.categories.length && !sparepartCategories.loading)
      dispatch(fetchSparepartCategories());

    if (
      chat.roomId &&
      !chat.loading &&
      (!chat.chatMessagesAdmin.length || chat.chatMessagesAdmin[0]?.roomId !== chat.roomId)
    ) {
      dispatch(fetchMessagesByRoomAdmin(chat.roomId));
    }
    // Tüm chat oturumları
    if (!chat.sessionsAdmin.length && !chat.loading) {
      dispatch(fetchAllChatSessionsAdmin());
    }
    // Aktif chat oturumları
    if (!chat.activeSessionsAdmin.length && !chat.loading) {
      dispatch(fetchActiveChatSessionsAdmin());
    }
    // Arşivlenmiş chat oturumları
    if (!chat.archivedSessionsAdmin.length && !chat.loading) {
      dispatch(fetchArchivedSessionsAdmin());
    }
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
    if (!galleryCategory.adminCategories.length && galleryCategory.status === "idle") {
      dispatch(fetchAdminGalleryCategories());
    }
    if (!referencesList.referencesAdmin.length && !referencesList.loading)
      dispatch(fetchAllReferencesAdmin());
    if (
      !referencesCategories.categories.length &&
      !referencesCategories.loading
    )
      dispatch(fetchReferencesCategories());
    if (!servicesList.servicesAdmin.length && !servicesList.loading)
      dispatch(fetchAllServicesAdmin());
    if (!servicesCategories.categories.length && !servicesCategories.loading)
      dispatch(fetchServicesCategories());

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
    if (!ordersAdmin.ordersAdmin.length && !ordersAdmin.loading) {
      dispatch(fetchAllOrdersAdmin());
    }
    if (!libraryList.libraryAdmin.length && !libraryList.loading)
  dispatch(fetchAllLibraryAdmin());

if (!libraryCategory.categories.length && !libraryCategory.loading)
  dispatch(fetchLibraryCategories());

    if (!teamList.teamAdmin.length && !teamList.loading)
      dispatch(fetchAllTeamAdmin());
    if (!teamCategory.categories.length && !teamCategory.loading)
      dispatch(fetchTeamCategories());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantLoaded, tenant?._id, dispatch]);

  useEffect(() => {
    return () => {
      cleanupActions.forEach((action) => dispatch(action()));
    };
  }, [dispatch]);

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
    ensotekprodList,
    ensotekCategories,
    sparepartList,
    sparepartCategories,
    chat,
    coupons,
    newsList,
    newsCategories,
    galleryList,
    galleryCategory,
    referencesList,
    referencesCategories,
    servicesList,
    servicesCategories,
    contactMessagesAdmin,
    sectionMetasAdmin,
    sectionSettingsAdmin,
    ordersAdmin,
    libraryList,
  libraryCategory,
  teamList,
  teamCategory,
    // gerekirse analyticsTrends vs ekleyebilirsin
  };
};

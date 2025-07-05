"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchSettings } from "@/modules/settings/slice/settingsSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";
import { setApiKey } from "@/lib/api";
import { fetchModuleMetas } from "@/modules/adminmodules/slices/moduleMetaSlice";
import { fetchModuleTenantMatrix } from "@/modules/adminmodules/slices/moduleMaintenanceSlice";
import { fetchTenants } from "@/modules/tenants/slice/tenantSlice";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";

import {
  fetchDashboardStats,
  clearDashboardMessages,
} from "@/modules/dashboard/slice/dashboardSlice";
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
  fetchBlogCategories,
  clearBlogCategoryMessages,
} from "@/modules/blog/slice/blogCategorySlice";
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
  clearBikeMessages,
} from "@/modules/bikes/slice/bikeSlice";
import {
  fetchBikeCategories,
  clearBikeCategoryMessages,
} from "@/modules/bikes/slice/bikeCategorySlice";
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
import { fetchTenantModuleSettings } from "@/modules/adminmodules/slices/moduleSettingSlice"; // <-- parametreli thunk!

// Parametresiz fetch'ler için tek dizi
const fetchActionsNoArg = [
  fetchSettings,
  fetchCompanyInfo,
  fetchCurrentUser,
  fetchModuleMetas,
  fetchModuleTenantMatrix,
  fetchTenants,
  fetchDashboardStats,
  fetchAllAboutAdmin,
  fetchAboutCategories,
  fetchAllActivityAdmin,
  fetchActivityCategories,
  fetchAllArticlesAdmin,
  fetchArticlesCategories,
  fetchAllBlogAdmin,
  fetchBlogCategories,
  fetchBikesAdmin,
  fetchBikeCategories,
  fetchAllNewsAdmin,
  fetchGallery,
  fetchGalleryCategories,
  fetchNewsCategories,
  fetchAllReferencesAdmin,
  fetchReferencesCategories,
  fetchAllServicesAdmin,
  fetchServicesCategories,
];

// Cleanup işlemlerini de ister diziyle ister klasik şekilde yönetebilirsin:
const cleanupActions = [
  clearDashboardMessages,
  clearAboutMessages,
  clearAboutCategoryMessages,
  clearActivityMessages,
  clearActivityCategoryMessages,
  clearArticlesMessages,
  clearArticlesCategoryMessages,
  clearBlogMessages,
  clearBlogCategoryMessages,
  clearBikeMessages,
  clearBikeCategoryMessages,
  clearNewsMessages,
  clearNewsCategoryMessages,
  clearGalleryMessages,
  clearGalleryCategoryMessages,
  clearReferencesMessages,
  clearReferencesCategoryMessages,
  clearServicesMessages,
  clearServicesCategoryMessages,
];

interface UseLayoutInitOptions {
  isAdmin?: boolean;
  adminTab?: "meta" | "tenant" | "maintenance";
  selectedTenant?: string;
  requireUser?: boolean;
}

export const useLayoutInit = ({
  isAdmin = false,
  adminTab,
  selectedTenant,
  requireUser = false,
}: UseLayoutInitOptions = {}) => {
  const dispatch = useAppDispatch();
  const didInit = useRef(false);

  // Her slice için ayrı ayrı selector:
  const setting = useAppSelector((state) => state.setting);
  const company = useAppSelector((state) => state.company);
  const account = useAppSelector((state) => state.account);
  const moduleMeta = useAppSelector((state) => state.moduleMeta);
  const moduleSetting = useAppSelector((state) => state.moduleSetting);
  const moduleMaintenance = useAppSelector((state) => state.moduleMaintenance);
  const tenant = useAppSelector((state) => state.tenant);
  const dashboard = useAppSelector((state) => state.dashboard);
  const about = useAppSelector((state) => state.about);
  const aboutCategory = useAppSelector((state) => state.aboutCategory);
  const activity = useAppSelector((state) => state.activity);
  const activityCategory = useAppSelector((state) => state.activityCategory);
  const articles = useAppSelector((state) => state.articles);
  const articlesCategory = useAppSelector((state) => state.articlesCategory);
  const blog = useAppSelector((state) => state.blog);
  const blogCategory = useAppSelector((state) => state.blogCategory);
  const bike = useAppSelector((state) => state.bike);
  const bikeCategory = useAppSelector((state) => state.bikeCategory);
  const references = useAppSelector((state) => state.references);
  const referencesCategory = useAppSelector(
    (state) => state.referencesCategory
  );
  const services = useAppSelector((state) => state.services);
  const servicesCategory = useAppSelector((state) => state.servicesCategory);
  const gallery = useAppSelector((state) => state.gallery);
  const galleryCategory = useAppSelector((state) => state.galleryCategory);
  const news = useAppSelector((state) => state.news);
  const newsCategory = useAppSelector((state) => state.newsCategory);
  // ... diğerleri

  // API KEY ayarı
  useEffect(() => {
    if (setting && Array.isArray(setting.settings)) {
      const apiKeySetting = setting.settings.find(
        (s: any) => s.key === "api_key"
      );
      if (
        apiKeySetting &&
        typeof apiKeySetting.value === "string" &&
        apiKeySetting.value
      ) {
        setApiKey(apiKeySetting.value);
      }
    }
  }, [setting.settings]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    fetchActionsNoArg.forEach((action) => dispatch(action()));
    if (isAdmin && selectedTenant) {
      dispatch(fetchTenantModuleSettings(selectedTenant));
    }
    return () => {
      cleanupActions.forEach((action) => dispatch(action()));
    };
  }, [dispatch, isAdmin, selectedTenant]);

  // State'i döndür
  return {
    setting,
    company,
    account,
    moduleMeta,
    moduleSetting,
    moduleMaintenance,
    tenant,
    dashboard,
    about,
    aboutCategory,
    activity,
    activityCategory,
    articles,
    articlesCategory,
    bike,
    bikeCategory,
    gallery,
    galleryCategory,
    news,
    newsCategory,
    blog,
    blogCategory,
    references,
    referencesCategory,
    services,
    servicesCategory,
    // ... yeni slice'lar geldikçe ekle ...
  };
};

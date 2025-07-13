// YENİ: Merkezi selector ile slice'ları çek (sadece veri, fetch yok!)
// (useLayoutInit içindeki fetch kodu kaldırıldı, sadece selector)
import { useAppSelector } from "@/store/hooks";

export function useAdminModuleState() {
  return {
    settings: useAppSelector((state) => state.settings),
    companyInfo: useAppSelector((state) => state.company),
    moduleMeta: useAppSelector((state) => state.moduleMeta),
    moduleSetting: useAppSelector((state) => state.moduleSetting),
    moduleMaintenance: useAppSelector((state) => state.moduleMaintenance),
    tenants: useAppSelector((state) => state.tenants),
    accountProfile: useAppSelector((state) => state.account),
    dashboard: useAppSelector((state) => state.dashboard),
    aboutList: useAppSelector((state) => state.about),
    aboutCategories: useAppSelector((state) => state.aboutCategory),
    activityList: useAppSelector((state) => state.activity),
    activityCategories: useAppSelector((state) => state.activityCategory),
    articlesList: useAppSelector((state) => state.articles),
    articlesCategories: useAppSelector((state) => state.articlesCategory),
    blogList: useAppSelector((state) => state.blog),
    blogCategories: useAppSelector((state) => state.blogCategory),
    bookingsList: useAppSelector((state) => state.booking),
    bikesList: useAppSelector((state) => state.bikes),
    bikesCategories: useAppSelector((state) => state.bikesCategory),
    chat: useAppSelector((state) => state.chat),
    comments: useAppSelector((state) => state.comments),
    coupons: useAppSelector((state) => state.coupon),
    newsList: useAppSelector((state) => state.news),
    newsCategories: useAppSelector((state) => state.newsCategory),
    galleryList: useAppSelector((state) => state.gallery),
    galleryCategories: useAppSelector((state) => state.galleryCategory),
    referencesList: useAppSelector((state) => state.references),
    referencesCategories: useAppSelector((state) => state.referencesCategory),
    servicesList: useAppSelector((state) => state.services),
    servicesCategories: useAppSelector((state) => state.servicesCategory),
    analyticsTrends: useAppSelector((state) => state.analytics),
  };
}

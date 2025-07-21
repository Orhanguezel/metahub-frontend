// src/store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";

// --- Tüm reducerları import et (senin mevcut import yapınla aynı) ---
import authReducer from "@/modules/users/slice/authSlice";
import userCrudReducer from "@/modules/users/slice/userCrudSlice";
import userStatusReducer from "@/modules/users/slice/userStatusSlice";
import accountReducer from "@/modules/users/slice/accountSlice";
import addressReducer from "@/modules/users/slice/addressSlice";
import advancedReducer from "@/modules/users/slice/advancedSlice";
import moduleSettingReducer from "@/modules/adminmodules/slices/moduleSettingSlice";
import moduleMetaReducer from "@/modules/adminmodules/slices/moduleMetaSlice";
import moduleMaintenanceReducer from "@/modules/adminmodules/slices/moduleMaintenanceSlice";
import blogReducer from "@/modules/blog/slice/blogSlice";
import blogCategoryReducer from "@/modules/blog/slice/blogCategorySlice";
import newsReducer from "@/modules/news/slice/newsSlice";
import newsCategoryReducer from "@/modules/news/slice/newsCategorySlice";
import articlesReducer from "@/modules/articles/slice/articlesSlice";
import articlesCategoryReducer from "@/modules/articles/slice/articlesCategorySlice";
import commentsReducer from "@/modules/comment/slice/commentSlice";
import companyReducer from "@/modules/company/slice/companySlice";
import settingsReducer from "@/modules/settings/slice/settingsSlice";
import galleryReducer from "@/modules/gallery/slice/gallerySlice";
import galleryCategoryReducer from "@/modules/gallery/slice/galleryCategorySlice";
import faqReducer from "@/modules/faq/slice/faqSlice";
import dashboardReducer from "@/modules/dashboard/slice/dashboardSlice";
import dailyOverviewReducer from "@/modules/dashboard/slice/dailyOverviewSlice";
import chartDataReducer from "@/modules/dashboard/slice/chartDataSlice";
import reportsReducer from "@/modules/dashboard/slice/reportsSlice";
import analyticsReducer from "@/modules/dashboard/slice/analyticsSlice";
import servicesReducer from "@/modules/services/slice/servicesSlice";
import servicesCategoryReducer from "@/modules/services/slice/servicesCategorySlice";
import activityReducer from "@/modules/activity/slice/activitySlice";
import activityCategoryReducer from "@/modules/activity/slice/activityCategorySlice";
import chatReducer from "@/modules/chat/slice/chatSlice";
import aboutReducer from "@/modules/about/slice/aboutSlice";
import aboutCategoryReducer from "@/modules/about/slice/aboutCategorySlice";
import bookingReducer from "@/modules/booking/slice/bookingSlice";
import bookingSlotReducer from "@/modules/booking/slice/bookingSlotSlice";
import referencesReducer from "@/modules/references/slice/referencesSlice";
import referencesCategoryReducer from "@/modules/references/slice/referencesCategorySlice";
import cartReducer from "@/modules/cart/slice/cartSlice";
import ordersReducer from "@/modules/order/slice/ordersSlice";
import couponReducer from "@/modules/coupon/slice/couponSlice";
import bikesReducer from "@/modules/bikes/slice/bikesSlice";
import bikesCategoryReducer from "@/modules/bikes/slice/bikesCategorySlice";
import paymentReducer from "@/modules/payment/slice/paymentSlice";
import tenantsReducer from "@/modules/tenants/slice/tenantSlice";
import contactReducer from "@/modules/contact/slice/contactSlice";
import sectionMetaReducer from "@/modules/section/slices/sectionMetaSlice";
import sectionSettingReducer from "@/modules/section/slices/sectionSettingSlice";
import librarySlice from "@/modules/library/slice/librarySlice";
import libraryCategorySlice from "@/modules/library/slice/libraryCategorySlice";
import ensotekprodReducer from "@/modules/ensotekprod/slice/ensotekprodSlice";
import ensotekCategoryReducer from "@/modules/ensotekprod/slice/ensotekCategorySlice";

// --- Combine reducers ---
// Sadece slice bazında persistReducer uygula!
const rootReducer = combineReducers({
  userCrud: userCrudReducer,
  userStatus: userStatusReducer,
  address: addressReducer,
  moduleSetting: moduleSettingReducer,
  moduleMeta: moduleMetaReducer,
  moduleMaintenance: moduleMaintenanceReducer,
  advanced: advancedReducer,
  cart: cartReducer,
  orders: ordersReducer,
  blog: blogReducer,
  blogCategory: blogCategoryReducer,
  news: newsReducer,
  newsCategory: newsCategoryReducer,
  articles: articlesReducer,
  articlesCategory: articlesCategoryReducer,
  references: referencesReducer,
  referencesCategory: referencesCategoryReducer,
  comments: commentsReducer,
  company: companyReducer,
  booking: bookingReducer,
  bookingSlot: bookingSlotReducer,
  settings: settingsReducer,
  gallery: galleryReducer,
  galleryCategory: galleryCategoryReducer,
  faq: faqReducer,
  services: servicesReducer,
  servicesCategory: servicesCategoryReducer,
  activity: activityReducer,
  activityCategory: activityCategoryReducer,
  dashboard: dashboardReducer,
  dailyOverview: dailyOverviewReducer,
  chartData: chartDataReducer,
  reports: reportsReducer,
  analytics: analyticsReducer,
  about: aboutReducer,
  aboutCategory: aboutCategoryReducer,
  chat: chatReducer,
  coupon: couponReducer,
  bikes: bikesReducer,
  bikesCategory: bikesCategoryReducer,
  payment: paymentReducer,
  tenants: tenantsReducer,
  auth: authReducer,
  account: accountReducer,
  contact: contactReducer,
  sectionMeta: sectionMetaReducer,
  sectionSetting: sectionSettingReducer,
  library: librarySlice,
  libraryCategory: libraryCategorySlice,
  ensotekCategory: ensotekCategoryReducer,
  ensotekprod: ensotekprodReducer
});

// --- Store ---
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// --- Types ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

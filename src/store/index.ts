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
import settingReducer from "@/modules/settings/slice/settingsSlice";
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
import bikeReducer from "@/modules/bikes/slice/bikeSlice";
import bikeCategoryReducer from "@/modules/bikes/slice/bikeCategorySlice";
import paymentReducer from "@/modules/payment/slice/paymentSlice";
import tenantReducer from "@/modules/tenants/slice/tenantSlice";

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
  setting: settingReducer,
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
  bike: bikeReducer,
  bikeCategory: bikeCategoryReducer,
  payment: paymentReducer,
  tenant: tenantReducer,
  auth: authReducer,
  account: accountReducer,
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

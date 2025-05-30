// src/store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { accountPersistConfig, authPersistConfig } from "./persistConfig";

// --- Tüm reducerları import et (senin mevcut import yapınla aynı) ---
import authReducer from "@/modules/users/slice/authSlice";
import userCrudReducer from "@/modules/users/slice/userCrudSlice";
import userStatusReducer from "@/modules/users/slice/userStatusSlice";
import accountReducer from "@/modules/users/slice/accountSlice";
import addressReducer from "@/modules/users/slice/addressSlice";
import advancedReducer from "@/modules/users/slice/advancedSlice";
import adminModuleReducer from "@/modules/adminmodules/slice/adminModuleSlice";
import productsReducer from "@/modules/product/slice/productsSlice";
import radonarprodReducer from "@/modules/product/slice/radonarprodSlice";
import radonarCategoryReducer from "@/modules/product/slice/radonarCategorySlice";
import blogReducer from "@/modules/blog/slice/blogSlice";
import blogCategoryReducer from "@/modules/blog/slice/blogCategorySlice";
import newsReducer from "@/modules/news/slice/newsSlice";
import newsCategoryReducer from "@/modules/news/slice/newsCategorySlice";
import articlesReducer from "@/modules/articles/slice/articlesSlice";
import articlesCategoryReducer from "@/modules/articles/slice/articlesCategorySlice";
import commentsReducer from "@/modules/comment/slice/commentSlice";
import companyReducer from "@/modules/company/slice/companySlice";
import settingReducer from "@/modules/settings/slice/settingSlice";
import galleryReducer from "@/modules/gallery/slice/gallerySlice";
import faqReducer from "@/modules/faq/slice/faqSlice";
import dashboardReducer from "@/modules/dashboard/slice/dashboardSlice";
import dailyOverviewReducer from "@/modules/dashboard/slice/dailyOverviewSlice";
import chartDataReducer from "@/modules/dashboard/slice/chartDataSlice";
import reportsReducer from "@/modules/dashboard/slice/reportsSlice";
import servicesReducer from "@/modules/services/slice/servicesSlice";
import serviceCategoryReducer from "@/modules/services/slice/serviceCategorySlice";
import activityReducer from "@/modules/activity/slice/activitySlice";
import activityCategoryReducer from "@/modules/activity/slice/activityCategorySlice";
import chatReducer from "@/modules/chat/slice/chatSlice";
import aboutReducer from "@/modules/about/slice/aboutSlice";
import aboutCategoryReducer from "@/modules/about/slice/aboutCategorySlice";
import bookingReducer from "@/modules/booking/slice/bookingSlice";
import bookingSlotReducer from "@/modules/booking/slice/bookingSlotSlice";
import referencesReducer from "@/modules/references/slice/referencesSlice";
import referenceCategoryReducer from "@/modules/references/slice/referencesCategorySlice";
import emailReducer from "@/modules/email/slice/emailSlice";
import cartReducer from "./cartSlice";
import libraryReducer from "./librarySlice";
import ordersReducer from "./ordersSlice";
import contactReducer from "./contactMessageSlice";
import notificationReducer from "./notificationSlice";
import feedbackReducer from "./feedbackSlice";
import stockMovementReducer from "./stockMovementSlice";

// --- Combine reducers ---
// Sadece slice bazında persistReducer uygula!
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  account: persistReducer(accountPersistConfig, accountReducer),

  // Diğer slice'lar normal şekilde:
  userCrud: userCrudReducer,
  userStatus: userStatusReducer,
  address: addressReducer,
  admin: adminModuleReducer,
  advanced: advancedReducer,
  products: productsReducer,
  radonarprod: radonarprodReducer,
  radonarCategory: radonarCategoryReducer,
  cart: cartReducer,
  orders: ordersReducer,
  stockMovement: stockMovementReducer,
  blog: blogReducer,
  blogCategory: blogCategoryReducer,
  news: newsReducer,
  newsCategory: newsCategoryReducer,
  articles: articlesReducer,
  articlesCategory: articlesCategoryReducer,
  references: referencesReducer,
  referenceCategory: referenceCategoryReducer,
  library: libraryReducer,
  comments: commentsReducer,
  company: companyReducer,
  booking: bookingReducer,
  bookingSlot: bookingSlotReducer,
  notifications: notificationReducer,
  feedback: feedbackReducer,
  setting: settingReducer,
  contactMessage: contactReducer,
  email: emailReducer,
  gallery: galleryReducer,
  faq: faqReducer,
  services: servicesReducer,
  serviceCategory: serviceCategoryReducer,
  activity: activityReducer,
  activityCategory: activityCategoryReducer,
  dashboard: dashboardReducer,
  dailyOverview: dailyOverviewReducer,
  chartData: chartDataReducer,
  reports: reportsReducer,
  about: aboutReducer,
  aboutCategory: aboutCategoryReducer,
  chat: chatReducer,
});

// --- Store ---
export const store = configureStore({
  reducer: rootReducer, 
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// --- Persistor (App'te kullanmak için) ---
export const persistor = persistStore(store);

// --- Types ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

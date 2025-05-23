// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/modules/users/slice/authSlice";
import userCrudReducer from "@/modules/users/slice/userCrudSlice";
import userStatusReducer from "@/modules/users/slice/userStatusSlice";
import accountReducer from "@/modules/users/slice/accountSlice";
import addressSlice from "@/modules/users/slice/addressSlice";
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
import stockMovementReducer from "./stockMovementSlice";
import chatReducer from "@/modules/chat/slice/chatSlice";
import aboutReducer from "@/modules/about/slice/aboutSlice";
import aboutCategoryReducer from "@/modules/about/slice/aboutCategorySlice";
import bookingReducer from "@/modules/booking/slice/bookingSlice";
import bookingSlotReducer from "@/modules/booking/slice/bookingSlotSlice";
import referencesReducer from "@/modules/references/slice/referencesSlice";
import referenceCategoryReducer from "@/modules/references/slice/referencesCategorySlice";

import cartReducer from "./cartSlice";

import libraryReducer from "./librarySlice";
import ordersReducer from "./ordersSlice";
import categoryReducer from "./categorySlice";
import contactReducer from "./contactMessageSlice";
import emailReducer from "./emailSlice";
import notificationReducer from "./notificationSlice";
import feedbackReducer from "./feedbackSlice";








export const store = configureStore({
  reducer: {
    // 🧑 Kullanıcı işlemleri
    auth: authReducer,
    account: accountReducer,
    userCrud: userCrudReducer,
    userStatus: userStatusReducer,
    address: addressSlice,
    admin: adminModuleReducer,

    // 🛒 Ürün & Sipariş
    products: productsReducer,
    radonarprod: radonarprodReducer,
    radonarCategory: radonarCategoryReducer,
    cart: cartReducer,
    orders: ordersReducer,
    category: categoryReducer,
    stockMovement: stockMovementReducer,

    // 📰 İçerik modülleri
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

    // ⚙️ Sistem modülleri
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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

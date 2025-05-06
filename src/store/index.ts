// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./user/authSlice";
import userCrudReducer from "./user/userCrudSlice";
import userStatusReducer from "./user/userStatusSlice";
import accountReducer from "./user/accountSlice";
import addressSlice from "./user/addressSlice";
import adminReducer from "./adminSlice";

import cartReducer from "./cartSlice";
import productsReducer from "./productsSlice";
import ordersReducer from "./ordersSlice";
import categoryReducer from "./categorySlice";

import blogReducer from "./blogSlice";
import newsReducer from "./newsSlice";
import articlesReducer from "./articlesSlice";
import referencesReducer from "./referencesSlice";
import libraryReducer from "./librarySlice";
import commentsReducer from "./commentsSlice";


import notificationReducer from "./notificationSlice";
import feedbackReducer from "./feedbackSlice";
import settingReducer from "./settingSlice";
import contactReducer from "./contactMessageSlice";
import emailReducer from "./emailSlice";
import galleryReducer from "./gallerySlice";
import faqReducer from "./faqSlice";
import dashboardReducer from "./dashboard/dashboardSlice";
import servicesReducer from "./servicesSlice";
import stockMovementReducer from "./stockMovementSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    // 🧑 Kullanıcı işlemleri
    auth: authReducer,
    account: accountReducer,
    userCrud: userCrudReducer,
    userStatus: userStatusReducer,
    address: addressSlice,
    admin: adminReducer,

    // 🛒 Ürün & Sipariş
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    category: categoryReducer,
    stockMovement: stockMovementReducer,
    
    // 📰 İçerik modülleri
    blog: blogReducer,
    news: newsReducer,
    articles: articlesReducer,
    references: referencesReducer,
    library: libraryReducer,
    comments: commentsReducer,

    // ⚙️ Sistem modülleri
    notifications: notificationReducer,
    feedback: feedbackReducer,
    setting: settingReducer,
    contactMessage: contactReducer,
    email: emailReducer,
    gallery: galleryReducer,
    faq: faqReducer,
    services: servicesReducer,
    dashboard: dashboardReducer,
    chat: chatReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

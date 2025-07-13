// 📦 Module Index: /src/modules/dashboard/index.ts

// 📦 Admin 

// Components
export { default as AdminContactMessagesPage } from "./admin/pages/AdminContactPage";
export { default as ContactMessageList } from "./admin/components/ContactMessageList";
export { default as ContactMessageModal } from "./admin/components/ContactMessageModal";

// 🌍 Pages
export { default as ContactPage } from "./public/pages/ContactPage";

// 🔐 Admin Components

// 📦 Public Components
export { default as ContactFormSection } from "./public/components/ContactFormSection";
export { default as LocationMapSection } from "./public/components/LocationMapSection";

// 📊 Redux Slices

export { default as contactSlice } from "./slice/contactSlice";


// 📝 Types
//export * from "./types";

// 🌐 i18n dosyaları modül içi kullanılır (otomatik yüklenir, elle export gerekmez)

// Pages
export { default as AdminNewsPage } from "./admin/pages/AdminNewsPage";
export { default as NewsPage } from "./public/pages/NewsPage";

// Admin Components
export { default as NewsTabs } from "./admin/components/NewsTabs";
export { default as NewsList } from "./admin/components/NewsList";
export { default as NewsFormModal } from "./admin/components/NewsFormModal";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as CategoryForm } from "./admin/components/CategoryForm";

// Public Components
export { default as NewsSection } from "./public/components/NewsSection";
export { default as NewsDetailSection } from "./public/components/NewsDetailSection";

// Redux Slice
export { default as newsReducer } from "./slice/newsSlice";
export { default as newsCategoryReducer } from "./slice/newsCategorySlice";

// Types (if any)
export * from "./types/news";

// Optionally: i18n can be loaded in page-level or via config

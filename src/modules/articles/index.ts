// Pages
export { default as AdminArticlesPage } from "./admin/pages/AdminArticlesPage";
export { default as ArticlesPage } from "./public/pages/ArticlesPage";

// Admin Components
export { default as ArticlesTabs } from "./admin/components/ArticlesTabs";
export { default as ArticlesList } from "./admin/components/ArticlesList";
export { default as ArticlesFormModal } from "./admin/components/ArticlesFormModal";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as CategoryForm } from "./admin/components/CategoryForm";

// Public Components
export { default as ArticlesSection } from "./public/components/ArticlesSection";
export { default as ArticlesDetailSection } from "./public/components/ArticlesDetailSection";

// Redux Slice
export { default as articlesReducer } from "./slice/articlesSlice";
export { default as articlesCategoryReducer } from "./slice/articlesCategorySlice";

// Types (if any)
export * from "./types/article";

// Optionally: i18n can be loaded in page-level or via config

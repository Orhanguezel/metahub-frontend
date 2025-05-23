// Pages
export { default as AdminBlogPage } from "./admin/pages/AdminBlogPage";
export { default as BlogPage } from "./public/pages/BlogPage";

// Admin Components
export { default as BlogTabs } from "./admin/components/BlogTabs";
export { default as BlogList } from "./admin/components/BlogList";
export { default as BlogFormModal } from "./admin/components/BlogFormModal";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as CategoryForm } from "./admin/components/CategoryForm";

// Public Components
export { default as BlogSection } from "./public/components/BlogSection";
export { default as BlogDetailSection } from "./public/components/BlogDetailSection";

// Redux Slice
export { default as blogReducer } from "./slice/blogSlice";
export { default as blogCategoryReducer } from "./slice/blogCategorySlice";

// Types (if any)
export * from "./types/blog";

// Optionally: i18n can be loaded in page-level or via config

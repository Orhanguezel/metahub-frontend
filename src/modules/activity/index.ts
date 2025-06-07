// Pages
export { default as AdminActivityPage } from "./admin/pages/AdminActivityPage";
export { default as ActivityPage } from "./public/pages/ActivityPage";

// Admin Components
export { default as ActivityTabs } from "./admin/components/ActivityTabs";
export { default as ActivityList } from "./admin/components/ActivityList";
export { default as ActivityFormModal } from "./admin/components/ActivityFormModal";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as CategoryForm } from "./admin/components/CategoryForm";

// Public Components
export { default as ActivitySection } from "./public/components/ActivitySection";
export { default as ActivityDetailSection } from "./public/components/ActivityDetailSection";

// Redux Slice
export { default as activityReducer } from "./slice/activitySlice";
export { default as activityCategoryReducer } from "./slice/activityCategorySlice";

// Types (if any)
export * from "./types/activity";

// Optionally: i18n can be loaded in page-level or via config

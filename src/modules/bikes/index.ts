// Pages
export { default as AdminBikesPage } from "./admin/pages/AdminBikesPage";
export { default as BikesPage } from "./public/pages/BikesPage";

// Admin Components
export { default as BikesTabs } from "./admin/components/BikesTabs";
export { default as BikesList } from "./admin/components/BikesList";
export { default as BikesFormModal } from "./admin/components/BikesFormModal";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as CategoryForm } from "./admin/components/CategoryForm";

// Public Components
export { default as BikesSection } from "./public/components/BikesSection";
export { default as BikesDetailSection } from "./public/components/BikesDetailSection";

// Redux Slice
export { default as bikeCategoryReducer } from "./slice/bikeCategorySlice";
export { default as bikeProdReducer } from "./slice/bikeSlice";

// Types (if any)
export * from "./types";

// Optionally: i18n can be loaded in page-level or via config

// Pages
export { default as AdminBikePage } from "./admin/pages/AdminBikePage";
export { default as BikePage } from "./public/pages/BikePage";

// Admin Components
export { default as BikeTabs } from "./admin/components/BikeTabs";
export { default as BikeList } from "./admin/components/BikeList";
export { default as BikeFormModal } from "./admin/components/BikeFormModal";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as CategoryForm } from "./admin/components/CategoryForm";

// Public Components
export { default as BikeSection } from "./public/components/BikeSection";
export { default as BikeDetailSection } from "./public/components/BikeDetailSection";

// Redux Slice
export { default as bikeCategoryReducer } from "./slice/bikeCategorySlice";
export { default as bikeProdReducer } from "./slice/bikeSlice";

// Types (if any)
export * from "./types";

// Optionally: i18n can be loaded in page-level or via config

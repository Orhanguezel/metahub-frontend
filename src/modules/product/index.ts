// Pages
export { default as AdminProductPage } from "./admin/pages/AdminProductPage";
export { default as ProductPage } from "./public/pages/ProductPage";

// Admin Components
export { default as ProductTabs } from "./admin/components/ProductTabs";
export { default as ProductList } from "./admin/components/ProductList";
export { default as ProductFormModal } from "./admin/components/ProductFormModal";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as CategoryForm } from "./admin/components/CategoryForm";

// Public Components
export { default as ProductSection } from "./public/components/ProductSection";
export { default as ProductDetailSection } from "./public/components/ProductDetailSection";

// Redux Slice
export { default as productReducer } from "./slice/productsSlice";
export { default as radonarCategoryReducer } from "./slice/radonarCategorySlice";
export { default as radonarProdReducer } from "./slice/radonarprodSlice";

// Types (if any)
export * from "./types/product";
export * from "./types/radonarprod";

// Optionally: i18n can be loaded in page-level or via config

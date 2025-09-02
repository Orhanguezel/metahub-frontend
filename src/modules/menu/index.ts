// Pages
export { default as AdminPage } from "./admin/pages/AdminPage";
export { default as Page } from "./public/pages/Page";

// Admin Components
export { default as MenuForm } from "./admin/components/Form";
export { default as List } from "./admin/components/List";
export { default as CategoryForm } from "./admin/components/CategoryForm";
export { default as CategoryListPage } from "./admin/components/CategoryListPage";
export { default as ItemForm } from "./admin/components/item-form/ItemForm";
export { default as ItemListPage } from "./admin/components/item-form/ItemListPage";
export { default as ItemBasics } from "./admin/components/item-form/ItemBasics";
export { default as ItemImages } from "./admin/components/item-form/ItemImages";
export { default as PriceListEditor } from "./admin/components/item-form/ItemStructured/PriceListEditor";
export { default as ItemStructured } from "./admin/components/item-form/ItemStructured/ItemStructured";
export * from "./admin/components/item-form/ItemStructured/types";
export { default as CategoriesSection } from "./admin/components/item-form/ItemStructured/CategoriesSection";
export { default as DietaryOpsSection } from "./admin/components/item-form/ItemStructured/DietaryOpsSection";
export { default as AllergensAdditivesSection } from "./admin/components/item-form/ItemStructured/AllergensAdditivesSection";
export { default as ModifierGroupsSection } from "./admin/components/item-form/ItemStructured/ModifierGroupsSection";
export { default as VariantsSection } from "./admin/components/item-form/ItemStructured/VariantsSection";

// Public Components
export { default as MenuHeader } from "./public/components/MenuHeader";
export { default as CategoryNav } from "./public/components/CategoryNav";
export { default as CategoryMenuSection } from "./public/components/CategoryMenuSection";
export { default as ItemCard } from "./public/components/ItemCard";
export { default as MenuSection } from "./public/components/MenuSectionPage";
export { default as MenuItemDetail } from "./public/components/MenuItemDetail";


// Types (if any)
export * from "./types/menucategory";

// Lokales
export { default as translations } from "./locales";

// Optionally: i18n can be loaded in page-level or via config

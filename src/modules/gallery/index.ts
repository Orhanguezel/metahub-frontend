// Pages
export { default as AdminGalleryPage } from "./admin/pages/AdminGalleryPage";
//export { default as GalleryPage } from "./public/pages/GalleryPage";

// Admin Components
export { default as GalleryToolbar } from "./admin/components/GalleryToolbar";
export { default as GalleryStats } from "./admin/components/GalleryStats";
export { default as GalleryMultiForm } from "./admin/components/GalleryMultiForm";
export { default as GalleryListGroupedByCategory } from "./admin/components/GalleryListGroupedByCategory";
export { default as GalleryList } from "./admin/components/GalleryList";
export { default as GalleryEditForm } from "./admin/components/GalleryEditForm";
export { default as GalleryDashboard } from "./admin/components/GalleryDashboard";
//export { default as GallerySection } from "./public/components/GallerySection";

// Public Components
//export { default as GallerySection } from "./public/components/GallerySection";
//export { default as GalleryDetailSection } from "./public/components/GalleryDetailSection";

// Redux Slice
export { default as galleryReducer } from "./slice/gallerySlice";


// Types (if any)
export * from "./types/gallery";

// Optionally: i18n can be loaded in page-level or via config

// Pages
export { default as AdminCompanyPage } from "./admin/pages/AdminCompanyPage";
//export { default as CompanyPage } from "./public/pages/CompanyPage";

// Admin Components
export { default as CompanyForm } from "./admin/components/CompanyForm";
export { default as CompanyInfoCard } from "./admin/components/CompanyInfoCard";
export { default as SocialLinksForm } from "./admin/components/SocialLinksForm";

// Redux Slice
export { default as companyReducer } from "./slice/companySlice";

// Public Components
//export { default as CompanySection } from "./public/components/CompanySection";
//export { default as CompanyDetailSection } from "./public/components/CompanyDetailSection";

// Types (if any)
export * from "./types/company";

// Optionally: i18n can be loaded in page-level or via config

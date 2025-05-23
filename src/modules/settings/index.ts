// Pages
export { default as AdminSettingPage } from "./admin/pages/AdminSettingsPage";

// Admin Components
export { default as ValueInputSection } from "./admin/components/ValueInputSection";
export { default as NestedValueEditor } from "./admin/components/NestedValueEditor";
export { default as NestedSocialLinksEditor } from "./admin/components/NestedSocialLinksEditor";
export { default as MultiLangObjectEditor } from "./admin/components/MultiLangObjectEditor";
export { default as KeyInputSection } from "./admin/components/KeyInputSection";
export { default as AdminThemeSelector } from "./admin/components/AdminThemeSelector";
export { default as AdminSiteTemplateSelector } from "./admin/components/AdminSiteTemplateSelector";
export { default as AdminSettingsList } from "./admin/components/AdminSettingsList";
export { default as AdminSettingsForm } from "./admin/components/AdminSettingsForm";
export { default as AdminAvailableThemesManager } from "./admin/components/AdminAvailableThemesManager";

// Redux Slice
export { default as settingReducer } from "./slice/settingSlice";

// Public Components


// Types (if any)
export * from "./types/settings";

// Optionally: i18n can be loaded in page-level or via config

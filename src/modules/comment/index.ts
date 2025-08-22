// Pages
export { default as AdminCommentPage } from "./admin/pages/AdminCommentPage";

// Components
export { default as TestimonialSection } from "./public/components/TestimonialSection";
export { default as TestimonialSectionAlt } from "./public/components/TestimonialSectionAlt";
export { default as TestimonialSectionGzl } from "./public/components/TestimonialSectionGzl";

// Admin Components
export { default as DetailsModal } from "./admin/components/DetailsModal";
export { default as CommentForm } from "./admin/components/CommentForm";
export { default as CommentList } from "./admin/components/CommentList";
export { default as ReplyForm } from "./admin/components/ReplyForm";

// Redux Slice
export { default as commentReducer } from "./slice/commentSlice";

// Types (if any)
export * from "./types";

// Locales
export { default as translations } from "./locales";

// Optionally: i18n can be loaded in page-level or via config

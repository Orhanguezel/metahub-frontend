// Pages
export { default as AdminCommentPage } from "./admin/pages/AdminCommentPage";


// Admin Components
export { default as CommentDetailsModal } from "./admin/components/CommentDetailsModal";
export { default as CommentForm } from "./admin/components/CommentForm";
export { default as CommentList } from "./admin/components/CommentList";


// Redux Slice
export { default as commentReducer } from "./slice/commentSlice";

// Types (if any)
export * from "./types/comment";

// Optionally: i18n can be loaded in page-level or via config

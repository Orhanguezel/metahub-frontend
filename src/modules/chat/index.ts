// Pages
export { default as AdminChatPage } from "./admin/pages/AdminChatPage";
export { default as ChatPage } from "./public/pages/ChatPage";
// Admin Components
export { default as UserDetailsModal } from "./admin/components/UserDetailsModal";
export { default as SearchBox } from "./admin/components/SearchBox";
export { default as MessageList } from "./admin/components/MessageList";
export { default as ChatInput } from "./admin/components/ChatInput";
export { default as ChatSessionList } from "./admin/components/ChatSessionList";
export { default as ArchivedSessions } from "./admin/components/ArchivedSessions";
export { default as EscalatedSessions } from "./admin/components/EscalatedSessions";
export { default as ManualMessageForm } from "./admin/components/ManualMessageForm";

// Public Components
export { default as PublicMessageList } from "./public/components/PublicMessageList";
export { default as PublicChatInput } from "./public/components/PublicChatInput";
export { default as FloatingChatbox } from "./public/components/FloatingChatbox";
export { default as ChatWindow } from "./public/components/ChatWindow";
export { default as ChatBox } from "./public/components/ChatBox";
export { default as ChatAlertButton } from "./public/components/ChatAlertButton";

// Redux Slice
export { default as chatReducer } from "./slice/chatSlice";

// Types (if any)
export * from "./types";

// Locales
export { default as translations } from "./locales";

// Optionally: i18n can be loaded in page-level or via config

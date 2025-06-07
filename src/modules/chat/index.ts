// Pages
export { default as AdminChatPage } from "./admin/pages/AdminChatPage";
export { default as ChatPage } from "./public/pages/ChatPage";
// Admin Components
export { default as UserDetailsModal } from "./admin/components/UserDetailsModal";
export { default as SearchBox } from "./admin/components/SearchBox";
export { default as MessageList } from "./admin/components/MessageList";
export { default as ManualMessageForm } from "./admin/components/ManualMessageForm";
export { default as EscalatedSessions } from "./admin/components/EscalatedSessions";
export { default as ChatSessionList } from "./admin/components/ChatSessionList";
export { default as ChatInput } from "./admin/components/ChatInput";
export { default as ArchivedSessions } from "./admin/components/ArchivedSessions";


// Public Components
export { default as PublicMessageList } from "./public/components/PublicMessageList";
export { default as PublicChatInput } from "./public/components/PublicChatInput";
export { default as ChatBox } from "./public/components/ChatBox";

// Redux Slice
export { default as chatReducer } from "./slice/chatSlice";

// Types (if any)
export * from "./types/chat";

// Optionally: i18n can be loaded in page-level or via config

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IComment } from "../types";
import type { TranslatedLabel } from "@/types/common";

// 🌐 State Tipi
interface CommentsState {
  comments: IComment[];           // 🌍 Public (içerik özelinde)
  commentsAdmin: IComment[];      // 🛠 Admin (tüm yorumlar)
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

const initialState: CommentsState = {
  comments: [],
  commentsAdmin: [],
  loading: false,
  error: null,
  successMessage: null,
  pagination: { page: 1, pages: 1, total: 0 },
};

// --- Error Parsing Helper ---
function parseErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload)
    return (payload as any).message;
  if (typeof payload === "string") return payload;
  return "Something went wrong.";
}

const normalizeContentType = (type: string): string =>
  type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

// --- Async Thunks ---

// 1. Public: Yorum oluştur
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (
    data: {
      comment: string;
      contentType: string;
      contentId: string;
      name?: string;
      email?: string;
      recaptchaToken?: string;
      rating?: number;
    },
    thunkAPI
  ) => {
    const normalized = {
      ...data,
      contentType: normalizeContentType(data.contentType),
    };
    const res = await apiCall(
      "post",
      "/comment",
      normalized,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 2. Public: İçeriğe ait yorumları getir
export const fetchCommentsForContent = createAsyncThunk(
  "comments/fetchForContent",
  async (payload: { type: string; id: string }, thunkAPI) => {
    const endpointType = payload.type.toLowerCase();
    const res = await apiCall(
      "get",
      `/comment/${endpointType}/${payload.id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 3. Admin: Tüm yorumları getir (pagination)
export const fetchAllCommentsAdmin = createAsyncThunk(
  "comments/fetchAllAdmin",
  async (page: number = 1, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/comment?page=${page}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res;
  }
);

// 4. Admin: Yayın durumu güncelle
export const togglePublishComment = createAsyncThunk(
  "comments/togglePublish",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/comment/${id}/toggle`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 5. Admin: Yorum sil
export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/comment/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

// 6. Admin: Yoruma cevap yaz
export const replyToComment = createAsyncThunk(
  "comments/reply",
  async (payload: { id: string; text: TranslatedLabel }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/comment/${payload.id}/reply`,
      { text: payload.text },
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---
const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // --- Public: Yorum oluştur ---
    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Your comment was submitted successfully.";
        state.comments.unshift(action.payload);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = parseErrorMessage(action.payload);
      });

    // --- Public: İçerik özelinde yorumları getir ---
    builder
      .addCase(fetchCommentsForContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsForContent.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchCommentsForContent.rejected, (state, action) => {
        state.loading = false;
        state.error = parseErrorMessage(action.payload);
      });

    // --- Admin: Tüm yorumları getir (pagination ile) ---
    builder
      .addCase(fetchAllCommentsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCommentsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.commentsAdmin = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllCommentsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = parseErrorMessage(action.payload);
      });

    // --- Admin: Yayın durumu güncelle ---
    builder
      .addCase(togglePublishComment.fulfilled, (state, action) => {
        const updated = action.payload;
        // Yalnızca commentsAdmin dizisinde güncelle
        if (updated && updated._id) {
          const index = state.commentsAdmin.findIndex((c) => c._id === updated._id);
          if (index !== -1) {
            state.commentsAdmin[index] = updated;
          }
          state.successMessage = "Comment status updated.";
        }
      })
      .addCase(togglePublishComment.rejected, (state, action) => {
        state.error = parseErrorMessage(action.payload);
      });

    // --- Admin: Yorum sil ---
    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.commentsAdmin = state.commentsAdmin.filter((c) => c._id !== action.payload);
        state.successMessage = "Comment deleted successfully.";
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = parseErrorMessage(action.payload);
      });

    // --- Admin: Yoruma cevap yaz ---
    builder
      .addCase(replyToComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated._id) {
          const index = state.commentsAdmin.findIndex((c) => c._id === updated._id);
          if (index !== -1) {
            state.commentsAdmin[index] = updated;
          }
        }
        state.loading = false;
        state.successMessage = "Reply saved successfully.";
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.loading = false;
        state.error = parseErrorMessage(action.payload);
      });
  },
});

export const { clearCommentMessages } = commentsSlice.actions;
export default commentsSlice.reducer;

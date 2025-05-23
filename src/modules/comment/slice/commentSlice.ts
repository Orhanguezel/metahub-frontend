import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { IComment } from "@/modules/comment/types/comment";

// 🌐 State Tipi
interface CommentsState {
  comments: IComment[];
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
  loading: false,
  error: null,
  successMessage: null,
  pagination: { page: 1, pages: 1, total: 0 },
};

// 🔄 Yardımcı: contentType normalize edici
const normalizeContentType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

// ✅ Yorum Oluştur (Public)
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

// ✅ İçeriğe Ait Yorumları Getir (Public)
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

// ✅ Admin: Tüm Yorumları Getir (Pagination)
export const fetchAllComments = createAsyncThunk(
  "comments/fetchAll",
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

// ✅ Admin: Yayın Durumu Güncelle
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

// ✅ Admin: Yorum Sil
export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id: string, thunkAPI) => {
    await apiCall("delete", `/comment/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

// ✅ Admin: Yoruma Cevap Yaz
export const replyToComment = createAsyncThunk(
  "comments/reply",
  async (
    payload: { id: string; text: { tr: string; en: string; de: string } },
    thunkAPI
  ) => {
    const res = await apiCall(
      "put",
      `/comment/${payload.id}/reply`,
      { text: payload.text },
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🔧 Slice
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
    const startLoading = (state: CommentsState) => {
      state.loading = true;
      state.error = null;
    };

    const handleError = (state: CommentsState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error =
        (typeof action.payload === "object" && action.payload?.message) ||
        (typeof action.payload === "string" && action.payload) ||
        "Something went wrong.";
    };

    // CREATE
    builder
      .addCase(createComment.pending, startLoading)
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Your comment was submitted successfully.";
        state.comments.unshift(action.payload);
      })
      .addCase(createComment.rejected, handleError);

    // FETCH FOR CONTENT
    builder
      .addCase(fetchCommentsForContent.pending, startLoading)
      .addCase(fetchCommentsForContent.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchCommentsForContent.rejected, handleError);

    // FETCH ALL
    builder
      .addCase(fetchAllComments.pending, startLoading)
      .addCase(fetchAllComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllComments.rejected, handleError);

    // TOGGLE PUBLISH
    builder
      .addCase(togglePublishComment.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated._id) {
          const index = state.comments.findIndex((c) => c._id === updated._id);
          if (index !== -1) {
            state.comments[index] = updated;
          }
          state.successMessage = "Comment status updated.";
        }
      })
      .addCase(togglePublishComment.rejected, handleError);

    // DELETE
    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c._id !== action.payload);
        state.successMessage = "Comment deleted successfully.";
      })
      .addCase(deleteComment.rejected, handleError);

    // REPLY
    builder
      .addCase(replyToComment.pending, startLoading)
      .addCase(replyToComment.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated && updated._id) {
          const index = state.comments.findIndex((c) => c._id === updated._id);
          if (index !== -1) {
            state.comments[index] = updated;
          }
        }
        state.loading = false;
        state.successMessage = "Reply saved successfully.";
      })
      .addCase(replyToComment.rejected, handleError);
  },
});

export const { clearCommentMessages } = commentsSlice.actions;
export default commentsSlice.reducer;

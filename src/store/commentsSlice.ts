import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IComment } from "@/types/comment"; // ayrı type dosyası olarak ayrılmalı

interface CommentsState {
  comments: IComment[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Yeni yorum oluştur (public)
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (data: Omit<IComment, "_id" | "isPublished" | "isActive" | "createdAt" | "updatedAt">, thunkAPI) =>
    await apiCall("post", "/comments", data, thunkAPI.rejectWithValue)
);

// ✅ Belirli içeriğe ait yorumları getir
export const fetchCommentsForContent = createAsyncThunk(
  "comments/fetchForContent",
  async (payload: { type: IComment["contentType"]; id: string }, thunkAPI) =>
    await apiCall("get", `/comments/${payload.type}/${payload.id}`, null, thunkAPI.rejectWithValue)
);

// ✅ Tüm yorumları getir (admin)
export const fetchAllComments = createAsyncThunk(
  "comments/fetchAll",
  async (_, thunkAPI) =>
    await apiCall("get", "/comments", null, thunkAPI.rejectWithValue)
);

// ✅ Yayın durumunu değiştir (admin)
export const togglePublishComment = createAsyncThunk(
  "comments/togglePublish",
  async (id: string, thunkAPI) =>
    await apiCall("put", `/comments/${id}/toggle`, null, thunkAPI.rejectWithValue)
);

// ✅ Yorumu sil (admin)
export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/comments/${id}`, null, thunkAPI.rejectWithValue)
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
    // Helper reducers
    const loading = (state: CommentsState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: CommentsState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    // CREATE
    builder
      .addCase(createComment.pending, loading)
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Yorum başarıyla gönderildi. Onay sonrası yayınlanacaktır.";
      })
      .addCase(createComment.rejected, failed);

    // FETCH FOR CONTENT
    builder
      .addCase(fetchCommentsForContent.pending, loading)
      .addCase(fetchCommentsForContent.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchCommentsForContent.rejected, failed);

    // FETCH ALL (Admin)
    builder
      .addCase(fetchAllComments.pending, loading)
      .addCase(fetchAllComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchAllComments.rejected, failed);

    // TOGGLE PUBLISH
    builder
      .addCase(togglePublishComment.fulfilled, (state, action) => {
        const updated = action.payload.comment;
        const index = state.comments.findIndex((c) => c._id === updated._id);
        if (index !== -1) state.comments[index] = updated;
        state.successMessage = "Yayın durumu güncellendi.";
      })
      .addCase(togglePublishComment.rejected, failed);

    // DELETE
    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedId = action.meta.arg;
        state.comments = state.comments.filter((c) => c._id !== deletedId);
        state.successMessage = "Yorum silindi.";
      })
      .addCase(deleteComment.rejected, failed);
  },
});

export const { clearCommentMessages } = commentsSlice.actions;
export default commentsSlice.reducer;

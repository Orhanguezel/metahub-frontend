// src/modules/comments/store/comments.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IComment, CommentContentType, CommentType, TranslatedField } from "../types";

/* ---------------- State ---------------- */
export type AdminCommentsQuery = {
  page?: number;
  commentType?: CommentType;
};

interface CommentsState {
  comments: IComment[];          // Public (içerik özelinde)
  commentsAdmin: IComment[];     // Admin (tüm yorumlar)
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
  /** ✅ Admin listeleme için query bilgisi (parametresiz fetch buradan okur) */
  adminQuery: AdminCommentsQuery;
}

const initialState: CommentsState = {
  comments: [],
  commentsAdmin: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
  pagination: { page: 1, pages: 1, total: 0 },
  adminQuery: { page: 1, commentType: undefined },
};

function parseErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload)
    return (payload as any).message;
  if (typeof payload === "string") return payload;
  return "Something went wrong.";
}

const BASE = "/comment"; 

/* ---------------- Thunks ---------------- */

// 1. Public: Yorum/testimonial oluştur
export const createComment = createAsyncThunk<
  IComment,
  {
    comment: string;
    profileImage?: string | { thumbnail?: string; url?: string };
    label?: string;
    text?: string;
    contentType: CommentContentType;
    contentId: string;
    type?: CommentType;
    name?: string;
    company?: string;
    position?: string;
    email?: string;
    recaptchaToken?: string;
    rating?: number;
    isPublished?: boolean;
    isActive?: boolean;
  }
>("comments/createComment", async (data, thunkAPI) => {
  const res = await apiCall("post", "/comment", data, thunkAPI.rejectWithValue);
  return res.data as IComment;
});

// 2. Public: İçeriğe ait yorumları getir (type ile filtre opsiyonel)
export const fetchCommentsForContent = createAsyncThunk<
  IComment[],
  { type: CommentContentType; id: string; commentType?: CommentType }
>("comments/fetchForContent", async (payload, thunkAPI) => {
  let url = `${BASE}/${payload.type}/${payload.id}`;
  if (payload.commentType) url += `?type=${payload.commentType}`;
  const res = await apiCall("get", url, null, thunkAPI.rejectWithValue);
  return res.data as IComment[];
});

// 3. Admin: Tüm yorumları getir — ✅ parametresiz
export const fetchAllCommentsAdmin = createAsyncThunk<
  { data: IComment[]; pagination: CommentsState["pagination"] },
  void,
  { state: any; rejectValue: { message: string } }
>("comments/fetchAllAdmin", async (_void, { getState, rejectWithValue }) => {
  const state: any = getState();
  const query: AdminCommentsQuery = state?.comments?.adminQuery ?? {};
  const page = Number(query?.page ?? 1);
  const type = query?.commentType;

  let url = `${BASE}?page=${page}`;
  if (type) url += `&type=${type}`;

  try {
    const res = await apiCall("get", url, null, rejectWithValue);
    const raw = res?.data ?? res;

    // Esnek zarf: {data, pagination} | {comments, page, pages, total} | [ ... ]
    const data: IComment[] =
      raw?.data ??
      raw?.comments ??
      (Array.isArray(raw) ? raw : []);

    const pagination =
      raw?.pagination ?? {
        page: Number(raw?.page ?? page ?? 1),
        pages: Number(raw?.pages ?? 1),
        total: Number(raw?.total ?? data.length ?? 0),
      };

    return { data, pagination };
  } catch (err: any) {
    return rejectWithValue({ message: err?.message || "Failed to fetch comments." });
  }
});

// 4. Admin: Yayın durumu toggle
export const togglePublishComment = createAsyncThunk<IComment, string>(
  "comments/togglePublish",
  async (id, thunkAPI) => {
    const res = await apiCall(
      "put",
      `${BASE}/${id}/toggle`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data as IComment;
  }
);

// 5. Admin: Yorum sil
export const deleteComment = createAsyncThunk<string, string>(
  "comments/delete",
  async (id, thunkAPI) => {
    await apiCall("delete", `${BASE}/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

// 6. Admin: Yoruma admin cevabı ekle
export const replyToComment = createAsyncThunk<
  IComment,
  { id: string; text: TranslatedField }
>("comments/reply", async ({ id, text }, thunkAPI) => {
  const res = await apiCall(
    "put",
    `${BASE}/${id}/reply`,
    { text },
    thunkAPI.rejectWithValue
  );
  return res.data as IComment;
});

/* ---------------- Slice ---------------- */
const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    resetComments: (state) => {
      state.comments = [];
      state.commentsAdmin = [];
      state.pagination = { page: 1, pages: 1, total: 0 };
      state.adminQuery = { page: 1, commentType: undefined };
      state.status = "idle";
      state.error = null;
      state.successMessage = null;
      state.loading = false;
    },
    /** ✅ Parametresiz fetch için sorguyu buradan set et */
    setCommentsAdminQuery: (state, action: PayloadAction<AdminCommentsQuery>) => {
      state.adminQuery = { ...state.adminQuery, ...(action.payload || {}) };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Your comment was submitted successfully.";
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      .addCase(fetchCommentsForContent.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCommentsForContent.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.comments = action.payload;
      })
      .addCase(fetchCommentsForContent.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      .addCase(fetchAllCommentsAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllCommentsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.commentsAdmin = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllCommentsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      .addCase(togglePublishComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(togglePublishComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updated = action.payload;
        const index = state.commentsAdmin.findIndex((c) => c._id === updated._id);
        if (index !== -1) {
          state.commentsAdmin[index] = updated;
        }
        state.successMessage = updated.isPublished
          ? "Comment published."
          : "Comment unpublished.";
      })
      .addCase(togglePublishComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      .addCase(deleteComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.commentsAdmin = state.commentsAdmin.filter((c) => c._id !== action.payload);
        state.successMessage = "Comment deleted successfully.";
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      .addCase(replyToComment.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const index = state.commentsAdmin.findIndex((c) => c._id === updated._id);
        if (index !== -1) {
          state.commentsAdmin[index] = updated;
        }
        state.successMessage = "Reply saved successfully.";
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      });
  },
});

export const {
  clearCommentMessages,
  resetComments,
  setCommentsAdminQuery,   // ✅ dışarı aktar
} = commentsSlice.actions;

export default commentsSlice.reducer;

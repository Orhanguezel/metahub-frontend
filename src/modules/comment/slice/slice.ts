import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IComment, CommentContentType, CommentType, TranslatedField } from "../types";

/* ---------------- Helpers ---------------- */
const BASE = "/comment";
const buildKey = (type: CommentContentType, id: string, commentType?: CommentType | "all") =>
  `${type}:${id}:${commentType || "all"}`;

function parseErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload)
    return (payload as any).message;
  if (typeof payload === "string") return payload;
  return "Something went wrong.";
}

/* ---------------- State ---------------- */
export type AdminCommentsQuery = {
  page?: number;
  commentType?: CommentType;
};

interface CommentsState {
  comments: IComment[];                 // legacy public list
  byContent: Record<string, IComment[]>; // content bazlı cache
  commentsAdmin: IComment[];
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
  adminQuery: AdminCommentsQuery;

  // Public testimonials cache (opsiyonel; carousel için)
  testimonials: IComment[];
  testimonialsPagination: { page: number; pages: number; total: number };
}

const initialState: CommentsState = {
  comments: [],
  byContent: {},
  commentsAdmin: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
  pagination: { page: 1, pages: 1, total: 0 },
  adminQuery: { page: 1, commentType: undefined },
  testimonials: [],
  testimonialsPagination: { page: 1, pages: 1, total: 0 },
};

/* ---------------- Thunks ---------------- */

// 1) Public: oluştur (testimonial destekli)
export const createComment = createAsyncThunk<
  IComment,
  {
    comment?: string;
    profileImage?: string | { thumbnail?: string; url?: string };
    label?: string;
    text?: string;
    contentType: CommentContentType;
    contentId?: string | null;         // ⬅️ testimonial için opsiyonel
    type?: CommentType;
    name?: string;
    company?: string;
    position?: string;
    email?: string;
    recaptchaToken?: string;
    rating?: number | null;
    isPublished?: boolean;
    isActive?: boolean;
  }
>("comments/createComment", async (data, thunkAPI) => {
  const res = await apiCall("post", "/comment", data, thunkAPI.rejectWithValue);
  // BE genellikle { success, message, data } döndürüyor → her iki olasılığı ele al
  const body = res?.data ?? res;
  return (body?.data ?? body) as IComment;
});

// 2) Public: içerik yorumları
export const fetchCommentsForContent = createAsyncThunk<
  { list: IComment[]; pagination?: CommentsState["pagination"] },
  { type: CommentContentType; id: string; commentType?: CommentType; page?: number; limit?: number }
>("comments/fetchForContent", async ({ type, id, commentType, page, limit }, thunkAPI) => {
  let url = `${BASE}/${type}/${id}`;
  const q: string[] = [];
  if (commentType) q.push(`type=${commentType}`);
  if (page) q.push(`page=${page}`);
  if (limit) q.push(`limit=${limit}`);
  if (q.length) url += `?${q.join("&")}`;

  const res = await apiCall("get", url, null, thunkAPI.rejectWithValue);
  const body = res?.data ?? res;
  const list: IComment[] = body?.data ?? body ?? [];
  const pagination = body?.pagination;
  return { list, pagination };
});

// 3) Public: testimonials (global, contentId yok)
export const fetchTestimonialsPublic = createAsyncThunk<
  { list: IComment[]; pagination?: CommentsState["pagination"] },
  { page?: number; limit?: number; minRating?: number }
>("comments/fetchTestimonialsPublic", async ({ page, limit, minRating } = {}, thunkAPI) => {
  const q: string[] = [];
  if (page) q.push(`page=${page}`);
  if (limit) q.push(`limit=${limit}`);
  if (minRating) q.push(`minRating=${minRating}`);
  const url = q.length ? `${BASE}/testimonials?${q.join("&")}` : `${BASE}/testimonials`;

  const res = await apiCall("get", url, null, thunkAPI.rejectWithValue);
  const body = res?.data ?? res;
  const list: IComment[] = body?.data ?? body ?? [];
  const pagination = body?.pagination;
  return { list, pagination };
});

// 4) Admin: liste
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
    const data: IComment[] = raw?.data ?? raw?.comments ?? (Array.isArray(raw) ? raw : []);
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

// 5) Admin: publish toggle
export const togglePublishComment = createAsyncThunk<IComment, string>(
  "comments/togglePublish",
  async (id, thunkAPI) => {
    const res = await apiCall("put", `${BASE}/${id}/toggle`, null, thunkAPI.rejectWithValue);
    const body = res?.data ?? res;
    return (body?.data ?? body) as IComment;
  }
);

// 6) Admin: sil
export const deleteComment = createAsyncThunk<string, string>(
  "comments/delete",
  async (id, thunkAPI) => {
    await apiCall("delete", `${BASE}/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

// 7) Admin: reply
export const replyToComment = createAsyncThunk<IComment, { id: string; text: TranslatedField }>(
  "comments/reply",
  async ({ id, text }, thunkAPI) => {
    const res = await apiCall("put", `${BASE}/${id}/reply`, { text }, thunkAPI.rejectWithValue);
    const body = res?.data ?? res;
    return (body?.data ?? body) as IComment;
  }
);

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
      state.byContent = {};
      state.commentsAdmin = [];
      state.pagination = { page: 1, pages: 1, total: 0 };
      state.adminQuery = { page: 1, commentType: undefined };
      state.status = "idle";
      state.error = null;
      state.successMessage = null;
      state.loading = false;
      state.testimonials = [];
      state.testimonialsPagination = { page: 1, pages: 1, total: 0 };
    },
    setCommentsAdminQuery: (state, action: PayloadAction<AdminCommentsQuery>) => {
      state.adminQuery = { ...state.adminQuery, ...(action.payload || {}) };
    },
  },
  extraReducers: (builder) => {
    builder
      // create
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Your comment was submitted successfully.";

        // Eğer içerik bağlıysa cache'e koy
        const { contentType, contentId, type } = action.meta.arg || {};
        if (contentType && contentId) {
          const k = buildKey(contentType, String(contentId), type);
          const list = state.byContent[k] || [];
          state.byContent[k] = [action.payload, ...list];
          state.comments = [action.payload, ...state.comments];
        } else if (action.meta.arg?.type === "testimonial") {
          // testimonial ise testimonials listesine en üste ekleyebilirsin (opsiyonel)
          state.testimonials = [action.payload, ...state.testimonials];
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      // fetch public content comments
      .addCase(fetchCommentsForContent.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCommentsForContent.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.comments = action.payload.list; // legacy
        const { type, id, commentType } = action.meta.arg;
        const key = buildKey(type, id, commentType || "all");
        state.byContent[key] = action.payload.list;
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchCommentsForContent.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      // fetch public testimonials
      .addCase(fetchTestimonialsPublic.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTestimonialsPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.testimonials = action.payload.list;
        if (action.payload.pagination) state.testimonialsPagination = action.payload.pagination;
      })
      .addCase(fetchTestimonialsPublic.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      // admin fetch
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

      // toggle
      .addCase(togglePublishComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(togglePublishComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.commentsAdmin.findIndex((c) => c._id === updated._id);
        if (i !== -1) state.commentsAdmin[i] = updated;
        state.successMessage = updated.isPublished ? "Comment published." : "Comment unpublished.";

        // byContent güncelle
        Object.keys(state.byContent).forEach((k) => {
          const idx = state.byContent[k]?.findIndex((c) => c._id === updated._id) ?? -1;
          if (idx >= 0) state.byContent[k][idx] = updated;
        });

        // testimonials güncelle
        const tIdx = state.testimonials.findIndex((c) => c._id === updated._id);
        if (tIdx >= 0) state.testimonials[tIdx] = updated;
      })
      .addCase(togglePublishComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      // delete
      .addCase(deleteComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload;
        state.commentsAdmin = state.commentsAdmin.filter((c) => c._id !== id);
        state.successMessage = "Comment deleted successfully.";
        Object.keys(state.byContent).forEach((k) => {
          state.byContent[k] = (state.byContent[k] || []).filter((c) => c._id !== id);
        });
        state.comments = state.comments.filter((c) => c._id !== id);
        state.testimonials = state.testimonials.filter((c) => c._id !== id);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = parseErrorMessage(action.payload);
      })

      // reply
      .addCase(replyToComment.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.commentsAdmin.findIndex((c) => c._id === updated._id);
        if (i !== -1) state.commentsAdmin[i] = updated;
        Object.keys(state.byContent).forEach((k) => {
          const idx = state.byContent[k]?.findIndex((c) => c._id === updated._id) ?? -1;
          if (idx >= 0) state.byContent[k][idx] = updated;
        });
        const tIdx = state.testimonials.findIndex((c) => c._id === updated._id);
        if (tIdx >= 0) state.testimonials[tIdx] = updated;
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
  setCommentsAdminQuery,
} = commentsSlice.actions;

export default commentsSlice.reducer;

/* ---------- Selectors ---------- */
export const selectCommentsFor = (
  state: any,
  args: { type: CommentContentType; id: string; commentType?: CommentType | "all" }
): IComment[] => {
  const keyWithType = buildKey(args.type, args.id, args.commentType || "all");
  const keyAll = buildKey(args.type, args.id, "all");
  return state.comments.byContent[keyWithType] ||
         state.comments.byContent[keyAll] ||
         [];
};

// Testimonial’lar (public)
export const selectTestimonials = (state: any): IComment[] => state.comments.testimonials;
export const selectTestimonialsPagination = (state: any) => state.comments.testimonialsPagination;

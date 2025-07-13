import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IArticles } from "@/modules/articles";

interface ArticlesState {
  articles: IArticles[]; // Public (site) için
  articlesAdmin: IArticles[]; // Admin panel için
  selected: IArticles | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ArticlesState = {
  articles: [],
  articlesAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as any).message === "string"
  )
    return (payload as any).message;
  return "An error occurred.";
};

// --- Async Thunks ---

export const fetchArticles = createAsyncThunk<IArticles[]>(
  "articles/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/articles`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchAllArticlesAdmin = createAsyncThunk<IArticles[]>(
  "articles/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/articles/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createArticles = createAsyncThunk(
  "articles/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/articles/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const updateArticles = createAsyncThunk(
  "articles/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/articles/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const deleteArticles = createAsyncThunk(
  "articles/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/articles/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishArticles = createAsyncThunk(
  "articles/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/articles/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const fetchArticlesBySlug = createAsyncThunk(
  "articles/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/articles/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    clearArticlesMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedArticles(state, action: PayloadAction<IArticles | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: ArticlesState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: ArticlesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    // --- Public List ---
    builder
      .addCase(fetchArticles.pending, startLoading)
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, setError);

    // --- Admin List ---
    builder
      .addCase(fetchAllArticlesAdmin.pending, startLoading)
      .addCase(fetchAllArticlesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.articlesAdmin = action.payload;
      })
      .addCase(fetchAllArticlesAdmin.rejected, setError);

    // --- Admin Create ---
    builder
      .addCase(createArticles.pending, startLoading)
      .addCase(createArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Article created successfully.";
        if (action.payload?.data) {
          state.articlesAdmin.unshift(action.payload.data);
        }
      })
      .addCase(createArticles.rejected, setError);

    // --- Admin Update ---
    builder
      .addCase(updateArticles.pending, startLoading)
      .addCase(updateArticles.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.articlesAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.articlesAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateArticles.rejected, setError);

    // --- Admin Delete ---
    builder
      .addCase(deleteArticles.pending, startLoading)
      .addCase(deleteArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articlesAdmin = state.articlesAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteArticles.rejected, setError);

    // --- Admin Toggle Publish ---
    builder
      .addCase(togglePublishArticles.pending, startLoading)
      .addCase(togglePublishArticles.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.articlesAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.articlesAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishArticles.rejected, setError);

    // --- Single Fetch (slug) ---
    builder
      .addCase(fetchArticlesBySlug.pending, startLoading)
      .addCase(fetchArticlesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchArticlesBySlug.rejected, setError);
  },
});

export const { clearArticlesMessages, setSelectedArticles } =
  articlesSlice.actions;
export default articlesSlice.reducer;

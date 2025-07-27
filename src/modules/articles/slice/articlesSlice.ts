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
    clearArticlesMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedArticles: (state, action: PayloadAction<IArticles | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: ArticlesState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: ArticlesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchArticles.pending, setLoading)
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllArticlesAdmin.pending, setLoading)
      .addCase(fetchAllArticlesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.articlesAdmin = action.payload;
      })
      .addCase(fetchAllArticlesAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createArticles.pending, setLoading)
      .addCase(createArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.articlesAdmin.unshift(action.payload);
        state.successMessage = "Articles successfully created.";
      })
      .addCase(createArticles.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateArticles.pending, setLoading)
      .addCase(updateArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.articlesAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.articlesAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Articles successfully updated.";
      })
      .addCase(updateArticles.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteArticles.pending, setLoading)
      .addCase(deleteArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.articlesAdmin = state.articlesAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteArticles.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishArticles.pending, setLoading)
      .addCase(togglePublishArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.articlesAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.articlesAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Publish status updated.";
      })
      .addCase(togglePublishArticles.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchArticlesBySlug.pending, setLoading)
      .addCase(fetchArticlesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchArticlesBySlug.rejected, setError);
  },
});

export const { clearArticlesMessages, setSelectedArticles } =
  articlesSlice.actions;
export default articlesSlice.reducer;

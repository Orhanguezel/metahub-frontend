import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IArticles } from "@/modules/articles/types/article";

interface ArticlesState {
  articles: IArticles[];
  selected: IArticles | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ArticlesState = {
  articles: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🌐 Public - fetch by language
export const fetchArticles = createAsyncThunk(
  "articles/fetchAll",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/articles?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create Article
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

// ✏️ Update Article
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

// ❌ Delete Article
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

// 🛠 Admin - fetch all Articles
export const fetchAllArticlesAdmin = createAsyncThunk(
  "articles/fetchAllAdmin",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/articles/admin?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🔁 Admin - publish toggle
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

// 🌐 Public - Fetch By Slug
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

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    clearArticlesMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: ArticlesState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: ArticlesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      .addCase(fetchArticles.pending, loading)
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, failed)

      .addCase(createArticles.pending, loading)
      .addCase(createArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Article created successfully.";
        const item = action.payload;
        if (item && item._id) state.articles.unshift(item);
      })
      .addCase(createArticles.rejected, failed)

      .addCase(updateArticles.pending, loading)
      .addCase(updateArticles.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.articles.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.articles[index] = updated;
        if (state.selected?._id === updated._id) {
          state.selected = updated;
        }
        state.successMessage = "Article updated successfully.";
      })
      .addCase(updateArticles.rejected, failed)

      .addCase(deleteArticles.pending, loading)
      .addCase(deleteArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = state.articles.filter(
          (n) => n._id !== action.payload.id
        );
        state.successMessage = "Article deleted successfully.";
      })
      .addCase(deleteArticles.rejected, failed)

      .addCase(fetchAllArticlesAdmin.pending, loading)
      .addCase(fetchAllArticlesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchAllArticlesAdmin.rejected, failed)

      .addCase(togglePublishArticles.pending, loading)
      .addCase(togglePublishArticles.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.articles.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.articles[index] = updated;
        if (state.selected?._id === updated._id) {
          state.selected = updated;
        }
        state.successMessage = updated.isPublished
          ? "Article published successfully."
          : "Article unpublished successfully.";
      })
      .addCase(togglePublishArticles.rejected, failed)

      .addCase(fetchArticlesBySlug.pending, loading)
      .addCase(fetchArticlesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchArticlesBySlug.rejected, failed);
  },
});

export const { clearArticlesMessages } = articlesSlice.actions;
export default articlesSlice.reducer;

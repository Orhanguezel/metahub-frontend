// src/modules/articles/slice/articlesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IArticles } from "@/modules/articles/types";
import type { SupportedLocale } from "@/types/common";

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

// 🌐 Public - fetch by dynamic language
export const fetchArticles = createAsyncThunk<IArticles[], SupportedLocale>(
  "articles/fetchAll",
  async (lang, thunkAPI) => {
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
export const createArticles = createAsyncThunk<IArticles, FormData>(
  "articles/create",
  async (formData, thunkAPI) => {
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
export const updateArticles = createAsyncThunk<
  IArticles,
  { id: string; formData: FormData }
>("articles/update", async ({ id, formData }, thunkAPI) => {
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
});

// ❌ Delete Article
export const deleteArticles = createAsyncThunk<
  { id: string; message: string },
  string
>("articles/delete", async (id, thunkAPI) => {
  const res = await apiCall(
    "delete",
    `/articles/${id}`,
    null,
    thunkAPI.rejectWithValue
  );
  return { id, message: res.message };
});

// 🛠 Admin - fetch all Articles (dinamik dil header üzerinden alınır)
export const fetchAllArticlesAdmin = createAsyncThunk(
  "articles/fetchAllAdmin",
  async (lang: SupportedLocale, thunkAPI) => {
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
export const togglePublishArticles = createAsyncThunk<
  IArticles,
  { id: string; isPublished: boolean }
>("articles/togglePublish", async ({ id, isPublished }, thunkAPI) => {
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
});

// 🌐 Public - Fetch By Slug
export const fetchArticlesBySlug = createAsyncThunk<IArticles, string>(
  "articles/fetchBySlug",
  async (slug, thunkAPI) => {
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
        state.articles.unshift(action.payload);
      })
      .addCase(createArticles.rejected, failed)

      .addCase(updateArticles.pending, loading)
      .addCase(updateArticles.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.articles.findIndex((a) => a._id === updated._id);
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
          (a) => a._id !== action.payload.id
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
        const index = state.articles.findIndex((a) => a._id === updated._id);
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

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IArticle } from "@/types/article";

interface ArticleState {
  articles: IArticle[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selectedArticle: IArticle | null;
}

const initialState: ArticleState = {
  articles: [],
  loading: false,
  error: null,
  successMessage: null,
  selectedArticle: null,
};

// ✅ Get all articles
export const fetchArticles = createAsyncThunk(
  "articles/fetchAll",
  async (_, thunkAPI) => await apiCall("get", "/articles", null, thunkAPI.rejectWithValue)
);

// ✅ Get article by ID
export const fetchArticleById = createAsyncThunk(
  "articles/fetchById",
  async (id: string, thunkAPI) =>
    await apiCall("get", `/articles/${id}`, null, thunkAPI.rejectWithValue)
);

// ✅ Create article (FormData destekli)
export const createArticle = createAsyncThunk(
  "articles/create",
  async (formData: FormData, thunkAPI) =>
    await apiCall("post", "/articles", formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ✅ Update article
export const updateArticle = createAsyncThunk(
  "articles/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) =>
    await apiCall("put", `/articles/${id}`, formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ✅ Delete article
export const deleteArticle = createAsyncThunk(
  "articles/delete",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/articles/${id}`, null, thunkAPI.rejectWithValue)
);

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    clearArticleMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: ArticleState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: ArticleState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchArticles.pending, loadingReducer)
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, errorReducer)

      .addCase(fetchArticleById.pending, loadingReducer)
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArticle = action.payload;
      })
      .addCase(fetchArticleById.rejected, errorReducer)

      .addCase(createArticle.pending, loadingReducer)
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Artikel erfolgreich erstellt.";
        state.articles.unshift(action.payload.article);
      })
      .addCase(createArticle.rejected, errorReducer)

      .addCase(updateArticle.pending, loadingReducer)
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Artikel aktualisiert.";
        const updated = action.payload.article;
        const index = state.articles.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.articles[index] = updated;
      })
      .addCase(updateArticle.rejected, errorReducer)

      .addCase(deleteArticle.pending, loadingReducer)
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Artikel gelöscht.";
        state.articles = state.articles.filter((a) => a._id !== action.payload?.article?._id);
      })
      .addCase(deleteArticle.rejected, errorReducer);
  },
});

export const { clearArticleMessages } = articlesSlice.actions;
export default articlesSlice.reducer;

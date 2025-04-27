import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { INews } from "@/types/news";

interface NewsState {
  news: INews[];
  selectedNews: INews | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: NewsState = {
  news: [],
  selectedNews: null,
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Tüm haberleri getir (dil filtreli)
export const fetchNews = createAsyncThunk(
  "news/fetchAll",
  async (language: string = "en", thunkAPI) =>
    await apiCall("get", `/news?language=${language}`, null, thunkAPI.rejectWithValue)
);

// ✅ Slug ile haber getir
export const fetchNewsBySlug = createAsyncThunk(
  "news/fetchBySlug",
  async (slug: string, thunkAPI) =>
    await apiCall("get", `/news/slug/${slug}`, null, thunkAPI.rejectWithValue)
);

// ✅ ID ile haber getir
export const fetchNewsById = createAsyncThunk(
  "news/fetchById",
  async (id: string, thunkAPI) =>
    await apiCall("get", `/news/${id}`, null, thunkAPI.rejectWithValue)
);

// ➕ Yeni haber oluştur
export const createNews = createAsyncThunk(
  "news/create",
  async (formData: FormData, thunkAPI) =>
    await apiCall("post", "/news", formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ✏️ Güncelle
export const updateNews = createAsyncThunk(
  "news/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) =>
    await apiCall("put", `/news/${id}`, formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ❌ Sil
export const deleteNews = createAsyncThunk(
  "news/delete",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/news/${id}`, null, thunkAPI.rejectWithValue)
);

// SLICE
const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearNewsMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: NewsState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: NewsState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Bir hata oluştu.";
    };

    builder
      // 🔄 GET ALL
      .addCase(fetchNews.pending, loading)
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, failed)

      // 🔄 GET BY SLUG
      .addCase(fetchNewsBySlug.pending, loading)
      .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedNews = action.payload;
      })
      .addCase(fetchNewsBySlug.rejected, failed)

      // 🔄 GET BY ID
      .addCase(fetchNewsById.pending, loading)
      .addCase(fetchNewsById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedNews = action.payload;
      })
      .addCase(fetchNewsById.rejected, failed)

      // ➕ CREATE
      .addCase(createNews.pending, loading)
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Haber başarıyla oluşturuldu.";
        state.news.unshift(action.payload.news);
      })
      .addCase(createNews.rejected, failed)

      // ✏️ UPDATE
      .addCase(updateNews.pending, loading)
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.news;
        state.successMessage = "Haber güncellendi.";
        const index = state.news.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.news[index] = updated;
        if (state.selectedNews?._id === updated._id) {
          state.selectedNews = updated;
        }
      })
      .addCase(updateNews.rejected, failed)

      // ❌ DELETE
      .addCase(deleteNews.pending, loading)
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.meta.arg;
        state.news = state.news.filter((n) => n._id !== deletedId);
        state.successMessage = "Haber silindi.";
      })
      .addCase(deleteNews.rejected, failed);
  },
});

export const { clearNewsMessages } = newsSlice.actions;
export default newsSlice.reducer;

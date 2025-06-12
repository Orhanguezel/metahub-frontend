import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { INews } from "@/modules/news/types/news";
import type { SupportedLocale } from "@/types/common";

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

// 🌐 Public - fetch by language
export const fetchNews = createAsyncThunk(
  "news/fetchAll",
  async (lang: SupportedLocale, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/news?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data; // ✅ çünkü backend: { data: [...] }
  }
);

// ➕ Create News
export const createNews = createAsyncThunk(
  "news/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/news/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // ✅ direkt haber nesnesi
  }
);

// ✏️ Update News
export const updateNews = createAsyncThunk(
  "news/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/news/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // ✅ updated news item
  }
);

// ❌ Delete News
export const deleteNews = createAsyncThunk(
  "news/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/news/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

// 🛠 Admin - fetch all news
export const fetchAllNewsAdmin = createAsyncThunk(
  "news/fetchAllAdmin",
  async (lang: SupportedLocale, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/news/admin?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data; // ✅ çünkü backend: { data: [...] }
  }
);

// 🔁 Admin - publish toggle
export const togglePublishNews = createAsyncThunk(
  "news/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));

    const res = await apiCall(
      "put",
      `/news/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // ✅ updated item
  }
);

// 🌐 Public - Fetch By Slug
export const fetchNewsBySlug = createAsyncThunk(
  "news/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/news/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 📦 Slice
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
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      // 🌐 Public
      .addCase(fetchNews.pending, loading)
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, failed)

      // ➕ Create
      .addCase(createNews.pending, loading)
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "News created successfully.";
        const item = action.payload;
        if (item && item._id) state.news.unshift(item);
      })
      .addCase(createNews.rejected, failed)

      // ✏️ Update
      .addCase(updateNews.pending, loading)
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.news.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.news[index] = updated;
        if (state.selectedNews?._id === updated._id) {
          state.selectedNews = updated;
        }
        state.successMessage = "News updated successfully.";
      })
      .addCase(updateNews.rejected, failed)

      // ❌ Delete
      .addCase(deleteNews.pending, loading)
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = state.news.filter((n) => n._id !== action.payload.id);
        state.successMessage = "News deleted successfully.";
      })
      .addCase(deleteNews.rejected, failed)

      // 🛠 Fetch All Admin
      .addCase(fetchAllNewsAdmin.pending, loading)
      .addCase(fetchAllNewsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchAllNewsAdmin.rejected, failed)

      // 🔁 Toggle Publish
      .addCase(togglePublishNews.pending, loading)
      .addCase(togglePublishNews.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.news.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.news[index] = updated;
        if (state.selectedNews?._id === updated._id) {
          state.selectedNews = updated;
        }
        state.successMessage = updated.isPublished
          ? "News published successfully."
          : "News unpublished successfully.";
      })
      .addCase(togglePublishNews.rejected, failed)

      .addCase(fetchNewsBySlug.pending, loading)
      .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedNews = action.payload;
      })
      .addCase(fetchNewsBySlug.rejected, failed);
  },
});

export const { clearNewsMessages } = newsSlice.actions;
export default newsSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { INews } from "@/modules/news";

interface NewsState {
  news: INews[]; // Public (site) için
  newsAdmin: INews[]; // Admin panel için
  selected: INews | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: NewsState = {
  news: [],
  newsAdmin: [],
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

export const fetchNews = createAsyncThunk<INews[]>(
  "news/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/news`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

export const fetchAllNewsAdmin = createAsyncThunk<INews[]>(
  "news/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/news/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

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
    return res.data;
  }
);

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
    return res.data;
  }
);

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
    return res.data;
  }
);

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

// --- Slice ---

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearNewsMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedNews(state, action: PayloadAction<INews | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: NewsState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: NewsState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    // --- Public List ---
    builder
      .addCase(fetchNews.pending, startLoading)
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, setError);

    // --- Admin List ---
    builder
      .addCase(fetchAllNewsAdmin.pending, startLoading)
      .addCase(fetchAllNewsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.newsAdmin = action.payload;
      })
      .addCase(fetchAllNewsAdmin.rejected, setError);

    // --- Admin Create ---
    builder
      .addCase(createNews.pending, startLoading)
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Article created successfully.";
        if (action.payload?.data) {
          state.newsAdmin.unshift(action.payload.data);
        }
      })
      .addCase(createNews.rejected, setError);

    // --- Admin Update ---
    builder
      .addCase(updateNews.pending, startLoading)
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.newsAdmin.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.newsAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateNews.rejected, setError);

    // --- Admin Delete ---
    builder
      .addCase(deleteNews.pending, startLoading)
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.newsAdmin = state.newsAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteNews.rejected, setError);

    // --- Admin Toggle Publish ---
    builder
      .addCase(togglePublishNews.pending, startLoading)
      .addCase(togglePublishNews.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.newsAdmin.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.newsAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishNews.rejected, setError);

    // --- Single Fetch (slug) ---
    builder
      .addCase(fetchNewsBySlug.pending, startLoading)
      .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchNewsBySlug.rejected, setError);
  },
});

export const { clearNewsMessages, setSelectedNews } = newsSlice.actions;
export default newsSlice.reducer;

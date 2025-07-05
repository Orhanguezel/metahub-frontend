import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { INews } from "@/modules/news/types";

interface NewsState {
  news: INews[];
  selected: INews | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: NewsState = {
  news: [],
  selected: null,
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

export const fetchNews = createAsyncThunk<INews[]>(
  "news/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/news`, null, thunkAPI.rejectWithValue);
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
    return res.data; // backend: { success: true, message: "..." }
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

export const fetchAllNewsAdmin = createAsyncThunk(
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

    builder
      .addCase(fetchNews.pending, startLoading)
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, setError)

      .addCase(fetchAllNewsAdmin.pending, startLoading)
      .addCase(fetchAllNewsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchAllNewsAdmin.rejected, setError)

      .addCase(createNews.pending, startLoading)
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Article created successfully.";
        if (action.payload?.data) {
          state.news.unshift(action.payload.data);
        }
      })
      .addCase(createNews.rejected, setError)

      .addCase(updateNews.pending, startLoading)
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.news.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.news[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateNews.rejected, setError)

      .addCase(deleteNews.pending, startLoading)
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = state.news.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteNews.rejected, setError)

      .addCase(togglePublishNews.pending, startLoading)
      .addCase(togglePublishNews.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.news.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.news[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishNews.rejected, setError)

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

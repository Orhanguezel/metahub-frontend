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
    clearNewsMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedNews: (state, action: PayloadAction<INews | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: NewsState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: NewsState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchNews.pending, setLoading)
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllNewsAdmin.pending, setLoading)
      .addCase(fetchAllNewsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.newsAdmin = action.payload;
      })
      .addCase(fetchAllNewsAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createNews.pending, setLoading)
      .addCase(createNews.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.newsAdmin.unshift(action.payload);
        state.successMessage = "News successfully created.";
      })
      .addCase(createNews.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateNews.pending, setLoading)
      .addCase(updateNews.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.newsAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.newsAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "News successfully updated.";
      })
      .addCase(updateNews.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteNews.pending, setLoading)
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.newsAdmin = state.newsAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteNews.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishNews.pending, setLoading)
      .addCase(togglePublishNews.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.newsAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.newsAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Publish status updated.";
      })
      .addCase(togglePublishNews.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchNewsBySlug.pending, setLoading)
      .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchNewsBySlug.rejected, setError);
  },
});

export const { clearNewsMessages, setSelectedNews } = newsSlice.actions;
export default newsSlice.reducer;

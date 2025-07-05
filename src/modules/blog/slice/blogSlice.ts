import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IBlog } from "@/modules/blog/types";

interface BlogState {
  blog: IBlog[];
  selected: IBlog | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BlogState = {
  blog: [],
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

export const fetchBlog = createAsyncThunk<IBlog[]>(
  "blog/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/blog`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

export const createBlog = createAsyncThunk(
  "blog/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/blog/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // backend: { success: true, message: "..." }
  }
);

export const updateBlog = createAsyncThunk(
  "blog/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/blog/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const deleteBlog = createAsyncThunk(
  "blog/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/blog/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const fetchAllBlogAdmin = createAsyncThunk(
  "blog/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/blog/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const togglePublishBlog = createAsyncThunk(
  "blog/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/blog/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  "blog/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/blog/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---
const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedBlog(state, action: PayloadAction<IBlog | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: BlogState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: BlogState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    builder
      .addCase(fetchBlog.pending, startLoading)
      .addCase(fetchBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blog = action.payload;
      })
      .addCase(fetchBlog.rejected, setError)

      .addCase(fetchAllBlogAdmin.pending, startLoading)
      .addCase(fetchAllBlogAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.blog = action.payload;
      })
      .addCase(fetchAllBlogAdmin.rejected, setError)

      .addCase(createBlog.pending, startLoading)
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Article created successfully.";
        if (action.payload?.data) {
          state.blog.unshift(action.payload.data);
        }
      })
      .addCase(createBlog.rejected, setError)

      .addCase(updateBlog.pending, startLoading)
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.blog.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.blog[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateBlog.rejected, setError)

      .addCase(deleteBlog.pending, startLoading)
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blog = state.blog.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteBlog.rejected, setError)

      .addCase(togglePublishBlog.pending, startLoading)
      .addCase(togglePublishBlog.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.blog.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.blog[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishBlog.rejected, setError)

      .addCase(fetchBlogBySlug.pending, startLoading)
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, setError);
  },
});

export const { clearBlogMessages, setSelectedBlog } = blogSlice.actions;
export default blogSlice.reducer;

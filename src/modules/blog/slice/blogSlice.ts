import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IBlog } from "@/modules/blog/types/blog";

interface BlogState {
  blogs: IBlog[];
  selected: IBlog | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BlogState = {
  blogs: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🌐 Public - fetch by language
export const fetchBlogs = createAsyncThunk(
  "blog/fetchAll",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/blog?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create blog
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
    return res.data;
  }
);

// ✏️ Update blog
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

// ❌ Delete blog
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

// 🛠 Admin - fetch all blogs
export const fetchAllBlogsAdmin = createAsyncThunk(
  "blog/fetchAllAdmin",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/blog/admin?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🔁 Admin - publish toggle
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

// 🌐 Public - Fetch By Slug
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

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: BlogState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: BlogState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      // 🌐 Fetch Public
      .addCase(fetchBlogs.pending, loading)
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, failed)

      // ➕ Create
      .addCase(createBlog.pending, loading)
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Blog created successfully.";
        const item = action.payload;
        if (item && item._id) state.blogs.unshift(item);
      })
      .addCase(createBlog.rejected, failed)

      // ✏️ Update
      .addCase(updateBlog.pending, loading)
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.blogs.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.blogs[index] = updated;
        if (state.selected?._id === updated._id) {
          state.selected = updated;
        }
        state.successMessage = "Blog updated successfully.";
      })
      .addCase(updateBlog.rejected, failed)

      // ❌ Delete
      .addCase(deleteBlog.pending, loading)
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.filter((n) => n._id !== action.payload.id);
        state.successMessage = "Blog deleted successfully.";
      })
      .addCase(deleteBlog.rejected, failed)

      // 🛠 Fetch All Admin
      .addCase(fetchAllBlogsAdmin.pending, loading)
      .addCase(fetchAllBlogsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchAllBlogsAdmin.rejected, failed)

      // 🔁 Toggle Publish
      .addCase(togglePublishBlog.pending, loading)
      .addCase(togglePublishBlog.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.blogs.findIndex((n) => n._id === updated._id);
        if (index !== -1) state.blogs[index] = updated;
        if (state.selected?._id === updated._id) {
          state.selected = updated;
        }
        state.successMessage = updated.isPublished
          ? "Blog published successfully."
          : "Blog unpublished successfully.";
      })
      .addCase(togglePublishBlog.rejected, failed)

      .addCase(fetchBlogBySlug.pending, loading)
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, failed);
  },
});

export const { clearBlogMessages } = blogSlice.actions;
export default blogSlice.reducer;

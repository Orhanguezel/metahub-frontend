// src/store/blogSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { IBlog } from "@/types/blog";

interface BlogState {
  blogs: IBlog[];
  selectedBlog: IBlog | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BlogState = {
  blogs: [],
  selectedBlog: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 📥 Blog oluşturma (Çok dilli + görsel)
export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (formData: FormData, thunkAPI) =>
    await apiCall("post", "/blogs", formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// 📋 Blogları getirme (dil & kategori filtreli)
export const fetchBlogs = createAsyncThunk<
  IBlog[],
  { category?: string; language?: string } | undefined
>("blog/fetchBlogs", async (params, thunkAPI) => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.language) queryParams.append("language", params.language);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  return await apiCall("get", `/blogs${query}`, null, thunkAPI.rejectWithValue);
});

// 🔍 Slug ile blog getirme (frontend detay sayfası için)
export const fetchBlogBySlug = createAsyncThunk(
  "blog/fetchBlogBySlug",
  async (slug: string, thunkAPI) =>
    await apiCall("get", `/blogs/slug/${slug}`, null, thunkAPI.rejectWithValue)
);

// ✏️ Blog güncelleme (FormData)
export const updateBlog = createAsyncThunk(
  "blog/updateBlog",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) =>
    await apiCall("put", `/blogs/${id}`, formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ❌ Blog silme
export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/blogs/${id}`, null, thunkAPI.rejectWithValue)
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedBlog(state) {
      state.selectedBlog = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: BlogState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: BlogState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // CREATE
      .addCase(createBlog.pending, setLoading)
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Blog erfolgreich erstellt.";
        state.blogs.unshift(action.payload.blog);
      })
      .addCase(createBlog.rejected, setError)

      // GET ALL
      .addCase(fetchBlogs.pending, setLoading)
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, setError)

      // GET BY SLUG
      .addCase(fetchBlogBySlug.pending, setLoading)
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, setError)

      // UPDATE
      .addCase(updateBlog.pending, setLoading)
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Blog wurde aktualisiert.";
        const updated = action.payload.blog;
        const index = state.blogs.findIndex((b) => b._id === updated._id);
        if (index !== -1) state.blogs[index] = updated;
        if (state.selectedBlog?._id === updated._id) {
          state.selectedBlog = updated;
        }
      })
      .addCase(updateBlog.rejected, setError)

      // DELETE
      .addCase(deleteBlog.pending, setLoading)
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Blog wurde gelöscht.";
        state.blogs = state.blogs.filter((b) => b._id !== action.meta.arg);
      })
      .addCase(deleteBlog.rejected, setError);
  },
});

export const { clearBlogMessages, clearSelectedBlog } = blogSlice.actions;
export default blogSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Iradonarprod } from "@/modules/product/types/radonarprod";

interface RadonarprodState {
  radonarprod: Iradonarprod[];
  selected: Iradonarprod | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: RadonarprodState = {
  radonarprod: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🌐 Public - Get All
export const fetchRadonarProd = createAsyncThunk(
  "radonarprod/fetchPublic",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/radonarprod?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🌐 Public - Get By Slug
export const fetchRadonarProdBySlug = createAsyncThunk(
  "radonarprod/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/radonarprod/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🌐 Public - Get By ID
export const fetchRadonarProdByIdPublic = createAsyncThunk(
  "radonarprod/fetchByIdPublic",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/radonarprod/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🛠 Admin - Get All
export const fetchRadonarProdAdmin = createAsyncThunk(
  "radonarprod/fetchAdmin",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/radonarprod/admin?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🛠 Admin - Get by ID
export const fetchRadonarProdByIdAdmin = createAsyncThunk(
  "radonarprod/fetchByIdAdmin",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/radonarprod/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create
export const createRadonarProd = createAsyncThunk(
  "radonarprod/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/radonarprod/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

// ✏️ Update
export const updateRadonarProd = createAsyncThunk(
  "radonarprod/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/radonarprod/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

// ❌ Delete
export const deleteRadonarProd = createAsyncThunk(
  "radonarprod/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/radonarprod/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

// 🔁 Toggle Publish
export const togglePublishRadonarProd = createAsyncThunk(
  "radonarprod/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/radonarprod/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

const radonarprodSlice = createSlice({
  name: "radonarprod",
  initialState,
  reducers: {
    clearRadonarProdMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedRadonarProd: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: RadonarprodState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: RadonarprodState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      // 🌐 Public
      .addCase(fetchRadonarProd.pending, loading)
      .addCase(fetchRadonarProd.fulfilled, (state, action) => {
        state.loading = false;
        state.radonarprod = action.payload;
      })
      .addCase(fetchRadonarProd.rejected, failed)

      .addCase(fetchRadonarProdBySlug.pending, loading)
      .addCase(fetchRadonarProdBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchRadonarProdBySlug.rejected, failed)

      .addCase(fetchRadonarProdByIdPublic.pending, loading)
      .addCase(fetchRadonarProdByIdPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchRadonarProdByIdPublic.rejected, failed)

      // 🛠 Admin
      .addCase(fetchRadonarProdAdmin.pending, loading)
      .addCase(fetchRadonarProdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.radonarprod = action.payload;
      })
      .addCase(fetchRadonarProdAdmin.rejected, failed)

      .addCase(fetchRadonarProdByIdAdmin.pending, loading)
      .addCase(fetchRadonarProdByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchRadonarProdByIdAdmin.rejected, failed)

      // ➕ Create
      .addCase(createRadonarProd.pending, loading)
      .addCase(createRadonarProd.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Product created successfully.";
        state.radonarprod.unshift(action.payload);
      })
      .addCase(createRadonarProd.rejected, failed)

      // ✏️ Update
      .addCase(updateRadonarProd.pending, loading)
      .addCase(updateRadonarProd.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Product updated successfully.";
        const updated = action.payload;
        const index = state.radonarprod.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.radonarprod[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      .addCase(updateRadonarProd.rejected, failed)

      // ❌ Delete
      .addCase(deleteRadonarProd.pending, loading)
      .addCase(deleteRadonarProd.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Product deleted successfully.";
        state.radonarprod = state.radonarprod.filter(
          (p) => p._id !== action.payload.id
        );
      })
      .addCase(deleteRadonarProd.rejected, failed)

      // 🔁 Toggle Publish
      .addCase(togglePublishRadonarProd.pending, loading)
      .addCase(togglePublishRadonarProd.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.radonarprod.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.radonarprod[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = updated.isPublished
          ? "Product published."
          : "Product unpublished.";
      })
      .addCase(togglePublishRadonarProd.rejected, failed);
  },
});

export const { clearRadonarProdMessages, clearSelectedRadonarProd } =
  radonarprodSlice.actions;
export default radonarprodSlice.reducer;

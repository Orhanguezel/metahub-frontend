import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IBikes } from "../types";
import type { TranslatedLabel } from "@/types/common";

interface BikesState {
  bikes: IBikes[];          // Public (site)
  bikesAdmin: IBikes[];     // Admin panel
  selected: IBikes | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BikesState = {
  bikes: [],
  bikesAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

// 🌍 Public - Get All
export const fetchBikes = createAsyncThunk(
  "bikes/fetchPublic",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/bikes`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🌍 Public - Get By Slug
export const fetchBikesBySlug = createAsyncThunk(
  "bikes/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/bikes/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🌍 Public - Get By ID
export const fetchBikesByIdPublic = createAsyncThunk(
  "bikes/fetchByIdPublic",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/bikes/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🛠 Admin - Get All
export const fetchBikesAdmin = createAsyncThunk(
  "bikes/fetchAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/bikes/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🛠 Admin - Get By ID
export const fetchBikesByIdAdmin = createAsyncThunk(
  "bikes/fetchByIdAdmin",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/bikes/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create (Admin)
export const createBikes = createAsyncThunk(
  "bikes/create",
  async (
    data: FormData | { name: Partial<TranslatedLabel>; description?: Partial<TranslatedLabel>; [key: string]: any },
    thunkAPI
  ) => {
    const isFormData = typeof window !== "undefined" && data instanceof FormData;
    const res = await apiCall(
      "post",
      "/bikes/admin",
      data,
      thunkAPI.rejectWithValue,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }
);

// ✏️ Update (Admin)
export const updateBikes = createAsyncThunk(
  "bikes/update",
  async (
    params: {
      id: string;
      data: FormData | {
        name?: Partial<TranslatedLabel>;
        description?: Partial<TranslatedLabel>;
        [key: string]: any;
      };
    },
    thunkAPI
  ) => {
    const { id, data } = params;
    const isFormData = typeof window !== "undefined" && data instanceof FormData;
    const res = await apiCall(
      "put",
      `/bikes/admin/${id}`,
      data,
      thunkAPI.rejectWithValue,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return res.data;
  }
);

// ❌ Delete (Admin)
export const deleteBikes = createAsyncThunk(
  "bikes/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/bikes/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

// 🔁 Toggle Publish (Admin)
export const togglePublishBikes = createAsyncThunk(
  "bikes/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/bikes/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  }
);

const bikesSlice = createSlice({
  name: "bikes",
  initialState,
  reducers: {
    clearBikesMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedBikes: (state) => {
      state.selected = null;
    },
    setSelectedBikes: (state, action: PayloadAction<IBikes | null>) => {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: BikesState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: BikesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    // 🌍 PUBLIC reducers (bikes)
    builder
      .addCase(fetchBikes.pending, loading)
      .addCase(fetchBikes.fulfilled, (state, action) => {
        state.loading = false;
        state.bikes = action.payload;
      })
      .addCase(fetchBikes.rejected, failed)

      .addCase(fetchBikesBySlug.pending, loading)
      .addCase(fetchBikesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBikesBySlug.rejected, failed)

      .addCase(fetchBikesByIdPublic.pending, loading)
      .addCase(fetchBikesByIdPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBikesByIdPublic.rejected, failed);

    // 🛠 ADMIN reducers (bikesAdmin)
    builder
      .addCase(fetchBikesAdmin.pending, loading)
      .addCase(fetchBikesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.bikesAdmin = action.payload;
      })
      .addCase(fetchBikesAdmin.rejected, failed)

      .addCase(fetchBikesByIdAdmin.pending, loading)
      .addCase(fetchBikesByIdAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBikesByIdAdmin.rejected, failed)

      // ➕ Create
      .addCase(createBikes.pending, loading)
      .addCase(createBikes.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Bike created successfully.";
        if (action.payload?._id) {
          state.bikesAdmin.unshift(action.payload);
        }
      })
      .addCase(createBikes.rejected, failed)

      // ✏️ Update
      .addCase(updateBikes.pending, loading)
      .addCase(updateBikes.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Bike updated successfully.";
        const updated = action.payload;
        const index = state.bikesAdmin.findIndex((b) => b._id === updated._id);
        if (index !== -1) state.bikesAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
      })
      .addCase(updateBikes.rejected, failed)

      // ❌ Delete
      .addCase(deleteBikes.pending, loading)
      .addCase(deleteBikes.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Bike deleted successfully.";
        state.bikesAdmin = state.bikesAdmin.filter((b) => b._id !== action.payload.id);
      })
      .addCase(deleteBikes.rejected, failed)

      // 🔁 Toggle Publish
      .addCase(togglePublishBikes.pending, loading)
      .addCase(togglePublishBikes.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.bikesAdmin.findIndex((b) => b._id === updated._id);
        if (index !== -1) state.bikesAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = updated.isPublished ? "Bike published." : "Bike unpublished.";
      })
      .addCase(togglePublishBikes.rejected, failed);
  },
});

export const { clearBikesMessages, clearSelectedBikes, setSelectedBikes } = bikesSlice.actions;
export default bikesSlice.reducer;

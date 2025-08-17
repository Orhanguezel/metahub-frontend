import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { LibraryCategory, TranslatedField } from "@/modules/library";

interface CategoryState {
  categories: LibraryCategory[];
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}
const initialState: CategoryState = {
  categories: [],
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const pickData = (res: any) => res?.data?.data ?? res?.data ?? res;
const pickMessage = (res: any) => res?.data?.message ?? res?.message ?? null;

const BASE = "/librarycategory";

// Fetch
export const fetchLibraryCategories = createAsyncThunk<any, void, { rejectValue: string }>(
  "libraryCategory/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiCall("get", `${BASE}`, null, rejectWithValue);
      return pickData(res);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to fetch categories.");
    }
  }
);

// Create
export const createLibraryCategory = createAsyncThunk<any, { name: TranslatedField; description?: TranslatedField }, { rejectValue: string }>(
  "libraryCategory/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiCall("post", `${BASE}`, data, rejectWithValue);
      return res;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to create category.");
    }
  }
);

// Update
export const updateLibraryCategory = createAsyncThunk<
  any,
  { id: string; data: { name: TranslatedField; description?: TranslatedField } },
  { rejectValue: string }
>("libraryCategory/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await apiCall("put", `${BASE}/${id}`, data, rejectWithValue);
    return res;
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to update category.");
  }
});

// Delete
export const deleteLibraryCategory = createAsyncThunk<{ id: string; message?: string }, string, { rejectValue: string }>(
  "libraryCategory/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await apiCall("delete", `${BASE}/${id}`, null, rejectWithValue);
      return { id, message: pickMessage(res) || "Deleted." };
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to delete category.");
    }
  }
);

const libraryCategorySlice = createSlice({
  name: "libraryCategory",
  initialState,
  reducers: {
    clearLibraryCategoryMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    const start = (s: CategoryState) => {
      s.loading = true;
      s.status = "loading";
      s.error = null;
      s.successMessage = null;
    };
    const fail = (s: CategoryState, a: PayloadAction<any>) => {
      s.loading = false;
      s.status = "failed";
      s.error = (a.payload as any) || "Unknown error";
    };

    builder
      // fetch
      .addCase(fetchLibraryCategories.pending, start)
      .addCase(fetchLibraryCategories.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.categories = a.payload;
      })
      .addCase(fetchLibraryCategories.rejected, fail)
      // create
      .addCase(createLibraryCategory.pending, start)
      .addCase(createLibraryCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const item = pickData(a.payload);
        const msg = pickMessage(a.payload);
        if (item?._id) s.categories.unshift(item);
        s.successMessage = msg || "Category created.";
      })
      .addCase(createLibraryCategory.rejected, fail)
      // update
      .addCase(updateLibraryCategory.pending, start)
      .addCase(updateLibraryCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = pickData(a.payload);
        const msg = pickMessage(a.payload);
        const i = s.categories.findIndex((c) => c._id === updated?._id);
        if (i !== -1) s.categories[i] = updated;
        s.successMessage = msg || "Category updated.";
      })
      .addCase(updateLibraryCategory.rejected, fail)
      // delete
      .addCase(deleteLibraryCategory.pending, start)
      .addCase(deleteLibraryCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.categories = s.categories.filter((c) => c._id !== a.payload.id);
        s.successMessage = a.payload.message || "Category deleted.";
      })
      .addCase(deleteLibraryCategory.rejected, fail);
  },
});

export const { clearLibraryCategoryMessages } = libraryCategorySlice.actions;
export default libraryCategorySlice.reducer;

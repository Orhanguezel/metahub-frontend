import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ILibraryItem } from "@/types/library";

interface LibraryState {
  items: ILibraryItem[];
  selectedItem: ILibraryItem | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: LibraryState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Get all items
export const fetchLibraryItems = createAsyncThunk(
  "library/fetchAll",
  async (_, thunkAPI) => await apiCall("get", "/library", null, thunkAPI.rejectWithValue)
);

// ✅ Get by ID
export const fetchLibraryItemById = createAsyncThunk(
  "library/fetchById",
  async (id: string, thunkAPI) =>
    await apiCall("get", `/library/${id}`, null, thunkAPI.rejectWithValue)
);

// ✅ Create item
export const createLibraryItem = createAsyncThunk(
  "library/create",
  async (formData: FormData, thunkAPI) =>
    await apiCall("post", "/library", formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ✅ Update item
export const updateLibraryItem = createAsyncThunk(
  "library/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) =>
    await apiCall("put", `/library/${id}`, formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ✅ Delete item
export const deleteLibraryItem = createAsyncThunk(
  "library/delete",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/library/${id}`, null, thunkAPI.rejectWithValue)
);

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    clearLibraryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: LibraryState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: LibraryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchLibraryItems.pending, loadingReducer)
      .addCase(fetchLibraryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLibraryItems.rejected, errorReducer)

      .addCase(fetchLibraryItemById.pending, loadingReducer)
      .addCase(fetchLibraryItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchLibraryItemById.rejected, errorReducer)

      .addCase(createLibraryItem.pending, loadingReducer)
      .addCase(createLibraryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Datei wurde erfolgreich erstellt.";
        state.items.unshift(action.payload.item);
      })
      .addCase(createLibraryItem.rejected, errorReducer)

      .addCase(updateLibraryItem.pending, loadingReducer)
      .addCase(updateLibraryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Datei wurde aktualisiert.";
        const updated = action.payload.item;
        const index = state.items.findIndex((i) => i._id === updated._id);
        if (index !== -1) state.items[index] = updated;
      })
      .addCase(updateLibraryItem.rejected, errorReducer)

      .addCase(deleteLibraryItem.pending, loadingReducer)
      .addCase(deleteLibraryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Datei wurde gelöscht.";
        state.items = state.items.filter((i) => i._id !== action.payload?.item?._id);
      })
      .addCase(deleteLibraryItem.rejected, errorReducer);
  },
});

export const { clearLibraryMessages } = librarySlice.actions;
export default librarySlice.reducer;

// src/store/faqSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface FAQ {
  _id?: string;
  question: Record<string, string>;
  answer: Record<string, string>;
  category?: string;
  isActive?: boolean;
  isPublished?: boolean;
}

interface FAQState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  answer: string | null;
}

const initialState: FAQState = {
  faqs: [],
  loading: false,
  error: null,
  successMessage: null,
  answer: null,
};

// 📄 Get published FAQs (public)
export const fetchPublishedFAQs = createAsyncThunk(
  "faq/fetchPublishedFAQs",
  async (lang: string, thunkAPI) =>
    await apiCall("get", `/faq?lang=${lang}`, null, thunkAPI.rejectWithValue)
);

// ➕ Create new FAQ (admin)
export const createFAQ = createAsyncThunk(
  "faq/createFAQ",
  async (data: FAQ, thunkAPI) =>
    await apiCall("post", "/faq/admin", data, thunkAPI.rejectWithValue, true) // true = requiresAuth
);

// 🗑️ Delete FAQ (admin)
export const deleteFAQ = createAsyncThunk(
  "faq/deleteFAQ",
  async (id: string, thunkAPI) =>
    await apiCall(
      "delete",
      `/faq/admin/${id}`,
      null,
      thunkAPI.rejectWithValue,
      true
    )
);

// 📄 Get all FAQs (admin)
export const fetchAllFAQs = createAsyncThunk(
  "faq/fetchAllFAQs",
  async (_, thunkAPI) =>
    await apiCall("get", "/faq/admin", null, thunkAPI.rejectWithValue, true)
);

// askFAQ thunk'u slice'a eklenmeli
export const askFAQ = createAsyncThunk(
  "faq/askFAQ",
  async (data: { question: string; language: string }, thunkAPI) =>
    await apiCall("post", "/faq/ask", data, thunkAPI.rejectWithValue)
);

// 📝 Update FAQ (admin)
export const updateFAQ = createAsyncThunk(
  "faq/updateFAQ",
  async (data: { id: string; data: FAQ }, thunkAPI) =>
    await apiCall(
      "put",
      `/faq/admin/${data.id}`,
      data.data,
      thunkAPI.rejectWithValue,
      true
    )
);

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    clearFAQMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: FAQState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: FAQState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    // Fetch published
    builder
      .addCase(fetchPublishedFAQs.pending, loadingReducer)
      .addCase(fetchPublishedFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload.data;
      })
      .addCase(fetchPublishedFAQs.rejected, errorReducer);

    // Fetch all (admin)
    builder
      .addCase(fetchAllFAQs.pending, loadingReducer)
      .addCase(fetchAllFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload.data;
      })
      .addCase(fetchAllFAQs.rejected, errorReducer);

    // Create
    builder
      .addCase(createFAQ.pending, loadingReducer)
      .addCase(createFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs.unshift(action.payload.data);
        state.successMessage = "FAQ was successfully created.";
      })
      .addCase(createFAQ.rejected, errorReducer);

    // Delete
    builder
      .addCase(deleteFAQ.pending, loadingReducer)
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        const deletedId = action.meta.arg;
        state.loading = false;
        state.faqs = state.faqs.filter((f) => f._id !== deletedId);
        state.successMessage = "FAQ was successfully deleted.";
      })
      .addCase(deleteFAQ.rejected, errorReducer);

    // Ask FAQ
    builder
      .addCase(askFAQ.pending, (state) => {
        state.loading = true;
        state.answer = null;
        state.error = null;
      })
      .addCase(askFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.answer = action.payload.data; 
      })
      .addCase(askFAQ.rejected, errorReducer);

    // Update
    builder
      .addCase(updateFAQ.pending, loadingReducer)
      .addCase(updateFAQ.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFAQ = action.payload.data;
        const index = state.faqs.findIndex((f) => f._id === updatedFAQ._id);
        if (index !== -1) {
          state.faqs[index] = updatedFAQ;
        }
        state.successMessage = "FAQ was successfully updated.";
      })
      .addCase(updateFAQ.rejected, errorReducer);
  },
});

export const { clearFAQMessages } = faqSlice.actions;
export default faqSlice.reducer;

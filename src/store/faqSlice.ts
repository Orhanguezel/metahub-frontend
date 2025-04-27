import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  language?: "tr" | "en" | "de";
}

interface FAQState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  answer: string | null; // ✅ Ollama cevabı için
}

const initialState: FAQState = {
  faqs: [],
  loading: false,
  error: null,
  successMessage: null,
  answer: null,
};

// 📄 Tüm SSS'leri getir
export const fetchFAQs = createAsyncThunk(
  "faq/fetchFAQs",
  async (language: string = "en", thunkAPI) => {
    return await apiCall(
      "get",
      `/faqs?lang=${language}`,
      null,
      thunkAPI.rejectWithValue
    );
  }
);

// ➕ Yeni SSS oluştur
export const createFAQ = createAsyncThunk(
  "faq/createFAQ",
  async (
    data: {
      question: string;
      answer: string;
      category?: string;
      language?: string;
    },
    thunkAPI
  ) => await apiCall("post", "/faqs", data, thunkAPI.rejectWithValue)
);

// 🗑️ SSS sil
export const deleteFAQ = createAsyncThunk(
  "faq/deleteFAQ",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/faqs/${id}`, null, thunkAPI.rejectWithValue)
);

// ❓ SSS üzerinden soru sorma (Ollama + Pinecone)
export const askFAQ = createAsyncThunk(
  "faq/askFAQ",
  async (data: { question: string; language?: string }, thunkAPI) =>
    await apiCall("post", "/faqs/ask", data, thunkAPI.rejectWithValue)
);

// 🔄 SSS Güncelle
export const updateFAQ = createAsyncThunk(
  "faq/updateFAQ",
  async (
    data: {
      id: string;
      question: string;
      answer: string;
      category?: string;
      language?: string;
    },
    thunkAPI
  ) => await apiCall("put", `/faqs/${data.id}`, data, thunkAPI.rejectWithValue)
);

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    clearFAQMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.answer = null;
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

    // Fetch
    builder
      .addCase(fetchFAQs.pending, loadingReducer)
      .addCase(fetchFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload;
      })
      .addCase(fetchFAQs.rejected, errorReducer);

    // Create
    builder
      .addCase(createFAQ.pending, loadingReducer)
      .addCase(createFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs.unshift(action.payload.faq);
        state.successMessage = "FAQ wurde erfolgreich erstellt.";
      })
      .addCase(createFAQ.rejected, errorReducer);

    // Delete
    builder
      .addCase(deleteFAQ.pending, loadingReducer)
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = state.faqs.filter(
          (f) => f._id !== action.payload?.faq?._id
        );
        state.successMessage = "FAQ wurde gelöscht.";
      })
      .addCase(deleteFAQ.rejected, errorReducer);

    // Ask
    builder
      .addCase(askFAQ.pending, loadingReducer)
      .addCase(askFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.answer = action.payload.answer;
      })
      .addCase(askFAQ.rejected, errorReducer);
    // Update
    builder
      .addCase(updateFAQ.pending, loadingReducer)
      .addCase(updateFAQ.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.faq;
        const index = state.faqs.findIndex((f) => f._id === updated._id);
        if (index !== -1) {
          state.faqs[index] = updated;
        }
        state.successMessage = "FAQ wurde aktualisiert.";
      })
      .addCase(updateFAQ.rejected, errorReducer);
  },
});

export const { clearFAQMessages } = faqSlice.actions;
export default faqSlice.reducer;


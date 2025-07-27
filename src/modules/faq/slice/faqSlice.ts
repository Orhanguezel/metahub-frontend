import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IFaq } from "@/modules/faq/types";

// --- STATE ---
interface FAQState {
  faqs: IFaq[]; // 🌐 Public
  faqsAdmin: IFaq[]; // 🔐 Admin
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  answer: string | null; // 🤖 AI yanıtı
}

const initialState: FAQState = {
  faqs: [],
  faqsAdmin: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
  answer: null,
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

export const fetchFAQs = createAsyncThunk<IFaq[]>(
  "faq/fetchFAQs",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/faq", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

export const fetchAllFAQsAdmin = createAsyncThunk<IFaq[]>(
  "faq/fetchAllFAQsAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/faq/admin",
      null,
      thunkAPI.rejectWithValue,
      true
    );
    return res.data;
  }
);

export const createFAQ = createAsyncThunk<IFaq, IFaq>(
  "faq/createFAQ",
  async (data, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/faq/admin",
      data,
      thunkAPI.rejectWithValue,
      true
    );
    return res.data;
  }
);

export const updateFAQ = createAsyncThunk<
  IFaq,
  { id: string; data: Partial<IFaq> }
>("faq/updateFAQ", async ({ id, data }, thunkAPI) => {
  const res = await apiCall(
    "put",
    `/faq/admin/${id}`,
    data,
    thunkAPI.rejectWithValue,
    true
  );
  return res.data;
});

export const deleteFAQ = createAsyncThunk<
  { id: string; message: string },
  string
>("faq/deleteFAQ", async (id, thunkAPI) => {
  const res = await apiCall(
    "delete",
    `/faq/admin/${id}`,
    null,
    thunkAPI.rejectWithValue,
    true
  );
  return { id, message: res.data.message };
});

export const togglePublishFAQ = createAsyncThunk<
  IFaq,
  { id: string; isPublished: boolean }
>("faq/togglePublishFAQ", async ({ id, isPublished }, thunkAPI) => {
  // ↓↓ DİKKAT: JSON olarak gönderiyoruz ↓↓
  const res = await apiCall(
    "put",
    `/faq/admin/${id}`,
    { isPublished }, // ← JSON body!
    thunkAPI.rejectWithValue,
    true
  );
  return res.data;
});

export const askFAQ = createAsyncThunk<
  { answer: string },
  { question: string }
>("faq/askFAQ", async (data, thunkAPI) => {
  const res = await apiCall("post", "/faq/ask", data, thunkAPI.rejectWithValue);
  return res.data;
});

// --- Slice ---

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    clearFAQMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearAnswer: (state) => {
      state.answer = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: FAQState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: FAQState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchFAQs.pending, setLoading)
      .addCase(fetchFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.faqs = action.payload;
      })
      .addCase(fetchFAQs.rejected, setError);

    // 🔐 Admin
    builder
      .addCase(fetchAllFAQsAdmin.pending, setLoading)
      .addCase(fetchAllFAQsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.faqsAdmin = action.payload;
      })
      .addCase(fetchAllFAQsAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createFAQ.pending, setLoading)
      .addCase(createFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.faqsAdmin.unshift(action.payload);
        state.successMessage = "FAQ successfully created.";
      })
      .addCase(createFAQ.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateFAQ.pending, setLoading)
      .addCase(updateFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.faqsAdmin.findIndex((f) => f._id === updated._id);
        if (i !== -1) state.faqsAdmin[i] = updated;
        state.successMessage = "FAQ successfully updated.";
      })
      .addCase(updateFAQ.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteFAQ.pending, setLoading)
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.faqsAdmin = state.faqsAdmin.filter(
          (f) => f._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteFAQ.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishFAQ.pending, setLoading)
      .addCase(togglePublishFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.faqsAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.faqsAdmin[i] = updated;
        state.successMessage = "Publish status updated.";
      })

      .addCase(togglePublishFAQ.rejected, setError);

    // 🤖 Ask AI
    builder
      .addCase(askFAQ.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.answer = null;
        state.error = null;
      })
      .addCase(askFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.answer = action.payload?.answer ?? action.payload ?? "No answer provided.";
      })
      .addCase(askFAQ.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "AI service unavailable. Please try again later.";
      });
  },
});

export const { clearFAQMessages, clearAnswer } = faqSlice.actions;
export default faqSlice.reducer;

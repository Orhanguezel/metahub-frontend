// src/store/feedbackSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface Feedback {
  _id?: string;
  name: string;
  email: string;
  message: string;
  rating?: number;
  isPublished?: boolean;
  createdAt?: string;
}

interface FeedbackState {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: FeedbackState = {
  feedbacks: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 📩 Feedback gönder
export const createFeedback = createAsyncThunk(
  "feedback/createFeedback",
  async (data: { name: string; email: string; message: string; rating?: number }, thunkAPI) =>
    await apiCall("post", "/feedbacks", data, thunkAPI.rejectWithValue)
);

// 📄 Tüm geri bildirimleri getir
export const fetchFeedbacks = createAsyncThunk(
  "feedback/fetchFeedbacks",
  async (_, thunkAPI) =>
    await apiCall("get", "/feedbacks", null, thunkAPI.rejectWithValue)
);

// 🔄 Yayın durumu değiştir
export const togglePublishFeedback = createAsyncThunk(
  "feedback/togglePublishFeedback",
  async (id: string, thunkAPI) =>
    await apiCall("patch", `/feedbacks/publish/${id}`, null, thunkAPI.rejectWithValue)
);

// 🗑️ Geri bildirimi sil
export const deleteFeedback = createAsyncThunk(
  "feedback/deleteFeedback",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/feedbacks/${id}`, null, thunkAPI.rejectWithValue)
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearFeedbackMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: FeedbackState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: FeedbackState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    // Create
    builder.addCase(createFeedback.pending, loadingReducer);
    builder.addCase(createFeedback.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = "Vielen Dank für Ihr Feedback!";
      state.feedbacks.unshift(action.payload.feedback);
    });
    builder.addCase(createFeedback.rejected, errorReducer);

    // Get All
    builder.addCase(fetchFeedbacks.pending, loadingReducer);
    builder.addCase(fetchFeedbacks.fulfilled, (state, action) => {
      state.loading = false;
      state.feedbacks = action.payload;
    });
    builder.addCase(fetchFeedbacks.rejected, errorReducer);

    // Toggle publish
    builder.addCase(togglePublishFeedback.pending, loadingReducer);
    builder.addCase(togglePublishFeedback.fulfilled, (state, action) => {
      state.loading = false;
      const updated = action.payload.feedback;
      const index = state.feedbacks.findIndex((f) => f._id === updated._id);
      if (index !== -1) state.feedbacks[index] = updated;
      state.successMessage = "Feedback-Status wurde geändert.";
    });
    builder.addCase(togglePublishFeedback.rejected, errorReducer);

    // Delete
    builder.addCase(deleteFeedback.pending, loadingReducer);
    builder.addCase(deleteFeedback.fulfilled, (state, action) => {
      state.loading = false;
      const deletedId = action.payload.feedback?._id;
      state.feedbacks = state.feedbacks.filter((f) => f._id !== deletedId);
      state.successMessage = "Feedback wurde gelöscht.";
    });
    builder.addCase(deleteFeedback.rejected, errorReducer);
  },
});

export const { clearFeedbackMessages } = feedbackSlice.actions;
export default feedbackSlice.reducer;

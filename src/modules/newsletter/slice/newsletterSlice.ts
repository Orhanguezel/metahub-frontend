import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { INewsletter } from "@/modules/newsletter/types";

interface NewsletterState {
  subscribers: INewsletter[];
  subscribersAdmin: INewsletter[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  bulkStatus: "idle" | "loading" | "succeeded" | "failed";
  bulkResult: { sent: number; total: number } | null;
  singleStatus: "idle" | "loading" | "succeeded" | "failed";   // EKLENDİ
}

const initialState: NewsletterState = {
  subscribers: [],
  subscribersAdmin: [],
  loading: false,
  error: null,
  successMessage: null,
  deleteStatus: "idle",
  bulkStatus: "idle",
  bulkResult: null,
  singleStatus: "idle",            // EKLENDİ
};

// 1️⃣ Public: Abone ol
export const subscribeNewsletter = createAsyncThunk<
  INewsletter,
  { email: string; lang?: string; meta?: any }
>(
  "newsletter/subscribe",
  async (payload, thunkAPI) => {
    const res = await apiCall("post", "/newsletter", payload, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 2️⃣ Public: Abonelikten çık
export const unsubscribeNewsletter = createAsyncThunk<
  INewsletter,
  { email: string }
>(
  "newsletter/unsubscribe",
  async (payload, thunkAPI) => {
    const res = await apiCall("post", "/newsletter/unsubscribe", payload, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 3️⃣ Admin: Tüm aboneleri getir
export const fetchAllSubscribers = createAsyncThunk<INewsletter[]>(
  "newsletter/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/newsletter", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 4️⃣ Admin: Aboneyi sil
export const deleteSubscriber = createAsyncThunk<
  string,
  string
>(
  "newsletter/delete",
  async (id, thunkAPI) => {
    await apiCall("delete", `/newsletter/${id}`, null, thunkAPI.rejectWithValue);
    return id;
  }
);

// 5️⃣ Admin: Aboneyi manuel olarak onayla (verified)
export const verifySubscriber = createAsyncThunk<
  INewsletter,
  string
>(
  "newsletter/verify",
  async (id, thunkAPI) => {
    const res = await apiCall("patch", `/newsletter/${id}/verify`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 6️⃣ Admin: Toplu e-posta gönder
export const sendBulkNewsletter = createAsyncThunk<
  { sent: number; total: number },
  { subject: string; html: string; filter?: any }
>(
  "newsletter/sendBulk",
  async (payload, thunkAPI) => {
    const res = await apiCall("post", "/newsletter/send-bulk", payload, thunkAPI.rejectWithValue);
    // { sent, total, ... }
    return res.data;
  }
);

// 7️⃣ Admin: Tekil e-posta gönder (henüz kullanılmıyor, örnek için)
export const sendSingleNewsletter = createAsyncThunk<
  void,
  { id: string; subject: string; html: string }
>(
  "newsletter/sendSingle",
  async (payload, thunkAPI) => {
    await apiCall("post", `/newsletter/${payload.id}/send`, {
      subject: payload.subject,
      html: payload.html
    }, thunkAPI.rejectWithValue);
  }
);


const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    clearNewsletterState(state) {
      state.error = null;
      state.successMessage = null;
      state.deleteStatus = "idle";
      state.bulkStatus = "idle";
      state.bulkResult = null;
      state.singleStatus = "idle";  // EKLENDİ
    },
    clearNewsletterSubscribers(state) {
      state.subscribers = [];
      state.subscribersAdmin = [];
      state.error = null;
      state.successMessage = null;
      state.deleteStatus = "idle";
      state.bulkStatus = "idle";
      state.bulkResult = null;
      state.singleStatus = "idle";  // EKLENDİ
    }
  },
  extraReducers: (builder) => {
    builder
      // 1️⃣ Public: Abone ol
      .addCase(subscribeNewsletter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Subscribed successfully.";
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload) || "Subscription failed.";
      })

      // 2️⃣ Public: Abonelikten çık
      .addCase(unsubscribeNewsletter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unsubscribeNewsletter.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Unsubscribed successfully.";
      })
      .addCase(unsubscribeNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload) || "Unsubscribe failed.";
      })

      // 3️⃣ Admin: fetchAll (tüm aboneler)
      .addCase(fetchAllSubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscribers.fulfilled, (state, action) => {
        state.loading = false;
        state.subscribersAdmin = action.payload;
      })
      .addCase(fetchAllSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload) || "Failed to fetch subscribers.";
      })

      // 4️⃣ Admin: delete
      .addCase(deleteSubscriber.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
      })
      .addCase(deleteSubscriber.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteStatus = "succeeded";
        state.subscribersAdmin = state.subscribersAdmin.filter((s) => s._id !== action.payload);
        state.successMessage = "Subscriber deleted successfully.";
      })
      .addCase(deleteSubscriber.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = String(action.payload) || "Failed to delete subscriber.";
      })

      // 5️⃣ Admin: verify
      .addCase(verifySubscriber.fulfilled, (state, action) => {
        state.subscribersAdmin = state.subscribersAdmin.map((s) =>
          s._id === action.payload._id ? action.payload : s
        );
      })

      // 6️⃣ Admin: Bulk mail
      .addCase(sendBulkNewsletter.pending, (state) => {
        state.bulkStatus = "loading";
        state.error = null;
        state.bulkResult = null;
      })
      .addCase(sendBulkNewsletter.fulfilled, (state, action: PayloadAction<{ sent: number; total: number }>) => {
        state.bulkStatus = "succeeded";
        state.bulkResult = action.payload;
        state.successMessage = "Bulk email sent successfully.";
      })
      .addCase(sendBulkNewsletter.rejected, (state, action) => {
        state.bulkStatus = "failed";
        state.error = String(action.payload) || "Bulk email sending failed.";
      })
      // 7️⃣ Admin: Single send (not used yet)
      builder
      .addCase(sendSingleNewsletter.pending, (state) => {
        state.singleStatus = "loading";
        state.error = null;
      })
      .addCase(sendSingleNewsletter.fulfilled, (state) => {
        state.singleStatus = "succeeded";
        state.successMessage = "Single email sent successfully.";
      })
      .addCase(sendSingleNewsletter.rejected, (state, action) => {
        state.singleStatus = "failed";
        state.error = String(action.payload) || "Single email sending failed.";
      });
  }
});

export const { clearNewsletterState, clearNewsletterSubscribers } = newsletterSlice.actions;
export default newsletterSlice.reducer;

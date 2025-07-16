// src/store/bookingSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Booking, BookingFormInput, BookingStatus } from "../types";

interface BookingState {
  bookings: Booking[];// 🌍 Public bookings (Müşteri kendi rezervasyonlarını görür)
  bookingsAdmin: Booking[];// 🛠️ Admin bookings (Tüm rezervasyonlar)
  booking?: Booking;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: BookingState = {
  bookings: [],
  bookingsAdmin: [],
  booking: undefined,
  loading: false,
  error: null,
  successMessage: null,
  status: "idle",
};

// ✅ Create Booking
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (data: BookingFormInput, { rejectWithValue }) => {
    const res = await apiCall("post", "/booking", data, rejectWithValue);
    return res; // direkt backend response döndür
  }
);

// 2️⃣ Get All Bookings (Admin)
export const fetchBookingsAdmin = createAsyncThunk(
  "booking/fetchBookingsAdmin",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/booking/admin", null, rejectWithValue);
    return Array.isArray(res.data) ? res.data : [];
  }
);

// 3️⃣ Get All Bookings (Public - user'a özel veya public) — gerekiyorsa
export const fetchBookings = createAsyncThunk(
  "booking/fetchBookings",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/booking", null, rejectWithValue);
    return Array.isArray(res.data) ? res.data : [];
  }
);

// 4️⃣ Get Booking by ID (Admin)
export const fetchBookingById = createAsyncThunk(
  "booking/fetchBookingById",
  async (id: string, { rejectWithValue }) => {
    const res = await apiCall(
      "get",
      `/booking/admin/${id}`,
      null,
      rejectWithValue
    );
    return res.data;
  }
);

// 5️⃣ Update Booking Status (Admin)
export const updateBookingStatus = createAsyncThunk(
  "booking/updateBookingStatus",
  async (
    {
      id,
      status,
    }: { id: string; status: BookingStatus },
    { rejectWithValue }
  ) => {
    const res = await apiCall(
      "put",
      `/booking/admin/${id}/status`,
      { status },
      rejectWithValue
    );
    return { ...res.booking, successMessage: res.message };
  }
);

// 6️⃣ Delete Booking (Admin)
export const deleteBooking = createAsyncThunk(
  "booking/deleteBooking",
  async (id: string, { rejectWithValue }) => {
    const res = await apiCall(
      "delete",
      `/booking/admin/${id}`,
      null,
      rejectWithValue
    );
    return { id, successMessage: res.message };
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Public booking işlemleri
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || null; // backend mesajı
        if (action.payload?.booking?._id) {
          state.bookings.unshift(action.payload.booking);
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          (typeof action.error?.message === "string" ? action.error.message : null);
      })
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload || [];
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Could not fetch bookings.";
      });

    // Admin booking işlemleri
    builder
      .addCase(fetchBookingsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingsAdmin = action.payload || [];
      })
      .addCase(fetchBookingsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Could not fetch admin bookings.";
      })

      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.booking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Could not fetch booking.";
      })

      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.successMessage || "Booking status updated.";
        const updated = action.payload;
        const index = state.bookingsAdmin.findIndex((b) => b._id === updated._id);
        if (index !== -1) state.bookingsAdmin[index] = updated;
        if (state.booking && state.booking._id === updated._id) {
          state.booking = updated;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          "Could not update booking status.";
      })

      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.successMessage || "Booking deleted successfully.";
        state.bookingsAdmin = state.bookingsAdmin.filter(
          (b) => b._id !== action.payload.id
        );
        if (state.booking && state.booking._id === action.payload.id) {
          state.booking = undefined;
        }
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Could not delete booking.";
      });
  },
});

export const { clearBookingMessages } = bookingSlice.actions;
export default bookingSlice.reducer;

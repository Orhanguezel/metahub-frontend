// src/store/bookingSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Booking, BookingFormInput } from "@/modules/booking";
import type { SupportedLocale } from "@/types/common";

interface BookingState {
  bookings: Booking[];
  booking?: Booking;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BookingState = {
  bookings: [],
  booking: undefined,
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ 1. Create Booking (Public)
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (data: BookingFormInput, { rejectWithValue }) => {
    const res = await apiCall("post", "/booking", data, rejectWithValue);
    // Backend: { success, message, booking }
    return { ...res.booking, successMessage: res.message };
  }
);

// ✅ 2. Get All Bookings (Admin)
export const fetchBookings = createAsyncThunk(
  "booking/fetchBookings",
  async (params: { language: SupportedLocale }, { rejectWithValue }) => {
    const res = await apiCall("get", "/booking/admin", params, rejectWithValue);
    return Array.isArray(res.data) ? res.data : [];
  }
);

// ✅ 3. Get Booking by ID (Admin)
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

// ✅ 4. Update Booking Status (Admin)
export const updateBookingStatus = createAsyncThunk(
  "booking/updateBookingStatus",
  async (
    {
      id,
      status,
    }: { id: string; status: "pending" | "confirmed" | "cancelled" },
    { rejectWithValue }
  ) => {
    const res = await apiCall(
      "put",
      `/booking/admin/${id}/status`,
      { status },
      rejectWithValue
    );
    // Backend: { success, message, booking }
    return { ...res.booking, successMessage: res.message };
  }
);

// ✅ 5. Delete Booking (Admin)
export const deleteBooking = createAsyncThunk(
  "booking/deleteBooking",
  async (id: string, { rejectWithValue }) => {
    const res = await apiCall(
      "delete",
      `/booking/admin/${id}`,
      null,
      rejectWithValue
    );
    // Backend: { success, message }
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
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.successMessage || "Booking created successfully.";
        if (action.payload && action.payload._id) {
          state.bookings.unshift(action.payload);
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Booking could not be created.";
      })

      // Fetch Bookings
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
      })

      // Fetch Booking by ID
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

      // Update Booking Status
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
        const index = state.bookings.findIndex((b) => b._id === updated._id);
        if (index !== -1) state.bookings[index] = updated;
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

      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.successMessage || "Booking deleted successfully.";
        state.bookings = state.bookings.filter(
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

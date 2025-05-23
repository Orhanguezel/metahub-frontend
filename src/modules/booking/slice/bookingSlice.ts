// src/store/bookingSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Booking, BookingFormInput } from "@/modules/booking";

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

// ✅ Create Booking (Public)
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (data: BookingFormInput, { rejectWithValue }) => {
    const res = await apiCall("post", "/booking", data, rejectWithValue);
    return res.data.booking;
  }
);

// ✅ Get All Bookings (Admin)
export const fetchBookings = createAsyncThunk(
  "booking/fetchBookings",
  async (params: { language: "tr" | "en" | "de" }, { rejectWithValue }) => {
    const res = await apiCall("get", "/booking/admin", params, rejectWithValue);
    return res.data.data;
  }
);

// ✅ Get Booking by ID (Admin)
export const fetchBookingById = createAsyncThunk(
  "booking/fetchBookingById",
  async (id: string, { rejectWithValue }) => {
    const res = await apiCall("get", `/booking/admin/${id}`, null, rejectWithValue);
    return res.data.data;
  }
);

// ✅ Update Booking Status (Admin)
export const updateBookingStatus = createAsyncThunk(
  "booking/updateBookingStatus",
  async (
    { id, status }: { id: string; status: "pending" | "confirmed" | "cancelled" },
    { rejectWithValue }
  ) => {
    const res = await apiCall("put", `/booking/admin/${id}/status`, { status }, rejectWithValue);
    return res.data.booking;
  }
);

// ✅ Delete Booking (Admin)
export const deleteBooking = createAsyncThunk(
  "booking/deleteBooking",
  async (id: string, { rejectWithValue }) => {
    const res = await apiCall("delete", `/booking/admin/${id}`, null, rejectWithValue);
    return res.data;
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
    const loadingReducer = (state: BookingState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: BookingState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Unknown error";
    };

    builder
      .addCase(createBooking.pending, loadingReducer)
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Booking created successfully.";
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, errorReducer)

      .addCase(fetchBookings.pending, loadingReducer)
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBookings.rejected, errorReducer)

      .addCase(fetchBookingById.pending, loadingReducer)
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.booking = action.payload?._id ? action.payload : undefined;
      })
      .addCase(fetchBookingById.rejected, errorReducer)

      .addCase(updateBookingStatus.pending, loadingReducer)
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Booking status updated.";
        const updated = action.payload;
        const index = state.bookings.findIndex(b => b._id === updated._id);
        if (index !== -1) state.bookings[index] = updated;
      })
      .addCase(updateBookingStatus.rejected, errorReducer)

      .addCase(deleteBooking.pending, loadingReducer)
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Booking deleted successfully.";
        state.bookings = state.bookings.filter((b) => b._id !== action.meta.arg);
      })
      .addCase(deleteBooking.rejected, errorReducer);
  },
});

export const { clearBookingMessages } = bookingSlice.actions;
export default bookingSlice.reducer;

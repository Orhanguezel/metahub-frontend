import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { RequestOfferPayload } from "@/modules/offer/types"; // ← TYPE BURADAN

interface RequestOfferState {
  loading: boolean;
  successMessage: string | null;
  error: string | null;
}

const initialState: RequestOfferState = {
  loading: false,
  successMessage: null,
  error: null,
};

export const sendRequestOffer = createAsyncThunk<
  { message: string },
  RequestOfferPayload,
  { rejectValue: { message: string } }
>(
  "requestOffer/sendRequestOffer",
  async (payload, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/offer/request-offer",
      payload,
      thunkAPI.rejectWithValue
    );
    if (!res.success)
      return thunkAPI.rejectWithValue({ message: res.message || "İletilemedi." });
    return { message: res.message || "Talebiniz iletildi." };
  }
);

const requestOfferSlice = createSlice({
  name: "requestOffer",
  initialState,
  reducers: {
    clearRequestOfferMessages(state) {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendRequestOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(sendRequestOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(sendRequestOffer.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message || "Talebiniz gönderilemedi.";
      });
  },
});

export const { clearRequestOfferMessages } = requestOfferSlice.actions;
export default requestOfferSlice.reducer;

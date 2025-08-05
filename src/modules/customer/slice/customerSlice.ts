import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { ICustomer } from "../types";

// --- State ---
interface CustomerState {
  customers: ICustomer[];
  customerAdmin: ICustomer[];
  selected: ICustomer | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}
const initialState: CustomerState = {
  customers: [],
  customerAdmin: [],
  selected: null,
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// --- Async Thunks ---

// 1️⃣ ADMIN - Tüm müşteriler (admin)
export const fetchCustomersAdmin = createAsyncThunk<
  ICustomer[],
  void,
  { rejectValue: string }
>("customer/fetchCustomersAdmin", async (_, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", "/customer/admin", null, rejectWithValue);
    return result.data as ICustomer[];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Admin müşteri listesi getirilemedi.");
  }
});

// 2️⃣ ADMIN - Tek müşteri getir (admin)
export const fetchCustomerById = createAsyncThunk<
  ICustomer,
  string,
  { rejectValue: string }
>("customer/fetchCustomerById", async (id, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", `/customer/admin/${id}`, null, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri bulunamadı.");
  }
});

// 3️⃣ ADMIN - Müşteri oluştur (admin)
export const createCustomerAdmin = createAsyncThunk<
  ICustomer,
  Partial<ICustomer>,
  { rejectValue: string }
>("customer/createCustomerAdmin", async (data, { rejectWithValue }) => {
  try {
    const result = await apiCall("post", "/customer/admin", data, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri oluşturulamadı.");
  }
});

// 4️⃣ ADMIN - Müşteri güncelle (admin)
export const updateCustomerAdmin = createAsyncThunk<
  ICustomer,
  { id: string; data: Partial<ICustomer> },
  { rejectValue: string }
>("customer/updateCustomerAdmin", async ({ id, data }, { rejectWithValue }) => {
  try {
    const result = await apiCall("put", `/customer/admin/${id}`, data, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri güncellenemedi.");
  }
});

// 5️⃣ ADMIN - Müşteri sil (admin)
export const deleteCustomerAdmin = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("customer/deleteCustomerAdmin", async (id, { rejectWithValue }) => {
  try {
    await apiCall("delete", `/customer/admin/${id}`, null, rejectWithValue);
    return id;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri silinemedi.");
  }
});

// --- PUBLIC --- Kendi müşteri kaydını oku/güncelle (login müşteri)
export const fetchCustomerPublicById = createAsyncThunk<
  ICustomer,
  string,
  { rejectValue: string }
>("customer/fetchCustomerPublicById", async (id, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", `/customer/public/${id}`, null, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri bulunamadı.");
  }
});

export const updateCustomerPublic = createAsyncThunk<
  ICustomer,
  { id: string; data: Partial<ICustomer> },
  { rejectValue: string }
>("customer/updateCustomerPublic", async ({ id, data }, { rejectWithValue }) => {
  try {
    const result = await apiCall("put", `/customer/public/${id}`, data, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Bilgiler güncellenemedi.");
  }
});


// --- SLICE ---
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearCustomerMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedCustomer(state, action: PayloadAction<ICustomer | null>) {
      state.selected = action.payload;
    },
    clearCustomers(state) {
      state.customers = [];
      state.customerAdmin = [];
      state.selected = null;
      state.status = "idle";
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- ADMIN ---
      .addCase(fetchCustomersAdmin.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(fetchCustomersAdmin.fulfilled, (state, action) => {
        state.loading = false; state.status = "succeeded"; state.customerAdmin = action.payload;
      })
      .addCase(fetchCustomersAdmin.rejected, (state, action) => {
        state.loading = false; state.status = "failed"; state.error = action.payload || "Admin müşteri listesi getirilemedi.";
      })
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false; state.status = "succeeded"; state.selected = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false; state.status = "failed"; state.error = action.payload || "Müşteri bulunamadı.";
      })
      .addCase(createCustomerAdmin.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null; state.successMessage = null;
      })
      .addCase(createCustomerAdmin.fulfilled, (state, action) => {
        state.loading = false; state.status = "succeeded";
        state.customerAdmin.unshift(action.payload);
        state.successMessage = "Müşteri başarıyla eklendi.";
      })
      .addCase(createCustomerAdmin.rejected, (state, action) => {
        state.loading = false; state.status = "failed"; state.error = action.payload || "Müşteri oluşturulamadı.";
      })
      .addCase(updateCustomerAdmin.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null; state.successMessage = null;
      })
      .addCase(updateCustomerAdmin.fulfilled, (state, action) => {
        state.loading = false; state.status = "succeeded"; state.successMessage = "Müşteri güncellendi.";
        state.customerAdmin = state.customerAdmin.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateCustomerAdmin.rejected, (state, action) => {
        state.loading = false; state.status = "failed"; state.error = action.payload || "Müşteri güncellenemedi.";
      })
      .addCase(deleteCustomerAdmin.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null; state.successMessage = null;
      })
      .addCase(deleteCustomerAdmin.fulfilled, (state, action) => {
        state.loading = false; state.status = "succeeded"; state.successMessage = "Müşteri silindi.";
        state.customerAdmin = state.customerAdmin.filter((c) => c._id !== action.payload);
        if (state.selected?._id === action.payload) state.selected = null;
      })
      .addCase(deleteCustomerAdmin.rejected, (state, action) => {
        state.loading = false; state.status = "failed"; state.error = action.payload || "Müşteri silinemedi.";
      })

      // --- PUBLIC ---
      .addCase(fetchCustomerPublicById.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(fetchCustomerPublicById.fulfilled, (state, action) => {
        state.loading = false; state.status = "succeeded"; state.selected = action.payload;
        // Liste varsa güncelle (opsiyonel)
        state.customers = state.customers.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(fetchCustomerPublicById.rejected, (state, action) => {
        state.loading = false; state.status = "failed"; state.error = action.payload || "Müşteri bulunamadı.";
      })
      .addCase(updateCustomerPublic.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null; state.successMessage = null;
      })
      .addCase(updateCustomerPublic.fulfilled, (state, action) => {
        state.loading = false; state.status = "succeeded"; state.successMessage = "Müşteri bilgileri güncellendi.";
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
        state.customers = state.customers.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(updateCustomerPublic.rejected, (state, action) => {
        state.loading = false; state.status = "failed"; state.error = action.payload || "Müşteri güncellenemedi.";
      });
  },
});

export const {
  clearCustomerMessages,
  setSelectedCustomer,
  clearCustomers,
} = customerSlice.actions;
export default customerSlice.reducer;

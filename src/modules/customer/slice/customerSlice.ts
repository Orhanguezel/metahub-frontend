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

// 1️⃣ Public: Tüm müşteriler (veya müşteri portalı için)
export const fetchCustomers = createAsyncThunk<
  ICustomer[],
  void,
  { rejectValue: string }
>("customer/fetchCustomers", async (_, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", "/customer", null, rejectWithValue);
    return result.data as ICustomer[];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri listesi getirilemedi.");
  }
});

// 2️⃣ Admin: Tüm müşterileri getir
export const fetchCustomersAdmin = createAsyncThunk<
  ICustomer[],
  void,
  { rejectValue: string }
>("customer/fetchCustomersAdmin", async (_, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", "/customer", null, rejectWithValue);
    return result.data as ICustomer[];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Admin müşteri listesi getirilemedi.");
  }
});

// 3️⃣ Tek müşteri getir (ID ile)
export const fetchCustomerById = createAsyncThunk<
  ICustomer,
  string,
  { rejectValue: string }
>("customer/fetchCustomerById", async (id, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", `/customer/${id}`, null, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri bulunamadı.");
  }
});

// 4️⃣ Müşteri oluştur (admin)
export const createCustomerAdmin = createAsyncThunk<
  ICustomer,
  Partial<ICustomer>,
  { rejectValue: string }
>("customer/createCustomerAdmin", async (data, { rejectWithValue }) => {
  try {
    const result = await apiCall("post", "/customer", data, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri oluşturulamadı.");
  }
});

// 5️⃣ Müşteri güncelle (admin)
export const updateCustomerAdmin = createAsyncThunk<
  ICustomer,
  { id: string; data: Partial<ICustomer> },
  { rejectValue: string }
>("customer/updateCustomerAdmin", async ({ id, data }, { rejectWithValue }) => {
  try {
    const result = await apiCall("put", `/customer/${id}`, data, rejectWithValue);
    return result.data as ICustomer;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri güncellenemedi.");
  }
});

// 6️⃣ Müşteri sil (admin)
export const deleteCustomerAdmin = createAsyncThunk<
  string, // Silinen müşteri id döneriz
  string,
  { rejectValue: string }
>("customer/deleteCustomerAdmin", async (id, { rejectWithValue }) => {
  try {
    await apiCall("delete", `/customer/${id}`, null, rejectWithValue);
    return id;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Müşteri silinemedi.");
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
      // Public Fetch (müşteri portalı)
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Müşteri listesi getirilemedi.";
      })

      // Admin Fetch
      .addCase(fetchCustomersAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.customerAdmin = action.payload;
      })
      .addCase(fetchCustomersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Admin müşteri listesi getirilemedi.";
      })

      // Fetch By Id
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Müşteri bulunamadı.";
      })

      // Admin Create
      .addCase(createCustomerAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCustomerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.customerAdmin.unshift(action.payload);
        state.successMessage = "Müşteri başarıyla eklendi.";
      })
      .addCase(createCustomerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Müşteri oluşturulamadı.";
      })

      // Admin Update
      .addCase(updateCustomerAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCustomerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Müşteri güncellendi.";
        state.customerAdmin = state.customerAdmin.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
        if (state.selected?._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateCustomerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Müşteri güncellenemedi.";
      })

      // Admin Delete
      .addCase(deleteCustomerAdmin.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteCustomerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = "Müşteri silindi.";
        state.customerAdmin = state.customerAdmin.filter((c) => c._id !== action.payload);
        if (state.selected?._id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deleteCustomerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload || "Müşteri silinemedi.";
      });
  },
});

export const {
  clearCustomerMessages,
  setSelectedCustomer,
  clearCustomers,
} = customerSlice.actions;
export default customerSlice.reducer;

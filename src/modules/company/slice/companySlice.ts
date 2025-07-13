import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { ICompany } from "../types";

// --- State ---
interface CompanyFullState {
  company: ICompany | null;
  companyAdmin: ICompany | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}
const initialState: CompanyFullState = {
  company: null,
  companyAdmin: null,
  status: "idle",
  updateStatus: "idle",
  createStatus: "idle",
  deleteStatus: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

// --- FormData Helper ---
const appendFormData = (
  formData: FormData,
  data: Record<string, any>,
  parentKey?: string
) => {
  Object.entries(data).forEach(([key, value]) => {
    const fieldName = parentKey ? `${parentKey}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (item instanceof File) {
          formData.append(fieldName, item);
        } else if (typeof item === "object" && item !== null) {
          appendFormData(formData, item, `${fieldName}[${idx}]`);
        } else {
          formData.append(`${fieldName}[${idx}]`, String(item));
        }
      });
    } else if (value instanceof File) {
      formData.append(fieldName, value);
    } else if (typeof value === "object" && value !== null) {
      appendFormData(formData, value, fieldName);
    } else if (value !== undefined && value !== null) {
      formData.append(fieldName, String(value));
    }
  });
};

// 🌍 GET: Public & Admin Company
export const fetchCompanyInfo = createAsyncThunk<
  ICompany,
  void,
  { rejectValue: string }
>("company/fetchCompanyInfo", async (_, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", "/company", null, rejectWithValue);
    // result.data = { success, message, data }
    return result.data; // <--- SADECE ICompany döner!
  } catch (error: any) {
    return rejectWithValue(error?.message || "No company data found.");
  }
});

// 🛠 Admin: Fetch Company
export const fetchCompanyAdmin = createAsyncThunk<
  ICompany,
  void,
  { rejectValue: string }
>("company/fetchCompanyAdmin", async (_, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", "/company", null, rejectWithValue);
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "No admin company data found.");
  }
});

// 🛠️ CREATE: Company
export const createCompanyAdmin = createAsyncThunk<
  ICompany,
  Record<string, any>,
  { rejectValue: string }
>("company/createCompanyAdmin", async (newCompany, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    appendFormData(formData, newCompany);
    const result = await apiCall("post", "/company", formData, rejectWithValue);
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to create company.");
  }
});

// 🛠️ UPDATE: Company
export const updateCompanyAdmin = createAsyncThunk<
  ICompany,
  { _id: string } & Record<string, any>,
  { rejectValue: string }
>("company/updateCompanyAdmin", async (updatedData, { rejectWithValue }) => {
  try {
    const { _id, images, removedImages, ...rest } = updatedData;
    const formData = new FormData();

    // Diğer tüm alanlar
    appendFormData(formData, rest);

    // Yeni eklenen dosyalar (images)
    if (Array.isArray(images)) {
      images.forEach((file: File) => {
        if (file instanceof File) formData.append("images", file);
      });
    }

    // Silinecek görseller (removedImages)
    if (removedImages && removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    const result = await apiCall(
      "put",
      `/company/${_id}`,
      formData,
      rejectWithValue
    );
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to update company.");
  }
});


// 🗑️ DELETE: Company
export const deleteCompanyAdmin = createAsyncThunk(
  "company/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/company/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

// --- SLICE ---
const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    resetMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearCompany(state) {
      state.company = null;
      state.companyAdmin = null;
      state.status = "idle";
      state.updateStatus = "idle";
      state.createStatus = "idle";
      state.deleteStatus = "idle";
      state.error = null;
      state.successMessage = null;
    },
    clearCompanyMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 🌍 Fetch
    builder
      .addCase(fetchCompanyInfo.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(fetchCompanyInfo.fulfilled, (state, action: PayloadAction<ICompany>) => {
        state.status = "succeeded";
        state.company = action.payload;
        state.companyAdmin = action.payload;
      })
      .addCase(fetchCompanyInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch company data.";
      });

    // 🛠 Admin - fetch
    builder
      .addCase(fetchCompanyAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyAdmin.fulfilled, (state, action: PayloadAction<ICompany>) => {
        state.loading = false;
        state.companyAdmin = action.payload;
      })
      .addCase(fetchCompanyAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch admin company data.";
      });

    // 🛠️ Create
    builder
      .addCase(createCompanyAdmin.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCompanyAdmin.fulfilled, (state, action: PayloadAction<ICompany>) => {
        state.createStatus = "succeeded";
        state.companyAdmin = action.payload;
        state.successMessage = "Company created successfully.";
      })
      .addCase(createCompanyAdmin.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = (action.payload as string) || "Failed to create company.";
      });

    // 🛠️ Update
    builder
      .addCase(updateCompanyAdmin.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCompanyAdmin.fulfilled, (state, action: PayloadAction<ICompany>) => {
        state.updateStatus = "succeeded";
        state.companyAdmin = action.payload;
        state.successMessage = "Company updated successfully.";
      })
      .addCase(updateCompanyAdmin.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = (action.payload as string) || "Failed to update company.";
      });

    // 🗑️ Delete
    builder
      .addCase(deleteCompanyAdmin.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteCompanyAdmin.fulfilled, (state, action: PayloadAction<{ message: string }>) => {
        state.deleteStatus = "succeeded";
        state.companyAdmin = null;
        state.company = null;
        state.successMessage = action.payload.message || "Company deleted successfully.";
      })
      .addCase(deleteCompanyAdmin.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = (action.payload as string) || "Failed to delete company.";
      });
  },
});

export const {
  resetMessages,
  clearCompany,
  clearCompanyMessages,
} = companySlice.actions;

export default companySlice.reducer;

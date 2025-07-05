import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { ICompany, CompanyState } from "../types";

// --- State ---

const initialState: CompanyState = {
  company: null,
  status: "idle",
  updateStatus: "idle",
  createStatus: "idle",
  error: null,
  successMessage: null,
};

// --- FormData Helper (Nested Key Support) ---
const appendFormData = (
  formData: FormData,
  data: Record<string, any>,
  parentKey?: string
) => {
  Object.entries(data).forEach(([key, value]) => {
    const fieldName = parentKey ? `${parentKey}[${key}]` : key;
    if (Array.isArray(value)) {
      // Array of files (logos), array of strings vs.
      value.forEach((item, idx) => {
        if (item instanceof File) {
          formData.append(`${fieldName}`, item);
        } else if (typeof item === "object" && item !== null) {
          // Array of objects (rare, ama logos gibi image meta için değil!)
          appendFormData(formData, item, `${fieldName}[${idx}]`);
        } else {
          formData.append(`${fieldName}[${idx}]`, String(item));
        }
      });
    } else if (value instanceof File) {
      formData.append(fieldName, value);
    } else if (typeof value === "object" && value !== null) {
      // Nested object: açarak ekle!
      appendFormData(formData, value, fieldName);
    } else if (value !== undefined && value !== null) {
      formData.append(fieldName, String(value));
    }
    // null/undefined'ları hiç ekleme
  });
};

// --- Async Thunks ---

export const fetchCompanyInfo = createAsyncThunk<
  ICompany,
  void,
  { rejectValue: string }
>("company/fetchCompanyInfo", async (_, { rejectWithValue }) => {
  try {
    const result = await apiCall("get", "/company", null, rejectWithValue);
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "No company data found.");
  }
});

export const createCompany = createAsyncThunk<
  ICompany,
  Record<string, any>,
  { rejectValue: string }
>("company/createCompany", async (newCompany, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    appendFormData(formData, newCompany);

    const result = await apiCall("post", "/company", formData, rejectWithValue);
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to create company.");
  }
});

export const updateCompanyInfo = createAsyncThunk<
  ICompany,
  Record<string, any>,
  { rejectValue: string }
>("company/updateCompanyInfo", async (updatedData, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    appendFormData(formData, updatedData);

    const result = await apiCall(
      "put",
      `/company/${updatedData._id}`,
      formData,
      rejectWithValue
    );
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to update company.");
  }
});

// --- Slice ---
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
      state.status = "idle";
      state.updateStatus = "idle";
      state.createStatus = "idle";
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCompanyInfo.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        fetchCompanyInfo.fulfilled,
        (state, action: PayloadAction<ICompany>) => {
          state.status = "succeeded";
          state.company = action.payload;
        }
      )
      .addCase(fetchCompanyInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to fetch company data.";
      })

      // Update
      .addCase(updateCompanyInfo.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateCompanyInfo.fulfilled,
        (state, action: PayloadAction<ICompany>) => {
          state.updateStatus = "succeeded";
          state.company = action.payload;
          state.successMessage = "Company updated successfully.";
        }
      )
      .addCase(updateCompanyInfo.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = (action.payload as string) || "Failed to update company.";
      })

      // Create
      .addCase(createCompany.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createCompany.fulfilled,
        (state, action: PayloadAction<ICompany>) => {
          state.createStatus = "succeeded";
          state.company = action.payload;
          state.successMessage = "Company created successfully.";
        }
      )
      .addCase(createCompany.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = (action.payload as string) || "Failed to create company.";
      });
  },
});

export const { resetMessages, clearCompany } = companySlice.actions;
export default companySlice.reducer;

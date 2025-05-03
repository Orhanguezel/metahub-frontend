import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// 🎯 Tipler
export interface MultiLangValue {
  tr?: string;
  en?: string;
  de?: string;
}

export type NestedLinkItem = { label: MultiLangValue; url: string };

export type SettingValue =
  | string
  | string[]
  | MultiLangValue
  | Record<string, MultiLangValue>
  | Record<string, NestedLinkItem>;

export interface Setting {
  _id?: string;
  key: string;
  value: SettingValue;
}

// 🎯 State Tipi
interface SettingState {
  settings: Setting[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchedSettings: boolean;
}

const initialState: SettingState = {
  settings: [],
  loading: false,
  error: null,
  successMessage: null,
  fetchedSettings: false,
};

// 🎯 Thunklar

// ✅ Fetch
export const fetchSettings = createAsyncThunk(
  "setting/fetchSettings",
  async (_, thunkAPI) => {
    try {
      const response = await apiCall(
        "get",
        "/setting",
        null,
        thunkAPI.rejectWithValue
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// ✅ Upsert (JSON)
export const upsertSetting = createAsyncThunk(
  "setting/upsertSetting",
  async (
    data: { key: string; value: SettingValue },
    thunkAPI
  ) => {
    try {
      let normalizedValue = data.value;

      // 🔑 SADECE düz string ise normalize et (nested'a karışma)
      if (
        typeof data.value === "string" &&
        data.key !== "site_template" &&
        data.key !== "footer_contact"
      ) {
        normalizedValue = {
          tr: data.value,
          en: data.value,
          de: data.value,
        };
      }

      const response = await apiCall(
        "post",
        "/setting",
        { key: data.key, value: normalizedValue },
        thunkAPI.rejectWithValue
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);


// ✅ Delete
export const deleteSetting = createAsyncThunk(
  "setting/deleteSetting",
  async (key: string, thunkAPI) => {
    try {
      await apiCall(
        "delete",
        `/setting/${key}`,
        null,
        thunkAPI.rejectWithValue
      );
      return key;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// ✅ Upload: Create (POST /setting/upload/:key)
export const upsertSettingImage = createAsyncThunk(
  "setting/upsertSettingImage",
  async (data: { key: string; file: File }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);

      const response = await apiCall(
        "post",
        `/setting/upload/${data.key}`,
        formData,
        thunkAPI.rejectWithValue,
        { isFormData: true }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// ✅ Upload: Update (PUT /setting/upload/:key)
export const updateSettingImage = createAsyncThunk(
  "setting/updateSettingImage",
  async (data: { key: string; file: File }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);

      const response = await apiCall(
        "put",
        `/setting/upload/${data.key}`,
        formData,
        thunkAPI.rejectWithValue,
        { isFormData: true }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// 🎯 Slice
const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    clearSettingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSettings.fulfilled,
        (state, action: PayloadAction<Setting[]>) => {
          state.loading = false;
          state.settings = action.payload;
          state.fetchedSettings = true;
        }
      )
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error =
          typeof payload === "string"
            ? payload
            : payload?.message || "Failed to fetch settings.";
      })

      // ✅ Upsert
      .addCase(upsertSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        upsertSetting.fulfilled,
        (state, action: PayloadAction<Setting>) => {
          state.loading = false;
          state.successMessage = "Setting saved successfully.";
          const updated = action.payload;
          const index = state.settings.findIndex((s) => s.key === updated.key);
          if (index !== -1) {
            state.settings[index] = updated;
          } else {
            state.settings.push(updated);
          }
        }
      )
      .addCase(upsertSetting.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error =
          typeof payload === "string"
            ? payload
            : payload?.message || "Failed to save setting.";
      })

      // ✅ Delete
      .addCase(deleteSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteSetting.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.successMessage = "Setting deleted successfully.";
          const deletedKey = action.payload;
          state.settings = state.settings.filter((s) => s.key !== deletedKey);
        }
      )
      .addCase(deleteSetting.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error =
          typeof payload === "string"
            ? payload
            : payload?.message || "Failed to delete setting.";
      })

      // ✅ UpsertSettingImage
      .addCase(upsertSettingImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        upsertSettingImage.fulfilled,
        (state, action: PayloadAction<Setting>) => {
          state.loading = false;
          state.successMessage =
            "Image uploaded and setting saved successfully.";
          const updated = action.payload;
          const index = state.settings.findIndex((s) => s.key === updated.key);
          if (index !== -1) {
            state.settings[index] = updated;
          } else {
            state.settings.push(updated);
          }
        }
      )
      .addCase(upsertSettingImage.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error =
          typeof payload === "string"
            ? payload
            : payload?.message || "Failed to upload image.";
      })

      // ✅ UpdateSettingImage
      .addCase(updateSettingImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateSettingImage.fulfilled,
        (state, action: PayloadAction<Setting>) => {
          state.loading = false;
          state.successMessage = "Image updated successfully.";
          const updated = action.payload;
          const index = state.settings.findIndex((s) => s.key === updated.key);
          if (index !== -1) {
            state.settings[index] = updated;
          } else {
            state.settings.push(updated);
          }
        }
      )
      .addCase(updateSettingImage.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.error =
          typeof payload === "string"
            ? payload
            : payload?.message || "Failed to update image.";
      });
  },
});

export const { clearSettingMessages } = settingSlice.actions;
export default settingSlice.reducer;

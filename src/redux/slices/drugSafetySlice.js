import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axiosConfig.js";

export const createDrugSafety = createAsyncThunk(
  "drugSafety/create",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(`/api/drug/drug-safety`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create drug safety"
      );
    }
  }
);

export const getDrugSafetyList = createAsyncThunk(
  "drugSafety/getList",
  async ({ type, stage }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      let url = `https://api.mediscript.in/api/drug/drug-safety?type=${type}`;

      if (stage) {
        url += `&stage=${stage}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch drug safety list");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDrugSafety = createAsyncThunk(
  "drugSafety/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://api.mediscript.in/api/drug/drug-safety/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update drug safety");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDrugSafety = createAsyncThunk(
  "drugSafety/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://api.mediscript.in/api/drug/drug-safety/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete drug safety");
      }

      return id; // return deleted ID for reducer
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const drugSafetySlice = createSlice({
  name: "drugSafety",
  initialState: {
    loading: false,
    list: [],
    success: false,
    error: null,
  },
  reducers: {
    resetDrugSafetyState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDrugSafety.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDrugSafety.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // 🔥 directly push new item
        if (action.payload?.data) {
          state.list.unshift(action.payload.data);
        }
      })

      .addCase(createDrugSafety.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //GET
      .addCase(getDrugSafetyList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDrugSafetyList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
      })
      .addCase(getDrugSafetyList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //          UPDATE (PUT)
      // ======================= */
      .addCase(updateDrugSafety.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDrugSafety.fulfilled, (state, action) => {
        state.loading = false;

        const updatedItem = action.payload.data; // 🔥 FIX

        const index = state.list.findIndex(
          (item) => item._id === updatedItem._id
        );

        if (index !== -1) {
          state.list[index] = updatedItem;
        }
      })

      .addCase(updateDrugSafety.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //   DELETE
      .addCase(deleteDrugSafety.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDrugSafety.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload;

        state.list = state.list.filter((item) => item._id !== deletedId);
      })
      .addCase(deleteDrugSafety.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDrugSafetyState } = drugSafetySlice.actions;
export default drugSafetySlice.reducer;

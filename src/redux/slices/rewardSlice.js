// src/redux/slices/rewardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosConfig";

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

/* ===== FETCH PENDING ===== */
export const fetchPendingPrescriptions = createAsyncThunk(
  "rewards/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/admin/submitted`);
      
      // "Template not found" → इसे error नहीं मानेंगे
      if (!res.data?.success) {
        const msg = res.data?.message || "";
        if (msg.toLowerCase().includes("template not found")) {
          return []; // खाली array → UI में "No pending" दिखेगा
        }
        return rejectWithValue(msg);
      }

      const prescriptions = normalizeArrayResponse(res.data);
      return prescriptions.filter(p => p?._id && p?.templateName);
    } catch (err) {
      // सिर्फ असली error (network, 500, etc.)
      return rejectWithValue(err.response?.data?.message || "Network error");
    }
  }
);

/* ===== APPROVE / REJECT ===== */
export const reviewPrescription = createAsyncThunk(
  "rewards/review",
  async ({ id, approve, comments }, { rejectWithValue }) => {
    try {
      const action = approve ? "approve" : "reject";
      const res = await axiosInstance.put(
        `/api/admin/doctor-prescriptions/${id}/${action}`,
        { comments }
      );
      if (!res.data?.success) return rejectWithValue(res.data?.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Review failed");
    }
  }
);

/* ===== REWARD HISTORY ===== */
export const fetchRewardHistory = createAsyncThunk(
  "rewards/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/admin/prescription-approval-report`);
      if (!res.data?.success || !Array.isArray(res.data?.data)) {
        return [];
      }
      return res.data.data.map(r => ({
        id: r._id || `${r.doctorEmail}-${r.approvedAt}`,
        doctorName: r.doctorName || "N/A",
        doctorEmail: r.doctorEmail || "N/A",
        rewardType: r.rewardType || "N/A",
        approvedAt: r.approvedAt || new Date().toISOString(),
      }));
    } catch (err) {
      return [];
    }
  }
);

/* ===== SLICE ===== */
const rewardSlice = createSlice({
  name: "rewards",
  initialState: {
    prescriptions: [],
    rewards: [],
    selectedPrescription: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectPrescription: (state, action) => {
      state.selectedPrescription = action.payload;
    },
    clearSelection: (state) => {
      state.selectedPrescription = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingPrescriptions.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchPendingPrescriptions.fulfilled, (s, a) => {
        s.loading = false;
        s.prescriptions = a.payload;
      })
      .addCase(fetchPendingPrescriptions.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload; // सिर्फ real error
      })

      .addCase(reviewPrescription.pending, (s) => {
        s.loading = true;
      })
      .addCase(reviewPrescription.fulfilled, (s, a) => {
        s.loading = false;
        s.prescriptions = s.prescriptions.filter(p => p._id !== a.payload._id);
        s.selectedPrescription = null;

        const report = a.payload.approvalReport;
        if (report?.rewardGiven === true && report?.rewardType) {
          const newReward = {
            id: `${a.payload._id}-${Date.now()}`,
            doctorName: a.payload.createdBy?.name || "Unknown",
            doctorEmail: a.payload.createdBy?.email || "N/A",
            rewardType: report.rewardType,
            approvedAt: report.emailSentAt || new Date().toISOString(),
          };
          const exists = s.rewards.some(r => r.id === newReward.id);
          if (!exists) s.rewards.unshift(newReward);
        }
      })
      .addCase(reviewPrescription.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchRewardHistory.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchRewardHistory.fulfilled, (s, a) => {
        s.loading = false;
        const localIds = s.rewards.map(r => r.id);
        const merged = [
          ...s.rewards,
          ...a.payload.filter(r => !localIds.includes(r.id))
        ];
        s.rewards = merged.sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt));
      })
      .addCase(fetchRewardHistory.rejected, (s) => {
        s.loading = false;
      });
  },
});

export const { selectPrescription, clearSelection, clearError } = rewardSlice.actions;
export default rewardSlice.reducer;
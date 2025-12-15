// src/redux/slices/certificateSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosConfig";

/* --------------------------------------------------------------
   Helper – normalise the list response
   -------------------------------------------------------------- */
const normaliseCertificates = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.certificates)) return data.certificates;
  if (Array.isArray(data.data)) return data.data;
  if (data?.certificate) return [data.certificate];
  console.warn('Unexpected certificate list format:', data);
  return [];
};

/* ==================== THUNKS ==================== */

/* ---- FETCH ALL CERTIFICATES ---- */
export const fetchAllCertificates = createAsyncThunk(
  'certificates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/api/admin/certificates');
      const list = normaliseCertificates(res.data);
      if (!Array.isArray(list)) {
        return rejectWithValue('Invalid certificates array');
      }
      return list;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch certificates';
      return rejectWithValue(msg);
    }
  }
);

/* ---- FETCH SUBMISSIONS (NEW API) ---- */
export const fetchSubmissions = createAsyncThunk(
  'certificates/fetchSubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/api/admin/exammode/submissions');
      
      // API returns: { success: true, count: 1, data: [...] }
      const submissions = res.data?.data ?? [];
      
      if (!Array.isArray(submissions)) {
        return rejectWithValue('Invalid submissions data format');
      }
      
      return submissions;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch submissions';
      return rejectWithValue(msg);
    }
  }
);

/* ---- APPROVE ---- */
export const approveCertificate = createAsyncThunk(
  'certificates/approve',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/api/admin/certificates/${id}/approve`);
      const cert = res.data?.cert || res.data?.certificate || res.data;
      if (!cert?._id) return rejectWithValue('Invalid response after approve');
      return cert;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to approve certificate';
      return rejectWithValue(msg);
    }
  }
);

/* ---- REJECT ---- */
export const rejectCertificate = createAsyncThunk(
  'certificates/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/api/admin/certificates/${id}/reject`, { reason });
      const cert = res.data?.cert || res.data?.certificate || res.data;
      if (!cert?._id) return rejectWithValue('Invalid response after reject');
      return cert;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to reject certificate';
      return rejectWithValue(msg);
    }
  }
);

/* ==================== SLICE ==================== */
const certificateSlice = createSlice({
  name: 'certificates',
  initialState: {
    list: [],
    submissions: [],        // ← NEW: submissions from /submissions
    listLoading: false,
    submissionsLoading: false,
    listError: null,
    submissionsError: null,

    actionLoading: false,
    actionMessage: null,
    actionError: null,
  },

  reducers: {
    clearActionFeedback: (state) => {
      state.actionMessage = null;
      state.actionError = null;
    },
    clearAllErrors: (state) => {
      state.listError = null;
      state.submissionsError = null;
      state.actionError = null;
    },
  },

  extraReducers: (builder) => {
    /* ---------- fetchAll ---------- */
    builder
      .addCase(fetchAllCertificates.pending, (s) => {
        s.listLoading = true;
        s.listError = null;
      })
      .addCase(fetchAllCertificates.fulfilled, (s, a) => {
        s.listLoading = false;
        s.list = a.payload;
      })
      .addCase(fetchAllCertificates.rejected, (s, a) => {
        s.listLoading = false;
        s.listError = a.payload;
      });

    /* ---------- fetchSubmissions ---------- */
    builder
      .addCase(fetchSubmissions.pending, (s) => {
        s.submissionsLoading = true;
        s.submissionsError = null;
      })
      .addCase(fetchSubmissions.fulfilled, (s, a) => {
        s.submissionsLoading = false;
        s.submissions = a.payload;
      })
      .addCase(fetchSubmissions.rejected, (s, a) => {
        s.submissionsLoading = false;
        s.submissionsError = a.payload;
      });

    /* ---------- approve ---------- */
    builder
      .addCase(approveCertificate.pending, (s) => {
        s.actionLoading = true;
        s.actionMessage = null;
        s.actionError = null;
      })
      .addCase(approveCertificate.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.actionMessage = 'Certificate approved';
        const idx = s.list.findIndex((c) => c._id === a.payload._id);
        if (idx > -1) s.list[idx] = a.payload;
      })
      .addCase(approveCertificate.rejected, (s, a) => {
        s.actionLoading = false;
        s.actionError = a.payload;
      });

    /* ---------- reject ---------- */
    builder
      .addCase(rejectCertificate.pending, (s) => {
        s.actionLoading = true;
        s.actionMessage = null;
        s.actionError = null;
      })
      .addCase(rejectCertificate.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.actionMessage = 'Certificate rejected';
        const idx = s.list.findIndex((c) => c._id === a.payload._id);
        if (idx > -1) s.list[idx] = a.payload;
      })
      .addCase(rejectCertificate.rejected, (s, a) => {
        s.actionLoading = false;
        s.actionError = a.payload;
      });
  },
});

/* --------- EXPORT ACTIONS --------- */
export const { clearActionFeedback, clearAllErrors } = certificateSlice.actions;

export default certificateSlice.reducer;
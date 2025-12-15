// src/redux/analyticsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token found');

      const response = await axios.get('https://api.mediscript.in/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Map response to slice-friendly format
      return {
        totalDoctors: response.data.data.users.totalDoctors,
        totalStudents: response.data.data.users.totalStudents,
        activeSubscriptions: response.data.data.users.activeSubscriptions,
        revenue: response.data.data.revenue,
        prescriptionLibrary: response.data.data.prescriptionLibrary,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    totalDoctors: 0,
    totalStudents: 0,
    activeSubscriptions: 0,
    revenue: { today: 0, month: 0, year: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        console.log('%c[Redux] fetchAnalytics.pending', 'color: blue;');
        state.status = 'loading';
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.totalDoctors = action.payload.totalDoctors;
        state.totalStudents = action.payload.totalStudents;
        state.activeSubscriptions = action.payload.activeSubscriptions;
        state.revenue = action.payload.revenue;
        state.prescriptionLibrary = action.payload.prescriptionLibrary;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        console.error('%c[Redux] fetchAnalytics.rejected', 'color: red;', action.payload);
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;

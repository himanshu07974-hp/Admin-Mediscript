// src/features/doctorCertificate/doctorCertificateSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig'; // Your configured instance
import { API_BASE_URL } from '../../config/api'; // Optional, for logging

// Helper: Normalize responses that may return different shapes
const normalizeArrayResponse = (respData) => {
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.templates)) return respData.templates;
  if (Array.isArray(respData.data)) return respData.data;
  if (respData?.template) return [respData.template];
  console.warn('Unexpected response format in normalizeArrayResponse:', respData);
  return [];
};

/* ===== Certificate Templates ===== */

// Fetch all certificate templates
export const fetchCertificateTemplates = createAsyncThunk(
  'doctorCertificate/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/certificate/`;
      const response = await axiosInstance.get(url);
      console.debug('fetchCertificateTemplates response:', response.data);

      const templates = normalizeArrayResponse(response.data);
      if (!Array.isArray(templates)) {
        console.error('Invalid templates array after normalization:', templates);
        return rejectWithValue('Invalid response format from fetchTemplates');
      }

      const validTemplates = templates.filter(t => t && typeof t === 'object' && t._id && t.name);
      if (validTemplates.length === 0 && templates.length > 0) {
        console.warn('All templates filtered out due to invalid data:', templates);
      }
      return validTemplates;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch templates';
      console.error('fetchCertificateTemplates error:', {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

// Create new certificate template
export const createCertificateTemplate = createAsyncThunk(
  'doctorCertificate/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const url = `/api/certificate/template/create`;
      console.debug('createCertificateTemplate request payload:', templateData);
      const response = await axiosInstance.post(url, templateData);
      console.debug('createCertificateTemplate response:', response.data);

      if (response.data?.success && response.data?.template) {
        return response.data.template;
      }
      if (response.data && typeof response.data === 'object' && response.data._id && response.data.name) {
        return response.data;
      }

      console.error('Invalid createCertificateTemplate response:', response.data);
      return rejectWithValue('Invalid response from createTemplate');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create template';
      console.error('createCertificateTemplate error:', {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

// Update certificate template by ID
export const updateCertificateTemplate = createAsyncThunk(
  'doctorCertificate/updateTemplate',
  async ({ id, templateData }, { rejectWithValue }) => {
    try {
      const url = `/api/certificate/template/${id}`;
      console.debug('updateCertificateTemplate request payload:', { id, templateData });
      const response = await axiosInstance.put(url, templateData);
      console.debug('updateCertificateTemplate response:', response.data);

      if (response.data?.success && response.data?.template) {
        return response.data.template;
      }
      if (response.data && typeof response.data === 'object' && response.data._id && response.data.name) {
        return response.data;
      }

      console.error('Invalid updateCertificateTemplate response:', response.data);
      return rejectWithValue('Invalid response from updateTemplate');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update template';
      console.error('updateCertificateTemplate error:', {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

// Delete certificate template by ID
export const deleteCertificateTemplate = createAsyncThunk(
  'doctorCertificate/deleteTemplate',
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/certificate/template/${id}`;
      console.debug('deleteCertificateTemplate request:', { id });
      await axiosInstance.delete(url);
      console.debug('deleteCertificateTemplate success for ID:', id);
      return id;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to delete template';
      console.error('deleteCertificateTemplate error:', {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

/* ===== Slice ===== */
const doctorCertificateSlice = createSlice({
  name: 'doctorCertificate',
  initialState: {
    // Templates
    templates: [],
    templatesLoading: false,
    templatesError: null,

    // Create
    createLoading: false,
    createError: null,

    // Update
    updateLoading: false,
    updateError: null,

    // Delete
    deleteLoading: false,
    deleteError: null,

    // General
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.templatesError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearAll: (state) => {
      state.templates = [];
      state.templatesLoading = false;
      state.templatesError = null;
      state.createLoading = false;
      state.createError = null;
      state.updateLoading = false;
      state.updateError = null;
      state.deleteLoading = false;
      state.deleteError = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCertificateTemplates
      .addCase(fetchCertificateTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(fetchCertificateTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
        console.log('Templates updated in state:', action.payload);
      })
      .addCase(fetchCertificateTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.payload;
        console.error('fetchCertificateTemplates rejected:', action.payload);
      })

      // createCertificateTemplate
      .addCase(createCertificateTemplate.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCertificateTemplate.fulfilled, (state, action) => {
        state.createLoading = false;
        state.templates = [action.payload, ...state.templates];
        console.log('Template created and added:', action.payload);
      })
      .addCase(createCertificateTemplate.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
        console.error('createCertificateTemplate rejected:', action.payload);
      })

      // updateCertificateTemplate
      .addCase(updateCertificateTemplate.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateCertificateTemplate.fulfilled, (state, action) => {
        state.updateLoading = false;
        const idx = state.templates.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.templates[idx] = action.payload;
        console.log('Template updated:', action.payload);
      })
      .addCase(updateCertificateTemplate.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        console.error('updateCertificateTemplate rejected:', action.payload);
      })

      // deleteCertificateTemplate
      .addCase(deleteCertificateTemplate.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteCertificateTemplate.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.templates = state.templates.filter(t => t._id !== action.payload);
        console.log('Template deleted:', action.payload);
      })
      .addCase(deleteCertificateTemplate.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        console.error('deleteCertificateTemplate rejected:', action.payload);
      });
  },
});

export const { clearError, clearAll } = doctorCertificateSlice.actions;
export default doctorCertificateSlice.reducer;
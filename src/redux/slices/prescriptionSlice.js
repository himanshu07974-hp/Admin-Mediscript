// src/features/prescription/prescriptionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';

/* -------------------------------------------------------------------------- */
/*                               ASYNC THUNKS                                 */
/* -------------------------------------------------------------------------- */

// GET all templates
export const fetchTemplates = createAsyncThunk(
  'prescription/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/admin/templates');
      if (!data.success || !Array.isArray(data.data)) {
        return rejectWithValue('Invalid response from server');
      }
      return data.data.map(t => ({
        ...t,
        templateData: t.templates?.[0] || {}, // flatten first language
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

// GET one template by ID
export const fetchTemplateById = createAsyncThunk(
  'prescription/fetchTemplateById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/admin/templates/${id}`);
      if (!data.success || !data.data) {
        return rejectWithValue('Template not found');
      }
      const tmpl = data.data;
      return {
        ...tmpl,
        templateData: tmpl.templates?.[0] || {}, // flatten first language
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch');
    }
  }
);

// CREATE TEMPLATE
export const createTemplate = createAsyncThunk(
  'prescription/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/admin/templates', templateData);
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to create template');
      }
      const tmpl = data.data;
      return {
        ...tmpl,
        templateData: tmpl.templates?.[0] || {},
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

// UPDATE TEMPLATE
export const updateTemplate = createAsyncThunk(
  'prescription/updateTemplate',
  async ({ id, templateData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/admin/templates/${id}`, templateData);
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to update template');
      }
      const tmpl = data.data;
      return {
        ...tmpl,
        templateData: tmpl.templates?.[0] || {},
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

// DELETE TEMPLATE
export const deleteTemplate = createAsyncThunk(
  'prescription/deleteTemplate',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/admin/templates/${id}`);
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to delete');
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error');
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                                   SLICE                                    */
/* -------------------------------------------------------------------------- */

const initialState = {
  templates: [],           // list of templates with flattened templateData
  selectedTemplate: null,  // full template object when viewing
  loading: false,
  error: null,
};

const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelected: (state) => {
      state.selectedTemplate = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH ALL
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // FETCH ONE
    builder
      .addCase(fetchTemplateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // CREATE
    builder
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.push(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // UPDATE
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.templates.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.selectedTemplate?._id === action.payload._id) {
          state.selectedTemplate = action.payload;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DELETE
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = state.templates.filter(t => t._id !== action.payload);
        if (state.selectedTemplate?._id === action.payload) {
          state.selectedTemplate = null;
        }
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelected } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
// src/features/systems/systemsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosConfig';

const normalize = (data) => {
  return data?.system || data?.module || data?.chapter || data?.section || data || data?.data;
};

// === THUNKS ===
export const fetchSystems = createAsyncThunk(
  'systems/fetchSystems',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/api/admin/systems');
      const systems = Array.isArray(data) ? data : data.systems || data.data || [];
      return systems;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch systems');
    }
  }
);

export const createSystem = createAsyncThunk(
  'systems/createSystem',
  async ({ title, description, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (image) formData.append('image', image);

      const { data } = await axiosInstance.post('/api/admin/systems', formData);
      return normalize(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createModule = createAsyncThunk(
  'systems/createModule',
  async ({ systemId, title }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/api/admin/systems/${systemId}/modules`, { title });
      return { systemId, module: normalize(data) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create module');
    }
  }
);

export const createChapter = createAsyncThunk(
  'systems/createChapter',
  async ({ systemId, title }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/api/admin/systems/${systemId}/chapters`, { title });
      return { systemId, chapter: normalize(data) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addSectionsToChapter = createAsyncThunk(
  'systems/addSections',
  async ({ chapterId, sectionData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append('title', sectionData.title);
      formData.append('content', sectionData.content || '');
      formData.append('isActive', sectionData.isActive ?? true);
      formData.append('sectionType', sectionData.sectionType);

      // Safely append files only if they are actual File objects
      ['images', 'flowcharts', 'pdfs', 'videos'].forEach(type => {
        if (sectionData[type] && Array.isArray(sectionData[type])) {
          sectionData[type].forEach(file => {
            if (file instanceof File || file instanceof Blob) {
              formData.append(type, file);
            }
          });
        }
      });

      const { data } = await axiosInstance.post(
        `/api/admin/chapters/${chapterId}/sections`,
        formData
      );

      return { chapterId, updatedChapter: normalize(data) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add section');
    }
  }
);

// === SLICE ===
const systemsSlice = createSlice({
  name: 'systems',
  initialState: {
    byId: {},
    allIds: [],
    selected: { systemId: null, moduleId: null, chapterId: null },
    loading: false,
    error: null,
  },
  reducers: {
    selectSystem: (state, action) => {
      state.selected = { systemId: action.payload, moduleId: null, chapterId: null };
    },
    selectModule: (state, action) => {
      state.selected.moduleId = action.payload;
      state.selected.chapterId = null;
    },
    selectChapter: (state, action) => {
      state.selected.chapterId = action.payload;
    },
    clearSelection: (state) => {
      state.selected = { systemId: null, moduleId: null, chapterId: null };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystems.fulfilled, (state, action) => {
        state.loading = false;
        state.byId = {};
        state.allIds = [];
        action.payload.forEach((sys) => {
          state.byId[sys._id] = {
            ...sys,
            modules: sys.modules?.map(m => ({
              ...m,
              chapters: m.chapters || []
            })) || []
          };
          state.allIds.push(sys._id);
        });
      })
      .addCase(fetchSystems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createSystem.fulfilled, (state, action) => {
        const sys = action.payload;
        state.byId[sys._id] = { ...sys, modules: [] };
        state.allIds.push(sys._id);
      })

      .addCase(createModule.fulfilled, (state, action) => {
        const { systemId, module } = action.payload;
        const system = state.byId[systemId];
        if (system && module?._id) {
          system.modules = system.modules || [];
          if (!system.modules.find(m => m._id === module._id)) {
            system.modules.push({ ...module, chapters: [] });
          }
        }
      })

      .addCase(createChapter.fulfilled, (state, action) => {
        const { systemId, chapter } = action.payload;
        const system = state.byId[systemId];
        if (system && chapter?._id) {
          // Assuming chapters are directly under system (as per your current API)
          system.chapters = system.chapters || [];
          if (!system.chapters.find(c => c._id === chapter._id)) {
            system.chapters.push({ ...chapter, sections: chapter.sections || [] });
          }
        }
      })

      .addCase(addSectionsToChapter.fulfilled, (state, action) => {
        const { chapterId, updatedChapter } = action.payload;
        if (!updatedChapter) return;

        Object.values(state.byId).forEach(sys => {
          // If chapters are directly under system
          if (sys.chapters) {
            const chap = sys.chapters.find(c => c._id === chapterId);
            if (chap) {
              Object.assign(chap, updatedChapter);
              chap.sections = updatedChapter.sections || [];
            }
          }
          // Also check inside modules (in case structure changes later)
          sys.modules?.forEach(mod => {
            const chap = mod.chapters?.find(c => c._id === chapterId);
            if (chap) {
              Object.assign(chap, updatedChapter);
              chap.sections = updatedChapter.sections || [];
            }
          });
        });
      });
  },
});

export const {
  selectSystem,
  selectModule,
  selectChapter,
  clearSelection,
  clearError
} = systemsSlice.actions;

export default systemsSlice.reducer;
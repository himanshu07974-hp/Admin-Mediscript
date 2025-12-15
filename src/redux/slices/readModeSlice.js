// src/redux/slices/readModeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosConfig";

const ensureToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Login required");
  }
  return token;
};

const ADMIN = "/api/admin";

/* =========================================================
   PREPARE FORM DATA
========================================================= */
const prepareFormData = (data, imageFile = null) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description || "");
  if (imageFile) formData.append("image", imageFile);
  return formData;
};

const prepareSectionFormData = (sectionData, newFiles = {}, existingUrls = {}) => {
  const formData = new FormData();
  formData.append("title", sectionData.title);
  formData.append("content", sectionData.content || "");
  formData.append("sectionType", sectionData.sectionType);
  formData.append("isActive", sectionData.isActive);

  ["images", "videos", "flowcharts", "pdfs"].forEach(type => {
    (newFiles[type] || []).forEach(file => formData.append(type, file));
    (existingUrls[type] || []).forEach(url => formData.append(`${type}Urls`, url));
  });

  return formData;
};

/* =========================================================
   FETCH ALL SYSTEMS
========================================================= */
export const fetchSystems = createAsyncThunk(
  "readMode/fetchSystems",
  async (_, { rejectWithValue }) => {
    try {
      ensureToken();
      const { data } = await axiosInstance.get(`${ADMIN}/systems`);
      return data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch systems");
    }
  }
);

/* =========================================================
   CREATE / UPDATE SYSTEM
========================================================= */
export const createSystem = createAsyncThunk(
  "readMode/createSystem",
  async ({ title, description, image }, { rejectWithValue }) => {
    try {
      ensureToken();
      const formData = prepareFormData({ title, description }, image);
      const { data } = await axiosInstance.post(`${ADMIN}/systems`, formData);
      return data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to create system");
    }
  }
);

export const updateSystem = createAsyncThunk(
  "readMode/updateSystem",
  async ({ id, title, description, image }, { rejectWithValue }) => {
    try {
      ensureToken();
      const formData = prepareFormData({ title, description }, image);
      const { data } = await axiosInstance.put(`${ADMIN}/systems/${id}`, formData);
      return data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to update system");
    }
  }
);

export const deleteSystem = createAsyncThunk(
  "readMode/deleteSystem",
  async (id, { rejectWithValue }) => {
    try {
      ensureToken();
      await axiosInstance.delete(`${ADMIN}/systems/${id}`);
      return id;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to delete system");
    }
  }
);

/* =========================================================
   CHAPTERS – DYNAMIC
========================================================= */
export const fetchChaptersBySystem = createAsyncThunk(
  "readMode/fetchChaptersBySystem",
  async (systemId, { rejectWithValue }) => {
    try {
      ensureToken();
      const { data } = await axiosInstance.get(`${ADMIN}/systems/${systemId}/chapters`);
      return { systemId, chapters: data };
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue("System not found or has no chapters");
      }
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch chapters");
    }
  }
);

export const createChapter = createAsyncThunk(
  "readMode/createChapter",
  async ({ systemId, title }, { rejectWithValue }) => {
    try {
      ensureToken();
      const { data } = await axiosInstance.post(`${ADMIN}/systems/${systemId}/chapters`, { title });
      return { systemId, chapter: data };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to create chapter");
    }
  }
);

export const updateChapter = createAsyncThunk(
  "readMode/updateChapter",
  async ({ chapterId, title }, { rejectWithValue }) => {
    try {
      ensureToken();
      const { data } = await axiosInstance.put(`${ADMIN}/chapters/${chapterId}`, { title });
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to update chapter");
    }
  }
);

export const deleteChapter = createAsyncThunk(
  "readMode/deleteChapter",
  async ({ systemId, chapterId }, { rejectWithValue }) => {
    try {
      ensureToken();
      await axiosInstance.delete(`${ADMIN}/systems/${systemId}/chapters/${chapterId}`);
      return { systemId, chapterId };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to delete chapter");
    }
  }
);

/* =========================================================
   SECTIONS – DYNAMIC
========================================================= */
export const fetchSectionsByChapter = createAsyncThunk(
  "readMode/fetchSectionsByChapter",
  async (chapterId, { rejectWithValue }) => {
    try {
      ensureToken();
      const { data } = await axiosInstance.get(`${ADMIN}/chapters/${chapterId}/sections`);
      return { chapterId, sections: data };
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue("Chapter not found or has no sections");
      }
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch sections");
    }
  }
);

export const fetchSectionById = createAsyncThunk(
  "readMode/fetchSectionById",
  async ({ chapterId, sectionId }, { rejectWithValue }) => {
    try {
      ensureToken();
      const { data } = await axiosInstance.get(`${ADMIN}/chapters/${chapterId}/sections/${sectionId}`);
      return { chapterId, section: data };
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue("Section not found");
      }
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch section");
    }
  }
);

export const createSection = createAsyncThunk(
  "readMode/createSection",
  async ({ chapterId, sectionData, newFiles }, { rejectWithValue }) => {
    try {
      ensureToken();
      const formData = prepareSectionFormData(sectionData, newFiles);
      const { data } = await axiosInstance.post(`${ADMIN}/chapters/${chapterId}/sections`, formData);
      return { chapterId, section: data };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to create section");
    }
  }
);

export const updateSection = createAsyncThunk(
  "readMode/updateSection",
  async ({ sectionId, sectionData, newFiles, existingUrls }, { rejectWithValue }) => {
    try {
      ensureToken();
      const formData = prepareSectionFormData(sectionData, newFiles, existingUrls);
      const { data } = await axiosInstance.put(`${ADMIN}/sections/${sectionId}`, formData);
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to update section");
    }
  }
);

export const deleteSection = createAsyncThunk(
  "readMode/deleteSection",
  async ({ chapterId, sectionId }, { rejectWithValue }) => {
    try {
      ensureToken();
      await axiosInstance.delete(`${ADMIN}/chapters/${chapterId}/sections/${sectionId}`);
      return { chapterId, sectionId };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to delete section");
    }
  }
);

/* =========================================================
   PREDEFINED SECTIONS
========================================================= */
export const fetchPredefinedSections = createAsyncThunk(
  "readMode/fetchPredefinedSections",
  async (_, { rejectWithValue }) => {
    try {
      ensureToken();
      const { data } = await axiosInstance.get(`${ADMIN}/predefined-sections`);
      return data.sections?.map(s => s.title) || [];
    } catch (error) {
      if (error.response?.status === 404) return [];
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch section types");
    }
  }
);

/* =========================================================
   SLICE
========================================================= */
const initialState = {
  allIds: [],
  byId: {},
  selected: { systemId: null, chapterId: null },
  activeSection: null,
  activeSectionData: null,
  predefinedSections: [],
  loading: false,
  error: null,
  predefinedLoading: false,
  predefinedError: null,
};

const readModeSlice = createSlice({
  name: "readMode",
  initialState,
  reducers: {
    selectSystem: (state, action) => {
      state.selected.systemId = action.payload;
      state.selected.chapterId = null;
      state.activeSection = null;
      state.activeSectionData = null;
    },
    selectChapter: (state, action) => {
      state.selected.chapterId = action.payload;
      state.activeSection = null;
      state.activeSectionData = null;
    },
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
    setActiveSectionData: (state, action) => {
      state.activeSectionData = action.payload;
    },
    clearSelection: (state) => {
      state.selected = { systemId: null, chapterId: null };
      state.activeSection = null;
      state.activeSectionData = null;
    },
    clearError: (state) => {
      state.error = null;
      state.predefinedError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystems.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSystems.fulfilled, (state, action) => {
        state.loading = false;
        state.allIds = action.payload.map(s => s._id);
        state.byId = action.payload.reduce((acc, sys) => {
          acc[sys._id] = { ...sys, chapters: sys.chapters || [] };
          return acc;
        }, {});
      })
      .addCase(fetchSystems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createSystem.fulfilled, (state, action) => {
        const sys = action.payload;
        state.allIds.push(sys._id);
        state.byId[sys._id] = { ...sys, chapters: [] };
      })
      .addCase(updateSystem.fulfilled, (state, action) => {
        const sys = action.payload;
        state.byId[sys._id] = { ...state.byId[sys._id], ...sys };
      })
      .addCase(deleteSystem.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.byId[id];
        state.allIds = state.allIds.filter(i => i !== id);
      })

      .addCase(fetchChaptersBySystem.fulfilled, (state, action) => {
        const { systemId, chapters } = action.payload;
        if (state.byId[systemId]) {
          state.byId[systemId].chapters = chapters.map(c => ({ ...c, sections: c.sections || [] }));
        }
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        const { systemId, chapter } = action.payload;
        if (!state.byId[systemId].chapters) state.byId[systemId].chapters = [];
        state.byId[systemId].chapters.push({ ...chapter, sections: [] });
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        const chapter = action.payload;
        for (const sys of Object.values(state.byId)) {
          const idx = sys.chapters?.findIndex(c => c._id === chapter._id);
          if (idx !== -1) { sys.chapters[idx] = chapter; break; }
        }
      })
      .addCase(deleteChapter.fulfilled, (state, action) => {
        const { systemId, chapterId } = action.payload;
        state.byId[systemId].chapters = state.byId[systemId].chapters.filter(c => c._id !== chapterId);
      })

      .addCase(fetchSectionsByChapter.fulfilled, (state, action) => {
        const { chapterId, sections } = action.payload;
        for (const sys of Object.values(state.byId)) {
          const chap = sys.chapters?.find(c => c._id === chapterId);
          if (chap) { chap.sections = sections; break; }
        }
      })

      // FIXED: Normalize media arrays
      .addCase(fetchSectionById.fulfilled, (state, action) => {
        const { chapterId, section } = action.payload;

        const normalizeMedia = (arr) => 
          Array.isArray(arr) 
            ? arr.map(item => typeof item === 'string' ? { url: item } : item)
            : [];

        const normalized = {
          ...section,
          images: normalizeMedia(section.images),
          videos: normalizeMedia(section.videos),
          flowcharts: normalizeMedia(section.flowcharts),
          pdfs: normalizeMedia(section.pdfs),
        };

        state.activeSectionData = normalized;

        for (const sys of Object.values(state.byId)) {
          const chap = sys.chapters?.find(c => c._id === chapterId);
          if (chap) {
            const idx = chap.sections?.findIndex(s => s._id === section._id);
            if (idx !== -1) chap.sections[idx] = normalized;
            break;
          }
        }
      })

      .addCase(createSection.fulfilled, (state, action) => {
        const { chapterId, section } = action.payload;
        const normalized = {
          ...section,
          images: section.images?.map(i => typeof i === 'string' ? { url: i } : i) || [],
          videos: section.videos?.map(i => typeof i === 'string' ? { url: i } : i) || [],
          flowcharts: section.flowcharts?.map(i => typeof i === 'string' ? { url: i } : i) || [],
          pdfs: section.pdfs?.map(i => typeof i === 'string' ? { url: i } : i) || [],
        };

        for (const sys of Object.values(state.byId)) {
          const chap = sys.chapters?.find(c => c._id === chapterId);
          if (chap) {
            if (!chap.sections) chap.sections = [];
            chap.sections.push(normalized);
            break;
          }
        }
      })

      .addCase(updateSection.fulfilled, (state, action) => {
        const section = action.payload;
        const normalized = {
          ...section,
          images: section.images?.map(i => typeof i === 'string' ? { url: i } : i) || [],
          videos: section.videos?.map(i => typeof i === 'string' ? { url: i } : i) || [],
          flowcharts: section.flowcharts?.map(i => typeof i === 'string' ? { url: i } : i) || [],
          pdfs: section.pdfs?.map(i => typeof i === 'string' ? { url: i } : i) || [],
        };

        for (const sys of Object.values(state.byId)) {
          for (const chap of sys.chapters || []) {
            const idx = chap.sections?.findIndex(s => s._id === section._id);
            if (idx !== -1) { chap.sections[idx] = normalized; return; }
          }
        }
      })

      .addCase(deleteSection.fulfilled, (state, action) => {
        const { chapterId, sectionId } = action.payload;
        for (const sys of Object.values(state.byId)) {
          const chap = sys.chapters?.find(c => c._id === chapterId);
          if (chap) {
            chap.sections = chap.sections.filter(s => s._id !== sectionId);
            break;
          }
        }
      })

      .addCase(fetchPredefinedSections.pending, (state) => { state.predefinedLoading = true; })
      .addCase(fetchPredefinedSections.fulfilled, (state, action) => {
        state.predefinedLoading = false;
        state.predefinedSections = action.payload;
      })
      .addCase(fetchPredefinedSections.rejected, (state, action) => {
        state.predefinedLoading = false;
        state.predefinedError = action.payload;
      });
  },
});

export const {
  selectSystem,
  selectChapter,
  setActiveSection,
  setActiveSectionData,
  clearSelection,
  clearError,
} = readModeSlice.actions;

export default readModeSlice.reducer;
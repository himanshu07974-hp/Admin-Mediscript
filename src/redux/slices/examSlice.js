import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axiosConfig";

/* =========================================================
   FETCH MODULES
========================================================= */
export const fetchModules = createAsyncThunk(
  "exams/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/exammode/modules");
      return response.data; // expects array of modules with cases[]
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch modules"
      );
    }
  }
);

/* =========================================================
   FETCH PERFORMANCE
========================================================= */
export const fetchPerformance = createAsyncThunk(
  "exams/fetchPerformance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/exammode/admin/performance");
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch performance"
      );
    }
  }
);

/* =========================================================
   FETCH ALL CERTIFICATES
========================================================= */
export const fetchCertificates = createAsyncThunk(
  "exams/fetchCertificates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/certificates");
      return response.data.certificates;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch certificates"
      );
    }
  }
);

/* =========================================================
   GENERATE MODULE CERTIFICATE
========================================================= */
export const generateCertificate = createAsyncThunk(
  "exams/generateCertificate",
  async (certificateData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/admin/certificates/module",
        certificateData
      );
      return response.data.certificate;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate module certificate"
      );
    }
  }
);

/* =========================================================
   GENERATE COURSE CERTIFICATE
========================================================= */
export const generateCourseCertificate = createAsyncThunk(
  "exams/generateCourseCertificate",
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/admin/certificates/course",
        courseData
      );
      return response.data.certificate;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to generate course certificate"
      );
    }
  }
);

/* =========================================================
   FETCH CASE BY ID
========================================================= */
export const fetchCaseById = createAsyncThunk(
  "exams/fetchCaseById",
  async ({ moduleId, caseId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/admin/exammode/modules/${moduleId}/cases/${caseId}`
      );
      return { moduleId, caseId, caseData: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch case by ID"
      );
    }
  }
);

/* =========================================================
   MODULE CRUD
========================================================= */
export const createModule = createAsyncThunk(
  "exams/createModule",
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/admin/exammode/modules", moduleData);
      return response.data.module;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create module"
      );
    }
  }
);

export const updateModule = createAsyncThunk(
  "exams/updateModule",
  async ({ moduleId, title }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/admin/exammode/modules/${moduleId}`, {
        title,
      });
      return response.data.module;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update module"
      );
    }
  }
);

export const deleteModule = createAsyncThunk(
  "exams/deleteModule",
  async (moduleId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admin/exammode/modules/${moduleId}`);
      return moduleId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete module"
      );
    }
  }
);

/* =========================================================
   CASE CRUD
========================================================= */
export const createCase = createAsyncThunk(
  "exams/createCase",
  async ({ moduleId, caseData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/admin/exammode/modules/${moduleId}/cases`,
        caseData
      );
      return { moduleId, case: response.data.case || response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create case"
      );
    }
  }
);

export const fetchCases = createAsyncThunk(
  "exams/fetchCases",
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/admin/exammode/modules/${moduleId}/cases`
      );
      return { moduleId, cases: response.data }; // response.data is array of cases with topics[]
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cases"
      );
    }
  }
);

export const updateCase = createAsyncThunk(
  "exams/updateCase",
  async ({ moduleId, caseId, caseData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/admin/exammode/modules/${moduleId}/cases/${caseId}`,
        caseData
      );
      return { moduleId, caseId, updatedCase: response.data.case || response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update case"
      );
    }
  }
);

export const deleteCase = createAsyncThunk(
  "exams/deleteCase",
  async ({ moduleId, caseId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/admin/exammode/modules/${moduleId}/cases/${caseId}`);
      return { moduleId, caseId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete case"
      );
    }
  }
);

/* =========================================================
   TOPIC CRUD
========================================================= */
export const createTopic = createAsyncThunk(
  "exams/createTopic",
  async ({ moduleId, caseId, topicData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/admin/exammode/modules/${moduleId}/cases/${caseId}/topics`,
        topicData
      );
      // Backend returns: { topic: { ... }, _id: "..." } or just topic object
      const topic = response.data.topic || response.data;
      return { moduleId, caseId, topic };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create topic"
      );
    }
  }
);

export const fetchTopics = createAsyncThunk(
  "exams/fetchTopics",
  async ({ moduleId, caseId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/admin/exammode/modules/${moduleId}/cases/${caseId}/topics`
      );
      return { moduleId, caseId, topics: response.data }; // array
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch topics"
      );
    }
  }
);

export const updateTopic = createAsyncThunk(
  "exams/updateTopic",
  async ({ moduleId, caseId, topicId, topicData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/admin/exammode/modules/${moduleId}/cases/${caseId}/topics/${topicId}`,
        topicData
      );
      const updatedTopic = response.data.topic || response.data;
      return { moduleId, caseId, topicId, updatedTopic };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update topic"
      );
    }
  }
);

export const deleteTopic = createAsyncThunk(
  "exams/deleteTopic",
  async ({ moduleId, caseId, topicId }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `/api/admin/exammode/modules/${moduleId}/cases/${caseId}/topics/${topicId}`
      );
      return { moduleId, caseId, topicId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete topic"
      );
    }
  }
);

/* =========================================================
   SLICE
========================================================= */
const examSlice = createSlice({
  name: "exams",
  initialState: {
    modules: [], // { _id, title, cases: [{ _id, title, topics: [...] }] }
    performance: [],
    certificates: [],
    generatedCertificate: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearModules: (state) => {
      state.modules = [];
    },
    clearGeneratedCertificate: (state) => {
      state.generatedCertificate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ====================== FETCH MODULES ====================== */
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ====================== PERFORMANCE ====================== */
      .addCase(fetchPerformance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performance = action.payload;
      })
      .addCase(fetchPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ====================== CERTIFICATES ====================== */
      .addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ====================== GENERATE CERTIFICATE ====================== */
      .addCase(generateCertificate.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedCertificate = action.payload;
      })
      .addCase(generateCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(generateCourseCertificate.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateCourseCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedCertificate = action.payload;
      })
      .addCase(generateCourseCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ====================== MODULE CRUD ====================== */
      .addCase(createModule.fulfilled, (state, action) => {
        state.modules.push(action.payload);
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        const index = state.modules.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.modules[index] = action.payload;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.modules = state.modules.filter((m) => m._id !== action.payload);
      })

      /* ====================== CASE CRUD ====================== */
      .addCase(createCase.fulfilled, (state, action) => {
        const module = state.modules.find((m) => m._id === action.payload.moduleId);
        if (module) {
          if (!module.cases) module.cases = [];
          module.cases.push(action.payload.case);
        }
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        const module = state.modules.find((m) => m._id === action.payload.moduleId);
        if (module) {
          module.cases = action.payload.cases.map(c => ({
            ...c,
            topics: c.topics || []
          }));
        }
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        const module = state.modules.find((m) => m._id === action.payload.moduleId);
        if (module && module.cases) {
          const caseIndex = module.cases.findIndex((c) => c._id === action.payload.caseId);
          if (caseIndex !== -1) {
            module.cases[caseIndex] = action.payload.updatedCase;
          }
        }
      })
      .addCase(deleteCase.fulfilled, (state, action) => {
        const module = state.modules.find((m) => m._id === action.payload.moduleId);
        if (module && module.cases) {
          module.cases = module.cases.filter((c) => c._id !== action.payload.caseId);
        }
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        const module = state.modules.find((m) => m._id === action.payload.moduleId);
        if (module && module.cases) {
          const caseIndex = module.cases.findIndex((c) => c._id === action.payload.caseId);
          if (caseIndex !== -1) {
            module.cases[caseIndex] = action.payload.caseData;
          } else {
            module.cases.push(action.payload.caseData);
          }
        }
      })

      /* ====================== TOPIC CRUD ====================== */
      .addCase(createTopic.fulfilled, (state, action) => {
        const { moduleId, caseId, topic } = action.payload;
        const module = state.modules.find((m) => m._id === moduleId);
        if (module && module.cases) {
          const caseItem = module.cases.find((c) => c._id === caseId);
          if (caseItem) {
            if (!caseItem.topics) caseItem.topics = [];
            // Avoid duplicates
            const exists = caseItem.topics.some(t => t._id === topic._id);
            if (!exists) {
              caseItem.topics.push(topic);
            }
          }
        }
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        const { moduleId, caseId, topics } = action.payload;
        const module = state.modules.find((m) => m._id === moduleId);
        if (module && module.cases) {
          const caseItem = module.cases.find((c) => c._id === caseId);
          if (caseItem) {
            caseItem.topics = topics;
          }
        }
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        const { moduleId, caseId, topicId, updatedTopic } = action.payload;
        const module = state.modules.find((m) => m._id === moduleId);
        if (module && module.cases) {
          const caseItem = module.cases.find((c) => c._id === caseId);
          if (caseItem && caseItem.topics) {
            const topicIndex = caseItem.topics.findIndex((t) => t._id === topicId);
            if (topicIndex !== -1) {
              caseItem.topics[topicIndex] = updatedTopic;
            }
          }
        }
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        const { moduleId, caseId, topicId } = action.payload;
        const module = state.modules.find((m) => m._id === moduleId);
        if (module && module.cases) {
          const caseItem = module.cases.find((c) => c._id === caseId);
          if (caseItem && caseItem.topics) {
            caseItem.topics = caseItem.topics.filter((t) => t._id !== topicId);
          }
        }
      });
  },
});

export const { clearError, clearModules, clearGeneratedCertificate } =
  examSlice.actions;

export default examSlice.reducer;
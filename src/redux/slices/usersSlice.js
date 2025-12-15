import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axiosConfig";

// Fetch doctors / students
export const fetchUsersByRole = createAsyncThunk(
  "users/fetchUsersByRole",
  async (role, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/admin/users/users?role=${role}`);
      if (!response.data.success || !Array.isArray(response.data.data)) {
        return rejectWithValue(`Invalid response: Expected array of ${role}s`);
      }
      return { role, users: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || `Failed to fetch ${role}s`
      );
    }
  }
);

// Send reminder (doctor)
export const sendReminder = createAsyncThunk(
  "users/sendReminder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/admin/expiry/send-reminder/${id}`
      );
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to send reminder"
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reminder"
      );
    }
  }
);

// Send reminder (student)
export const sendStudentReminder = createAsyncThunk(
  "users/sendStudentReminder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/admin/expiry/send-reminder/student/${id}`
      );
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to send reminder"
        );
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reminder"
      );
    }
  }
);

// NEW: Fetch Merged PDF (Doctor & Student)
export const fetchMergedPdf = createAsyncThunk(
  "users/fetchMergedPdf",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const endpoint =
        role === "doctor"
          ? `/api/admin/doctor/${userId}/merged-documents`
          : `/api/admin/student/${userId}/merged-documents`;

      const response = await axios.get(endpoint, { responseType: "blob" });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return { userId, pdfUrl };
    } catch (error) {
      return rejectWithValue("Failed to load PDF");
    }
  }
);

// DELETE USER (Doctor or Student)
// export const deleteUser = createAsyncThunk(
//   "users/deleteUser",
//   async ({ userId, role }, { rejectWithValue }) => {
//     try {
//       const response = await axios.delete(`/api/user/${userId}`);

//       if (!response.data.success) {
//         return rejectWithValue(
//           response.data.message || "Failed to delete user"
//         );
//       }

//       return { userId, role };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to delete user"
//       );
//     }
//   }
// );

// redux/slices/usersSlice.js (or wherever your thunk lives)
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/user/${userId}`);

      // If backend explicitly returns { success: false }, treat as failure
      if (response.data && response.data.success === false) {
        return rejectWithValue(
          response.data.message || "Failed to delete user"
        );
      }

      // Accept typical 2xx responses as success even if `success` flag is missing.
      if (response.status >= 200 && response.status < 300) {
        // return the id + role so reducer/component can act on it
        return { userId, role, message: response.data?.message };
      }

      // fallback
      return rejectWithValue(response.data?.message || "Failed to delete user");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete user"
      );
    }
  }
);

// Search users by name
export const searchUsers = createAsyncThunk(
  "users/searchUsers",
  async ({ name }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/user/search?name=${name}`);

      if (!response.data.users || !Array.isArray(response.data.users)) {
        return rejectWithValue("Invalid response from search API");
      }

      return response.data.users; // <-- use `users` array from API
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search users"
      );
    }
  }
);

export const suspendUser = createAsyncThunk(
  "users/suspendUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/auth/${userId}/suspend`);

      if (response.data?.success === false) {
        return rejectWithValue(
          response.data.message || "Failed to suspend user"
        );
      }

      return { userId, message: response.data?.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to suspend user"
      );
    }
  }
);

export const reactivateUser = createAsyncThunk(
  "users/reactivateUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/auth/${userId}/reactivate`);

      if (response.data?.success === false) {
        return rejectWithValue(
          response.data.message || "Failed to reactivate user"
        );
      }

      return { userId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reactivate user"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    doctors: [],
    students: [],
    pdfUrls: {}, // { userId: blobUrl }
    loading: false,
    pdfLoading: false,
    error: null,

    suspendLoading: false,
    suspendSuccess: false,
    suspendError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPdfUrl: (state, action) => {
      const userId = action.payload;
      if (state.pdfUrls[userId]) {
        URL.revokeObjectURL(state.pdfUrls[userId]);
        delete state.pdfUrls[userId];
      }
    },
    // ADD inside reducers: { ... }
    resetSuspendState: (state) => {
      state.suspendLoading = false;
      state.suspendSuccess = false;
      state.suspendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        const { role, users } = action.payload;
        if (role === "doctor") state.doctors = users;
        if (role === "student") state.students = users;
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false;

        // ❌ DO NOT SET GLOBAL ERROR
        // Because refresh fail after delete is NOT a real user error.
        // state.error = action.payload;

        // Optional: You MAY store it in a separate field if needed
        // state.fetchError = action.payload;
      })

      // Send reminder (doctor)
      .addCase(sendReminder.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendReminder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send reminder (student)
      .addCase(sendStudentReminder.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendStudentReminder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendStudentReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch merged PDF
      .addCase(fetchMergedPdf.pending, (state) => {
        state.pdfLoading = true;
      })
      .addCase(fetchMergedPdf.fulfilled, (state, action) => {
        state.pdfLoading = false;
        state.pdfUrls[action.payload.userId] = action.payload.pdfUrl;
      })
      .addCase(fetchMergedPdf.rejected, (state, action) => {
        state.pdfLoading = false;
        state.error = action.payload || "Failed to load PDF";
      })
      // DELETE USER
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, role } = action.payload;

        if (role === "doctor") {
          state.doctors = state.doctors.filter((user) => user._id !== userId);
        }

        if (role === "student") {
          state.students = state.students.filter((user) => user._id !== userId);
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const searchedUsers = action.payload;

        // Optional: split searched users into doctors and students
        state.doctors = searchedUsers.filter((user) => user.role === "doctor");
        state.students = searchedUsers.filter(
          (user) => user.role === "student"
        );
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // SUSPEND USER
      .addCase(suspendUser.pending, (state) => {
        state.suspendLoading = true;
        state.suspendSuccess = false;
        state.suspendError = null;
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        state.suspendLoading = false;
        state.suspendSuccess = true;

        const { userId } = action.payload;

        // OPTIONAL: mark user as suspended in local state
        state.doctors = state.doctors.map((user) =>
          user._id === userId ? { ...user, isSuspended: true } : user
        );

        state.students = state.students.map((user) =>
          user._id === userId ? { ...user, isSuspended: true } : user
        );
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.suspendLoading = false;
        state.suspendError = action.payload;
      })
      // REACTIVATE USER
      .addCase(reactivateUser.pending, (state) => {
        state.suspendLoading = true;
        state.suspendError = null;
      })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        state.suspendLoading = false;
        state.suspendSuccess = true;

        const { userId } = action.payload;

        // Update local redux state
        state.doctors = state.doctors.map((user) =>
          user._id === userId
            ? { ...user, status: "active", isSuspended: false }
            : user
        );

        state.students = state.students.map((user) =>
          user._id === userId
            ? { ...user, status: "active", isSuspended: false }
            : user
        );
      })
      .addCase(reactivateUser.rejected, (state, action) => {
        state.suspendLoading = false;
        state.suspendError = action.payload;
      });
  },
});

export const { clearError, clearPdfUrl, resetSuspendState } =
  usersSlice.actions;
export default usersSlice.reducer;

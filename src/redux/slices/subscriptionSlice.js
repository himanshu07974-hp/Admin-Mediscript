import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosConfig"; // Use your configured axios instance
import { API_BASE_URL } from "../../config/api"; // Adjust path if needed

// helper: normalize responses that may return different shapes
const normalizeArrayResponse = (respData) => {
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.plans)) return respData.plans;
  if (Array.isArray(respData.data)) return respData.data;
  // Handle single plan response or { success: true, plan: {...} }
  if (respData?.plan) return [respData.plan];
  console.warn(
    "Unexpected response format in normalizeArrayResponse:",
    respData
  );
  return [];
};

/* ===== Plans ===== */

// Fetch all subscription plans
export const fetchPlans = createAsyncThunk(
  "subscriptions/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/subscription/plans`; // Relative URL since baseURL is in axiosConfig
      const response = await axiosInstance.get(url);
      console.debug("fetchPlans response:", response.data);

      const plans = normalizeArrayResponse(response.data);
      if (!Array.isArray(plans)) {
        console.error("Invalid plans array after normalization:", plans);
        return rejectWithValue("Invalid response format from fetchPlans");
      }

      const validPlans = plans.filter(
        (p) => p && typeof p === "object" && p._id && p.name
      );
      if (validPlans.length === 0 && plans.length > 0) {
        console.warn("All plans filtered out due to invalid data:", plans);
      }
      return validPlans;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to fetch plans";
      console.error("fetchPlans error:", {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

// Create new subscription plan (with visibleTo support)
export const createPlan = createAsyncThunk(
  "subscriptions/createPlan",
  async (planData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/subscription/plans",
        planData
      );

      // ✅ backend returns { success: true, plan: {...} }
      if (response.data?.success) {
        return response.data.plan;
      }

      return rejectWithValue("Invalid response from server");
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Failed to create plan"
      );
    }
  }
);

// Update a subscription plan
export const updatePlan = createAsyncThunk(
  "subscriptions/updatePlan",
  async ({ planId, planData }, { rejectWithValue }) => {
    try {
      const url = `/api/subscription/plans/${planId}`; // Relative URL
      console.debug("updatePlan request payload:", { planId, planData });
      const response = await axiosInstance.put(url, planData);
      console.debug("updatePlan response:", response.data);

      if (response.data?.success && response.data?.plan) {
        return response.data.plan;
      }
      if (
        response.data &&
        typeof response.data === "object" &&
        response.data._id &&
        response.data.name
      ) {
        return response.data;
      }

      console.error("Invalid updatePlan response:", response.data);
      return rejectWithValue("Invalid response from updatePlan");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to update plan";
      console.error("updatePlan error:", {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

/* ===== Transactions, Reminders, Expiry (kept compatible) ===== */

// Fetch transactions
export const fetchTransactions = createAsyncThunk(
  "subscriptions/fetchTransactions",
  async (
    { page = 1, limit = 10, status = "success", sort = "amount" } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status,
        sort,
      });
      const url = `/api/admin/transactions?${params}`;
      const response = await axiosInstance.get(url);

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        return rejectWithValue("Invalid transactions response");
      }

      return {
        ...response.data,
        data: response.data.data.map((tx) => ({
          ...tx,
          userName: tx.user?.name || "Unknown User",
          userPhone: tx.user?.phone || "N/A",
        })),
      };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch transactions";
      return rejectWithValue(msg);
    }
  }
);

// Send expiry reminder
export const sendReminder = createAsyncThunk(
  "subscriptions/sendReminder",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const url = `/api/admin/expiry/send-reminder/${userId}`;
      const response = await axiosInstance.post(url, {});
      if (!response.data?.success) {
        return rejectWithValue("Invalid send reminder response");
      }
      return response.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to send reminder";
      return rejectWithValue(msg);
    }
  }
);

// Fetch expiry users
export const fetchExpiryUsers = createAsyncThunk(
  "subscriptions/fetchExpiryUsers",
  async (
    { days = 30, page = 1, limit = 10, role = "doctor" } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        days: String(days),
        page: String(page),
        limit: String(limit),
        role,
      });
      const url = `/api/admin/expiry?${params}`;
      const response = await axiosInstance.get(url);

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        return rejectWithValue("Invalid expiry users response");
      }

      return {
        ...response.data,
        data: response.data.data.map((user) => ({
          ...user,
          daysLeft: Math.ceil(
            (new Date(user.expiry) - new Date()) / (1000 * 60 * 60 * 24)
          ),
        })),
      };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch expiry users";
      return rejectWithValue(msg);
    }
  }
);

// Fetch reminders
export const fetchReminders = createAsyncThunk(
  "subscriptions/fetchReminders",
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/admin/reminders`;
      const response = await axiosInstance.get(url);

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        return rejectWithValue("Invalid reminders response");
      }

      return {
        ...response.data,
        data: response.data.data.map((rem) => ({
          ...rem,
          userName: rem.userId?.name || "Unknown User",
          userEmail: rem.userId?.email || "N/A",
          userPhone: rem.userId?.phone || "N/A",
          timeAgo: new Date(rem.sentAt).toLocaleString(),
        })),
      };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch reminders";
      return rejectWithValue(msg);
    }
  }
);

/* ===== Slice ===== */
const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState: {
    // Plans
    plans: [],
    planLoading: false,
    planError: null,

    // Transactions
    transactions: { data: [], page: 1, limit: 10, total: 0 },
    transactionsLoading: false,
    transactionsError: null,

    // Expiry users
    expiryUsers: { data: [], page: 1, limit: 10, total: 0 },
    expiryUsersLoading: false,
    expiryUsersError: null,

    // Reminders
    reminders: { data: [], count: 0 },
    remindersLoading: false,
    remindersError: null,

    // General
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.planError = null;
      state.transactionsError = null;
      state.expiryUsersError = null;
      state.remindersError = null;
    },
    clearAll: (state) => {
      state.plans = [];
      state.planLoading = false;
      state.planError = null;
      state.transactions = { data: [], page: 1, limit: 10, total: 0 };
      state.transactionsLoading = false;
      state.transactionsError = null;
      state.expiryUsers = { data: [], page: 1, limit: 10, total: 0 };
      state.expiryUsersLoading = false;
      state.expiryUsersError = null;
      state.reminders = { data: [], count: 0 };
      state.remindersLoading = false;
      state.remindersError = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPlans
      .addCase(fetchPlans.pending, (state) => {
        state.planLoading = true;
        state.planError = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.planLoading = false;
        state.plans = action.payload;
        console.log("Plans updated in state:", action.payload);
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.planLoading = false;
        state.planError = action.payload;
        console.error("fetchPlans rejected:", action.payload);
      })

      // CREATE PLAN
      .addCase(createPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload); // ✅ push created plan
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updatePlan
      .addCase(updatePlan.pending, (state) => {
        state.planLoading = true;
        state.planError = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.planLoading = false;
        const idx = state.plans.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
        console.log("Plan updated:", action.payload);
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.planLoading = false;
        state.planError = action.payload;
        console.error("updatePlan rejected:", action.payload);
      })

      // fetchTransactions
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.transactionsError = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.transactionsError = action.payload;
      })

      // sendReminder
      .addCase(sendReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendReminder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchExpiryUsers
      .addCase(fetchExpiryUsers.pending, (state) => {
        state.expiryUsersLoading = true;
        state.expiryUsersError = null;
      })
      .addCase(fetchExpiryUsers.fulfilled, (state, action) => {
        state.expiryUsersLoading = false;
        state.expiryUsers = action.payload;
      })
      .addCase(fetchExpiryUsers.rejected, (state, action) => {
        state.expiryUsersLoading = false;
        state.expiryUsersError = action.payload;
      })

      // fetchReminders
      .addCase(fetchReminders.pending, (state) => {
        state.remindersLoading = true;
        state.remindersError = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.remindersLoading = false;
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.remindersLoading = false;
        state.remindersError = action.payload;
      });
  },
});

export const { clearError, clearAll } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

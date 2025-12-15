// src/redux/slices/announcementSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosConfig";

// Helper: Normalize notification list response
const normalizeNotificationResponse = (respData) => {
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.notifications)) return respData.notifications;
  if (Array.isArray(respData.data)) return respData.data;
  if (respData?.notification) return [respData.notification];
  console.warn("Unexpected notification response format:", respData);
  return [];
};

/* ===== Send Announcement ===== */
export const sendAnnouncement = createAsyncThunk(
  "announcement/sendAnnouncement",
  async ({ targetRole, title, message }, { rejectWithValue }) => {
    try {
      const url = `/api/admin/send-message`;
      console.debug("sendAnnouncement payload:", { targetRole, title, message });

      const response = await axiosInstance.post(url, { targetRole, title, message });
      console.debug("sendAnnouncement response:", response.data);

      if (response.data?.success && response.data?.sentTo !== undefined) {
        return response.data;
      }

      if (response.data && response.data._id && response.data.title) {
        return response.data;
      }
if (response.data) return response.data;
      console.error("Invalid sendAnnouncement response:", response.data);
      return rejectWithValue("Invalid response from send announcement");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to send announcement";
      console.error("sendAnnouncement error:", {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

/* ===== Fetch Notifications ===== */
export const fetchNotifications = createAsyncThunk(
  "announcement/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/admin/notifications/sent`;
      const response = await axiosInstance.get(url);
      console.debug("fetchNotifications response:", response.data);

      const notifications = normalizeNotificationResponse(response.data);
      if (!Array.isArray(notifications)) {
        console.error("Invalid notifications array after normalization:", notifications);
        return rejectWithValue("Invalid response format from fetchNotifications");
      }

      const validNotifs = notifications.filter(
        (n) => n && typeof n === "object" && n._id && n.title
      );
      return validNotifs;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch notifications";
      console.error("fetchNotifications error:", {
        message: msg,
        status: err.response?.status,
        data: err.response?.data,
      });
      return rejectWithValue(msg);
    }
  }
);

/* ===== Delete + Optional Update ===== */
export const deleteNotification = createAsyncThunk(
  "announcement/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/admin/notifications/${id}/sender`);
      return { id, response: response.data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);



export const updateNotification = createAsyncThunk(
  "announcement/updateNotification",
  async ({ id, title, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/admin/notifications/${id}/sender`, { title, message });
      return { id, updated: response.data.notification };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);


// export const deleteAndUpdateNotification = createAsyncThunk(
//   "announcement/deleteAndUpdateNotification",
//   async ({ id, title, message }, { rejectWithValue }) => {
//     try {
//       const url = `/api/admin/notifications/${id}/sender`;
//       const body = {};
//       if (title?.trim()) body.title = title;
//       if (message?.trim()) body.message = message;

//       console.debug("deleteAndUpdate payload:", { id, body });

//       const response = await axiosInstance.delete(url, { data: body });
//       console.debug("deleteAndUpdate response:", response.data);

//       if (response.data?.success) {
//         return { id, response: response.data };
//       }

//       console.error("Invalid delete response:", response.data);
//       return rejectWithValue("Invalid response from delete notification");
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || "Failed to delete notification";
//       console.error("deleteAndUpdate error:", {
//         message: msg,
//         status: err.response?.status,
//         data: err.response?.data,
//       });
//       return rejectWithValue(msg);
//     }
//   }
// );

/* ===== Slice ===== */
const announcementSlice = createSlice({
  name: "announcement",
  initialState: {
    sendLoading: false,
    sendSuccess: false,
    sendError: null,
    sendResponse: null,

    notifications: [],
    listLoading: false,
    listError: null,

    deleteLoading: false,
    deleteSuccess: null,
    deleteError: null,

    updateLoading: false,
    updateError: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.sendError = null;
      state.listError = null;
      state.deleteError = null;
      state.updateError = null;
    },
    clearAll: (state) => {
      state.sendLoading = false;
      state.sendSuccess = false;
      state.sendError = null;
      state.sendResponse = null;
      state.notifications = [];
      state.listLoading = false;
      state.listError = null;
      state.deleteLoading = false;
      state.deleteSuccess = null;
      state.deleteError = null;
      state.updateLoading = false;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    // SEND
    builder
      .addCase(sendAnnouncement.pending, (state) => {
        state.sendLoading = true;
        state.sendError = null;
        state.sendSuccess = false;
      })
      .addCase(sendAnnouncement.fulfilled, (state, action) => {
        state.sendLoading = false;
        state.sendSuccess = true;
        state.sendResponse = action.payload;
      })
      .addCase(sendAnnouncement.rejected, (state, action) => {
        state.sendLoading = false;
        state.sendSuccess = false;
        state.sendError = action.payload;
      });

    // FETCH
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.listLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });

    // DELETE
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.notifications = state.notifications.filter(n => n._id !== action.payload.id);
        state.deleteSuccess = action.payload.response;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });

    // UPDATE
    builder
      .addCase(updateNotification.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.notifications.findIndex(n => n._id === action.payload.id);
        if (index !== -1) state.notifications[index] = action.payload.updated;
      })
      .addCase(updateNotification.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});



export const { clearErrors, clearAll } = announcementSlice.actions;
export default announcementSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axiosConfig';

// ✅ Login thunk
// export const login = createAsyncThunk(
//   'auth/login',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       console.log('Attempting login with:', { email, password });
//       const response = await axios.post('/api/auth/login', {
//         identifier: email, // backend expects "identifier"
//         password,
//       });
//       console.log('Login API response:', response.data); // Log full response

//       if (response.data?.accessToken) { // Changed from token to accessToken
//         try {
//           localStorage.setItem('token', response.data.accessToken); // Store accessToken as token
//           console.log('Token saved to localStorage:', localStorage.getItem('token')); // Verify storage
//         } catch (storageError) {
//           console.error('Failed to save token to localStorage:', storageError);
//           return rejectWithValue('Failed to save token to localStorage');
//         }
//       } else {
//         console.warn('No accessToken found in API response:', response.data);
//         return rejectWithValue('No accessToken provided by server');
//       }

//       return { ...response.data, token: response.data.accessToken }; // Return token for Redux state
//     } catch (error) {
//       console.error('Login error:', error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || 'Login failed');
//     }
//   }
// );


export const login = createAsyncThunk(
  "/api/auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await axios.post("/api/auth/login", {
        identifier: email, // backend expects "identifier"
        password,
      });

      const { accessToken, user } = response.data;

      if (!accessToken) {
        console.warn("No accessToken in API response:", response.data);
        return rejectWithValue("No accessToken provided by server");
      }

      // ✅ Store token & only user ID in localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("userId", user.id); // store only the ID

      console.log("Login successful, token & userId saved");

      return { token: accessToken, user };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);



// ✅ Logout thunk
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Calling logout API...");

      // 🔥 Call backend logout endpoint
      await axios.post("/api/auth/logout");

      // 🔥 Remove local items
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      console.log("Logout successful. Token & userId removed.");
      return true;
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Login pending...');
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token; // Use the mapped token
        state.isAuthenticated = true;
        console.log('Login fulfilled, Redux state:', {
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('Login rejected, error:', action.payload);
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        console.log('Logout fulfilled, Redux state reset');
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
        console.log("Logout rejected:", action.payload);
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
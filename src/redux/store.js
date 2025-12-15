import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // We'll create this next
import usersReducer from './slices/usersSlice'; 
import subscriptionReducer from './slices/subscriptionSlice'; 
import prescriptionReducer from './slices/prescriptionSlice'; 
import analyticsReducer from './slices/analyticsSlice'; 
import announcementReducer from "./slices/announcementSlice";
import rewardReducer from "./slices/rewardSlice";
import examReducer from "./slices/examSlice";
import systemsReducer from "./slices/systemsSlice";
import readModeReducer from "./slices/readModeSlice";
import certificateReducer from "./slices/certificateSlice"
import doctorCertificateReducer from "./slices/doctorCertificateSlice";
// Add other reducers later (e.g., usersReducer)

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
      subscriptions: subscriptionReducer,
      prescriptions: prescriptionReducer,
      analytics: analyticsReducer,
      announcement: announcementReducer,
      rewards: rewardReducer,
      exams: examReducer, // Ensure 'exams' key matches the imported reducer
      systems: systemsReducer,
      readMode: readModeReducer,
certificates: certificateReducer,
doctorCertificate: doctorCertificateReducer,
  },
});

export default store;
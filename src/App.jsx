// App.js
import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Dashboard from './Components/Dashboard';
import UserManagement from './Components/UserManagement';
import SubscriptionBilling from './Components/SubscriptionBilling';
import TemplateManagement from './Components/TemplateManagement';
import Analytics from './Components/Analytics';
import FeedbackSupport from './Components/FeedbackSupport';
import MessagingNotifications from './Components/MessagingNotifications';
import ContributionRewards from './Components/ContributionRewards';
import StudentExamScreen from './Components/StudentExamScreen';
import StudentExamList from './Components/studentexamlist';
import ReadMode from './Components/ReadMode';
import DoctorCertificateManager from './Components/DoctorCertificateManager';

import AdminChat from './Components/AdminChat';
import AdminTathastuReview from './Components/AdminTathastuReview';
import AdminTathastuSessions from './Components/AdminTathastuSessions';

import Login from './Components/Login';
import ProtectedRoute from './Components/ProtectedRoutes';

import Sidebar from './Components/Sidebar';
import ChatFileBubble from './Components/ChatFileBubble';

// ERROR BOUNDARY
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#B91C1C' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#0D9488',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();   // ⭐ Detect current route

  // ⭐ Hide sidebar ONLY on login page
  const hideSidebar = location.pathname === "/";

  const adminId =
    JSON.parse(localStorage.getItem("userData"))?._id || "admin";

  return (
    <div style={{ display: "flex", background: "#E0F2FE", minHeight: "100vh" }}>

      {/* ⭐ Show sidebar only if not on login page */}
      {!hideSidebar && (
        <Sidebar onToggle={(state) => setSidebarOpen(state)} />
      )}

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "1rem",
          marginLeft: !hideSidebar ? (sidebarOpen ? "240px" : "70px") : "0px",
          transition: "margin-left 0.35s ease",
        }}
      >
        <ErrorBoundary>
          <Routes>

            {/* LOGIN PAGE - NO SIDEBAR */}
            <Route path="/" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <SubscriptionBilling />
                </ProtectedRoute>
              }
            />

            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <TemplateManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackSupport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messaging"
              element={
                <ProtectedRoute>
                  <MessagingNotifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat-messaging"
              element={
                <ProtectedRoute>
                  <AdminChat adminId={adminId} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <ContributionRewards />
                </ProtectedRoute>
              }
            />

            <Route path="/tathastu-sessions" element={<AdminTathastuSessions />} />
            <Route path="/tathastu-sessions/:sessionId" element={<AdminTathastuReview />} />
            <Route path="/chat-messages" element={<ChatFileBubble />} />

            <Route path="/student-exam" element={<StudentExamScreen />} />
            <Route path="/student-exam-list" element={<StudentExamList />} />

            <Route path="/read-mode" element={<ReadMode />} />
            <Route path="/doccertificates" element={<DoctorCertificateManager />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;

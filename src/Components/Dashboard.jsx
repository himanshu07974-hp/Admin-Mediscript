import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAnalytics } from "../redux/slices/analyticsSlice";
import {
  FiUsers,
  FiUserCheck,
  FiRefreshCw,
  FiFileText,
  FiTrendingUp,
  FiCalendar,
  FiBarChart2,
  FiMessageCircle,
  FiAward,
} from "react-icons/fi";

function Dashboard() {
  const dispatch = useDispatch();

  const {
    totalDoctors,
    totalStudents,
    activeSubscriptions,
    revenue,
    prescriptionLibrary,
    status,
    error,
  } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const styles = {
    pageWrapper: {
      minHeight: "100vh",
      background: "#F8FAFC",
      padding: "2rem",
    },

    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "2.5rem",
    },

    header: {
      background:
        "linear-gradient(135deg, #0f766e, #14b8a6, #06b6d4)",
      borderRadius: "24px",
      padding: "3rem",
      color: "#fff",
      boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
    },

    title: {
      fontSize: "2.2rem",
      fontWeight: "800",
    },

    subtitle: {
      marginTop: "0.6rem",
      opacity: 0.95,
      fontSize: "1.05rem",
    },

    sectionTitle: {
      fontSize: "1.45rem",
      fontWeight: "700",
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "1.5rem",
    },

    statCard: {
      background: "#fff",
      borderRadius: "18px",
      padding: "1.6rem",
      boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
      transition: "0.3s ease",
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
    },

    statIcon: {
      width: "46px",
      height: "46px",
      borderRadius: "14px",
      background: "#ECFDF5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#0f766e",
      fontSize: "1.4rem",
    },

    statLabel: {
      fontSize: "0.9rem",
      color: "#64748b",
    },

    statValue: {
      fontSize: "1.8rem",
      fontWeight: "800",
      color: "#0f172a",
    },

    revenueGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "1.5rem",
    },

    revenueCard: {
      borderRadius: "20px",
      padding: "1.8rem",
      background:
        "linear-gradient(135deg, #ECFEFF, #F0FDFA)",
      border: "1px solid #99f6e4",
      boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
    },

    revenueValue: {
      fontSize: "2rem",
      fontWeight: "800",
      color: "#0f766e",
      marginTop: "0.4rem",
    },

    revenueLabel: {
      fontSize: "0.95rem",
      color: "#475569",
    },

    actionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "1.5rem",
    },

    actionCard: {
      background: "#fff",
      borderRadius: "18px",
      padding: "1.6rem 1.2rem",
      textAlign: "center",
      boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
      transition: "0.3s ease",
    },

    actionIcon: {
      width: "56px",
      height: "56px",
      borderRadius: "16px",
      background: "#ECFDF5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.6rem",
      margin: "0 auto 0.7rem",
      color: "#0f766e",
    },

    actionLabel: {
      fontWeight: "700",
      fontSize: "0.95rem",
      color: "#0f172a",
    },
  };

  const actions = [
    { label: "User Management", icon: <FiUsers />, path: "/users" },
    { label: "Subscription", icon: <FiRefreshCw />, path: "/subscription" },
    { label: "Templates", icon: <FiFileText />, path: "/templates" },
    { label: "Analytics", icon: <FiBarChart2 />, path: "/analytics" },
    { label: "Student Performance", icon: <FiUserCheck />, path: "/student-exam list" },
    { label: "Messaging", icon: <FiMessageCircle />, path: "/messaging" },
    { label: "Rewards", icon: <FiAward />, path: "/rewards" },
  ];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back, Admin 👋</h1>
          <p style={styles.subtitle}>
            Complete overview of your medical platform performance
          </p>
        </div>

        {status === "loading" && <p>Loading dashboard...</p>}
        {status === "failed" && <p style={{ color: "red" }}>{error}</p>}

        {/* Overview Stats */}
        <h2 style={styles.sectionTitle}>📊 Overview Statistics</h2>
        <div style={styles.grid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}><FiUserCheck /></div>
            <div style={styles.statValue}>{totalDoctors || 0}</div>
            <div style={styles.statLabel}>Doctors Registered</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}><FiUsers /></div>
            <div style={styles.statValue}>{totalStudents || 0}</div>
            <div style={styles.statLabel}>Medical Students</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}><FiRefreshCw /></div>
            <div style={styles.statValue}>{activeSubscriptions || 0}</div>
            <div style={styles.statLabel}>Active Subscriptions</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}><FiFileText /></div>
            <div style={styles.statValue}>
              {prescriptionLibrary?.totalPrescriptions || 0}
            </div>
            <div style={styles.statLabel}>Total Prescriptions</div>
          </div>
        </div>

        {/* Revenue */}
        <h2 style={styles.sectionTitle}>💰 Revenue Overview</h2>
        <div style={styles.revenueGrid}>
          <div style={styles.revenueCard}>
            <div style={styles.revenueLabel}>Today</div>
            <div style={styles.revenueValue}>
              ₹{revenue?.today?.toLocaleString() || 0}
            </div>
          </div>

          <div style={styles.revenueCard}>
            <div style={styles.revenueLabel}>This Month</div>
            <div style={styles.revenueValue}>
              ₹{revenue?.month?.toLocaleString() || 0}
            </div>
          </div>

          <div style={styles.revenueCard}>
            <div style={styles.revenueLabel}>This Year</div>
            <div style={styles.revenueValue}>
              ₹{revenue?.year?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* Actions */}
        <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
        <div style={styles.actionGrid}>
          {actions.map((action, i) => (
            <Link key={i} to={action.path} style={{ textDecoration: "none" }}>
              <div style={styles.actionCard}>
                <div style={styles.actionIcon}>{action.icon}</div>
                <div style={styles.actionLabel}>{action.label}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

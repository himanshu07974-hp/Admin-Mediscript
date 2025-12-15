import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import { fetchAnalytics } from "../redux/slices/analyticsSlice";

function Analytics() {
  const dispatch = useDispatch();
  const { totalDoctors, totalStudents, activeSubscriptions, revenue, status, error } =
    useSelector((state) => state.analytics);

  useEffect(() => {
    console.log("%c[Analytics.jsx] Dispatching fetchAnalytics()", "color: purple;");
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      padding: "1rem",
      backgroundColor: "#E0F2FE",
      color: "#1E293B",
      width: "100%",
      boxSizing: "border-box",
    },
    header: {
      backgroundColor: "#FFFFFF",
      padding: "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    chartContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "0.75rem",
    },
    chartCard: {
      backgroundColor: "#FFFFFF",
      padding: "0.75rem",
      borderRadius: "0.75rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    },
    chartTitle: {
      fontSize: "1.1rem",
      fontWeight: "600",
      marginBottom: "0.75rem",
    },
  };

  const customTooltipStyle = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E0E0E0",
    borderRadius: "4px",
    padding: "0.5rem",
    fontSize: "0.8rem",
    maxWidth: "180px",
    whiteSpace: "normal",
    wordWrap: "break-word",
  };

  // convert API data to recharts data format
  const doctorUsageData = [
    { name: "Total Doctors", value: totalDoctors },
    { name: "Active Subscriptions", value: activeSubscriptions },
  ];

  const studentUsageData = [
    { name: "Total Students", value: totalStudents },
    { name: "Doctors", value: totalDoctors },
  ];

  const revenueData = [
    { name: "Today", amount: revenue?.today || 0 },
    { name: "Month", amount: revenue?.month || 0 },
    { name: "Year", amount: revenue?.year || 0 },
  ];

  const summaryData = [
    { name: "Doctors", count: totalDoctors },
    { name: "Students", count: totalStudents },
    { name: "Subscriptions", count: activeSubscriptions },
  ];

  const mobileStyles = `
    @media (max-width: 768px) {
      .container { padding: 0.75rem; }
      .header { padding: 0.75rem; }
      .title { font-size: 1.1rem; }
      .chartContainer { grid-template-columns: 1fr; }
      .chartCard { padding: 0.5rem; }
      .chartTitle { font-size: 0.95rem; }
      .recharts-text, .recharts-label, .recharts-legend-item-text {
        font-size: 0.85rem !important;
      }
    }
    @media (max-width: 480px) {
      .container { padding: 0.5rem; }
      .header { padding: 0.5rem; }
      .title { font-size: 0.95rem; }
      .chartCard { padding: 0.4rem; }
      .chartTitle { font-size: 0.9rem; }
      .recharts-text, .recharts-label, .recharts-legend-item-text {
        font-size: 0.75rem !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>

      <div style={styles.container} className="container">
        <div style={styles.header} className="header">
          <h1 style={styles.title} className="title">
            Analytics & Reports
          </h1>
        </div>

        {/* Status / Error */}
        {status === "loading" && (
          <p style={{ textAlign: "center", color: "#0ea5e9" }}>Loading data...</p>
        )}
        {status === "failed" && (
          <p style={{ textAlign: "center", color: "red" }}>
            Error fetching data: {error?.message || "Something went wrong"}
          </p>
        )}

        {/* Charts */}
        <div style={styles.chartContainer} className="chartContainer">
          <div style={styles.chartCard} className="chartCard">
            <h2 style={styles.chartTitle}>Doctor Stats</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={doctorUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Bar dataKey="value" fill="#0D9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartCard} className="chartCard">
            <h2 style={styles.chartTitle}>Student Stats</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={studentUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Bar dataKey="value" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartContainer} className="chartContainer">
          <div style={styles.chartCard} className="chartCard">
            <h2 style={styles.chartTitle}>Revenue</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Bar dataKey="amount" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartCard} className="chartCard">
            <h2 style={styles.chartTitle}>Overview</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Bar dataKey="count" fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

export default Analytics;

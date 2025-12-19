// src/pages/AdminTathastuSessions.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { FaCircle, FaSearch } from "react-icons/fa";
import { format } from "date-fns";

const statusColors = {
  IN_PROGRESS: "#f59e0b",          // amber-500
  PENDING_ADMIN_REVIEW: "#f97316", // orange-500
  ADMIN_REPLIED: "#22c55e",        // green-500
  COMPLETED: "#6b7280",            // gray-500
};

const statusLabels = {
  IN_PROGRESS: "Doctor Filling",
  PENDING_ADMIN_REVIEW: "Waiting for Review",
  ADMIN_REPLIED: "Prescription Sent",
  COMPLETED: "Completed",
};

const AdminTathastuSessions = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadDoctorSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/chat-session/doctor-list");
      const docs = res.data?.data || [];
      setDoctors(docs);
      setFilteredDoctors(docs);
    } catch (err) {
      console.error("Error loading doctor list:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load TATHASTU sessions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorSessions();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFilteredDoctors(doctors);
      return;
    }
    setFilteredDoctors(
      doctors.filter((d) => {
        const name = (d.name || "").toLowerCase();
        const spec = (d.specialization || "").toLowerCase();
        const last = (d.lastMessage || "").toLowerCase();
        return (
          name.includes(q) || spec.includes(q) || (last && last.includes(q))
        );
      })
    );
  }, [search, doctors]);

  const formatRelativeDate = (dt) => {
    if (!dt) return "";
    try {
      return format(new Date(dt), "dd MMM, p");
    } catch {
      return "";
    }
  };

  const handleOpenSession = (doc) => {
    const session = doc.activeSession;
    if (!session?._id) return;
    navigate(`/tathastu-sessions/${session._id}`);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 28px",
          background: "linear-gradient(135deg, #024e5a, #036a7a)",
          color: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
              TATHASTU Sessions
            </h1>
            <p style={{ margin: "6px 0 0", opacity: 0.9, fontSize: 15 }}>
              Review doctor-submitted cases and send prescriptions
            </p>
          </div>
          <button
            onClick={loadDoctorSessions}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "16px 24px", background: "#f1f5f9" }}>
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <FaSearch
            size={16}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
            }}
          />
          <input
            type="text"
            placeholder="Search by doctor name, speciality or latest note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px 14px 44px",
              borderRadius: 16,
              border: "none",
              outline: "none",
              fontSize: 15,
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            margin: "0 24px 12px",
            padding: "12px 16px",
            borderRadius: 12,
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: 14,
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* Doctor List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            Loading sessions…
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: "#64748b",
              fontSize: 16,
            }}
          >
            {search ? "No matching sessions found." : "No TATHASTU sessions yet."}
          </div>
        ) : (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {filteredDoctors.map((doc) => {
              const status = doc.activeSession?.status || null;
              const sessionId = doc.activeSession?._id;
              const unread = doc.unreadCount || 0;
              const statusColor = status ? statusColors[status] : "#94a3b8";
              const statusLabel = status ? statusLabels[status] : "No active case";

              return (
                <div
                  key={doc.doctorId}
                  style={{
                    background: "#ffffff",
                    borderRadius: 18,
                    padding: "16px 20px",
                    marginBottom: 16,
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    cursor: sessionId ? "pointer" : "default",
                  }}
                  onClick={() => sessionId && handleOpenSession(doc)}
                  onMouseOver={(e) => {
                    if (sessionId) e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 20,
                        color: "#4338ca",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {(doc.name || "D")[0].toUpperCase()}
                    </div>
                    {doc.online && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          width: 16,
                          height: 16,
                          background: "#22c55e",
                          borderRadius: "50%",
                          border: "3px solid white",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>
                          {doc.name}
                        </div>
                        {doc.specialization && (
                          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                            {doc.specialization}
                          </div>
                        )}
                        {doc.lastMessage && (
                          <div
                            style={{
                              fontSize: 13,
                              color: "#4b5563",
                              marginTop: 8,
                              lineHeight: 1.4,
                              maxWidth: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {doc.lastMessage}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {/* Status Pill */}
                        <div
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            color: statusColor,
                            background: `${statusColor}22`,
                            border: `1px solid ${statusColor}44`,
                            marginBottom: 8,
                          }}
                        >
                          {statusLabel}
                        </div>

                        {/* Time */}
                        {doc.lastMessageAt && (
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            {formatRelativeDate(doc.lastMessageAt)}
                          </div>
                        )}

                        {/* Unread Badge */}
                        {unread > 0 && (
                          <div
                            style={{
                              marginTop: 8,
                              minWidth: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "#ef4444",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 8px",
                              boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
                            }}
                          >
                            {unread > 99 ? "99+" : unread}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 12,
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {sessionId
                          ? `Session ID: ${sessionId.slice(0, 10)}…`
                          : "No active session"}
                      </div>

                      <button
                        disabled={!sessionId}
                        style={{
                          padding: "8px 18px",
                          borderRadius: 12,
                          border: "none",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: sessionId ? "pointer" : "not-allowed",
                          background: sessionId
                            ? "linear-gradient(135deg, #024e5a, #036a7a)"
                            : "#cbd5e1",
                          color: "white",
                          transition: "all 0.2s",
                          boxShadow: sessionId ? "0 4px 12px rgba(2,78,90,0.3)" : "none",
                        }}
                        onMouseOver={(e) => {
                          if (sessionId) e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {status === "ADMIN_REPLIED" ? "View Prescription" : "Open Case"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTathastuSessions;
// src/pages/AdminTathastuSessions.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { FaCircle } from "react-icons/fa";
import { format } from "date-fns";

const statusColors = {
  IN_PROGRESS: "#fbbf24",          // amber
  PENDING_ADMIN_REVIEW: "#f97316", // orange
  ADMIN_REPLIED: "#22c55e",        // green
  COMPLETED: "#6b7280",            // gray
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

  // search filter by doctor name / specialization / last message
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
        background: "#f0f2f5",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg,#024e5a,#036a7a)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            TATHASTU Sessions
          </h1>
          <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: 14 }}>
            Review doctor-submitted cases and send prescriptions
          </p>
        </div>

        <button
          onClick={loadDoctorSessions}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Refresh
        </button>
      </div>

      {/* Search + list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Search bar */}
        <div style={{ padding: "12px 20px" }}>
          <input
            type="text"
            placeholder="Search by doctor name, speciality or latest note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 14,
              background: "#ffffff",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              margin: "0 20px 8px",
              padding: "8px 12px",
              borderRadius: 8,
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 16px 16px",
          }}
        >
          {loading ? (
            <div style={{ padding: 24, textAlign: "center" }}>Loading…</div>
          ) : filteredDoctors.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
              No TATHASTU sessions yet.
            </div>
          ) : (
            filteredDoctors.map((doc) => {
              const status = doc.activeSession?.status || null;
              const sessionId = doc.activeSession?._id;
              const unread = doc.unreadCount || 0;
              const statusColor = status ? statusColors[status] : "#9ca3af";
              const statusLabel = status ? statusLabels[status] : "No active case";

              return (
                <div
                  key={doc.doctorId}
                  style={{
                    background: "#ffffff",
                    borderRadius: 14,
                    padding: "12px 14px",
                    marginBottom: 10,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      {(doc.name || "D")[0].toUpperCase()}
                    </div>
                    {doc.online && (
                      <FaCircle
                        size={10}
                        color="#22c55e"
                        style={{ position: "absolute", bottom: -1, right: -1 }}
                      />
                    )}
                  </div>

                  {/* Main body */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                          {doc.name}
                        </div>
                        {doc.specialization && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              marginTop: 2,
                            }}
                          >
                            {doc.specialization}
                          </div>
                        )}
                        {doc.lastMessage && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#4b5563",
                              marginTop: 6,
                              maxWidth: 320,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {doc.lastMessage}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 6,
                        }}
                      >
                        {/* Status pill */}
                        <div
                          style={{
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            color: "#111827",
                            background: `${statusColor}22`,
                            border: `1px solid ${statusColor}`,
                          }}
                        >
                          {statusLabel}
                        </div>

                        {/* Timestamp */}
                        {doc.lastMessageAt && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                            }}
                          >
                            {formatRelativeDate(doc.lastMessageAt)}
                          </div>
                        )}

                        {/* Unread badge */}
                        {unread > 0 && (
                          <div
                            style={{
                              minWidth: 20,
                              height: 20,
                              borderRadius: 999,
                              background: "#ef4444",
                              color: "#ffffff",
                              fontSize: 11,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 6px",
                            }}
                          >
                            {unread > 99 ? "99+" : unread}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: open button */}
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        {sessionId
                          ? `Session: ${sessionId.slice(0, 8)}…`
                          : "No active TATHASTU session"}
                      </div>

                      <button
                        disabled={!sessionId}
                        onClick={() => handleOpenSession(doc)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "none",
                          fontSize: 13,
                          cursor: sessionId ? "pointer" : "not-allowed",
                          background: sessionId
                            ? "linear-gradient(135deg,#024e5a,#036a7a)"
                            : "#d1d5db",
                          color: "white",
                        }}
                      >
                        {status === "ADMIN_REPLIED"
                          ? "View Prescription"
                          : "Open Case"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTathastuSessions;

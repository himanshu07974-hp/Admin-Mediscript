import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import {
  FaArrowLeft,
  FaUserMd,
  FaStethoscope,
  FaPaperclip,
  FaPaperPlane,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { format } from "date-fns";
import { initSocket } from "../socket";
import ChatFileBubble from "../Components/ChatFileBubble";

const AdminTathastuReview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const normalizeMessage = (msg = {}) => {
    const time =
      msg.time || msg.createdAt || msg.createdAtISO || new Date().toISOString();

    const text =
      typeof msg === "string"
        ? msg
        : msg.text ||
          msg.message ||
          msg.content ||
          msg.answer ||
          msg.adminResponse ||
          "";

    return {
      _key: msg._id || msg.messageId || msg._tempId || crypto.randomUUID(),
      _id: msg._id || null,
      from: (msg.from || msg.sender || "system").toLowerCase(),
      senderId:
        msg.senderId ||
        msg.fromId ||
        msg.userId ||
        msg.adminId ||
        msg.createdBy ||
        (msg.user && msg.user._id) ||
        null,
      type: msg.type || (msg.fileUrl ? "file" : text ? "text" : "system"),
      text,
      fileUrl: msg.fileUrl || msg.file?.url || null,
      fileName: msg.fileName || msg.file?.name || null,
      mimeType: msg.mimeType || msg.file?.mimeType || null,
      time,
    };
  };

  const loadSession = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `/api/chat-session/session/${sessionId}`
      );
      const data = res.data?.data || res.data?.session || null;
      if (!data) {
        setError("Session not found");
      } else {
        setSession(data);
        setResponseText(data.adminResponse || "");

        if (Array.isArray(data.messages)) {
          console.log("FULL SESSION DATA:", data);

          const prepared = (data.messages || []).map((m) =>
            normalizeMessage({
              ...m,
              senderId:
                m.senderId ||
                m.fromId ||
                m.userId ||
                m.adminId ||
                ((m.from || m.sender || "").toString().toLowerCase() === "admin"
                  ? data.adminId || data.admin?._id || null
                  : null) ||
                ((m.from || m.sender || "").toString().toLowerCase() ===
                "doctor"
                  ? data.doctorId || data.doctor?._id || null
                  : null),
            })
          );
          setMessages(prepared);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Load session error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load session"
      );
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 40);
    }
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const myId = localStorage.getItem("userId");
    if (!myId) return;

    if (!socketRef.current) {
      socketRef.current = initSocket(myId);
    }

    const socket = socketRef.current;

    const handleDoctorReply = (payload) => {
      if (!payload) return;
      if (String(payload.sessionId) !== String(sessionId)) return;

      let raw = payload.messageObject || payload.message || payload;

      if (typeof raw === "string") {
        raw = {
          from: "doctor",
          senderId: session?.doctorId?._id || session?.doctorId || null,
          text: raw,
          type: "text",
          time: new Date().toISOString(),
        };
      }

      if (!raw.text && !raw.fileUrl) return;

      const normalized = normalizeMessage(raw);

      setMessages((prev) => {
        if (normalized._id && prev.some((m) => m._id === normalized._id)) {
          return prev;
        }

        if (
          normalized.fileUrl &&
          prev.some((m) => m.fileUrl === normalized.fileUrl)
        ) {
          return prev;
        }

        return [...prev, normalized];
      });

      setTimeout(scrollToBottom, 50);
    };

    socket.on("doctorReplyAdmin", handleDoctorReply);
    socket.on("doctorFileMessage", handleDoctorReply);

    return () => {
      socket.off("doctorReplyAdmin", handleDoctorReply);
      socket.off("doctorFileMessage", handleDoctorReply);
    };
  }, [sessionId, session]);

  const handleSubmitResponse = async () => {
    const trimmed = responseText.trim();
    if (!trimmed || !sessionId) return;

    setSaving(true);
    setError("");
    try {
      const res = await axiosInstance.post(
        `/api/chat-session/admin-response/${sessionId}`,
        { responseText: trimmed }
      );

      const updated = res.data?.data ||
        res.data?.session || {
          ...session,
          adminResponse: trimmed,
          status: "ADMIN_REPLIED",
        };

      setSession((prev) => ({
        ...(prev || {}),
        ...updated,
        adminResponse: updated.adminResponse || trimmed,
        status: updated.status || "ADMIN_REPLIED",
      }));

      const returnedMessages =
        (updated && Array.isArray(updated.messages) && updated.messages) ||
        (res.data?.session &&
          Array.isArray(res.data.session.messages) &&
          res.data.session.messages) ||
        (res.data?.data &&
          Array.isArray(res.data.data.messages) &&
          res.data.data.messages) ||
        null;

      if (returnedMessages) {
        setMessages(returnedMessages.map(normalizeMessage));
      } else {
        const backendMsg =
          res.data?.message || res.data?.createdMessage || null;
        if (backendMsg) {
          setMessages((prev) => [...prev, normalizeMessage(backendMsg)]);
        } else {
          const now = new Date().toISOString();
          const optimistic = normalizeMessage({
            from: "admin",
            sender: "admin",
            senderId: localStorage.getItem("userId") || null,
            message: trimmed,
            text: trimmed,
            type: "text",
            createdAt: now,
            time: now,
          });
          setMessages((prev) => [...prev, optimistic]);
        }
      }

      setResponseText("");
      setTimeout(scrollToBottom, 60);
    } catch (err) {
      console.error("Admin response error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit prescription"
      );
    } finally {
      setSaving(false);
    }
  };

  const replaceMessageByTempId = (tempId, newMsg) => {
    setMessages((prev) => prev.map((m) => (m._tempId === tempId ? newMsg : m)));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !sessionId) return;

    setSaving(true);
    setError("");
    const tempId = `temp-${Date.now()}`;
    try {
      const optimistic = normalizeMessage({
        from: "admin",
        senderId: localStorage.getItem("userId"),
        type: "file",
        fileUrl: null,
        fileName: file.name,
        mimeType: file.type,
        time: new Date().toISOString(),
        _tempId: tempId,
        status: "uploading",
      });
      setMessages((prev) => [...prev, optimistic]);
      setTimeout(scrollToBottom, 40);

      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post(
        `/api/chat-session/${sessionId}/upload-file`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("upload-file response:", res.data);
      const uploaded =
        res.data?.message || res.data?.messageObject || res.data?.data || null;
      if (!uploaded) {
        throw new Error("Invalid API response: no message returned");
      }

      const backendMsg = res.data?.messageObject || uploaded;
      const normalized = normalizeMessage({
        ...backendMsg,
        senderId:
          backendMsg.senderId ||
          backendMsg.userId ||
          localStorage.getItem("userId"),
        type: backendMsg.type || "file",
      });

      if (normalized._id) {
        replaceMessageByTempId(tempId, normalized);
      } else {
        setMessages((prev) => [
          ...prev.filter((m) => m._tempId !== tempId),
          normalized,
        ]);
      }

      setTimeout(scrollToBottom, 80);
    } catch (err) {
      console.error("File upload error:", err, err.response?.data);
      setError("Failed to upload file");
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId
            ? { ...m, status: "error", text: "Upload failed" }
            : m
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (dt) => {
    if (!dt) return "";
    try {
      return format(new Date(dt), "dd MMM yyyy, p");
    } catch {
      return "";
    }
  };

  const renderMessageBubble = (msg) => {
    const currentUserId = (localStorage.getItem("userId") || "").toString();
    const currentUserRole = (localStorage.getItem("role") || "")
      .toString()
      .toLowerCase();

    const fromRaw = (msg.from || msg.sender || "system")
      .toString()
      .toLowerCase();
    const isMine =
      (msg.senderId && String(msg.senderId) === String(currentUserId)) ||
      fromRaw === currentUserRole ||
      (fromRaw === "admin" && currentUserRole.includes("admin"));

    const isSystem = fromRaw === "system";

    const label = isSystem
      ? "System"
      : isMine
      ? "You"
      : fromRaw === "doctor"
      ? "Doctor"
      : msg.from || "User";

    // Format time to show only time (like WhatsApp)
    const getTimeOnly = (dt) => {
      if (!dt) return "";
      try {
        return format(new Date(dt), "p"); // e.g., "6:31 PM"
      } catch {
        return "";
      }
    };

    const timeStr = getTimeOnly(msg.time || msg.createdAt);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: isSystem
            ? "center"
            : isMine
            ? "flex-end"
            : "flex-start",
          marginBottom: "4px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div
          style={{
            maxWidth: isSystem ? "70%" : "65%",
            display: "inline-block",
          }}
        >
          {/* Sender label only for non-system and non-mine messages */}
          {!isSystem && !isMine && (
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#025f6d",
                marginBottom: "2px",
                paddingLeft: "4px",
              }}
            >
              {label}
            </div>
          )}

          <div
            style={{
              padding:
                msg.type === "file"
                  ? "6px"
                  : isSystem
                  ? "8px 12px"
                  : "7px 10px 7px 10px",
              borderRadius: isSystem
                ? "8px"
                : isMine
                ? "8px 8px 0px 8px"
                : "0px 8px 8px 8px",
              fontSize: "13.5px",
              lineHeight: "1.4",
              boxShadow: isSystem
                ? "0 1px 2px rgba(0,0,0,0.05)"
                : "0 1px 2px rgba(0,0,0,0.12)",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              background: isSystem ? "#f1f5f9" : isMine ? "#005c4b" : "#ffffff",
              color: isSystem ? "#475569" : isMine ? "#ffffff" : "#1f2937",
              border: isSystem ? "none" : isMine ? "none" : "1px solid #e5e7eb",
              display: "inline-block",
              maxWidth: "100%",
              position: "relative",
            }}
          >
            {msg.type === "file" ? (
              <div>
                <ChatFileBubble
                  isMine={isMine}
                  from={msg.from}
                  senderId={msg.senderId}
                  fileUrl={msg.fileUrl}
                  fileName={msg.fileName}
                  mimeType={msg.mimeType}
                  time={msg.time}
                />
                {/* Time below file */}
                {!isSystem && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: isMine ? "rgba(255,255,255,0.7)" : "#667781",
                      marginTop: "4px",
                      textAlign: "right",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "3px",
                    }}
                  >
                    {timeStr}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}
              >
                <div style={{ flex: 1 }}>{msg.text}</div>
                {/* Time inside bubble at bottom-right like WhatsApp */}
                {!isSystem && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: isMine ? "rgba(255,255,255,0.7)" : "#667781",
                      whiteSpace: "nowrap",
                      paddingLeft: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      alignSelf: "flex-end",
                    }}
                  >
                    {timeStr}
                    {isMine && (
                      <svg
                        width="16"
                        height="11"
                        viewBox="0 0 16 11"
                        fill="none"
                      >
                        <path
                          d="M11.071.653a.5.5 0 0 0-.707 0L6.5 4.517 4.136 2.153a.5.5 0 0 0-.707.707l2.718 2.718a.5.5 0 0 0 .707 0l4.217-4.218a.5.5 0 0 0 0-.707zM15.071.653a.5.5 0 0 0-.707 0L10.5 4.517 8.136 2.153a.5.5 0 0 0-.707.707l2.718 2.718a.5.5 0 0 0 .707 0l4.217-4.218a.5.5 0 0 0 0-.707z"
                          fill="rgba(255,255,255,0.7)"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const patient = session?.patientDetails || {};
  const doctor = session?.doctor || {};

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f9fafb",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, #024e5a, #036a7a)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 16px rgba(2, 78, 90, 0.25)",
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/tathastu-sessions")}
          aria-label="Go back"
          style={{
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "8px",
            transition: "background 0.2s",
            width: "36px",
            height: "36px",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
        >
          <FaArrowLeft size={16} />
        </button>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
          className="mobile-menu-btn"
          style={{
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            borderRadius: "8px",
            width: "36px",
            height: "36px",
            flexShrink: 0,
          }}
        >
          {isSidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}
          >
            TATHASTU Case Review
          </div>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.95,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {doctor?.name && (
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <FaUserMd size={12} />
                <span className="doctor-name">{doctor.name}</span>
              </span>
            )}
            {doctor?.specialization && (
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <FaStethoscope size={12} />
                <span className="doctor-spec">{doctor.specialization}</span>
              </span>
            )}
          </div>
        </div>

        <div
          className="session-id-display"
          style={{
            fontSize: "11px",
            opacity: 0.9,
            fontFamily: "monospace",
            flexShrink: 0,
          }}
        >
          Session: {sessionId?.slice(0, 8)}…
        </div>
      </header>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Sidebar Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 4,
              display: "none",
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className="patient-sidebar"
          style={{
            width: "360px",
            maxWidth: "100%",
            background: "white",
            borderRight: "1px solid #e5e7eb",
            overflowY: "auto",
            transition: "transform 0.3s ease",
            zIndex: 5,
            flexShrink: 0,
          }}
        >
          <div style={{ padding: "20px" }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "14px" }}>Loading patient details…</div>
              </div>
            ) : error ? (
              <div
                style={{
                  color: "#dc2626",
                  fontSize: "14px",
                  padding: "20px",
                  background: "#fef2f2",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            ) : !session ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#6b7280",
                }}
              >
                No session data.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "4px",
                        height: "20px",
                        background: "linear-gradient(135deg, #024e5a, #036a7a)",
                        borderRadius: "2px",
                      }}
                    ></span>
                    Patient Details
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0",
                    }}
                  >
                    Verify all information before prescribing
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <FieldRow label="Patient Name" value={patient.name} />
                  <FieldRow label="Age / Sex" value={patient.ageSex} />
                  <FieldRow label="Weight (kg)" value={patient.weight} />
                  <FieldRow label="Height" value={patient.height} />
                  <FieldRow
                    label="Pregnancy / Lactation"
                    value={patient.pregnancyStatus}
                  />
                  <FieldRow
                    label="Diagnosis / Provisional"
                    value={patient.diagnosis}
                    multi
                  />
                  <FieldRow
                    label="Clinical Notes / Symptoms"
                    value={patient.clinicalNotes}
                    multi
                  />
                  <FieldRow
                    label="Allergies / Comorbidities"
                    value={patient.allergies}
                    multi
                  />
                  <FieldRow
                    label="Current Medications"
                    value={patient.medications}
                    multi
                  />
                  <FieldRow
                    label="Key Investigation Values"
                    value={patient.investigations}
                    multi
                  />

                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      borderRadius: "10px",
                      background:
                        "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
                      border: "1px solid #bfdbfe",
                      fontSize: "11px",
                      lineHeight: "1.5",
                      color: "#1e40af",
                    }}
                  >
                    <strong>⚕️ Important:</strong> TATHASTU is an AI assistant.
                    All prescriptions must be clinically reviewed and signed by
                    a registered medical practitioner.
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "white",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: "#efeae2",
              padding: "20px 0",
            }}
          >
            <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
              <div
                style={{
                  padding: "0 16px 16px 16px",
                  borderBottom: "1px solid #e5e7eb",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Case Timeline
                </h3>
                <p
                  style={{
                    margin: "0",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Conversation between doctor and TATHASTU AI
                </p>
              </div>

              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#6b7280",
                  }}
                >
                  <div style={{ fontSize: "14px" }}>Loading messages…</div>
                </div>
              ) : messages.length ? (
                <>
                  {messages.map((m) => (
                    <div key={m._key}>{renderMessageBubble(m)}</div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  No messages yet
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              background: "white",
              padding: "16px 20px",
              boxShadow: "0 -4px 16px rgba(0,0,0,0.04)",
              flexShrink: 0,
            }}
          >
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Final Prescription
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background:
                      session?.status === "ADMIN_REPLIED"
                        ? "#dcfce7"
                        : "#f3f4f6",
                    color:
                      session?.status === "ADMIN_REPLIED"
                        ? "#166534"
                        : "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  {session?.status || "PENDING"}
                </span>
              </div>

              <div style={{ position: "relative" }}>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type the final prescription here (medications, dosage, duration, and advice)…"
                  style={{
                    width: "100%",
                    resize: "vertical",
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    padding: "14px 16px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#024e5a")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "12px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <small
                  className="helper-text"
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    flex: "1",
                    minWidth: "200px",
                  }}
                >
                  Send prescription text or attach files (PDF, images, reports)
                </small>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="file"
                    id="fileUpload"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() =>
                      document.getElementById("fileUpload").click()
                    }
                    disabled={saving}
                    aria-label="Upload file"
                    style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      color: "#374151",
                      cursor: saving ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                      opacity: saving ? 0.6 : 1,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) =>
                      !saving && (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <FaPaperclip size={14} />
                    <span className="button-text">File</span>
                  </button>

                  <button
                    onClick={handleSubmitResponse}
                    disabled={
                      saving || !responseText.trim() || !sessionId || loading
                    }
                    aria-label="Send prescription"
                    style={{
                      padding: "10px 24px",
                      borderRadius: "10px",
                      border: "none",
                      background:
                        saving || !responseText.trim()
                          ? "#cbd5e1"
                          : "linear-gradient(135deg, #024e5a, #036a7a)",
                      color: "white",
                      cursor:
                        saving || !responseText.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                      boxShadow:
                        saving || !responseText.trim()
                          ? "none"
                          : "0 4px 12px rgba(2, 78, 90, 0.25)",
                      flexShrink: 0,
                    }}
                  >
                    {saving ? (
                      "Sending…"
                    ) : (
                      <>
                        <FaPaperPlane size={14} />
                        <span className="button-text">Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    fontSize: "13px",
                    color: "#dc2626",
                    background: "#fef2f2",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .patient-sidebar {
            position: absolute !important;
            left: 0;
            top: 0;
            bottom: 0;
            width: 360px !important;
            transform: ${isSidebarOpen ? "translateX(0)" : "translateX(-100%)"};
          }
          
          .sidebar-overlay {
            display: ${isSidebarOpen ? "block" : "none"} !important;
          }
          
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        @media (max-width: 768px) {
          .patient-sidebar {
            width: 320px !important;
          }

          .session-id-display {
            display: none !important;
          }

          .doctor-name,
          .doctor-spec {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .button-text {
            display: inline;
          }
        }

        @media (max-width: 640px) {
          /* WhatsApp-style compact bubbles on mobile */
          main > div:first-child > div > div {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .patient-sidebar {
            width: 85vw !important;
            max-width: 300px !important;
          }

          .helper-text {
            display: none !important;
          }

          .button-text {
            display: none !important;
          }

          header {
            padding: 12px 16px !important;
          }

          header > div:first-of-type {
            font-size: 16px !important;
          }

          header > div:first-of-type > div:last-child {
            font-size: 11px !important;
          }
        }

        @media (max-width: 380px) {
          .patient-sidebar {
            width: 90vw !important;
          }
        }

        /* Smooth scrollbar */
        .patient-sidebar::-webkit-scrollbar,
        main > div:first-child::-webkit-scrollbar {
          width: 6px;
        }

        .patient-sidebar::-webkit-scrollbar-track,
        main > div:first-child::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .patient-sidebar::-webkit-scrollbar-thumb,
        main > div:first-child::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .patient-sidebar::-webkit-scrollbar-thumb:hover,
        main > div:first-child::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Loading animations */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Focus visible for accessibility */
        button:focus-visible {
          outline: 2px solid #024e5a;
          outline-offset: 2px;
        }

        textarea:focus-visible {
          outline: 2px solid #024e5a;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

// Helper component for patient field rows
const FieldRow = ({ label, value, multi = false }) => {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "10px 12px",
        borderRadius: "8px",
        background: "#f9fafb",
        border: "1px solid #f3f4f6",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "#9ca3af",
          fontWeight: "600",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          color: "#111827",
          whiteSpace: multi ? "pre-wrap" : "normal",
          lineHeight: "1.5",
        }}
      >
        {value}
      </span>
    </div>
  );
};

export default AdminTathastuReview;

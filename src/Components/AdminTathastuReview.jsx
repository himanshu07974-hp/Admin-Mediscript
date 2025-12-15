import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
import { FaArrowLeft, FaUserMd, FaStethoscope } from "react-icons/fa";
import { format } from "date-fns";
import { initSocket } from "../socket";
import ChatFileBubble from "../Components/ChatFileBubble"; // adjust path if needed

const AdminTathastuReview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [messages, setMessages] = useState([]);
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
      // type: msg.type || (msg.fileUrl ? "file" : "text"),
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

          // attach senderId fallback from session-level ids (so we can detect ownership)
          const prepared = (data.messages || []).map((m) =>
            normalizeMessage({
              ...m,
              senderId:
                m.senderId ||
                m.fromId ||
                m.userId ||
                m.adminId ||
                // if message from admin but no id, use session.adminId
                ((m.from || m.sender || "").toString().toLowerCase() === "admin"
                  ? data.adminId || data.admin?._id || null
                  : null) ||
                // if from doctor, use session.doctorId
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

    // const handleDoctorReply = (payload) => {
    //   if (!payload) return;
    //   if (String(payload.sessionId) !== String(sessionId)) return;

    //   const raw = payload.messageObject || payload.message || payload;
    //   console.log("raw", raw);
    //   // if (!raw) return;

    //   if (!raw.text && !raw.fileUrl) {
    //     console.log("Socket event without message, syncing from API...");
    //     //loadSession(); // 🔥 THIS FIXES IT
    //     return;
    //   }

    //   const normalized = normalizeMessage(raw);

    //   setMessages((prev) => {
    //     // ✅ strongest duplicate check: DB id
    //     if (normalized._id && prev.some((m) => m._id === normalized._id)) {
    //       return prev;
    //     }

    //     // ✅ optional file duplicate check (SAFE now)
    //     if (
    //       normalized.fileUrl &&
    //       prev.some((m) => m.fileUrl === normalized.fileUrl)
    //     ) {
    //       return prev;
    //     }

    //     return [...prev, normalized];
    //   });

    //   setTimeout(scrollToBottom, 50);
    // };

    const handleDoctorReply = (payload) => {
      if (!payload) return;
      if (String(payload.sessionId) !== String(sessionId)) return;

      let raw = payload.messageObject || payload.message || payload;

      // ✅ FIX: text string ko object me convert karo
      if (typeof raw === "string") {
        raw = {
          from: "doctor",
          senderId: session?.doctorId?._id || session?.doctorId || null,
          text: raw,
          type: "text",
          time: new Date().toISOString(),
        };
      }

      // safety check
      if (!raw.text && !raw.fileUrl) return;

      const normalized = normalizeMessage(raw);

      setMessages((prev) => {
        // duplicate check by DB id
        if (normalized._id && prev.some((m) => m._id === normalized._id)) {
          return prev;
        }

        // file duplicate check
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
  }, [sessionId]); // ✅ EMPTY dependency

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

      // Prefer server-returned messages array if present
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
        // server might return the single created message
        const backendMsg =
          res.data?.message || res.data?.createdMessage || null;
        if (backendMsg) {
          setMessages((prev) => [...prev, normalizeMessage(backendMsg)]);
        } else {
          // optimistic fallback, attach senderId so future comparisons work
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
      // show local uploading bubble (no remote preview for other user)
      const optimistic = normalizeMessage({
        from: "admin",
        senderId: localStorage.getItem("userId"),
        type: "file",
        fileUrl: null, // will appear after server response
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

      // if backend returned the saved message with fileUrl/_id -> replace optimistic
      const backendMsg = res.data?.messageObject || uploaded;
      const normalized = normalizeMessage({
        ...backendMsg,
        // ensure senderId present
        senderId:
          backendMsg.senderId ||
          backendMsg.userId ||
          localStorage.getItem("userId"),
        type: backendMsg.type || "file",
      });

      // If backend returned an _id, replace the temp message; else, merge by filename/time
      if (normalized._id) {
        replaceMessageByTempId(tempId, normalized);
      } else {
        // fallback: append normalized and remove optimistic
        setMessages((prev) => [
          ...prev.filter((m) => m._tempId !== tempId),
          normalized,
        ]);
      }

      setTimeout(scrollToBottom, 80);
    } catch (err) {
      console.error("File upload error:", err, err.response?.data);
      setError("Failed to upload file");
      // mark optimistic as error
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
    // Ownership: id-based preferred; else role-based heuristic
    const isMine =
      (msg.senderId && String(msg.senderId) === String(currentUserId)) ||
      fromRaw === currentUserRole ||
      (fromRaw === "admin" && currentUserRole.includes("admin"));

    const isSystem = fromRaw === "system";

    const wrapperJustify = isSystem
      ? "center"
      : isMine
      ? "flex-end"
      : "flex-start";

    const bubbleBase = {
      maxWidth: "72%",
      padding: "10px 12px",
      borderRadius: 16,
      fontSize: 13,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",
    };

    const bubbleStyle = isSystem
      ? {
          ...bubbleBase,
          background: "#f1f5f9",
          color: "#374151",
          borderRadius: 12,
          maxWidth: "60%",
        }
      : isMine
      ? {
          ...bubbleBase,
          background: "linear-gradient(135deg,#024e5a,#036a7a)",
          color: "white",
          borderRadius: "16px 16px 4px 16px",
          marginLeft: "auto",
        }
      : {
          ...bubbleBase,
          background: "#ffffff",
          color: "#111827",
          borderRadius: "16px 16px 16px 4px",
          marginRight: "auto",
        };

    const label = isSystem
      ? "System"
      : isMine
      ? "You"
      : fromRaw === "doctor"
      ? "Doctor"
      : msg.from || "User";

    const timeStr = formatTime(msg.time || msg.createdAt);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: wrapperJustify,
          marginBottom: 12,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        <div style={{ maxWidth: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: isMine
                ? "flex-end"
                : isSystem
                ? "center"
                : "flex-start",
              marginBottom: 6,
            }}
          >
            <small style={{ fontSize: 11, color: "#6b7280" }}>
              {label} • {timeStr}
            </small>
          </div>

          <div style={bubbleStyle}>
            {msg.type === "file" ? (
              <ChatFileBubble
                from={msg.from}
                senderId={msg.senderId}
                fileUrl={msg.fileUrl}
                fileName={msg.fileName}
                mimeType={msg.mimeType}
                time={msg.time}
              />
            ) : (
              <div>{msg.text}</div>
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
        background: "#f3f4f6",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          background: "linear-gradient(135deg,#024e5a,#036a7a)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
      >
        <button
          onClick={() => navigate("/tathastu-sessions")}
          style={{
            border: "none",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 6,
            borderRadius: 999,
          }}
        >
          <FaArrowLeft size={18} />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            TATHASTU Case Review
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
            {doctor?.name && (
              <>
                <FaUserMd size={12} style={{ marginRight: 4 }} />
                {doctor.name}
              </>
            )}
            {doctor?.specialization && (
              <>
                <span> • </span>
                <FaStethoscope size={12} /> {doctor.specialization}
              </>
            )}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.9 }}>
          Session:{" "}
          <span style={{ fontFamily: "monospace" }}>
            {sessionId?.slice(0, 8)}…
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(280px, 360px) 1fr",
          gap: 16,
          padding: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div>Loading patient details…</div>
          ) : error ? (
            <div style={{ color: "#b91c1c", fontSize: 13 }}>{error}</div>
          ) : !session ? (
            <div>No session data.</div>
          ) : (
            <>
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Patient Details
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginTop: 0,
                  marginBottom: 12,
                }}
              >
                Please verify all fields before generating prescription.
              </p>
              <div style={{ display: "grid", rowGap: 8 }}>
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
                    marginTop: 10,
                    padding: 8,
                    borderRadius: 8,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    fontSize: 11,
                  }}
                >
                  Note: TATHASTU only assists. Final prescription must be
                  clinically reviewed and signed by the RMP.
                </div>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "white",
            borderRadius: 14,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              background: "linear-gradient(to bottom,#f9fafb,#e5f0f4)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "stretch",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 8,
                fontSize: 15,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Case Timeline
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: 12,
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              Below is how the doctor filled the case with TATHASTU prompts.
            </p>

            {loading ? (
              <div>Loading messages…</div>
            ) : messages.length ? (
              <>
                {/* {messages.map((m) =>
                  renderMessageBubble(m, m._id || m._tempId)
                )} */}
                {messages.map((m) => (
                  <div key={m._key}>{renderMessageBubble(m)}</div>
                ))}

                <div ref={messagesEndRef} />
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                No timeline messages available.
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: 14,
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                Final Prescription / Advice
              </span>
              <span
                style={{
                  fontSize: 11,
                  color:
                    session?.status === "ADMIN_REPLIED" ? "#22c55e" : "#9ca3af",
                }}
              >
                Status: {session?.status || "—"}
              </span>
            </div>

            <textarea
              rows={6}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type the final prescription here (dose, frequency, duration, advice)…"
              style={{
                width: "100%",
                resize: "vertical",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                padding: 10,
                fontSize: 13,
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                gap: 8,
              }}
            >
              <small style={{ fontSize: 11, color: "#6b7280" }}>
                You can send prescription or attach files (PDF, images,
                reports).
              </small>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="file"
                  id="fileUpload"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => document.getElementById("fileUpload").click()}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "none",
                    background: "#475569",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  📎 Send File
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={
                    saving || !responseText.trim() || !sessionId || loading
                  }
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    background:
                      saving || !responseText.trim()
                        ? "#cbd5e1"
                        : "linear-gradient(135deg,#024e5a,#036a7a)",
                    color: "white",
                    cursor:
                      saving || !responseText.trim()
                        ? "not-allowed"
                        : "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {saving ? "Sending…" : "Send Prescription"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// helper for patient rows
const FieldRow = ({ label, value, multi = false }) => {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "6px 8px",
        borderRadius: 8,
        background: "#f9fafb",
      }}
    >
      <span
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.03,
          color: "#9ca3af",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#111827",
          whiteSpace: multi ? "pre-wrap" : "normal",
        }}
      >
        {value}
      </span>
    </div>
  );
};

export default AdminTathastuReview;

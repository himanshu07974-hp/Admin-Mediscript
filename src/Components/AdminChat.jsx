import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../config/axiosConfig";
import { initSocket } from "../socket";
import { FaPaperPlane, FaCircle, FaCheck, FaCheckDouble, FaTrash, FaEdit } from "react-icons/fa";
import { format } from "date-fns";

const AdminChat = () => {
  const adminId = localStorage.getItem("userId") || "admin";
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  // Search term filters doctors by name and (if provided by backend) by lastMessage text
  const [searchTerm, setSearchTerm] = useState("");
  // unreadCounts: { [doctorId]: number }
  const [unreadCounts, setUnreadCounts] = useState({});
  // Editing state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper: mark messages seen for a doctor (calls API and updates local state)
  const markMessagesSeen = async (doctorId) => {
    if (!doctorId) return;
    try {
      await axiosInstance.post("/api/chat/mark-seen", { doctorId });
      // Set unread count to 0 locally
      setUnreadCounts((prev) => ({ ...prev, [doctorId]: 0 }));
      // Update message statuses in current message list if they belong to that doctor and are not from admin
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === String(doctorId) ? { ...m, status: "seen" } : m
        )
      );
    } catch (err) {
      console.error("Mark-seen error:", err);
    }
  };

  // Load Doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await axiosInstance.get("/api/chat/doctors-list");
        const docs = res.data.data || [];
        setDoctors(docs);
        setFilteredDoctors(docs);
        // Initialize unreadCounts from server-provided field (if present), otherwise 0
        const initialCounts = {};
        docs.forEach((d) => {
          // try multiple likely field names: unreadCount, unread, unreadMessages
          initialCounts[d.doctorId] =
            d.unreadCount ?? d.unread ?? d.unreadMessages ?? 0;
        });
        setUnreadCounts(initialCounts);

        if (docs.length) setSelectedDoctor(docs[0]);
      } catch (err) {
        console.error("Doctors fetch error:", err);
      }
    };
    loadDoctors();
  }, []);

  // Filter doctors by name OR lastMessage (if provided)
  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setFilteredDoctors(doctors);
      return;
    }
    setFilteredDoctors(
      doctors.filter((doc) => {
        const nameMatch = doc.name?.toLowerCase().includes(q);
        const lastMsg = (doc.lastMessage || "").toLowerCase();
        const lastMatch = lastMsg.includes(q);
        return nameMatch || lastMatch;
      })
    );
  }, [searchTerm, doctors]);

  // Load Messages + MARK SEEN when loading messages for the selected doctor
  useEffect(() => {
    if (!selectedDoctor) return;

    const loadMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/chat/messages/${selectedDoctor.doctorId}`
        );

        const normalized = (res.data.messages || []).map((m) => ({
          ...m,
          senderId: m.senderId?.toString(),
          receiverId: m.receiverId?.toString(),
          status: m.seen ? "seen" : "delivered",
        }));

        setMessages(normalized);

        // After messages loaded and displayed, mark them seen via API and set unread count to 0
        // This behaviour replicates WhatsApp: opening the chat marks messages seen.
        // We call this after setting messages so UI reflects 'seen' state.
        setTimeout(() => {
          scrollToBottom();
          markMessagesSeen(selectedDoctor.doctorId);
        }, 100);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    loadMessages();
  }, [selectedDoctor]);

  // Socket Setup
  useEffect(() => {
    const socket = initSocket(adminId);
    socketRef.current = socket;
    socket.emit("addAdmin", adminId);

    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    socket.on("doctorTyping", (data) => {
      if (data.doctorId === selectedDoctor?.doctorId) setTyping(data.isTyping);
    });

    // When a new message arrives
    socket.on("receiveMessage", (msg) => {
      const normalizedMsg = {
        ...msg,
        senderId: msg.senderId?.toString(),
        receiverId: msg.receiverId?.toString(),
        status: msg.seen ? "seen" : "delivered",
      };

      const msgDoctorId =
        String(normalizedMsg.senderId) === String(adminId)
          ? normalizedMsg.receiverId
          : normalizedMsg.senderId;

      const relatedToSelected =
        msgDoctorId &&
        selectedDoctor?.doctorId &&
        String(msgDoctorId) === String(selectedDoctor.doctorId);

      if (relatedToSelected) {
        // If the incoming message belongs to the currently open chat:
        // append it, then mark seen (so count remains zero and the message shows as seen).
        setMessages((prev) => [...prev, normalizedMsg]);
        // mark seen on server and update local statuses & unread count
        markMessagesSeen(selectedDoctor.doctorId);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        // Message for a doctor that's not currently open: increment unread count
        setUnreadCounts((prev) => {
          const did = msgDoctorId;
          const curr = prev?.[did] ?? 0;
          return { ...prev, [did]: curr + 1 };
        });

        // If backend sends updated lastMessage and unread count over sockets, you could update doctors list here.
        // For now we just increment the badge locally for instant feedback.
      }
    });

    // When a message is updated elsewhere (doctor edited) or via admin from another session
    socket.on("messageUpdated", (updatedMsg) => {
      const normalized = {
        ...updatedMsg,
        senderId: updatedMsg.senderId?.toString(),
        receiverId: updatedMsg.receiverId?.toString(),
      };
      setMessages((prev) =>
        prev.map((m) => (String(m._id) === String(normalized._id) ? { ...m, ...normalized } : m))
      );
    });

    // When a message is deleted elsewhere
    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
    });

    return () => {
      socket.off("doctorTyping");
      socket.off("receiveMessage");
      socket.off("onlineUsers");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
      socket.disconnect?.();
    };
  }, [selectedDoctor, adminId]);

  // Send Message
  const handleSend = async () => {
    const text = newMsg.trim();
    if (!text || !selectedDoctor) return;

    const tempId = "temp-" + Date.now();
    const optimisticMsg = {
      _id: tempId,
      message: text,
      senderId: adminId.toString(),
      receiverId: selectedDoctor.doctorId.toString(),
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMsg("");
    scrollToBottom();

    try {
      const res = await axiosInstance.post("/api/chat/send", {
        doctorId: selectedDoctor.doctorId,
        message: text,
      });
      const realMsg = res.data.msg;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId
            ? {
                ...realMsg,
                senderId: adminId, // FIX
                receiverId: selectedDoctor.doctorId,
                status: "sent",
              }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m))
      );
    }
  };

  // Typing
  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    socketRef.current?.emit("adminTyping", {
      isTyping: e.target.value.length > 0,
      doctorId: selectedDoctor?.doctorId,
    });
  };

  // Delete Message (admin action)
  const deleteMessage = async (id) => {
    if (!id) return;
    try {
      // optimistic UI: remove immediately
      setMessages((prev) => prev.filter((m) => String(m._id) !== String(id)));

      await axiosInstance.delete(`/api/chat/message/delete/${id}`);

      // tell server to broadcast deletion to other clients if needed
      socketRef.current?.emit("messageDeleted", { messageId: id, doctorId: selectedDoctor?.doctorId });

      // Optionally update doctor's lastMessage/unreadCount by refetching doctors list:
      // fetchDoctorsList();
    } catch (err) {
      console.error("Delete error:", err);
      // On failure, we could re-fetch messages or show an error — for now re-fetch current chat
      try {
        const res = await axiosInstance.get(`/api/chat/messages/${selectedDoctor.doctorId}`);
        const normalized = (res.data.messages || []).map((m) => ({
          ...m,
          senderId: m.senderId?.toString(),
          receiverId: m.receiverId?.toString(),
          status: m.seen ? "seen" : "delivered",
        }));
        setMessages(normalized);
      } catch (e) {
        console.error("Refetch after delete failure failed:", e);
      }
    }
  };

  // Start editing a message (only admin's own messages)
  const startEditing = (msg) => {
    setEditingMessageId(msg._id);
    setEditingText(msg.message || "");
    // scroll into view (optional)
    setTimeout(() => {
      const el = document.getElementById(`msg-${msg._id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // Save edit
  const saveEdit = async (messageId) => {
    const newText = editingText.trim();
    if (!newText) return;

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) =>
        String(m._id) === String(messageId) ? { ...m, message: newText, edited: true } : m
      )
    );
    setEditingMessageId(null);
    setEditingText("");

    try {
      const res = await axiosInstance.put(`/api/chat/message/update/${messageId}`, {
        message: newText,
      });
      const updated = res.data.msg ?? res.data.updatedMsg ?? null;
      if (updated) {
        const normalized = {
          ...updated,
          senderId: updated.senderId?.toString(),
          receiverId: updated.receiverId?.toString(),
        };
        setMessages((prev) =>
          prev.map((m) => (String(m._id) === String(normalized._id) ? { ...m, ...normalized } : m))
        );
        // notify via socket so other clients update
        socketRef.current?.emit("messageUpdated", { message: normalized, doctorId: selectedDoctor?.doctorId });
      } else {
        // If response does not include updated object, optionally refetch messages
        const res2 = await axiosInstance.get(`/api/chat/messages/${selectedDoctor.doctorId}`);
        const normalizedList = (res2.data.messages || []).map((m) => ({
          ...m,
          senderId: m.senderId?.toString(),
          receiverId: m.receiverId?.toString(),
          status: m.seen ? "seen" : "delivered",
        }));
        setMessages(normalizedList);
      }
    } catch (err) {
      console.error("Update error:", err);
      // On error, refetch current chat to reflect real server state
      try {
        const res = await axiosInstance.get(`/api/chat/messages/${selectedDoctor.doctorId}`);
        const normalized = (res.data.messages || []).map((m) => ({
          ...m,
          senderId: m.senderId?.toString(),
          receiverId: m.receiverId?.toString(),
          status: m.seen ? "seen" : "delivered",
        }));
        setMessages(normalized);
      } catch (e) {
        console.error("Refetch after update failure failed:", e);
      }
    }
  };

  // When user clicks a doctor in sidebar, setSelectedDoctor and mark seen immediately
  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    // We'll also call markMessagesSeen here to be safe (the messages-load effect will also call it).
    // This prevents a short race where unread count may still show for a split second.
    setTimeout(() => markMessagesSeen(doc.doctorId), 150);
  };

  // Ticks
  const renderTicks = (status) => {
    if (status === "sending") return <FaCheck size={14} opacity={0.6} />;
    if (status === "sent") return <FaCheck size={14} opacity={0.7} />;
    if (status === "delivered") return <FaCheckDouble size={14} opacity={0.8} />;
    if (status === "seen") return <FaCheckDouble size={14} color="#3b82f6" />;
    if (status === "failed") return <span style={{ color: "red" }}>!</span>;
    return null;
  };

  const formatTime = (date) => format(new Date(date), "p");
  const formatDateHeader = (date) => format(new Date(date), "EEEE, MMMM d");

  return (
    <>
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .typing-dot {
          width: 8px; height: 8px; background: #94a3b8; border-radius: 50%;
          display: inline-block; animation: bounce 1.3s linear infinite; margin: 0 3px;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.18s; }
        .typing-dot:nth-child(3) { animation-delay: 0.36s; }

        /* unread badge */
        .unread-badge {
          min-width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #ef4444;
          color: white;
          font-size: 12px;
          padding: 0 6px;
        }

        .msg-edit-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px;
          font-size: 14px;
        }

        .msg-action-btn {
          cursor: pointer;
          margin-left: 8px;
          opacity: 0.85;
        }
      `}</style>

      <div style={{ height: "100dvh", display: "flex", background: "#e5ddd5" }}>
        {/* LEFT SIDEBAR */}
        <div style={{ width: 320, background: "#f0f2f5", borderRight: "1px solid #ddd", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px", background: "#075E54", color: "white", fontWeight: "bold", fontSize: 20 }}>
            Doctors
          </div>
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ margin: "12px 20px", padding: "10px 16px", borderRadius: 25, border: "none", outline: "none", background: "#fff" }}
          />
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredDoctors.map((doc) => {
              const isOnline = onlineUsers[doc.doctorId];
              const active = selectedDoctor?.doctorId === doc.doctorId;
              const unread = unreadCounts[doc.doctorId] ?? 0;
              return (
                <div
                  key={doc.doctorId}
                  onClick={() => handleSelectDoctor(doc)}
                  style={{
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: active ? "#e5f3f0" : "transparent",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                      alt="doc"
                      style={{ width: 48, height: 48, borderRadius: "50%" }}
                    />
                    {isOnline && (
                      <FaCircle size={12} color="#4ade80" style={{ position: "absolute", bottom: 2, right: -2 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 600 }}>{doc.name}</div>
                      {unread > 0 && (
                        <div className="unread-badge">{unread > 99 ? "99+" : unread}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>{isOnline ? "Online" : "Offline"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#024e5a 0%,#036a7a 100%)", color: "white", padding: "18px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "bold", backdropFilter: "blur(10px)" }}>
              {selectedDoctor?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{selectedDoctor?.name || "Select a doctor"}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                {onlineUsers[selectedDoctor?.doctorId] ? (
                  <>
                    <FaCircle size={10} color="#4ade80" />
                    <span style={{ fontSize: 14 }}>Online</span>
                  </>
                ) : (
                  <span style={{ fontSize: 14, opacity: 0.8 }}>Offline</span>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area - Only This Scrolls */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", background: "linear-gradient(to bottom,#f0f7f9,#e1f0f5)", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: 100, color: "#64748b" }}>
                <p style={{ fontSize: 18, fontWeight: 500 }}>No messages yet</p>
                <p style={{ color: "#94a3b8" }}>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isAdmin = String(msg.senderId) === String(adminId);
                const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1]?.createdAt).toDateString();

                return (
                  <div key={msg._id || idx} id={`msg-${msg._id || idx}`} style={{ width: "100%" }}>
                    {showDate && (
                      <div style={{ textAlign: "center", margin: "16px 0", color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                        {formatDateHeader(msg.createdAt)}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth: "75%" }}>
                        <div
                          style={{
                            background: isAdmin ? "linear-gradient(135deg,#024e5a,#036a7a)" : "#ffffff",
                            color: isAdmin ? "white" : "#1e293b",
                            padding: "12px 18px",
                            borderRadius: 20,
                            borderBottomRightRadius: isAdmin ? 4 : 20,
                            borderBottomLeftRadius: isAdmin ? 20 : 4,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            display: "inline-block",
                            position: "relative",
                          }}
                        >
                          {/* If this message is being edited, show inline edit input */}
                          {isAdmin && String(editingMessageId) === String(msg._id) ? (
                            <>
                              <textarea
                                className="msg-edit-input"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                rows={3}
                              />
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                                <button
                                  onClick={() => cancelEditing()}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: "#cbd5e1",
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => saveEdit(msg._id)}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: "#036a7a",
                                    color: "white",
                                    cursor: "pointer",
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p style={{ margin: 0, lineHeight: 1.5, fontSize: 15.5 }}>{msg.message}{msg.edited ? " • edited" : ""}</p>
                              <div style={{ marginTop: 6, fontSize: 11.5, opacity: 0.9, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                                <span>{formatTime(msg.createdAt)}</span>
                                {isAdmin && renderTicks(msg.status)}
                                {/* Edit button for admin's own messages (only when not sending) */}
                                {isAdmin && msg.status !== "sending" && msg.status !== "failed" && (
                                  <>
                                    <FaEdit
                                      size={13}
                                      className="msg-action-btn"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => startEditing(msg)}
                                    />
                                    <FaTrash
                                      size={13}
                                      style={{ cursor: "pointer", opacity: 0.7 }}
                                      onClick={() => deleteMessage(msg._id)}
                                    />
                                  </>
                                )}
                                {/* If message failed or sending, only show delete (already handled) */}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {typing && (
              <div style={{ display: "flex", paddingLeft: 12 }}>
                <div style={{ background: "white", padding: "12px 18px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input */}
          <div style={{ padding: "16px 20px 24px", background: "white", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", borderRadius: 30, padding: "8px 12px", boxShadow: "0 4px 15px rgba(0,0,0,0.06)" }}>
              <input
                value={newMsg}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Type a message..."
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: 12, fontSize: 16 }}
              />
              <button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: newMsg.trim() ? "linear-gradient(135deg,#024e5a,#036a7a)" : "#cbd5e1",
                  border: "none",
                  color: "white",
                  cursor: newMsg.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: newMsg.trim() ? "0 6px 20px rgba(2,78,90,0.4)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <FaPaperPlane size={19} style={{ transform: "rotate(-45deg)" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminChat;

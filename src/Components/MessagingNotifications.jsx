// src/pages/MessagingNotifications.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendAnnouncement,
  fetchNotifications,
  deleteNotification as deleteAndUpdateNotification,
  updateNotification,
  clearErrors,
} from "../redux/slices/announcementSlice";

import { useToast } from "../Components/ToastProvider";

function MessagingNotifications() {
  const { success, error } = useToast();
  const dispatch = useDispatch();
  const {
    sendLoading,
    sendSuccess,
    sendError,
    sendResponse,
    notifications,
    listLoading,
    listError,
    deleteLoading,
    deleteSuccess,
    deleteError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.announcement);

  const [formVisible, setFormVisible] = useState(false);
  const [notificationType, setNotificationType] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [updateId, setUpdateId] = useState(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  // Fetch notifications on mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Auto-clear messages
  useEffect(() => {
    if (sendSuccess || deleteSuccess || updateError) {
      const timer = setTimeout(() => dispatch(clearErrors()), 5000);
      return () => clearTimeout(timer);
    }
  }, [sendSuccess, deleteSuccess, updateError, dispatch]);

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      error("Please enter title and message");
      return;
    }
    dispatch(
      sendAnnouncement({
        targetRole: notificationType || "all",
        title,
        message,
      })
    );
    success("Notification sent successfully"); // ✅ ADD THIS LINE HERE
    dispatch(fetchNotifications());
    setTitle("");
    setMessage("");
  };

  const handleDelete = (id) => {
    dispatch(deleteAndUpdateNotification(id));

    success("Notification deleted successfully"); // ✅ ADD THIS LINE
    setUpdateId(null);
    setUpdateTitle("");
    setUpdateMessage("");
  };

  const handleUpdate = (id) => {
    if (!updateTitle.trim() && !updateMessage.trim()) {
      error("Enter new title or message");
      return;
    }
    dispatch(
      updateNotification({
        id,
        title: updateTitle,
        message: updateMessage,
      })
    );
    dispatch(fetchNotifications());
    setUpdateId(null);
    setUpdateTitle("");
    setUpdateMessage("");
  };

  const announcements = [
    { id: 1, type: "Global", target: "all", icon: "🌐" },
    { id: 2, type: "Doctor", target: "doctor", icon: "🩺" },
    { id: 3, type: "Student", target: "student", icon: "🎓" },
    { id: 4, type: "Receptionist", target: "receptionist", icon: "📞" },
    { id: 5, type: "Nurse", target: "nurse", icon: "💉" },
  ];

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      padding: "1rem",
      backgroundColor: "#E0F2FE",
      color: "#1E293B",
      minHeight: "100vh",
      maxWidth: "90vw",
      margin: "0 auto",
    },
    header: {
      backgroundColor: "#FFFFFF",
      padding: "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    },
    title: { fontSize: "1.25rem", fontWeight: "600" },
    cardContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1rem",
    },
    card: {
      backgroundColor: "#FFFFFF",
      padding: "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      textAlign: "center",
      cursor: "pointer",
    },
    button: {
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "0.9rem",
      color: "#FFFFFF",
    },
    formContainer: {
      backgroundColor: "#FFFFFF",
      padding: "1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    },
    textarea: {
      width: "100%",
      padding: "0.5rem",
      border: "1px solid #E2E8F0",
      borderRadius: "6px",
      marginBottom: "0.5rem",
      fontSize: "0.9rem",
      boxSizing: "border-box",
    },
    result: { marginTop: "0.5rem", fontSize: "0.9rem" },
  };
  useEffect(() => {
    console.log("Fetched notifications:", notifications);
  }, [notifications]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Messaging & Notifications</h1>
      </div>

      {/* Send Cards */}
      <div style={styles.cardContainer}>
        {announcements.map((ann) => (
          <div
            key={ann.id}
            style={styles.card}
            onClick={() => {
              setFormVisible(true);
              setNotificationType(ann.target);
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
              {ann.icon}
            </div>
            <h2>{ann.type}</h2>
            <p>Click to send</p>
            <button style={{ ...styles.button, backgroundColor: "#0D9488" }}>
              Send
            </button>
          </div>
        ))}
      </div>

      {/* Send Form */}
      {formVisible && (
        <div style={styles.formContainer}>
          <h2>
            Send{" "}
            {notificationType.charAt(0).toUpperCase() +
              notificationType.slice(1)}{" "}
            Notification
          </h2>
          <input
            type="text"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...styles.textarea, minHeight: "40px" }}
          />
          <textarea
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.textarea}
          />
          <button
            onClick={handleSend}
            disabled={sendLoading}
            style={{ ...styles.button, backgroundColor: "#0D9488" }}
          >
            {sendLoading ? "Sending..." : "Send"}
          </button>

          {sendSuccess && (
            <p style={{ ...styles.result, color: "green" }}>
              Sent successfully! ({sendResponse?.sentTo || "?"} users)
            </p>
          )}
          {sendError && (
            <p style={{ ...styles.result, color: "red" }}>
              Failed: {sendError}
            </p>
          )}
        </div>
      )}

      {/* Sent Notifications */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Sent Notifications {listLoading && "(Loading...)"}</h2>

        {listError && (
          <p style={{ ...styles.result, color: "red" }}>Error: {listError}</p>
        )}
        {deleteSuccess && (
          <p style={{ ...styles.result, color: "green" }}>
            {deleteSuccess.message}
          </p>
        )}
        {deleteError && (
          <p style={{ ...styles.result, color: "red" }}>
            Delete failed: {deleteError}
          </p>
        )}
        {updateError && (
          <p style={{ ...styles.result, color: "red" }}>
            Update failed: {updateError}
          </p>
        )}

        {notifications.length === 0 ? (
          <p style={{ color: "#64748B" }}>
            {listLoading
              ? "Loading notifications..."
              : "No notifications sent yet."}
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {notifications
              .filter(Boolean) // removes undefined/null
              .map((notif) => {
                const notifType = notif.type || "global";
                const target =
                  notifType === "global" ? "All Users" : "Specific User";

                return (
                  <div
                    key={notif._id}
                    style={{
                      background: "#FFFFFF",
                      padding: "1rem",
                      borderRadius: "8px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                          <strong>To:</strong> {target} | <strong>Sent:</strong>{" "}
                          {new Date(notif.createdAt).toLocaleString()} |{" "}
                          <strong>Read:</strong> {notif.readBy?.length || 0}
                        </div>
                      </div>

                      {/* Buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <button
                          onClick={() => setUpdateId(notif._id)}
                          style={{
                            ...styles.button,
                            backgroundColor: "#0D9488",
                          }}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(notif._id)}
                          disabled={deleteLoading}
                          style={{
                            ...styles.button,
                            backgroundColor: "#DC2626",
                          }}
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {/* Update Form */}
                    {updateId === notif._id && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "1rem",
                          background: "#F8FAFC",
                          borderRadius: "6px",
                        }}
                      >
                        <input
                          placeholder="New Title"
                          value={updateTitle}
                          onChange={(e) => setUpdateTitle(e.target.value)}
                          style={{ ...styles.textarea, minHeight: "36px" }}
                        />
                        <textarea
                          placeholder="New Message"
                          value={updateMessage}
                          onChange={(e) => setUpdateMessage(e.target.value)}
                          style={styles.textarea}
                        />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleUpdate(notif._id)}
                            disabled={updateLoading}
                            style={{
                              ...styles.button,
                              backgroundColor: "#0D9488",
                            }}
                          >
                            {updateLoading ? "Updating..." : "Update"}
                          </button>
                          <button
                            onClick={() => {
                              setUpdateId(null);
                              setUpdateTitle("");
                              setUpdateMessage("");
                            }}
                            style={{
                              ...styles.button,
                              backgroundColor: "#6B7280",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagingNotifications;

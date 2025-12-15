import React from "react";

const ChatFileBubble = ({
  from,
  senderId,
  fileUrl,
  fileName,
  mimeType,
  time,
}) => {
  const currentUserId = (localStorage.getItem("userId") || "").toString();
  const currentUserRole = (localStorage.getItem("role") || "")
    .toString()
    .toLowerCase();
  const fromRaw = (from || "").toString().toLowerCase();

  // prefer id-based check; else tolerant role check (treat 'superadmin' as admin)
  const isMine = senderId
    ? String(senderId) === String(currentUserId)
    : fromRaw === currentUserRole ||
      (fromRaw === "admin" && currentUserRole.includes("admin"));

  const isImage = mimeType?.startsWith("image/");
  const align = isMine ? "flex-end" : "flex-start";

  return (
    <div style={{ display: "flex", width: "100%", justifyContent: align }}>
      <div style={{ maxWidth: "75%", marginBottom: 8 }}>
        <div
          style={{
            background: isMine
              ? "linear-gradient(135deg,#024e5a,#036a7a)"
              : "#ffffff",
            padding: 10,
            borderRadius: 14,
            color: isMine ? "white" : "#1f2937",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              style={{
                width: "100%",
                maxWidth: 240,
                borderRadius: 10,
                marginBottom: 6,
              }}
              onClick={() => window.open(fileUrl, "_blank")}
            />
          ) : (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              download={fileName}
              style={{ color: isMine ? "white" : "#0369a1", fontWeight: 600 }}
            >
              {fileName}
            </a>
          )}

          <div
            style={{
              marginTop: 6,
              fontSize: 10,
              opacity: 0.7,
              textAlign: "right",
              color: isMine ? "white" : "#6b7280",
            }}
          >
            {time ? new Date(time).toLocaleString() : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFileBubble;

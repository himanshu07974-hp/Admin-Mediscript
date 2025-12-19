const ChatFileBubble = ({
  from,
  senderId,
  fileUrl,
  fileName,
  mimeType,
  time,
  isMine: isMineProp, // नया prop जो parent से आएगा
}) => {
  const currentUserId = (localStorage.getItem("userId") || "").toString();
  const currentUserRole = (localStorage.getItem("role") || "")
    .toString()
    .toLowerCase();
  const fromRaw = (from || "").toString().toLowerCase();

  // पहले prop से isMine लो (parent से भेजा गया), fallback पर पुरानी logic
  const isMine =
    typeof isMineProp === "boolean"
      ? isMineProp
      : senderId
      ? String(senderId) === String(currentUserId)
      : fromRaw === currentUserRole ||
        (fromRaw === "admin" && currentUserRole.includes("admin"));

  // const isImage = mimeType?.startsWith("image/");
  const isImage = mimeType?.startsWith("image/") && !!fileUrl;

  return (
    // <div style={{ display: "flex", width: "100%", justifyContent: align }}>
    <div style={{ width: "100%" }}>
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
            minWidth: 120,
          }}
        >
          {/* 🔄 UPLOADING STATE */}
          {!fileUrl && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                opacity: 0.9,
                textAlign: "center",
              }}
            >
              ⏳ Uploading…
            </div>
          )}

          {/* 🖼 IMAGE AFTER UPLOAD */}
          {fileUrl && isImage && (
            <img
              src={fileUrl}
              alt={fileName}
              style={{
                width: "100%",
                maxWidth: 220,
                borderRadius: 10,
                display: "block",
              }}
              onClick={() => window.open(fileUrl, "_blank")}
            />
          )}

          {/* 📄 NON-IMAGE FILE */}
          {fileUrl && !isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              download={fileName}
              style={{
                color: isMine ? "white" : "#0369a1",
                fontWeight: 600,
                wordBreak: "break-all",
              }}
            >
              {fileName}
            </a>
          )}

          {/* ⏱ TIME */}
          <div
            style={{
              marginTop: 6,
              fontSize: 10,
              opacity: 0.7,
              textAlign: "right",
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

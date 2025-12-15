// src/components/ToastProvider.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const ToastContext = createContext(null);

let NEXT_ID = 1;

export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 5,
}) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback(
    ({ type = "info", message = "", autoClose = 3000, action = null }) => {
      const id = NEXT_ID++;
      const toastObj = { id, type, message, action };

      // for debugging: log toast creation to console so you can trace wrong calls
      // Remove or comment out in production if noisy
      // eslint-disable-next-line no-console
      console.debug("[Toast] add", { id, type, message, autoClose });

      setToasts((prev) => {
        const next = [toastObj, ...prev].slice(0, maxToasts);
        return next;
      });

      // confirm-type toasts should not auto-close
      if (type !== "confirm" && autoClose && autoClose > 0) {
        timersRef.current[id] = setTimeout(() => {
          removeToast(id);
        }, autoClose);
      }
      return id;
    },
    [maxToasts, removeToast]
  );

  // convenience shorthands
  const success = (msg, opts = {}) =>
    addToast({ type: "success", message: msg, ...opts });
  const error = (msg, opts = {}) =>
    addToast({ type: "error", message: msg, ...opts });
  const info = (msg, opts = {}) =>
    addToast({ type: "info", message: msg, ...opts });
  const warn = (msg, opts = {}) =>
    addToast({ type: "warn", message: msg, ...opts });

  // showConfirm: returns a Promise that resolves true (confirm) or false (cancel)
  // Usage: const ok = await showConfirm({ message: "Delete?", confirmText: "Yes", cancelText: "No" })
  const showConfirm = useCallback(
    ({
      message = "Are you sure?",
      confirmText = "Confirm",
      cancelText = "Cancel",
    } = {}) => {
      return new Promise((resolve) => {
        const id = NEXT_ID++;

        // handlers that resolve and remove the toast
        const onConfirm = () => {
          removeToast(id);
          resolve(true);
        };
        const onCancel = () => {
          removeToast(id);
          resolve(false);
        };

        const toastObj = {
          id,
          type: "confirm",
          message,
          confirmText,
          cancelText,
          onConfirm,
          onCancel,
        };

        // for debugging
        // eslint-disable-next-line no-console
        console.debug("[Toast] showConfirm", { id, message });

        setToasts((prev) => {
          const next = [toastObj, ...prev].slice(0, maxToasts);
          return next;
        });

        // IMPORTANT: confirm toasts do NOT auto-close by default
      });
    },
    [maxToasts, removeToast]
  );

  // clear timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => {
        try {
          clearTimeout(t);
        } catch (e) {
          /* ignore */
        }
      });
      timersRef.current = {};
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warn,
        showConfirm, // exported for confirm-in-toast usage
        position,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* internal Toast UI - can be extracted to its own file */
function ToastContainer() {
  const { toasts, removeToast, position } = useContext(ToastContext);

  // basic position mapping
  const posStyle =
    {
      "top-right": { top: 16, right: 16, bottom: "auto", left: "auto" },
      "top-left": { top: 16, left: 16, right: "auto", bottom: "auto" },
      "bottom-right": { bottom: 16, right: 16, top: "auto", left: "auto" },
      "bottom-left": { bottom: 16, left: 16, top: "auto", right: "auto" },
      "top-center": { top: 16, left: "50%", transform: "translateX(-50%)" },
    }[position] || { top: 16, right: 16 };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        pointerEvents: "none",
        ...posStyle,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            style={{
              pointerEvents: "auto",
              minWidth: 260,
              maxWidth: 420,
              background:
                t.type === "success"
                  ? "#ecfdf5"
                  : t.type === "error"
                  ? "#fff1f2"
                  : t.type === "warn"
                  ? "#fffbeb"
                  : "#eef2ff",
              borderLeft: `4px solid ${
                t.type === "success"
                  ? "#10b981"
                  : t.type === "error"
                  ? "#ef4444"
                  : "#f59e0b"
              }`,
              color: "#0f172a",
              padding: "0.65rem 0.75rem",
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(2,6,23,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {t.type === "confirm" ? (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>
                    Confirm
                  </div>
                  <div style={{ fontSize: 13 }}>{t.message}</div>
                </div>

                <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                  <button
                    onClick={() =>
                      typeof t.onCancel === "function" && t.onCancel()
                    }
                    style={{
                      background: "#6b7280",
                      border: "none",
                      color: "#fff",
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    {t.cancelText || "Cancel"}
                  </button>

                  <button
                    onClick={() =>
                      typeof t.onConfirm === "function" && t.onConfirm()
                    }
                    style={{
                      background: "#ef4444",
                      border: "none",
                      color: "#fff",
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    {t.confirmText || "Confirm"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                    {t.type === "success"
                      ? "Success"
                      : t.type === "error"
                      ? "Error"
                      : t.type === "warn"
                      ? "Warning"
                      : "Info"}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: "1.2" }}>
                    {t.message}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                  {t.action && (
                    <button
                      onClick={() => {
                        try {
                          t.action.onClick?.();
                        } catch (err) {
                          /* ignore */
                        }
                        removeToast(t.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(0,0,0,0.06)",
                        padding: "6px 8px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {t.action.label || "Action"}
                    </button>
                  )}

                  <button
                    onClick={() => removeToast(t.id)}
                    aria-label="close"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#374151",
                      cursor: "pointer",
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

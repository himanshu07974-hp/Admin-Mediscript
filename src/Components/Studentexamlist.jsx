/* src/components/StudentExamList.jsx */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubmissions,
  fetchAllCertificates,
  approveCertificate,
  rejectCertificate,
  clearActionFeedback,
  clearAllErrors,
} from "../redux/slices/certificateSlice";
import axiosInstance from "../config/axiosConfig";
import { useToast } from "../Components/ToastProvider";

const StudentExamList = () => {
  const { success, error: toastError } = useToast();

  const dispatch = useDispatch();

  // --- SUBMISSIONS (from /api/admin/exammode/submissions) ---
  const {
    submissions = [],
    submissionsLoading,
    submissionsError,
  } = useSelector((s) => s.certificates || {});

  // --- CERTIFICATES (from /api/admin/certificates) ---
  const {
    list: certificates = [],
    listLoading,
    listError,
    actionLoading,
    actionMessage,
    actionError,
  } = useSelector((s) => s.certificates || {});

  // --- LOCAL STATE ---
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (submissionsError || actionError || listError) {
      toastError(submissionsError || actionError || listError);
      dispatch(clearAllErrors());
    }
  }, [submissionsError, actionError, listError, dispatch, toastError]);

  // --- FETCH ON MOUNT ---
  useEffect(() => {
    dispatch(fetchSubmissions());
    dispatch(fetchAllCertificates());
    return () => dispatch(clearAllErrors());
  }, [dispatch]);

  // --- PDF PREVIEW ---
  const openPdf = async (certId) => {
    try {
      const { data } = await axiosInstance.get(
        `/api/admin/certificates/${certId}/preview`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(data);
      setPdfUrl(url);
      setShowPdf(true);
    } catch (e) {
      toastError("Failed to load PDF preview");
    }
  };

  const closePdf = () => {
    setShowPdf(false);
    if (pdfUrl.startsWith("blob:")) URL.revokeObjectURL(pdfUrl);
    setPdfUrl("");
  };

  // --- APPROVE / REJECT ---
  const handleApprove = async (id) => {
    try {
      await dispatch(approveCertificate(id)).unwrap();
      success("Certificate approved successfully");
    } catch (e) {
      toastError(e?.message || "Failed to approve certificate");
    }
  };
  const openReject = (id) => {
    setRejectingId(id);
    setRejectReason("");
  };
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toastError("Reason is required");
      return;
    }

    try {
      await dispatch(
        rejectCertificate({ id: rejectingId, reason: rejectReason })
      ).unwrap();
      success("Certificate rejected successfully");
    } catch (e) {
      toastError(e?.message || "Failed to reject certificate");
    }

    setRejectingId(null);
    setRejectReason("");
  };

  // --- AUTO-CLEAR TOASTS ---
  useEffect(() => {
    if (actionMessage || actionError) {
      const timer = setTimeout(() => dispatch(clearActionFeedback()), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage, actionError, dispatch]);

  // --- SUMMARY ---
  const total = submissions.length;
  const passed = submissions.filter((s) => s.pass === true).length;
  const avgMarks =
    total > 0
      ? (submissions.reduce((a, b) => a + (b.marks || 0), 0) / total).toFixed(1)
      : 0;

  return (
    <>
      {/* ============== CSS ============== */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .btn-hover {
          transition: all 0.2s;
        }
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .toast {
          animation: fadeIn 0.3s ease-out;
        }
        .spinner {
          width: 2.5rem;
          height: 2.5rem;
          border: 4px solid #e2e8f0;
          border-top-color: #0d9488;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }
        .table th,
        .table td {
          border-bottom: 1px solid #e2e8f0;
          padding: 0.875rem 0.75rem;
          text-align: left;
          vertical-align: middle;
        }
        .table th {
          background: #f1f5f9;
          font-weight: 600;
          color: #334155;
          font-size: 0.875rem;
        }
        .table td {
          color: #475569;
          font-size: 0.9rem;
        }
        .table tr:last-child td {
          border-bottom: none;
        }
        .table tr:hover {
          background: #f8fafc;
        }
        .status-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          display: inline-block;
          min-width: 80px;
          text-align: center;
        }
        .actions-cell {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          padding: 0.5rem 0.875rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .table-container {
          overflow-x: auto;
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-top: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        .empty {
          text-align: center;
          color: #64748b;
          font-style: italic;
          padding: 2rem;
          font-size: 1rem;
        }
        .summary {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        .header-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f766e;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f766e;
          margin: 0 0 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 0.75rem;
        }
      `}</style>

      {/* ============== MAIN CONTAINER ============== */}
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 className="header-title">Student Exam & Certificate Dashboard</h1>
          <p style={styles.subtitle}>
            Track performance and manage certificate approvals
          </p>
        </div>

        {/* TOASTS */}
        {/* {actionMessage && (
          <div style={styles.successToast} className="toast">
            {actionMessage}
          </div>
        )} */}
        {/* {(submissionsError || actionError || listError) && (
          <div style={styles.errorToast} className="toast">
            {submissionsError || actionError || listError}
            <button
              onClick={() => dispatch(clearAllErrors())}
              style={styles.closeToast}
            >
              ×
            </button>
          </div>
        )} */}

        {/* ============== SUBMISSIONS TABLE ============== */}
        <div style={styles.card}>
          <h2 className="section-title">Student Exam Submissions</h2>

          {/* SUMMARY */}
          {submissions.length > 0 && (
            <div className="summary">
              <div>
                <strong>Total:</strong> {total}
              </div>
              <div>
                <strong>Passed:</strong>{" "}
                <span style={{ color: "#059669" }}>{passed}</span>
              </div>
              <div>
                <strong>Failed:</strong>{" "}
                <span style={{ color: "#dc2626" }}>{total - passed}</span>
              </div>
              <div>
                <strong>Avg Marks:</strong> {avgMarks}
              </div>
            </div>
          )}

          {/* LOADING / DATA / EMPTY */}
          {submissionsLoading ? (
            <div className="spinner" />
          ) : submissions.length > 0 ? (
            <div className="table-container">
              <table className="table" style={{ minWidth: "1150px" }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Module</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Pass</th>
                    <th>Certificate ID</th>
                    <th>Submitted On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>
                        {s.student?.name || "—"}
                      </td>
                      <td
                        style={{
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.student?.email || "—"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {s.module?.name || "—"}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>
                        {s.marks}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className="status-badge"
                          style={{
                            background:
                              s.grade === "A"
                                ? "#10b981"
                                : s.grade === "B"
                                ? "#0d9488"
                                : s.grade === "C"
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {s.grade}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            color: s.pass ? "#059669" : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          {s.pass ? "Yes" : "No"}
                        </span>
                      </td>
                      <td
                        style={{ textAlign: "center", fontFamily: "monospace" }}
                      >
                        {s.certificateId || "—"}
                      </td>
                      <td style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {new Date(s.submittedOn).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background:
                              s.status === "approved"
                                ? "#10b981"
                                : s.status === "rejected"
                                ? "#ef4444"
                                : s.status === "pending-approval"
                                ? "#f59e0b"
                                : "#6b7280",
                          }}
                        >
                          {s.status?.replace(/-/g, " ") || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty">No exam submissions found.</p>
          )}
        </div>

        {/* ============== CERTIFICATES TABLE ============== */}
        <div style={styles.card}>
          <h2 className="section-title">Generated Certificates</h2>
          {listLoading ? (
            <div className="spinner" />
          ) : certificates.length > 0 ? (
            <div className="table-container">
              <table className="table" style={{ minWidth: "1000px" }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => {
                    const certStatus = c.status || "unknown";
                    return (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 600 }}>
                          {c.student?.name || "-"}
                        </td>
                        <td
                          style={{
                            maxWidth: "180px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.student?.email || "-"}
                        </td>
                        <td>{c.certificateType || "-"}</td>
                        <td style={{ textAlign: "center" }}>
                          {c.score ?? "-"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {c.grade || "-"}
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background:
                                certStatus === "approved"
                                  ? "#10b981"
                                  : certStatus === "rejected"
                                  ? "#ef4444"
                                  : certStatus === "pending-approval"
                                  ? "#f59e0b"
                                  : "#6b7280",
                            }}
                          >
                            {certStatus.replace(/-/g, " ")}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            onClick={() => openPdf(c._id)}
                            className="btn btn-hover"
                            style={{
                              background:
                                "linear-gradient(135deg, #6366f1, #4f46e5)",
                              color: "#fff",
                            }}
                            disabled={actionLoading}
                          >
                            View PDF
                          </button>
                          {certStatus === "pending-approval" && (
                            <>
                              <button
                                onClick={() => handleApprove(c._id)}
                                className="btn btn-hover"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #10b981, #059669)",
                                  color: "#fff",
                                }}
                                disabled={actionLoading}
                              >
                                {actionLoading ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => openReject(c._id)}
                                className="btn btn-hover"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #ef4444, #dc2626)",
                                  color: "#fff",
                                }}
                                disabled={actionLoading}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty">No certificates found.</p>
          )}
        </div>

        {/* ============== PDF MODAL ============== */}
        {showPdf && (
          <div style={styles.modalOverlay} onClick={closePdf}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Certificate Preview</h3>
                <button onClick={closePdf} style={styles.closeBtn}>
                  ×
                </button>
              </div>
              <iframe
                src={pdfUrl}
                title="Certificate PDF"
                style={styles.iframe}
                frameBorder="0"
              />
            </div>
          </div>
        )}

        {/* ============== REJECT MODAL ============== */}
        {rejectingId && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalSmall}>
              <h3 style={styles.modalTitleSmall}>Reject Certificate</h3>
              <textarea
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={styles.textarea}
              />
              <div style={styles.modalFooter}>
                <button
                  onClick={handleReject}
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Submitting..." : "Reject"}
                </button>
                <button
                  onClick={() => setRejectingId(null)}
                  className="btn"
                  style={{ background: "#6b7280", color: "#fff" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ============== STYLES ============== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    padding: "1.5rem 1rem",
    fontFamily: "'Inter', sans-serif",
    color: "#1e293b",
  },
  header: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.1rem",
    marginTop: "0.5rem",
  },
  card: {
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "1.75rem",
    marginBottom: "2rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  successToast: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    background: "#ecfdf5",
    color: "#059669",
    padding: "1rem 1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    zIndex: 1000,
    fontWeight: 600,
    border: "1px solid #a7f3d0",
    maxWidth: "90%",
  },
  errorToast: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    background: "#fee2e2",
    color: "#dc2626",
    padding: "1rem 1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    zIndex: 1000,
    fontWeight: 600,
    border: "1px solid #fecaca",
    maxWidth: "90%",
  },
  closeToast: {
    background: "none",
    border: "none",
    fontSize: "1.25rem",
    cursor: "pointer",
    marginLeft: "0.5rem",
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "1rem",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "1.5rem",
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "95vh",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: "1.5rem 2rem",
    borderBottom: "2px solid #0d9488",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
    background: "#f8fafc",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#0f766e",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "1.75rem",
    cursor: "pointer",
    color: "#64748b",
    width: "2.5rem",
    height: "2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "all 0.2s",
  },
  iframe: {
    flex: 1,
    border: "none",
    minHeight: "500px",
  },
  modalSmall: {
    background: "#fff",
    borderRadius: "1.5rem",
    width: "100%",
    maxWidth: "420px",
    padding: "2rem",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
  },
  modalTitleSmall: {
    fontSize: "1.375rem",
    fontWeight: 700,
    color: "#0f766e",
    margin: "0 0 1.5rem",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "0.75rem",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "1rem",
    borderRadius: "1rem",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#1e293b",
    fontSize: "1rem",
    marginBottom: "1.5rem",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
};

export default StudentExamList;

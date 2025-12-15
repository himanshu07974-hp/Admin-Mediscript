import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingPrescriptions,
  fetchRewardHistory,
  reviewPrescription,
  selectPrescription,
  clearSelection,
} from "../redux/slices/rewardSlice";

function ContributionRewards() {
  const dispatch = useDispatch();
  const { prescriptions, rewards, selectedPrescription, loading, error } = useSelector(
    (state) => state.rewards
  );

  useEffect(() => {
    dispatch(fetchPendingPrescriptions());
    dispatch(fetchRewardHistory());
  }, [dispatch]);

  const handleView = (item) => dispatch(selectPrescription(item));
  const handleApprove = (id) =>
    dispatch(
      reviewPrescription({
        id,
        approve: true,
        comments: "Approved by admin",
      })
    );
  const handleReject = (id) =>
    dispatch(
      reviewPrescription({
        id,
        approve: false,
        comments: "Rejected by admin",
      })
    );

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      padding: "1.5rem",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      color: "#1e293b",
    },
    header: {
      backgroundColor: "#ffffff",
      padding: "1.25rem",
      borderRadius: "1rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      textAlign: "center",
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: 700,
      color: "#0f766e",
      margin: 0,
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "1.5rem",
      borderRadius: "1rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      border: "1px solid #e2e8f0",
    },
    subTitle: {
      fontSize: "1.3rem",
      fontWeight: 600,
      color: "#0f766e",
      margin: "0 0 1rem",
      borderBottom: "2px solid #0d9488",
      paddingBottom: "0.5rem",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "700px",
      fontSize: "0.925rem",
    },
    th: {
      padding: "0.875rem 0.75rem",
      textAlign: "left",
      backgroundColor: "#f1f5f9",
      borderBottom: "1px solid #e2e8f0",
      fontWeight: 600,
      color: "#334155",
    },
    td: {
      padding: "0.875rem 0.75rem",
      borderBottom: "1px solid #e2e8f0",
      color: "#475569",
    },
    button: {
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "0.75rem",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#fff",
      transition: "all 0.2s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    btnView: { background: "linear-gradient(135deg, #6366f1, #4f46e5)" },
    btnApprove: { background: "linear-gradient(135deg, #10b981, #059669)" },
    btnReject: { background: "linear-gradient(135deg, #ef4444, #dc2626)" },
    btnClose: { background: "#6b7280" },
    pre: {
      background: "#f8fafc",
      padding: "1rem",
      borderRadius: "0.75rem",
      overflowX: "auto",
      fontSize: "0.875rem",
      color: "#1e293b",
      border: "1px solid #e2e8f0",
      maxHeight: "400px",
      overflowY: "auto",
    },
    empty: {
      textAlign: "center",
      padding: "2rem",
      color: "#64748b",
      fontStyle: "italic",
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .title { font-size: 1.5rem; }
      .subTitle { font-size: 1.2rem; }
      .th, .td { font-size: 0.85rem; padding: 0.6rem 0.4rem; }
      .button { font-size: 0.8rem; padding: 0.4rem 0.8rem; }
    }
    @media (max-width: 480px) {
      .title { font-size: 1.3rem; }
      .subTitle { font-size: 1.1rem; }
      .button { font-size: 0.75rem; padding: 0.35rem 0.6rem; }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Contribution & Rewards Dashboard</h1>
        </div>

        {/* PENDING PRESCRIPTIONS */}
        <div style={styles.card}>
          <h2 style={styles.subTitle}>Pending Prescriptions</h2>
          {loading ? (
            <p style={styles.empty}>Loading prescriptions...</p>
          ) : prescriptions.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Doctor Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Template</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((p) => (
                    <tr key={p._id}>
                      <td style={styles.td}>{p.createdBy?.name || "N/A"}</td>
                      <td style={styles.td}>{p.createdBy?.email || "N/A"}</td>
                      <td style={styles.td}>{p.templateName}</td>
                      <td style={styles.td}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{ ...styles.button, ...styles.btnView }}
                          onClick={() => handleView(p)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.empty}>No pending prescriptions.</p>
          )}
        </div>

        {/* MODAL */}
        {selectedPrescription && (
          <div style={styles.card}>
            <h2 style={styles.subTitle}>Prescription Details</h2>
            <pre style={styles.pre}>
              {JSON.stringify(selectedPrescription, null, 2)}
            </pre>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <button
                style={{ ...styles.button, ...styles.btnApprove }}
                onClick={() => handleApprove(selectedPrescription._id)}
              >
                Approve
              </button>
              <button
                style={{ ...styles.button, ...styles.btnReject }}
                onClick={() => handleReject(selectedPrescription._id)}
              >
                Reject
              </button>
              <button
                style={{ ...styles.button, ...styles.btnClose }}
                onClick={() => dispatch(clearSelection())}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* REWARD HISTORY */}
        <div style={styles.card}>
          <h2 style={styles.subTitle}>Reward History</h2>
          {rewards.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Doctor Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Reward</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((r, i) => (
                    <tr key={r.id || i}>
                      <td style={styles.td}>{r.doctorName}</td>
                      <td style={styles.td}>{r.doctorEmail || "N/A"}</td>
                      <td style={styles.td}>{r.rewardType}</td>
                      <td style={styles.td}>
                        {new Date(r.approvedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.empty}>No rewards given yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ContributionRewards;
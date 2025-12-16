import React, { useEffect, useState } from "react";
// import { RiMedicineBottleFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  createDrugSafety,
  getDrugSafetyList,
  updateDrugSafety,
  deleteDrugSafety,
} from "../redux/slices/drugSafetySlice";

import { useToast } from "./ToastProvider";

const DrugLibrary = () => {
  const dispatch = useDispatch();
  const { loading, list = {} } = useSelector((state) => state.drugSafety);
  const safeList = Array.isArray(list) ? list : list.data || [];

  const { success, error, warn, info, showConfirm } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "interaction",
    drugName: "",
    stage: "",
    colorCode: "Red",
    category: "",
    remarks: "",
    advice: "",
  });

  const [type, setType] = useState("pregnancy");
  const [stage, setStage] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await dispatch(
          updateDrugSafety({
            id: editId,
            payload: formData,
          })
        ).unwrap();

        success("Drug safety rule updated successfully");
      } else {
        await dispatch(createDrugSafety(formData)).unwrap();

        success("Drug safety rule created successfully");
      }

      dispatch(getDrugSafetyList({ type, stage }));

      setShowForm(false);
      setIsEdit(false);
      setEditId(null);
    } catch (err) {
      error(err || "Failed to save drug safety rule");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      type: item.type,
      drugName: item.drugName,
      stage: item.stage || "",
      colorCode: item.colorCode,
      category: item.category,
      remarks: item.remarks,
      advice: item.advice,
    });

    setEditId(item._id);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await showConfirm({
      message: "Are you sure you want to delete this drug safety rule?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!ok) return;

    dispatch(deleteDrugSafety(id))
      .unwrap()
      .then(() => {
        success("Drug safety rule deleted successfully");
        dispatch(getDrugSafetyList({ type, stage }));
      })
      .catch(() => {
        error("Failed to delete drug safety rule");
      });
  };

  useEffect(() => {
    dispatch(getDrugSafetyList({ type, stage }));
  }, [dispatch, type, stage]);

  const getColor = (color) => {
    switch (color) {
      case "Red":
        return "#dc2626";
      case "Orange":
        return "#ea580c";
      case "Yellow":
        return "#ca8a04";
      case "Green":
        return "#16a34a";
      default:
        return "#64748b";
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Drug Library</h1>
            <p style={styles.subtitle}>
              Manage drug safety information and clinical warnings
            </p>
          </div>

          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close Form" : "+ Add Drug Safety"}
          </button>
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>
                {isEdit ? "Edit Drug Safety Rule" : "Create Drug Safety Rule"}
              </h3>
              <p style={styles.formSubtitle}>
                Define clinical safety rules used during prescription checks
              </p>
            </div>

            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Safety Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="pregnancy">Pregnancy</option>
                  <option value="kidney">Kidney</option>
                  <option value="liver">Liver</option>
                  <option value="interaction">Interaction</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Drug Name / Combination</label>
                <input
                  name="drugName"
                  placeholder="e.g. Metformin or Warfarin + Aspirin"
                  value={formData.drugName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              {(formData.type === "kidney" || formData.type === "liver") && (
                <div>
                  <label style={styles.label}>Disease Stage</label>
                  <input
                    name="stage"
                    placeholder="Mild / Moderate / Severe / Failure"
                    value={formData.stage}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              )}

              <div>
                <label style={styles.label}>Risk Level</label>
                <select
                  name="colorCode"
                  value={formData.colorCode}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    borderColor: getColor(formData.colorCode),
                  }}
                >
                  <option value="Green">Green – Safe</option>
                  <option value="Yellow">Yellow – Caution</option>
                  <option value="Orange">Orange – High Risk</option>
                  <option value="Red">Red – Contraindicated</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Category</label>
                <input
                  name="category"
                  placeholder="e.g. Moderate Renal Impairment"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>Clinical Remarks</label>
                <textarea
                  name="remarks"
                  placeholder="Short clinical risk description"
                  value={formData.remarks}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>Doctor Advice</label>
                <textarea
                  name="advice"
                  placeholder="Prescribing guidance for clinicians"
                  value={formData.advice}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.formFooter}>
              <button style={styles.submitBtn} disabled={loading}>
                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Update Drug Safety Rule"
                  : "Save Drug Safety Rule"}
              </button>
            </div>
          </form>
        )}

        {/* FILTERS */}
        <div style={styles.filters}>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setStage(""); // reset stage when type changes
            }}
            style={styles.filterSelect}
          >
            <option value="pregnancy">Pregnancy</option>
            <option value="breastfeeding">Breastfeeding</option>
            <option value="kidney">Kidney</option>
            <option value="liver">Liver</option>
            <option value="interaction">Interaction</option>
          </select>

          {(type === "kidney" || type === "liver") && (
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Select Stage</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Failure">Failure</option>
            </select>
          )}
        </div>

        {/* DRUG SAFETY TABLE */}
        <div style={styles.tableWrapper}>
          <h3 style={styles.tableTitle}>Drug Safety Rules</h3>

          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Color</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Drug Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Remarks</th>
                <th style={styles.th}>Advice</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No drug safety rules found
                  </td>
                </tr>
              ) : (
                safeList.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td>
                      <span
                        style={{
                          ...styles.badge,
                          background: getColor(item.colorCode),
                        }}
                      >
                        {item.colorCode}
                      </span>
                    </td>
                    <td>{item.type}</td>
                    <td>{item.drugName}</td>
                    <td>{item.category}</td>
                    <td>{item.remarks}</td>
                    <td>{item.advice}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "32px",
    minHeight: "100vh",
    background: "#f8fafc",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  title: { fontSize: "1.8rem", fontWeight: "700" },
  subtitle: { color: "#64748b" },
  addBtn: {
    background: "#0f766e",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15,118,110,0.3)",
  },
  tableHeaderRow: {
    borderBottom: "1px solid #e2e8f0",
  },

  th: {
    textAlign: "left",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#475569",
    padding: "14px 12px",
    background: "#ffffff",
  },

  tr: {
    borderBottom: "1px solid #e2e8f0",
  },

  td: {
    padding: "14px 12px",
    fontSize: "0.9rem",
    color: "#0f172a",
    verticalAlign: "top",
  },
  /* FORM */
  form: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "18px",
    marginBottom: "28px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    maxWidth: "760px",
  },
  formHeader: {
    marginBottom: "20px",
  },
  formTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#0f172a",
  },

  formSubtitle: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginTop: "4px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5f5",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "6px",
    display: "block",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #c7d2fe",
    minHeight: "90px",
    resize: "vertical",
    fontSize: "0.9rem",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #0f766e, #115e59)",
    color: "#fff",
    padding: "12px 26px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(15,118,110,0.35)",
  },
  formFooter: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-end",
  },
  tableWrapper: {
    background: "#ffffff",
    padding: "0",
    borderRadius: "12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    marginTop: "24px",
    overflowX: "auto",
  },

  tableTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    marginBottom: "16px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  badge: {
    padding: "4px 12px",
    borderRadius: "999px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "0.75rem",
    textTransform: "uppercase",
  },

  editBtn: {
    marginRight: "8px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f766e",
    cursor: "pointer",
    fontSize: "0.8rem",
  },

  deleteBtn: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "0.8rem",
  },

  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },

  filterSelect: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5f5",
    fontWeight: "500",
  },

  //   cardGrid: {
  //     display: "grid",
  //     gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  //     gap: "20px",
  //   },
  //   card: {
  //     background: "#fff",
  //     padding: "20px",
  //     borderRadius: "14px",
  //     boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  //   },
  //   cardTitle: { fontWeight: "600" },
  //   cardBtn: {
  //     marginTop: "10px",
  //     padding: "8px 12px",
  //     borderRadius: "8px",
  //     border: "1px solid #0f766e",
  //     background: "#fff",
  //     color: "#0f766e",
  //     fontWeight: "600",
  //   },
};

export default DrugLibrary;

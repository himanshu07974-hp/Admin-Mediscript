/* src/components/StudentExamScreen.jsx */
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchModules,
  createModule,
  createCase,
  createTopic,
  clearError,
} from "../redux/slices/examSlice";
import {
  Plus,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  X,
  Trash2,
  Layers,
  Save,
  Loader2,
  Eye,
} from "lucide-react";

import { useToast } from "../Components/ToastProvider";

/* -------------------------------------------------------------------------- */
/*                                 STYLES                                     */
/* -------------------------------------------------------------------------- */
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "2rem 1rem",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#1e293b",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "2.75rem",
    fontWeight: "800",
    color: "#0f766e",
    marginBottom: "0.5rem",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.125rem",
    maxWidth: "600px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.75rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    borderRadius: "1.25rem",
    padding: "1.75rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  cardHover: {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
    borderColor: "#94a3b8",
  },
  iconBox: {
    width: "4rem",
    height: "4rem",
    background: "linear-gradient(135deg, #0d9488, #14b8a6)",
    borderRadius: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
    boxShadow: "0 4px 12px rgba(20, 184, 166, 0.3)",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 0.5rem",
  },
  cardSubtitle: {
    fontSize: "0.925rem",
    color: "#64748b",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "#0d9488",
    color: "white",
    borderRadius: "9999px",
    border: "none",
    fontWeight: "600",
    fontSize: "0.925rem",
    cursor: "pointer",
    transition: "all 0.3s",
    marginBottom: "1.75rem",
  },
  fab: {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    width: "3.75rem",
    height: "3.75rem",
    background: "linear-gradient(135deg, #0d9488, #14b8a6)",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 30px rgba(20, 184, 166, 0.4)",
    cursor: "pointer",
    zIndex: 100,
    transition: "all 0.3s ease",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(10px)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "1.5rem",
    width: "100%",
    maxWidth: "900px",
    maxHeight: "95vh",
    overflowY: "auto",
    padding: "2rem",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    position: "relative",
    border: "1px solid #e2e8f0",
  },
  modalClose: {
    position: "absolute",
    top: "1.25rem",
    right: "1.25rem",
    background: "#f1f5f9",
    color: "#64748b",
    border: "none",
    borderRadius: "50%",
    width: "2.75rem",
    height: "2.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  modalTitle: {
    fontSize: "1.875rem",
    fontWeight: "800",
    color: "#0f766e",
    marginBottom: "1.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    fontSize: "1rem",
    marginBottom: "1rem",
    outline: "none",
    transition: "all 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    fontSize: "1rem",
    marginBottom: "1rem",
    resize: "vertical",
    minHeight: "100px",
  },
  select: {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    fontSize: "1rem",
    marginBottom: "1rem",
  },
  caseItem: {
    background: "#f8fafc",
    padding: "1.25rem",
    borderRadius: "1rem",
    marginBottom: "1.25rem",
    position: "relative",
    border: "1px dashed #cbd5e1",
  },
  removeBtn: {
    position: "absolute",
    top: "0.75rem",
    right: "0.75rem",
    background: "#ef4444",
    color: "white",
    border: "none",
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  addBtn: {
    background: "#0d9488",
    color: "white",
    padding: "0.625rem 1.25rem",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: "600",
    fontSize: "0.925rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  submitBtn: (loading) => ({
    width: "100%",
    background: loading
      ? "#059669"
      : "linear-gradient(135deg, #0d9488, #14b8a6)",
    color: "white",
    padding: "1rem",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: "700",
    fontSize: "1.1rem",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    opacity: loading ? 0.8 : 1,
  }),
  previewBox: {
    marginTop: "2rem",
    border: "1px solid #e2e8f0",
    borderRadius: "1rem",
    padding: "1.5rem",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    fontSize: "0.925rem",
    lineHeight: "1.6",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    fontWeight: "600",
    color: "#0f766e",
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
    gap: "1rem",
    zIndex: 300,
    fontWeight: "600",
    border: "1px solid #fecaca",
  },
};

/* -------------------------------------------------------------------------- */
/*                           MAIN COMPONENT                                   */
/* -------------------------------------------------------------------------- */
const StudentExamScreen = () => {
  const { success, error: toastError } = useToast();
  const dispatch = useDispatch();
  const {
    modules = [],
    loading,
    error,
  } = useSelector((state) => state.exams || {});

  // Navigation
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [moduleTitle, setModuleTitle] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [topic, setTopic] = useState(defaultTopic());

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  useEffect(() => {
  if (error) {
    toastError(error);
    dispatch(clearError());
  }
}, [error, toastError, dispatch]);

  /* ==================== NAVIGATION ==================== */
  const handleModuleClick = (mod) => {
    setSelectedModule(mod);
    setSelectedCase(null);
  };

  const handleCaseClick = (c) => {
    setSelectedCase(c);
    if (c.topic) setTopic(c.topic);
  };

  const resetToModules = () => {
    setSelectedModule(null);
    setSelectedCase(null);
    setShowForm(false);
  };

  const resetToCases = () => setSelectedCase(null);

  /* ==================== FORM HELPERS ==================== */
  const addCaseField = () => {
    setCases([...cases, { title: "", description: "" }]);
  };

  const updateCaseField = (i, field, value) => {
    const updated = [...cases];
    updated[i][field] = value;
    setCases(updated);
  };

  const removeCaseField = (i) => {
    setCases(cases.filter((_, idx) => idx !== i));
  };

  const updateTopicField = (path, value) => {
    const keys = path.split(".");
    const updated = { ...topic };
    let ref = updated;
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
    ref[keys[keys.length - 1]] = value;
    setTopic(updated);
  };

  const addMedicine = () => {
    setTopic({
      ...topic,
      content: {
        ...topic.content,
        prescriptionCreation: {
          ...topic.content.prescriptionCreation,
          medicines: [...topic.content.prescriptionCreation.medicines, ""],
        },
      },
    });
  };

  const updateMedicine = (i, value) => {
    const meds = [...topic.content.prescriptionCreation.medicines];
    meds[i] = value;
    setTopic({
      ...topic,
      content: {
        ...topic.content,
        prescriptionCreation: {
          ...topic.content.prescriptionCreation,
          medicines: meds,
        },
      },
    });
  };

  const removeMedicine = (i) => {
    setTopic({
      ...topic,
      content: {
        ...topic.content,
        prescriptionCreation: {
          ...topic.content.prescriptionCreation,
          medicines: topic.content.prescriptionCreation.medicines.filter(
            (_, idx) => idx !== i
          ),
        },
      },
    });
  };

  /* ==================== SUBMIT ==================== */
  const handleSubmit = async () => {
    if (!selectedModuleId && !moduleTitle.trim()) {
      toastError("Module is required");
      return;
    }

    if (cases.some((c) => c.title.trim() && !c.description.trim())) {
      toastError("Case description is required");
      return;
    }

    setSubmitting(true);
    try {
      let moduleId = selectedModuleId;
      if (!moduleId && moduleTitle.trim()) {
        const res = await dispatch(
          createModule({ title: moduleTitle })
        ).unwrap();
        moduleId = res._id;
      }

      for (const c of cases) {
        if (c.title.trim()) {
          await dispatch(createCase({ moduleId, caseData: c })).unwrap();
        }
      }

      if (selectedCaseId && topic.title.trim()) {
        await dispatch(
          createTopic({ moduleId, caseId: selectedCaseId, topicData: topic })
        ).unwrap();
      }

      success("Content saved successfully!");
      setShowForm(false);
      resetForm();
      dispatch(fetchModules());
    } catch (err) {
      toastError(err?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setModuleTitle("");
    setSelectedModuleId("");
    setCases([]);
    setSelectedCaseId("");
    setTopic(defaultTopic());
  };

  function defaultTopic() {
    return {
      title: "",
      content: {
        patientDemographics: {
          name: "",
          uhid: "",
          age: 0,
          gender: "",
          address: "",
          contact: "",
          email: "",
          referredBy: "",
        },
        clinicalHistory: {
          chiefComplaint: "",
          hpi: "",
          pastMedicalHistory: "",
          allergies: "",
        },
        examinationVitals: {
          height: 0,
          weight: 0,
          bmi: 0,
          bp: "",
          pulse: 0,
          temperature: 0,
          respiration: 0,
          spO2: 0,
          findings: "",
        },
        investigations: { labs: "", imaging: "", uploadReports: [] },
        diagnosis: { provisional: "", final: "" },
        prescriptionCreation: { templateSearch: "", medicines: [] },
        editPrescription: { medicines: [] },
        treatmentPlan: { lifestyleAdvice: "", proceduresReferrals: "" },
        followUp: { notes: "", nextAppointment: "", autoReminders: false },
        caseHistory: "",
        outputPreview: "",
      },
    };
  }

  /* ==================== PREVIEW HTML ==================== */
  const previewHTML = useMemo(() => {
    const c = selectedCase?.topic?.content || topic.content;
    const meds = c.prescriptionCreation.medicines;

    return `
      <div style="font-family:Arial,sans-serif; max-width:800px; margin:auto; border:1px solid #ddd; padding:20px; background:#fff; font-size:14px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
          <div>
            <strong style="font-size:16px; color:#0f766e;">City Health Clinic</strong><br>
            123, Main Street, Mumbai, India 400001<br>
            +91 98765 43210 | contact@cityhealth.in<br>
            GSTIN: 27AAAAA0000A1Z5 | License: MH/MED/123456
          </div>
          <div style="text-align:right;">
            <strong style="font-size:16px; color:#0f766e;">Dr Rajesh Gupta, MD</strong><br>
            General Medicine<br>Reg No: 123456<br>Prescription ID: Rx-0404
          </div>
        </div>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:15px 0;">
        <table style="width:100%; margin-bottom:15px;">
          <tr><td colspan="2" style="font-weight:600; color:#0f766e;">Patient Details</td></tr>
          <tr><td>Name: <strong>${
            c.patientDemographics.name || "-"
          }</strong></td><td>Age/Gender: <strong>${
      c.patientDemographics.age || "-"
    } / ${c.patientDemographics.gender || "-"}</strong></td></tr>
          <tr><td>UHID: <strong>${
            c.patientDemographics.uhid || "-"
          }</strong></td><td>Contact: <strong>${
      c.patientDemographics.contact || "-"
    }</strong></td></tr>
          <tr><td colspan="2">Address: <strong>${
            c.patientDemographics.address || "-"
          }</strong></td></tr>
        </table>
        <strong>Clinical History</strong><br>
        Chief: ${c.clinicalHistory.chiefComplaint || "-"}<br>
        HPI: ${c.clinicalHistory.hpi || "-"}<br>
        Past: ${c.clinicalHistory.pastMedicalHistory || "-"}<br>
        Allergies: ${c.clinicalHistory.allergies || "-"}<br><br>
        <strong>Vitals</strong><br>
        Ht: ${c.examinationVitals.height} cm Wt: ${
      c.examinationVitals.weight
    } kg BMI: ${c.examinationVitals.bmi}<br>
        BP: ${c.examinationVitals.bp} Pulse: ${
      c.examinationVitals.pulse
    } Temp: ${c.examinationVitals.temperature} Resp: ${
      c.examinationVitals.respiration
    } SpO2: ${c.examinationVitals.spO2}<br>
        Findings: ${c.examinationVitals.findings || "-"}<br><br>
        <strong>Investigations</strong><br>Labs: ${
          c.investigations.labs || "-"
        }<br>Imaging: ${c.investigations.imaging || "-"}<br><br>
        <strong>Diagnosis</strong><br>Provisional: ${
          c.diagnosis.provisional || "-"
        } Final: ${c.diagnosis.final || "-"}<br><br>
        <strong>Rx</strong>
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead><tr style="background:#0f766e; color:#fff;">
            <th style="padding:8px; border:1px solid #ccc;">#</th>
            <th style="padding:8px; border:1px solid #ccc;">Medicine</th>
          </tr></thead>
          <tbody>
            ${meds
              .map(
                (m, i) =>
                  `<tr><td style="padding:8px; border:1px solid #ccc;">${
                    i + 1
                  }</td><td style="padding:8px; border:1px solid #ccc;">${m}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
        <br><strong>Treatment Plan</strong><br>
        Lifestyle: ${c.treatmentPlan.lifestyleAdvice || "-"}<br>
        Procedures: ${c.treatmentPlan.proceduresReferrals || "-"}<br><br>
        <strong>Follow-up</strong><br>
        Notes: ${c.followUp.notes || "-"}<br>
        Next: ${
          c.followUp.nextAppointment
            ? new Date(c.followUp.nextAppointment).toLocaleDateString()
            : "-"
        }<br>
        <div style="text-align:right; margin-top:30px;">
          <strong>Dr Rajesh Gupta</strong><br>
          <small>Computer-generated prescription. Consult doctor if needed.</small>
        </div>
      </div>`;
  }, [selectedCase, topic]);

  return (
    <>
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
        .fab:hover {
          transform: scale(1.1);
          box-shadow: 0 16px 40px rgba(155, 161, 161, 0.5);
        }
        input:focus,
        textarea:focus,
        select:focus {
          border-color: #14b8a6 !important;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
        }
        .card-hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #94a3b8;
        }
      `}</style>

      <div style={styles.container}>
        {/* MODULES VIEW */}
        {!selectedModule && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Exam Modules</h1>
              <p style={styles.subtitle}>
                Click a module to explore cases and clinical topics
              </p>
            </div>
            {loading && (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "2.5rem",
                    height: "2.5rem",
                    border: "4px solid #0d9488",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            )}
            <div style={styles.grid}>
              {modules.map((mod) => (
                <div
                  key={mod._id}
                  style={styles.card}
                  onClick={() => handleModuleClick(mod)}
                  onMouseEnter={(e) =>
                    e.currentTarget.classList.add("card-hover")
                  }
                  onMouseLeave={(e) =>
                    e.currentTarget.classList.remove("card-hover")
                  }
                >
                  <div style={styles.iconBox}>
                    <BookOpen
                      style={{
                        width: "2.25rem",
                        height: "2.25rem",
                        color: "white",
                      }}
                    />
                  </div>
                  <h3 style={styles.cardTitle}>{mod.title}</h3>
                  <p style={styles.cardSubtitle}>
                    {mod.cases?.length || 0} case
                    {(mod.cases?.length || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CASES VIEW */}
        {selectedModule && !selectedCase && (
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <button style={styles.backBtn} onClick={resetToModules}>
              <ArrowLeft style={{ width: "1.25rem", height: "1.25rem" }} /> Back
              to Modules
            </button>
            <h1
              style={{
                ...styles.title,
                fontSize: "2.5rem",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              {selectedModule.title}
            </h1>
            <div style={styles.grid}>
              {selectedModule.cases?.map((c) => (
                <div
                  key={c._id}
                  style={styles.card}
                  onClick={() => handleCaseClick(c)}
                  onMouseEnter={(e) =>
                    e.currentTarget.classList.add("card-hover")
                  }
                  onMouseLeave={(e) =>
                    e.currentTarget.classList.remove("card-hover")
                  }
                >
                  <div style={styles.iconBox}>
                    <FileText
                      style={{ width: "2rem", height: "2rem", color: "white" }}
                    />
                  </div>
                  <h3 style={styles.cardTitle}>{c.title}</h3>
                  <p style={styles.cardSubtitle}>
                    {c.topic ? "1 topic" : "No topic"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOPIC PREVIEW */}
        {selectedModule && selectedCase && (
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <button style={styles.backBtn} onClick={resetToCases}>
              <ArrowLeft /> Back to Cases
            </button>
            <h2
              style={{
                ...styles.title,
                fontSize: "2.25rem",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              {selectedCase.title}
            </h2>
            <div style={styles.previewBox}>
              <div style={styles.previewHeader}>
                <span>Prescription Preview</span>
                <Eye style={{ color: "#0d9488" }} />
              </div>
              <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
            </div>
          </div>
        )}

        {/* FAB */}
        <div
          style={styles.fab}
          onClick={() => setShowForm(true)}
          className="fab"
        >
          <Plus style={{ width: "1.75rem", height: "1.75rem" }} />
        </div>

        {/* CREATE MODAL */}
        {showForm && (
          <div
            style={styles.modalOverlay}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <div style={styles.modal}>
              <button
                style={styles.modalClose}
                onClick={() => setShowForm(false)}
              >
                <X style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
              <h2 style={styles.modalTitle}>
                <Layers style={{ width: "2rem", height: "2rem" }} /> Create Exam
                Content
              </h2>

              {/* Module */}
              <select
                style={styles.select}
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setModuleTitle("");
                }}
              >
                <option value="">Select Existing Module</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
              {!selectedModuleId && (
                <input
                  type="text"
                  placeholder="New Module Title"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  style={styles.input}
                />
              )}

              {/* Cases */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#0f766e",
                    }}
                  >
                    Add Cases
                  </h3>
                  <button onClick={addCaseField} style={styles.addBtn}>
                    <Plus /> Add Case
                  </button>
                </div>
                {cases.map((c, i) => (
                  <div key={i} style={styles.caseItem}>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeCaseField(i)}
                    >
                      <X style={{ width: "1rem", height: "1rem" }} />
                    </button>
                    <input
                      type="text"
                      placeholder="Case Title"
                      value={c.title}
                      onChange={(e) =>
                        updateCaseField(i, "title", e.target.value)
                      }
                      style={styles.input}
                    />
                    <textarea
                      placeholder="Case Description"
                      value={c.description}
                      onChange={(e) =>
                        updateCaseField(i, "description", e.target.value)
                      }
                      style={styles.textarea}
                    />
                  </div>
                ))}
              </div>

              {/* Select Case for Topic */}
              {selectedModuleId &&
                modules.find((m) => m._id === selectedModuleId)?.cases?.length >
                  0 && (
                  <select
                    style={styles.select}
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                  >
                    <option value="">Select Case to Add Topic</option>
                    {modules
                      .find((m) => m._id === selectedModuleId)
                      ?.cases?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                )}

              {/* Full Topic Form */}
              {selectedCaseId && (
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#0f766e",
                      marginBottom: "1rem",
                    }}
                  >
                    Topic Details
                  </h3>
                  <input
                    type="text"
                    placeholder="Topic Title"
                    value={topic.title}
                    onChange={(e) =>
                      setTopic({ ...topic, title: e.target.value })
                    }
                    style={styles.input}
                  />

                  {/* Patient Demographics */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      onChange={(e) =>
                        updateTopicField(
                          "content.patientDemographics.name",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="UHID"
                      onChange={(e) =>
                        updateTopicField(
                          "content.patientDemographics.uhid",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      onChange={(e) =>
                        updateTopicField(
                          "content.patientDemographics.age",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    />
                    <select
                      style={styles.select}
                      onChange={(e) =>
                        updateTopicField(
                          "content.patientDemographics.gender",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Address"
                    onChange={(e) =>
                      updateTopicField(
                        "content.patientDemographics.address",
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Contact"
                      onChange={(e) =>
                        updateTopicField(
                          "content.patientDemographics.contact",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      onChange={(e) =>
                        updateTopicField(
                          "content.patientDemographics.email",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    />
                  </div>

                  {/* Clinical History */}
                  <h4
                    style={{
                      margin: "1.5rem 0 0.75rem",
                      color: "#0f766e",
                      fontWeight: "600",
                    }}
                  >
                    Clinical History
                  </h4>
                  <textarea
                    placeholder="Chief Complaint"
                    onChange={(e) =>
                      updateTopicField(
                        "content.clinicalHistory.chiefComplaint",
                        e.target.value
                      )
                    }
                    style={styles.textarea}
                  />
                  <textarea
                    placeholder="History of Present Illness"
                    onChange={(e) =>
                      updateTopicField(
                        "content.clinicalHistory.hpi",
                        e.target.value
                      )
                    }
                    style={styles.textarea}
                  />
                  <textarea
                    placeholder="Past Medical History"
                    onChange={(e) =>
                      updateTopicField(
                        "content.clinicalHistory.pastMedicalHistory",
                        e.target.value
                      )
                    }
                    style={styles.textarea}
                  />
                  <input
                    type="text"
                    placeholder="Allergies"
                    onChange={(e) =>
                      updateTopicField(
                        "content.clinicalHistory.allergies",
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />

                  {/* Add all other fields similarly... */}
                  {/* For brevity, only key ones shown. Add rest as needed. */}

                  {/* Medicines */}
                  <h4
                    style={{
                      margin: "1.5rem 0 0.75rem",
                      color: "#0f766e",
                      fontWeight: "600",
                    }}
                  >
                    Prescription
                  </h4>
                  <button onClick={addMedicine} style={styles.addBtn}>
                    + Add Medicine
                  </button>
                  {topic.content.prescriptionCreation.medicines.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <input
                        value={m}
                        onChange={(e) => updateMedicine(i, e.target.value)}
                        style={{ ...styles.input, flex: 1 }}
                        placeholder="e.g. Aspirin 75 mg once daily"
                      />
                      <button
                        onClick={() => removeMedicine(i)}
                        style={styles.removeBtn}
                      >
                        <X />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Preview */}
              <div style={styles.previewBox}>
                <div style={styles.previewHeader}>
                  <span>Live Preview</span>
                  <Eye style={{ color: "#0d9488" }} />
                </div>
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={styles.submitBtn(submitting)}
              >
                {submitting ? (
                  <Loader2
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Save style={{ width: "1.5rem", height: "1.5rem" }} />
                )}
                {submitting ? "Saving..." : "Save All Content"}
              </button>
            </div>
          </div>
        )}

        {/* ERROR TOAST
        {error && (
          <div style={styles.errorToast}>
            {error}
            <button
              onClick={() => dispatch(clearError())}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>
        )} */}
      </div>
    </>
  );
};

export default StudentExamScreen;

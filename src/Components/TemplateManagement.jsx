/* src/components/TemplateManagement.jsx */
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaNotesMedical,
  FaEye,
  FaPlus,
  FaClipboardCheck,
  FaEdit,
  FaTrash,
  FaEye as FaView,
} from "react-icons/fa";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Library,
  X,
  Upload,
  Image as ImageIcon,
  FileText,
  Save,
  Loader2,
  Plus,
  CheckCircle,
  Circle,
  GitBranch,
} from "lucide-react";

import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

// Redux Actions
import {
  fetchTemplates,
  fetchTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  clearError,
  clearSelected,
} from "../redux/slices/prescriptionSlice";
import {
  fetchSystems,
  createSystem,
  createModule,
  createChapter,
  addSectionsToChapter,
  selectSystem,
  selectModule,
  selectChapter,
  clearSelection,
} from "../redux/slices/systemsSlice";

// Components
import AddTemplateForm from "./AddTemplateForm";
import ExamMode from "./ExamMode";

import { useToast } from "../Components/ToastProvider";

// Initial Drugs
const initialDrugs = [
  { generic: "Paracetamol", brand: "Crocin", form: "Tablet" },
  { generic: "Metformin", brand: "Glyciphage", form: "Tablet" },
  { generic: "Atorvastatin", brand: "Atorva", form: "Tablet" },
  { generic: "Amoxicillin", brand: "Mox", form: "Capsule" },
  { generic: "Omeprazole", brand: "Omez", form: "Capsule" },
  { generic: "Losartan", brand: "Losar", form: "Tablet" },
  { generic: "Azithromycin", brand: "Azithral", form: "Tablet" },
  { generic: "Amlodipine", brand: "Amlodac 5", form: "Tablet" },
  { generic: "Aspirin", brand: "Ecosprin 75", form: "Tablet" },
];

/* -------------------------------------------------------------------------- */
/*                                 STYLES (TOP)                               */
/* -------------------------------------------------------------------------- */
const styles = {
  container: {
    padding: "1rem",
    flex: 1,
    minHeight: "100vh",
    maxWidth: "90vw",
    margin: "0 auto",
    backgroundColor: "#FFFFFF",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    color: "#186476",
    marginBottom: "1rem",
    fontSize: "1.5rem",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  tabContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  btnPrimary: {
    padding: "0.5rem 0.75rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    color: "white",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  activeButton: { background: "linear-gradient(135deg, #186476, #3fa3b9)" },
  inactiveButton: { background: "#6c757d" },
  section: {
    marginBottom: "1rem",
    padding: "1rem",
    borderRadius: "0.75rem",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflowX: "auto",
    border: "1px solid #e5e7eb",
  },
  subHeader: {
    color: "#186476",
    fontSize: "1.25rem",
    marginBottom: "0.75rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    background: "#ffffff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    fontSize: "0.9rem",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    background: "#F8FAFC",
    color: "#334155",
    fontWeight: "700",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: "1px solid #E5E7EB",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 16px",
    color: "#0F172A",
    borderBottom: "1px solid #EEF2F7",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  error: { color: "#dc2626", marginBottom: "0.5rem", fontWeight: "500" },
  buttonGroup: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  actionBtn: {
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.2s",
    minWidth: "80px",
  },
};

/* -------------------------------------------------------------------------- */
/*                         PRESCRIPTION PREVIEW MODAL                         */
/* -------------------------------------------------------------------------- */
const PrescriptionPreview = ({ template, onClose, chapterContent = null }) => {
  const td = template?.templateData || {};
  const { clinicalHistory = {}, treatmentPlan = {} } = td;

  const {
    chiefComplaint = "",
    pastMedicalHistory = "",
    familyHistory = "",
    diagnosis = {},
    investigations = "",
  } = clinicalHistory;

  const { provisional = "", final: finalDx = "" } = diagnosis;

  const {
    lifestyleAdvice = {},
    prescription = [],
    procedures = "",
    referrals = "",
  } = treatmentPlan;

  const { text: lifestyleText = "" } = lifestyleAdvice;

  const { title: chapterTitle = "", sections = [] } = chapterContent || {};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "1rem",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "95vh",
          overflowY: "auto",
          padding: "2rem",
          position: "relative",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "#fee2e2",
            borderRadius: "9999px",
            border: "none",
            padding: "0.5rem",
            cursor: "pointer",
          }}
        >
          <X className="w-5 h-5 text-red-600" />
        </button>

        <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />

        {chapterTitle && (
          <>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "1.4rem",
                color: "#186476",
                margin: "1.5rem 0 1rem",
                textAlign: "center",
              }}
            >
              {chapterTitle}
            </h3>
            <hr style={{ borderColor: "#d1d5db" }} />
          </>
        )}

        {sections.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            {sections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    fontWeight: "600",
                    color: "#186476",
                    marginBottom: "0.5rem",
                    fontSize: "1.1rem",
                  }}
                >
                  {sec.title}
                </h4>
                <p
                  style={{
                    whiteSpace: "pre-line",
                    color: "#1f2937",
                    lineHeight: "1.6",
                  }}
                >
                  {sec.content}
                </p>

                {sec.images?.length > 0 && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "0.75rem",
                      }}
                    >
                      {sec.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Illustration ${i + 1}`}
                          style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "contain",
                            borderRadius: "0.75rem",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sec.flowcharts?.length > 0 && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <p style={{ fontWeight: "600", color: "#186476" }}>
                      Flowchart:
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "0.75rem",
                      }}
                    >
                      {sec.flowcharts.map((fc, i) => (
                        <div
                          key={i}
                          style={{
                            border: "1px dashed #9ca3af",
                            borderRadius: "0.75rem",
                            padding: "1rem",
                            textAlign: "center",
                            background: "#f9fafb",
                            minHeight: "120px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          <FileText className="w-8 h-8 text-teal-600" />
                          <span
                            style={{ fontSize: "0.8rem", color: "#4b5563" }}
                          >
                            Flowchart {i + 1}
                          </span>
                          {fc.endsWith(".pdf") ? (
                            <a
                              href={fc}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#3b82f6", fontSize: "0.8rem" }}
                            >
                              View PDF
                            </a>
                          ) : (
                            <img
                              src={fc}
                              alt={`Flowchart ${i + 1}`}
                              style={{
                                maxHeight: "150px",
                                borderRadius: "0.5rem",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <hr style={{ margin: "1.5rem 0", borderColor: "#d1d5db" }} />
          </div>
        )}

        {(chiefComplaint || pastMedicalHistory || familyHistory) && (
          <>
            <h3
              style={{
                fontWeight: "600",
                color: "#186476",
                margin: "1rem 0 0.5rem",
              }}
            >
              Clinical History
            </h3>
            {chiefComplaint && (
              <p>
                <strong>Chief Complaint:</strong> {chiefComplaint}
              </p>
            )}
            {pastMedicalHistory && (
              <p>
                <strong>Past Medical History:</strong> {pastMedicalHistory}
              </p>
            )}
            {familyHistory && (
              <p>
                <strong>Family History:</strong> {familyHistory}
              </p>
            )}
            <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />
          </>
        )}
        {investigations && (
          <>
            <h3
              style={{
                fontWeight: "600",
                color: "#186476",
                margin: "1rem 0 0.5rem",
              }}
            >
              Investigations
            </h3>
            <p>{investigations}</p>
          </>
        )}

        {(provisional || finalDx) && (
          <>
            <h3
              style={{
                fontWeight: "600",
                color: "#186476",
                margin: "1rem 0 0.5rem",
              }}
            >
              Diagnosis
            </h3>
            {provisional && (
              <p>
                <strong>Provisional:</strong> {provisional}
              </p>
            )}
            {finalDx && (
              <p>
                <strong>Final:</strong> {finalDx}
              </p>
            )}
            <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />
          </>
        )}

        {prescription.length > 0 && (
          <>
            <h3
              style={{
                fontWeight: "600",
                color: "#186476",
                margin: "1rem 0 0.5rem",
              }}
            >
              Rx (Prescription)
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#e6f3f7" }}>
                  <th
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  >
                    Serial
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Brand Name
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Generic Name
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Route
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Dose
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Timings
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Duration
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Notes Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescription.map((med, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {med.brandName || "-"}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {med.genericName || "-"}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {med.route || "-"}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {med.dose || "-"}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {med.timings || "-"}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        textAlign: "center",
                      }}
                    >
                      {med.duration || "-"}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        fontSize: "0.875rem",
                      }}
                    >
                      {med.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />
          </>
        )}

        {(lifestyleText || procedures || referrals) && (
          <>
            <h3
              style={{
                fontWeight: "600",
                color: "#186476",
                margin: "1rem 0 0.5rem",
              }}
            >
              Treatment Plan
            </h3>
            {lifestyleText && (
              <p>
                <strong>Lifestyle Advice:</strong> {lifestyleText}
              </p>
            )}
            {procedures && (
              <p>
                <strong>Procedures:</strong> {procedures}
              </p>
            )}
            {referrals && (
              <p>
                <strong>Referrals:</strong> {referrals}
              </p>
            )}
            <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />
          </>
        )}

        <div
          style={{
            marginTop: "2rem",
            textAlign: "right",
            fontSize: "0.9rem",
            color: "#4b5563",
          }}
        >
          <em>
            Disclaimer: This is a computer-generated prescription. If symptoms
            persist or worsen, consult your doctor immediately.
          </em>
          <br />
          <strong>Dr. Rajesh Gupta</strong>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, onClick, danger = false }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.6rem 0.75rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      fontSize: "0.9rem",
      fontWeight: 500,
      color: danger ? "#dc2626" : "#1f2937",
      transition: "all 0.15s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = danger ? "#fee2e2" : "#f3f4f6";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    <span
      style={{
        color: danger ? "#dc2626" : "#475569",
        display: "flex",
      }}
    >
      {icon}
    </span>
    {label}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                           MAIN COMPONENT                                   */
/* -------------------------------------------------------------------------- */
function TemplateManagement() {
  const dispatch = useDispatch();

  const { success, error: toastError, showConfirm } = useToast();

  // Redux State
  const {
    templates,
    selectedTemplate,
    loading: presLoading,
    error: presError,
  } = useSelector(
    (state) =>
      state.prescriptions || {
        templates: [],
        selectedTemplate: null,
        loading: false,
        error: null,
      }
  );

  const systemsState = useSelector(
    (state) =>
      state.systems || {
        byId: {},
        allIds: [],
        selected: {},
        loading: false,
        error: null,
      }
  );
  const {
    byId,
    allIds,
    selected,
    loading: sysLoading,
    error: sysError,
  } = systemsState;

  // Local State
  const [activeTab, setActiveTab] = useState("prescription");
  const [showAddTemplateForm, setShowAddTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showExamModeForm, setShowExamModeForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [systemTitle, setSystemTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [sections, setSections] = useState([
    { title: "", content: "", images: [], flowcharts: [] },
  ]);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewChapter, setPreviewChapter] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const PAGE_SIZE = 10;
  const [templatesPage, setTemplatesPage] = useState(1);

  // Load data
  useEffect(() => {
    dispatch(fetchTemplates());
    dispatch(fetchSystems());
  }, [dispatch]);

  /* ==================== REUSABLE STYLE FUNCTIONS ==================== */
  const blobStyle = (w, h, bg, top, left, reverse = false) => ({
    position: "absolute",
    width: `${w}rem`,
    height: `${h}rem`,
    background: bg,
    borderRadius: "9999px",
    filter: "blur(80px)",
    top,
    left,
    animation: `pulse ${reverse ? "5s" : "4s"} infinite ${
      reverse ? "reverse" : ""
    }`,
  });

  const titleStyle = (size, color) => ({
    fontSize: size,
    fontWeight: "800",
    color,
    marginBottom: "0.5rem",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  });

  const subtitleStyle = {
    color: "#6b7280",
    fontSize: "1.125rem",
    marginBottom: "3rem",
  };

  const gridStyle = (cols) => ({
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(16rem, 1fr))`,
    gap: "2rem",
    maxWidth: "90rem",
    margin: "auto",
  });

  const containerStyle = {
    maxWidth: "90rem",
    margin: "auto",
    animation: "fadeIn 0.6s ease-out",
  };

  const headerRowStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "2.5rem",
    alignItems: "center",
  };

  const backBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "#186476",
    color: "white",
    borderRadius: "9999px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    marginBottom: "1.5rem",
  };

  const systemCardStyle = {
    width: "100%",
    height: "20rem",
    background: "linear-gradient(135deg, #186476, #3fa3b9)",
    borderRadius: "1.5rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15), 0 0 20px rgba(6, 182, 212, 0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.4s ease",
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(103, 232, 249, 0.3)",
  };

  const glowEffectStyle = {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)",
    borderRadius: "1.5rem",
    opacity: 0,
    transition: "opacity 0.4s",
  };

  const iconWrapperStyle = {
    padding: "1.25rem",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "1rem",
    marginBottom: "1rem",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.3)",
  };

  const cardTitleStyle = {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "white",
    padding: "0 1.5rem",
    textAlign: "center",
  };

  const arrowStyle = {
    position: "absolute",
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
    opacity: 0,
    transition: "opacity 0.3s",
  };

  const loadingStyle = {
    textAlign: "center",
    color: "#186476",
    fontSize: "1.25rem",
    fontWeight: "500",
    padding: "5rem 0",
  };

  const spinnerStyle = {
    display: "inline-block",
    width: "2rem",
    height: "2rem",
    border: "3px solid #186476",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "0.75rem",
  };

  const errorStyle = {
    textAlign: "center",
    color: "#dc2626",
    background: "#fee2e2",
    padding: "2rem",
    borderRadius: "1rem",
    maxWidth: "32rem",
    margin: "auto",
    fontWeight: "600",
    border: "1px solid #fecaca",
  };

  const addBtnStyle = {
    position: "fixed",
    right: "2rem",
    bottom: "2rem",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.75rem",
    background: "linear-gradient(135deg, #0891b2, #0d9488)",
    color: "white",
    borderRadius: "9999px",
    boxShadow: "0 10px 25px rgba(8, 145, 178, 0.3)",
    fontWeight: "700",
    fontSize: "1.125rem",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const moduleCardStyle = {
    height: "18rem",
    background: "linear-gradient(135deg, #0e7490, #0f766e)",
    borderRadius: "1.5rem",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.4s ease",
    position: "relative",
    border: "1px solid rgba(103, 232, 249, 0.2)",
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
    borderRadius: "1.5rem",
    opacity: 0,
    transition: "opacity 0.4s",
  };

  const pulseDotsStyle = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem",
    opacity: 0,
    transition: "opacity 0.3s",
  };

  const dotStyle = (delay) => ({
    width: "0.5rem",
    height: "0.5rem",
    background: "#67e8f9",
    borderRadius: "50%",
    animation: `pulse 1.5s infinite ${delay}ms`,
  });

  const chapterCardStyle = {
    height: "18rem",
    background: "linear-gradient(135deg, #14b8a6, #0891b2)",
    borderRadius: "1.5rem",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.4s ease",
    position: "relative",
    border: "1px solid rgba(103, 232, 249, 0.2)",
  };

  const bottomGlowStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "0.25rem",
    background: "linear-gradient(to right, transparent, #67e8f9, transparent)",
    opacity: 0,
    transition: "opacity 0.3s",
  };

  const sidebarStyle = {
    width: "100%",
    maxWidth: "20rem",
    background: "#f9fafb",
    borderRadius: "1.5rem",
    padding: "1.5rem",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  };

  const sidebarTitleStyle = {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#186476",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const sectionBtnStyle = (active) => ({
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "1rem",
    background: active ? "#10b981" : "#f3f4f6",
    color: active ? "white" : "#1f2937",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s",
    fontWeight: active ? "600" : "500",
  });

  const contentStyle = {
    flex: 1,
    background: "#ffffff",
    borderRadius: "1.5rem",
    padding: "2rem",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    color: "#1f2937",
  };

  const contentTextStyle = {
    whiteSpace: "pre-line",
    lineHeight: "1.8",
    fontSize: "1.1rem",
  };

  const sectionHeaderStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#186476",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const imageGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
    gap: "1.5rem",
  };

  const imageCardStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const imageStyle = {
    width: "100%",
    height: "16rem",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  };

  const imageOverlayStyle = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
    opacity: 0,
    transition: "opacity 0.3s",
  };

  const flowchartCardStyle = {
    background: "#f3f4f6",
    borderRadius: "1rem",
    padding: "1.5rem",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  };

  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  };

  const modalStyle = {
    background: "#ffffff",
    borderRadius: "1rem",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "50rem",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "2rem",
    position: "relative",
    border: "1px solid #e5e7eb",
  };

  const closeBtnStyle = {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "#e5e7eb",
    color: "#6b7280",
    border: "none",
    borderRadius: "50%",
    width: "2.5rem",
    height: "2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  const modalTitleStyle = {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#186476",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#1f2937",
    fontSize: "1rem",
    marginBottom: "1rem",
    outline: "none",
    transition: "border 0.3s",
  };

  const labelStyle = {
    color: "#186476",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
    display: "block",
  };

  const fileInputStyle = {
    width: "100%",
    padding: "0.5rem",
    background: "#f9fafb",
    color: "#6b7280",
    borderRadius: "0.5rem",
    border: "1px dashed #d1d5db",
    fontSize: "0.875rem",
  };

  const sectionBoxStyle = {
    background: "#f9fafb",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginBottom: "1rem",
    border: "1px solid #e5e7eb",
  };

  const addSectionBtnStyle = {
    padding: "0.5rem 1rem",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
  };

  const cancelBtnStyle = {
    padding: "0.75rem 1.5rem",
    background: "#e5e7eb",
    color: "#6b7280",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
  };

  const saveBtnStyle = (loading) => ({
    padding: "0.75rem 1.5rem",
    background: loading
      ? "#059669"
      : "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "600",
    opacity: loading ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  });

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.6rem 0.9rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#1f2937",
    transition: "background 0.2s",
  };
  menuItemStyle[":hover"] = { background: "#f3f4f6" };

  const menuContainerStyle = {
    position: "absolute",
    right: "0.5rem",
    top: "2.4rem",
    background: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    border: "1px solid #e5e7eb",
    minWidth: "180px",
    padding: "0.35rem",
    zIndex: 50,
    animation: "fadeInScale 0.15s ease-out",
  };

  const menuDividerStyle = {
    height: "1px",
    background: "#e5e7eb",
    margin: "0.35rem 0",
  };

  // Hover handler
  const cardHover = (e, enter, isModule = false) => {
    const card = e.currentTarget;
    if (enter) {
      card.style.transform = isModule
        ? "translateY(-6px) scale(1.03)"
        : "translateY(-8px) scale(1.05)";
      card.style.boxShadow =
        "0 20px 40px rgba(0,0,0,0.2), 0 0 30px rgba(6, 182, 212, 0.4)";
      const glow = card.querySelector(".glow");
      const arrow = card.querySelector(".arrow");
      const overlay = card.querySelector(".overlay");
      const dots = card.querySelector(".pulse-dots");
      const bottomGlow = card.querySelector(".bottom-glow");
      if (glow) glow.style.opacity = 1;
      if (arrow) arrow.style.opacity = 1;
      if (overlay) overlay.style.opacity = 1;
      if (dots) dots.style.opacity = 1;
      if (bottomGlow) bottomGlow.style.opacity = 1;
    } else {
      card.style.transform = "translateY(0) scale(1)";
      card.style.boxShadow =
        "0 10px 30px rgba(0,0,0,0.15), 0 0 20px rgba(6, 182, 212, 0.2)";
      const glow = card.querySelector(".glow");
      const arrow = card.querySelector(".arrow");
      const overlay = card.querySelector(".overlay");
      const dots = card.querySelector(".pulse-dots");
      const bottomGlow = card.querySelector(".bottom-glow");
      if (glow) glow.style.opacity = 0;
      if (arrow) arrow.style.opacity = 0;
      if (overlay) overlay.style.opacity = 0;
      if (dots) dots.style.opacity = 0;
      if (bottomGlow) bottomGlow.style.opacity = 0;
    }
  };

  useEffect(() => {
    if (presError) {
      toastError(presError);
      dispatch(clearError());
    }
    if (sysError) {
      toastError(sysError);
    }
  }, [presError, sysError, toastError, dispatch]);

  // ---------- PREVIEW HANDLERS ----------
  const openView = async (id) => {
    await dispatch(fetchTemplateById(id));
    const chapter = selectSelectedChapter(selected, byId);
    setPreviewChapter(chapter);
    setShowPreview(true);
  };

  const closeView = () => {
    setShowPreview(false);
    dispatch(clearSelected());
    setPreviewChapter(null);
  };

  // ---------- TEMPLATE CRUD ----------
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowAddTemplateForm(true);
  };

  // const handleDeleteTemplate = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this template?")) {
  //     await dispatch(deleteTemplate(id));

  //   }
  // };

  const handleDeleteTemplate = async (id) => {
    const ok = await showConfirm({
      message: "Are you sure you want to delete this template?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!ok) return;

    try {
      await dispatch(deleteTemplate(id)).unwrap();
      success("Template deleted successfully");
    } catch (err) {
      toastError(err?.message || "Failed to delete template");
    }
  };

  const handleSaveTemplate = async (templateData) => {
    if (editingTemplate) {
      await dispatch(updateTemplate({ id: editingTemplate._id, templateData }));
    } else {
      await dispatch(createTemplate(templateData));
    }
    setShowAddTemplateForm(false);
    setEditingTemplate(null);
  };

  const totalTemplatePages = Math.max(
    1,
    Math.ceil(templates.length / PAGE_SIZE)
  );

  const paginatedTemplates = useMemo(() => {
    const start = (templatesPage - 1) * PAGE_SIZE;
    return templates.slice(start, start + PAGE_SIZE);
  }, [templates, templatesPage]);

  // ---------- READ-MODE NAVIGATION ----------
  const handleCardClick = (type, id) => {
    if (type === "system") dispatch(selectSystem(id));
    if (type === "module") dispatch(selectModule(id));
    if (type === "chapter") dispatch(selectChapter(id));
  };

  // ---------- ADD FORM ----------
  const handleAddSection = () => {
    setSections([
      ...sections,
      { title: "", content: "", images: [], flowcharts: [] },
    ]);
  };

  const handleSectionChange = (i, field, value) => {
    const updated = [...sections];
    updated[i][field] = value;
    setSections(updated);
  };

  const handleFileUpload = async (i, type, files) => {
    setUploading(true);
    const uploadedUrls = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("https://api.mediscript.in/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    const updated = [...sections];
    updated[i][type] = [...updated[i][type], ...uploadedUrls];
    setSections(updated);
    setUploading(false);
  };

  const handleSubmit = async () => {
    let sysId = selected.systemId;
    let modId = selected.moduleId;
    let chapId = selected.chapterId;

    if (!sysId && systemTitle) {
      const res = await dispatch(
        createSystem({ title: systemTitle, description: "" })
      );
      if (res.type === "systems/createSystem/fulfilled") {
        sysId = res.payload._id;
        dispatch(selectSystem(sysId));
      }
    }
    if (!modId && moduleTitle) {
      const res = await dispatch(
        createModule({ systemId: sysId, title: moduleTitle })
      );
      if (res.type === "systems/createModule/fulfilled") {
        modId = res.payload.module._id;
        dispatch(selectModule(modId));
      }
    }
    if (!chapId && chapterTitle) {
      const res = await dispatch(
        createChapter({ moduleId: modId, title: chapterTitle })
      );
      if (res.type === "systems/createChapter/fulfilled") {
        chapId = res.payload.chapter._id;
        dispatch(selectChapter(chapId));
      }
    }

    if (chapId) {
      const valid = sections.filter((s) => s.title && s.content);
      if (valid.length > 0) {
        await dispatch(
          addSectionsToChapter({ chapterId: chapId, sections: valid })
        );
      }
    }

    success("Content saved successfully!");
    setShowAddForm(false);
    setSystemTitle("");
    setModuleTitle("");
    setChapterTitle("");
    setSections([{ title: "", content: "", images: [], flowcharts: [] }]);
    dispatch(clearSelection());
  };

  // ---------- HELPERS ----------
  const selectSelectedModule = (selected, byId) => {
    if (!selected.systemId || !selected.moduleId) return null;
    return byId[selected.systemId]?.modules?.find(
      (m) => m._id === selected.moduleId
    );
  };

  const selectSelectedChapter = (selected, byId) => {
    const module = selectSelectedModule(selected, byId);
    if (!module || !selected.chapterId) return null;
    return module.chapters?.find((c) => c._id === selected.chapterId);
  };

  // ---------- TABLE ROWS ----------
  const tableRows = useMemo(() => {
    return paginatedTemplates.map((t, index) => {
      // ✅ global index across pages
      const displayIndex = (templatesPage - 1) * PAGE_SIZE + index;

      return (
        <tr
          key={t._id}
          style={{
            backgroundColor: displayIndex % 2 === 0 ? "#ffffff" : "#F9FAFB",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#EEF2FF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              displayIndex % 2 === 0 ? "#ffffff" : "#F9FAFB";
          }}
        >
          {/* S.No */}
          <td style={styles.td}>{displayIndex + 1}</td>

          {/* ID */}
          <td style={styles.td}>
            {t._id || t.id ? (t._id || t.id).slice(-6) : "—"}
          </td>

          {/* System */}
          <td style={styles.td}>{t.system || "N/A"}</td>

          {/* Disease */}
          <td style={styles.td}>{t.disease}</td>

          {/* Updated */}
          <td style={styles.td}>
            {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "—"}
          </td>

          {/* Actions */}
          <td style={{ ...styles.td, position: "relative" }}>
            <button
              onClick={() => setOpenMenuId(openMenuId === t._id ? null : t._id)}
              title="Actions"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EEF2FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F8FAFC";
              }}
            >
              <MoreVertical size={16} color="#475569" />
            </button>

            {openMenuId === t._id && (
              <div style={menuContainerStyle}>
                <MenuItem
                  icon={<Eye size={16} />}
                  label="View"
                  onClick={() => {
                    setOpenMenuId(null);
                    openView(t._id);
                  }}
                />
                <MenuItem
                  icon={<Pencil size={16} />}
                  label="Edit"
                  onClick={() => {
                    setOpenMenuId(null);
                    handleEditTemplate(t);
                  }}
                />
                <div style={menuDividerStyle} />
                <MenuItem
                  icon={<Trash2 size={16} />}
                  label="Delete"
                  danger
                  onClick={() => {
                    setOpenMenuId(null);
                    handleDeleteTemplate(t._id);
                  }}
                />
              </div>
            )}
          </td>
        </tr>
      );
    });
  }, [paginatedTemplates, openMenuId, templatesPage]);
  // ✅ FIXED

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .back-btn:hover {
          background: #0d9488;
        }
        .add-btn:hover {
          transform: scale(1.05);
        }
        input:focus,
        textarea:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div style={styles.container}>
        <h2 style={styles.header}>
          <FaNotesMedical size={24} color="#186476" /> Template & Content
          Management
        </h2>

        {/* TABS */}
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.btnPrimary,
              ...(activeTab === "prescription"
                ? styles.activeButton
                : styles.inactiveButton),
            }}
            onClick={() => setActiveTab("prescription")}
          >
            Prescription Library
          </button>
          {/* <button
            style={{
              ...styles.btnPrimary,
              ...(activeTab === "readmode" ? styles.activeButton : styles.inactiveButton),
            }}
            onClick={() => setActiveTab("readmode")}
          >
            <FaEye /> Read Mode
          </button> */}
          <button
            style={{
              ...styles.btnPrimary,
              ...(activeTab === "exam"
                ? styles.activeButton
                : styles.inactiveButton),
            }}
            onClick={() => {
              setActiveTab("exam");
              window.location.href = "/read-mode";
            }}
          >
            Read Mode
          </button>
          <button
            style={{
              ...styles.btnPrimary,
              ...(activeTab === "exam"
                ? styles.activeButton
                : styles.inactiveButton),
            }}
            onClick={() => {
              setActiveTab("exam");
              window.location.href = "/student-exam";
            }}
          >
            Exam Mode
          </button>
        </div>

        {/* PRESCRIPTION TAB */}
        {activeTab === "prescription" && (
          <div style={styles.section}>
            <h3 style={styles.subHeader}>
              Prescription Library
              <button
                style={{ ...styles.btnPrimary, background: "#10B981" }}
                onClick={() => {
                  setEditingTemplate(null);
                  setShowAddTemplateForm(true);
                }}
              >
                <FaPlus style={{ marginRight: "0.5rem" }} /> Add Template
              </button>
            </h3>

            {presLoading && (
              <p style={{ textAlign: "center", padding: "2rem" }}>
                Loading templates...
              </p>
            )}

            {presError && (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <p style={styles.error}>Error: {presError}</p>
                <button
                  style={{ ...styles.btnPrimary, background: "#10B981" }}
                  onClick={() => dispatch(clearError())}
                >
                  Clear Error
                </button>
              </div>
            )}

            {showAddTemplateForm && (
              <AddTemplateForm
                onSave={handleSaveTemplate}
                onClose={() => {
                  setShowAddTemplateForm(false);
                  setEditingTemplate(null);
                }}
                initialTemplate={editingTemplate}
                drugs={initialDrugs}
              />
            )}

            {!presLoading && !presError && templates.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#6b7280",
                }}
              >
                No templates available.
              </p>
            )}

            {!presLoading && !presError && templates.length > 0 && (
              <div style={{ overflowX: "auto", borderRadius: "14px" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>S.No</th>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>System</th>
                      <th style={styles.th}>Disease</th>
                      <th style={styles.th}>Updated</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </table>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1rem",
                    fontSize: "0.9rem",
                    color: "#334155",
                  }}
                >
                  <button
                    style={{
                      ...styles.btnPrimary,
                      background: templatesPage === 1 ? "#9CA3AF" : "#186476",
                      cursor: templatesPage === 1 ? "not-allowed" : "pointer",
                    }}
                    disabled={templatesPage === 1}
                    onClick={() => setTemplatesPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>

                  <span>
                    Page <strong>{templatesPage}</strong> of{" "}
                    <strong>{totalTemplatePages}</strong>
                  </span>

                  <button
                    style={{
                      ...styles.btnPrimary,
                      background:
                        templatesPage === totalTemplatePages
                          ? "#9CA3AF"
                          : "#186476",
                      cursor:
                        templatesPage === totalTemplatePages
                          ? "not-allowed"
                          : "pointer",
                    }}
                    disabled={templatesPage === totalTemplatePages}
                    onClick={() =>
                      setTemplatesPage((p) =>
                        Math.min(totalTemplatePages, p + 1)
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW MODAL */}
        {showPreview && selectedTemplate && (
          <PrescriptionPreview
            template={selectedTemplate}
            onClose={closeView}
            chapterContent={previewChapter}
          />
        )}
      </div>
    </>
  );
}

export default TemplateManagement;

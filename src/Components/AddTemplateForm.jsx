// src/components/AddTemplateForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createTemplate,
  updateTemplate,
  clearError,
} from "../redux/slices/prescriptionSlice";

// ✅ SYSTEM OPTIONS
const SYSTEM_OPTIONS = [
  "General Medicine",
  "Cardiology",
  "Respiratory / Pulmonology",
  "Neurology",
  "Gastroenterology (GI)",
  "Endocrinology",
  "Pediatrics",
  "Obstetrics & Gynecology (OBGY)",
  "Orthopedics",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Psychiatry",
  "Nephrology",
  "Urology",
  "Other",
];

// PREVIEW COMPONENT
const PrescriptionPreview = ({ template, onClose }) => {
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "1.5rem",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "95vh",
          overflowY: "auto",
          padding: "2rem",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
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
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        {/* <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#186476" }}>City Health Clinic</h1>
          <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>123, Main Street, City, India 400001 | +91 98765 43210</p>
          <p style={{ color: "#4b5563", fontSize: "0.9rem" }}>GSTIN: 27AAAAA0000A1Z5 | License: MHT/MED/123456</p>
          <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />
        </div> */}

        {/* Patient Info */}
        {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", fontSize: "0.95rem" }}>
          <div>
            <strong>Patient:</strong> Amit Sharma<br />
            <strong>Age/Gender:</strong> 34 / Male<br />
            <strong>UHID:</strong> AP123456<br />
            <strong>Contact:</strong> +91 9876543210
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>Address:</strong> Kothrud, Pune<br />
            <strong>Blood Group:</strong> -<br />
            <strong>Allergies:</strong> -<br />
            <strong>Date:</strong> {new Date().toLocaleString()}
          </div>
        </div> */}
        <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />

        {/* Clinical History */}
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
                <strong>Past Medical:</strong> {pastMedicalHistory}
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

        {/* Vitals */}
        <h3
          style={{
            fontWeight: "600",
            color: "#186476",
            margin: "1rem 0 0.5rem",
          }}
        >
          Examination / Vitals
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr style={{ background: "#e6f3f7" }}>
              {["BP", "Pulse", "Temp", "Resp", "SpO2"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    fontWeight: "600",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {["-", "-", "-", "-", "-"].map((v, i) => (
                <td
                  key={i}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                >
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />

        {/* Diagnosis */}
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

        {/* Rx */}
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr style={{ background: "#e6f3f7" }}>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    #
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Medicine
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Dose
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Frequency
                  </th>
                  <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    Duration
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
                    <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                      {med.brandName}
                    </td>
                    <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                      {med.dose}
                    </td>
                    <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                      {med.timings}
                    </td>
                    <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                      {med.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr style={{ margin: "1rem 0", borderColor: "#d1d5db" }} />
          </>
        )}

        {/* Treatment Plan */}
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
                <strong>Lifestyle:</strong> {lifestyleText}
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

        {/* Investigations */}
        {investigations && (
          <>
            <h3
              style={{
                fontWeight: "600",
                color: "#186476",
                margin: "1rem 0 0.5rem",
              }}
            >
              Follow-up / Investigations
            </h3>
            <p>{investigations}</p>
          </>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "2rem",
            textAlign: "right",
            fontSize: "0.9rem",
            color: "#4b5563",
          }}
        >
          <em>Computer-generated prescription. Consult doctor if needed.</em>
          <br />
          <strong>Dr. Rajesh Gupta</strong>
        </div>
      </div>
    </div>
  );
};

// SUCCESS POPUP
const SuccessPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#ecfdf5",
          border: "2px solid #10b981",
          borderRadius: "1rem",
          padding: "1.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(16,185,129,0.15)",
          animation: "bounce 0.5s ease-out",
        }}
      >
        <svg
          className="w-12 h-12 text-green-600 mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h3
          style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#065f46" }}
        >
          Success!
        </h3>
        <p style={{ color: "#065f46", marginTop: "0.5rem" }}>
          Template saved successfully.
        </p>
      </div>
    </div>
  );
};

function AddTemplateForm({ onClose, initialTemplate = null, drugs = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    system: "",
    disease: "",
    tags: [],
    templates: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [pdfInput, setPdfInput] = useState("");
  const [medicineForm, setMedicineForm] = useState({
    serial: "",
    brandName: "",
    genericName: "",
    route: "Oral",
    dose: "",
    timings: "",
    duration: "",
    notes: "",
  });

  const [editingMedicineIndex, setEditingMedicineIndex] = useState(null);
  const [activeLangIndex, setActiveLangIndex] = useState(0);
  const [formError, setFormError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [customSystem, setCustomSystem] = useState("");

  // Initialize form
  useEffect(() => {
    if (initialTemplate) {
      setFormData({
        system: initialTemplate.system || "",
        disease: initialTemplate.disease || "",
        tags: Array.isArray(initialTemplate.tags) ? initialTemplate.tags : [],
        templates: Array.isArray(initialTemplate.templates)
          ? initialTemplate.templates.map((t) => ({
              language: t.language || "en",
              clinicalHistory: {
                chiefComplaint: t.clinicalHistory?.chiefComplaint || "",
                investigations: t.clinicalHistory?.investigations || "",
                diagnosis: {
                  provisional: t.clinicalHistory?.diagnosis?.provisional || "",
                  final: t.clinicalHistory?.diagnosis?.final || "",
                },
              },
              treatmentPlan: {
                prescription: Array.isArray(t.treatmentPlan?.prescription)
                  ? t.treatmentPlan.prescription.map((m, i) => ({
                      ...m,
                      serial: i + 1,
                    }))
                  : [],
                lifestyleAdvice: {
                  text: t.treatmentPlan?.lifestyleAdvice?.text || "",
                  images: Array.isArray(
                    t.treatmentPlan?.lifestyleAdvice?.images
                  )
                    ? t.treatmentPlan.lifestyleAdvice.images
                    : [],
                  pdfs: Array.isArray(t.treatmentPlan?.lifestyleAdvice?.pdfs)
                    ? t.treatmentPlan.lifestyleAdvice.pdfs
                    : [],
                },
                procedures: t.treatmentPlan?.procedures || "",
                referrals: t.treatmentPlan?.referrals || "",
              },
            }))
          : [],
      });
    } else {
      setFormData({
        system: "",
        disease: "",
        tags: [],
        templates: [
          {
            language: "en",
            clinicalHistory: {
              chiefComplaint: "",
              investigations: "",
              diagnosis: { provisional: "", final: "" },
            },
            treatmentPlan: {
              prescription: [],
              lifestyleAdvice: { text: "", images: [], pdfs: [] },
              procedures: "",
              referrals: "",
            },
          },
        ],
      });
    }
  }, [initialTemplate]);

  // Handlers
  const handleChange = (e, langIndex) => {
    const { name, value } = e.target;
    const [section, field, subfield] = name.split(".");

    setFormData((prev) => {
      const newTemplates = [...prev.templates];
      const template = { ...newTemplates[langIndex] };

      if (section === "clinicalHistory" && field === "diagnosis") {
        template.clinicalHistory.diagnosis[subfield] = value;
      } else if (section === "clinicalHistory") {
        template.clinicalHistory[field] = value;
      } else if (section === "treatmentPlan" && field === "lifestyleAdvice") {
        template.treatmentPlan.lifestyleAdvice[subfield] = value;
      } else if (section === "treatmentPlan") {
        template.treatmentPlan[field] = value;
      } else {
        return { ...prev, [name]: value };
      }

      newTemplates[langIndex] = template;
      return { ...prev, templates: newTemplates };
    });
    setFormError(null);
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      templates: [
        ...prev.templates,
        {
          language: "hi",
          clinicalHistory: {
            chiefComplaint: "",
            investigations: "",
            diagnosis: { provisional: "", final: "" },
          },
          treatmentPlan: {
            prescription: [],
            lifestyleAdvice: { text: "", images: [], pdfs: [] },
            procedures: "",
            referrals: "",
          },
        },
      ],
    }));
    setActiveLangIndex(prev.templates.length);
  };

  const removeLanguage = (index) => {
    if (formData.templates.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      templates: prev.templates.filter((_, i) => i !== index),
    }));
    if (activeLangIndex >= formData.templates.length - 1) {
      setActiveLangIndex(Math.max(0, formData.templates.length - 2));
    }
  };

  // const handleAddTag = () => {
  //   if (tagInput.trim()) {
  //     setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
  //     setTagInput("");
  //   }
  // };

  // replace your existing handleAddTag with this
  const handleAddTag = () => {
    const raw = tagInput || "";
    const trimmed = raw.trim();
    if (!trimmed) {
      setFormError("Tag cannot be empty.");
      setTimeout(() => setFormError(null), 2000);
      return;
    }

    const normalize = (s) => s.trim().toLowerCase();
    const newTagNorm = normalize(trimmed);

    // check duplicates case-insensitively
    const alreadyExists = formData.tags.some(
      (t) => normalize(t) === newTagNorm
    );

    if (alreadyExists) {
      setFormError(`Tag "${trimmed}" already added.`);
      setTimeout(() => setFormError(null), 2000);
      return;
    }

    setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    setTagInput("");
  };

  const handleRemoveTag = (idx) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== idx),
    }));
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData((prev) => {
        const newTemplates = [...prev.templates];
        newTemplates[activeLangIndex].treatmentPlan.lifestyleAdvice.images.push(
          imageInput.trim()
        );
        return { ...prev, templates: newTemplates };
      });
      setImageInput("");
    }
  };

  const handleRemoveImage = (imgIdx) => {
    setFormData((prev) => {
      const newTemplates = [...prev.templates];
      newTemplates[activeLangIndex].treatmentPlan.lifestyleAdvice.images.splice(
        imgIdx,
        1
      );
      return { ...prev, templates: newTemplates };
    });
  };

  const handleAddPdf = () => {
    if (pdfInput.trim()) {
      setFormData((prev) => {
        const newTemplates = [...prev.templates];
        newTemplates[activeLangIndex].treatmentPlan.lifestyleAdvice.pdfs.push(
          pdfInput.trim()
        );
        return { ...prev, templates: newTemplates };
      });
      setPdfInput("");
    }
  };

  const handleRemovePdf = (pdfIdx) => {
    setFormData((prev) => {
      const newTemplates = [...prev.templates];
      newTemplates[activeLangIndex].treatmentPlan.lifestyleAdvice.pdfs.splice(
        pdfIdx,
        1
      );
      return { ...prev, templates: newTemplates };
    });
  };

  const handleMedicineChange = (e) => {
    const { name, value } = e.target;
    setMedicineForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateMedicine = () => {
    const { genericName, brandName } = medicineForm;
    if (!genericName.trim() || !brandName.trim()) {
      setFormError("Generic Name and Brand Name are required.");
      return;
    }

    setFormData((prev) => {
      const newTemplates = [...prev.templates];
      const lang = newTemplates[activeLangIndex];
      let prescription = [...lang.treatmentPlan.prescription];

      if (editingMedicineIndex !== null) {
        prescription[editingMedicineIndex] = {
          ...medicineForm,
          serial: editingMedicineIndex + 1,
        };
      } else {
        prescription.push({ ...medicineForm, serial: prescription.length + 1 });
      }

      lang.treatmentPlan.prescription = prescription;
      return { ...prev, templates: newTemplates };
    });

    setMedicineForm({
      serial: "",
      brandName: "",
      genericName: "",
      route: "Oral",
      dose: "",
      timings: "",
      duration: "",
      notes: "",
    });
    setEditingMedicineIndex(null);
  };

  const handleEditMedicine = (idx) => {
    const med =
      formData.templates[activeLangIndex].treatmentPlan.prescription[idx];
    setMedicineForm(med);
    setEditingMedicineIndex(idx);
  };

  const handleDeleteMedicine = (idx) => {
    setFormData((prev) => {
      const newTemplates = [...prev.templates];
      const prescription = newTemplates[
        activeLangIndex
      ].treatmentPlan.prescription
        .filter((_, i) => i !== idx)
        .map((m, i) => ({ ...m, serial: i + 1 }));
      newTemplates[activeLangIndex].treatmentPlan.prescription = prescription;
      return { ...prev, templates: newTemplates };
    });
  };

  const handlePreview = () => {
    setShowPreview({ templateData: formData.templates[activeLangIndex] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const finalSystem =
      formData.system === "" ? customSystem.trim() : formData.system.trim();

    const payload = {
      system: finalSystem,
      disease: formData.disease.trim(),
      tags: formData.tags.map((t) => t.trim()).filter(Boolean),
      templates: formData.templates.map((t) => ({
        language: t.language.trim(),
        clinicalHistory: {
          chiefComplaint: t.clinicalHistory.chiefComplaint.trim(),
          investigations: t.clinicalHistory.investigations.trim(),
          diagnosis: {
            provisional: t.clinicalHistory.diagnosis.provisional.trim(),
            final: t.clinicalHistory.diagnosis.final.trim(),
          },
        },
        treatmentPlan: {
          prescription: t.treatmentPlan.prescription.map((m) => ({
            serial: m.serial,
            brandName: m.brandName.trim(),
            genericName: m.genericName.trim(),
            route: m.route.trim(),
            dose: m.dose.trim(),
            timings: m.timings.trim(),
            duration: m.duration.trim(),
            notes: m.notes.trim(),
          })),
          lifestyleAdvice: {
            text: t.treatmentPlan.lifestyleAdvice.text.trim(),
            images: t.treatmentPlan.lifestyleAdvice.images.filter(Boolean),
            pdfs: t.treatmentPlan.lifestyleAdvice.pdfs.filter(Boolean),
          },
          procedures: t.treatmentPlan.procedures.trim(),
          referrals: t.treatmentPlan.referrals.trim(),
        },
      })),
    };

    if (!payload.system || !payload.disease) {
      setFormError("System and Disease are required.");
      return;
    }

    try {
      const action = initialTemplate
        ? updateTemplate({ id: initialTemplate._id, templateData: payload })
        : createTemplate(payload);

      await dispatch(action).unwrap();
      dispatch(clearError());
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose(); // only close modal
      }, 2000);
    } catch (err) {
      setFormError(err.message || "Failed to save template.");
    }
  };

  const current = formData.templates[activeLangIndex] || {};

  return (
    <>
      {/* MAIN CONTAINER - NO HORIZONTAL SCROLL */}
      <div
        style={{
          background: "#f8fafc",
          padding: "1.5rem",
          borderRadius: "12px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          maxHeight: "85vh",
          overflow: "hidden",
          margin: "1rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>
          {`
            * { box-sizing: border-box; }
            input, textarea, select, button { box-sizing: border-box; }
            .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .lang-tab { min-width: 50px; }
            @media (max-width: 768px) {
              .form-grid { grid-template-columns: 1fr !important; }
              .btn { font-size: 0.875rem; padding: 0.5rem 0.75rem; }
              .lang-tab { font-size: 0.8rem; padding: 0.4rem 0.6rem; }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}
        </style>

        {/* SCROLLABLE CONTENT */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "0.5rem",
            marginRight: "-0.5rem",
          }}
        >
          <h3
            style={{
              color: "#1e40af",
              marginBottom: "1rem",
              fontSize: "1.5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {initialTemplate ? "Edit Template" : "Add New Template"}
          </h3>
          {formError && (
            <p
              style={{
                color: "#dc2626",
                marginBottom: "1rem",
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {formError}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {/* System & Disease */}
            <div className="form-grid" style={{ marginBottom: "1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    margin: "0.5rem 0 0.25rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  System
                </label>
                <select
                  value={
                    SYSTEM_OPTIONS.includes(formData.system)
                      ? formData.system
                      : "Other"
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "Other") {
                      setFormData({ ...formData, system: "" });
                    } else {
                      setFormData({ ...formData, system: value });
                      setCustomSystem("");
                    }
                  }}
                  style={{
                    width: "100%",
                    maxWidth: "320px", // ✅ FIX WIDTH
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">Select System</option>
                  {SYSTEM_OPTIONS.map((sys) => (
                    <option key={sys} value={sys}>
                      {sys}
                    </option>
                  ))}
                </select>

                {/* Show input only when "Other" is selected */}
                {(formData.system === "" ||
                  !SYSTEM_OPTIONS.includes(formData.system)) && (
                  <input
                    type="text"
                    placeholder="Enter system name"
                    value={customSystem}
                    onChange={(e) => {
                      setCustomSystem(e.target.value);
                      setFormData({ ...formData, system: e.target.value });
                    }}
                    style={{
                      marginTop: "0.5rem",
                      width: "100%",
                      maxWidth: "320px", // ✅ SAME WIDTH
                      padding: "0.6rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "1rem",
                    }}
                  />
                )}
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    margin: "0.5rem 0 0.25rem",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Disease
                </label>
                <input
                  type="text"
                  value={formData.disease}
                  onChange={(e) =>
                    setFormData({ ...formData, disease: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <label
              style={{
                display: "block",
                margin: "0.5rem 0 0.25rem",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Tags
            </label>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "120px",
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                }}
                placeholder="e.g. diabetes"
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: "0.6rem 1rem",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
                className="btn"
              >
                Add
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {formData.tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    background: "#dbeafe",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {tag}{" "}
                  <span
                    style={{
                      cursor: "pointer",
                      color: "#ef4444",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleRemoveTag(i)}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>

            {/* Language Tabs */}
            <div
              style={{
                margin: "1rem 0",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              {formData.templates.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveLangIndex(i)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: i === activeLangIndex ? "#3b82f6" : "#e5e7eb",
                    color: i === activeLangIndex ? "white" : "#374151",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    minWidth: "50px",
                  }}
                  className="lang-tab"
                >
                  {t.language.toUpperCase()}
                </button>
              ))}
              <button
                type="button"
                onClick={addLanguage}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
                className="btn"
              >
                + Language
              </button>
              {formData.templates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLanguage(activeLangIndex)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                  className="btn"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Language Fields */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                padding: "1.5rem",
                borderRadius: "12px",
                background: "#fff",
                marginBottom: "1rem",
              }}
            >
              <h4
                style={{
                  margin: "0 0 1rem",
                  color: "#1e40af",
                  fontWeight: "600",
                }}
              >
                Language: {current.language?.toUpperCase()}
              </h4>

              {/* Chief Complaint */}
              <label
                style={{
                  display: "block",
                  margin: "0.5rem 0 0.25rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Chief Complaint
              </label>
              <textarea
                name="clinicalHistory.chiefComplaint"
                value={current.clinicalHistory?.chiefComplaint || ""}
                onChange={(e) => handleChange(e, activeLangIndex)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  minHeight: "80px",
                  marginBottom: "1rem",
                  fontSize: "1rem",
                }}
                required
              />

              {/* Investigations */}
              <label
                style={{
                  display: "block",
                  margin: "0.5rem 0 0.25rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Investigations
              </label>
              <textarea
                name="clinicalHistory.investigations"
                value={current.clinicalHistory?.investigations || ""}
                onChange={(e) => handleChange(e, activeLangIndex)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  minHeight: "80px",
                  marginBottom: "1rem",
                  fontSize: "1rem",
                }}
                required
              />

              {/* Diagnosis */}
              <div className="form-grid" style={{ marginBottom: "1rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      margin: "0.5rem 0 0.25rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Provisional Diagnosis
                  </label>
                  <input
                    type="text"
                    name="clinicalHistory.diagnosis.provisional"
                    value={
                      current.clinicalHistory?.diagnosis?.provisional || ""
                    }
                    onChange={(e) => handleChange(e, activeLangIndex)}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "1rem",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      margin: "0.5rem 0 0.25rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Final Diagnosis
                  </label>
                  <input
                    type="text"
                    name="clinicalHistory.diagnosis.final"
                    value={current.clinicalHistory?.diagnosis?.final || ""}
                    onChange={(e) => handleChange(e, activeLangIndex)}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "1rem",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Prescription Form */}
              <h5
                style={{
                  margin: "1.5rem 0 0.5rem",
                  color: "#1e40af",
                  fontWeight: "600",
                }}
              >
                Prescription
              </h5>
              <div
                className="form-grid"
                style={{ gap: "0.5rem", marginBottom: "1rem" }}
              >
                <input
                  placeholder="Generic Name"
                  name="genericName"
                  value={medicineForm.genericName}
                  onChange={handleMedicineChange}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                />
                <input
                  placeholder="Brand Name"
                  name="brandName"
                  value={medicineForm.brandName}
                  onChange={handleMedicineChange}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                />
                <select
                  name="route"
                  value={medicineForm.route}
                  onChange={handleMedicineChange}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                >
                  <option>Oral</option>
                  <option>IV</option>
                  <option>IM</option>
                  <option>Topical</option>
                </select>
                <input
                  placeholder="Dose"
                  name="dose"
                  value={medicineForm.dose}
                  onChange={handleMedicineChange}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                />
                <input
                  placeholder="Timings"
                  name="timings"
                  value={medicineForm.timings}
                  onChange={handleMedicineChange}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                />
                <input
                  placeholder="Duration"
                  name="duration"
                  value={medicineForm.duration}
                  onChange={handleMedicineChange}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                />
                <textarea
                  placeholder="Notes"
                  name="notes"
                  value={medicineForm.notes}
                  onChange={handleMedicineChange}
                  style={{
                    gridColumn: "1 / -1",
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    minHeight: "60px",
                  }}
                />
                <div></div>
                <button
                  type="button"
                  onClick={handleAddOrUpdateMedicine}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                  className="btn"
                >
                  {editingMedicineIndex !== null ? "Update" : "Add"} Medicine
                </button>
              </div>

              {/* Prescription Table - Internal Scroll */}
              {current.treatmentPlan?.prescription?.length > 0 && (
                <div
                  style={{
                    overflowX: "auto",
                    margin: "1rem 0",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      minWidth: "800px",
                      borderCollapse: "collapse",
                      fontSize: "0.875rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#1e40af", color: "white" }}>
                        <th style={{ padding: "0.5rem", minWidth: "50px" }}>
                          S.No
                        </th>
                        <th style={{ padding: "0.5rem" }}>Generic</th>
                        <th style={{ padding: "0.5rem" }}>Brand</th>
                        <th style={{ padding: "0.5rem" }}>Route</th>
                        <th style={{ padding: "0.5rem" }}>Dose</th>
                        <th style={{ padding: "0.5rem" }}>Timings</th>
                        <th style={{ padding: "0.5rem" }}>Duration</th>
                        <th style={{ padding: "0.5rem" }}>Notes</th>
                        <th style={{ padding: "0.5rem", minWidth: "100px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {current.treatmentPlan.prescription.map((m, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: "1px solid #e5e7eb" }}
                        >
                          <td
                            style={{ padding: "0.5rem", textAlign: "center" }}
                          >
                            {m.serial}
                          </td>
                          <td style={{ padding: "0.5rem" }}>{m.genericName}</td>
                          <td style={{ padding: "0.5rem" }}>{m.brandName}</td>
                          <td style={{ padding: "0.5rem" }}>{m.route}</td>
                          <td style={{ padding: "0.5rem" }}>{m.dose}</td>
                          <td style={{ padding: "0.5rem" }}>{m.timings}</td>
                          <td style={{ padding: "0.5rem" }}>{m.duration}</td>
                          <td style={{ padding: "0.5rem" }}>{m.notes}</td>
                          <td style={{ padding: "0.25rem" }}>
                            <button
                              type="button"
                              onClick={() => handleEditMedicine(i)}
                              style={{
                                padding: "0.25rem 0.5rem",
                                background: "#0ea5e9",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                marginRight: "0.25rem",
                              }}
                              className="btn"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedicine(i)}
                              style={{
                                padding: "0.25rem 0.5rem",
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                              }}
                              className="btn"
                            >
                              Del
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Lifestyle Advice */}
              <h5
                style={{
                  margin: "1.5rem 0 0.5rem",
                  color: "#1e40af",
                  fontWeight: "600",
                }}
              >
                Lifestyle Advice
              </h5>
              <textarea
                name="treatmentPlan.lifestyleAdvice.text"
                value={current.treatmentPlan?.lifestyleAdvice?.text || ""}
                onChange={(e) => handleChange(e, activeLangIndex)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  minHeight: "80px",
                  marginBottom: "1rem",
                }}
              />

              {/* Images */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <input
                  placeholder="Image URL"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                  className="btn"
                >
                  Add
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {current.treatmentPlan?.lifestyleAdvice?.images?.map(
                  (img, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#dbeafe",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        style={{ width: "16px", height: "16px" }}
                      />
                      <span
                        style={{ cursor: "pointer", color: "#ef4444" }}
                        onClick={() => handleRemoveImage(i)}
                      >
                        ×
                      </span>
                    </span>
                  )
                )}
              </div>

              {/* PDFs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <input
                  placeholder="PDF URL"
                  value={pdfInput}
                  onChange={(e) => setPdfInput(e.target.value)}
                  style={{
                    padding: "0.6rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddPdf}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                  className="btn"
                >
                  Add
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {current.treatmentPlan?.lifestyleAdvice?.pdfs?.map((pdf, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#fee2e2",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.875rem",
                      color: "#dc2626",
                    }}
                  >
                    PDF{" "}
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRemovePdf(i)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>

              {/* Procedures & Referrals */}
              <label
                style={{
                  display: "block",
                  margin: "1rem 0 0.25rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Procedures
              </label>
              <textarea
                name="treatmentPlan.procedures"
                value={current.treatmentPlan?.procedures || ""}
                onChange={(e) => handleChange(e, activeLangIndex)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  minHeight: "80px",
                  marginBottom: "1rem",
                }}
              />

              <label
                style={{
                  display: "block",
                  margin: "0.5rem 0 0.25rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Referrals
              </label>
              <textarea
                name="treatmentPlan.referrals"
                value={current.treatmentPlan?.referrals || ""}
                onChange={(e) => handleChange(e, activeLangIndex)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  minHeight: "80px",
                  marginBottom: "1rem",
                }}
              />
            </div>
          </form>
        </div>

        {/* FIXED BUTTONS */}
        <div
          style={{
            paddingTop: "1rem",
            borderTop: "1px solid #e5e7eb",
            background: "#f8fafc",
            margin: "0 -1.5rem -1.5rem",
            padding: "1rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handlePreview}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
              }}
              className="btn"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
              }}
              className="btn"
            >
              {initialTemplate ? "Update" : "Create"} Template
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
              }}
              className="btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <PrescriptionPreview
          template={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
      {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
    </>
  );
}

export default AddTemplateForm;

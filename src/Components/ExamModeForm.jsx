import React, { useState } from "react";
import {
  FaUser,
  FaNotesMedical,
  FaHeartbeat,
  FaFlask,
  FaDiagnoses,
  FaPills,
  FaAppleAlt,
  FaCalendarCheck,
} from "react-icons/fa";
import { useToast } from "../Components/ToastProvider";

const ExamModeForm = ({ onSubmit, onClose, prescriptionTemplates, drugs }) => {
  const { error } = useToast();
  const [activeTab, setActiveTab] = useState("demographics");
  const [completedTabs, setCompletedTabs] = useState([]);
  const routeOptions = [
    "Oral",
    "IV",
    "IM",
    "Topical",
    "Inhalation",
    "Sublingual",
  ];
  const [formData, setFormData] = useState({
    demographics: { uhid: "", name: "", age: "", gender: "" },
    chiefComplaint: "",
    vitals: {
      height: "",
      weight: "",
      bmi: "",
      bp: "",
      pulse: "",
      temp: "",
      resp: "",
      spo2: "",
      findings: "",
    },
    investigations: { labs: "", imaging: "", referrals: "" },
    diagnosis: { provisional: "", final: "" },
    prescription: { template: "", manualEntries: [] },
    lifestyleAdvice: "",
    followUp: {
      nextAppointment: "",
      notes: "",
      investigations: "",
      procedures: "",
      referrals: "",
    },
    signature: "",
    disclaimer: "",
  });
  const [score, setScore] = useState(null);

  const modelAnswer = {
    demographics: {
      uhid: "TATH2025-0001",
      name: "Mr. Rajesh Sharma",
      age: "52",
      gender: "Male",
    },
    chiefComplaint: "Increased thirst, frequent urination, fatigue (2 months)",
    vitals: {
      height: "170",
      weight: "82",
      bmi: "28.4",
      bp: "148/92",
      pulse: "88",
      temp: "98.6",
      resp: "18",
      spo2: "97",
      findings: "Overweight, mild pedal edema",
    },
    investigations: {
      labs: "HbA1c, FBS, PPBS, Lipid profile, Creatinine, LFT",
      imaging: "ECG",
      referrals: "Ophthalmology",
    },
    diagnosis: {
      provisional: "Suspected Type 2 DM with Hypertension",
      final: "Type 2 DM with Hypertension",
    },
    prescription: {
      manualEntries: [
        {
          serial: 1,
          generic: "Metformin",
          brand: "Glycomet 500",
          route: "Oral",
          dose: "500mg",
          duration: "Ongoing",
          timings: "BD (after meals)",
          notes: "",
        },
        {
          serial: 2,
          generic: "Amlodipine",
          brand: "Amlodac 5",
          route: "Oral",
          dose: "5mg",
          duration: "Ongoing",
          timings: "OD (morning)",
          notes: "",
        },
        {
          serial: 3,
          generic: "Aspirin",
          brand: "Ecosprin 75",
          route: "Oral",
          dose: "75mg",
          duration: "Ongoing",
          timings: "HS",
          notes: "If ASCVD risk",
        },
      ],
    },
    lifestyleAdvice:
      "Balanced diet, exercise 30 min/day, monitor sugars weekly",
    followUp: {
      nextAppointment: "2025-09-30",
      notes: "Review labs",
      investigations: "",
      procedures: "Foot exam, retinal screening",
      referrals: "Ophthalmology, Physiotherapy",
    },
    signature: "Dr. Krunal G. Patel",
    disclaimer:
      "This is a computer-generated prescription. If symptoms persist, consult doctor again.",
  };

  const contraindicatedDrugs = ["Propranolol", "Nifedipine"]; // Example contraindicated drugs for Type 2 DM/Hypertension
  const maxMetforminDose = 2000; // Max daily dose in mg for safety check

  const addPrescriptionEntry = () => {
    setFormData({
      ...formData,
      prescription: {
        ...formData.prescription,
        manualEntries: [
          ...formData.prescription.manualEntries,
          {
            serial: formData.prescription.manualEntries.length + 1,
            generic: "",
            brand: "",
            route: "",
            dose: "",
            duration: "",
            timings: "",
            notes: "",
          },
        ],
      },
    });
  };

  const updatePrescriptionEntry = (index, field, value) => {
    const updatedEntries = [...formData.prescription.manualEntries];
    updatedEntries[index][field] = value;
    setFormData({
      ...formData,
      prescription: { ...formData.prescription, manualEntries: updatedEntries },
    });
  };

  const removePrescriptionEntry = (index) => {
    const updatedEntries = formData.prescription.manualEntries
      .filter((_, i) => i !== index)
      .map((entry, i) => ({ ...entry, serial: i + 1 }));
    setFormData({
      ...formData,
      prescription: { ...formData.prescription, manualEntries: updatedEntries },
    });
  };

  const validateTab = (tab) => {
    switch (tab) {
      case "demographics":
        return (
          formData.demographics.uhid &&
          formData.demographics.name &&
          formData.demographics.age &&
          formData.demographics.gender
        );
      case "chiefComplaint":
        return formData.chiefComplaint;
      case "vitals":
        return (
          formData.vitals.bp &&
          formData.vitals.pulse &&
          formData.vitals.temp &&
          formData.vitals.resp &&
          formData.vitals.spo2
        );
      case "investigations":
        return formData.investigations.labs;
      case "diagnosis":
        return formData.diagnosis.provisional && formData.diagnosis.final;
      case "prescription":
        return (
          formData.prescription.manualEntries.length > 0 &&
          formData.prescription.manualEntries.every(
            (entry) =>
              entry.generic &&
              entry.brand &&
              entry.route &&
              entry.dose &&
              entry.duration &&
              entry.timings
          )
        );
      case "lifestyleAdvice":
        return formData.lifestyleAdvice;
      case "followUp":
        return formData.followUp.nextAppointment;
      default:
        return false;
    }
  };

  const handleNextTab = (nextTab) => {
    if (validateTab(activeTab)) {
      setCompletedTabs([...new Set([...completedTabs, activeTab])]);
      setActiveTab(nextTab);
    } else {
      error("Please fill all required fields in the current tab!");
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let penalties = 0;

    // 1. Patient Demographics & Chief Complaint (10 pts)
    if (
      JSON.stringify(formData.demographics) ===
      JSON.stringify(modelAnswer.demographics)
    )
      totalScore += 2;
    if (
      formData.chiefComplaint
        .toLowerCase()
        .includes(modelAnswer.chiefComplaint.toLowerCase())
    )
      totalScore += 8;

    // 2. Examination / Vitals (15 pts)
    if (
      Object.values(formData.vitals)
        .slice(3, 8)
        .every((val) => val)
    )
      totalScore += 5; // BP, Pulse, Temp, Resp, SpO2
    if (formData.vitals.height && formData.vitals.weight && formData.vitals.bmi)
      totalScore += 5;
    if (
      formData.vitals.findings.toLowerCase().includes("overweight") &&
      formData.vitals.findings.toLowerCase().includes("edema")
    )
      totalScore += 5;

    // 3. Investigations (15 pts)
    const requiredLabs = ["hba1c", "fbs", "ppbs", "lipid", "creatinine", "lft"];
    if (
      requiredLabs.every((lab) =>
        formData.investigations.labs.toLowerCase().includes(lab)
      )
    )
      totalScore += 10;
    if (
      formData.investigations.imaging.toLowerCase().includes("ecg") &&
      formData.investigations.referrals.toLowerCase().includes("ophthalmology")
    )
      totalScore += 5;

    // 4. Diagnosis (15 pts)
    if (
      formData.diagnosis.provisional.toLowerCase().includes("type 2 dm") &&
      formData.diagnosis.provisional.toLowerCase().includes("hypertension")
    )
      totalScore += 7;
    if (
      formData.diagnosis.final.toLowerCase().includes("type 2 dm") &&
      formData.diagnosis.final.toLowerCase().includes("hypertension")
    )
      totalScore += 8;

    // 5. Prescription (30 pts)
    let prescriptionScore = 0;
    const hasContraindicated = formData.prescription.manualEntries.some(
      (entry) => contraindicatedDrugs.includes(entry.generic)
    );
    const hasDangerousDose = formData.prescription.manualEntries.some(
      (entry) => {
        if (entry.generic === "Metformin") {
          const doseMatch = entry.dose.match(/(\d+)mg/);
          return doseMatch && parseInt(doseMatch[1]) > maxMetforminDose;
        }
        return false;
      }
    );

    if (hasContraindicated) penalties -= 15;
    if (hasDangerousDose) {
      prescriptionScore = 0;
      penalties -= 15;
    } else {
      const correctDrugs = formData.prescription.manualEntries.filter((entry) =>
        modelAnswer.prescription.manualEntries.some(
          (model) => model.generic === entry.generic
        )
      );
      if (correctDrugs.length === modelAnswer.prescription.manualEntries.length)
        prescriptionScore += 10;
      if (
        formData.prescription.manualEntries.every(
          (entry) =>
            entry.dose && entry.route && entry.timings && entry.duration
        )
      )
        prescriptionScore += 10;
      if (formData.prescription.manualEntries.some((entry) => entry.notes))
        prescriptionScore += 5;
      if (formData.prescription.manualEntries.length > 0)
        prescriptionScore += 5; // Table completeness
    }
    totalScore += prescriptionScore;

    // 6. Lifestyle Advice / Counselling (5 pts)
    if (
      formData.lifestyleAdvice.toLowerCase().includes("diet") &&
      formData.lifestyleAdvice.toLowerCase().includes("exercise") &&
      formData.lifestyleAdvice.toLowerCase().includes("monitor")
    )
      totalScore += 5;

    // 7. Follow-up & Plan (10 pts)
    if (
      formData.followUp.nextAppointment === modelAnswer.followUp.nextAppointment
    )
      totalScore += 5;
    if (
      formData.followUp.procedures.toLowerCase().includes("foot exam") &&
      formData.followUp.referrals.toLowerCase().includes("ophthalmology")
    )
      totalScore += 5;

    // 8. Professionalism / System Use (Bonus up to 5 pts)
    if (formData.signature && formData.disclaimer) totalScore += 5;

    return Math.max(0, totalScore + penalties);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!completedTabs.includes("followUp") || !validateTab("followUp")) {
      error("Please complete all tabs before submitting!");
      return;
    }
    const finalScore = calculateScore();
    setScore(finalScore);
    onSubmit({ ...formData, score: finalScore });
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "#f0f2f5",
      padding: "1.5rem",
      boxSizing: "border-box",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      padding: "1.5rem",
      borderRadius: "1rem",
      background: "#f9faff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      width: "100%",
      maxWidth: "90vw",
      margin: "0 auto",
      flex: 1,
      overflowX: "auto",
    },
    vignette: {
      background: "#fff",
      padding: "1rem",
      borderRadius: "0.5rem",
      marginBottom: "1rem",
      border: "1px solid #ccc",
    },
    tabContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    tabButton: {
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer",
      background: "#6c757d",
      color: "white",
      fontWeight: "600",
      transition: "all 0.2s",
    },
    activeTabButton: {
      background: "linear-gradient(135deg, #186476ff, #3fa3b9ff)",
    },
    disabledTabButton: {
      background: "#d3d3d3",
      cursor: "not-allowed",
    },
    input: {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #ccc",
      fontSize: "1rem",
      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
      width: "100%",
      boxSizing: "border-box",
    },
    select: {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #ccc",
      fontSize: "1rem",
      width: "100%",
      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
      boxSizing: "border-box",
    },
    textarea: {
      minHeight: "100px",
      resize: "vertical",
      width: "100%",
      boxSizing: "border-box",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #ccc",
      fontSize: "1rem",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "0.75rem",
      minWidth: "600px",
    },
    th: {
      padding: "0.5rem",
      border: "1px solid #ccc",
      textAlign: "left",
      background: "#186476ff",
      color: "white",
      fontSize: "0.9rem",
    },
    td: {
      padding: "0.5rem",
      border: "1px solid #ccc",
      fontSize: "0.9rem",
    },
    btnPrimary: {
      padding: "0.6rem 1rem",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer",
      background: "linear-gradient(135deg, #186476ff, #3fa3b9ff)",
      color: "white",
      fontWeight: "600",
      transition: "all 0.2s",
      width: "100%",
      maxWidth: "200px",
    },
    btnSecondary: {
      padding: "0.6rem 1rem",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer",
      background: "#6c757d",
      color: "white",
      transition: "all 0.2s",
      width: "100%",
      maxWidth: "200px",
    },
    btnDanger: {
      padding: "0.6rem 1rem",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer",
      background: "#dc3545",
      color: "white",
      transition: "all 0.2s",
      width: "100%",
      maxWidth: "100px",
    },
    heading: {
      color: "#186476ff",
      fontSize: "1.25rem",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    subHeading: {
      color: "#186476ff",
      marginTop: "1rem",
      fontSize: "1.1rem",
    },
    buttonContainer: {
      display: "flex",
      gap: "0.75rem",
      flexWrap: "wrap",
      justifyContent: "flex-start",
    },
    scoreDisplay: {
      marginTop: "1rem",
      padding: "1rem",
      background: "#e6f3fa",
      borderRadius: "0.5rem",
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#186476ff",
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .form { padding: 1rem; max-width: 95vw; }
      .vignette { font-size: 0.9rem; }
      .tabContainer { flex-direction: column; }
      .tabButton { font-size: 0.9rem; padding: 0.4rem 0.8rem; }
      .input, .select, .textarea { font-size: 0.9rem; padding: 0.5rem; }
      .btnPrimary, .btnSecondary, .btnDanger { font-size: 0.9rem; padding: 0.5rem 0.75rem; max-width: 100%; }
      .heading { font-size: 1.1rem; }
      .subHeading { font-size: 1rem; }
      .table { min-width: 100%; }
      .th, .td { font-size: 0.85rem; padding: 0.4rem; }
      .scoreDisplay { font-size: 1rem; }
    }
    @media (max-width: 480px) {
      .container { padding: 0.75rem; }
      .form { padding: 0.75rem; }
      .vignette { font-size: 0.85rem; }
      .tabButton { font-size: 0.85rem; }
      .input, .select, .textarea { font-size: 0.85rem; }
      .btnPrimary, .btnSecondary, .btnDanger { font-size: 0.85rem; }
      .heading { font-size: 1rem; }
      .th, .td { font-size: 0.8rem; padding: 0.3rem; }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={styles.container} className="container">
        <div style={styles.form} className="form">
          <h3 style={styles.heading}>
            <FaNotesMedical /> Exam Mode - Dummy EMR
          </h3>
          <div style={styles.vignette}>
            <h4>Case Vignette</h4>
            <p>
              Mr. Rajesh Sharma, 52/M, presents with 2 months of increased
              thirst, frequent urination, and fatigue.
            </p>
            <p>
              <strong>History:</strong> Hypertension x 5 years (irregular
              treatment). No chest pain. Family history: Father had diabetes.
            </p>
            <p>
              <strong>On exam:</strong> Overweight, mild pedal edema.
            </p>
            <p>
              <strong>Instructions:</strong> Fill all EMR tabs in sequence:
              Demographics → Chief Complaint → Vitals → Investigations →
              Diagnosis → Prescription → Lifestyle Advice → Follow-up & Plan.
            </p>
          </div>

          {/* Tabs */}
          <div style={styles.tabContainer} className="tabContainer">
            {[
              { id: "demographics", label: "Demographics", icon: <FaUser /> },
              {
                id: "chiefComplaint",
                label: "Chief Complaint",
                icon: <FaNotesMedical />,
              },
              { id: "vitals", label: "Vitals", icon: <FaHeartbeat /> },
              {
                id: "investigations",
                label: "Investigations",
                icon: <FaFlask />,
              },
              { id: "diagnosis", label: "Diagnosis", icon: <FaDiagnoses /> },
              { id: "prescription", label: "Prescription", icon: <FaPills /> },
              {
                id: "lifestyleAdvice",
                label: "Lifestyle Advice",
                icon: <FaAppleAlt />,
              },
              {
                id: "followUp",
                label: "Follow-up & Plan",
                icon: <FaCalendarCheck />,
              },
            ].map((tab, index) => (
              <button
                key={tab.id}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.id ? styles.activeTabButton : {}),
                  ...(index <= completedTabs.length ||
                  completedTabs.includes(tab.id)
                    ? {}
                    : styles.disabledTabButton),
                }}
                onClick={() =>
                  (index <= completedTabs.length ||
                    completedTabs.includes(tab.id)) &&
                  setActiveTab(tab.id)
                }
                disabled={
                  index > completedTabs.length &&
                  !completedTabs.includes(tab.id)
                }
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Demographics */}
          {activeTab === "demographics" && (
            <>
              <h4 style={styles.subHeading}>Patient Demographics</h4>
              <input
                placeholder="UHID (e.g., TATH2025-0001)"
                value={formData.demographics.uhid}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      uhid: e.target.value,
                    },
                  })
                }
                style={styles.input}
                required
              />
              <input
                placeholder="Name"
                value={formData.demographics.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      name: e.target.value,
                    },
                  })
                }
                style={styles.input}
                required
              />
              <input
                placeholder="Age"
                type="number"
                value={formData.demographics.age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      age: e.target.value,
                    },
                  })
                }
                style={styles.input}
                required
              />
              <select
                value={formData.demographics.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      gender: e.target.value,
                    },
                  })
                }
                style={styles.select}
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <button
                onClick={() => handleNextTab("chiefComplaint")}
                style={styles.btnPrimary}
              >
                Next
              </button>
            </>
          )}

          {/* Chief Complaint */}
          {activeTab === "chiefComplaint" && (
            <>
              <h4 style={styles.subHeading}>Chief Complaint</h4>
              <textarea
                placeholder="Chief Complaint (e.g., Increased thirst, frequent urination, fatigue)"
                value={formData.chiefComplaint}
                onChange={(e) =>
                  setFormData({ ...formData, chiefComplaint: e.target.value })
                }
                style={styles.textarea}
                required
              />
              <button
                onClick={() => handleNextTab("vitals")}
                style={styles.btnPrimary}
              >
                Next
              </button>
            </>
          )}

          {/* Vitals */}
          {activeTab === "vitals" && (
            <>
              <h4 style={styles.subHeading}>Examination / Vitals</h4>
              <input
                placeholder="Height (cm)"
                type="number"
                value={formData.vitals.height}
                onChange={(e) => {
                  const height = e.target.value;
                  setFormData({
                    ...formData,
                    vitals: {
                      ...formData.vitals,
                      height,
                      bmi:
                        height && formData.vitals.weight
                          ? (
                              formData.vitals.weight /
                              (height / 100) ** 2
                            ).toFixed(1)
                          : "",
                    },
                  });
                }}
                style={styles.input}
              />
              <input
                placeholder="Weight (kg)"
                type="number"
                value={formData.vitals.weight}
                onChange={(e) => {
                  const weight = e.target.value;
                  setFormData({
                    ...formData,
                    vitals: {
                      ...formData.vitals,
                      weight,
                      bmi:
                        formData.vitals.height && weight
                          ? (
                              weight /
                              (formData.vitals.height / 100) ** 2
                            ).toFixed(1)
                          : "",
                    },
                  });
                }}
                style={styles.input}
              />
              <input
                placeholder="BMI"
                value={formData.vitals.bmi}
                readOnly
                style={styles.input}
              />
              <input
                placeholder="Blood Pressure (mmHg)"
                value={formData.vitals.bp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, bp: e.target.value },
                  })
                }
                style={styles.input}
                required
              />
              <input
                placeholder="Pulse (per min)"
                type="number"
                value={formData.vitals.pulse}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, pulse: e.target.value },
                  })
                }
                style={styles.input}
                required
              />
              <input
                placeholder="Temperature (F)"
                type="number"
                value={formData.vitals.temp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, temp: e.target.value },
                  })
                }
                style={styles.input}
                required
              />
              <input
                placeholder="Respiratory Rate (per min)"
                type="number"
                value={formData.vitals.resp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, resp: e.target.value },
                  })
                }
                style={styles.input}
                required
              />
              <input
                placeholder="SpO2 (%)"
                type="number"
                value={formData.vitals.spo2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, spo2: e.target.value },
                  })
                }
                style={styles.input}
                required
              />
              <textarea
                placeholder="Relevant Exam Findings"
                value={formData.vitals.findings}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, findings: e.target.value },
                  })
                }
                style={styles.textarea}
              />
              <button
                onClick={() => handleNextTab("investigations")}
                style={styles.btnPrimary}
              >
                Next
              </button>
            </>
          )}

          {/* Investigations */}
          {activeTab === "investigations" && (
            <>
              <h4 style={styles.subHeading}>Investigations</h4>
              <textarea
                placeholder="Labs (e.g., HbA1c, FBS, PPBS, Lipid profile, Creatinine, LFT)"
                value={formData.investigations.labs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investigations: {
                      ...formData.investigations,
                      labs: e.target.value,
                    },
                  })
                }
                style={styles.textarea}
                required
              />
              <textarea
                placeholder="Imaging (e.g., ECG)"
                value={formData.investigations.imaging}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investigations: {
                      ...formData.investigations,
                      imaging: e.target.value,
                    },
                  })
                }
                style={styles.textarea}
              />
              <textarea
                placeholder="Referrals (e.g., Ophthalmology)"
                value={formData.investigations.referrals}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investigations: {
                      ...formData.investigations,
                      referrals: e.target.value,
                    },
                  })
                }
                style={styles.textarea}
              />
              <button
                onClick={() => handleNextTab("diagnosis")}
                style={styles.btnPrimary}
              >
                Next
              </button>
            </>
          )}

          {/* Diagnosis */}
          {activeTab === "diagnosis" && (
            <>
              <h4 style={styles.subHeading}>Diagnosis</h4>
              <textarea
                placeholder="Provisional Diagnosis"
                value={formData.diagnosis.provisional}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    diagnosis: {
                      ...formData.diagnosis,
                      provisional: e.target.value,
                    },
                  })
                }
                style={styles.textarea}
                required
              />
              <textarea
                placeholder="Final Diagnosis"
                value={formData.diagnosis.final}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    diagnosis: { ...formData.diagnosis, final: e.target.value },
                  })
                }
                style={styles.textarea}
                required
              />
              <button
                onClick={() => handleNextTab("prescription")}
                style={styles.btnPrimary}
              >
                Next
              </button>
            </>
          )}

          {/* Prescription */}
          {activeTab === "prescription" && (
            <>
              <h4 style={styles.subHeading}>Prescription</h4>
              <select
                value={formData.prescription.template}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prescription: {
                      ...formData.prescription,
                      template: e.target.value,
                    },
                  })
                }
                style={styles.select}
              >
                <option value="">
                  Select Prescription Template (Optional)
                </option>
                {prescriptionTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <table style={styles.table} className="table">
                <thead>
                  <tr>
                    <th style={styles.th}>Serial</th>
                    <th style={styles.th}>Generic Name</th>
                    <th style={styles.th}>Brand Name</th>
                    <th style={styles.th}>Route</th>
                    <th style={styles.th}>Dose</th>
                    <th style={styles.th}>Duration</th>
                    <th style={styles.th}>Timings</th>
                    <th style={styles.th}>Notes/Remarks</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.prescription.manualEntries.map((entry, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{entry.serial}</td>
                      <td style={styles.td}>
                        <select
                          value={entry.generic}
                          onChange={(e) =>
                            updatePrescriptionEntry(
                              index,
                              "generic",
                              e.target.value
                            )
                          }
                          style={styles.select}
                          required
                        >
                          <option value="" disabled>
                            Select Generic
                          </option>
                          {drugs.map((d) => (
                            <option key={d.generic} value={d.generic}>
                              {d.generic}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Brand Name"
                          value={entry.brand}
                          onChange={(e) =>
                            updatePrescriptionEntry(
                              index,
                              "brand",
                              e.target.value
                            )
                          }
                          style={styles.input}
                          required
                        />
                      </td>
                      <td style={styles.td}>
                        <select
                          value={entry.route}
                          onChange={(e) =>
                            updatePrescriptionEntry(
                              index,
                              "route",
                              e.target.value
                            )
                          }
                          style={styles.select}
                          required
                        >
                          <option value="" disabled>
                            Select Route
                          </option>
                          {routeOptions.map((route) => (
                            <option key={route} value={route}>
                              {route}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Dose (e.g., 500mg)"
                          value={entry.dose}
                          onChange={(e) =>
                            updatePrescriptionEntry(
                              index,
                              "dose",
                              e.target.value
                            )
                          }
                          style={styles.input}
                          required
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Duration (e.g., Ongoing)"
                          value={entry.duration}
                          onChange={(e) =>
                            updatePrescriptionEntry(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          style={styles.input}
                          required
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Timings (e.g., BD)"
                          value={entry.timings}
                          onChange={(e) =>
                            updatePrescriptionEntry(
                              index,
                              "timings",
                              e.target.value
                            )
                          }
                          style={styles.input}
                          required
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Notes/Remarks"
                          value={entry.notes}
                          onChange={(e) =>
                            updatePrescriptionEntry(
                              index,
                              "notes",
                              e.target.value
                            )
                          }
                          style={styles.input}
                        />
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => removePrescriptionEntry(index)}
                          style={styles.btnDanger}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={addPrescriptionEntry}
                style={styles.btnSecondary}
              >
                + Add Prescription
              </button>
              <button
                onClick={() => handleNextTab("lifestyleAdvice")}
                style={styles.btnPrimary}
              >
                Next
              </button>
            </>
          )}

          {/* Lifestyle Advice */}
          {activeTab === "lifestyleAdvice" && (
            <>
              <h4 style={styles.subHeading}>Lifestyle Advice / Counselling</h4>
              <textarea
                placeholder="Lifestyle Advice (e.g., Balanced diet, exercise, monitor sugars)"
                value={formData.lifestyleAdvice}
                onChange={(e) =>
                  setFormData({ ...formData, lifestyleAdvice: e.target.value })
                }
                style={styles.textarea}
                required
              />
              <button
                onClick={() => handleNextTab("followUp")}
                style={styles.btnPrimary}
              >
                Next
              </button>
            </>
          )}

          {/* Follow-up & Plan */}
          {activeTab === "followUp" && (
            <>
              <h4 style={styles.subHeading}>Follow-up & Plan</h4>
              <input
                type="date"
                value={formData.followUp.nextAppointment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUp: {
                      ...formData.followUp,
                      nextAppointment: e.target.value,
                    },
                  })
                }
                style={styles.input}
                required
              />
              <textarea
                placeholder="Follow-up Notes"
                value={formData.followUp.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUp: { ...formData.followUp, notes: e.target.value },
                  })
                }
                style={styles.textarea}
              />
              <textarea
                placeholder="Investigations"
                value={formData.followUp.investigations}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUp: {
                      ...formData.followUp,
                      investigations: e.target.value,
                    },
                  })
                }
                style={styles.textarea}
              />
              <textarea
                placeholder="Procedures (e.g., Foot exam, retinal screening)"
                value={formData.followUp.procedures}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUp: {
                      ...formData.followUp,
                      procedures: e.target.value,
                    },
                  })
                }
                style={styles.textarea}
              />
              <textarea
                placeholder="Referrals (e.g., Ophthalmology, Physiotherapy)"
                value={formData.followUp.referrals}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUp: {
                      ...formData.followUp,
                      referrals: e.target.value,
                    },
                  })
                }
                style={styles.textarea}
              />
              <input
                placeholder="Doctor's Signature"
                value={formData.signature}
                onChange={(e) =>
                  setFormData({ ...formData, signature: e.target.value })
                }
                style={styles.input}
              />
              <textarea
                placeholder="Disclaimer"
                value={formData.disclaimer}
                onChange={(e) =>
                  setFormData({ ...formData, disclaimer: e.target.value })
                }
                style={styles.textarea}
              />
              <div style={styles.buttonContainer}>
                <button onClick={handleSubmit} style={styles.btnPrimary}>
                  Submit
                </button>
                <button onClick={onClose} style={styles.btnSecondary}>
                  Cancel
                </button>
              </div>
              {score !== null && (
                <div style={styles.scoreDisplay}>Your Score: {score}/100</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ExamModeForm;

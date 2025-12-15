// src/components/ExamMode.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaClipboardCheck,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import {
  fetchModules,
  createModule,
  createCase,
  createTopic,
  updateTopic,
  deleteModule,
  deleteCase,
  deleteTopic,
  fetchCases,
  fetchTopics,
  fetchPerformance,
  clearError,
} from "../redux/slices/examSlice";

const ExamMode = ({ onClose }) => {
  const dispatch = useDispatch();
  const { modules, performance, loading, error } = useSelector(
    (state) => state.exams || {}
  );

  /* ---------- UI STATE ---------- */
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null); // {moduleId, caseId, topic}

  const [selModuleId, setSelModuleId] = useState(null);
  const [selCaseId, setSelCaseId] = useState(null);

  const [moduleTitle, setModuleTitle] = useState("");
  const [caseData, setCaseData] = useState({ title: "", caseHistory: "" });

  const defaultTopic = {
    title: "",
    content: {
      patientDemographics: {
        name: "", uhid: "", age: 0, gender: "", address: "", contact: "", email: "", referredBy: "",
      },
      clinicalHistory: { chiefComplaint: "", hpi: "", pastMedicalHistory: "", allergies: "" },
      examinationVitals: {
        height: 0, weight: 0, bmi: 0, bp: "", pulse: 0, temperature: 0, respiration: 0, spO2: 0, findings: "",
      },
      investigations: { labs: "", imaging: "", uploadReports: [] },
      diagnosis: { provisional: "", final: "" },
      prescriptionCreation: { templateSearch: "", medicines: [] },
      editPrescription: { medicines: [] },
      treatmentPlan: { lifestyleAdvice: "", proceduresReferrals: "" },
      followUp: { notes: "", nextAppointment: "", autoReminders: false },
      outputPreview: "",
    },
  };
  const [topicData, setTopicData] = useState(defaultTopic);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    dispatch(fetchModules());
    dispatch(fetchPerformance());
  }, [dispatch]);

  // Load cases when a module is selected
  const loadCases = useCallback(
    (moduleId) => {
      if (moduleId) dispatch(fetchCases(moduleId));
    },
    [dispatch]
  );

  // Load topics when a case is selected
  const loadTopics = useCallback(
    (moduleId, caseId) => {
      if (moduleId && caseId) dispatch(fetchTopics({ moduleId, caseId }));
    },
    [dispatch]
  );

  /* ---------- HANDLERS ---------- */
  const saveModule = async () => {
    await dispatch(createModule({ title: moduleTitle })).unwrap();
    setModuleTitle("");
    setShowModuleForm(false);
  };

  const saveCase = async () => {
    await dispatch(createCase({ moduleId: selModuleId, caseData })).unwrap();
    setCaseData({ title: "", caseHistory: "" });
    setShowCaseForm(false);
    setSelModuleId(null);
  };

  const saveTopic = async () => {
    const payload = {
      moduleId: selModuleId,
      caseId: selCaseId,
      topicData,
    };
    if (editingTopic) {
      await dispatch(
        updateTopic({ ...payload, topicId: editingTopic._id })
      ).unwrap();
    } else {
      await dispatch(createTopic(payload)).unwrap();
    }
    resetTopicForm();
  };

  const resetTopicForm = () => {
    setTopicData(defaultTopic);
    setShowTopicForm(false);
    setEditingTopic(null);
    setSelModuleId(null);
    setSelCaseId(null);
  };

  const deleteMod = async (id) => {
    if (window.confirm("Delete whole module?")) {
      await dispatch(deleteModule(id)).unwrap();
    }
  };

  const deleteCas = async (moduleId, caseId) => {
    if (window.confirm("Delete this case?")) {
      await dispatch(deleteCase({ moduleId, caseId })).unwrap();
    }
  };

  const deleteTop = async (moduleId, caseId, topicId) => {
    if (window.confirm("Delete this topic?")) {
      await dispatch(deleteTopic({ moduleId, caseId, topicId })).unwrap();
    }
  };

  const startEditTopic = (moduleId, caseId, topic) => {
    setSelModuleId(moduleId);
    setSelCaseId(caseId);
    setTopicData(topic);
    setEditingTopic(topic);
    setShowTopicForm(true);
  };

  /* ---------- PRESCRIPTION PREVIEW (memoised) ---------- */
  const previewHTML = useMemo(() => {
    const c = topicData.content;
    const meds = c.prescriptionCreation.medicines;

    return `
      <div style="font-family:Arial,Helvetica,sans-serif; max-width:800px; margin:auto; border:1px solid #ccc; padding:20px;">
        <div style="display:flex; justify-content:space-between;">
          <div><strong>City Health Clinic</strong><br/>123, Main Street, City, India 400001<br/>Contact: +91 98765 43210</div>
          <div style="text-align:right;"><strong>Dr Rajesh Gupta, MD</strong><br/>General Medicine<br/>Reg No: 123456</div>
        </div>
        <hr style="margin:20px 0;"/>
        <strong>Patient Details</strong><br/>
        Name: ${c.patientDemographics.name || "-"} | Age/Gender: ${c.patientDemographics.age || "-"} / ${c.patientDemographics.gender || "-"}<br/>
        UHID: ${c.patientDemographics.uhid || "-"} | Contact: ${c.patientDemographics.contact || "-"}<br/>
        Address: ${c.patientDemographics.address || "-"}<br/><br/>

        <strong>Clinical History</strong><br/>
        Chief Complaint: ${c.clinicalHistory.chiefComplaint || "-"}<br/>
        HPI: ${c.clinicalHistory.hpi || "-"}<br/>
        Past Medical History: ${c.clinicalHistory.pastMedicalHistory || "-"}<br/>
        Allergies: ${c.clinicalHistory.allergies || "-"}<br/><br/>

        <strong>Examination & Vitals</strong><br/>
        Height: ${c.examinationVitals.height || "-"} cm Weight: ${c.examinationVitals.weight || "-"} kg BMI: ${c.examinationVitals.bmi || "-"}<br/>
        BP: ${c.examinationVitals.bp || "-"} Pulse: ${c.examinationVitals.pulse || "-"} Temp: ${c.examinationVitals.temperature || "-"} Resp: ${c.examinationVitals.respiration || "-"} SpO2: ${c.examinationVitals.spO2 || "-"}<br/>
        Findings: ${c.examinationVitals.findings || "-"}<br/><br/>

        <strong>Investigations</strong><br/>
        Labs: ${c.investigations.labs || "-"}<br/>
        Imaging: ${c.investigations.imaging || "-"}<br/><br/>

        <strong>Diagnosis</strong><br/>
        Provisional: ${c.diagnosis.provisional || "-"} Final: ${c.diagnosis.final || "-"}<br/><br/>

        <strong>Rx (Prescription)</strong>
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead><tr style="background:#186476; color:#fff;">
            <th style="padding:5px; border:1px solid #ccc;">#</th>
            <th style="padding:5px; border:1px solid #ccc;">Medicine</th>
          </tr></thead>
          <tbody>
            ${meds
              .map(
                (m, i) => `<tr>
                  <td style="padding:5px; border:1px solid #ccc;">${i + 1}</td>
                  <td style="padding:5px; border:1px solid #ccc;">${m}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <br/><strong>Treatment Plan</strong><br/>
        Lifestyle Advice: ${c.treatmentPlan.lifestyleAdvice || "-"}<br/>
        Procedures/Referrals: ${c.treatmentPlan.proceduresReferrals || "-"}<br/><br/>

        <strong>Follow-up</strong><br/>
        Notes: ${c.followUp.notes || "-"}<br/>
        Next Appointment: ${c.followUp.nextAppointment || "-"}<br/>
        Auto Reminders: ${c.followUp.autoReminders ? "Yes" : "No"}<br/><br/>

        <div style="margin-top:30px; text-align:right;">
          <strong>Dr Rajesh Gupta</strong><br/>
          <small>Disclaimer: This is a computer-generated prescription...</small>
        </div>
      </div>
    `;
  }, [topicData]);

  /* ---------- STYLES ---------- */
  const s = {
    container: { padding: "1.5rem", background: "#fff", borderRadius: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#186476", fontSize: "1.3rem", marginBottom: "1rem" },
    btn: (bg = "#10B981") => ({
      padding: "0.4rem 0.8rem",
      border: "none",
      borderRadius: "0.4rem",
      background: bg,
       color: "#fff",
      cursor: "pointer",
      fontWeight: "600",
      margin: "0 0.2rem",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.3rem",
      fontSize: "0.85rem",
    }),
    input: { padding: "0.5rem", border: "1px solid #ccc", borderRadius: "0.25rem", width: "100%", marginBottom: "0.5rem" },
    textarea: { minHeight: "70px", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "0.25rem", width: "100%", marginBottom: "0.5rem" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
    th: { background: "#186476", color: "#fff", padding: "0.5rem", border: "1px solid #ccc", textAlign: "left" },
    td: { padding: "0.5rem", border: "1px solid #ccc", background: "#fff" },
    error: { color: "#dc3545", marginBottom: "0.5rem" },
    previewBox: { marginTop: "1rem", border: "1px solid #ddd", padding: "1rem", background: "#f9f9f9", overflow: "auto", maxHeight: "400px" },
    nested: { marginLeft: "1.2rem", borderLeft: "2px solid #ddd", paddingLeft: "0.8rem" },
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) { .container { padding: 1rem; } }
        @media (max-width: 480px) { .container { padding: 0.5rem; } .btn { font-size:0.8rem; padding:0.35rem 0.5rem; } }
      `}</style>

      <div style={s.container} className="container">
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Exam Mode Management
          </div>
          <button style={s.btn("#6c757d")} onClick={onClose}>
            Close
          </button>
        </div>

        {error && (
          <div style={s.error}>
            {error}
            <button style={s.btn("#dc3545")} onClick={() => dispatch(clearError())}>
              Clear
            </button>
          </div>
        )}
        {loading && <p>Loading…</p>}

        {/* ---------- MODULE FORM ---------- */}
        {showModuleForm && (
          <div style={{ marginBottom: "1rem" }}>
            <input style={s.input} placeholder="Module Title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
            <div>
              <button style={s.btn()} onClick={saveModule}>Save Module</button>
              <button style={s.btn("#6c757d")} onClick={() => setShowModuleForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ---------- CASE FORM ---------- */}
        {showCaseForm && (
          <div style={{ marginBottom: "1rem" }}>
            <input style={s.input} placeholder="Case Title" value={caseData.title} onChange={(e) => setCaseData({ ...caseData, title: e.target.value })} />
            <textarea style={s.textarea} placeholder="Case History" value={caseData.caseHistory} onChange={(e) => setCaseData({ ...caseData, caseHistory: e.target.value })} />
            <div>
              <button style={s.btn()} onClick={saveCase}>Save Case</button>
              <button style={s.btn("#6c757d")} onClick={() => setShowCaseForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ---------- TOPIC FORM (Create / Edit) ---------- */}
        {showTopicForm && (
          <div style={{ marginBottom: "1.5rem", border: "1px solid #eee", padding: "1rem", borderRadius: "0.5rem" }}>
            <h4>{editingTopic ? "Edit Topic" : "Add New Topic"}</h4>

            {/* TITLE */}
            <input style={s.input} placeholder="Topic Title" value={topicData.title} onChange={(e) => setTopicData({ ...topicData, title: e.target.value })} />

            {/* ==== Patient Demographics ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Patient Demographics</legend>
              {["name","uhid","age","gender","address","contact","email","referredBy"].map((field) => {
                const isNum = field === "age";
                const isSelect = field === "gender";
                return (
                  <div key={field} style={{ marginBottom: "0.4rem" }}>
                    {isSelect ? (
                      <select
                        style={s.input}
                        value={topicData.content.patientDemographics[field]}
                        onChange={(e) => setTopicData({
                          ...topicData,
                          content: {
                            ...topicData.content,
                            patientDemographics: { ...topicData.content.patientDemographics, [field]: e.target.value },
                          },
                        })}
                      >
                        <option value="">Select Gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    ) : (
                      <input
                        style={s.input}
                        type={isNum ? "number" : "text"}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={topicData.content.patientDemographics[field]}
                        onChange={(e) => setTopicData({
                          ...topicData,
                          content: {
                            ...topicData.content,
                            patientDemographics: { ...topicData.content.patientDemographics, [field]: isNum ? +e.target.value : e.target.value },
                          },
                        })}
                      />
                    )}
                  </div>
                );
              })}
            </fieldset>

            {/* ==== Clinical History ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Clinical History</legend>
              {["chiefComplaint","hpi","pastMedicalHistory","allergies"].map((field) => (
                <textarea
                  key={field}
                  style={s.textarea}
                  placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                  value={topicData.content.clinicalHistory[field]}
                  onChange={(e) => setTopicData({
                    ...topicData,
                    content: {
                      ...topicData.content,
                      clinicalHistory: { ...topicData.content.clinicalHistory, [field]: e.target.value },
                    },
                  })}
                />
              ))}
            </fieldset>

            {/* ==== Vitals ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Examination & Vitals</legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "0.4rem" }}>
                {["height","weight","bmi","bp","pulse","temperature","respiration","spO2"].map((field) => (
                  <input
                    key={field}
                    style={s.input}
                    type={["height","weight","pulse","respiration","spO2"].includes(field) ? "number" : "text"}
                    placeholder={field.toUpperCase()}
                    value={topicData.content.examinationVitals[field]}
                    onChange={(e) => setTopicData({
                      ...topicData,
                      content: {
                        ...topicData.content,
                        examinationVitals: { ...topicData.content.examinationVitals, [field]: field === "bmi" || field === "temperature" ? +e.target.value : e.target.value },
                      },
                    })}
                  />
                ))}
              </div>
              <textarea
                style={s.textarea}
                placeholder="Findings"
                value={topicData.content.examinationVitals.findings}
                onChange={(e) => setTopicData({
                  ...topicData,
                  content: { ...topicData.content, examinationVitals: { ...topicData.content.examinationVitals, findings: e.target.value } },
                })}
              />
            </fieldset>

            {/* ==== Investigations ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Investigations</legend>
              <textarea style={s.textarea} placeholder="Labs" value={topicData.content.investigations.labs} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, investigations: { ...topicData.content.investigations, labs: e.target.value } } })} />
              <textarea style={s.textarea} placeholder="Imaging" value={topicData.content.investigations.imaging} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, investigations: { ...topicData.content.investigations, imaging: e.target.value } } })} />
            </fieldset>

            {/* ==== Diagnosis ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Diagnosis</legend>
              <input style={s.input} placeholder="Provisional" value={topicData.content.diagnosis.provisional} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, diagnosis: { ...topicData.content.diagnosis, provisional: e.target.value } } })} />
              <input style={s.input} placeholder="Final" value={topicData.content.diagnosis.final} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, diagnosis: { ...topicData.content.diagnosis, final: e.target.value } } })} />
            </fieldset>
 
            {/* ==== Prescription ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Prescription</legend>
              <input style={s.input} placeholder="Template Search (optional)" value={topicData.content.prescriptionCreation.templateSearch} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, prescriptionCreation: { ...topicData.content.prescriptionCreation, templateSearch: e.target.value } } })} />
              <textarea
                style={s.textarea}
                placeholder="One medicine per line"
                value={topicData.content.prescriptionCreation.medicines.join("\n")}
                onChange={(e) => setTopicData({
                  ...topicData,
                  content: {
                    ...topicData.content,
                    prescriptionCreation: {
                      ...topicData.content.prescriptionCreation,
                      medicines: e.target.value.split("\n").filter(m => m.trim()),
                    },
                  },
                })}
              />
            </fieldset>

            {/* ==== Treatment Plan ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Treatment Plan</legend>
              <textarea style={s.textarea} placeholder="Lifestyle Advice" value={topicData.content.treatmentPlan.lifestyleAdvice} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, treatmentPlan: { ...topicData.content.treatmentPlan, lifestyleAdvice: e.target.value } } })} />
              <textarea style={s.textarea} placeholder="Procedures / Referrals" value={topicData.content.treatmentPlan.proceduresReferrals} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, treatmentPlan: { ...topicData.content.treatmentPlan, proceduresReferrals: e.target.value } } })} />
            </fieldset>

            {/* ==== Follow-up ==== */}
            <fieldset style={{ marginTop: "1rem" }}>
              <legend>Follow-up</legend>
              <textarea style={s.textarea} placeholder="Notes" value={topicData.content.followUp.notes} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, followUp: { ...topicData.content.followUp, notes: e.target.value } } })} />
              <input style={s.input} type="datetime-local" value={topicData.content.followUp.nextAppointment} onChange={(e) => setTopicData({ ...topicData, content: { ...topicData.content, followUp: { ...topicData.content.followUp, nextAppointment: e.target.value } } })} />
              <label style={{ display: "block", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={topicData.content.followUp.autoReminders}
                  onChange={(e) => setTopicData({
                    ...topicData,
                    content: { ...topicData.content, followUp: { ...topicData.content.followUp, autoReminders: e.target.checked } },
                  })}
                /> Auto Reminders
              </label>
            </fieldset>

            {/* ==== PREVIEW ==== */}
            <div style={s.previewBox} dangerouslySetInnerHTML={{ __html: previewHTML }} />

            {/* ==== SAVE / CANCEL ==== */}
            <div style={{ marginTop: "1rem" }}>
              <button style={s.btn()} onClick={saveTopic}>
                {editingTopic ? "Update Topic" : "Save Topic"}
              </button>
              <button style={s.btn("#6c757d")} onClick={resetTopicForm}>Cancel</button>
            </div>
          </div>
        )}

        {/* ---------- ADD MODULE BUTTON ---------- */}
        <button style={s.btn()} onClick={() => setShowModuleForm(true)}>
          Add Module
        </button>

        {/* ---------- MODULES / CASES / TOPICS TABLE ---------- */}
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Module</th>
              <th style={s.th}>Cases / Topics</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr key={mod._id}>
                <td style={s.td}>
                  <strong>{mod.title}</strong> <small>({mod._id})</small>
                </td>
                <td style={s.td}>
                  {/* ==== Cases ==== */}
                  <div style={s.nested}>
                    {(mod.cases || []).length === 0 && (
                      <button
                        style={s.btn("#186476")}
                        onClick={() => {
                          setSelModuleId(mod._id);
                          setShowCaseForm(true);
                        }}
                      >
                        Add Case
                      </button>
                    )}
                    {(mod.cases || []).map((cas) => (
                      <div key={cas._id} style={{ marginBottom: "0.8rem" }}>
                        <strong>{cas.title}</strong>
                        <button
                          style={s.btn("#dc3545")}
                          onClick={() => deleteCas(mod._id, cas._id)}
                        >
                          Delete Case
                        </button>

                        {/* ==== Topics ==== */}
                        <div style={{ marginLeft: "1rem", marginTop: "0.4rem" }}>
                          {(cas.topics || []).length === 0 && (
                            <button
                              style={s.btn("#10B981")}
                              onClick={() => {
                                setSelModuleId(mod._id);
                                setSelCaseId(cas._id);
                                setShowTopicForm(true);
                              }}
                            >
                              Add Topic
                            </button>
                          )}
                          {(cas.topics || []).map((top) => (
                            <div
                              key={top._id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                marginBottom: "0.3rem",
                              }}
                            >
                              {top.title}
                              <button
                                style={s.btn("#ffc107")}
                                onClick={() => startEditTopic(mod._id, cas._id, top)}
                              >
                                Edit Topic
                              </button>
                              <button
                                style={s.btn("#dc3545")}
                                onClick={() => deleteTop(mod._id, cas._id, top._id)}
                              >
                                Delete Topic
                              </button>
                            </div>
                          ))}
                          {(cas.topics || []).length > 0 && (
                            <button
                              style={s.btn("#10B981")}
                              onClick={() => {
                                setSelModuleId(mod._id);
                                setSelCaseId(cas._id);
                                setShowTopicForm(true);
                              }}
                            >
                              Add Topic
                            </button>
                          )}
                        </div>

                        {/* Load topics on expand (optional) */}
                        <button
                          style={s.btn("#6c757d")}
                          onClick={() => loadTopics(mod._id, cas._id)}
                        >
                          Refresh Topics
                        </button>
                      </div>
                    ))}

                    {/* Add Case button (outside loop) */}
                    <button
                      style={s.btn("#186476")}
                      onClick={() => {
                        setSelModuleId(mod._id);
                        setShowCaseForm(true);
                      }}
                    >
                      Add Case
                    </button>
                  </div>
                </td>
                <td style={s.td}>
                  <button style={s.btn("#dc3545")} onClick={() => deleteMod(mod._id)}>
                    Delete Module
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ---------- PERFORMANCE SUMMARY ---------- */}
        <h3 style={{ marginTop: "2rem", color: "#186476" }}>Student Performance Summary</h3>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Modules Attempted</th>
              <th style={s.th}>Pass</th>
              <th style={s.th}>Fail</th>
              <th style={s.th}>Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {performance.map((p, i) => (
              <tr key={i}>
                <td style={s.td}>{p.student?.name || "-"}</td>
                <td style={s.td}>{p.student?.email || "-"}</td>
                <td style={s.td}>{p.totalModulesAttempted || 0}</td>
                <td style={s.td}>{p.totalPass || 0}</td>
                <td style={s.td}>{p.totalFail || 0}</td>
                <td style={s.td}>{p.averageScore?.toFixed(1) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ExamMode;
// src/components/ReadMode.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "../Components/ToastProvider";
import {
  fetchSystems,
  createSystem,
  updateSystem,
  deleteSystem,
  fetchChaptersBySystem,
  createChapter,
  updateChapter,
  deleteChapter,
  fetchSectionsByChapter,
  fetchSectionById,
  createSection,
  updateSection,
  deleteSection,
  selectSystem,
  selectChapter,
  setActiveSection,
  setActiveSectionData,
  clearSelection,
  clearError,
  fetchPredefinedSections,
} from "../redux/slices/readModeSlice";
import {
  Plus,
  BookOpen,
  FileText,
  ArrowLeft,
  X,
  Layers,
  Save,
  Loader2,
  ChevronRight,
  Hash,
  Eye,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Image,
  Film,
  GitBranch,
} from "lucide-react";
import { addSectionsToChapter } from "../redux/slices/systemsSlice";

import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

// ================== STATIC MOCK DATA ==================
const USE_STATIC_DATA = true;

const SYSTEM_NAME_OPTIONS = [
  "Cardiovascular System",
  "Respiratory System",
  "Gastrointestinal System",
  "Neurology",
  "Endocrinology",
  "Nephrology",
  "Musculoskeletal System",
  "Dermatology",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Psychiatry",
];

const PREDEFINED_CHAPTERS = [
  { code: "C", title: "Chapter 1 (Overview)" },
  { code: "A", title: "Anatomy & Physiology" },
  { code: "P", title: "Pathophysiology" },
  { code: "D", title: "Drug Treatment" },
  { code: "E", title: "Emergency Management" },
];

const STATIC_SYSTEMS = [
  {
    _id: "sys1",
    title: "Cardiovascular System",
    description: "Heart and blood vessel related studies",
    image: null,
    chapters: [
      {
        _id: "chap1",
        title: "Anatomy & Physiology of the Heart",
        sections: [
          {
            _id: "sec1",
            title: "Introduction",
            content:
              "The cardiovascular system consists of the heart, blood, and blood vessels. It plays a vital role in transporting oxygen and nutrients.",
            images: [],
            videos: [],
            flowcharts: [],
            pdfs: [],
          },
          {
            _id: "sec2",
            title: "Investigations",
            content:
              "Initial investigations include CBC, ECG, chest X-ray, lipid profile and echocardiography as required.",
            images: [],
            videos: [],
            flowcharts: [],
            pdfs: [],
          },
          {
            _id: "sec3",
            title: "Practice Cases",
            content: `
Case 1:
A 55-year-old male presents with chest pain and sweating.

Vitals:
BP: 150/90 mmHg
HR: 98 bpm

Think about diagnosis and investigations.

Case 2:
ECG shows ST elevation in leads II, III, aVF.

What is the diagnosis?
`,
            images: [],
            videos: [],
            flowcharts: [],
            pdfs: [],
          },
        ],
      },
    ],
  },
];

const lightTheme = {
  bg: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  mutedText: "#64748b",
  border: "#e2e8f0",
};

const darkTheme = {
  bg: "#020617",
  surface: "#020617",
  text: "#e5e7eb",
  mutedText: "#94a3b8",
  border: "#1e293b",
};

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
  header: { textAlign: "center", marginBottom: "3rem" },
  title: {
    fontSize: "2.75rem",
    fontWeight: 800,
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
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0 0 0.5rem",
  },
  cardSubtitle: {
    fontSize: "0.925rem",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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
    fontWeight: 600,
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
  },
  modalTitle: {
    fontSize: "1.875rem",
    fontWeight: 800,
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
    minHeight: "120px",
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
  submitBtn: (loading) => ({
    width: "100%",
    background: loading
      ? "#059669"
      : "linear-gradient(135deg, #0d9488, #14b8a6)",
    color: "white",
    padding: "1rem",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: 700,
    fontSize: "1.1rem",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
  }),
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
    fontWeight: 600,
    border: "1px solid #fecaca",
  },
  splitContainer: {
    display: "flex",
    height: "calc(100vh - 8rem)",
    maxWidth: "1400px",
    margin: "0 auto",
    border: "1px solid #e2e8f0",
    borderRadius: "1.25rem",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  sidebar: {
    width: "340px",
    background: "#f8fafc",
    borderRight: "1px solid #e2e8f0",
    padding: "2rem 1.5rem",
    overflowY: "auto",
  },
  contentArea: {
    flex: 1,
    background: "#ffffff",
    padding: "2.5rem",
    overflowY: "auto",
  },
  sectionItem: {
    padding: "0.875rem 1rem",
    borderRadius: "0.75rem",
    cursor: "pointer",
    marginBottom: "0.5rem",
    fontWeight: 500,
    border: "1px solid transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  sectionItemActive: {
    background: "#0d9488",
    color: "white",
    fontWeight: 600,
    borderColor: "#0d9488",
  },
  contentTitle: {
    fontSize: "2.1rem",
    fontWeight: 700,
    color: "#0f766e",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  contentText: {
    fontSize: "1.05rem",
    lineHeight: 1.8,
    color: "#334155",
    whiteSpace: "pre-wrap",
    marginBottom: "1.5rem",
  },
  mediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
    marginTop: "0.75rem",
  },
  mediaItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "0.75rem",
    overflow: "hidden",
    background: "#f8fafc",
  },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
  },
};

const ReadMode = () => {
  const { success, error: toastError, showConfirm } = useToast();
  const dispatch = useDispatch();
  const {
    allIds,
    byId,
    selected,
    loading: systemsLoading,
    error,
    predefinedSections,
    predefinedLoading,
    predefinedError,
    activeSection,
    activeSectionData,
  } = useSelector((state) => state.readMode);

  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [editId, setEditId] = useState(null);

  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [newSystemTitle, setNewSystemTitle] = useState("");
  const [newSystemDesc, setNewSystemDesc] = useState("");
  const [systemImage, setSystemImage] = useState(null);

  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionContents, setSectionContents] = useState({});
  const [newFiles, setNewFiles] = useState({
    images: [],
    videos: [],
    flowcharts: [],
    pdfs: [],
  });
  const [existingUrls, setExistingUrls] = useState({
    images: [],
    videos: [],
    flowcharts: [],
    pdfs: [],
  });

  const [systemNameMode, setSystemNameMode] = useState("select");

  const sectionRefs = useRef({});

  const systemsData = USE_STATIC_DATA
    ? {
        allIds: STATIC_SYSTEMS.map((s) => s._id),
        byId: STATIC_SYSTEMS.reduce((acc, s) => {
          acc[s._id] = s;
          return acc;
        }, {}),
      }
    : { allIds, byId };

  const [finalSystemId, setFinalSystemId] = useState("");
  const [finalChapterId, setFinalChapterId] = useState("");

  const { theme, toggleTheme } = useTheme();
  const activeTheme = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    dispatch(fetchSystems());
    dispatch(fetchPredefinedSections());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toastError(error);
      dispatch(clearError());
    }
    if (predefinedError) {
      toastError(predefinedError);
      dispatch(clearError());
    }
  }, [error, predefinedError, toastError, dispatch]);

  const resetForm = () => {
    setStep(1);
    setEditMode(null);
    setEditId(null);
    setSelectedSystemId("");
    setNewSystemTitle("");
    setNewSystemDesc("");
    setSystemImage(null);
    setSelectedChapterId("");
    setNewChapterTitle("");
    setCurrentSectionIndex(0);
    setSectionContents({});
    setNewFiles({ images: [], videos: [], flowcharts: [], pdfs: [] });
    setExistingUrls({ images: [], videos: [], flowcharts: [], pdfs: [] });
    setFinalSystemId("");
    setFinalChapterId("");
  };

  /* ==================== NAVIGATION ==================== */
  const handleSystemClick = (sysId) => {
    dispatch(selectSystem(sysId));
    dispatch(selectChapter(null));
    dispatch(setActiveSection(null));
    dispatch(setActiveSectionData(null));
  };

  const handleChapterClick = (chapId) => {
    dispatch(selectChapter(chapId));
    dispatch(setActiveSection(null));
    dispatch(setActiveSectionData(null));
  };

  const handleSectionClick = (sectionId) => {
    const chapter = currentSystem.chapters.find(
      (c) => c._id === selected.chapterId
    );
    const section = chapter.sections.find((s) => s._id === sectionId);

    dispatch(setActiveSection(section.title));
    dispatch(setActiveSectionData(section));
  };

  const handleBackToSystems = () => dispatch(clearSelection());
  const handleBackToChapters = () => {
    dispatch(selectChapter(null));
    dispatch(setActiveSection(null));
    dispatch(setActiveSectionData(null));
  };

  /* ==================== EDIT / DELETE ==================== */
  const handleEdit = (type, id, extra = {}) => {
    setEditMode(type);
    setEditId(id);
    setShowForm(true);
    setStep(type === "section" ? 3 : type === "chapter" ? 2 : 1);

    if (type === "system") {
      const sys = byId[id];
      setNewSystemTitle(sys.title);
      setNewSystemDesc(sys.description || "");
      setSelectedSystemId(id);
    } else if (type === "chapter") {
      const chap = Object.values(byId)
        .flatMap((s) => s.chapters || [])
        .find((c) => c._id === id);
      setNewChapterTitle(chap.title);
      setSelectedChapterId(id);
      setFinalSystemId(extra.systemId);
    } else if (type === "section") {
      const sec = Object.values(byId)
        .flatMap((s) => s.chapters || [])
        .flatMap((c) => c.sections || [])
        .find((s) => s._id === id);

      setSectionContents({ [sec.title]: sec.content || "" });
      setNewFiles({ images: [], videos: [], flowcharts: [], pdfs: [] });

      const normalize = (arr) =>
        Array.isArray(arr)
          ? arr.map((i) => (typeof i === "string" ? { url: i } : i))
          : [];
      setExistingUrls({
        images: normalize(sec.images).map((i) => i.url),
        videos: normalize(sec.videos).map((i) => i.url),
        flowcharts: normalize(sec.flowcharts).map((i) => i.url),
        pdfs: normalize(sec.pdfs).map((i) => i.url),
      });

      setCurrentSectionIndex(predefinedSections.indexOf(sec.title));
      setFinalChapterId(extra.chapterId);
    }
  };

  const handleDelete = async (type, id, extra = {}) => {
    const ok = await showConfirm({ message: "Are you sure?" });
    if (!ok) return;
    setSubmitting(true);
    try {
      if (type === "system") await dispatch(deleteSystem(id)).unwrap();
      else if (type === "chapter")
        await dispatch(
          deleteChapter({ systemId: extra.systemId, chapterId: id })
        ).unwrap();
      else if (type === "section")
        await dispatch(
          deleteSection({ chapterId: selected.chapterId, sectionId: id })
        ).unwrap();
    } catch (err) {
      toastError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ==================== FORM LOGIC ==================== */
  const handleNext = async () => {
    if (
      step === 1 &&
      !selectedSystemId &&
      (!newSystemTitle.trim() || !newSystemDesc.trim())
    ) {
      toastError("Title and description required.");
      return;
    }
    setSubmitting(true);
    try {
      let sysId = selectedSystemId;
      if (!sysId && newSystemTitle.trim()) {
        const res =
          editMode === "system" && editId
            ? await dispatch(
                updateSystem({
                  id: editId,
                  title:
                    systemNameMode === "other"
                      ? newSystemTitle
                      : systemNameMode,
                  description: newSystemDesc,
                  image: systemImage,
                })
              ).unwrap()
            : await dispatch(
                createSystem({
                  title:
                    systemNameMode === "other"
                      ? newSystemTitle
                      : systemNameMode,
                  description: newSystemDesc,
                  image: systemImage,
                })
              ).unwrap();
        sysId = res._id;
        success(
          editMode === "system"
            ? "System updated successfully"
            : "System created successfully"
        );
      }
      setFinalSystemId(sysId);

      let chapId = selectedChapterId;

      if (selectedChapterId) {
        const chapterTemplate = PREDEFINED_CHAPTERS.find(
          (c) => c.title === selectedChapterId
        );

        if (!chapterTemplate) {
          toastError("Invalid chapter selected");
          return;
        }

        const res = await dispatch(
          createChapter({
            systemId: sysId,
            title: chapterTemplate.title,
            code: chapterTemplate.code, // 👈 LOCKING KEY
            order: PREDEFINED_CHAPTERS.findIndex(
              (c) => c.code === chapterTemplate.code
            ),
          })
        ).unwrap();

        chapId = res._id || res.chapter?._id;

        success("Chapter created successfully");
      }

      setFinalChapterId(chapId);

      if (editMode === "system" || editMode === "chapter") {
        setShowForm(false);
        resetForm();
      } else {
        setStep(step + 1);
      }
    } catch (err) {
      toastError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const saveCurrentSection = async () => {
    const title = predefinedSections[currentSectionIndex];
    const content = sectionContents[title] || "";

    const sectionData = {
      title,
      content,
      sectionType: title,
      isActive: true,
      images: newFiles.images || [],
      flowcharts: newFiles.flowcharts || [],
      pdfs: newFiles.pdfs || [],
      videos: newFiles.videos || [],
    };

    try {
      const chapId = finalChapterId || selected.chapterId;
      if (!chapId) {
        toastError("Chapter ID missing!");
        return;
      }

      setSubmitting(true);

      if (editMode === "section" && editId) {
        // Update section (future ke liye)
        await dispatch(
          updateSection({ sectionId: editId, sectionData, existingUrls })
        ).unwrap();
      } else {
        // Create new section
        await dispatch(
          addSectionsToChapter({
            chapterId: chapId,
            sectionData,
          })
        ).unwrap();
      }

      // YE LINE SABSE ZAROORI HAI — YEHI PHOTO DIKHA RAHI HAI!
      // Purana data clear karke latest data laao
      dispatch(fetchSystems());

      // Next section pe jao
      if (currentSectionIndex < predefinedSections.length - 1) {
        setCurrentSectionIndex((prev) => prev + 1);
        setNewFiles({ images: [], videos: [], flowcharts: [], pdfs: [] });
        setSectionContents((prev) => ({ ...prev, [title]: content })); // content save rakho
      } else {
        success("All sections completed!");
        setStep(4);
      }
    } catch (err) {
      console.error(err);
      toastError("Upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const skipSection = () => {
    if (currentSectionIndex < predefinedSections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    } else {
      setStep(4);
    }
  };

  const finalSubmit = () => {
    success("All sections saved!");
    setShowForm(false);
    resetForm();
  };

  const scrollToSection = (title) => {
    sectionRefs.current[title]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const currentSectionTitle = predefinedSections[currentSectionIndex];

  /* ==================== CURRENT DATA ==================== */
  const currentSystem = systemsData.byId[selected.systemId];

  const currentChapter = selected.chapterId
    ? currentSystem?.chapters?.find((ch) => ch._id === selected.chapterId)
    : null;

  const filledSections =
    predefinedSections
      ?.map((title, index) => {
        const sec = currentChapter?.sections?.find((s) => s.title === title);

        if (!sec) return null;

        const hasText = sec.content?.trim();
        const hasMedia =
          sec.images?.length > 0 ||
          sec.videos?.length > 0 ||
          sec.flowcharts?.length > 0 ||
          sec.pdfs?.length > 0;

        if (!hasText && !hasMedia) return null;

        return {
          ...sec,
          order: index + 1, // 🔥 LOCKED ORDER NUMBER
        };
      })
      .filter(Boolean) || [];

  /* ==================== RENDER MEDIA ==================== */
  const renderMedia = (mediaArray = [], icon, label, type) => {
    if (!mediaArray || !Array.isArray(mediaArray) || mediaArray.length === 0)
      return null;

    const urls = mediaArray
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && item.url) return item.url;
        return null;
      })
      .filter(Boolean);

    if (urls.length === 0) return null;

    return (
      <div style={{ margin: "2rem 0" }}>
        <h4
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#0f766e",
            fontWeight: 600,
            marginBottom: "0.75rem",
          }}
        >
          {icon} {label} ({urls.length})
        </h4>
        <div style={styles.mediaGrid}>
          {urls.map((url, i) => (
            <div key={i} style={styles.mediaItem}>
              {type === "image" && (
                <img
                  src={url}
                  alt=""
                  style={{ width: "100%", height: "160px", objectFit: "cover" }}
                />
              )}
              {type === "video" && (
                <video controls style={{ width: "100%", height: "160px" }}>
                  <source src={url} />
                </video>
              )}
              {type === "pdf" && (
                <iframe
                  src={url}
                  style={{ width: "100%", height: "200px" }}
                ></iframe>
              )}
              {type === "flowchart" && (
                <img
                  src={url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "contain",
                    background: "#fff",
                  }}
                />
              )}
              <div
                style={{
                  padding: "0.5rem",
                  textAlign: "center",
                  fontSize: "0.8rem",
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0d9488" }}
                >
                  Open {label} #{i + 1}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fab:hover { transform: scale(1.1); box-shadow: 0 16px 40px rgba(20,184,166,0.5); }
        .card-hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08); border-color: #94a3b8; }
        input:focus, textarea:focus, select:focus { border-color: #14b8a6 !important; box-shadow: 0 0 0 3px rgba(20,184,166,0.15); }
      `}</style>

      <div style={styles.container}>
        {(error || predefinedError) && (
          <div style={styles.errorToast}>
            {error || predefinedError}
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
              X
            </button>
          </div>
        )}

        {/* SYSTEMS VIEW */}
        {!selected.systemId && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Medical Systems</h1>
              <p style={styles.subtitle}>
                Click a system to explore its chapters
              </p>
            </div>

            {systemsLoading && (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Loader2
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    color: "#0d9488",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            )}

            <div style={styles.grid}>
              {systemsData.allIds.map((id) => {
                const sys = systemsData.byId[id];
                const hasImage = !!sys.image;

                return (
                  <div
                    key={id}
                    style={styles.card}
                    onClick={() => handleSystemClick(id)}
                    onMouseEnter={(e) =>
                      e.currentTarget.classList.add("card-hover")
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.classList.remove("card-hover")
                    }
                  >
                    <div style={styles.iconBox}>
                      {hasImage ? (
                        <img
                          src={sys.image}
                          alt={sys.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "1rem",
                          }}
                        />
                      ) : (
                        <BookOpen
                          style={{
                            width: "2.25rem",
                            height: "2.25rem",
                            color: "white",
                          }}
                        />
                      )}
                    </div>

                    <h3 style={styles.cardTitle}>{sys.title}</h3>

                    <p style={styles.cardSubtitle}>
                      {sys.chapters?.length || 0} Chapter
                      {(sys.chapters?.length || 0) !== 1 ? "s" : ""}
                    </p>

                    <div
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit("system", id);
                        }}
                        style={styles.actionBtn}
                        title="Edit"
                      >
                        <Edit2 size={16} color="#64748b" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("system", id);
                        }}
                        style={styles.actionBtn}
                        title="Delete"
                      >
                        <Trash2 size={16} color="#dc2626" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {allIds.length === 0 && !systemsLoading && (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  marginTop: "3rem",
                  fontSize: "1.1rem",
                }}
              >
                No systems available. Click the + button to create one.
              </p>
            )}
          </>
        )}

        {/* CHAPTERS VIEW */}
        {selected.systemId && !selected.chapterId && (
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <button style={styles.backBtn} onClick={handleBackToSystems}>
              <ArrowLeft style={{ width: "1.25rem", height: "1.25rem" }} /> Back
              to Systems
            </button>
            <h1
              style={{
                ...styles.title,
                fontSize: "2.5rem",
                textAlign: "center",
                marginBottom: "2rem",
              }}
            >
              {currentSystem?.title}
            </h1>
            <div style={styles.grid}>
              {currentSystem?.chapters
                ?.slice()
                .sort(
                  (a, b) =>
                    PREDEFINED_CHAPTERS.findIndex((c) => c.code === a.code) -
                    PREDEFINED_CHAPTERS.findIndex((c) => c.code === b.code)
                )
                .map((chap) => (
                  <div
                    key={chap._id}
                    style={styles.card}
                    onClick={() => handleChapterClick(chap._id)}
                    onMouseEnter={(e) =>
                      e.currentTarget.classList.add("card-hover")
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.classList.remove("card-hover")
                    }
                  >
                    <div style={styles.iconBox}>
                      <FileText
                        style={{
                          width: "2rem",
                          height: "2rem",
                          color: "white",
                        }}
                      />
                    </div>
                    <h3 style={styles.cardTitle}>
                      [{chap.code}] {chap.title}
                    </h3>
                    <p style={styles.cardSubtitle}>
                      <Hash style={{ width: "1rem", height: "1rem" }} />
                      {chap.sections?.length || 0} section
                      {(chap.sections?.length || 0) !== 1 ? "s" : ""}
                    </p>
                    <div
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit("chapter", chap._id, {
                            systemId: selected.systemId,
                          });
                        }}
                        style={styles.actionBtn}
                        title="Edit"
                      >
                        <Edit2 size={16} color="#64748b" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("chapter", chap._id, {
                            systemId: selected.systemId,
                          });
                        }}
                        style={styles.actionBtn}
                        title="Delete"
                      >
                        <Trash2 size={16} color="#dc2626" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SECTION VIEW */}
        {selected.chapterId && (
          <div style={styles.splitContainer}>
            <div style={styles.sidebar}>
              <button style={styles.backBtn} onClick={handleBackToChapters}>
                <ArrowLeft /> Back to Chapters
              </button>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#0f766e",
                  margin: "1.5rem 0 1rem",
                }}
              >
                {currentChapter?.title}
              </h3>
              <div style={{ marginTop: "1rem" }}>
                {filledSections.length > 0 ? (
                  [...filledSections]
                    .sort(
                      (a, b) =>
                        predefinedSections.indexOf(a.title) -
                        predefinedSections.indexOf(b.title)
                    )
                    .map((sec) => (
                      <div
                        key={sec._id}
                        style={
                          activeSection === sec.title
                            ? {
                                ...styles.sectionItem,
                                ...styles.sectionItemActive,
                              }
                            : styles.sectionItem
                        }
                        onClick={() => handleSectionClick(sec._id)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flex: 1,
                          }}
                        >
                          <span style={{ fontWeight: 700, opacity: 0.7 }}>
                            {sec.order}.
                          </span>

                          <ChevronRight
                            style={{
                              width: "1rem",
                              height: "1rem",
                              opacity: activeSection === sec.title ? 1 : 0.6,
                            }}
                          />

                          {sec.title}
                        </div>

                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit("section", sec._id, {
                                chapterId: selected.chapterId,
                              });
                            }}
                            style={styles.actionBtn}
                            title="Edit"
                          >
                            <Edit2
                              size={14}
                              color={
                                activeSection === sec.title
                                  ? "white"
                                  : "#64748b"
                              }
                            />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete("section", sec._id);
                            }}
                            style={styles.actionBtn}
                            title="Delete"
                          >
                            <Trash2
                              size={14}
                              color={
                                activeSection === sec.title
                                  ? "white"
                                  : "#dc2626"
                              }
                            />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p
                    style={{
                      color: "#94a3b8",
                      fontStyle: "italic",
                      fontSize: "0.925rem",
                      padding: "1rem",
                    }}
                  >
                    No sections added yet.
                  </p>
                )}
              </div>
            </div>

            <div style={styles.contentArea}>
              {/* 🔝 TOP SECTION NAVIGATION */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#ffffff",
                  zIndex: 10,
                  paddingBottom: "1rem",
                  marginBottom: "2rem",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                {filledSections.map((sec) => (
                  <button
                    key={sec._id}
                    onClick={() => scrollToSection(sec.title)}
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "9999px",
                      border: "1px solid #0d9488",
                      background:
                        activeSection === sec.title ? "#0d9488" : "#ffffff",
                      color:
                        activeSection === sec.title ? "#ffffff" : "#0d9488",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>

              {/* 📘 TEXTBOOK STYLE CONTENT (ALL SECTIONS) */}
              {filledSections.map((sec) => (
                <div
                  key={sec._id}
                  ref={(el) => (sectionRefs.current[sec.title] = el)}
                  style={{ marginBottom: "3rem" }}
                  onMouseEnter={() => dispatch(setActiveSection(sec.title))}
                >
                  <h2 style={styles.contentTitle}>
                    <FileText style={{ width: "1.5rem", height: "1.5rem" }} />
                    {sec.title}
                  </h2>

                  {sec.content ? (
                    <div style={styles.contentText}>{sec.content}</div>
                  ) : (
                    <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                      No content available.
                    </p>
                  )}

                  {renderMedia(
                    sec.images,
                    <Image size={18} />,
                    "Images",
                    "image"
                  )}
                  {renderMedia(
                    sec.videos,
                    <Film size={18} />,
                    "Videos",
                    "video"
                  )}
                  {renderMedia(
                    sec.flowcharts,
                    <GitBranch size={18} />,
                    "Flowcharts",
                    "flowchart"
                  )}
                  {renderMedia(sec.pdfs, <FileText size={18} />, "PDFs", "pdf")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAB & FORM */}
        <div
          style={styles.fab}
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="fab"
        >
          <Plus style={{ width: "1.75rem", height: "1.75rem" }} />
        </div>

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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  gap: "0.5rem",
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "2.5rem",
                      height: "0.5rem",
                      borderRadius: "9999px",
                      background: step >= i ? "#0d9488" : "#e2e8f0",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
              <h2 style={styles.modalTitle}>
                <Layers />{" "}
                {editMode
                  ? `Edit ${
                      editMode.charAt(0).toUpperCase() + editMode.slice(1)
                    }`
                  : step === 1
                  ? "Select or Add System"
                  : step === 2
                  ? "Select or Add Chapter"
                  : step === 3
                  ? "Add Sections"
                  : "Preview"}
              </h2>

              {/* {step === 1 && (
                <>
                  <select
                    style={styles.select}
                    value={selectedSystemId}
                    onChange={(e) => setSelectedSystemId(e.target.value)}
                  >
                    <option value="">Select Existing System</option>
                    {allIds.map((id) => (
                      <option key={id} value={id}>
                        {byId[id].title}
                      </option>
                    ))}
                  </select>
                  {!selectedSystemId && (
                    <>
                      <select
                        style={styles.select}
                        value={
                          systemNameMode === "select" ? newSystemTitle : "OTHER"
                        }
                        onChange={(e) => {
                          if (e.target.value === "OTHER") {
                            setSystemNameMode("other");
                            setNewSystemTitle("");
                          } else {
                            setSystemNameMode("select");
                            setNewSystemTitle(e.target.value);
                          }
                        }}
                      >
                        <option value="">Select System Name</option>

                        {SYSTEM_NAME_OPTIONS.map((sys) => (
                          <option key={sys} value={sys}>
                            {sys}
                          </option>
                        ))}

                        <option value="OTHER">Other</option>
                      </select>

                      <textarea
                        placeholder="New System Description"
                        value={newSystemDesc}
                        onChange={(e) => setNewSystemDesc(e.target.value)}
                        style={styles.textarea}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSystemImage(e.target.files[0])} // pick the first selected file
                        style={{ ...styles.input, padding: "0.5rem" }}
                      />
                    </>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    style={styles.submitBtn(submitting)}
                  >
                    {submitting ? (
                      <Loader2
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      "Next"
                    )}
                  </button>
                </>
              )} */}

              {step === 1 && (
                <>
                  {/* SYSTEM NAME DROPDOWN */}
                  <select
                    style={styles.select}
                    value={systemNameMode}
                    onChange={(e) => {
                      setSystemNameMode(e.target.value);
                      setNewSystemTitle("");
                    }}
                  >
                    <option value="select">Select Medical System</option>
                    {SYSTEM_NAME_OPTIONS.map((sys) => (
                      <option key={sys} value={sys}>
                        {sys}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>

                  {/* OTHER SYSTEM INPUT — 👈 YEHI AAPKA CODE HAI */}
                  {systemNameMode === "other" && (
                    <input
                      placeholder="Enter custom system name"
                      value={newSystemTitle}
                      onChange={(e) => setNewSystemTitle(e.target.value)}
                      style={styles.input}
                    />
                  )}

                  {/* DESCRIPTION */}
                  <textarea
                    placeholder="System Description"
                    value={newSystemDesc}
                    onChange={(e) => setNewSystemDesc(e.target.value)}
                    style={styles.textarea}
                  />

                  {/* IMAGE */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSystemImage(e.target.files[0])}
                    style={{ ...styles.input, padding: "0.5rem" }}
                  />

                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    style={styles.submitBtn(submitting)}
                  >
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <select
                    style={styles.select}
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    disabled={!finalSystemId}
                  >
                    <option value="">Select Existing Chapter</option>
                    {PREDEFINED_CHAPTERS.map((ch) => (
                      <option key={ch.code} value={ch.title}>
                        [{ch.code}] {ch.title}
                      </option>
                    ))}
                  </select>
                  {/* {!selectedChapterId && (
                    <input
                      placeholder="New Chapter Title"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      style={styles.input}
                    />
                  )} */}
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    style={styles.submitBtn(submitting)}
                  >
                    {submitting ? (
                      <Loader2
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      "Next"
                    )}
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "1rem",
                      background: "#f0fdfa",
                      borderRadius: "0.75rem",
                      border: "1px solid #ccfbf1",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#0f766e",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Section {currentSectionIndex + 1} of{" "}
                      {predefinedSections.length}
                    </p>
                    <p style={{ fontSize: "1.1rem", color: "#1e293b" }}>
                      <strong>{currentSectionTitle}</strong>
                    </p>
                  </div>
                  <textarea
                    placeholder={`Enter content for "${currentSectionTitle}"...`}
                    value={sectionContents[currentSectionTitle] || ""}
                    onChange={(e) =>
                      setSectionContents((prev) => ({
                        ...prev,
                        [currentSectionTitle]: e.target.value,
                      }))
                    }
                    style={styles.textarea}
                  />
                  {["images", "videos", "flowcharts", "pdfs"].map((type) => (
                    <div key={type} style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 600,
                          color: "#0f766e",
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                      <input
                        type="file"
                        multiple
                        accept={
                          type === "images"
                            ? "image/*"
                            : type === "videos"
                            ? "video/*"
                            : "*"
                        }
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setNewFiles((prev) => ({
                            ...prev,
                            [type]: [...prev[type], ...files],
                          }));
                        }}
                        style={{ width: "100%", padding: "0.5rem" }}
                      />
                      {newFiles[type].length > 0 && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#64748b",
                          }}
                        >
                          {newFiles[type].map((f, i) => (
                            <span key={i}>{f.name} </span>
                          ))}
                        </div>
                      )}
                      {existingUrls[type]?.length > 0 && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.8rem",
                            color: "#22c55e",
                          }}
                        >
                          {existingUrls[type].length} existing {type} preserved.
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={saveCurrentSection}
                      style={{ ...styles.submitBtn(false), flex: 1 }}
                    >
                      <Save /> {editMode === "section" ? "Update" : "Save"} &
                      Next
                    </button>
                    <button
                      onClick={skipSection}
                      style={{
                        ...styles.submitBtn(false),
                        background: "#94a3b8",
                        flex: 1,
                      }}
                    >
                      Skip
                    </button>
                  </div>
                  <button
                    onClick={() => setStep(4)}
                    style={{
                      marginTop: "0.5rem",
                      background: "#64748b",
                      width: "100%",
                      padding: "0.875rem",
                      border: "none",
                      borderRadius: "0.75rem",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    <Eye /> Go to Preview
                  </button>
                </>
              )}

              {step === 4 && (
                <>
                  <div
                    style={{
                      maxHeight: "60vh",
                      overflowY: "auto",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {predefinedSections.map((title) => {
                      const content = sectionContents[title];
                      if (!content?.trim()) return null;
                      return (
                        <div
                          key={title}
                          style={{
                            marginBottom: "1.5rem",
                            padding: "1rem",
                            background: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontWeight: 700,
                              color: "#0f766e",
                              marginBottom: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <CheckCircle style={{ color: "#10b981" }} /> {title}
                          </h4>
                          <p
                            style={{ color: "#475569", whiteSpace: "pre-wrap" }}
                          >
                            {content}
                          </p>
                        </div>
                      );
                    })}
                    {Object.keys(sectionContents).length === 0 && (
                      <p
                        style={{
                          textAlign: "center",
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        <AlertCircle style={{ marginRight: "0.5rem" }} /> No
                        sections added yet.
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => setStep(3)}
                      style={{
                        ...styles.submitBtn(false),
                        flex: 1,
                        background: "#64748b",
                      }}
                    >
                      Back to Sections
                    </button>
                    <button
                      onClick={finalSubmit}
                      style={styles.submitBtn(false)}
                    >
                      <CheckCircle /> Final Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReadMode;

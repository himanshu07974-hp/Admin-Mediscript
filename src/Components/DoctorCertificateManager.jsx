// src/components/DoctorCertificateManager.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  clearError, // FIXED: was clearErrors
} from "../redux/slices/doctorCertificateSlice"; // CORRECT PATH
import { Plus, Trash2, X, Edit3, Save, Loader2 } from "lucide-react";

import { useToast } from "../Components/ToastProvider";

const DoctorCertificateManager = () => {
  const dispatch = useDispatch();
  const {
    templates,
    templatesLoading,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,
  } = useSelector((state) => state.doctorCertificate);

  const { success, error: toastError, showConfirm } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bodyTemplate: "",
    fields: [],
  });

  const [newField, setNewField] = useState({
    key: "",
    label: "",
    type: "text",
    required: true,
  });

  useEffect(() => {
    dispatch(fetchCertificateTemplates());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({ name: "", title: "", bodyTemplate: "", fields: [] });
    setNewField({ key: "", label: "", type: "text", required: true });
    setIsEditMode(false);
    setCurrentTemplateId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (template) => {
    setFormData({
      name: template.name,
      title: template.title,
      bodyTemplate: template.bodyTemplate,
      fields: template.fields.map((f) => ({ ...f })),
    });
    setCurrentTemplateId(template._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    if (newField.key && newField.label) {
      setFormData((prev) => ({
        ...prev,
        fields: [...prev.fields, { ...newField }],
      }));
      setNewField({ key: "", label: "", type: "text", required: true });
    }
  };

  const handleRemoveField = (index) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await dispatch(
          updateCertificateTemplate({
            id: currentTemplateId,
            templateData: formData,
          })
        ).unwrap();

        success("Template updated successfully");
      } else {
        await dispatch(createCertificateTemplate(formData)).unwrap();

        success("Template created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      dispatch(fetchCertificateTemplates());
    } catch (err) {
      toastError(err?.message || "Failed to save template");
    }
  };

  const handleDelete = async (id) => {
    const ok = await showConfirm({
      message: "Are you sure you want to delete this template?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!ok) return;

    try {
      await dispatch(deleteCertificateTemplate(id)).unwrap();
      success("Template deleted successfully");
      dispatch(fetchCertificateTemplates());
    } catch (err) {
      toastError(err?.message || "Failed to delete template");
    }
  };

  return (
    <>
      <style>{`
        .dc-container { font-family: 'Segoe UI', sans-serif; background: #f8fafc; min-height: 100vh; padding: 24px; }
        .dc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .dc-title { font-size: 28px; font-weight: 700; color: #1e293b; }
        .dc-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #3b82f6; color: white; padding: 10px 16px; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; transition: 0.2s; }
        .dc-btn-primary:hover { background: #2563eb; }
        .dc-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
        .dc-table { width: 100%; border-collapse: collapse; }
        .dc-table th { background: #f1f5f9; padding: 14px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .dc-table td { padding: 14px 16px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #475569; }
        .dc-table tr:hover { background: #f8fafc; }
        .dc-badge { display: inline-block; background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .dc-required { color: #ef4444; margin-left: 2px; }
        .dc-actions { display: flex; gap: 8px; }
        .dc-btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; }
        .dc-btn-edit { color: #3b82f6; }
        .dc-btn-edit:hover { background: #dbeafe; }
        .dc-btn-delete { color: #ef4444; }
        .dc-btn-delete:hover { background: #fee2e2; }
        .dc-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
        .dc-modal { background: white; border-radius: 12px; width: 100%; max-width: 800px; max-height: 95vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .dc-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
        .dc-modal-title { font-size: 20px; font-weight: 600; color: #1e293b; }
        .dc-modal-close { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; }
        .dc-modal-close:hover { background: #f1f5f9; }
        .dc-modal-body { padding: 24px; }
        .dc-form-group { margin-bottom: 20px; }
        .dc-label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
        .dc-input, .dc-textarea, .dc-select { width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 14px; transition: 0.2s; }
        .dc-input:focus, .dc-textarea:focus, .dc-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .dc-textarea { min-height: 100px; resize: vertical; font-family: 'Courier New', monospace; font-size: 13px; }
        .dc-field-grid { display: grid; grid-template-columns: 2fr 3fr 1.5fr 1fr 1fr; gap: 8px; align-items: center; margin-bottom: 12px; }
        .dc-field-item { display: flex; align-items: center; gap: 8px; background: white; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; }
        .dc-field-code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-weight: 600; color: #1e40af; }
        .dc-btn-small { padding: 6px 10px; font-size: 12px; border-radius: 6px; cursor: pointer; }
        .dc-btn-add { background: #10b981; color: white; border: none; }
        .dc-btn-add:hover { background: #059669; }
        .dc-error { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
        .dc-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
        .dc-btn-secondary { padding: 10px 16px; background: white; border: 1.5px solid #cbd5e1; color: #475569; border-radius: 8px; font-weight: 500; cursor: pointer; }
        .dc-btn-secondary:hover { background: #f1f5f9; }
        .dc-btn-submit { padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .dc-btn-submit:disabled { background: #93c5fd; cursor: not-allowed; }
        .dc-empty, .dc-loading { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 16px; }
        .dc-hint { font-size: 12px; color: #64748b; margin-top: 4px; }
        @media (max-width: 768px) { .dc-field-grid { grid-template-columns: 1fr; } .dc-header { flex-direction: column; gap: 16px; } }
      `}</style>

      <div className="dc-container">
        <div className="dc-header">
          <h1 className="dc-title">Doctor Certificate Templates</h1>
          <button onClick={openCreateModal} className="dc-btn-primary">
            <Plus size={18} /> Add New Template
          </button>
        </div>

        <div className="dc-card">
          {templatesLoading ? (
            <div className="dc-loading">
              <Loader2 className="animate-spin inline-block mr-2" size={20} />
              Loading...
            </div>
          ) : templates.length === 0 ? (
            <div className="dc-empty">No templates found.</div>
          ) : (
            <table className="dc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Fields</th>
                  <th>Body Preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template._id}>
                    <td>
                      <strong>{template.name}</strong>
                    </td>
                    <td>{template.title}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        {template.fields.map((f, i) => (
                          <span key={i} className="dc-badge">
                            {f.label} ({f.key})
                            {f.required && (
                              <span className="dc-required">*</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td
                      style={{
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {template.bodyTemplate}
                    </td>
                    <td>
                      <div className="dc-actions">
                        <button
                          onClick={() => openEditModal(template)}
                          className="dc-btn-icon dc-btn-edit"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="dc-btn-icon dc-btn-delete"
                          title="Delete"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isModalOpen && (
          <div
            className="dc-modal-overlay"
            onClick={(e) =>
              e.target === e.currentTarget && setIsModalOpen(false)
            }
          >
            <div className="dc-modal">
              <div className="dc-modal-header">
                <h2 className="dc-modal-title">
                  {isEditMode ? "Edit" : "Create"} Template
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                    dispatch(clearError()); // FIXED
                  }}
                  className="dc-modal-close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="dc-modal-body">
                {(createError || updateError || deleteError) && (
                  <div className="dc-error">
                    {createError || updateError || deleteError}
                  </div>
                )}

                <div className="dc-form-group">
                  <label className="dc-label">
                    Name <span className="dc-required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="dc-input"
                    placeholder="general_fitness"
                  />
                </div>

                <div className="dc-form-group">
                  <label className="dc-label">
                    Title <span className="dc-required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="dc-input"
                    placeholder="MEDICAL FITNESS CERTIFICATE"
                  />
                </div>

                <div className="dc-form-group">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <label className="dc-label">Fields</label>
                    <span className="dc-hint">Use {"{{key}}"}</span>
                  </div>
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div className="dc-field-grid">
                      <input
                        type="text"
                        placeholder="Key"
                        value={newField.key}
                        onChange={(e) =>
                          setNewField({ ...newField, key: e.target.value })
                        }
                        className="dc-input"
                        style={{ fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={newField.label}
                        onChange={(e) =>
                          setNewField({ ...newField, label: e.target.value })
                        }
                        className="dc-input"
                        style={{ fontSize: "13px" }}
                      />
                      <select
                        value={newField.type}
                        onChange={(e) =>
                          setNewField({ ...newField, type: e.target.value })
                        }
                        className="dc-select"
                        style={{ fontSize: "13px" }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={newField.required}
                          onChange={(e) =>
                            setNewField({
                              ...newField,
                              required: e.target.checked,
                            })
                          }
                          style={{ width: "16px", height: "16px" }}
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        onClick={handleAddField}
                        className="dc-btn-small dc-btn-add"
                      >
                        Add
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {formData.fields.map((field, i) => (
                        <div key={i} className="dc-field-item">
                          <code className="dc-field-code">
                            {"{{" + field.key + "}}"}
                          </code>
                          <span style={{ flex: 1 }}>
                            {field.label} ({field.type})
                            {field.required && (
                              <span className="dc-required">*</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(i)}
                            className="dc-btn-delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {formData.fields.length === 0 && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            fontStyle: "italic",
                          }}
                        >
                          No fields
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dc-form-group">
                  <label className="dc-label">
                    Body Template <span className="dc-required">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.bodyTemplate}
                    onChange={(e) =>
                      setFormData({ ...formData, bodyTemplate: e.target.value })
                    }
                    className="dc-textarea"
                    placeholder="This is to certify that {{name}}..."
                  />
                  <p className="dc-hint">
                    Use{" "}
                    <code
                      style={{
                        background: "#f1f5f9",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {"{{key}}"}
                    </code>
                  </p>
                </div>
              </form>

              <div className="dc-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="dc-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || updateLoading}
                  className="dc-btn-submit"
                  onClick={handleSubmit}
                >
                  {createLoading || updateLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} />
                      {isEditMode ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorCertificateManager;

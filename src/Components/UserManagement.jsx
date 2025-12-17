// src/pages/UserManagement.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUserMd,
  FaFilePdf,
  FaSearch,
  FaEllipsisV,
  FaTrash,
  FaBan,
  FaCheckCircle,
} from "react-icons/fa";
import {
  fetchUsersByRole,
  fetchMergedPdf,
  deleteUser,
  clearError,
  searchUsers,
  suspendUser,
  resetSuspendState,
  reactivateUser,
} from "../redux/slices/usersSlice";

import { useToast } from "../Components/ToastProvider"; // adjust path if needed
import { toast } from "react-toastify/unstyled";

// --- add this helper component near top of file ---
function ActionMenu({
  onViewPdf,
  onDelete,
  onSuspend,
  onReactivate,
  isSuspended,
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        title="Actions"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 6,
          border: "1px solid rgba(0,0,0,0.06)",
          background: "#fff",
          cursor: "pointer",
          padding: 6,
        }}
      >
        <FaEllipsisV />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            minWidth: 160,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(2,6,23,0.12)",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onViewPdf();
            }}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              width: "100%",
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <FaFilePdf /> View PDF
          </button>

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              width: "100%",
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
              color: "#ef4444",
            }}
          >
            <FaTrash /> Delete
          </button>
          {isSuspended ? (
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onReactivate();
              }}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                color: "#10b981",
              }}
            >
              <FaCheckCircle />
              Reactivate
            </button>
          ) : (
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSuspend();
              }}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                color: "#f59e0b",
              }}
            >
              <FaBan />
              Suspend
            </button>
          )}
        </div>
      )}
    </div>
  );
}
// --- end ActionMenu ---

function UserManagement() {
  const dispatch = useDispatch();
  const {
    doctors,
    students,
    pdfUrls,
    loading,
    pdfLoading,
    error,
    suspendLoading,
    suspendSuccess,
    suspendError,
  } = useSelector((state) => state.users);
  const [activeTab, setActiveTab] = useState("doctors");
  const [searchName, setSearchName] = useState("");

  // Local optimistic copies
  const [localDoctors, setLocalDoctors] = useState([]);
  const [localStudents, setLocalStudents] = useState([]);

  // Pagination
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // toasts
  const { success: toastSuccess, error: toastError, showConfirm } = useToast();

  // Sync locals with redux
  useEffect(() => {
    setLocalDoctors(Array.isArray(doctors) ? doctors : []);
  }, [doctors]);

  useEffect(() => {
    setLocalStudents(Array.isArray(students) ? students : []);
  }, [students]);

  // fetch on tab change or when search cleared
  useEffect(() => {
    const role = activeTab === "doctors" ? "doctor" : "student";
    if (!searchName.trim()) {
      dispatch(fetchUsersByRole(role));
    }
    setCurrentPage(1);
  }, [dispatch, activeTab, searchName]);

  const handleSearch = () => {
    if (searchName.trim()) {
      dispatch(searchUsers({ name: searchName }));
    } else {
      const role = activeTab === "doctors" ? "doctor" : "student";
      dispatch(fetchUsersByRole(role));
    }
    setCurrentPage(1);
  };

  const handleSuspend = async (userId) => {
    const action = await dispatch(suspendUser(userId));

    if (suspendUser.fulfilled.match(action)) {
      toastSuccess("User suspended successfully");

      // 🔄 AUTO-REFRESH LIST
      const role = activeTab === "doctors" ? "doctor" : "student";
      dispatch(fetchUsersByRole(role));

      dispatch(resetSuspendState());
    } else {
      toastError(action.payload || "Failed to suspend user");
    }
  };

  const handleReactivate = async (userId) => {
    const action = await dispatch(reactivateUser(userId));

    if (reactivateUser.fulfilled.match(action)) {
      toastSuccess("User reactivated successfully");

      // refresh list (recommended)
      dispatch(
        fetchUsersByRole(activeTab === "doctors" ? "doctor" : "student")
      );
    } else {
      toastError(action.payload || "Failed to reactivate user");
    }
  };

  const handleViewPdf = (userId, role) => {
    if (pdfUrls[userId]) {
      window.open(pdfUrls[userId], "_blank");
    } else {
      dispatch(fetchMergedPdf({ userId, role })).then((action) => {
        if (fetchMergedPdf.fulfilled.match(action)) {
          window.open(action.payload.pdfUrl, "_blank");
        } else {
          toastError("Failed to load PDF");
        }
      });
    }
  };

  // optimistic remove
  const removeFromLocal = (userId, role) => {
    if (role === "doctor") {
      setLocalDoctors((prev) => prev.filter((u) => (u.id || u._id) !== userId));
    } else {
      setLocalStudents((prev) =>
        prev.filter((u) => (u.id || u._id) !== userId)
      );
    }
  };

  // delete with toast confirm
  // const handleDeleteUser = async (userId, role) => {
  //   try {
  //     const confirmed = await showConfirm({
  //       message: "Are you sure you want to permanently delete this user?",
  //       confirmText: "Delete",
  //       cancelText: "Cancel",
  //     });
  //     if (!confirmed) return;

  //     // optimistic UI removal
  //     removeFromLocal(userId, role);

  //     const action = await dispatch(deleteUser({ userId, role }));
  //     const isFulfilled =
  //       deleteUser.fulfilled.match(action) ||
  //       action.meta?.requestStatus === "fulfilled";

  //     if (isFulfilled) {
  //       // toast.done("User deleted successfully");
  //       // toastSuccess("User deleted successfully");

  //       // refresh list from server — best effort
  //       // We await the fetch but we will NOT set global `error` on fetch failure
  //       // (see slice change above)
  //       await dispatch(
  //         fetchUsersByRole(activeTab === "doctors" ? "doctor" : "student")
  //       );
  //       setCurrentPage((prev) => Math.max(1, prev));
  //     } else {
  //       // const errMsg =
  //       //   action.payload || action.error?.message || "Failed to delete user";
  //       // // toastError(errMsg);

  //       // revert optimistic removal by refetching server list
  //       await dispatch(
  //         fetchUsersByRole(activeTab === "doctors" ? "doctor" : "student")
  //       );
  //     }
  //   } catch (err) {
  //     toastError("Something went wrong. Try again.");
  //     await dispatch(
  //       fetchUsersByRole(activeTab === "doctors" ? "doctor" : "student")
  //     );
  //   }
  // };

  const handleDeleteUser = async (userId, role) => {
    try {
      const confirmed = await showConfirm({
        message: "Are you sure you want to permanently delete this user?",
        confirmText: "Delete",
        cancelText: "Cancel",
      });
      if (!confirmed) return;

      // optimistic UI removal
      removeFromLocal(userId, role);

      // call delete thunk
      const action = await dispatch(deleteUser({ userId, role }));

      // DEBUG: inspect action to see status & payload/error in console
      // remove this line when satisfied
      console.debug("deleteUser action:", action);

      const isFulfilled =
        deleteUser.fulfilled.match(action) ||
        action.meta?.requestStatus === "fulfilled";

      console.log("full", isFulfilled);

      const currentRole = activeTab === "doctors" ? "doctor" : "student";

      if (isFulfilled) {
        // show success BEFORE attempting refresh so user sees correct feedback
        toastSuccess("User deleted successfully");

        // best-effort refresh — don't allow failure here to set global error/toast
        try {
          await dispatch(fetchUsersByRole(currentRole));
        } catch (e) {
          // swallow/handle refresh failure locally (optional: log)
          console.warn("refresh after delete failed (ignored):", e);
          // optionally show an informational toast (NOT an error):
          // toastError("Deleted but failed to refresh list. Please reload.");
        }

        setCurrentPage((prev) => Math.max(1, prev));
      } else {
        // delete thunk rejected
        const errMsg =
          action.payload || action.error?.message || "Failed to delete user";
        toastError(errMsg);

        // revert optimistic removal by refetching (best effort)
        try {
          await dispatch(fetchUsersByRole(currentRole));
        } catch (e) {
          // swallow so we don't override the error toast above
          console.warn("failed to refresh list after delete failure:", e);
        }
      }
    } catch (err) {
      // unexpected errors (e.g., showConfirm threw)
      toastError("Something went wrong. Try again.");
      const currentRole = activeTab === "doctors" ? "doctor" : "student";
      try {
        await dispatch(fetchUsersByRole(currentRole));
      } catch (_) {
        // ignore
      }
    }
  };

  useEffect(() => {
    return () => {
      Object.values(pdfUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pdfUrls]);

  // pick list
  const fullList = useMemo(
    () => (activeTab === "doctors" ? localDoctors : localStudents),
    [activeTab, localDoctors, localStudents]
  );

  const safeList = Array.isArray(fullList) ? fullList : [];
  const totalPages = Math.max(1, Math.ceil(safeList.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return safeList.slice(start, start + ITEMS_PER_PAGE);
  }, [safeList, currentPage]);

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
  };

  // simple renderPageButtons same as before (kept concise)
  const renderPageButtons = () => {
    const buttons = [];
    const MAX_VISIBLE = 7;
    let start = 1;
    let end = totalPages;

    if (totalPages > MAX_VISIBLE) {
      const middle = Math.floor(MAX_VISIBLE / 2);
      start = Math.max(1, currentPage - middle);
      end = start + MAX_VISIBLE - 1;
      if (end > totalPages) {
        end = totalPages;
        start = end - MAX_VISIBLE + 1;
      }
    }

    for (let p = start; p <= end; p++) {
      buttons.push(
        <button
          key={p}
          onClick={() => goToPage(p)}
          style={{
            padding: "0.35rem 0.6rem",
            borderRadius: "0.35rem",
            border: "1px solid #d1d5db",
            background: p === currentPage ? "#186476" : "#fff",
            color: p === currentPage ? "#fff" : "#000",
            cursor: "pointer",
          }}
          aria-current={p === currentPage}
        >
          {p}
        </button>
      );
    }

    if (start > 1) {
      buttons.unshift(<span key="start-ellipsis">...</span>);
      buttons.unshift(
        <button key={1} onClick={() => goToPage(1)}>
          1
        </button>
      );
    }

    if (end < totalPages) {
      buttons.push(<span key="end-ellipsis">...</span>);
      buttons.push(
        <button key={totalPages} onClick={() => goToPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const styles = {
    container: { padding: 16, background: "#E0F2FE", color: "#1E293B" },
    headerContainer: {
      background: "#fff",
      padding: 12,
      borderRadius: 8,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    tableContainer: {
      background: "#fff",
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
      boxShadow: "0 8px 24px rgba(2,6,23,0.08)",
      overflowX: "auto",
    },
    button: {
      padding: "0.5rem 1rem",
      borderRadius: 6,
      color: "#fff",
      border: "none",
      cursor: "pointer",
    },
    actionContainer: { display: "flex", gap: 8 },
    th: {
      padding: "12px 10px",
      textAlign: "left",
      borderBottom: "1px solid #e5e7eb",
      background: "#f8fafc",
      fontSize: 13,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#475569",
    },

    td: { padding: 10, borderBottom: "1px solid #e5e7eb" },
  };

  const getStatusBadgeStyle = (status) => ({
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background:
      status === "active"
        ? "#dcfce7"
        : status === "pending"
        ? "#fef3c7"
        : "#fee2e2",
    color:
      status === "active"
        ? "#166534"
        : status === "pending"
        ? "#92400e"
        : "#991b1b",
  });

  const getId = (item) => item.id || item._id;
  const tabStyle = (active) => ({
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid #186476",
    background: active ? "#186476" : "#fff",
    color: active ? "#fff" : "#186476",
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div style={styles.container}>
      {/* <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search users by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            width: 300,
          }}
        />
        <button
          onClick={handleSearch}
          style={{ ...styles.button, background: "#186476", marginLeft: 8 }}
        >
          <FaSearch style={{ marginRight: 6 }} /> Search
        </button>
      </div> */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Search users by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              width: 260,
              fontSize: 14,
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: "#186476",
              color: "#fff",
              borderRadius: 8,
              padding: "0 14px",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
            }}
          >
            <FaSearch /> Search
          </button>
        </div>
      </div>

      <div style={styles.headerContainer}>
        <h2 style={{ margin: 0 }}>
          <FaUserMd style={{ marginRight: 8 }} /> User Management
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {/* <button
            onClick={() => setActiveTab("doctors")}
            style={{
              ...styles.button,
              background: activeTab === "doctors" ? "#186476" : "#6c757d",
            }}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab("students")}
            style={{
              ...styles.button,
              background: activeTab === "students" ? "#186476" : "#6c757d",
            }}
          >
            Students
          </button> */}

          <button
            onClick={() => setActiveTab("doctors")}
            style={tabStyle(activeTab === "doctors")}
          >
            Doctors
          </button>

          <button
            onClick={() => setActiveTab("students")}
            style={tabStyle(activeTab === "students")}
          >
            Students
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: "red" }}>Error: {error}</div>
          <button
            onClick={() => dispatch(clearError())}
            style={{ marginTop: 8, padding: 8, borderRadius: 6 }}
          >
            Clear Error
          </button>
        </div>
      )}

      <div style={styles.tableContainer}>
        <h3 style={{ marginTop: 0 }}>
          {activeTab === "doctors" ? "Doctors" : "Medical Students"}
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{ transition: "background 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  {activeTab === "students" && <th style={styles.th}>Phone</th>}
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Plan</th>
                  <th style={styles.th}>Plan Status</th>
                  <th style={styles.th}>End Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedList.map((u) => {
                  const uid = getId(u);
                  return (
                    <tr key={uid}>
                      <td style={styles.td}>{u.name || "N/A"}</td>
                      <td style={styles.td}>{u.email || "N/A"}</td>

                      {activeTab === "students" && (
                        <td style={styles.td}>{u.phone || "N/A"}</td>
                      )}

                      <td style={styles.td}>
                        <span style={getStatusBadgeStyle(u.status)}>
                          {u.status || "pending"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {u.subscription?.planId || u.plan || "No Plan"}
                      </td>

                      <td style={styles.td}>
                        {u.subscription?.status || u.planStatus || "none"}
                      </td>

                      <td style={styles.td}>
                        {u.subscription?.endDate
                          ? new Date(
                              u.subscription.endDate
                            ).toLocaleDateString()
                          : u.endDate
                          ? new Date(u.endDate).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actionContainer}>
                          <ActionMenu
                            onViewPdf={() =>
                              handleViewPdf(
                                uid,
                                activeTab === "doctors" ? "doctor" : "student"
                              )
                            }
                            onReactivate={() => handleReactivate(uid)}
                            onSuspend={() => handleSuspend(uid)}
                            onDelete={() =>
                              handleDeleteUser(
                                uid,
                                activeTab === "doctors" ? "doctor" : "student"
                              )
                            }
                            isSuspended={u.status === "suspended"}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* pagination */}

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.9rem",
                color: "#334155",
              }}
            >
              {/* Left: Showing info */}
              <div>
                Showing{" "}
                <strong>
                  {safeList.length === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </strong>
                –
                <strong>
                  {Math.min(currentPage * ITEMS_PER_PAGE, safeList.length)}
                </strong>{" "}
                of <strong>{safeList.length}</strong>
              </div>

              {/* Right: Controls */}
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: currentPage === 1 ? "#9CA3AF" : "#186476",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Prev
                </button>

                {renderPageButtons()}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background:
                      currentPage === totalPages ? "#9CA3AF" : "#186476",
                    color: "#fff",
                    fontWeight: "600",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserManagement;

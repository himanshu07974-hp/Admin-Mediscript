import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "../Components/ToastProvider";
import { FaUsers, FaUserMd, FaUserGraduate } from "react-icons/fa";
import RolesSelector from "./RolesSelector";
import { Mail, Smartphone } from "lucide-react";
import {
  FaCreditCard,
  FaTable,
  FaBell,
  FaSyncAlt,
  FaSearch,
} from "react-icons/fa";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  fetchTransactions,
  sendReminder,
  fetchExpiryUsers,
  fetchReminders,
  clearError,
} from "../redux/slices/subscriptionSlice";

import { FaEllipsisV, FaEdit } from "react-icons/fa";

function SubscriptionBilling() {
  const dispatch = useDispatch();

  const {
    success: toastSuccess,
    error: toastError,
    info: toastInfo,
  } = useToast();

  const [planFilter, setPlanFilter] = useState("all");

  const baseInputStyle = {
    padding: "0.9rem",
    borderRadius: "0.7rem",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    width: "100%", // Ensures full width within its flex container
    boxSizing: "border-box", // Important for padding/border calculation
    minHeight: "48px", // Better touch target
  };

  const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 200px", // Allows a base width of 200px and enables wrapping/flexing
    minWidth: "200px", // Ensures it doesn't get too narrow
  };

  const visibleToGroupStyle = {
    ...inputGroupStyle,
    flex: "1 1 200px",
  };

  const labelStyle = {
    fontSize: "0.875rem", // Smaller, distinct label
    fontWeight: "500",
    color: "#475569", // Subdued color
    marginBottom: "0.4rem",
  };

  const inputStyle = {
    ...baseInputStyle,
  };

  const multipleSelectStyle = {
    ...baseInputStyle,
    height: "120px",
    cursor: "pointer",
    background: "#fff",
  };

  const buttonStyle = {
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.4rem",
    borderRadius: "0.7rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    minWidth: "130px",
    transition: "background 0.2s ease-in-out",
  };

  // Redux state
  const subscriptionState = useSelector((state) => state.subscriptions);
  const {
    plans = [],
    planLoading,
    planError,
    transactions = { data: [], total: 0, page: 1, limit: 15 },
    transactionsLoading,
    transactionsError,
    expiryUsers = { data: [], total: 0, page: 1, limit: 15 },
    expiryUsersLoading,
    expiryUsersError,
    reminders = { data: [], count: 0 },
    remindersLoading,
    remindersError,
    loading: generalLoading,
    error: generalError,
  } = subscriptionState;

  // UI state
  const [activeTab, setActiveTab] = useState("plans");
  const [selectedUserForReminder, setSelectedUserForReminder] = useState(null);
  const [sendResult, setSendResult] = useState("");
  const [createFormVisible, setCreateFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  // const [newPlan, setNewPlan] = useState({
  //   name: "",
  //   price: "",
  //   interval: "month",
  //   visibleTo: ["doctor"],
  // });

  const [newPlan, setNewPlan] = useState({
    name: "",
    title: "",
    tagline: "",
    features: [],
    buttonText: "",
    badge: "",
    price: "",
    interval: "month",
    visibleTo: ["doctor"],
  });

  const [updatedPlan, setUpdatedPlan] = useState({
    name: "",
    title: "",
    tagline: "",
    features: [],
    buttonText: "",
    badge: "",
    price: "",
    interval: "month",
    visibleTo: ["doctor"],
  });

  const [createResult, setCreateResult] = useState("");

  const PAGE_LIMIT = 15; // show 15 items per page as requested

  const [openMenu, setOpenMenu] = useState(null);

  // pagination states for each tab
  const [plansPage, setPlansPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [expiryPage, setExpiryPage] = useState(1);
  const [remindersPage, setRemindersPage] = useState(1);

  const [transactionsLimit] = useState(PAGE_LIMIT);
  const [expiryDaysFilter, setExpiryDaysFilter] = useState(30);

  // New: search state (search by name OR id)
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data on component mount (use page limits)
  // initial load (no transactions here)
  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(
      fetchExpiryUsers({
        days: expiryDaysFilter,
        page: expiryPage,
        limit: PAGE_LIMIT,
        role: "doctor",
      })
    );
    dispatch(fetchReminders());
  }, [dispatch]);

  // transactions pagination
  useEffect(() => {
    dispatch(
      fetchTransactions({
        page: transactionsPage,
        limit: PAGE_LIMIT,
        status: "success",
        sort: "amount",
      })
    );
  }, [dispatch, transactionsPage]);

  // fetch expiry users whenever expiryPage or expiryDaysFilter changes
  useEffect(() => {
    dispatch(
      fetchExpiryUsers({
        days: expiryDaysFilter,
        page: expiryPage,
        limit: PAGE_LIMIT,
        role: "doctor",
      })
    );
  }, [dispatch, expiryPage, expiryDaysFilter]);

  // reset pages when searchQuery changes
  useEffect(() => {
    setPlansPage(1);
    setTransactionsPage(1);
    setExpiryPage(1);
    setRemindersPage(1);
  }, [searchQuery]);

  // Auto-clear create result after 3 seconds
  useEffect(() => {
    if (createResult) {
      const timer = setTimeout(() => setCreateResult(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [createResult]);

  // Auto-clear send result after 3 seconds
  useEffect(() => {
    if (sendResult) {
      const timer = setTimeout(() => setSendResult(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [sendResult]);

  // Safely filter plans with fallback
  const doctorPlans = Array.isArray(plans)
    ? plans.filter((plan) => plan?.visibleTo?.includes("doctor"))
    : [];
  const studentPlans = Array.isArray(plans)
    ? plans.filter((plan) => plan?.visibleTo?.includes("student"))
    : [];

  // Helper search matcher (searches in id and name fields)
  const matchesQuery = (target = "", q = "") => {
    if (!q) return true;
    const s = q.toString().trim().toLowerCase();
    if (!s) return true;
    return target?.toString().toLowerCase().includes(s);
  };

  // Derived filtered lists depending on activeTab and searchQuery
  const filteredPlans = useMemo(() => {
    let result = plans;

    if (planFilter !== "all") {
      result = result.filter((plan) => plan.visibleTo?.includes(planFilter));
    }

    if (!searchQuery) return result;

    return result.filter((plan) => {
      const id = plan._id || "";
      const name = plan.name || plan.title || "";
      return matchesQuery(id, searchQuery) || matchesQuery(name, searchQuery);
    });
  }, [plans, searchQuery, planFilter]);

  const filteredTransactions = useMemo(() => {
    // if searchQuery provided, filter client-side on currently loaded transactions page(s)
    if (!searchQuery) return transactions.data || [];
    return (transactions.data || []).filter((tx) => {
      const id = tx.id || tx._id || "";
      const userName = tx.userName || tx.user?.name || "";
      return (
        matchesQuery(id, searchQuery) || matchesQuery(userName, searchQuery)
      );
    });
  }, [transactions, searchQuery]);

  const filteredExpiryUsers = useMemo(() => {
    if (!searchQuery) return expiryUsers.data || [];
    return (expiryUsers.data || []).filter((u) => {
      const id = u.id || u._id || "";
      const name = u.name || "";
      return matchesQuery(id, searchQuery) || matchesQuery(name, searchQuery);
    });
  }, [expiryUsers, searchQuery]);

  const filteredReminders = useMemo(() => {
    if (!searchQuery) return reminders.data || [];
    return (reminders.data || []).filter((r) => {
      const id = r._id || r.id || "";
      const userName = r.userName || r.user?.name || "";
      return (
        matchesQuery(id, searchQuery) || matchesQuery(userName, searchQuery)
      );
    });
  }, [reminders, searchQuery]);

  // Pagination helpers for client-side paginated lists (plans, reminders)
  const paginate = (items = [], page = 1) => {
    const start = (page - 1) * PAGE_LIMIT;
    return items.slice(start, start + PAGE_LIMIT);
  };

  const totalPagesFor = (itemsLength) =>
    Math.max(1, Math.ceil(itemsLength / PAGE_LIMIT));

  // For plans (client-side pagination)
  const paginatedPlans = useMemo(
    () => paginate(filteredPlans, plansPage),
    [filteredPlans, plansPage]
  );
  const plansTotalPages = totalPagesFor(filteredPlans.length);

  // For reminders (client-side pagination)
  const paginatedReminders = useMemo(
    () => paginate(filteredReminders, remindersPage),
    [filteredReminders, remindersPage]
  );
  const remindersTotalPages = totalPagesFor(filteredReminders.length);

  // For transactions and expiry, if searchQuery exists we paginate client-side filtered arrays, else we rely on server-side pages
  const transactionsTotalPages = searchQuery
    ? totalPagesFor((transactions.data || []).length) // only paginating the currently loaded chunk when searching
    : Math.max(1, Math.ceil((transactions.total || 0) / PAGE_LIMIT));

  const expiryTotalPages = searchQuery
    ? totalPagesFor((expiryUsers.data || []).length)
    : Math.max(1, Math.ceil((expiryUsers.total || 0) / PAGE_LIMIT));

  // when search active, show client-side sliced lists for transactions/expiry
  const paginatedTransactions = useMemo(() => {
    if (!searchQuery) return transactions.data || [];
    return paginate(filteredTransactions, transactionsPage);
  }, [transactions.data, filteredTransactions, searchQuery, transactionsPage]);

  const paginatedExpiryUsers = useMemo(() => {
    if (!searchQuery) return expiryUsers.data || [];
    return paginate(filteredExpiryUsers, expiryPage);
  }, [expiryUsers.data, filteredExpiryUsers, searchQuery, expiryPage]);

  const handleSendReminder = async () => {
    if (!selectedUserForReminder) {
      setSendResult("Please select a user first.");
      return;
    }

    try {
      const result = await dispatch(
        sendReminder({ userId: selectedUserForReminder.id })
      ).unwrap();
      setSendResult(
        `Reminder sent successfully to ${result.user?.name || "user"}!`
      );
      setSelectedUserForReminder(null);
      // refresh expiry list
      dispatch(
        fetchExpiryUsers({
          days: expiryDaysFilter,
          page: expiryPage,
          limit: PAGE_LIMIT,
          role: "doctor",
        })
      );
      dispatch(fetchReminders());
    } catch (err) {
      setSendResult("Failed to send reminder.");
    }
  };

  const handleCreatePlan = async () => {
    if (
      !newPlan.name ||
      !newPlan.title ||
      !newPlan.price ||
      !newPlan.interval ||
      !newPlan.visibleTo?.length
    ) {
      setCreateResult("Please fill in all fields, including visibleTo.");
      toastError("Please fill in all fields, including visibleTo.");
      return;
    }

    try {
      await dispatch(
        createPlan({
          name: newPlan.name,
          title: newPlan.title,
          tagline: newPlan.tagline,
          features: newPlan.features,
          buttonText: newPlan.buttonText,
          badge: newPlan.badge,
          price: Number(newPlan.price),
          interval: newPlan.interval,
          visibleTo: newPlan.visibleTo,
        })
      ).unwrap();

      // ✅ SUCCESS
      const successMsg = `Plan "${newPlan.name}" created successfully!`;
      setCreateResult(successMsg);
      toastSuccess(successMsg);

      setNewPlan({
        name: "",
        title: "",
        tagline: "",
        features: [],
        buttonText: "",
        badge: "",
        price: "",
        interval: "month",
        visibleTo: ["doctor"],
      });

      setCreateFormVisible(false);
      dispatch(fetchPlans()); // refresh list
    } catch (err) {
      // ❌ ERROR
      const msg = err || "Failed to create plan";
      setCreateResult(msg);
      toastError(msg);
      console.error("Create plan error:", err);
    }
  };

  const handleUpdatePlan = async (planId) => {
    if (
      !updatedPlan.name ||
      !updatedPlan.price ||
      !updatedPlan.interval ||
      !updatedPlan.visibleTo?.length
    ) {
      const msg = "Please fill in all required fields.";
      setCreateResult(msg);
      toastError(msg);
      return;
    }

    try {
      await dispatch(
        updatePlan({
          planId,
          planData: {
            name: updatedPlan.name,
            title: updatedPlan.title,
            tagline: updatedPlan.tagline,
            features: updatedPlan.features,
            buttonText: updatedPlan.buttonText,
            badge: updatedPlan.badge,
            price: Number(updatedPlan.price),
            interval: updatedPlan.interval,
            visibleTo: updatedPlan.visibleTo,
          },
        })
      ).unwrap();

      // ✅ SUCCESS
      const successMsg = `Plan "${updatedPlan.name}" updated successfully!`;
      setCreateResult(successMsg);
      toastSuccess(successMsg);

      setUpdatedPlan({
        name: "",
        title: "",
        tagline: "",
        features: [],
        buttonText: "",
        badge: "",
        price: "",
        interval: "month",
        visibleTo: ["doctor"],
      });

      setEditFormVisible(false);
      setEditingPlan(null);
      dispatch(fetchPlans());
    } catch (err) {
      // ❌ ERROR
      const msg = err || "Failed to update plan";
      setCreateResult(msg);
      toastError(msg);
      console.error("Update plan error:", err);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setUpdatedPlan({
      name: plan.name,
      title: plan.title || "",
      tagline: plan.tagline || "",
      features: plan.features || [],
      buttonText: plan.buttonText || "",
      badge: plan.badge || "",
      price: plan.price || "",
      interval: plan.interval || "month",
      visibleTo: plan.visibleTo || ["doctor"],
    });
    setEditFormVisible(true);
    setCreateFormVisible(false);
  };

  const handleLoadMoreTransactions = () => {
    // legacy button; now we have proper paging controls
    setTransactionsPage((p) => Math.min(p + 1, transactionsTotalPages));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#10B981";
      case "failed":
        return "#EF4444";
      case "pending":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Success";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles = {
    planFilterBar: {
      display: "flex",
      gap: "0.5rem",
      background: "#f1f5f9",
      padding: "0.35rem",
      borderRadius: "999px",
    },

    planFilterBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
      padding: "0.45rem 1.1rem",
      borderRadius: "999px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.85rem",
      color: "#334155",
      transition: "all 0.25s ease",
    },

    planFilterActive: {
      background: "#ffffff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },

    doctorActive: {
      background: "linear-gradient(135deg,#2563EB,#3B82F6)",
      color: "#ffffff",
    },

    studentActive: {
      background: "linear-gradient(135deg,#F59E0B,#FBBF24)",
      color: "#ffffff",
    },

    container: {
      padding: "2.5rem",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8f1f5, #ffffff)",
      fontFamily: "'Inter', sans-serif",
      maxWidth: "1500px",
      margin: "0 auto",
    },

    header: {
      color: "#0f3d52",
      fontSize: "2.4rem",
      fontWeight: "800",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "2.4rem",
      letterSpacing: "-0.5px",
    },

    /* TABS */
    tabContainer: {
      background: "rgba(255,255,255,0.7)",
      padding: "1rem",
      borderRadius: "1rem",
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      display: "flex",
      gap: "1rem",
      backdropFilter: "blur(8px)",
      marginBottom: "2rem",
      justifyContent: "space-between",
      alignItems: "center",
    },

    activeButton: {
      padding: "0.7rem 1.6rem",
      background: "linear-gradient(135deg,#0f4c75,#3282b8)",
      color: "#fff",
      borderRadius: "0.7rem",
      border: "none",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
      transform: "translateY(-1px)",
    },

    inactiveButton: {
      padding: "0.7rem 1.6rem",
      background: "#d9e6ef",
      color: "#0f4c75",
      borderRadius: "0.7rem",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
      transition: "0.2s",
    },

    searchBox: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },

    searchInput: {
      padding: "0.6rem 0.8rem",
      borderRadius: "0.6rem",
      border: "1px solid #cbd5e1",
      minWidth: "260px",
    },

    /* SECTIONS */
    section: {
      background: "#ffffff",
      padding: "2.2rem",
      borderRadius: "1.2rem",
      boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
      marginBottom: "2rem",
      border: "1px solid #e6edf3",
    },

    subHeader: {
      fontSize: "1.6rem",
      fontWeight: "700",
      color: "#0f3d52",
      marginBottom: "1.75rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    /* PLAN GRID */
    planGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "2rem",
    },

    planCard: {
      position: "relative",
      padding: "2rem",
      background: "#ffffff",
      borderRadius: "1.25rem",
      boxShadow: "0 12px 28px rgba(15, 76, 117, 0.12)",
      border: "1px solid #e2e8f0",
      transition: "all 0.25s ease",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      // paddingTop: "4.5rem",
    },

    planCardHover: {
      transform: "translateY(-6px)",
      boxShadow: "0 18px 40px rgba(15, 76, 117, 0.18)",
    },

    planTitle: {
      fontSize: "1.2rem",
      fontWeight: "700",
      marginBottom: "0.45rem",
      color: "#0f3d52",
    },

    planPrice: {
      fontSize: "1.65rem",
      fontWeight: "800",
      marginBottom: "0.75rem",
      color: "#059669",
    },

    planVisibleTo: {
      fontSize: "0.95rem",
      color: "#475569",
      marginBottom: "1.2rem",
    },

    /* INPUTS */
    input: {
      width: "100%",
      padding: "1rem",
      borderRadius: "0.7rem",
      border: "1px solid #cbd5e1",
      fontSize: "1rem",
      marginBottom: "1.4rem",
      backgroundColor: "#ffffff",
      transition: "0.2s",
    },

    inputFocus: {
      border: "1px solid #0f4c75",
    },

    formContainer: {
      background: "#f4f8fb",
      padding: "2rem",
      borderRadius: "1.2rem",
      border: "1px solid #dce7f0",
      marginBottom: "2rem",
      boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
    },

    formSectionDivider: {
      height: "1px",
      width: "100%",
      backgroundColor: "#e0e7ef",
      margin: "1.4rem 0",
    },

    /* ACTION BUTTONS */
    actionButtons: {
      display: "flex",
      gap: "1rem",
      marginBottom: "0.5rem",
    },

    button: {
      padding: "0.8rem 1.4rem",
      borderRadius: "0.6rem",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      transition: "0.2s ease",
    },

    /* TABLES */
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
      fontSize: "0.92rem",
    },

    th: {
      textAlign: "left",
      padding: "14px 18px",
      backgroundColor: "#F8FAFC",
      color: "#334155",
      fontWeight: "700",
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      borderBottom: "1px solid #E2E8F0",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "14px 18px",
      borderBottom: "1px solid #F1F5F9",
      color: "#0F172A",
      verticalAlign: "middle",
      whiteSpace: "nowrap",
    },

    pagination: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "1.5rem",
      padding: "0.75rem 0.5rem",
      fontSize: "0.9rem",
      color: "#334155",
    },

    /* MESSAGES */
    successMessage: {
      marginTop: "1.25rem",
      padding: "1rem",
      color: "#0f7c48",
      background: "#dcfce7",
      borderLeft: "5px solid #059669",
      borderRadius: "8px",
      fontWeight: "600",
    },

    errorMessage: {
      marginTop: "1.25rem",
      padding: "1rem",
      color: "#b91c1c",
      background: "#fee2e2",
      borderLeft: "5px solid #dc2626",
      borderRadius: "8px",
      fontWeight: "600",
    },

    loadingSpinner: {
      padding: "2.5rem",
      fontSize: "1.1rem",
      textAlign: "center",
      color: "#6B7280",
    },

    statusBadge: {
      padding: "6px 14px",
      borderRadius: "999px",
      fontSize: "0.75rem",
      fontWeight: "700",
      color: "#ffffff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "88px",
      textTransform: "capitalize",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    },
  };

  const renderPlansTab = () => (
    <div style={styles.section}>
      <div style={styles.subHeader}>
        <span>Subscription Plans (Total: {filteredPlans.length})</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            style={{ ...styles.button, background: "#10B981" }}
            onClick={() => {
              setCreateFormVisible(!createFormVisible);
              setEditFormVisible(false);
              setEditingPlan(null);
            }}
            disabled={planLoading}
          >
            <FaSyncAlt style={{ marginRight: "0.25rem" }} />
            {createFormVisible ? "Close" : "Create Plan"}
          </button>
        </div>
        <div style={styles.planFilterBar}>
          <button
            onClick={() => setPlanFilter("all")}
            style={{
              ...styles.planFilterBtn,
              ...(planFilter === "all" && styles.planFilterActive),
            }}
          >
            <FaUsers size={14} />
            All
          </button>

          <button
            onClick={() => setPlanFilter("doctor")}
            style={{
              ...styles.planFilterBtn,
              ...(planFilter === "doctor" && styles.doctorActive),
            }}
          >
            <FaUserMd size={14} />
            Doctor
          </button>

          <button
            onClick={() => setPlanFilter("student")}
            style={{
              ...styles.planFilterBtn,
              ...(planFilter === "student" && styles.studentActive),
            }}
          >
            <FaUserGraduate size={14} />
            Student
          </button>
        </div>
      </div>

      {(createFormVisible || editFormVisible) && (
        <div
          style={{
            background: "#ffffff",
            padding: "2rem",
            borderRadius: "1.2rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", // Softer shadow
            marginTop: "1.5rem",
            width: "100%",
            maxWidth: "850px",
            marginInline: "auto",
            // Remove the inline grid container and let the form flow naturally
          }}
        >
          {/* HEADER */}
          <h3
            style={{
              fontSize: "1.5rem", // Slightly larger heading
              fontWeight: "700",
              marginBottom: "2rem", // More separation from the form
              color: editingPlan ? "#D97706" : "#059669",
              borderBottom: "2px solid #f3f4f6",
              paddingBottom: "0.5rem",
            }}
          >
            {editingPlan
              ? `Edit Plan: ${editingPlan.name}`
              : "Create New Subscription Plan"}
          </h3>

          {/* FORM FIELDS - Using a Flex-based layout for better wrapping */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap", // Allows items to wrap on smaller screens
              gap: "1.5rem", // Consistent spacing
              marginBottom: "2rem",
            }}
          >
            {/* Helper function for creating a flexible input group */}
            {/* Name */}
            <div style={inputGroupStyle}>
              <label htmlFor="plan-name" style={labelStyle}>
                Plan Name
              </label>
              <input
                id="plan-name"
                type="text"
                placeholder="e.g., Basic Plan"
                style={inputStyle}
                value={editingPlan ? updatedPlan.name : newPlan.name}
                onChange={(e) =>
                  editingPlan
                    ? setUpdatedPlan({ ...updatedPlan, name: e.target.value })
                    : setNewPlan({ ...newPlan, name: e.target.value })
                }
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                placeholder="Marketing title"
                style={inputStyle}
                value={editingPlan ? updatedPlan.title : newPlan.title}
                onChange={(e) =>
                  editingPlan
                    ? setUpdatedPlan({ ...updatedPlan, title: e.target.value })
                    : setNewPlan({ ...newPlan, title: e.target.value })
                }
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Tagline</label>
              <input
                type="text"
                placeholder="Short description"
                style={inputStyle}
                value={editingPlan ? updatedPlan.tagline : newPlan.tagline}
                onChange={(e) =>
                  editingPlan
                    ? setUpdatedPlan({
                        ...updatedPlan,
                        tagline: e.target.value,
                      })
                    : setNewPlan({ ...newPlan, tagline: e.target.value })
                }
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Features (comma separated)</label>
              <textarea
                rows={4}
                style={inputStyle}
                placeholder="Feature 1, Feature 2, Feature 3"
                value={
                  editingPlan
                    ? updatedPlan.features.join(", ")
                    : newPlan.features.join(", ")
                }
                onChange={(e) => {
                  const features = e.target.value
                    .split(",")
                    .map((f) => f.trim())
                    .filter(Boolean); // ✅ add this
                  editingPlan
                    ? setUpdatedPlan({ ...updatedPlan, features })
                    : setNewPlan({ ...newPlan, features });
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Button Text</label>
              <input
                type="text"
                placeholder="Get Started"
                style={inputStyle}
                value={
                  editingPlan ? updatedPlan.buttonText : newPlan.buttonText
                }
                onChange={(e) =>
                  editingPlan
                    ? setUpdatedPlan({
                        ...updatedPlan,
                        buttonText: e.target.value,
                      })
                    : setNewPlan({ ...newPlan, buttonText: e.target.value })
                }
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Badge</label>
              <input
                type="text"
                placeholder="Recommended / Popular"
                style={inputStyle}
                value={editingPlan ? updatedPlan.badge : newPlan.badge}
                onChange={(e) =>
                  editingPlan
                    ? setUpdatedPlan({ ...updatedPlan, badge: e.target.value })
                    : setNewPlan({ ...newPlan, badge: e.target.value })
                }
              />
            </div>

            {/* Price */}
            <div style={inputGroupStyle}>
              <label htmlFor="plan-price" style={labelStyle}>
                Price (INR)
              </label>
              <input
                id="plan-price"
                type="number"
                placeholder="e.g., 1099"
                style={inputStyle}
                value={editingPlan ? updatedPlan.price : newPlan.price}
                onChange={(e) =>
                  editingPlan
                    ? setUpdatedPlan({ ...updatedPlan, price: e.target.value })
                    : setNewPlan({ ...newPlan, price: e.target.value })
                }
              />
            </div>

            {/* Interval */}
            <div style={inputGroupStyle}>
              <label htmlFor="plan-interval" style={labelStyle}>
                Billing Interval
              </label>
              <select
                id="plan-interval"
                style={inputStyle} // Reuse input style for consistent look
                value={editingPlan ? updatedPlan.interval : newPlan.interval}
                onChange={(e) =>
                  editingPlan
                    ? setUpdatedPlan({
                        ...updatedPlan,
                        interval: e.target.value,
                      })
                    : setNewPlan({ ...newPlan, interval: e.target.value })
                }
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>

            <div style={visibleToGroupStyle}>
              <RolesSelector
                value={editingPlan ? updatedPlan.visibleTo : newPlan.visibleTo}
                onChange={(newVisibleArray, permission) => {
                  // update local form state with new roles (ignore permission if you don't use it)
                  if (editingPlan) {
                    setUpdatedPlan({
                      ...updatedPlan,
                      visibleTo: newVisibleArray,
                    });
                  } else {
                    setNewPlan({ ...newPlan, visibleTo: newVisibleArray });
                  }

                  // optionally capture permission if you want to store it in plan:
                  // setUpdatedPlan({...updatedPlan, permission}) or setNewPlan...
                  // (only if RolesSelector provides permission and you want to persist it)
                }}
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
          >
            <button
              onClick={
                editingPlan
                  ? () => handleUpdatePlan(editingPlan._id)
                  : handleCreatePlan
              }
              disabled={planLoading}
              style={{
                ...buttonStyle,
                background: editingPlan ? "#D97706" : "#059669",
              }}
            >
              {editingPlan ? "Update Plan" : "Create Plan"}
            </button>

            {editingPlan && (
              <button
                onClick={() => {
                  setEditFormVisible(false);
                  setEditingPlan(null);
                }}
                style={{
                  ...buttonStyle,
                  background: "#6b7280",
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* STATUS MESSAGE */}
          {(createResult || planError) && (
            <p
              style={{
                marginTop: "1.5rem",
                padding: "1rem", // Increased padding
                borderRadius: "0.7rem",
                fontWeight: 600,
                textAlign: "center",
                color: planError ? "#dc2626" : "#059669",
                background: planError ? "#fee2e2" : "#ecfdf5",
                border: `1px solid ${planError ? "#f87171" : "#34d399"}`, // Added border
              }}
            >
              {createResult || planError}
            </p>
          )}
        </div>
      )}

      {planLoading && <div style={styles.loadingSpinner}>Loading plans...</div>}
      {planError && !createFormVisible && (
        <div style={styles.errorMessage}>
          Error: {planError}
          <button
            style={{
              ...styles.button,
              background: "#10B981",
              marginLeft: "1rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
            }}
            onClick={() => dispatch(fetchPlans())}
          >
            Retry
          </button>
        </div>
      )}

      {!planLoading && !planError && paginatedPlans.length === 0 && (
        <div style={styles.loadingSpinner}>No plans match your search.</div>
      )}

      {!planLoading && !planError && paginatedPlans.length > 0 && (
        <>
          <div style={styles.planGrid}>
            {paginatedPlans.map((plan) => (
              // <div key={plan._id} style={styles.planCard}>
              <div
                key={plan._id}
                style={styles.planCard}
                onMouseEnter={(e) =>
                  Object.assign(e.currentTarget.style, styles.planCardHover)
                }
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, styles.planCard)
                }
              >
                {/* BADGE ROW – FIXED */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  {/* Recommended / Popular */}
                  {plan.badge && (
                    <span
                      style={{
                        background:
                          plan.badge === "Recommended"
                            ? "linear-gradient(135deg,#059669,#10b981)"
                            : plan.badge === "Popular"
                            ? "linear-gradient(135deg,#2563EB,#3B82F6)"
                            : "#7C3AED",
                        color: "#fff",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}

                  {/* Doctor / Student */}
                  <span
                    style={{
                      background: plan.visibleTo.includes("doctor")
                        ? "#DBEAFE"
                        : "#FEF3C7",
                      color: "#0f172a",
                      padding: "0.3rem 0.8rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {plan.visibleTo.includes("doctor")
                      ? "Doctor Plan"
                      : "Student Plan"}
                  </span>
                </div>

                {/* TITLE */}
                <div>
                  <div
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "#0f3d52",
                      lineHeight: 1.3,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {plan.title || plan.name}
                  </div>

                  {plan.tagline && (
                    <div
                      style={{
                        fontSize: "0.95rem",
                        color: "#64748b",
                        lineHeight: 1.4,
                        marginBottom: "1.2rem",
                      }}
                    >
                      {plan.tagline}
                    </div>
                  )}
                </div>

                {/* ✅ FEATURES — ADD HERE */}
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul
                    style={{
                      margin: "0 0 1.2rem",
                      paddingLeft: "1.2rem",
                      fontSize: "0.95rem",
                      color: "#334155",
                      lineHeight: 1.6,
                    }}
                  >
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        style={{
                          marginBottom: "0.45rem",
                          position: "relative",
                        }}
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {/* PRICE */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2.4rem",
                      fontWeight: 900,
                      color: "#059669",
                    }}
                  >
                    ₹{plan.price}
                  </span>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    / {plan.interval === "year" ? "year" : "month"}
                  </span>
                </div>

                {/* VISIBLE TO */}
                {/* <div style={styles.planVisibleTo}>
                  Visible To: {plan.visibleTo?.join(", ") || "N/A"}
                </div>

                
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#6B7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  {plan.interval === "year" ? "Yearly" : "Monthly"}
                  {plan.razorpayPlanId &&
                    ` • Razorpay: ${plan.razorpayPlanId.substring(0, 10)}...`}
                </div> */}

                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#475569",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <div>
                      <strong>Visible to:</strong>{" "}
                      {plan.visibleTo?.join(", ") || "N/A"}
                    </div>
                    {plan.razorpayPlanId && (
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        Razorpay ID: {plan.razorpayPlanId.substring(0, 12)}...
                      </div>
                    )}
                  </div>
                </div>

                {/* THREE DOT MENU */}
                <div style={{ position: "absolute", top: 18, right: 18 }}>
                  <FaEllipsisV
                    size={14}
                    style={{ cursor: "pointer", color: "#64748b" }}
                    onClick={() =>
                      setOpenMenu(openMenu === plan._id ? null : plan._id)
                    }
                  />

                  {openMenu === plan._id && (
                    <div
                      style={{
                        position: "absolute",
                        top: 25,
                        right: 0,
                        background: "#ffffff",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 10,
                        width: "140px",
                        padding: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                          borderRadius: "6px",
                          fontWeight: "600",
                          color: "#0f4c75",
                        }}
                        onClick={() => {
                          setOpenMenu(null);
                          handleEditPlan(plan);
                        }}
                      >
                        <FaEdit size={16} />
                        Edit Plan
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.pagination}>
            <button
              style={{
                ...styles.button,
                background: plansPage === 1 ? "#9CA3AF" : "#0f4c75",
                color: "#fff",
              }}
              onClick={() => setPlansPage((p) => Math.max(1, p - 1))}
              disabled={plansPage === 1}
            >
              Prev
            </button>
            <div>
              Page {plansPage} of {plansTotalPages}
            </div>
            <button
              style={{
                ...styles.button,
                background:
                  plansPage === plansTotalPages ? "#9CA3AF" : "#0f4c75",
                color: "#fff",
              }}
              onClick={() =>
                setPlansPage((p) => Math.min(plansTotalPages, p + 1))
              }
              disabled={plansPage === plansTotalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderTransactionsTab = () => (
    <div style={styles.section}>
      <div style={styles.subHeader}>
        <span>Recent Transactions ({transactions.total})</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Page {transactionsPage} of {transactionsTotalPages}
          </span>
          <button
            style={{
              ...styles.button,
              background: "#3B82F6",
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
            }}
            onClick={() => setTransactionsPage(1)}
            disabled={transactionsPage === 1}
          >
            First Page
          </button>
        </div>
      </div>

      {transactionsLoading && (
        <div style={styles.loadingSpinner}>Loading transactions...</div>
      )}
      {transactionsError && (
        <div style={styles.errorMessage}>
          Error: {transactionsError}
          <button
            style={{
              ...styles.button,
              background: "#10B981",
              marginLeft: "1rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
            }}
            onClick={() =>
              dispatch(
                fetchTransactions({
                  page: transactionsPage,
                  limit: PAGE_LIMIT,
                  status: "success",
                  sort: "amount",
                })
              )
            }
          >
            Retry
          </button>
        </div>
      )}

      {!transactionsLoading &&
        !transactionsError &&
        paginatedTransactions.length > 0 && (
          <>
            <div style={{ overflowX: "auto", borderRadius: "14px" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Auto Renew</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#F9FAFB",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EEF2FF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          index % 2 === 0 ? "#ffffff" : "#F9FAFB";
                      }}
                    >
                      <td style={styles.td}>
                        #{(transaction.id || "").substring(0, 8)}...
                      </td>
                      <td style={styles.td}>{transaction.userName}</td>
                      <td style={styles.td}>{transaction.userPhone}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            fontWeight: "800",
                            color: "#059669",
                            fontSize: "0.95rem",
                          }}
                        >
                          ₹{transaction.amount}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(transaction.status),
                          }}
                        >
                          {getStatusText(transaction.status)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background: transaction.autoRenew
                              ? "#DCFCE7"
                              : "#FEE2E2",
                            color: transaction.autoRenew
                              ? "#166534"
                              : "#991B1B",
                          }}
                        >
                          {transaction.autoRenew ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.button,
                  background: transactionsPage === 1 ? "#9CA3AF" : "#3B82F6",
                  color: "#fff",
                }}
                onClick={() => setTransactionsPage((p) => Math.max(1, p - 1))}
                disabled={transactionsPage === 1}
              >
                Prev
              </button>
              <div>
                Page {transactionsPage} of {transactionsTotalPages}
              </div>
              <button
                style={{
                  ...styles.button,
                  background:
                    transactionsPage === transactionsTotalPages
                      ? "#9CA3AF"
                      : "#3B82F6",
                  color: "#fff",
                }}
                onClick={() =>
                  setTransactionsPage((p) =>
                    Math.min(transactionsTotalPages, p + 1)
                  )
                }
                disabled={transactionsPage === transactionsTotalPages}
              >
                Next
              </button>
            </div>
          </>
        )}

      {!transactionsLoading &&
        !transactionsError &&
        paginatedTransactions.length === 0 && (
          <div style={styles.loadingSpinner}>
            No transactions match your search.
          </div>
        )}
    </div>
  );

  const renderExpiryTab = () => (
    <div style={styles.section}>
      <div style={styles.subHeader}>
        <span>
          Expiry Management - {expiryDaysFilter} Days ({expiryUsers.total})
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid #d1d5db",
            }}
            value={expiryDaysFilter}
            onChange={(e) => {
              setExpiryDaysFilter(parseInt(e.target.value));
              setExpiryPage(1);
            }}
          >
            <option value={7}>7 Days</option>
            <option value={15}>15 Days</option>
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
          </select>

          <div style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Page {expiryPage} of {expiryTotalPages}
          </div>
        </div>
      </div>

      {expiryUsersLoading && (
        <div style={styles.loadingSpinner}>Loading expiry users...</div>
      )}
      {expiryUsersError && (
        <div style={styles.errorMessage}>
          Error: {expiryUsersError}
          <button
            style={{
              ...styles.button,
              background: "#10B981",
              marginLeft: "1rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
            }}
            onClick={() =>
              dispatch(
                fetchExpiryUsers({
                  days: expiryDaysFilter,
                  page: expiryPage,
                  limit: PAGE_LIMIT,
                  role: "doctor",
                })
              )
            }
          >
            Retry
          </button>
        </div>
      )}

      {!expiryUsersLoading &&
        !expiryUsersError &&
        paginatedExpiryUsers.length > 0 && (
          <>
            <div style={{ overflowX: "auto", borderRadius: "14px" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Expiry Date</th>
                    <th style={styles.th}>Days Left</th>
                    <th style={styles.th}>Auto Renew</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpiryUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      style={{
                        transition: "background 0.2s ease",
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#F9FAFB",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EEF2FF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          index % 2 === 0 ? "#ffffff" : "#F9FAFB";
                      }}
                    >
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: "600",
                          color: "#0F172A",
                        }}
                      >
                        {user.name}
                      </td>
                      <td style={{ ...styles.td, color: "#64748B" }}>
                        {user.phone}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background:
                              user.role === "doctor" ? "#E0F2FE" : "#FEF3C7",
                            color:
                              user.role === "doctor" ? "#075985" : "#92400E",
                            textTransform: "capitalize",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td style={{ ...styles.td, color: "#334155" }}>
                        {formatDate(user.expiry)}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background:
                              (user.daysLeft || 0) <= 7 ? "#FEE2E2" : "#DCFCE7",
                            color:
                              (user.daysLeft || 0) <= 7 ? "#991B1B" : "#166534",
                          }}
                        >
                          {user.daysLeft || 0} days
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background: user.autoRenew ? "#DCFCE7" : "#FEE2E2",
                            color: user.autoRenew ? "#166534" : "#991B1B",
                          }}
                        >
                          {user.autoRenew ? "Yes" : "No"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#3B82F6",
                            color: "#fff",
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            borderRadius: "999px",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          }}
                          onClick={() => setSelectedUserForReminder(user)}
                        >
                          <FaBell size={12} />
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.button,
                  background: expiryPage === 1 ? "#9CA3AF" : "#0f4c75",
                  color: "#fff",
                }}
                onClick={() => setExpiryPage((p) => Math.max(1, p - 1))}
                disabled={expiryPage === 1}
              >
                Prev
              </button>
              <div>
                Page {expiryPage} of {expiryTotalPages}
              </div>
              <button
                style={{
                  ...styles.button,
                  background:
                    expiryPage === expiryTotalPages ? "#9CA3AF" : "#0f4c75",
                  color: "#fff",
                }}
                onClick={() =>
                  setExpiryPage((p) => Math.min(expiryTotalPages, p + 1))
                }
                disabled={expiryPage === expiryTotalPages}
              >
                Next
              </button>
            </div>
          </>
        )}

      {!expiryUsersLoading &&
        !expiryUsersError &&
        paginatedExpiryUsers.length === 0 && (
          <div style={styles.loadingSpinner}>No users match your search.</div>
        )}

      {sendResult && (
        <p
          style={
            sendResult.includes("successfully")
              ? styles.successMessage
              : styles.errorMessage
          }
        >
          {sendResult}
        </p>
      )}
    </div>
  );

  const renderRemindersTab = () => (
    <div style={styles.section}>
      <div style={styles.subHeader}>
        <span>Recent Reminders ({reminders.count})</span>
      </div>

      {remindersLoading && (
        <div style={styles.loadingSpinner}>Loading reminders...</div>
      )}
      {remindersError && (
        <div style={styles.errorMessage}>
          Error: {remindersError}
          <button
            style={{
              ...styles.button,
              background: "#10B981",
              marginLeft: "1rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
            }}
            onClick={() => dispatch(fetchReminders())}
          >
            Retry
          </button>
        </div>
      )}

      {!remindersLoading &&
        !remindersError &&
        paginatedReminders.length > 0 && (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Email/Phone</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Message</th>
                  <th style={styles.th}>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReminders.map((reminder, index) => (
                  <tr
                    key={reminder._id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#F9FAFB",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#EEF2FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        index % 2 === 0 ? "#ffffff" : "#F9FAFB";
                    }}
                  >
                    <td style={styles.td}>{reminder.userName}</td>
                    <td style={styles.td}>
                      {reminder.userEmail !== "N/A"
                        ? reminder.userEmail
                        : reminder.userPhone}
                    </td>
                    {/* <td style={styles.td}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          background:
                            reminder.type === "email" ? "#DBEAFE" : "#FEF3C7",
                          color:
                            reminder.type === "email" ? "#1D4ED8" : "#92400E",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                      >
                        {reminder.type === "email" ? "📧" : "📱"}
                        {reminder.type}
                      </span>
                    </td> */}

                    <td style={styles.td}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          background:
                            reminder.type === "email" ? "#EFF6FF" : "#FFFBEB",
                          color:
                            reminder.type === "email" ? "#1D4ED8" : "#92400E",
                          border:
                            reminder.type === "email"
                              ? "1px solid #BFDBFE"
                              : "1px solid #FDE68A",
                        }}
                      >
                        {reminder.type === "email" ? (
                          <Mail size={14} strokeWidth={2} />
                        ) : (
                          <Smartphone size={14} strokeWidth={2} />
                        )}
                        {reminder.type}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            reminder.status === "success"
                              ? "#10B981"
                              : "#EF4444",
                        }}
                      >
                        {reminder.status.toUpperCase()}
                      </span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        maxWidth: "260px",
                        color: "#475569",
                      }}
                      title={reminder.message}
                    >
                      {reminder.message.substring(0, 40)}...
                    </td>
                    <td style={styles.td}>{reminder.timeAgo}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.button,
                  background: remindersPage === 1 ? "#9CA3AF" : "#3B82F6",
                  color: "#fff",
                }}
                onClick={() => setRemindersPage((p) => Math.max(1, p - 1))}
                disabled={remindersPage === 1}
              >
                Prev
              </button>
              <div>
                Page {remindersPage} of {remindersTotalPages}
              </div>
              <button
                style={{
                  ...styles.button,
                  background:
                    remindersPage === remindersTotalPages
                      ? "#9CA3AF"
                      : "#3B82F6",
                  color: "#fff",
                }}
                onClick={() =>
                  setRemindersPage((p) => Math.min(remindersTotalPages, p + 1))
                }
                disabled={remindersPage === remindersTotalPages}
              >
                Next
              </button>
            </div>
          </>
        )}

      {!remindersLoading &&
        !remindersError &&
        paginatedReminders.length === 0 && (
          <div style={styles.loadingSpinner}>
            No reminders match your search.
          </div>
        )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>
        <FaCreditCard size={28} color="#186476ff" />
        Subscription & Billing Dashboard
      </h1>

      <div style={styles.tabContainer}>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={
              activeTab === "plans"
                ? styles.activeButton
                : styles.inactiveButton
            }
            onClick={() => setActiveTab("plans")}
          >
            <FaCreditCard style={{ marginRight: "0.25rem" }} />
            Plans
          </button>
          <button
            style={
              activeTab === "transactions"
                ? styles.activeButton
                : styles.inactiveButton
            }
            onClick={() => setActiveTab("transactions")}
          >
            <FaTable style={{ marginRight: "0.25rem" }} />
            Transactions
          </button>
          <button
            style={
              activeTab === "expiry"
                ? styles.activeButton
                : styles.inactiveButton
            }
            onClick={() => setActiveTab("expiry")}
          >
            <FaBell style={{ marginRight: "0.25rem" }} />
            Expiry Management
          </button>
          <button
            style={
              activeTab === "reminders"
                ? styles.activeButton
                : styles.inactiveButton
            }
            onClick={() => setActiveTab("reminders")}
          >
            <FaSyncAlt style={{ marginRight: "0.25rem" }} />
            Reminders
          </button>
        </div>

        {/* Global quick search (keeps value synced with tab-specific inputs) */}
        <div style={styles.searchBox}>
          <FaSearch />
          <input
            placeholder="Global search by name or id (press Esc to clear)"
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchQuery("");
            }}
          />
        </div>
      </div>

      {activeTab === "plans" && renderPlansTab()}
      {activeTab === "transactions" && renderTransactionsTab()}
      {activeTab === "expiry" && renderExpiryTab()}
      {activeTab === "reminders" && renderRemindersTab()}

      {generalLoading && <div style={styles.loadingSpinner}>Processing...</div>}
      {generalError && (
        <div style={styles.errorMessage}>
          {generalError}
          <button
            style={{
              ...styles.button,
              background: "#10B981",
              marginLeft: "1rem",
              padding: "0.25rem 0.5rem",
              fontSize: "0.8rem",
            }}
            onClick={() => dispatch(clearError())}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export default SubscriptionBilling;

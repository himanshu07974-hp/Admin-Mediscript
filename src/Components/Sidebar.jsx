// src/Components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

import {
  RiDashboardFill,
  RiUserSettingsFill,
  RiWallet3Fill,
  RiFileList3Fill,
  RiBarChartBoxFill,
  RiFeedbackFill,
  RiNotification3Fill,
  RiAwardFill,
  RiFileShield2Fill,
  RiChat1Fill,
  RiLogoutBoxRFill,
} from "react-icons/ri";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const handleLogout = async () => {
    const result = await dispatch(logout());

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/");
    } else {
      console.error("Logout failed:", result.payload);
    }
  };

  const navLinks = [
    { to: "/dashboard", icon: RiDashboardFill, label: "Dashboard" },
    { to: "/users", icon: RiUserSettingsFill, label: "User Management" },
    {
      to: "/subscription",
      icon: RiWallet3Fill,
      label: "Subscription & Billing",
    },
    { to: "/templates", icon: RiFileList3Fill, label: "Template Management" },
    { to: "/analytics", icon: RiBarChartBoxFill, label: "Analytics & Reports" },
    { to: "/feedback", icon: RiFeedbackFill, label: "Feedback & Support" },
    { to: "/messaging", icon: RiNotification3Fill, label: "Messaging & Notifications" },
    { to: "/rewards", icon: RiAwardFill, label: "Contribution & Rewards" },
    { to: "/doccertificates", icon: RiFileShield2Fill, label: "Certificates" },
    {
      to: "/tathastu-sessions",
      icon: RiChat1Fill,
      label: "Chat Messaging",
    },
  ];

  const sidebarWidth = isOpen ? (isMobile ? "260px" : "245px") : "85px";

  const styles = {
    sidebar: {
      width: sidebarWidth,
      height: "100vh",
      position: "fixed",
      top: 0,
      left: isMobile && !isOpen ? "-290px" : "0",
      background: "linear-gradient(180deg, #0d9488 0%, #0f766e 100%)",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      zIndex: 2000,
      boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
    },

    overlay: {
      display: isMobile && isOpen ? "block" : "none",
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 1500,
    },

    toggleBtn: {
      position: "absolute",
      right: "-16px",
      top: "20px",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "#0f766e",
      border: "2px solid #ffffff",
      color: "#ffffff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      transition: "all 0.2s ease",
    },

    logoContainer: {
      padding: isOpen ? "16px" : "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.15)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },

    logoBox: {
      background: "#FFFFFF",
      padding: "8px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: isOpen ? "auto" : "40px",
      height: isOpen ? "auto" : "40px",
    },

    logo: {
      width: isOpen ? "110px" : "24px",
      transition: "0.2s ease",
    },

    title: {
      marginTop: "8px",
      fontSize: "0.85rem",
      fontWeight: "600",
      color: "#D1FAF5",
      opacity: isOpen ? 1 : 0,
      transition: "opacity 0.2s ease",
    },

    nav: {
      flexGrow: 1,
      padding: "12px 8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      width: "100%",
      gap: "4px",
    },

    navLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: isOpen ? "flex-start" : "center",
      height: "48px",
      width: "100%",
      padding: isOpen ? "0 16px" : "0",
      gap: isOpen ? "14px" : "0",
      textDecoration: "none",
      color: "#E6FFFA",
      fontSize: "0.95rem",
      fontWeight: "500",
      transition: "all 0.25s ease",
      borderRadius: "10px",
      position: "relative",
    },

    navIcon: {
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: "#CCFBF1",
    },

    navLabel: {
      whiteSpace: "nowrap",
      overflow: "hidden",
    },

    logoutWrapper: {
      padding: "12px",
      borderTop: "1px solid rgba(255,255,255,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    logoutBtn: {
      width: isOpen ? "100%" : "48px",
      height: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      background: "#DC2626",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: "600",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    },
  };

  return (
    <>
      <div style={styles.overlay} onClick={toggleSidebar} />

      <aside style={styles.sidebar}>
        <button style={styles.toggleBtn} onClick={toggleSidebar}>
          {isOpen ? <IoChevronBack size={20} /> : <IoChevronForward size={20} />}
        </button>

        <div style={styles.logoContainer}>
          <div style={styles.logoBox}>
            <img src={logo} style={styles.logo} alt="Mediscript Logo" />
          </div>
          {isOpen && <div style={styles.title}>Mediscript Panel</div>}
        </div>

        <nav style={styles.nav}>
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  ...styles.navLink,
                  ...(isActive && {
                    background: "rgba(255,255,255,0.2)",
                    fontWeight: "600",
                    color: "#ffffff",
                    ...(isOpen && {
                      borderLeft: "4px solid #5eead4",
                      paddingLeft: "12px",
                    }),
                  }),
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={styles.navIcon}>
                  <item.icon size={22} />
                </span>

                {isOpen && <span style={styles.navLabel}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={styles.logoutWrapper}>
          <button 
            style={styles.logoutBtn} 
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b91c1c";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#DC2626";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <RiLogoutBoxRFill size={20} />
            {isOpen && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
import React, { createContext, useContext, useState, useEffect } from "react";
import { MENU_ITEMS, MENU_SECTIONS, PERMISSIONS, USER_ROLES } from "../config/constants";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appConfigs, setAppConfigs] = useState(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);

  const { user } = useAuth();

  const isItemAllowed = (item) => {
    if (!user || !user.role) return true;
    const userRole = user.role.toLowerCase();
    const permissions = PERMISSIONS[userRole] || PERMISSIONS[USER_ROLES.GENERAL];

    if (item.superAdminOnly) {
      return userRole === USER_ROLES.SUPER_ADMIN;
    }
    if (item.permission) {
      return !!permissions[item.permission];
    }
    return true;
  };

  // Filter grouped menu sections based on user role & permissions
  const getFilteredMenuSections = () => {
    return MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(isItemAllowed),
    })).filter((section) => section.items.length > 0);
  };

  // Filter flat menu items for backwards compatibility
  const getFilteredMenuItems = () => {
    return MENU_ITEMS.filter(isItemAllowed);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const value = {
    // Sidebar state
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    toggleMobileSidebar,

    // Loading state
    loading,
    setLoading,

    // Menu items & grouped sections
    menuItems: getFilteredMenuItems(),
    menuSections: getFilteredMenuSections(),

    // App configurations
    appConfigs,
    setAppConfigs,

    // Dashboard analytics
    dashboardAnalytics,
    setDashboardAnalytics,

    // Utility functions
    isMobile: () => window.innerWidth < 1024,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

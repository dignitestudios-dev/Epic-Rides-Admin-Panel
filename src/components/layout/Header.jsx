import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  Bell,
  Search,
  Globe,
  ChevronDown,
  ShieldAlert,
  ArrowRight,
  Radio,
  Car,
  Users,
  BadgeDollarSign,
  Gauge,
  Clock3,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "../global/ConfirmModal";
import { api } from "../../lib/services";
import { formatDate, formatDateTime } from "../../utils/helpers";
import { USER_ROLES } from "../../config/constants";
import Badge from "../ui/Badge";

const LIMIT = 10;

const SEARCH_ROUTES = [
  { name: "Command Center", path: "/dashboard", group: "OPERATE", icon: "LayoutDashboard" },
  { name: "Live Operations (Bird's Eye)", path: "/birds-eye-view", group: "OPERATE", icon: "Radio" },
  { name: "Private Rides", path: "/private-rides", group: "OPERATE", icon: "Car" },
  { name: "Carpool Rides", path: "/carpool-rides", group: "OPERATE", icon: "Users" },
  { name: "Incident Reports", path: "/reports", group: "OPERATE", icon: "ShieldAlert" },
  { name: "Riders Directory", path: "/user-management?tab=rider", group: "MARKETPLACE", icon: "Users" },
  { name: "Drivers Directory", path: "/user-management?tab=driver", group: "MARKETPLACE", icon: "Car" },
  { name: "Driver Requests (Pending)", path: "/driver-requests", group: "MARKETPLACE", icon: "Car" },
  { name: "Suspended Drivers", path: "/suspended-drivers", group: "MARKETPLACE", icon: "ShieldAlert" },
  { name: "Vehicle Categories", path: "/vehicle-category", group: "MARKETPLACE", icon: "Car" },
  { name: "Financial Analytics & Revenue", path: "/revenue", group: "REVENUE", icon: "BadgeDollarSign" },
  { name: "Ride Rates & Pricing", path: "/ride-rates", group: "REVENUE", icon: "Gauge" },
  { name: "Peak Windows & Surge", path: "/peak-windows", group: "REVENUE", icon: "Clock3" },
  { name: "Ride Configuration", path: "/ride-configuration", group: "SYSTEM", icon: "SlidersHorizontal" },
  { name: "Admin Management", path: "/admin-users", group: "SYSTEM", icon: "Shield" },
];

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { sidebarOpen, toggleMobileSidebar } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Command Palette Search
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState("");

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [notifLoading, setNotifLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const commandInputRef = useRef(null);

  // Live Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(`${timeStr} EST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when palette opens
  useEffect(() => {
    if (showCommandPalette) {
      setTimeout(() => commandInputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setSearchQuery("");
    }
  }, [showCommandPalette]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter routes for command palette
  const filteredRoutes = searchQuery.trim()
    ? SEARCH_ROUTES.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.group.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_ROUTES;

  const handleCommandSelect = (route) => {
    setShowCommandPalette(false);
    navigate(route.path);
  };

  const handleCommandKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredRoutes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
    } else if (e.key === "Enter" && filteredRoutes[selectedIndex]) {
      e.preventDefault();
      handleCommandSelect(filteredRoutes[selectedIndex]);
    }
  };

  // Fetch admin notifications (/notifications/mine)
  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setNotifLoading(true);

      const res = await api.getAdminNotifications(page, LIMIT);
      const docs = Array.isArray(res?.data)
        ? res.data
        : res?.data?.notifications || res?.data?.data || [];
      const pagination = res?.pagination || res?.data?.pagination || {};
      const total = pagination.totalPages || 1;
      const totalCount = pagination.total ?? docs.length;

      if (append) {
        setNotifications((prev) => [...prev, ...docs]);
      } else {
        setNotifications(docs);
      }
      setNotifTotalPages(total);
      setNotifPage(page);

      const unread = docs.filter((n) => n.isRead === false).length;
      setUnreadCount(unread > 0 ? unread : (pagination.total > 0 ? pagination.total : docs.length));
    } catch (_err) {
      // silently fail
    } finally {
      setNotifLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    setShowUserMenu(false);
    if (!showNotifications) {
      fetchNotifications(1, false);
    }
  };

  const handleLoadMore = () => {
    if (notifPage < notifTotalPages && !loadingMore) {
      fetchNotifications(notifPage + 1, true);
    }
  };

  const handleNotifClick = async (notif) => {
    try {
      if (!notif.isRead && (notif._id || notif.id)) {
        await api.markNotificationAsRead(notif._id || notif.id);
        setNotifications((prev) =>
          prev.map((n) =>
            (n._id === notif._id || n.id === notif.id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (_err) {
      // silently catch
    }

    setShowNotifications(false);
    const targetId = notif.notificationContent?.metaData?.id || notif.targetId;
    if (targetId) {
      navigate(`/driver/${targetId}`);
    } else {
      navigate("/driver-requests");
    }
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await api.logout();
    } catch (_e) {
      // ignore
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("autoLogoutRedirectUrl");
      sessionStorage.removeItem("redirectUrl");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("lockedUntil");
      localStorage.removeItem("loginAttempts");
      if (setUser) setUser(null);
      navigate("/auth/login", { replace: true });
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="bg-white dark:bg-[#0d0f12] border-b border-gray-200 dark:border-[#1f242b] px-4 lg:px-6 h-14 shrink-0 transition-colors duration-200">
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left Side: Mobile Menu & Command Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#161d26] transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center justify-between w-full max-w-[280px] lg:max-w-[340px] px-3 py-1.5 rounded-lg text-xs bg-gray-50 dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] text-gray-400 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
              <span className="truncate">Search or jump to...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-[#1a1f26] text-[10px] font-mono text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-[#222831]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side: Live Clock, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Clock with Green Dot */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] text-xs font-mono text-gray-700 dark:text-gray-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#61CB08] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#61CB08]"></span>
            </span>
            <span>{currentTime || "12:00:00 EST"}</span>
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#161d26] hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#61CB08] rounded-full ring-2 ring-white dark:ring-[#0d0f12]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#121519] rounded-xl shadow-2xl border border-gray-200 dark:border-[#1f242b] z-50 overflow-hidden scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1f242b] bg-gray-50/60 dark:bg-[#161d26]/40">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#61CB08]/15 text-[#3d8304] dark:text-[#7fe820] font-bold">
                      {unreadCount || notifications.length}
                    </span>
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-[#61CB08] dark:text-[#7fe820] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {/* List Content */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-[#1f242b]">
                  {notifLoading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="w-6 h-6 border-2 border-[#61CB08] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-400">Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs font-medium">No notifications yet</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map((notif, index) => {
                        const notifId = notif._id || notif.id || `notif-${index}`;
                        const content = notif.notificationContent || {};
                        const title = content.title || notif.title || "Approval Required";
                        const message = content.description || notif.messagePreview || notif.message || "";
                        const date = notif.createdAt || notif.dateAndTime;
                        const isUnread = notif.isRead === false;

                        // Categorize badge based on description / title
                        let badgeLabel = "Verification";
                        let badgeVariant = "warning";

                        const msgLower = message.toLowerCase();
                        if (msgLower.includes("insurance")) {
                          badgeLabel = "Insurance";
                          badgeVariant = "warning";
                        } else if (msgLower.includes("registration")) {
                          badgeLabel = "Vehicle Reg";
                          badgeVariant = "info";
                        } else if (msgLower.includes("license")) {
                          badgeLabel = "Driver License";
                          badgeVariant = "primary";
                        } else if (msgLower.includes("vehicle")) {
                          badgeLabel = "Vehicle Details";
                          badgeVariant = "purple";
                        } else if (notif.recipientType) {
                          badgeLabel = notif.recipientType;
                          badgeVariant = notif.recipientType.toLowerCase() === "driver" ? "primary" : "info";
                        }

                        return (
                          <div
                            key={notifId}
                            onClick={() => handleNotifClick(notif)}
                            className={`flex gap-3 px-4 py-3 transition-colors cursor-pointer ${
                              isUnread
                                ? "bg-[#61CB08]/5 dark:bg-[#61CB08]/10 hover:bg-[#61CB08]/10 dark:hover:bg-[#61CB08]/15"
                                : "hover:bg-gray-50 dark:hover:bg-[#161d26]"
                            }`}
                          >
                            <div className="relative mt-0.5 shrink-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#61CB08]/15 border border-[#61CB08]/30 text-[#61CB08] dark:text-[#7fe820]">
                                <Bell className="w-4 h-4" />
                              </div>
                              {isUnread && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#61CB08] ring-2 ring-white dark:ring-[#121519]" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  {title}
                                </p>
                                <Badge variant={badgeVariant} dot>
                                  {badgeLabel}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                                {message}
                              </p>
                              <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                                <span>{date ? formatDateTime(date) : "—"}</span>
                                <span className="text-[10px] font-bold text-[#61CB08] dark:text-[#7fe820] hover:underline">
                                  Review &rarr;
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="px-4 py-2.5 bg-gray-50 dark:bg-[#161d26]/50 text-center border-t border-gray-100 dark:border-[#1f242b]">
                        {notifPage < notifTotalPages ? (
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="text-xs font-semibold text-[#61CB08] dark:text-[#7fe820] hover:underline disabled:opacity-50"
                          >
                            {loadingMore ? "Loading..." : "Load more"}
                          </button>
                        ) : (
                          <p className="text-[11px] text-gray-400">All notifications loaded</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#141c2c] hover:text-gray-900 dark:hover:text-white transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark command center"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* User Profile Pill */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#141c2c] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#61CB08]/20 border border-[#61CB08]/40 flex items-center justify-center text-[#61CB08] dark:text-[#7fe820] font-black text-xs shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {user?.name || "Operations Lead"}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium capitalize">
                  {user?.role ? user.role.replace("_", " ") : "Super Admin"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-slate-200 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#121519] rounded-xl shadow-2xl border border-gray-200 dark:border-[#1f242b] z-50 py-1.5 scale-in">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1f242b]">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {user?.name || "Operations Lead"}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user?.email || "admin@epicrides.com"}
                  </p>
                </div>
                <div className="py-1">
                  {user?.role === USER_ROLES.SUPER_ADMIN && (
                    <Link
                      to="/change-password"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1f26] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
                      Change Password
                    </Link>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2.5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Command Palette Quick-Jump Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
          <div
            className="w-full max-w-xl rounded-xl bg-white dark:bg-[#121519] border border-gray-200 dark:border-[#1f242b] shadow-2xl overflow-hidden scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-[#1f242b]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                ref={commandInputRef}
                type="text"
                placeholder="Type a screen name or jump destination..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleCommandKeyDown}
                className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              <kbd
                onClick={() => setShowCommandPalette(false)}
                className="px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-[#1a1f26] rounded border border-gray-200 dark:border-[#222831] cursor-pointer hover:text-gray-700 dark:hover:text-white"
              >
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredRoutes.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No pages found matching "{searchQuery}"
                </div>
              ) : (
                filteredRoutes.map((route, idx) => (
                  <button
                    key={route.path + route.name}
                    onClick={() => handleCommandSelect(route)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      selectedIndex === idx
                        ? "bg-[#61CB08]/15 text-[#61CB08] dark:text-[#7fe820] font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1f26]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1a1f26] text-gray-500 dark:text-gray-400">
                        {route.group}
                      </span>
                      <span>{route.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of the Admin Command Center?"
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </header>
  );
};

export default Header;


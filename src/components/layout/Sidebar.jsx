import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Radio,
  Car,
  Users,
  ShieldAlert,
  User,
  UserCheck,
  UserX,
  Layers,
  BadgeDollarSign,
  Gauge,
  Clock3,
  Tag,
  Coins,
  Bell,
  AlertTriangle,
  Shield,
  SlidersHorizontal,
  LayoutDashboard,
  FileCheck,
  Circle,
} from "lucide-react";
import { APP_CONFIG } from "../../config/constants";
import { useApp } from "../../contexts/AppContext";
import useGetRequestsCount from "../../hooks/drivers/useGetRequestsCount";

// Icon mapping dictionary
const ICON_MAP = {
  LayoutDashboard,
  Radio,
  Car,
  Users,
  ShieldAlert,
  User,
  UserCheck,
  UserX,
  FileCheck,
  Layers,
  BadgeDollarSign,
  Gauge,
  Clock3,
  Tag,
  Coins,
  Bell,
  AlertTriangle,
  Shield,
  SlidersHorizontal,
};

const Sidebar = () => {
  const location = useLocation();
  const {
    menuSections,
    menuItems,
    sidebarCollapsed,
    sidebarOpen,
    toggleMobileSidebar,
    toggleSidebar,
  } = useApp();
  const { count: pendingRequestsCount } = useGetRequestsCount();

  const isPathActive = (itemPath) => {
    if (!itemPath) return false;
    const [pathPart, queryPart] = itemPath.split("?");
    const isCurrentPath = location.pathname === pathPart;
    if (!isCurrentPath) return false;

    if (queryPart) {
      const currentSearchParams = new URLSearchParams(location.search);
      const targetSearchParams = new URLSearchParams(queryPart);
      for (const [key, val] of targetSearchParams.entries()) {
        if (currentSearchParams.get(key) !== val) {
          return false;
        }
      }
      return true;
    }

    // If itemPath has no query, but current location has ?tab=driver/rider, only match if it's the exact main path and no other tab item claims it
    if (location.search && itemPath === "/user-management") {
      return false;
    }

    return true;
  };

  const renderItem = (item) => {
    const IconComponent = ICON_MAP[item.icon] || Circle;
    const active = isPathActive(item.path);

    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={() => {
          if (window.innerWidth < 1024) {
            toggleMobileSidebar();
          }
        }}
        title={sidebarCollapsed ? item.label : undefined}
        className={`group relative flex items-center ${
          sidebarCollapsed ? "justify-center px-2" : "justify-between px-3"
        } py-2 rounded-lg text-xs font-medium transition-all duration-150 mb-0.5 ${
          active
            ? "bg-[#61CB08]/15 text-[#61CB08] dark:text-[#7fe820] font-semibold border-l-2 border-[#61CB08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100/80 dark:hover:bg-[#141c2c]"
        }`}
      >
        <div className="flex items-center min-w-0">
          <div
            className={`flex items-center justify-center w-4 h-4 ${
              sidebarCollapsed ? "" : "mr-2.5"
            } shrink-0 transition-colors duration-150 ${
              active
                ? "text-[#61CB08] dark:text-[#7fe820]"
                : "text-gray-400 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-200"
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          {!sidebarCollapsed && (
            <span className="truncate tracking-wide">{item.label}</span>
          )}
        </div>

        {/* Counter Badges */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {item.id === "driver-management" && pendingRequestsCount > 0 && (
              <span
                title="Pending Driver Requests"
                className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none shadow-sm shadow-amber-500/30"
              >
                {pendingRequestsCount}
              </span>
            )}
          </div>
        )}

        {/* Collapsed view badge dot */}
        {sidebarCollapsed && item.id === "driver-management" && pendingRequestsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#0c111d]" />
        )}
      </Link>
    );
  };

  const sectionsToRender =
    menuSections && menuSections.length > 0
      ? menuSections
      : [{ id: "all", title: "MENU", items: menuItems }];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full bg-white dark:bg-[#0b0f19] border-r border-gray-200 dark:border-[#161e2e] transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarCollapsed ? "lg:w-[72px]" : "lg:w-[240px]"}
        w-[240px] select-none
      `}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-[#1f242b] shrink-0 bg-white dark:bg-[#0d0f12]">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2.5 ${
              sidebarCollapsed ? "justify-center w-full" : ""
            } group`}
          >
            {/* Real Epic Rides Logo Image */}
            <img
              src="/images/logo.png"
              alt="Epic Rides"
              className="w-7 h-7 object-contain group-hover:scale-105 transition-transform shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/logo.png";
              }}
            />

            {!sidebarCollapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                  Epic Rides
                </span>
                <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-[#61CB08] leading-tight">
                  COMMAND CENTER
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161d26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categorized Navigation Body */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden space-y-3">
          {sectionsToRender.map((section) => (
            <div key={section.id} className="space-y-0.5">
              {!sidebarCollapsed ? (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {section.title}
                </div>
              ) : (
                <div className="my-2 border-t border-gray-200 dark:border-[#1f242b]" />
              )}
              {section.items.map(renderItem)}
            </div>
          ))}
        </nav>

        {/* Desktop Collapse Toggle Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-[#1f242b] bg-gray-50/50 dark:bg-[#0d0f12] shrink-0">
          <button
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center ${
              sidebarCollapsed ? "justify-center" : "justify-start gap-2"
            } w-full px-2.5 py-2 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161d26] transition-colors`}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

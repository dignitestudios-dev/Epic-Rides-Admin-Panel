import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import * as Icons from "lucide-react";
import { APP_CONFIG, MENU_SECTIONS } from "../../config/constants";
import { useApp } from "../../contexts/AppContext";
import useGetRequestsCount from "../../hooks/drivers/useGetRequestsCount";

const Sidebar = () => {
  const location = useLocation();
  const {
    menuItems,
    sidebarCollapsed,
    sidebarOpen,
    toggleMobileSidebar,
    toggleSidebar,
  } = useApp();
  const { count: pendingRequestsCount } = useGetRequestsCount();

  // Group the flat menu into its sections, dropping any section the current
  // role has no items in.
  const sections = useMemo(
    () =>
      MENU_SECTIONS.map((section) => ({
        ...section,
        items: menuItems.filter((item) => (item.section ?? "overview") === section.id),
      })).filter((section) => section.items.length > 0),
    [menuItems]
  );

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const badgeCount = (item) =>
    item.badge === "pendingRequests" ? pendingRequestsCount : null;

  const renderItem = (item) => {
    const IconComponent = Icons[item.icon] || Icons.Circle;
    const active = isActive(item.path);
    const count = badgeCount(item);

    return (
      <li key={item.id}>
        <Link
          to={item.path}
          onClick={() => sidebarOpen && toggleMobileSidebar()}
          title={sidebarCollapsed ? item.label : undefined}
          aria-current={active ? "page" : undefined}
          className={[
            "group relative flex items-center h-8 rounded-md transition-colors duration-150",
            sidebarCollapsed ? "justify-center px-0 mx-1.5" : "px-2 gap-2.5 mx-2",
            active
              ? "bg-surface-active text-ink font-medium"
              : "text-ink-muted hover:text-ink hover:bg-surface-hover",
          ].join(" ")}
        >
          {/* The active marker is a green rail, not a filled row — it reads at
              a glance without turning the whole sidebar into brand color. */}
          <span
            aria-hidden="true"
            className={[
              "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full bg-interactive transition-all duration-150",
              active ? "h-4 opacity-100" : "h-0 opacity-0",
              sidebarCollapsed ? "-ml-1.5" : "-ml-2",
            ].join(" ")}
          />

          <IconComponent
            className={`w-4 h-4 shrink-0 ${
              active ? "text-interactive" : "text-ink-faint group-hover:text-ink-muted"
            }`}
            aria-hidden="true"
          />

          {!sidebarCollapsed && (
            <>
              <span className="flex-1 truncate text-sm">{item.label}</span>
              {count > 0 && (
                <span className="tnum shrink-0 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-accent-400 text-accent-950 text-micro font-semibold">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </>
          )}

          {sidebarCollapsed && count > 0 && (
            <span
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-400"
              aria-label={`${count} pending`}
            />
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile scrim */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/50 backdrop-blur-[2px] lg:hidden animate-fade-in"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed lg:sticky top-0 left-0 z-40 lg:z-auto",
          "h-screen shrink-0 flex flex-col",
          "bg-surface border-r border-line",
          "transition-[width,transform] duration-200 ease-out",
          sidebarCollapsed ? "w-[56px]" : "w-[240px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div
          className={`flex items-center h-[52px] shrink-0 border-b border-line ${
            sidebarCollapsed ? "justify-center px-2" : "px-3 gap-2.5"
          }`}
        >
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 min-w-0"
            aria-label={`${APP_CONFIG.name} home`}
          >
            <img
              src={APP_CONFIG.logo}
              alt=""
              className="w-6 h-6 shrink-0 object-contain"
            />
            {!sidebarCollapsed && (
              <span className="font-semibold text-md text-ink truncate tracking-tight">
                {APP_CONFIG.name}
              </span>
            )}
          </Link>

          {!sidebarCollapsed && (
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden ml-auto h-7 w-7 inline-flex items-center justify-center rounded text-ink-faint hover:text-ink hover:bg-surface-hover transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2" aria-label="Main">
          {sections.map((section, index) => (
            <div key={section.id} className={index > 0 ? "mt-4" : ""}>
              {section.label && !sidebarCollapsed && (
                <p className="eyebrow px-4 mb-1.5">{section.label}</p>
              )}
              {section.label && sidebarCollapsed && index > 0 && (
                <div className="mx-3 mb-2 border-t border-line" aria-hidden="true" />
              )}
              <ul className="space-y-0.5">{section.items.map(renderItem)}</ul>
            </div>
          ))}
        </nav>

        {/* Collapse control — desktop only */}
        <div className="hidden lg:flex shrink-0 items-center h-10 px-2 border-t border-line">
          <button
            onClick={toggleSidebar}
            className={`inline-flex items-center h-7 rounded text-ink-faint hover:text-ink hover:bg-surface-hover transition-colors ${
              sidebarCollapsed ? "w-full justify-center" : "w-full px-2 gap-2"
            }`}
            aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-caption">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LogOut, Menu, Shield, Bell, ChevronRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import ConfirmModal from "../global/ConfirmModal";
import ThemeToggle from "../ui/ThemeToggle";
import { api } from "../../lib/services";
import { formatDate } from "../../utils/helpers";
import { MENU_ITEMS, MENU_SECTIONS, USER_ROLES } from "../../config/constants";

const LIMIT = 10;

const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: "Super admin",
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.GENERAL]: "General",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  const { sidebarOpen, toggleMobileSidebar } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  // Where am I — section plus page, derived from the nav definition.
  const breadcrumb = useMemo(() => {
    const match = MENU_ITEMS.filter(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
    ).sort((a, b) => b.path.length - a.path.length)[0];

    if (!match) return null;

    const section = MENU_SECTIONS.find((s) => s.id === match.section);
    const isDetail = location.pathname !== match.path;

    return { section: section?.label ?? null, page: match.label, path: match.path, isDetail };
  }, [location.pathname]);

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

  // Close menus on navigation.
  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    if (page === 1) setNotifLoading(true);
    else setLoadingMore(true);
    try {
      const res = await api.getAdminNotifications(page, LIMIT);
      const data = res.data || [];
      setNotifications((prev) => (append ? [...prev, ...data] : data));
      setNotifTotalPages(res.pagination?.totalPages || 1);
      setUnreadCount(
        append
          ? (prev) => prev + data.filter((n) => !n.isRead).length
          : data.filter((n) => !n.isRead).length
      );
    } catch {
      // A failed poll shouldn't interrupt the admin — the bell just stays quiet.
    } finally {
      setNotifLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleBellClick = () => {
    setShowNotifications((prev) => {
      if (!prev) {
        setNotifPage(1);
        fetchNotifications(1);
      }
      return !prev;
    });
    setShowUserMenu(false);
  };

  const handleLoadMore = () => {
    const next = notifPage + 1;
    setNotifPage(next);
    fetchNotifications(next, true);
  };

  const handleNotifClick = (notif) => {
    const driverId = notif.notificationContent?.metaData?.id;
    setShowNotifications(false);
    if (driverId) navigate(`/driver/${driverId}`);
  };

  const confirmLogout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("lockedUntil");
    localStorage.removeItem("loginAttempts");
    setUser(null);
    setShowLogoutConfirm(false);
    navigate("/auth/login");
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const roleLabel = ROLE_LABELS[user?.role?.toLowerCase()] ?? user?.role ?? "Admin";

  return (
    <header className="sticky top-0 z-40 h-[52px] shrink-0 flex items-center gap-3 px-3 lg:px-4 bg-surface/85 backdrop-blur-md border-b border-line">
      {/* Mobile navigation trigger */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden h-7 w-7 shrink-0 inline-flex items-center justify-center rounded text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
        aria-label="Open navigation"
        aria-expanded={sidebarOpen}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        {breadcrumb && (
          <ol className="flex items-center gap-1.5 text-caption min-w-0">
            {breadcrumb.section && (
              <>
                <li className="hidden sm:block text-ink-faint shrink-0">
                  {breadcrumb.section}
                </li>
                <li aria-hidden="true" className="hidden sm:block text-ink-faint">
                  <ChevronRight className="w-3 h-3" />
                </li>
              </>
            )}
            <li className="min-w-0">
              {breadcrumb.isDetail ? (
                <Link
                  to={breadcrumb.path}
                  className="text-ink-muted hover:text-ink transition-colors truncate"
                >
                  {breadcrumb.page}
                </Link>
              ) : (
                <span className="font-medium text-ink truncate">{breadcrumb.page}</span>
              )}
            </li>
            {breadcrumb.isDetail && (
              <>
                <li aria-hidden="true" className="text-ink-faint">
                  <ChevronRight className="w-3 h-3" />
                </li>
                <li className="font-medium text-ink truncate">Details</li>
              </>
            )}
          </ol>
        )}
      </nav>

      <div className="flex items-center gap-1.5 shrink-0">
        <ThemeToggle className="hidden sm:inline-flex" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="relative h-7 w-7 inline-flex items-center justify-center rounded text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
            }
            aria-expanded={showNotifications}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accent-400 ring-2 ring-surface" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-[336px] max-w-[calc(100vw-1.5rem)] bg-surface-raised rounded-lg shadow-lg border border-line z-50 overflow-hidden animate-scale-in origin-top-right">
              <div className="flex items-center justify-between px-3 h-9 border-b border-line">
                <h2 className="text-caption font-semibold text-ink">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="tnum text-micro text-ink-subtle">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <span className="spinner text-ink-faint" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-1 py-10 px-4 text-center">
                    <Bell className="w-5 h-5 text-ink-faint" />
                    <p className="text-sm font-medium text-ink">Nothing new</p>
                    <p className="text-caption text-ink-subtle">
                      Driver requests and alerts will land here.
                    </p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notif) => {
                      const hasLink = !!notif.notificationContent?.metaData?.id;
                      return (
                        <button
                          key={notif._id}
                          type="button"
                          onClick={() => handleNotifClick(notif)}
                          disabled={!hasLink}
                          className={`w-full flex gap-2.5 px-3 py-2.5 text-left border-b border-line-subtle last:border-0 transition-colors ${
                            hasLink
                              ? "hover:bg-surface-hover cursor-pointer"
                              : "cursor-default"
                          }`}
                        >
                          <span
                            className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                              notif.isRead ? "bg-transparent" : "bg-accent-400"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-ink truncate">
                              {notif.notificationContent?.title || "Notification"}
                            </span>
                            {notif.notificationContent?.description && (
                              <span className="block text-caption text-ink-muted mt-0.5 line-clamp-2">
                                {notif.notificationContent.description}
                              </span>
                            )}
                            <span className="block text-micro text-ink-faint mt-1">
                              {formatDate(notif.createdAt)}
                            </span>
                          </span>
                        </button>
                      );
                    })}

                    <div className="px-3 py-2 border-t border-line text-center">
                      {notifPage < notifTotalPages ? (
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-muted hover:text-ink disabled:opacity-50 transition-colors"
                        >
                          {loadingMore && <span className="spinner" />}
                          {loadingMore ? "Loading" : "Load more"}
                        </button>
                      ) : (
                        <p className="text-micro text-ink-faint">
                          You&rsquo;re all caught up
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Account */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu((v) => !v);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 h-7 pl-1 pr-1.5 rounded hover:bg-surface-hover transition-colors"
            aria-label="Account menu"
            aria-expanded={showUserMenu}
          >
            <span className="w-[22px] h-[22px] shrink-0 rounded-full overflow-hidden bg-interactive-subtle flex items-center justify-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-micro font-semibold text-interactive-subtle-ink">
                  {initial}
                </span>
              )}
            </span>
            <span className="hidden md:block max-w-[120px] truncate text-caption font-medium text-ink">
              {user?.name || "User"}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-surface-raised rounded-lg shadow-lg border border-line z-50 overflow-hidden animate-scale-in origin-top-right">
              <div className="px-3 py-2.5 border-b border-line">
                <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                <p className="text-caption text-ink-muted truncate">{user?.email}</p>
                <p className="eyebrow mt-1.5">{roleLabel}</p>
              </div>

              <div className="p-1 sm:hidden border-b border-line">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-caption text-ink-muted">Theme</span>
                  <ThemeToggle />
                </div>
              </div>

              <div className="p-1">
                {user?.role?.toLowerCase() === USER_ROLES.SUPER_ADMIN && (
                  <Link
                    to="/change-password"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 w-full h-8 px-2 rounded text-sm text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors"
                  >
                    <Shield className="w-4 h-4 text-ink-faint" />
                    Change password
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-2.5 w-full h-8 px-2 rounded text-sm text-danger hover:bg-danger-bg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Sign out"
        message="You'll need to sign in again to get back into the console."
        confirmText="Sign out"
        cancelText="Cancel"
      />
    </header>
  );
};

export default Header;

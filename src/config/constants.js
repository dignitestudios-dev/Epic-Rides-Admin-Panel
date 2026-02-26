// App Configuration Constants
export const APP_CONFIG = {
  name: "Epic Rides",
  version: "1.0.0",
  description: "Epic Rides",
  author: "Epic Rides",
  logo: "/images/logo.png",
  supportEmail: "support@epicride.com",
  companyUrl: "https://example.com",
};

// Global Color Configuration - Dynamic Theme System
export const COLOR_CONFIG = {
  // Primary color (required) - Main brand color
  primary: {
    name: "Pink",
    hex: "#61CB08",
    rgb: "198, 13, 249",
    enabled: true, // Set to false to disable secondary color
  },
  // Secondary color (optional) - Accent color
  secondary: {
    name: "Yellow",
    hex: "#ebc501",
    rgb: "97, 50, 234",
    enabled: true,
  },
};

// Theme Options Configuration
export const THEME_OPTIONS = {
  enableThemeToggle: true, // Set to false to disable theme switching
  defaultTheme: "light", // 'light' or 'dark'
  forceTheme: "light", // Set to 'light' or 'dark' to force a single theme (disables toggle)
  enableSecondaryColor: COLOR_CONFIG.secondary.enabled,
  // Theme persistence
  persistTheme: true, // Save theme preference to localStorage
  respectSystemTheme: true, // Respect system dark/light mode preference
};

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:8080",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
  formDataHeaders: {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  },
  // Stripe Configuration (for revenue tracking)
  stripe: {
    enabled: true, // Set to false to disable Stripe features
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",
    webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || "",
  },
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
  maxVisiblePages: 5,
};

// Date Format Configuration
export const DATE_CONFIG = {
  format: "MM/dd/yyyy",
  timeFormat: "HH:mm:ss",
  dateTimeFormat: "MM/dd/yyyy HH:mm:ss",
  timezone: "UTC",
};

// Navigation Menu Items
export const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/",
    children: [],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: "User",
    path: "/user-management",
    children: [],
  },
  {
    id: "content-management",
    label: "Content Management",
    icon: "FileText",
    path: "/content-management",
    children: [],
  },
    {
      id: "reports",
      label: "Reports",
      icon: "BarChart",
      path: "/reports",
      children: [],
    },
    {
      id: "reports",
      label: "Reports Management",
      icon: "FileSpreadsheet",
      path: "/reports-management",
      children: [],
    },
    {
      id: "reports",
      label: "Notifications",
      icon: "Bell",
      path: "/notifications",
      children: [],
    },
    { 
      id: "emergencay",
      label: "Emergency Management",
      icon: "ShieldAlert",
      path: "/emergency-management",
      children: [],
    },
  // {
  //   id: "products",
  //   label: "Products",
  //   icon: "Package",
  //   path: "/products",
  //   children: [
  //     { id: "products-list", label: "All Products", path: "/products" },
  //     { id: "categories", label: "Categories", path: "/products/categories" },
  //   ],
  // },
  // {
  //   id: "orders",
  //   label: "Orders",
  //   icon: "ShoppingCart",
  //   path: "/orders",
  //   children: [],
  // },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    path: "/settings",
    children: [
      // {
      //   id: "configs",
      //   label: "Configurations",
      //   path: "/settings/configs",
      // },
      {
        id: "change-password",
        label: "Change Password",
        path: "/settings/change-password",
      },
    ],
  },
];

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  MODERATOR: "moderator",
};

// User Status Options
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
};

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD: "/auth/reset-password",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ALL_USERS: "all_users",
  ROLE_BASED: "role_based",
  SPECIFIC_USERS: "specific_users",
  ACTIVE_USERS: "active_users",
  INACTIVE_USERS: "inactive_users",
};

// Transaction Statuses
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

// Support Ticket Statuses
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// Support Ticket Priorities
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// Report Types
export const REPORT_TYPES = {
  USER_REPORT: "user_report",
  CONTENT_REPORT: "content_report",
  SPAM_REPORT: "spam_report",
  ABUSE_REPORT: "abuse_report",
  OTHER: "other",
};

// Report Statuses
export const REPORT_STATUS = {
  PENDING: "pending",
  INVESTIGATING: "investigating",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};

// Chart Colors (using primary/secondary theme)
export const CHART_COLORS = {
  primary: COLOR_CONFIG.primary.hex,
  secondary: COLOR_CONFIG.secondary.hex,
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  gray: "#6b7280",
};

// Dashboard Metrics Configuration
export const DASHBOARD_METRICS = {
  refreshInterval: 30000, // 30 seconds
  chartAnimationDuration: 1000,
  realtimeUpdates: true,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/csv",
  ],
  maxFiles: 5,
};

// Email Configuration
export const EMAIL_CONFIG = {
  templates: {
    welcome: "welcome",
    passwordReset: "password_reset",
    notification: "notification",
    support: "support_reply",
  },
  providers: {
    smtp: "smtp",
    sendgrid: "sendgrid",
    mailgun: "mailgun",
  },
};

// Security Configuration
export const SECURITY_CONFIG = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  maxLoginAttempts: 5,
  lockoutDuration: 2 * 60 * 1000, // 2 minutes
  otpLength: 6,
  otpExpiry: 10 * 60 * 1000, // 10 minutes
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableAnalytics: true,
  enableReports: true,
  enableNotifications: true,
  enableChat: true,
  enableFileUpload: true,
  enableExport: true,
  enableBulkActions: true,
  enableAdvancedFilters: true,
};

import toast from "react-hot-toast";
import axios from "axios";
import { DATE_CONFIG } from "../config/constants";

// Date formatting utilities
export const formatDate = (date, format = DATE_CONFIG.format) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
export const getStatusVariant = (status) => {
  switch (status.toLowerCase()) {
    case "open":
      return "danger"; // Red
    case "in progress":
      return "warning"; // Yellow
    case "resolved":
      return "success"; // Green
    case "archived":
      return "secondary"; // Gray
    default:
      return "info";
  }
};
export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US");
};

// String utilities
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50) => {
  if (!str) return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return "";
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  if (name.length <= 2) return `**@${parts[1]}`;
  return `${name[0]}***${name[name.length - 1]}@${parts[1]}`;
};

export const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 4) return "****";
  return `***-***-${cleaned.slice(-4)}`;
};

export const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return "";
  const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  
  if (cleaned.length >= 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const rest = cleaned.slice(cleaned.length - 10);
    const match = rest.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      if (countryCode) {
        return `+${countryCode} (${match[1]}) ${match[2]}-${match[3]}`;
      }
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  
  return phoneNumberString;
};

// Number utilities
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercentage = (num, fractionDigits = 2) => {
  return num
    ? num > 0
      ? `+${num?.toFixed(fractionDigits)}%`
      : `${num?.toFixed(fractionDigits)}%`
    : "0%";
};

export const getTrend = (num) => {
  if (num > 0) return "up";
  if (num < 0) return "down";
  return "neutral";
};

// Array utilities
export const sortBy = (array, key, direction = "asc") => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

export const filterBy = (array, filters) => {
  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
    });
  });
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]+$/;
  return re.test(phone);
};

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const handleError = (error) => {
  if (
    !error ||
    axios.isCancel(error) ||
    error?.name === "CanceledError" ||
    error?.code === "ERR_CANCELED" ||
    error?.message === "canceled" ||
    error?.__CANCEL__
  ) {
    return;
  }
  console.log(error);
  let msg = error?.response?.data?.message || error?.message || "Something went wrong";
  
  if (msg.includes("mapping for model") && msg.includes("already exists")) {
    msg = "This vehicle model already exists. Please use a unique model name.";
  }
  
  toast.error(msg);
};

export const handleSuccess = (message, customMessage) => {
  toast.success(message || customMessage || "Operation successful");
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Export to CSV utility
export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(",");
  const csvContent = [
    headers,
    ...data.map((row) =>
      Object.values(row)
        .map((value) => {
          if (value === null || value === undefined) return '""';
          const strValue = String(value);
          return `"${strValue.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const startOfDay = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

 export const endOfDay = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};
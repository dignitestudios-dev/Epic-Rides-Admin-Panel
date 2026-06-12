import axios from "axios";
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";

// Create an Axios instance

// const STAGING_BASE_URL = "https://api.staging.epicridesapp.com/api/admin/"; // Development URL
const STAGING_BASE_URL = "https://api.dev.epicridesapp.com/api/admin/"; // Production URL

const API = axios.create({
  baseURL: STAGING_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    // console.log("req token: ", token);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("authToken");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/auth/login";
      }
    }
    console.log(error);
    console.log("API Error:", error.response?.data || error);
    return Promise.reject(error);
  },
);

// Centralized API Handling functions start
const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    throw new Error(errorMessage);
  }
  throw new Error(error?.message || error || "An Unexpected error occurred");
};
const formatDateForApi = (date) => {
  if (!date) return "";
  if (date.includes("T")) return date;
  return `${date}T12:00:00.000Z`;
};

const handleApiResponse = (response) => {
  const responseData = response.data;
  console.log("API response run");

  // Check if success is false and throw an error
  if (!responseData.success) {
    throw new Error(
      responseData.message || "Something went wrong, Please try again!",
    );
  }

  return responseData; // Only return the response data {status, message, data}
};

const apiHandler = async (apiCall) => {
  try {
    const response = await apiCall();
    return handleApiResponse(response);
  } catch (error) {
    console.log(error);
    throw handleApiError(error);
  }
};

// Centralized API Handling functions end

// Auth APIs

const login = (credentials) =>
  apiHandler(() =>
    API.post(
      "login",
      { email: credentials.email, password: credentials.password },
      {
        headers: {
          deviceuniqueid: credentials.deviceuniqueid,
          devicemodel: credentials.devicemodel,
        },
      },
    ),
  );

const forgotPassword = (payload) =>
  apiHandler(() => API.post("forgot-password", payload));

const verifyOTP = (payload) =>
  apiHandler(() => API.post("verify-otp", payload));

const resetPassword = (payload) =>
  apiHandler(() => API.post("reset-password", payload));

const updatePassword = (payload) =>
  apiHandler(() => API.put("update-password", payload));

const updatePasswordAuth = (payload) =>
  apiHandler(() => API.post("/auth/update-password-auth", payload));

const logout = () => apiHandler(() => API.post("/auth/logout"));

// App Configs API
const getAppConfigs = () => apiHandler(() => API.get("/global/config"));

const updateAppConfigs = (payload) =>
  apiHandler(() => API.put("/global/config", payload));

const getDashboardStats = () => apiHandler(() => API.get("/dashboard-stats"));

const getRideAnalytics = () => apiHandler(() => API.get("/ride-analytics"));

// Products API
const createProduct = (productData) =>
  apiHandler(() =>
    API.post(`/product`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );

const getAllProducts = (
  search,
  status,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
) =>
  apiHandler(() =>
    API.get(
      `/product?page=${page}&limit=${limit}&search=${search}&status=${status}`,
    ),
  );

const updateProduct = (id, productData) =>
  apiHandler(() => API.put(`/product/${id}`, productData));

const deleteProduct = (id) => apiHandler(() => API.delete(`/product/${id}`));

const getProductById = (id) => apiHandler(() => API.get(`/product/${id}`));

// Categories API
const createCategory = (categoryData) =>
  apiHandler(() => API.post(`/category`, categoryData));

const getAllCategories = (
  status, // active or inactive
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
) =>
  apiHandler(() =>
    API.get(`/category?status=${status}&page=${page}&limit=${limit}`),
  );

const updateCategory = (id, categoryData) =>
  apiHandler(() => API.put(`/category/${id}`, categoryData));

const deleteCategory = (id) => apiHandler(() => API.delete(`/category/${id}`));

const getCategoryById = (id) => apiHandler(() => API.get(`/category/${id}`));

// Orders API
const getOrders = (
  paymentStatus,
  orderStatus,
  orderType,
  startDate,
  endDate,
  search,
  page = 1,
  limit = API_CONFIG.pagination.defaultPageSize,
) =>
  apiHandler(() =>
    API.get(
      `/order?paymentStatus=${paymentStatus}&orderStatus=${orderStatus}&orderType=${orderType}&startDate=${formatDateForApi(startDate)}&endDate=${formatDateForApi(endDate)}&search=${search}&page=${page}&limit=${limit}`,
    ),
  );

const getOrdersByContact = (contactEmail) =>
  apiHandler(() => API.get(`/order/contact?email=${contactEmail}`));

const getOrderById = (id) => apiHandler(() => API.get(`/order/${id}`));

const updateOrder = (id, orderData) =>
  apiHandler(() => API.put(`/order/${id}`, orderData));

const getAllDocs = (
  search,
  status,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
) =>
  apiHandler(() =>
    API.get(
      `/docs?status=${status}&page=${page}&limit=${limit}&search=${search}`,
    ),
  );
const getDriverDocs = (driverId) =>
  apiHandler(() => API.get(`/docs?driverId=${driverId}`));
const getDriverVehicles = (driverId) =>
  apiHandler(() => API.get(`/vehicles?driverId=${driverId}`));

const updateDocs = (documentsList = [], vehiclesList = []) =>
  apiHandler(() => {
    const mergedDocuments = [
      ...documentsList.map((d) => ({
        id: d.id || d._id,
        status: d.status,
        ...(d.rejectReason && { rejectReason: d.rejectReason }),
        ...(d.metadata && { metadata: d.metadata }),
      })),
      ...vehiclesList.map((v) => ({
        id: v.id || v._id,
        status: v.status,
        ...(v.rejectReason && { rejectReason: v.rejectReason }),
        ...(v.metadata && { metadata: v.metadata }),
      })),
    ];

    return API.put(`/docs/respond`, {
      documents: mergedDocuments,
    });
  });

// Vehicle Types API
const getAllVehicleTypes = (
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  search = "",
  rideType = "",
) =>
  apiHandler(() => {
    let url = `/vehicle-types?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (rideType) url += `&rideType=${rideType}`;
    return API.get(url);
  });

const createVehicleType = (payload) =>
  apiHandler(() => API.post("/vehicle-types", payload));

const updateVehicleType = (id, payload) =>
  apiHandler(() => API.put(`/vehicle-types/${id}`, payload));

const deleteVehicleType = (id) =>
  apiHandler(() => API.delete(`/vehicle-types/${id}`));

// User Management API
const getUsers = (
  type,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  search = "",
  startDate = "",
  endDate = "",
) =>
  apiHandler(() => {
    let url = `/users?type=${type}&page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatDateForApi(endDate)}`;
    return API.get(url);
  });

const exportUsers = (type, { status, sort, startDate, endDate, search, fields } = {}) => {
  const params = new URLSearchParams();
  params.append("type", type);
  if (status) params.append("status", status);
  if (sort) params.append("sort", sort);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (search) params.append("search", search);
  if (fields?.length) fields.forEach((f) => params.append("fields", f));
  // Bypass apiHandler — response is raw CSV, not JSON with {success}
  return API.get(`/users/export?${params.toString()}`, { responseType: "blob" });
};

const getDrivers = (
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  search = "",
  status = "",
) =>
  apiHandler(() => {
    let url = `/drivers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    return API.get(url);
  });

const getRequestsCount = () => apiHandler(() => API.get("/requests-count"));

const getUserDetail = (id, type) =>
  apiHandler(() => API.get(`/users/${id}?type=${type}`));

const updateUserStatus = (id, type, status) =>
  apiHandler(() => API.patch(`/users/${id}/status`, { type, status }));

const updateUser = (id, data) =>
  apiHandler(() =>
    API.patch(`/users/${id}`, data),
  );

const deleteUser = (id, type) =>
  apiHandler(() => API.delete(`/users/${id}?type=${type}`));

const getDriverTransactions = (driverId, page = 1, limit = 10) =>
  apiHandler(() => API.get(`/drivers/${driverId}/transactions?page=${page}&limit=${limit}`));

const getBirdsEyeView = () =>
  apiHandler(() => API.get("/birds-eye-view"));

const getSubscriptionRevenue = (
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
  status = "",
) =>
  apiHandler(() => {
    let url = `/subscription-revenue?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatDateForApi(endDate)}`;
    if (status) url += `&subscriptionStatus=${status}`;
    return API.get(url);
  });

const getWithdrawalRevenue = (
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
) =>
  apiHandler(() => {
    let url = `/withdrawals?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatDateForApi(endDate)}`;
    return API.get(url);
  });

const getReports = (page = 1, limit = 10, status = "", sort = "desc") =>
  apiHandler(() => {
    let url = `/reports?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return API.get(url);
  });

const getNotifications = (
  page = 1,
  limit = 10,
  search = "",
  sort = "desc",
  startDate = "",
  endDate = "",
) =>
  apiHandler(() => {
    let url = `/notifications?page=${page}&limit=${limit}&sort=${sort}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatDateForApi(endDate)}`;
    return API.get(url);
  });

const sendNotification = (payload) =>
  apiHandler(() => API.post("/notifications", payload));

const getAdminNotifications = (page = 1, limit = 10) =>
  apiHandler(() => API.get(`/notifications/mine?page=${page}&limit=${limit}`));

const getRides = (page = 1, limit = 10, search = "") =>
  apiHandler(() => {
    let url = `/rides?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return API.get(url);
  });

const resolveReport = (id, adminNotes = "") =>
  apiHandler(() => API.patch(`/reports/${id}/resolved`, { adminNotes }));

const getReportById = (id) => apiHandler(() => API.get(`/reports/${id}`));

// Promo Codes API
const getPromoCodes = (page = 1, limit = PAGINATION_CONFIG.defaultPageSize) =>
  apiHandler(() => API.get(`/promo-code?page=${page}&limit=${limit}`));

const createPromoCode = (payload) =>
  apiHandler(() => API.post("/promo-code", payload));

const updatePromoCode = (id, payload) =>
  apiHandler(() => API.patch(`/promo-code/${id}`, payload));

const deletePromoCode = (id) =>
  apiHandler(() => API.delete(`/promo-code/${id}`));

// Ride Rates & Peak Windows API
const getRideRates = () => apiHandler(() => API.get("/ride-rates"));

const updateRideRate = (rideType, payload) =>
  apiHandler(() => API.put(`/ride-rates/${rideType}`, payload));

const getPeakWindows = () => apiHandler(() => API.get("/peak-windows"));

const createPeakWindow = (payload) =>
  apiHandler(() => API.post("/peak-windows", payload));

const updatePeakWindow = (id, payload) =>
  apiHandler(() => API.put(`/peak-windows/${id}`, payload));

const deletePeakWindow = (id) =>
  apiHandler(() => API.delete(`/peak-windows/${id}`));

export const api = {
  getUsers,
  exportUsers,
  getDrivers,
  getRequestsCount,
  getUserDetail,
  getDriverDocs,
  getDriverVehicles,
  updateUserStatus,
  updateUser,
  deleteUser,
  getDriverTransactions,
  getBirdsEyeView,
  getSubscriptionRevenue,
  getWithdrawalRevenue,
  updateDocs,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updatePassword,
  updatePasswordAuth,
  logout,
  getAppConfigs,
  updateAppConfigs,
  getDashboardStats,
  getRideAnalytics,
  getAllProducts,
  getAllCategories,
  createProduct,
  createCategory,
  updateProduct,
  deleteProduct,
  getProductById,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getOrders,
  getOrdersByContact,
  getOrderById,
  updateOrder,
  getAllDocs,
  getAllVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  getReports,
  resolveReport,
  getReportById,
  getNotifications,
  sendNotification,
  getAdminNotifications,
  getRides,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getRideRates,
  updateRideRate,
  getPeakWindows,
  createPeakWindow,
  updatePeakWindow,
  deletePeakWindow,
};

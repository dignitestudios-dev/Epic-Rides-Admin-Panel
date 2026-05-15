import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Modal from "./components/ui/Modal";
import Button from "./components/ui/Button";
import { useAuth } from "./contexts/AuthContext";

// Auth pages
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import ChangePassword from "./pages/ChangePassword";
import Documentation from "./pages/Documentation";
import Notifications from "./pages/Notifications";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import SendEmail from "./pages/SendEmail";
import SupportTickets from "./pages/SupportTickets";
import Transactions from "./pages/Transactions";
import UserManagement from "./pages/DriverRequests";
import ChatSupport from "./pages/ChatSupport";

import "./App.css";
import { Toaster } from "react-hot-toast";
import Categories from "./pages/Categories";
import Configurations from "./pages/Configurations";
import ContentManagement from "./pages/ContentManagement";
import ReportDetail from "./pages/ReportDetail";
import Emergencies from "./pages/Emergencie";
import UserDetailPage from "./pages/UserDetailPage";
import DriverDetails from "./pages/DriverDetails";
import DriverRequests from "./pages/DriverRequests";
import TermCondition from "./pages/TermCondtion";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import VehicleCategoryManagement from "./pages/VehicleCategory";
import RiderDetail from "./pages/RiderDetail";
import DriverDetail from "./pages/DriverDetail";

import Revenue from "./pages/Revenue";
import PromoCodes from "./pages/PromoCodes";
import CancelledRides from "./pages/CancelledRides";
import BirdsEyeView from "./pages/BirdsEyeView";

const SessionTimeoutModal = () => {
  const { showTimeoutModal, setShowTimeoutModal } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    setShowTimeoutModal(false);
    navigate("/auth/login");
  };

  return (
    <Modal
      isOpen={showTimeoutModal}
      onClose={handleClose}
      title="Session Expired"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Your session has expired due to 5 minutes of inactivity. Please log in
          again to continue.
        </div>
        <Button
          onClick={handleClose}
          className="w-full"
          variant="primary"
        >
          Login Again
        </Button>
      </div>
    </Modal>
  );
};

function App() {
  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Router>
              <Routes>
                <Route path="/terms-conditions" element={<TermCondition />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />

                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />

                <Route path="/auth/verify-otp" element={<VerifyOTP />} />

                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />

                <Route path="/d/docs" element={<Documentation />} />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to={"/dashboard"} />}
                        />

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route
                          path="/change-password"
                          element={<ChangePassword />}
                        />

                        {/* <Route path="/products">
                            <Route path="" element={<Products />} />
                            <Route path="categories" element={<Categories />} />
                          </Route> */}

                        <Route path="/user-management" element={<Users />} />
                        <Route
                          path="/user-management/rider/:id"
                          element={<RiderDetail />}
                        />
                        <Route
                          path="/user-management/driver/:id"
                          element={<DriverDetail />}
                        />
                        <Route
                          path="/vehicle-category"
                          element={<VehicleCategoryManagement />}
                        />
                        <Route path="/orders" element={<Orders />} />
                        <Route
                          path="/driver-requests"
                          element={<DriverRequests />}
                        />
                        <Route
                          path="/driver/:id"
                          element={<DriverDetails />}
                        />
                        <Route
                          path="/content-management"
                          element={<ContentManagement />}
                        />
                        <Route path="/reports" element={<Reports />} />
                        <Route
                          path="/reports-management"
                          element={<SupportTickets />}
                        />
                        <Route path="/revenue" element={<Revenue />} />
                        <Route path="/promo-codes" element={<PromoCodes />} />
                        <Route path="/cancelled-rides" element={<CancelledRides />} />
                        <Route path="/birds-eye-view" element={<BirdsEyeView />} />
                        <Route
                          path="/reports-detail/:id"
                          element={<ReportDetail />}
                        />
                        <Route
                          path="/notifications"
                          element={<Notifications />}
                        />
                        <Route path="/history" element={<Emergencies />} />
                        <Route
                          path="/user-detail/:id"
                          element={<UserDetailPage />}
                        />
                        <Route path="/settings">
                          <Route
                            path=""
                            element={
                              <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  Settings
                                </h1>
                              </div>
                            }
                          />
                          <Route
                            path="change-password"
                            element={<ChangePassword />}
                          />
                          <Route path="configs" element={<Configurations />} />
                        </Route>

                        <Route path="/docs" element={<Documentation />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                  }
                />
              </Routes>
              <SessionTimeoutModal />
            </Router>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>

      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}

export default App;

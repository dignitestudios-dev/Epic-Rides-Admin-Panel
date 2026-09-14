import React, { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { AUTH_ROUTES } from "../../config/constants";
import AuthLayout from "../../components/layout/AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading, isLockedOut, remainingLockTime } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Validate redirect path to prevent open redirect vulnerabilities
  const isValidRedirect = (url) => {
    if (!url || typeof url !== "string") return false;
    if (!url.startsWith("/") || url.startsWith("//")) return false;
    if (url.startsWith("/auth")) return false;
    return true;
  };

  const getRedirectUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    const queryRedirect =
      searchParams.get("redirect") || searchParams.get("redirectUrl");
    if (isValidRedirect(queryRedirect)) {
      return queryRedirect;
    }

    const storedAutoRedirect = sessionStorage.getItem("autoLogoutRedirectUrl");
    if (isValidRedirect(storedAutoRedirect)) {
      return storedAutoRedirect;
    }

    return "/dashboard";
  };

  const clearAutoRedirect = () => {
    sessionStorage.removeItem("autoLogoutRedirectUrl");
    sessionStorage.removeItem("redirectUrl");
  };

  if (user) {
    const destination = getRedirectUrl();
    clearAutoRedirect();
    return <Navigate to={destination} replace />;
  }

  useEffect(() => {
    if (!isLockedOut) {
      setError((prev) => {
        if (prev && prev.includes("locked")) return "";
        return prev;
      });
    }
  }, [isLockedOut]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result?.success) {
      const destination = getRedirectUrl();
      clearAutoRedirect();
      navigate(destination, { replace: true });
    }
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your email and password to access the admin portal."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 px-3.5 py-2.5 rounded-lg text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {isLockedOut && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 px-3.5 py-2.5 rounded-lg text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Account temporarily locked
            </p>
            <p className="text-[11px] leading-relaxed text-amber-600 dark:text-amber-300">
              Too many failed login attempts. Please wait{" "}
              <span className="font-medium">
                {Math.floor(remainingLockTime / 60000)}m{" "}
                {Math.floor((remainingLockTime % 60000) / 1000)}s
              </span>{" "}
              before trying again.
            </p>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              placeholder="name@epicrides.com"
              disabled={loading || isLockedOut}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
              >
                Password
              </label>
              <Link
                to={AUTH_ROUTES.FORGOT_PASSWORD}
                className="text-xs font-medium text-[#61CB08] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              maxLength={64}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                  disabled={loading || isLockedOut}
                >
                  {!showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              placeholder="••••••••••••"
              disabled={loading || isLockedOut}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            size="md"
            variant="primary"
            className="w-full text-black font-bold h-11"
            disabled={loading || isLockedOut}
            loading={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;

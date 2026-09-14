import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle2, Check, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useForm } from "react-hook-form";
import { SECURITY_CONFIG, AUTH_ROUTES } from "../../config/constants";
import { useAuth } from "../../contexts/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";

const ResetPassword = () => {
  const { loadingAuthActions, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    const verified = location.state?.verified;
    if (!email || !verified) {
      navigate(AUTH_ROUTES.LOGIN);
    }
  }, [email, location.state?.verified, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const watchPassword = watch("password", "");

  const validatePassword = (password) => {
    const validationErrors = [];

    if (password.length < SECURITY_CONFIG.passwordMinLength) {
      validationErrors.push(`At least ${SECURITY_CONFIG.passwordMinLength} characters`);
    }

    if (SECURITY_CONFIG.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      validationErrors.push("One uppercase letter");
    }

    if (SECURITY_CONFIG.passwordRequireLowercase && !/[a-z]/.test(password)) {
      validationErrors.push("One lowercase letter");
    }

    if (SECURITY_CONFIG.passwordRequireNumbers && !/\d/.test(password)) {
      validationErrors.push("One number");
    }

    if (
      SECURITY_CONFIG.passwordRequireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      validationErrors.push("One special character");
    }

    return validationErrors.length === 0
      ? true
      : `Password must contain: ${validationErrors.join(", ")}`;
  };

  const onSubmit = async (data) => {
    setSubmitError("");
    const payload = {
      email: email,
      newPassword: data.password,
    };

    const response = await resetPassword(payload);

    if (response?.success) {
      setIsSuccess(true);
    } else {
      setSubmitError(response?.error || "Failed to reset password. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been changed successfully."
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-[#61CB08]/10 border border-[#61CB08]/20 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-[#61CB08] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
              Your account password has been updated. You can now use your new password to sign in.
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              size="md"
              variant="primary"
              onClick={() => navigate(AUTH_ROUTES.LOGIN)}
              className="w-full text-black font-bold h-11"
            >
              Sign in with new password
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter a new password for your account below."
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {submitError && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 px-3.5 py-2.5 rounded-lg text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-500" />
            <span className="font-medium">{submitError}</span>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
            >
              New password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                maxLength: {
                  value: 64,
                  message: "Password cannot exceed 64 characters",
                },
                validate: validatePassword,
              })}
              error={errors.password?.message}
              maxLength={64}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              disabled={loadingAuthActions}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
            >
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              placeholder="••••••••••••"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                maxLength: {
                  value: 64,
                  message: "Password cannot exceed 64 characters",
                },
                validate: (value) =>
                  value === watchPassword || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
              maxLength={64}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              disabled={loadingAuthActions}
            />
          </div>
        </div>

        {/* Live password requirements (Clean, Minimalist) */}
        {watchPassword && (
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#131824] border border-gray-200/80 dark:border-[#222b3d] space-y-1.5 text-xs">
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
              Password requirements:
            </p>
            <div className="space-y-1 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  watchPassword.length >= SECURITY_CONFIG.passwordMinLength
                    ? "text-[#61CB08] font-medium"
                    : "text-gray-400"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>At least {SECURITY_CONFIG.passwordMinLength} characters</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  /[A-Z]/.test(watchPassword)
                    ? "text-[#61CB08] font-medium"
                    : "text-gray-400"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>One uppercase letter</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  /[a-z]/.test(watchPassword)
                    ? "text-[#61CB08] font-medium"
                    : "text-gray-400"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>One lowercase letter</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  /\d/.test(watchPassword)
                    ? "text-[#61CB08] font-medium"
                    : "text-gray-400"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>One number</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  /[!@#$%^&*(),.?":{}|<>]/.test(watchPassword)
                    ? "text-[#61CB08] font-medium"
                    : "text-gray-400"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>One special character</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            size="md"
            variant="primary"
            className="w-full text-black font-bold h-11"
            loading={loadingAuthActions}
            disabled={loadingAuthActions}
          >
            {loadingAuthActions ? "Updating password..." : "Update password"}
          </Button>

          <div className="text-center pt-2">
            <Link
              to={AUTH_ROUTES.LOGIN}
              className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to sign in
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;

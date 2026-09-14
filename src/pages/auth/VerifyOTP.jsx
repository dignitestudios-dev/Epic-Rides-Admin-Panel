import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertCircle, Clock } from "lucide-react";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { AUTH_ROUTES } from "../../config/constants";
import AuthLayout from "../../components/layout/AuthLayout";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loadingResend, setLoadingResend] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { loadingAuthActions, verifyOTP, forgotPassword } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const displayEmail = location.state?.email;

  const TIMER_KEY = "otp_timer_expiry";

  useEffect(() => {
    if (!displayEmail) {
      navigate(AUTH_ROUTES.LOGIN);
    }
  }, [displayEmail, navigate]);

  useEffect(() => {
    const savedExpiry = localStorage.getItem(TIMER_KEY);
    const now = Date.now();

    if (savedExpiry) {
      const expiryTime = parseInt(savedExpiry);
      const remainingTime = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remainingTime);
      setCanResend(remainingTime === 0);
    } else {
      const expiryTime = now + 600 * 1000;
      localStorage.setItem(TIMER_KEY, expiryTime.toString());
      setTimeLeft(600);
    }
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      localStorage.removeItem(TIMER_KEY);
    }
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (otpValue = otp.join("")) => {
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError("");

    const payload = {
      email: displayEmail,
      otp: otpValue,
    };

    const response = await verifyOTP(payload);

    if (response?.success) {
      localStorage.removeItem(TIMER_KEY);
      navigate(AUTH_ROUTES.RESET_PASSWORD, {
        state: { email: displayEmail, verified: true },
      });
    } else {
      setError(response?.error || "Invalid verification code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setError("");
    setLoadingResend(true);

    const payload = {
      email: displayEmail,
    };
    const success = await forgotPassword(payload);

    if (success) {
      const now = Date.now();
      const newExpiry = now + 600 * 1000;
      localStorage.setItem(TIMER_KEY, newExpiry.toString());

      setTimeLeft(600);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setError("Failed to resend code. Please try again.");
    }

    setLoadingResend(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <AuthLayout
      title="Enter verification code"
      subtitle={`We sent a 6-digit code to ${displayEmail || "your email"}.`}
    >
      <div className="space-y-5">
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 px-3.5 py-2.5 rounded-lg text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* 6 Digit Inputs */}
        <div className="space-y-2">
          <div className="flex gap-2 sm:gap-2.5 justify-center items-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loadingAuthActions || loadingResend}
                className="w-10 sm:w-11 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-[#222b3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#61CB08]/20 focus:border-[#61CB08] bg-white dark:bg-[#131824] text-gray-900 dark:text-white transition-all disabled:opacity-50"
              />
            ))}
          </div>
        </div>

        {/* Timer status */}
        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Code expires in {formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-xs text-rose-500 font-medium">
              Code has expired. Please request a new one.
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="space-y-3 pt-1">
          <Button
            type="button"
            size="md"
            variant="primary"
            onClick={() => handleSubmit()}
            className="w-full text-black font-bold h-11"
            loading={loadingAuthActions && !loadingResend}
            disabled={
              loadingAuthActions ||
              loadingResend ||
              otp.some((digit) => !digit)
            }
          >
            {loadingAuthActions && !loadingResend
              ? "Verifying..."
              : "Verify code"}
          </Button>

          {/* Resend & Return to Login */}
          <div className="flex items-center justify-between text-xs pt-2">
            <div>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loadingAuthActions || loadingResend}
                  className="font-medium text-[#61CB08] hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingResend ? "animate-spin" : ""}`} />
                  {loadingResend ? "Resending..." : "Resend code"}
                </button>
              ) : (
                <span className="text-gray-400 dark:text-slate-500">
                  Resend in {formatTime(timeLeft)}
                </span>
              )}
            </div>

            <Link
              to={AUTH_ROUTES.LOGIN}
              onClick={() => {
                localStorage.removeItem(TIMER_KEY);
              }}
              className="inline-flex items-center font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;

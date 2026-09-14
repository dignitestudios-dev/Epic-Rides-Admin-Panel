import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useForm } from "react-hook-form";
import { validateEmail } from "../../utils/helpers";
import { useAuth } from "../../contexts/AuthContext";
import { AUTH_ROUTES } from "../../config/constants";
import AuthLayout from "../../components/layout/AuthLayout";

const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { loadingAuthActions, forgotPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      email: data?.email,
    };
    const success = await forgotPassword(payload);
    if (success) {
      setIsEmailSent(true);
    }
  };

  if (isEmailSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We've sent a 6-digit verification code to ${getValues("email")}.`}
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-[#61CB08]/10 border border-[#61CB08]/20 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-[#61CB08] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
              Please check your inbox (and spam folder) for the 6-digit one-time code to proceed with resetting your password.
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <Link
              to={AUTH_ROUTES.VERIFY_OTP}
              state={{ email: getValues("email") }}
              className="block"
            >
              <Button
                type="button"
                size="md"
                variant="primary"
                className="w-full text-black font-bold h-11"
              >
                Enter verification code
              </Button>
            </Link>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setIsEmailSent(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Didn't get code?{" "}
                <span className="font-semibold text-[#61CB08] hover:underline">
                  Try again
                </span>
              </button>

              <Link
                to={AUTH_ROUTES.LOGIN}
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
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email address associated with your account and we'll send you a verification code."
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
          >
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@epicrides.com"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
              validate: (value) =>
                validateEmail(value) || "Please enter a valid email address",
            })}
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            disabled={loadingAuthActions}
          />
        </div>

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            size="md"
            variant="primary"
            className="w-full text-black font-bold h-11"
            loading={loadingAuthActions}
            disabled={loadingAuthActions}
          >
            {loadingAuthActions ? "Sending code..." : "Send verification code"}
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

export default ForgotPassword;

import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import AuthMapShowcase from "./AuthMapShowcase";

const AuthLayout = ({ children, title, subtitle }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0d14] text-gray-900 dark:text-slate-100 flex transition-colors duration-200 overflow-x-hidden">
      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        {/* ── Left Column: Interactive Auth Form ─────────────────────────────── */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-white dark:bg-[#0a0d14] relative z-20">
          {/* Top Bar: Brand Logo + Theme Switcher */}
          <div className="flex items-center justify-between">
            <Link to="/auth/login" className="flex items-center gap-2.5 group">
              <img
                src="/images/logo.png"
                alt="Epic Rides"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.png";
                }}
              />
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                  Epic Rides
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 dark:bg-[#161c28] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-[#222b3d]">
                  Admin
                </span>
              </div>
            </Link>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#161c28] hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200/80 dark:border-[#222b3d]"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform" />
              )}
            </button>
          </div>

          {/* Form Content Area */}
          <div className="w-full max-w-md mx-auto my-auto py-8">
            {(title || subtitle) && (
              <div className="mb-6 text-left space-y-1">
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {children}
          </div>

          {/* Clean Footer */}
          <div className="pt-6 border-t border-gray-100 dark:border-[#141b28] text-xs text-gray-400 dark:text-slate-500">
            <p>© {new Date().getFullYear()} Epic Rides Inc. All rights reserved.</p>
          </div>
        </div>

        {/* ── Right Column: Map & Car Showcase (Wide Cinematic with Left Fade Mask) ── */}
        <div className="hidden lg:block lg:col-span-7 xl:col-span-7 h-full relative overflow-hidden bg-[#eef3f8] dark:bg-[#070a10]">
          {/* Smooth Left Fade Mask: Blends the map seamlessly into the form */}
          <div className="absolute inset-y-0 left-0 w-32 xl:w-44 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#0a0d14] dark:via-[#0a0d14]/80 dark:to-transparent z-10 pointer-events-none" />

          {/* Map Showcase Component */}
          <AuthMapShowcase />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

const AuthMapShowcase = () => {
  const { isDark } = useTheme();

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden flex items-center justify-center select-none bg-[#f8fafc] dark:bg-[#070a10] transition-colors duration-300">
      {/* ── Keyframe Animations: Smooth Glitch-Free 60fps Fluid Flow ───────── */}
      <style>{`
        /* Exact 40px period loop: (28+12 = 40) -> 80px offset ensures 100% continuous, stutter-free flow */
        @keyframes waterFlowContinuous {
          0% {
            stroke-dashoffset: 80;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes destPulseRing {
          0% {
            r: 10px;
            opacity: 0.9;
          }
          100% {
            r: 34px;
            opacity: 0;
          }
        }
        .flow-fluid-seamless {
          animation: waterFlowContinuous 1.35s linear infinite;
        }
        .flow-highlight-seamless {
          animation: waterFlowContinuous 1.35s linear infinite;
        }
        .dest-ripple-anim {
          animation: destPulseRing 2.2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
      `}</style>

      {/* ── Real Cartographic Map Image Layer (Light & Dark) ────────────────── */}
      <img
        src={isDark ? "/images/map-dark.png" : "/images/map-light.png"}
        alt="Real-time Map"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300 scale-[1.03]"
      />

      {/* Subtle Map Atmosphere / Tint Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? "bg-gradient-to-b from-[#070a10]/40 via-transparent to-[#070a10]/60"
            : "bg-gradient-to-b from-white/20 via-transparent to-white/30"
        }`}
      />

      {/* ── Vector Navigation Overlay: Polyline & Stationary White Car ──────── */}
      <svg
        className="w-full h-full object-cover absolute inset-0 pointer-events-none"
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Route path tracing actual geographic avenue across bridge into downtown */}
          <path
            id="realGeoRoutePath"
            d="M 620 750 L 595 650 L 580 520 L 575 420 L 635 320 L 720 230"
          />

          {/* Green Glowing Filter */}
          <filter id="greenFluidAura" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Car Soft Drop Shadow */}
          <filter id="carGroundShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.65 0"
            />
          </filter>
        </defs>

        {/* Polyline Layer 1: Ambient Outer Green Casing */}
        <use
          href="#realGeoRoutePath"
          fill="none"
          stroke="#61CB08"
          strokeWidth={isDark ? "22" : "18"}
          strokeOpacity={isDark ? "0.22" : "0.28"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Polyline Layer 2: Pipe Conduit Base */}
        <use
          href="#realGeoRoutePath"
          fill="none"
          stroke={isDark ? "#0d1f11" : "#daf5c7"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Polyline Layer 3: Main Flowing Liquid Stream (Seamless 40px cycle: 28+12) */}
        <use
          href="#realGeoRoutePath"
          fill="none"
          stroke="#61CB08"
          strokeWidth="7"
          strokeDasharray="28 12"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flow-fluid-seamless"
        />

        {/* Polyline Layer 4: Running Water Reflection Pulses (Seamless 40px cycle: 10+30) */}
        <use
          href="#realGeoRoutePath"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeDasharray="10 30"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isDark ? "0.95" : "0.85"}
          className="flow-highlight-seamless"
        />

        {/* Polyline Layer 5: Lime Flow Core (Seamless 40px cycle: 6+34) */}
        <use
          href="#realGeoRoutePath"
          fill="none"
          stroke="#9dfc3d"
          strokeWidth="2"
          strokeDasharray="6 34"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flow-fluid-seamless"
        />

        {/* ── Destination Waypoint (Point B at 720, 230) ────────────────────── */}
        <g transform="translate(720, 230)">
          <circle className="dest-ripple-anim" fill="none" stroke="#61CB08" strokeWidth="2.5" />
          <circle r="22" fill={isDark ? "#ffffff" : "#0f172a"} opacity="0.18" />
          <circle r="12" fill={isDark ? "#ffffff" : "#0f172a"} />
          <circle r="5" fill="#61CB08" />
        </g>

        {/* ── Real White Luxury Car (Stationary at Start of Polyline: 620, 750) ─ */}
        {/* Placed at road origin, rotated -14° along the exact direction of the real avenue */}
        <g transform="translate(620, 750) rotate(-14)">
          {/* Pickup Point Green Radial Glow */}
          <circle cx="0" cy="8" r="28" fill="#61CB08" opacity={isDark ? "0.4" : "0.28"} filter="url(#greenFluidAura)" />

          {/* Realistic Ground Soft Drop Shadow */}
          <ellipse cx="0" cy="6" rx="22" ry="46" fill="#000000" filter="url(#carGroundShadow)" opacity={isDark ? "0.85" : "0.55"} />

          {/* Real High-Resolution White Luxury Sedan Image */}
          <image
            href="/images/white-car.png"
            x="-20"
            y="-44"
            width="40"
            height="88"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      </svg>
    </div>
  );
};

export default AuthMapShowcase;

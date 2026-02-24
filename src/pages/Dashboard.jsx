import React, { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import Card from "../components/ui/Card";
import StatsCard from "../components/common/StatsCard";
import { useApp } from "../contexts/AppContext";
import UserGrowthChart from "../components/ui/UserGrowthChart";
import RevenueTrendChart from "../components/ui/RevenueTrendChart";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/common/Calender";

const Dashboard = () => {
  const { dashboardAnalytics } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [rideshowCalendar, setRideShowCalendar] = useState(false);
  const [revenueShowCalendar, setRevenueShowCalendar] = useState(false);

  const [ridecustomRange, setRideCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [revenuecustomRange, setRevenueCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  // ------------------ USER STATS ------------------
  const userStats = useMemo(
    () => [
      {
        title: "Total Users",
        value: dashboardAnalytics?.userStats?.total || 0,
        icon: <Users />,
      },
      {
        title: "Active Users",
        value: dashboardAnalytics?.userStats?.active || 0,
        icon: <UserCheck />,
      },
      {
        title: "Inactive Users",
        value: dashboardAnalytics?.userStats?.inactive || 0,
        icon: <UserX />,
      },
      {
        title: "New Signups Today",
        value: dashboardAnalytics?.userStats?.today || 0,
        icon: <UserCheck />,
      },
    ],
    [dashboardAnalytics]
  );

  // ------------------ DRIVER STATS ------------------
  const driverStats = useMemo(
    () => [
      {
        title: "Total Drivers",
        value: dashboardAnalytics?.driverStats?.total || 0,
        icon: <Users />,
      },
      {
        title: "Active Drivers",
        value: dashboardAnalytics?.driverStats?.active || 0,
        icon: <UserCheck />,
      },
      {
        title: "Suspended Drivers",
        value: dashboardAnalytics?.driverStats?.suspended || 0,
        icon: <UserX />,
      },
    ],
    [dashboardAnalytics]
  );
  const rideStatsStatic = [
    {
      title: "Total Rides",
      value: "12.4k",
      icon: <Activity className="text-blue-600" />,
    },
    {
      title: "Completed Rides",
      value: "9.8k",
      icon: <Activity className="text-green-600" />,
    },
    {
      title: "Cancelled by Users",
      value: "1.21k",
      icon: <UserX className="text-red-500" />,
    },
    {
      title: "Cancelled by Drivers",
      value: "980",
      icon: <UserX className="text-orange-500" />,
    },
    {
      title: "Avg Ride Rating",
      value: "4.7",
      icon: <TrendingUp className="text-yellow-500" />,
    },
  ];

  const revenueStatsStatic = [
    {
      title: "Total Revenue",
      value: "$142k",
      icon: <CreditCard className="text-purple-600" />,
    },
    {
      title: "Withdrawal Fees",
      value: "$12.4k",
      icon: <CreditCard className="text-indigo-600" />,
    },
    {
      title: "Revenue Today",
      value: "$1,920",
      icon: <TrendingUp className="text-green-600" />,
    },
    {
      title: "Revenue This Week",
      value: "$18.3k",
      icon: <TrendingUp className="text-blue-600" />,
    },
  ];
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex space-x-2">
          <button
            className="btn-primary"
            onClick={() => navigate("/notifications")}
          >
            Send Notification
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/reports")}
          >
            Generate Report
          </button>
          <button
            className="btn-danger"
            onClick={() => navigate("/emergency-management")}
          >
            View Emergencies
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4  pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-semibold ${activeTab === "users"
            ? "border-b-2 border-green-600 text-green-600"
            : "text-gray-600"
            }`}
        >
          Users
        </button>

        <button
          onClick={() => setActiveTab("drivers")}
          className={`px-4 py-2 font-semibold ${activeTab === "drivers"
            ? "border-b-2 border-green-600 text-green-600"
            : "text-gray-600"
            }`}
        >
          Drivers
        </button>
      </div>

      {/* Stats Cards by Tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(activeTab === "users" ? userStats : driverStats).map(
          (stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              colored
              index={index}
            />
          )
        )}
      </div>
      {/* ======= FILTERS + TRAFFIC STYLE BOX SECTION ======= */}

      {/* ======= FILTERS + TRAFFIC STYLE BOX SECTION ======= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex gap-6 justify-between items-center">
            <h2 className="text-lg font-bold mb-5">Ride Statistics</h2>

            <div className="flex flex-wrap gap-4 mb-8 relative">
              <select
                className="border rounded-lg px-3 py-2"

              >
                <option disabled selected>Ride Type</option>
                <option>Economic</option>
                <option>Luxury</option>
                <option>Carpool</option>
              </select>
              <select
                className="border rounded-lg px-3 py-2"
                onChange={(e) => {
                  if (e.target.value === "Custom") {
                    setRideShowCalendar(true);
                  } else {
                    setRideShowCalendar(false);
                  }
                }}
              >
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom</option>
              </select>
              <div className="absolute -right-40 top-10">

                {rideshowCalendar && (
                  <Calendar
                    customRange={ridecustomRange}
                    setCustomRange={setRideCustomRange}
                    onClose={() => setRideShowCalendar(false)}
                    onApply={() => {
                      console.log(ridecustomRange);
                      setRideShowCalendar(false);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {rideStatsStatic.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-gray-50 shadow-sm flex flex-col gap-1"
              >
                <div className="text-xl">{item.icon}</div>
                <p className="text-xs text-gray-500">{item.title}</p>
                <h3 className="text-lg font-bold">{item.value}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex gap-2 justify-between flex-nowrap items-center">
            <h2 className="text-lg font-bold mb-5">Revenue Summary</h2>

            <div className="flex  gap-4 mb-8 relative">
              <select
                className="border rounded-lg px-3 py-2"
                onChange={(e) => {
                  if (e.target.value === "Custom") {
                    setRevenueShowCalendar(true);
                  } else {
                    setRevenueShowCalendar(false);
                  }
                }}
              >
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom</option>
              </select>
              <div className="absolute -right-40 top-10">
                {revenueShowCalendar && (
                  <Calendar
                    customRange={revenuecustomRange}
                    setCustomRange={setRevenueCustomRange}
                    onClose={() => setRevenueShowCalendar(false)}
                    onApply={() => {
                      console.log(revenuecustomRange);
                      setRevenueShowCalendar(false);
                    }}
                  />
                )}
              </div>
              {/* <select className="border rounded-lg px-3 py-2">
                <option>All Cities</option>
                <option>City A</option>
                <option>City B</option>
              </select>

              <select className="border rounded-lg px-3 py-2">
                <option>All States</option>
                <option>State A</option>
                <option>State B</option>
              </select> */}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {revenueStatsStatic.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-gray-50 shadow-sm flex flex-col gap-1"
              >
                <div className="text-xl">{item.icon}</div>
                <p className="text-xs text-gray-500">{item.title}</p>
                <h3 className="text-lg font-bold">{item.value}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ----------- EXTRA SECTIONS SAME RAHENGE ----------- */}


      <Card.Content >
        <UserGrowthChart />
      </Card.Content>

    </div>
  );
};

export default Dashboard;

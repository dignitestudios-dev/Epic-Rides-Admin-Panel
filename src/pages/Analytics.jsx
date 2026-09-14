import { useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  BarChart3,
} from "lucide-react";
import StatsCard from "../components/common/StatsCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { formatCurrency, formatPercent } from "../utils/helpers";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Select from "../components/ui/Select";
import { CHART_COLORS } from "../config/constants";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("7d");

  // Sample data - in real app, this would come from API
  const [userGrowthData] = useState([
    { date: "2024-01-01", users: 1200, newUsers: 45, activeUsers: 890 },
    { date: "2024-01-02", users: 1245, newUsers: 52, activeUsers: 920 },
    { date: "2024-01-03", users: 1297, newUsers: 38, activeUsers: 950 },
    { date: "2024-01-04", users: 1335, newUsers: 67, activeUsers: 980 },
    { date: "2024-01-05", users: 1402, newUsers: 58, activeUsers: 1020 },
    { date: "2024-01-06", users: 1460, newUsers: 49, activeUsers: 1050 },
    { date: "2024-01-07", users: 1509, newUsers: 71, activeUsers: 1100 },
  ]);

  const [revenueData] = useState([
    { month: "Jan", revenue: 45000, subscriptions: 320, oneTime: 12000 },
    { month: "Feb", revenue: 52000, subscriptions: 380, oneTime: 15000 },
    { month: "Mar", revenue: 48000, subscriptions: 350, oneTime: 13500 },
    { month: "Apr", revenue: 61000, subscriptions: 420, oneTime: 18000 },
    { month: "May", revenue: 55000, subscriptions: 390, oneTime: 16500 },
    { month: "Jun", revenue: 67000, subscriptions: 450, oneTime: 21000 },
  ]);

  const [deviceData] = useState([
    { name: "Desktop", value: 45, color: "#61CB08" },
    { name: "Mobile", value: 35, color: "#3b82f6" },
    { name: "Tablet", value: 20, color: "#a855f7" },
  ]);

  const [trafficSources] = useState([
    { source: "Direct", visitors: 3200, percentage: 35 },
    { source: "Google", visitors: 2800, percentage: 30 },
    { source: "Social Media", visitors: 1800, percentage: 20 },
    { source: "Email", visitors: 900, percentage: 10 },
    { source: "Referral", visitors: 450, percentage: 5 },
  ]);

  const [topPages] = useState([
    { page: "/dashboard", views: 12500, uniqueViews: 8900, bounceRate: 25 },
    { page: "/profile", views: 8900, uniqueViews: 6700, bounceRate: 30 },
    { page: "/settings", views: 6700, uniqueViews: 5200, bounceRate: 35 },
    { page: "/billing", views: 4500, uniqueViews: 3800, bounceRate: 20 },
    { page: "/support", views: 3200, uniqueViews: 2900, bounceRate: 40 },
  ]);

  const handleExport = () => {
    const csvData = [
      ["Date", "Total Users", "New Users", "Active Users"],
      ...userGrowthData.map((row) => [
        row.date,
        row.users,
        row.newUsers,
        row.activeUsers,
      ]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.csv";
    a.click();
  };

  // Calculate key metrics
  const totalUsers = userGrowthData[userGrowthData.length - 1]?.users || 0;
  const newUsersToday =
    userGrowthData[userGrowthData.length - 1]?.newUsers || 0;
  const activeUsersToday =
    userGrowthData[userGrowthData.length - 1]?.activeUsers || 0;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / revenueData.length;

  const rawGrowthRate =
    userGrowthData.length > 1
      ? ((userGrowthData[userGrowthData.length - 1].users -
          userGrowthData[0].users) /
          userGrowthData[0].users) *
        100
      : 0;
  const userGrowthRate = formatPercent(rawGrowthRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#61CB08]" />
            Analytics Overview
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            System performance, conversion funnel, and growth telemetry
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "1y", label: "Last year" },
            ]}
          />
          <Button
            variant="outline"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          change={userGrowthRate}
          changeType="increase"
          colored
          index={0}
        />
        <StatsCard
          title="New Users Today"
          value={newUsersToday.toLocaleString()}
          icon={<TrendingUp className="w-5 h-5" />}
          change="+12%"
          changeType="increase"
          colored
          index={1}
        />
        <StatsCard
          title="Active Daily Users"
          value={activeUsersToday.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          change="+8%"
          changeType="increase"
          colored
          index={2}
        />
        <StatsCard
          title="Avg Monthly Revenue"
          value={formatCurrency(avgRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          change="+15%"
          changeType="increase"
          colored
          index={3}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            User Growth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
                }
                tick={{ fontSize: 11, fill: "#888" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#888" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#181d24", borderColor: "#2b323c", borderRadius: 8, color: "#fff" }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString()
                }
                formatter={(value, name) => [value.toLocaleString(), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="users"
                stackId="1"
                stroke="#61CB08"
                fill="#61CB08"
                fillOpacity={0.25}
                name="Total Users"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stackId="2"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                name="Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Monthly Revenue Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} tick={{ fontSize: 11, fill: "#888" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#181d24", borderColor: "#2b323c", borderRadius: 8, color: "#fff" }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="subscriptions"
                stackId="a"
                fill="#61CB08"
                radius={[0, 0, 0, 0]}
                name="Subscriptions"
              />
              <Bar
                dataKey="oneTime"
                stackId="a"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Ride Bookings"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Usage */}
        <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Device Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#181d24", borderColor: "#2b323c", borderRadius: 8, color: "#fff" }}
                formatter={(val, name) => [`${val}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Traffic Acquisition Sources
          </h3>
          <div className="space-y-4 pt-2">
            {trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#61CB08]" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {source.source}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {source.visitors.toLocaleString()} visits
                  </span>
                  <div className="w-24 bg-gray-100 dark:bg-[#1f242b] rounded-full h-2">
                    <div
                      className="bg-[#61CB08] h-2 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white w-8 text-right">
                    {source.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-[#1f242b]">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Top Application Screen Views
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/75 dark:bg-[#181d24]/75 border-b border-gray-200 dark:border-[#1f242b]">
              <tr>
                <th className="px-6 py-3 font-semibold">Page / Screen</th>
                <th className="px-6 py-3 font-semibold">Page Views</th>
                <th className="px-6 py-3 font-semibold">Unique Views</th>
                <th className="px-6 py-3 font-semibold">Bounce Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1f242b]">
              {topPages.map((page, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50/50 dark:hover:bg-[#181d24]/50 transition-colors"
                >
                  <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-white font-mono text-xs">
                    {page.page}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">
                    {page.uniqueViews.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge
                      variant={
                        page.bounceRate < 30
                          ? "success"
                          : page.bounceRate < 40
                          ? "warning"
                          : "danger"
                      }
                      dot
                      className="text-[10px]"
                    >
                      {page.bounceRate}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

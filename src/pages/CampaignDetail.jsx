import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Users, QrCode } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Tabs from "../components/ui/Tabs";
import StatsCard from "../components/common/StatsCard";
import Badge from "../components/ui/Badge";
import DataTable from "../components/common/DataTable";
import { formatDate, formatPercent } from "../utils/helpers";
import useCampaignDetail from "../hooks/campaigns/useCampaignDetail";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");

  const {
    loadingDetails,
    details,
    fetchDetails,
    loadingStats,
    stats,
    fetchStats,
    loadingRedemptions,
    redemptions,
    redemptionsTotal,
    fetchRedemptions,
    loadingCodes,
    codes,
    codesTotal,
    fetchCodes,
  } = useCampaignDetail(id);

  // Pagination states
  const [redemptionsPage, setRedemptionsPage] = useState(1);
  const [redemptionsLimit, setRedemptionsLimit] = useState(10);

  const [codesPage, setCodesPage] = useState(1);
  const [codesLimit, setCodesLimit] = useState(10);

  useEffect(() => {
    if (activeTab === "stats") {
      fetchStats();
      fetchDetails();
    }
  }, [activeTab, fetchStats, fetchDetails]);

  useEffect(() => {
    if (activeTab === "redemptions") fetchRedemptions(redemptionsPage, redemptionsLimit, "");
  }, [activeTab, redemptionsPage, redemptionsLimit, fetchRedemptions]);

  useEffect(() => {
    if (activeTab === "codes") fetchCodes(codesPage, codesLimit);
  }, [activeTab, codesPage, codesLimit, fetchCodes]);

  const tabs = [
    { key: "stats", label: "Stats & Overview", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: "redemptions", label: "Redemptions", icon: <Users className="w-3.5 h-3.5" />, count: redemptionsTotal },
    { key: "codes", label: "Generated Codes", icon: <QrCode className="w-3.5 h-3.5" />, count: codesTotal },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/campaigns")}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-[#1f242b] bg-white dark:bg-[#13161a] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {details?.name || stats?.campaignName || "Campaign Details"}
            </h1>
            <Badge variant={details?.status === "active" ? "success" : "warning"} dot>
              {details?.status || "Active"}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-mono">
            ID: {id}
          </p>
        </div>
      </div>

      {/* Segment Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === "stats" && (
          <div className="space-y-6">
            {loadingStats ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading metrics...</div>
            ) : stats ? (
              <>
                {/* 6 Key Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total Redemptions"
                    value={stats.totalRedemptions || 0}
                    index={0}
                  />
                  <StatsCard
                    title="Unique Users"
                    value={stats.uniqueUsersCount || 0}
                    index={1}
                  />
                  <StatsCard
                    title="Total Discount Given"
                    value={`$${Number(stats.totalDiscountGiven || 0).toFixed(2)}`}
                    index={2}
                  />
                  <StatsCard
                    title="Avg Discount / Ride"
                    value={`$${stats.averageDiscountPerRide != null ? Number(stats.averageDiscountPerRide).toFixed(2) : "0.00"}`}
                    index={3}
                  />
                  <StatsCard
                    title="Redemption Rate"
                    value={formatPercent(stats.redemptionRate)}
                    index={4}
                  />
                  <StatsCard
                    title="Budget Remaining"
                    value={stats.budgetRemaining !== null ? `$${Number(stats.budgetRemaining).toFixed(2)}` : "Unlimited"}
                    index={5}
                  />
                </div>

                {/* Campaign Configuration Card */}
                <div className="rounded-xl border border-gray-200/80 dark:border-[#1f242b] bg-white dark:bg-[#13161a] p-5 sm:p-6 space-y-4">
                  <div className="border-b border-gray-100 dark:border-[#1f242b] pb-3">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                      Campaign Configuration
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Voucher rules, redemption criteria and usage parameters
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Discount Rule</p>
                      <p className="font-bold text-gray-900 dark:text-white mt-1">
                        {details?.discountType === "percentage" ? formatPercent(details.discountValue) : `$${Number(details?.discountValue || 0).toFixed(2)}`}
                        {details?.maxDiscountCap ? ` (Cap $${Number(details.maxDiscountCap).toFixed(2)})` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Schedule Duration</p>
                      <p className="font-medium text-gray-800 dark:text-slate-200 mt-1">
                        {details?.startDate ? formatDate(details.startDate) : "—"} to {details?.expiresAt ? formatDate(details.expiresAt) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Voucher Mode</p>
                      <p className="font-semibold text-gray-800 dark:text-slate-200 capitalize mt-1">
                        {details?.codeMode || "Public"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Max Uses / User</p>
                      <p className="font-semibold text-gray-800 dark:text-slate-200 mt-1">
                        {details?.maxUsesPerUser || 1}
                      </p>
                    </div>
                  </div>

                  {details?.eligibility && (
                    <div className="pt-3 border-t border-gray-100 dark:border-[#1f242b]">
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold mb-2">Eligibility</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 rounded border border-sky-200 dark:border-sky-500/30 capitalize">
                          Audience: {details.eligibility.userType || "All"}
                        </span>
                        {details.eligibility.rideTypes?.map(rt => (
                          <span key={rt} className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#61CB08] rounded border border-emerald-200 dark:border-emerald-500/30 capitalize">
                            {rt} Ride
                          </span>
                        ))}
                        {details.eligibility.cities?.map(city => (
                          <span key={city} className="px-2 py-0.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-500/30">
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {details?.description && (
                    <div className="pt-3 border-t border-gray-100 dark:border-[#1f242b]">
                      <p className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Description</p>
                      <p className="text-xs text-gray-700 dark:text-slate-300 mt-1">{details.description}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400">No stats available.</p>
            )}
          </div>
        )}

        {activeTab === "redemptions" && (
          <DataTable
            title="Redemption History"
            subtitle="Individual voucher uses recorded across rider orders"
            data={redemptions}
            columns={[
              {
                key: "user",
                label: "Account",
                render: (_, r) => (
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {r.user?.email || r.user?.name || r.userId?.email || r.userId || "—"}
                  </span>
                ),
              },
              {
                key: "rider",
                label: "Rider Name",
                render: (_, r) => <span className="text-xs text-gray-700 dark:text-slate-300">{r.riderName || r.user?.name || "—"}</span>,
              },
              {
                key: "driver",
                label: "Driver Name",
                render: (_, r) => <span className="text-xs text-gray-700 dark:text-slate-300">{r.driverName || r.driver?.name || "—"}</span>,
              },
              {
                key: "code",
                label: "Code Used",
                render: (_, r) => (
                  <span className="font-mono bg-gray-100 dark:bg-[#181d24] px-1.5 py-0.5 rounded text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-[#1f242b]">
                    {r.promoCode?.code || r.code || "—"}
                  </span>
                ),
              },
              {
                key: "date",
                label: "Redeemed At",
                render: (_, r) => <span className="text-xs text-gray-500 dark:text-slate-400">{formatDate(r.redeemedAt || r.createdAt)}</span>,
              },
            ]}
            loading={loadingRedemptions}
            totalData={redemptionsTotal}
            totalPages={Math.ceil(redemptionsTotal / redemptionsLimit)}
            currentPage={redemptionsPage}
            pageSize={redemptionsLimit}
            onPageChange={setRedemptionsPage}
            onPageSizeChange={(s) => { setRedemptionsLimit(s); setRedemptionsPage(1); }}
            addButton={false}
          />
        )}

        {activeTab === "codes" && (
          <DataTable
            title="Generated Vouchers"
            subtitle="Unique serialized promo codes created for this campaign"
            data={codes}
            columns={[
              {
                key: "code",
                label: "Promo Code",
                render: (val) => (
                  <span className="font-mono bg-[#61CB08]/10 text-[#61CB08] border border-[#61CB08]/20 px-2 py-0.5 rounded text-xs font-bold">
                    {val}
                  </span>
                ),
              },
              {
                key: "created",
                label: "Generated At",
                render: (_, r) => <span className="text-xs text-gray-500 dark:text-slate-400">{formatDate(r.createdAt)}</span>,
              },
            ]}
            loading={loadingCodes}
            totalData={codesTotal}
            totalPages={Math.ceil(codesTotal / codesLimit)}
            currentPage={codesPage}
            pageSize={codesLimit}
            onPageChange={setCodesPage}
            onPageSizeChange={(s) => { setCodesLimit(s); setCodesPage(1); }}
            addButton={false}
          />
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;

